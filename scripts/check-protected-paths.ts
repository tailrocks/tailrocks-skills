import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const receiptSchema = "tailrocks.protected-paths-check/v1";
const protectedPathsManifestSha256 = "aa32fee13155a3765438bad38be146a2c21a8b0fab926585dee3746e5c7fefa1";

export interface ProtectedPathsManifest {
  sourceSha: string;
  patterns: string[];
}

export interface ProtectedPathViolation {
  path: string;
  other_path?: string;
  state: "tracked" | "staged" | "worktree" | "untracked" | "unsafe_index";
  detail: string;
}

export interface ProtectedPathsReceipt {
  schema: typeof receiptSchema;
  source_sha: string;
  patterns_checked: number;
  baseline_paths_checked: number;
  pattern_source_counts: { pattern: string; source_paths: number }[];
  counts: {
    tracked: number;
    staged: number;
    worktree: number;
    untracked: number;
    moved: number;
    deleted: number;
    unsafe_index: number;
  };
  violations: ProtectedPathViolation[];
}

async function git(root: string, args: string[]): Promise<string> {
  const process = Bun.spawn(["git", ...args], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);
  if (exitCode !== 0) {
    throw new Error(`git ${args[0]} failed: ${stderr.trim() || `exit ${exitCode}`}`);
  }
  return stdout;
}

function nulFields(output: string): string[] {
  const fields = output.split("\0");
  if (fields.at(-1) === "") fields.pop();
  return fields;
}

function patternRegex(pattern: string): RegExp {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === "*" && pattern[index + 1] === "*") {
      source += ".*";
      index += 1;
    } else if (character === "*") {
      source += "[^/]*";
    } else {
      source += character.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
    }
  }
  return new RegExp(`${source}$`);
}

export function matchesProtectedPath(patterns: string[], file: string): boolean {
  return patterns.some((pattern) => patternRegex(pattern).test(file));
}

function queryPrefixes(patterns: string[]): string[] {
  return [
    ...new Set(
      patterns.map((pattern) => {
        const wildcard = pattern.indexOf("*");
        if (wildcard === -1) return pattern;
        const slash = pattern.lastIndexOf("/", wildcard);
        return slash === -1 ? "." : pattern.slice(0, slash + 1);
      }),
    ),
  ];
}

function nameStatusViolations(
  output: string,
  state: "tracked" | "staged" | "worktree",
  matches: (file: string) => boolean,
): ProtectedPathViolation[] {
  const fields = nulFields(output);
  const violations: ProtectedPathViolation[] = [];
  for (let index = 0; index < fields.length;) {
    const detail = fields[index];
    if (/^[RC]\d+$/.test(detail)) {
      if (index + 2 >= fields.length) throw new Error("git diff returned an invalid rename record");
      const oldPath = fields[index + 1];
      const newPath = fields[index + 2];
      if (matches(oldPath) || matches(newPath)) {
        violations.push({
          state,
          detail,
          path: matches(oldPath) ? oldPath : newPath,
          other_path: matches(oldPath) ? newPath : oldPath,
        });
      }
      index += 3;
      continue;
    }
    if (!/^[MADTUXB]$/.test(detail) || index + 1 >= fields.length) {
      throw new Error("git diff returned an invalid name-status record");
    }
    const file = fields[index + 1];
    if (matches(file)) violations.push({ state, detail, path: file });
    index += 2;
  }
  return violations;
}

