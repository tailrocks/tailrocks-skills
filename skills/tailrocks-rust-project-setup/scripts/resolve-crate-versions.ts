import { boundedFetchJson } from "../../../scripts/bounded-fetch";

const schema = "tailrocks.crate-version-resolution/v1";

type CrateResponse = {
  crate?: {
    max_stable_version?: string;
    newest_version?: string;
    repository?: string;
    documentation?: string;
  };
};

export function parseCrates(args: readonly string[]): string[] {
  if (
    args.length === 0 ||
    args.length > 200 ||
    new Set(args).size !== args.length ||
    args.some((name) => !/^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/.test(name))
  )
    throw new Error("usage: resolve-crate-versions.ts <unique-crate>...");
  return [...args];
}

async function main(args: readonly string[]): Promise<number> {
  let crates: string[];
  try {
    crates = parseCrates(args);
  } catch (error) {
    console.log(
      JSON.stringify({
        schema,
        outcome: "refused",
        code: "invalid_arguments",
        results: [],
        errors: 0,
        mutations: [],
        detail: String(error),
      }),
    );
    return 2;
  }
  const results = await Promise.all(
    crates.map(async (name) => {
      try {
        const body = await boundedFetchJson<CrateResponse>(
          `https://crates.io/api/v1/crates/${encodeURIComponent(name)}`,
          { init: { headers: { "user-agent": "tailrocks-skills-version-resolver/1.0" } } },
        );
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
      } catch (error) {
        return {
          ecosystem: "crates.io",
          name,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }),
  );
  const errors = results.filter((result) => "error" in result).length;
  console.log(
    JSON.stringify(
      {
        schema,
        outcome: errors === 0 ? "success" : "failed",
        code: errors === 0 ? "resolved" : "resolution_failed",
        resolved_at: new Date().toISOString(),
        results,
        errors,
        mutations: [],
        detail: errors === 0 ? "all crate versions resolved" : `${errors} crate resolutions failed`,
      },
      null,
      2,
    ),
  );
  return errors === 0 ? 0 : 1;
}

if (import.meta.main) process.exit(await main(Bun.argv.slice(2)));
