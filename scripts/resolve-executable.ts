import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

const namePattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export async function resolveExecutable(name: string): Promise<string> {
  if (!namePattern.test(name)) throw new Error("executable name is invalid");
  for (const directory of (process.env.PATH ?? "").split(path.delimiter)) {
    if (!directory) continue;
    const candidate = path.join(directory, name);
    try {
      const canonical = await realpath(candidate);
      const info = await lstat(canonical);
      if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o111) === 0) continue;
      return canonical;
    } catch {
      // Absent or unusable in this directory; the next PATH entry decides.
    }
  }
  throw new Error(`trusted ${name} executable is unavailable on PATH`);
}
