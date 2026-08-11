import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface Stamp { file: string; date: string; ageDays: number }

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
    try { source = await readFile(file, "utf8"); } catch { continue; }
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
  const argument = process.argv.indexOf("--max-age-days");
  const maxAgeDays = argument === -1 ? 90 : Number(process.argv[argument + 1]);
  if (!Number.isFinite(maxAgeDays) || maxAgeDays < 0) throw new Error("--max-age-days must be non-negative");
  const root = path.resolve(import.meta.dir, "..");
  const stamps = await baselineStamps(root);
  if (stamps.length === 0) {
    console.error("error: no verified baseline stamps found");
    process.exit(1);
  }
  let stale = false;
  for (const stamp of stamps) {
    console.log(`${stamp.file}: verified ${stamp.date}, age ${stamp.ageDays} days`);
    if (stamp.ageDays >= maxAgeDays) stale = true;
  }
  if (stale) process.exit(1);
}
