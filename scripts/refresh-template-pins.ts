/**
 * Rewrites the TanStack template's pinned versions, and the version-policy
 * table beside it, to whatever the npm registry calls stable today.
 *
 * The freshness gate in `validate` compares those pins against live `latest`,
 * so the repository goes red on a schedule nobody controls and the fix is
 * never in the pull request that failed. Running this on a cadence turns that
 * standing breakage into a routine change.
 */
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const TEMPLATE = "skills/tailrocks-tanstack-project-setup/templates/package.json";
const POLICY = "skills/tailrocks-tanstack-project-setup/references/version-policy.md";
const RESOLVER = "skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts";
const MISE = "mise.toml";

/** Version-policy row label to the npm package that decides it. */
export const POLICY_ROWS: ReadonlyArray<readonly [string, string]> = [
  ["Bun", "bun"],
  ["TypeScript", "typescript"],
  ["React / React DOM", "react"],
  ["Vite", "vite"],
  ["TanStack Start", "@tanstack/react-start"],
  ["TanStack Router", "@tanstack/react-router"],
  ["TanStack Router Devtools", "@tanstack/react-router-devtools"],
  ["TanStack Query / Devtools", "@tanstack/react-query"],
  ["Tailwind CSS / Vite plugin", "tailwindcss"],
  ["shadcn CLI", "shadcn"],
  ["Oxlint", "oxlint"],
  ["Oxfmt", "oxfmt"],
  ["Dependency Cruiser", "dependency-cruiser"],
  ["Knip", "knip"],
];

export type Latest = ReadonlyMap<string, string>;

