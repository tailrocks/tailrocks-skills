import { afterAll, beforeAll, expect, test } from "bun:test";
import { access, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
let temporary = "";
let gallery = "";
let binary = "";

function command(args: string[], env: Record<string, string> = {}) {
  return Bun.spawnSync([binary, ...args], { cwd: gallery, env: { ...process.env, ...env } });
}

beforeAll(async () => {
  temporary = await mkdtemp(path.join(os.tmpdir(), "tailrocks-tui-gallery-"));
  gallery = path.join(temporary, "gallery");
  binary = path.join(temporary, "gallery-bin");
  await mkdir(gallery);
  const stub = path.join(temporary, "app_gallery.rs");
  const library = path.join(temporary, "libapp_gallery.rlib");
  await writeFile(
    stub,
    `
pub mod registry {
    pub struct Entry { pub screen: &'static str, pub state: &'static str, pub size: (u16, u16) }
    impl Entry {
        pub fn golden_name(&self) -> String {
            format!("{}--{}--{}x{}.txt", self.screen, self.state, self.size.0, self.size.1)
        }
    }
    pub fn entries() -> Vec<Entry> {
        vec![
            Entry { screen: "status", state: "default", size: (80, 24) },
            Entry { screen: "status", state: "default", size: (40, 12) },
        ]
    }
    pub fn validate(_: &[Entry]) -> Result<(), &'static str> { Ok(()) }
}
pub fn render_text(entry: &registry::Entry) -> String {
    use std::sync::atomic::{AtomicUsize, Ordering};
    static CALLS: AtomicUsize = AtomicUsize::new(0);
    if std::env::var_os("TAILROCKS_TEST_DELAY_RENDER").is_some()
        && CALLS.fetch_add(1, Ordering::SeqCst) == 0
    {
        std::thread::sleep(std::time::Duration::from_millis(250));
    }
    format!("{}:{}:{}x{}\n", entry.screen, entry.state, entry.size.0, entry.size.1)
}
`,
  );
  let result = Bun.spawnSync([
    "rustc",
    "--edition=2024",
    "--crate-name",
    "app_gallery",
    "--crate-type=rlib",
    stub,
    "-o",
    library,
  ]);
  expect(result.exitCode, result.stderr.toString()).toBe(0);
  result = Bun.spawnSync(
    [
      "rustc",
      "--edition=2024",
      path.join(root, "skills/tailrocks-tui-design/templates/gallery/src/main.rs"),
      "--extern",
      `app_gallery=${library}`,
      "-o",
      binary,
    ],
    { env: { ...process.env, CARGO_MANIFEST_DIR: gallery } },
  );
  expect(result.exitCode, result.stderr.toString()).toBe(0);
});

afterAll(async () => {
  if (temporary) await rm(temporary, { recursive: true, force: true });
});

test("gallery CLI rejects malformed mixed duplicate and unknown arguments with one receipt", () => {
  for (const args of [
    [],
    ["--list", "--write"],
    ["--write", "--write"],
    ["--screen", "status", "--state"],
    ["--screen", "status", "--state", "default", "--unknown", "40x12"],
  ]) {
    const result = command(args);
    expect(result.exitCode).toBe(2);
    const lines = result.stdout.toString().trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]!)).toMatchObject({ outcome: "refused", code: "invalid_arguments" });
  }
});

test("preview refuses ambiguous identity and accepts one exact bounded identity", () => {
  const ambiguous = command(["--screen", "status", "--state", "default"]);
  expect(ambiguous.exitCode).toBe(2);
  expect(JSON.parse(ambiguous.stdout.toString())).toMatchObject({
    code: "unknown_or_ambiguous_screen_state_size",
  });
  const exact = command(["--screen", "status", "--state", "default", "--size", "40x12"]);
  expect(exact.exitCode).toBe(0);
  expect(exact.stdout.toString()).toBe("status:default:40x12\n");
});

test("absent-target creation race is preserved and publication refuses", async () => {
  const golden = path.join(gallery, "golden");
  await rm(golden, { recursive: true, force: true });
  const child = Bun.spawn([binary, "--write"], {
    cwd: gallery,
    env: { ...process.env, TAILROCKS_TEST_DELAY_RENDER: "1" },
    stdout: "pipe",
  });
  const stage = path.join(gallery, `.golden-stage-${child.pid}`);
  let appeared = false;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    try {
      await access(stage);
      appeared = true;
      break;
    } catch {
      await Bun.sleep(2);
    }
  }
  expect(appeared).toBe(true);
  await mkdir(golden);
  await writeFile(path.join(golden, "concurrent.txt"), "preserve\n");
  expect(await child.exited).toBe(2);
  const output = await new Response(child.stdout).text();
  expect(JSON.parse(output)).toMatchObject({ code: "concurrent_replacement", mutations: [] });
  expect(await readFile(path.join(golden, "concurrent.txt"), "utf8")).toBe("preserve\n");
  await expect(access(stage)).rejects.toThrow();
});

