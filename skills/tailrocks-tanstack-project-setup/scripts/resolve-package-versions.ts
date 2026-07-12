type RegistryResponse = {
  "dist-tags"?: Record<string, string>;
  homepage?: string;
  repository?: string | { url?: string };
};

const packages = Bun.argv.slice(2);
if (packages.length === 0) {
  console.error("usage: bun run scripts/resolve-package-versions.ts <package>...");
  process.exit(2);
}

const results = await Promise.all(
  packages.map(async (name) => {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error(`${name}: registry returned ${response.status}`);
    const body = (await response.json()) as RegistryResponse;
    const latest = body["dist-tags"]?.latest ?? null;
    const prerelease = latest !== null && /-[0-9A-Za-z]/.test(latest);
    return {
      ecosystem: "npm-registry-via-bun",
      name,
      latest,
      selected_channel: prerelease ? "prerelease" : "stable",
      dist_tags: body["dist-tags"] ?? {},
      homepage: body.homepage ?? null,
      repository: typeof body.repository === "string" ? body.repository : body.repository?.url ?? null,
    };
  }),
);

console.log(JSON.stringify({ resolved_at: new Date().toISOString(), results }, null, 2));
