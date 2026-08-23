import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import { boundedFetchJson } from "../../../scripts/bounded-fetch";

const schema = "tailrocks.package-version-resolution/v1";

type VersionResponse = {
  homepage?: string;
  repository?: string | { url?: string };
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
};

type Parsed = { readonly template?: string; readonly packages: readonly string[] };

export function parseArguments(args: readonly string[]): Parsed {
  if (args[0] === "--check-template") {
    if (args.length !== 2 || !args[1]) throw new Error("--check-template requires exactly one path");
    return { template: args[1], packages: [] };
  }
  const valid = /^(?:@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*|[a-z0-9][a-z0-9._-]*)$/;
  if (
    args.length === 0 ||
    args.length > 200 ||
    new Set(args).size !== args.length ||
    args.some((name) => !valid.test(name))
  )
    throw new Error("usage: resolve-package-versions.ts <unique-package>... | --check-template PATH");
  return { packages: [...args] };
}

async function templatePackages(file: string): Promise<{ pinned: Map<string, string>; packages: string[] }> {
  const absolute = path.resolve(file);
  const info = await lstat(absolute);
  if (
    !info.isFile() ||
    info.isSymbolicLink() ||
    info.size > 2_000_000 ||
    (await realpath(absolute)) !== absolute
  )
    throw new Error("template must be a canonical bounded regular file");
  const template = JSON.parse(await readFile(absolute, "utf8")) as {
    packageManager?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const pinned = new Map<string, string>();
  for (const [name, version] of Object.entries({ ...template.dependencies, ...template.devDependencies })) {
    if (typeof version !== "string") throw new Error(`template version is invalid: ${name}`);
    pinned.set(name, version);
  }
  const bunVersion = template.packageManager?.match(/^bun@(.+)$/)?.[1];
  if (bunVersion) pinned.set("bun", bunVersion);
  if (pinned.size === 0 || pinned.size > 200) throw new Error("template package count is invalid");
  return { pinned, packages: [...pinned.keys()] };
}

async function main(args: readonly string[]): Promise<number> {
  let parsed: Parsed;
  let pinned = new Map<string, string>();
  let packages: string[] = [];
  try {
    parsed = parseArguments(args);
    packages = [...parsed.packages];
    if (parsed.template) ({ pinned, packages } = await templatePackages(parsed.template));
  } catch (error) {
    console.log(
      JSON.stringify({
        schema,
        outcome: "refused",
        code: "invalid_arguments",
        results: [],
        errors: 0,
        stale: 0,
        peer_issues: [],
        mutations: [],
        detail: String(error),
      }),
    );
    return 2;
  }
  const results = await Promise.all(
    packages.map(async (name) => {
      try {
        // A full packument grows with every release a package has ever
        // published, so any fixed byte budget eventually fails for long-lived
        // packages (typescript, tailwindcss, vite already exceed 10 MB).
        // Resolve through the bounded dist-tags index plus the single
        // latest-version document instead; both stay small by construction.
        const distTags = await boundedFetchJson<Record<string, string>>(
          `https://registry.npmjs.org/-/package/${encodeURIComponent(name)}/dist-tags`,
          { maximumBytes: 100_000 },
        );
        const latest = distTags.latest ?? null;
        const version =
          latest === null
            ? null
            : await boundedFetchJson<VersionResponse>(
                `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(latest)}`,
                { maximumBytes: 2_000_000 },
              );
        const prerelease = latest !== null && /-[0-9A-Za-z]/.test(latest);
        return {
          ecosystem: "npm-registry-via-bun",
          name,
          latest,
          pinned: pinned.get(name) ?? null,
          current: pinned.has(name) ? pinned.get(name) === latest : null,
          selected_channel: latest === null ? "prerelease-or-unknown" : prerelease ? "prerelease" : "stable",
          dist_tags: distTags,
          peer_dependencies: version?.peerDependencies ?? {},
          peer_dependencies_meta: version?.peerDependenciesMeta ?? {},
          homepage: version?.homepage ?? null,
          repository:
            typeof version?.repository === "string"
              ? version.repository
              : (version?.repository?.url ?? null),
        };
      } catch (error) {
        return {
          ecosystem: "npm-registry-via-bun",
          name,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }),
  );
  const errors = results.filter((result) => "error" in result).length;
  const stale = results.filter((result) => "current" in result && result.current === false).length;
  const peerIssues = parsed.template
    ? results.flatMap((result) => {
        if (!("peer_dependencies" in result)) return [];
        return Object.entries(result.peer_dependencies).flatMap(([name, range]) => {
          if (result.peer_dependencies_meta[name]?.optional === true) return [];
          const version = pinned.get(name);
          if (version === undefined || Bun.semver.satisfies(version, range)) return [];
          return [{ package: result.name, peer: name, required: range, pinned: version }];
        });
      })
    : [];
  const failed = errors > 0 || stale > 0 || peerIssues.length > 0;
  console.log(
    JSON.stringify(
      {
        schema,
        outcome: failed ? "failed" : "success",
        code: failed ? "resolution_failed" : "resolved",
        resolved_at: new Date().toISOString(),
        results,
        errors,
        stale,
        peer_issues: peerIssues,
        mutations: [],
        detail: failed ? "registry or compatibility checks failed" : "all package versions resolved",
      },
      null,
      2,
    ),
  );
  return failed ? 1 : 0;
}

if (import.meta.main) process.exit(await main(Bun.argv.slice(2)));
