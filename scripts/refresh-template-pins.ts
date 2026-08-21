/**
 * Rewrites the template pins this repository ships to whatever the registries
 * call stable today, and — under `--check-consistency` — asserts offline that
 * the copies of a pin inside the tree agree with each other.
 *
 * Freshness is a fact about the day, not about the change under review, so it
 * runs on a schedule and arrives as a reviewable bump. Consistency is a fact
 * about the tree, so it gates every pull request.
 *
 * Neither half writes a version into prose. A policy document names where to
 * look; the artifacts carry the numbers.
 */
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const TEMPLATE = "skills/tailrocks-tanstack-project-setup/templates/package.json";
const POLICY = "skills/tailrocks-tanstack-project-setup/references/version-policy.md";
const RESOLVER = "skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts";
const MISE = "mise.toml";
const RUST = "skills/tailrocks-rust-project-setup";
const RUST_RESOLVER = `${RUST}/scripts/resolve-crate-versions.ts`;
const RUST_CHANNEL_URL = "https://static.rust-lang.org/dist/channel-rust-stable.toml";

/** Workspace dependency pins in the Rust template's Cargo.toml. */
export const RUST_CRATES = [
  "axum",
  "http-body-util",
  "serde",
  "serde_json",
  "thiserror",
  "tokio",
  "tower",
  "tower-http",
  "tracing",
  "tracing-subscriber",
  "uuid",
] as const;

/** Cargo tools a scaffolded project installs through its own mise.toml. */
export const RUST_TOOLS = [
  "cargo-nextest",
  "cargo-deny",
  "cargo-audit",
  "cargo-shear",
  "cargo-hack",
  "cargo-llvm-cov",
  "cargo-semver-checks",
  "cargo-vet",
  "cargo-mutants",
  "cargo-careful",
  "cargo-dylint",
  "dylint-link",
  "cargo-binstall",
] as const;

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
      new RegExp(String.raw`("${key}":\s*")([^"]+)(")`, "g"),
      // A package name can appear as a key outside the dependency blocks — the
      // template's `scripts` has a `"shadcn": "bunx --bun shadcn"` entry — and
      // a blind rewrite turns that command into a version number. Only a value
      // that is already a version is a pin.
      (match, head: string, current: string, tail: string) =>
        /^[\^~>=<]*\d/.test(current) ? `${head}${version}${tail}` : match,
    );
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

/**
 * A version that lives in prose has no reader and no gate, so it goes stale
 * silently and then contradicts the artifact it claims to describe — which is
 * worse than being absent, because it reads as current. This is not
 * hypothetical: a policy table and the templates beside it disagreed on the
 * Rust channel and on eleven pins while the table looked freshly verified.
 *
 * A policy document names where to look. The artifacts carry the numbers.
 */
export function ledgerRows(policy: string): string[] {
  return policy
    .split("\n")
    .filter((line) => /^\|/.test(line) && /\|\s*v?\d+\.\d+(?:\.\d+)?[^|]*\|/.test(line));
}

/** Rust pins that three tools each need in their own format, so they must agree. */
export type RustFiles = {
  toolchain: string;
  cargo: string;
  clippy: string;
  mise: string;
};

export function rustConsistencyProblems(files: RustFiles): string[] {
  const problems: string[] = [];
  const channel = files.toolchain.match(/^channel\s*=\s*"([^"]+)"/m)?.[1];
  const rustVersion = files.cargo.match(/^rust-version\s*=\s*"([^"]+)"/m)?.[1];
  const msrv = files.clippy.match(/^msrv\s*=\s*"([^"]+)"/m)?.[1];

  if (channel === undefined) problems.push("rust-toolchain.toml declares no channel");
  if (channel !== undefined && rustVersion !== undefined && rustVersion !== channel) {
    problems.push(`Cargo.toml rust-version ${rustVersion} != toolchain channel ${channel}`);
  }
  if (channel !== undefined && msrv !== undefined && msrv !== channel) {
    problems.push(`clippy.toml msrv ${msrv} != toolchain channel ${channel}`);
  }

  // dylint ships the driver and its linker as one release; a split pair fails
  // at link time, not at install time, which is a bad place to find out.
  const dylint = files.mise.match(/^"cargo:cargo-dylint"\s*=\s*"([^"]+)"/m)?.[1];
  const link = files.mise.match(/^"cargo:dylint-link"\s*=\s*"([^"]+)"/m)?.[1];
  if (dylint !== undefined && link !== undefined && dylint !== link) {
    problems.push(`mise.toml cargo-dylint ${dylint} != dylint-link ${link}`);
  }
  return problems;
}

