import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const banned =
  /\b(?:Claude|Codex|Grok|Kimi|Amp|OpenCode|Antigravity|Anthropic|OpenAI|Gemini|Fable|Sonnet|Haiku|GPT|Terra|Luna)\b|\b(?:claude|codex|grok|kimi|amp|opencode)\b/g;

test("plan skill, references, and templates stay source-neutral", async () => {
  const root = join(import.meta.dir, "..");
  const files = [
    "skills/tailrocks-plan/SKILL.md",
    ...(await Array.fromAsync(new Bun.Glob("skills/tailrocks-plan/references/**/*.md").scan({ cwd: root }))),
    ...(await Array.fromAsync(new Bun.Glob("skills/tailrocks-plan/templates/**/*").scan({ cwd: root }))),
  ].sort();
  const matches = files.flatMap((file) => {
    const text = readFileSync(join(root, file), "utf8");
    return [...text.matchAll(banned)].map((match) => `${file}:${match.index}: ${match[0]}`);
  });
  expect(matches).toEqual([]);
});
