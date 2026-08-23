import { spawn } from "node:child_process";
import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

import { atomicWriteFiles, type AtomicFileRuntime } from "./atomic-file-transaction";

export const roadmapSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const statusPattern = /^- \*\*Status\*\*: (.+)$/gm;

interface DirectoryIdentity {
  readonly dev: number;
  readonly ino: number;
}

export interface RoadmapStateRuntime extends AtomicFileRuntime {
  readonly afterResolve?: () => Promise<void>;
}

export interface RoadmapFiles {
  readonly itemFile: string;
  readonly indexFile: string;
  readonly directories: ReadonlyMap<string, DirectoryIdentity>;
}

export interface ItemStatus {
  readonly status: string;
  readonly start: number;
  readonly end: number;
}

export interface IndexStatus {
  readonly status: string;
  readonly row: string;
  readonly title: string;
  readonly remaining: string;
}

export function parseRoadmapItemStatus(item: string): ItemStatus {
  const statuses = [...item.matchAll(statusPattern)];
  if (statuses.length !== 1) throw new Error("item must contain exactly one Status field");
  const match = statuses[0]!;
  return { status: match[1]!.trim(), start: match.index!, end: match.index! + match[0].length };
}

export function parseRoadmapIndexStatus(index: string, slug: string): IndexStatus {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `^\\| \\[${escaped}\\]\\(${escaped}/README\\.md\\) \\| ([^|\\n]+) \\| ([^|\\n]+) \\| ([^|\\n]+) \\|$`,
    "gm",
  );
  const matches = [...index.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`index must contain exactly one row for ${slug}`);
  return {
    title: matches[0]![1]!,
    status: matches[0]![2]!.trim(),
    remaining: matches[0]![3]!,
    row: matches[0]![0],
  };
}

export async function resolveRoadmapFiles(root: string, slug: string): Promise<RoadmapFiles> {
  if (!roadmapSlugPattern.test(slug)) throw new Error(`invalid roadmap slug: ${slug}`);
  const resolvedRoot = path.resolve(root);
  const rootInfo = await lstat(resolvedRoot);
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink() || (await realpath(resolvedRoot)) !== resolvedRoot)
    throw new Error(`unsafe repository root: ${resolvedRoot}`);
  const roadmap = path.join(resolvedRoot, "roadmap");
  const itemDirectory = path.join(roadmap, slug);
  const directories = new Map<string, DirectoryIdentity>();
  for (const directory of [roadmap, itemDirectory]) {
    const info = await lstat(directory);
    if (!info.isDirectory() || info.isSymbolicLink() || (await realpath(directory)) !== directory)
      throw new Error(`unsafe roadmap path: ${directory}`);
    directories.set(directory, { dev: info.dev, ino: info.ino });
  }
  return {
    itemFile: path.join(itemDirectory, "README.md"),
    indexFile: path.join(roadmap, "README.md"),
    directories,
  };
}

const anchoredReadHelper = String.raw`
const fs=require("node:fs"),crypto=require("node:crypto");
const expected=JSON.parse(process.argv.at(-2)),name=process.argv.at(-1),directory=fs.statSync(".");
if(!directory.isDirectory()||directory.dev!==expected.dev||directory.ino!==expected.ino) throw new Error("roadmap directory changed");
const before=fs.lstatSync(name); if(!before.isFile()||before.isSymbolicLink()) throw new Error("unsafe roadmap file");
const body=fs.readFileSync(name),after=fs.lstatSync(name),finalDirectory=fs.statSync(".");
if(before.dev!==after.dev||before.ino!==after.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs) throw new Error("roadmap file changed while read");
if(finalDirectory.dev!==expected.dev||finalDirectory.ino!==expected.ino) throw new Error("roadmap directory changed");
process.stdout.write(JSON.stringify({body:body.toString("base64"),sha256:crypto.createHash("sha256").update(body).digest("hex")}));
`;

async function readAnchoredRegular(file: string, expected: DirectoryIdentity): Promise<string> {
  const child = spawn(
    process.execPath,
    ["-e", anchoredReadHelper, JSON.stringify(expected), path.basename(file)],
    {
      cwd: path.dirname(file),
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const [code, stdout, stderr] = await Promise.all([
    new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", resolve);
    }),
    new Response(child.stdout!).text(),
    new Response(child.stderr!).text(),
  ]);
  if (code !== 0) throw new Error(stderr.trim() || `anchored roadmap read failed: ${file}`);
  const receipt = JSON.parse(stdout) as { body: string; sha256: string };
  const body = Buffer.from(receipt.body, "base64");
  if (new Bun.CryptoHasher("sha256").update(body).digest("hex") !== receipt.sha256)
    throw new Error(`anchored roadmap read digest mismatch: ${file}`);
  return body.toString("utf8");
}

export async function readRoadmapPair(
  files: RoadmapFiles,
  runtime: RoadmapStateRuntime = {},
): Promise<readonly [string, string]> {
  await runtime.afterResolve?.();
  return Promise.all([
    readAnchoredRegular(files.itemFile, files.directories.get(path.dirname(files.itemFile))!),
    readAnchoredRegular(files.indexFile, files.directories.get(path.dirname(files.indexFile))!),
  ]);
}

export function boundRoadmapRuntime(
  runtime: RoadmapStateRuntime,
  directories: ReadonlyMap<string, DirectoryIdentity>,
): AtomicFileRuntime {
  return {
    ...runtime,
    beforeAnchorSpawn: async (directory) => {
      await runtime.beforeAnchorSpawn?.(directory);
      const expected = directories.get(directory);
      const current = await lstat(directory);
      if (
        !expected ||
        !current.isDirectory() ||
        current.isSymbolicLink() ||
        current.dev !== expected.dev ||
        current.ino !== expected.ino
      )
        throw new Error(`roadmap directory changed before transaction: ${directory}`);
    },
  };
}

export async function publishRoadmapStatus(
  files: RoadmapFiles,
  slug: string,
  item: string,
  index: string,
  from: string,
  to: string,
  runtime: RoadmapStateRuntime = {},
): Promise<void> {
  const itemStatus = parseRoadmapItemStatus(item);
  const indexed = parseRoadmapIndexStatus(index, slug);
  if (itemStatus.status !== indexed.status || itemStatus.status !== from)
    throw new Error(`status transition requires matching ${from} item and index states`);
  const nextItem = `${item.slice(0, itemStatus.start)}- **Status**: ${to}${item.slice(itemStatus.end)}`;
  const nextIndex = index.replace(
    indexed.row,
    `| [${slug}](${slug}/README.md) | ${indexed.title} | ${to} | ${indexed.remaining} |`,
  );
  await atomicWriteFiles(
    [
      { file: files.itemFile, expected: item, content: nextItem },
      { file: files.indexFile, expected: index, content: nextIndex },
    ],
    boundRoadmapRuntime(runtime, files.directories),
  );
}
