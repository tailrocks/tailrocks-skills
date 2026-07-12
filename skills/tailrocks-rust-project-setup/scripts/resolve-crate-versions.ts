type CrateResponse = {
  crate?: {
    max_stable_version?: string;
    newest_version?: string;
    repository?: string;
    documentation?: string;
  };
};

const crates = Bun.argv.slice(2);
if (crates.length === 0) {
  console.error("usage: bun run scripts/resolve-crate-versions.ts <crate>...");
  process.exit(2);
}

const results = await Promise.all(
  crates.map(async (name) => {
    const response = await fetch(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`, {
      headers: { "user-agent": "tailrocks-skills-version-resolver/1.0" },
    });
    if (!response.ok) throw new Error(`${name}: crates.io returned ${response.status}`);
    const body = (await response.json()) as CrateResponse;
    const stable = body.crate?.max_stable_version;
    const newest = body.crate?.newest_version;
    return {
      ecosystem: "crates.io",
      name,
      stable: stable ?? null,
      newest: newest ?? null,
      selected_channel: stable ? "stable" : "prerelease-or-unknown",
      repository: body.crate?.repository ?? null,
      documentation: body.crate?.documentation ?? `https://docs.rs/${name}`,
    };
  }),
);

console.log(JSON.stringify({ resolved_at: new Date().toISOString(), results }, null, 2));
