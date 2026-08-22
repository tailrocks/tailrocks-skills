import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const templates = path.join(import.meta.dir, "templates");

test("capture binds process and window by exact executable and pid with bounded waits", async () => {
  const source = await readFile(path.join(templates, "capture.sh"), "utf8");
  expect(source).not.toMatch(/\b(?:pgrep|pkill)\b/);
  expect(source).toContain('owned() { "$PROCESS_TOOL" list "$EXECUTABLE_REAL"; }');
  expect(source).toContain('"$WINDOW_TOOL" "$PID"');
  expect(source).toContain('attempt" -lt 40');
  expect(source).toContain("ambiguous exact-owned processes");
  expect(source).toContain('"$PROCESS_TOOL" verify "$EXECUTABLE_REAL" "$PID" "$TOKEN"');
  expect(source).toContain("symlink app bundle refused");
  expect(source).toContain("unsafe CFBundleExecutable");
  expect(source).toContain("Contents escaped app bundle");
  expect(source).toContain("MacOS escaped Contents");
  expect(source).toContain("tailrocks-visual-qa-tools.XXXXXX");
  expect(source).toContain('cmp -s "$PRE_JSON" "$POST_JSON"');
  expect(source).toContain('ln "$TMP_OUT" "$OUT"');
  expect(source).toContain("PUBLISHED_SIDECAR=0; PUBLISHED_OUT=0");
  expect(source).toContain('current" = "$OUT_ID"');
  expect(source).toContain('current" = "$SIDECAR_ID"');
  expect(source).toContain("tailrocks-recovery-artifact-base64:");
  expect(source).toContain('cd "$OUT_PARENT"');
  expect(source).toContain("OUT_ANCHOR=.");
  expect(source).toContain("output parent identity changed after publication");
  expect(source).toContain('capture_bytes" -le 67108864');
  expect(source).toContain('pixel_width" -le 16384');
  expect(source).toContain('open -n "$APP" --args "$@"');
  expect(source).not.toContain("screencapture -R");
});

test("window and AX helpers refuse ambiguity and AX traversal is bounded", async () => {
  const window = await readFile(path.join(templates, "window-id.swift"), "utf8");
  const ax = await readFile(path.join(templates, "ax-drive.swift"), "utf8");
  expect(window).toContain("kCGWindowOwnerPID");
  expect(window).toContain("matches.count == 1");
  expect(window).not.toContain("matches.first");
  expect(ax).toContain("exact-pid");
  expect(ax).toContain("visited > 10_000");
  expect(ax).toContain("matches.count == 1");
  expect(ax).not.toContain("localizedName");
});

test("appearance snapshot includes Auto and retains failed recovery evidence", async () => {
  const source = await readFile(path.join(templates, "state.sh"), "utf8");
  expect(source).toContain("AppleInterfaceStyleSwitchesAutomatically");
  expect(source).toContain("restore failed after 3 attempts");
  expect(source).toContain("tailrocks-recovery-artifact-base64:");
  expect(source).toContain("snapshot registry invalid");
  expect(source).toContain('if [ "$current" = "$value" ]; then :');
  expect(source).toContain("DEFAULTS=/usr/bin/defaults");
  expect(source).toContain("with permits only the installed capture operation");
  expect(source).not.toContain("TAILROCKS_DEFAULTS_COMMAND");
  expect(source).not.toMatch(/\n\s*apply\)/);
});

test("supervisor bounds runtime, strips ambient environment, and owns capture and state locks", async () => {
  const source = await readFile(path.join(templates, "run.ts"), "utf8");
  expect(source).toContain("timeoutMilliseconds > 600_000");
  expect(source).toContain("killGraceMilliseconds > 10_000");
  expect(source).toContain('PATH: "/usr/bin:/bin:/usr/sbin:/sbin"');
  expect(source).not.toContain("{ ...process.env }");
  expect(source).toContain('lockKeys = command === "state" ? ["state"] : []');
  expect(source).toContain("captureArtifactsValid");
  expect(source).toContain("status.isFile() && !status.isSymbolicLink()");
  expect(source).toContain('open(lockPath, "wx", 0o600)');
  expect(source).toContain('if ((await readFile(lock.path, "utf8")) === lock.token');
  expect(source).toContain('!["recover", "with"].includes');
  expect(source).not.toContain("state snapshot requires exactly one file");
});

test("accessibility audit names macOS checks and filters system-owned elements", async () => {
  const source = await readFile(path.join(templates, "AuditTests.swift"), "utf8");
  expect(source).toContain(".contrast, .elementDetection, .hitRegion, .sufficientElementDescription");
  expect(source).toContain("return !owned.contains(element)");
  expect(source).not.toContain("element.identifier.isEmpty");
  expect(source).not.toContain("performAccessibilityAudit()");
});
