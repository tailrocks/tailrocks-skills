type RegistryResponse = {
  "dist-tags"?: Record<string, string>;
  homepage?: string;
  repository?: string | { url?: string };
  versions?: Record<
    string,
    {
      peerDependencies?: Record<string, string>;
      peerDependenciesMeta?: Record<string, { optional?: boolean }>;
    }
  >;
};

const args = Bun.argv.slice(2);
const checkTemplatePath = args[0] === "--check-template" ? args[1] : undefined;
if (args[0] === "--check-template" && !checkTemplatePath) {
  console.error(
    "usage: bun run scripts/resolve-package-versions.ts --check-template <package.json>",
  );
  process.exit(2);
}

const pinned = new Map<string, string>();
let packages = args;
if (checkTemplatePath) {
  const template = (await Bun.file(checkTemplatePath).json()) as {
    packageManager?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  for (const [name, version] of Object.entries({
    ...template.dependencies,
    ...template.devDependencies,
  })) {
    pinned.set(name, version);
  }
  const bunVersion = template.packageManager?.match(/^bun@(.+)$/)?.[1];
  if (bunVersion) pinned.set("bun", bunVersion);
  packages = [...pinned.keys()];
}

if (packages.length === 0) {
  console.error(
    "usage: bun run scripts/resolve-package-versions.ts <package>... | " +
      "--check-template <package.json>",
  );
  process.exit(2);
}

const results = await Promise.all(
  packages.map(async (name) => {
    try {
      const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
      if (!response.ok) throw new Error(`registry returned ${response.status}`);
      const body = (await response.json()) as RegistryResponse;
      const latest = body["dist-tags"]?.latest ?? null;
      const prerelease = latest !== null && /-[0-9A-Za-z]/.test(latest);
      return {
        ecosystem: "npm-registry-via-bun",
        name,
        latest,
        pinned: pinned.get(name) ?? null,
        current: pinned.has(name) ? pinned.get(name) === latest : null,
        selected_channel:
          latest === null ? "prerelease-or-unknown" : prerelease ? "prerelease" : "stable",
        dist_tags: body["dist-tags"] ?? {},
        peer_dependencies: latest === null ? {} : (body.versions?.[latest]?.peerDependencies ?? {}),
        peer_dependencies_meta:
          latest === null ? {} : (body.versions?.[latest]?.peerDependenciesMeta ?? {}),
        homepage: body.homepage ?? null,
        repository:
          typeof body.repository === "string" ? body.repository : (body.repository?.url ?? null),
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
const peerIssues = checkTemplatePath
  ? results.flatMap((result) => {
      if (!("peer_dependencies" in result)) return [];
      return Object.entries(result.peer_dependencies).flatMap(([name, range]) => {
        if (result.peer_dependencies_meta[name]?.optional === true) return [];
        const version = pinned.get(name);
        if (version === undefined || Bun.semver.satisfies(version, range)) return [];
        return [
          {
            package: result.name,
            peer: name,
            required: range,
            pinned: version,
          },
        ];
      });
    })
  : [];
console.log(
  JSON.stringify(
    {
      resolved_at: new Date().toISOString(),
      results,
      errors,
      stale,
      peer_issues: peerIssues,
    },
    null,
    2,
  ),
);

if (checkTemplatePath && (errors > 0 || stale > 0 || peerIssues.length > 0)) {
  process.exit(1);
}
