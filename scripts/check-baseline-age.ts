import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface Stamp {
  file: string;
  date: string;
  ageDays: number;
}

async function filesUnder(directory: string): Promise<string[]> {
  const output: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await filesUnder(file)));
    else output.push(file);
  }
  return output;
}

export async function baselineStamps(root: string, now = new Date()): Promise<Stamp[]> {
  const stamps: Stamp[] = [];
  for (const file of await filesUnder(path.join(root, "skills"))) {
    let source: string;
    try {
      source = await readFile(file, "utf8");
    } catch {
      continue;
    }
    const dates = source.split("\n").flatMap((line) => {
      if (!/(?:verified|surveyed|compiled)/i.test(line)) return [];
      return [...line.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)].map((match) => match[1]);
    });
    if (dates.length === 0) continue;
    const newest = dates.sort().at(-1)!;
    const ageDays = Math.floor((now.getTime() - new Date(`${newest}T00:00:00Z`).getTime()) / 86_400_000);
    stamps.push({ file: path.relative(root, file), date: newest, ageDays });
  }
  return stamps.sort((a, b) => a.file.localeCompare(b.file));
}

if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    if (!(args.length === 0 || (args.length === 2 && args[0] === "--max-age-days")))
      throw new Error("usage: check-baseline-age.ts [--max-age-days N]");
    const maxAgeDays = args.length === 0 ? 90 : Number(args[1]);
    if (!Number.isFinite(maxAgeDays) || maxAgeDays < 0)
      throw new Error("--max-age-days must be non-negative");
    const root = path.resolve(import.meta.dir, "..");
    const stamps = await baselineStamps(root);
    if (stamps.length === 0) throw new Error("no verified baseline stamps found");
    const stale = stamps.filter((stamp) => stamp.ageDays >= maxAgeDays);
    console.log(
      JSON.stringify({
        schema: "tailrocks.baseline-age/v1",
        outcome: stale.length === 0 ? "success" : "failed",
        code: stale.length === 0 ? "current" : "stale",
        max_age_days: maxAgeDays,
        stamps,
        stale: stale.map((stamp) => stamp.file),
        mutations: [],
        detail: stale.length === 0 ? "all baselines are current" : `${stale.length} baselines are stale`,
      }),
    );
    if (stale.length > 0) process.exit(1);
  } catch (error) {
    console.log(
      JSON.stringify({
        schema: "tailrocks.baseline-age/v1",
        outcome: "refused",
        code: "invalid_arguments",
        stamps: [],
        stale: [],
        mutations: [],
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(2);
  }
}