export function parseProtectedPathsManifest(source: string): ProtectedPathsManifest {
  const shaMatches = [...source.matchAll(/^# Source SHA: ([0-9a-f]{40})$/gm)];
  if (shaMatches.length !== 1) {
    throw new Error("protected-paths manifest requires exactly one 40-character Source SHA");
  }
  const patterns = source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"));
  if (patterns.length === 0) throw new Error("protected-paths manifest requires at least one path");
  if (new Set(patterns).size !== patterns.length) {
    throw new Error("protected-paths manifest contains duplicate paths");
  }
  for (const pattern of patterns) {
    if (
      path.isAbsolute(pattern) ||
      pattern.includes("\\") ||
      pattern.split("/").some((part) => part === "." || part === "..") ||
      pattern.startsWith(":") ||
      /[?[\]{}]/.test(pattern)
    ) {
      throw new Error(`protected-paths manifest contains unsafe path: ${pattern}`);
    }
  }
  return { sourceSha: shaMatches[0][1], patterns };
}

export async function loadProtectedPathsManifest(
  root: string,
  manifestFile = path.join(root, "skill-audits", "protected-paths.txt"),
  expectedManifestSha256?: string,
): Promise<ProtectedPathsManifest> {
  const manifestSource = await readFile(manifestFile, "utf8");
  const defaultManifest = path.join(root, "skill-audits", "protected-paths.txt");
  const expectedDigest =
    expectedManifestSha256 ??
    (path.resolve(manifestFile) === path.resolve(defaultManifest) ? protectedPathsManifestSha256 : undefined);
  if (
    expectedDigest !== undefined &&
    createHash("sha256").update(manifestSource).digest("hex") !== expectedDigest
  ) {
    throw new Error("protected-paths manifest differs from its immutable SHA-256");
  }
  return parseProtectedPathsManifest(manifestSource);
}

export async function checkProtectedPaths(
  root: string,
  manifestFile = path.join(root, "skill-audits", "protected-paths.txt"),
  expectedManifestSha256?: string,
): Promise<ProtectedPathsReceipt> {
  const manifest = await loadProtectedPathsManifest(root, manifestFile, expectedManifestSha256);
  await git(root, ["cat-file", "-e", `${manifest.sourceSha}^{commit}`]);
  await git(root, ["rev-parse", "--verify", "HEAD^{commit}"]);
  const matchers = manifest.patterns.map(patternRegex);
  const matches = (file: string): boolean => matchesProtectedPath(manifest.patterns, file);
  const prefixes = queryPrefixes(manifest.patterns);
  const baselineTree = nulFields(
    await git(root, ["ls-tree", "-r", "--full-tree", "--name-only", "-z", manifest.sourceSha]),
  );
  const patternSourceCounts = manifest.patterns.map((pattern, index) => ({
    pattern,
    source_paths: baselineTree.filter((file) => matchers[index].test(file)).length,
  }));
  const unmatchedPattern = patternSourceCounts.find((entry) => entry.source_paths === 0);
  if (unmatchedPattern !== undefined) {
    throw new Error(
      `protected-paths manifest pattern matches zero source paths: ${unmatchedPattern.pattern}`,
    );
  }
  const baseline = baselineTree.filter(matches);

  const diffOptions = ["--name-status", "-z", "--no-ext-diff", "--no-textconv", "--find-renames=100%", "-l0"];
  const violations: ProtectedPathViolation[] = [
    ...nameStatusViolations(
      await git(root, ["diff", ...diffOptions, manifest.sourceSha, "HEAD", "--"]),
      "tracked",
      matches,
    ),
    ...nameStatusViolations(
      await git(root, ["diff", "--cached", ...diffOptions, "HEAD", "--"]),
      "staged",
      matches,
    ),
    ...nameStatusViolations(await git(root, ["diff", ...diffOptions, "--"]), "worktree", matches),
  ];
  for (const file of nulFields(await git(root, ["ls-files", "--others", "-z", "--", ...prefixes])).filter(
    matches,
  )) {
    violations.push({ state: "untracked", detail: "?", path: file });
  }
  for (const record of nulFields(await git(root, ["ls-files", "-v", "-z", "--", ...prefixes]))) {
    const tag = record[0];
    const file = record.slice(2);
    if (matches(file) && (tag === "S" || tag.toLowerCase() === tag)) {
      violations.push({ state: "unsafe_index", detail: tag, path: file });
    }
  }
  const compare = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);
  violations.sort((left, right) =>
    left.path === right.path
      ? left.state === right.state
        ? compare(left.detail, right.detail)
        : compare(left.state, right.state)
      : compare(left.path, right.path),
  );
  const count = (state: ProtectedPathViolation["state"]): number =>
    violations.filter((violation) => violation.state === state).length;
  return {
    schema: receiptSchema,
    source_sha: manifest.sourceSha,
    patterns_checked: manifest.patterns.length,
    baseline_paths_checked: baseline.length,
    pattern_source_counts: patternSourceCounts,
    counts: {
      tracked: count("tracked"),
      staged: count("staged"),
      worktree: count("worktree"),
      untracked: count("untracked"),
      moved: violations.filter((violation) => violation.detail.startsWith("R")).length,
      deleted: violations.filter((violation) => violation.detail === "D").length,
      unsafe_index: count("unsafe_index"),
    },
    violations,
  };
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "..");
  try {
    const receipt = await checkProtectedPaths(root);
    console.log(JSON.stringify(receipt));
    if (receipt.violations.length > 0) process.exit(1);
  } catch (error) {
    console.error(
      JSON.stringify({
        schema: receiptSchema,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(1);
  }
}