/** Rewrites every `"name": "version"` pin the registry reports as moved. */
export function applyPins(template: string, latest: Latest): string {
  let out = template;
  for (const [name, version] of latest) {
    if (name === "bun") {
      out = out.replace(
        /("packageManager":\s*")bun@[^"]+(")/,
        (_match, head: string, tail: string) => `${head}bun@${version}${tail}`,
      );
      continue;
    }
    const key = name.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    out = out.replace(
      new RegExp(String.raw`("${key}":\s*")[^"]+(")`, "g"),
      (_match, head: string, tail: string) => `${head}${version}${tail}`,
    );
  }
  return out;
}

/** Rewrites the policy table's rows and the date it claims to be verified on. */
export function applyPolicy(policy: string, latest: Latest, verifiedOn: string): string {
  let out = policy.replace(/^## Verified \d{4}-\d{2}-\d{2}$/m, `## Verified ${verifiedOn}`);
  for (const [label, name] of POLICY_ROWS) {
    const version = latest.get(name);
    if (version === undefined) continue;
    const key = label.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    out = out.replace(new RegExp(String.raw`^\| ${key} \| [^|]+ \|`, "m"), `| ${label} | ${version} |`);
  }
  return out;
}

/**
 * Keeps the repository on the same bun it tells a scaffolded project to use.
 * A template-only bump leaves the gates running on one runtime while the
 * template advertises another, which is a difference nothing would notice
 * until the two behave differently.
 */
export function applyMiseBun(mise: string, version: string): string {
  return mise.replace(
    /^(bun = ")[^"]+(")$/m,
    (_match, head: string, tail: string) => `${head}${version}${tail}`,
  );
}

/** The bun version a template's `packageManager` field commits to. */
export function templateBun(template: string): string | null {
  return (
    (JSON.parse(template) as { packageManager?: string }).packageManager?.match(/^bun@(.+)$/)?.[1] ?? null
  );
}

export type Mismatch = { label: string; package: string; policy: string; template: string };

/**
 * Compares the policy table against the template beside it, offline. This is
 * the part of freshness a pull request can actually be responsible for: the
 * two files agreeing. Whether either matches the registry is a fact about the
 * day, not about the diff, so it belongs on a schedule instead.
 */
export function consistencyMismatches(template: string, policy: string): Mismatch[] {
  const pins = new Map<string, string>();
  const parsed = JSON.parse(template) as {
    packageManager?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  for (const [name, version] of Object.entries({
    ...parsed.dependencies,
    ...parsed.devDependencies,
  })) {
    pins.set(name, version);
  }
  const bun = parsed.packageManager?.match(/^bun@(.+)$/)?.[1];
  if (bun !== undefined) pins.set("bun", bun);

  const mismatches: Mismatch[] = [];
  for (const [label, name] of POLICY_ROWS) {
    const pinned = pins.get(name);
    if (pinned === undefined) continue;
    const key = label.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    const row = policy.match(new RegExp(String.raw`^\| ${key} \| ([^|]+?) \|`, "m"));
    // A document that carries no version table is not disagreeing with one.
    if (row === null) continue;
    const documented = row[1].trim();
    // Nor is a document whose table carries something other than a version.
    // The policy's own rule is that `templates/package.json` is the only exact
    // pin source and versions are never copied into prose, so its table lists
    // primary release *sources* under the same component labels. A source URL
    // is not a competing pin, and reading one as a version reports every row
    // as a mismatch.
    if (!/^\d+(?:\.\d+)*(?:-[\w.]+)?$/.test(documented)) continue;
    if (documented !== pinned) {
      mismatches.push({ label, package: name, policy: documented, template: pinned });
    }
  }
  return mismatches;
}

type ResolverResult = { name: string; latest: string | null; selected_channel: string };

async function resolve(args: string[]): Promise<ResolverResult[]> {
  const proc = Bun.spawn(["bun", path.join(ROOT, RESOLVER), ...args], {
    cwd: ROOT,
    stdout: "pipe",
    stderr: "inherit",
  });
  const text = await new Response(proc.stdout).text();
  await proc.exited; // Exits 1 on staleness alone, which is the case we are here to fix.
  return (JSON.parse(text) as { results: ResolverResult[] }).results;
}

if (import.meta.main) {
  const templatePath = path.join(ROOT, TEMPLATE);
  const policyPath = path.join(ROOT, POLICY);

  if (Bun.argv.includes("--check-consistency")) {
    const mismatches = consistencyMismatches(
      await Bun.file(templatePath).text(),
      await Bun.file(policyPath).text(),
    );
    for (const mismatch of mismatches) {
      console.error(
        `error: ${POLICY} says ${mismatch.label} is ${mismatch.policy}, ` +
          `${TEMPLATE} pins ${mismatch.package} at ${mismatch.template}`,
      );
    }
    console.log(`Checked ${POLICY_ROWS.length} documented components.`);
    process.exit(mismatches.length === 0 ? 0 : 1);
  }

  const extra = POLICY_ROWS.map(([, name]) => name);
  const results = [
    ...(await resolve(["--check-template", path.join(ROOT, TEMPLATE)])),
    ...(await resolve(extra)),
  ];

  const latest = new Map<string, string>();
  for (const result of results) {
    if (result.latest === null || result.selected_channel !== "stable") continue;
    latest.set(result.name, result.latest);
  }

  const templateBefore = await Bun.file(templatePath).text();
  const policyBefore = await Bun.file(policyPath).text();
  const verifiedOn = new Date().toISOString().slice(0, 10);
  const templateAfter = applyPins(templateBefore, latest);
  const policyAfter = applyPolicy(policyBefore, latest, verifiedOn);

  if (templateAfter !== templateBefore) await Bun.write(templatePath, templateAfter);
  if (policyAfter !== policyBefore) await Bun.write(policyPath, policyAfter);

  const misePath = path.join(ROOT, MISE);
  const miseBefore = await Bun.file(misePath).text();
  const bun = templateBun(templateAfter);
  const miseAfter = bun === null ? miseBefore : applyMiseBun(miseBefore, bun);
  if (miseAfter !== miseBefore) {
    await Bun.write(misePath, miseAfter);
    console.log(`synced ${MISE} to bun ${bun}; run \`mise install\` to relock`);
  }

  const moved = templateAfter !== templateBefore;
  console.log(moved ? `refreshed ${TEMPLATE} and ${POLICY}` : "pins already current");
  console.log(`resolved ${latest.size} packages, verified ${verifiedOn}`);
}