/** The Rust channel manifest's own statement of what stable is today. */
export function rustStableChannel(manifest: string): string | null {
  return manifest.match(/^\[pkg\.rust\]\nversion = "(\d+\.\d+\.\d+)/m)?.[1] ?? null;
}

/** Every file that needs the Rust channel, each in the format its tool reads. */
export function applyRustChannel(files: RustFiles, channel: string): RustFiles {
  return {
    toolchain: files.toolchain.replace(/^(channel = ")[^"]+(")$/m, `$1${channel}$2`),
    cargo: files.cargo.replace(/^(rust-version = ")[^"]+(")$/m, `$1${channel}$2`),
    clippy: files.clippy.replace(/^(msrv = ")[^"]+(")$/m, `$1${channel}$2`),
    mise: files.mise,
  };
}

/** Workspace dependency pins, whether bare or inside a `{ version = ".." }`. */
export function applyCargoDeps(cargo: string, latest: Latest): string {
  let out = cargo;
  for (const [name, version] of latest) {
    const key = name.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    out = out.replace(new RegExp(String.raw`^(${key} = ")[^"]+(")$`, "m"), `$1${version}$2`);
    out = out.replace(new RegExp(String.raw`^(${key} = \{ version = ")[^"]+(")`, "m"), `$1${version}$2`);
  }
  return out;
}

/** Cargo tool pins in a scaffolded project's own mise.toml. */
export function applyMiseCargoTools(mise: string, latest: Latest): string {
  let out = mise;
  for (const [name, version] of latest) {
    out = out.replace(new RegExp(String.raw`^("cargo:${name}" = ")[^"]+(")$`, "m"), `$1${version}$2`);
    if (name === "cargo-binstall") {
      out = out.replace(/^(cargo-binstall = ")[^"]+(")$/m, `$1${version}$2`);
    }
  }
  return out;
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
    const problems: string[] = [];
    for (const mismatch of mismatches) {
      problems.push(
        `${POLICY} says ${mismatch.label} is ${mismatch.policy}, ` +
          `${TEMPLATE} pins ${mismatch.package} at ${mismatch.template}`,
      );
    }

    const rust = "skills/tailrocks-rust-project-setup";
    const rustFiles: RustFiles = {
      toolchain: await Bun.file(path.join(ROOT, rust, "templates/rust-toolchain.toml")).text(),
      cargo: await Bun.file(path.join(ROOT, rust, "templates/Cargo.toml")).text(),
      clippy: await Bun.file(path.join(ROOT, rust, "templates/clippy.toml")).text(),
      mise: await Bun.file(path.join(ROOT, rust, "templates/mise.toml")).text(),
    };
    for (const problem of rustConsistencyProblems(rustFiles)) {
      problems.push(`${rust}: ${problem}`);
    }

    for (const policyPath of [POLICY, `${rust}/references/version-policy.md`]) {
      for (const row of ledgerRows(await Bun.file(path.join(ROOT, policyPath)).text())) {
        problems.push(`${policyPath} carries a version in prose: ${row.trim()}`);
      }
    }

    for (const problem of problems) console.error(`error: ${problem}`);
    console.log(`Checked ${POLICY_ROWS.length} documented components and the Rust templates.`);
    process.exit(problems.length === 0 ? 0 : 1);
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
  const templateAfter = applyPins(templateBefore, latest);

  // The policy document is never rewritten. It carries primary release
  // *sources*, not versions, because its own rule is that
  // `templates/package.json` is the only exact pin source and versions are
  // never copied into prose. A refresh that wrote numbers back into it would
  // recreate the second ledger the document exists to forbid.
  if (templateAfter !== templateBefore) await Bun.write(templatePath, templateAfter);

  const misePath = path.join(ROOT, MISE);
  const miseBefore = await Bun.file(misePath).text();
  const bun = templateBun(templateAfter);
  const miseAfter = bun === null ? miseBefore : applyMiseBun(miseBefore, bun);
  if (miseAfter !== miseBefore) {
    await Bun.write(misePath, miseAfter);
    console.log(`synced ${MISE} to bun ${bun}; run \`mise install\` to relock`);
  }

  const moved = templateAfter !== templateBefore;
  console.log(moved ? `refreshed ${TEMPLATE}` : "pins already current");
  console.log(`resolved ${latest.size} packages`);

  // Rust: the channel comes from the toolchain's own manifest, the rest from
  // crates.io through the skill's existing resolver.
  const channelManifest = await (await fetch(RUST_CHANNEL_URL)).text();
  const channel = rustStableChannel(channelManifest);

  const crateProc = Bun.spawn(["bun", path.join(ROOT, RUST_RESOLVER), ...RUST_CRATES, ...RUST_TOOLS], {
    cwd: ROOT,
    stdout: "pipe",
    stderr: "inherit",
  });
  const crateText = await new Response(crateProc.stdout).text();
  await crateProc.exited;
  const crateLatest = new Map<string, string>();
  for (const result of (
    JSON.parse(crateText) as {
      results: { name: string; stable: string | null; selected_channel: string }[];
    }
  ).results) {
    if (result.stable === null || result.selected_channel !== "stable") continue;
    crateLatest.set(result.name, result.stable);
  }

  const rustPaths = {
    toolchain: path.join(ROOT, RUST, "templates/rust-toolchain.toml"),
    cargo: path.join(ROOT, RUST, "templates/Cargo.toml"),
    clippy: path.join(ROOT, RUST, "templates/clippy.toml"),
    mise: path.join(ROOT, RUST, "templates/mise.toml"),
  };
  const before: RustFiles = {
    toolchain: await Bun.file(rustPaths.toolchain).text(),
    cargo: await Bun.file(rustPaths.cargo).text(),
    clippy: await Bun.file(rustPaths.clippy).text(),
    mise: await Bun.file(rustPaths.mise).text(),
  };
  const channelled = channel === null ? before : applyRustChannel(before, channel);
  const after: RustFiles = {
    ...channelled,
    cargo: applyCargoDeps(channelled.cargo, crateLatest),
    mise: applyMiseCargoTools(channelled.mise, crateLatest),
  };
  let rustMoved = false;
  for (const key of ["toolchain", "cargo", "clippy", "mise"] as const) {
    if (after[key] === before[key]) continue;
    await Bun.write(rustPaths[key], after[key]);
    rustMoved = true;
  }
  if (channel === null) console.log(`could not read a stable channel from ${RUST_CHANNEL_URL}`);
  console.log(rustMoved ? `refreshed ${RUST}/templates` : "Rust pins already current");
  console.log(`resolved ${crateLatest.size} crates`);
}