test("concurrent stage content survives cleanup refusal", async () => {
  const golden = path.join(gallery, "golden");
  await rm(golden, { recursive: true, force: true });
  const child = Bun.spawn([binary, "--write"], {
    cwd: gallery,
    env: { ...process.env, TAILROCKS_TEST_DELAY_RENDER: "1" },
    stdout: "pipe",
  });
  const stage = path.join(gallery, `.golden-stage-${child.pid}`);
  for (let attempt = 0; attempt < 200; attempt += 1) {
    try {
      await access(stage);
      break;
    } catch {
      await Bun.sleep(2);
    }
  }
  await writeFile(path.join(stage, "concurrent.txt"), "preserve\n");
  expect(await child.exited).toBe(3);
  const output = await new Response(child.stdout).text();
  const receipt = JSON.parse(output) as { outcome: string; recovery_artifacts: string[] };
  expect(receipt).toMatchObject({ outcome: "recovery_required" });
  expect(receipt.recovery_artifacts).toHaveLength(1);
  const quarantine = receipt.recovery_artifacts[0]!;
  expect(await readFile(path.join(quarantine, "concurrent.txt"), "utf8")).toBe("preserve\n");
  await rm(quarantine, { recursive: true });
});

test("replacement after cleanup quarantine survives without being recursively deleted", async () => {
  const golden = path.join(gallery, "golden");
  await rm(golden, { recursive: true, force: true });
  await mkdir(golden);
  await Promise.all(
    Array.from({ length: 2_000 }, (_, index) =>
      writeFile(path.join(golden, `old-${index.toString().padStart(4, "0")}.txt`), "old\n"),
    ),
  );
  const child = Bun.spawn([binary, "--write"], { cwd: gallery, stdout: "pipe" });
  const backup = path.join(gallery, `.golden-backup-${child.pid}`);
  let quarantine = "";
  let replaced = false;
  for (let attempt = 0; attempt < 2_000; attempt += 1) {
    const candidate = (await readdir(gallery)).find((name) =>
      name.startsWith(`.golden-cleanup-${child.pid}-`),
    );
    if (candidate) {
      quarantine = path.join(gallery, candidate);
      await mkdir(backup);
      await writeFile(path.join(backup, "concurrent.txt"), "preserve\n");
      replaced = true;
      break;
    }
    await Bun.sleep(1);
  }
  expect(replaced).toBe(true);
  expect(await child.exited).toBe(0);
  const output = await new Response(child.stdout).text();
  expect(JSON.parse(output)).toMatchObject({ outcome: "success", code: "goldens_published" });
  expect(await readFile(path.join(backup, "concurrent.txt"), "utf8")).toBe("preserve\n");
  await rm(backup, { recursive: true });
  await expect(access(quarantine)).rejects.toThrow();
});

test("write replaces the complete directory and removes orphan frames atomically", async () => {
  const golden = path.join(gallery, "golden");
  await rm(golden, { recursive: true, force: true });
  await mkdir(golden);
  await writeFile(path.join(golden, "orphan.txt"), "old\n");
  const result = command(["--write"]);
  expect(result.exitCode, result.stdout.toString()).toBe(0);
  expect(JSON.parse(result.stdout.toString())).toMatchObject({
    outcome: "success",
    code: "goldens_published",
    frames: 2,
    mutations: ["golden/"],
    recovery_artifacts: [],
  });
  expect((await readdir(golden)).sort()).toEqual([
    "status--default--40x12.txt",
    "status--default--80x24.txt",
  ]);
  expect(await readFile(path.join(golden, "status--default--40x12.txt"), "utf8")).toBe(
    "status:default:40x12\n",
  );
});

test("write refuses a symlinked golden target without touching its destination", async () => {
  const golden = path.join(gallery, "golden");
  const outside = path.join(temporary, "outside");
  await rm(golden, { recursive: true });
  await mkdir(outside);
  await writeFile(path.join(outside, "sentinel"), "keep\n");
  await symlink(outside, golden);
  const result = command(["--write"]);
  expect(result.exitCode).toBe(2);
  expect(JSON.parse(result.stdout.toString())).toMatchObject({ code: "unsafe_golden_path", mutations: [] });
  expect(await readFile(path.join(outside, "sentinel"), "utf8")).toBe("keep\n");
});
