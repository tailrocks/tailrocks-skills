import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomUUID } from "node:crypto";
import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
import { createInterface, type Interface } from "node:readline";

export interface AtomicFileWrite {
  readonly file: string;
  readonly content: string | Uint8Array;
  readonly expected: string | Uint8Array | null;
  readonly expectedNode?: { readonly dev: number; readonly ino: number };
  readonly mode?: number;
}
export interface AtomicFileCheck {
  readonly file: string;
  readonly expected: string | Uint8Array;
}
export interface AtomicFileRuntime {
  readonly afterPublish?: (file: string, index: number) => Promise<void>;
  readonly beforeMutation?: (file: string, operation: string) => Promise<void>;
  readonly beforeAnchorSpawn?: (directory: string) => Promise<void>;
  readonly beforeAnchoredOperation?: (directory: string, operation: string, pid: number) => Promise<void>;
}
export class AtomicFileTransactionError extends AggregateError {
  constructor(
    errors: readonly unknown[],
    readonly recoveryArtifacts: readonly string[],
  ) {
    super(errors, errors[0] instanceof Error ? errors[0].message : "atomic file transaction failed");
  }
}
export function atomicRecoveryArtifacts(error: unknown): readonly string[] {
  const own = error instanceof AtomicFileTransactionError ? error.recoveryArtifacts : [];
  const nested = error instanceof AggregateError ? error.errors.flatMap(atomicRecoveryArtifacts) : [];
  return [...new Set([...own, ...nested])].sort();
}

interface Identity {
  readonly dev: number;
  readonly ino: number;
  readonly sha256: string;
}
interface HelperReply {
  readonly ok: boolean;
  readonly value?: Identity;
  readonly directory?: string;
  readonly code?: string;
  readonly error?: string;
}
const helper = String.raw`
const fs=require("node:fs"),crypto=require("node:crypto"),readline=require("node:readline");
const expected=JSON.parse(process.argv[1]),initial=fs.statSync(".");
if(!initial.isDirectory()||initial.dev!==expected.dev||initial.ino!==expected.ino) throw new Error("transaction parent changed");
const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
const directory=()=>fs.realpathSync(".");
process.stdout.write(JSON.stringify({ok:true,directory:directory()})+"\n");
rl.on("line",line=>{
 let request;
 try {
  request=JSON.parse(line);
  if(request.op==="close"){process.stdout.write(JSON.stringify({ok:true,directory:directory()})+"\n");process.exit(0)}
  const current=directory();
  if(request.requireOriginal&&current!==expected.directory) throw Object.assign(new Error("transaction parent moved"),{code:"ESTALE"});
  for(const name of request.names) if(name!==require("node:path").basename(name)) throw new Error("unsafe transaction name");
  const [a,b]=request.names; let value;
  if(request.op==="write") fs.writeFileSync(a,Buffer.from(request.content,"base64"),{flag:"wx",mode:request.mode});
  else if(request.op==="rename") fs.renameSync(a,b);
  else if(request.op==="link") fs.linkSync(a,b);
  else if(request.op==="unlink") fs.unlinkSync(a);
  else if(request.op==="identity"){
   const before=fs.lstatSync(a); if(!before.isFile()||before.isSymbolicLink()) throw new Error("unsafe transaction path");
   const body=fs.readFileSync(a),after=fs.lstatSync(a);
   if(before.dev!==after.dev||before.ino!==after.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs) throw new Error("transaction path changed while read");
   value={dev:before.dev,ino:before.ino,sha256:crypto.createHash("sha256").update(body).digest("hex")};
  } else throw new Error("unknown transaction operation");
  process.stdout.write(JSON.stringify({ok:true,value,directory:directory()})+"\n");
 } catch(error) {
  let current; try{current=directory()}catch{}
  process.stdout.write(JSON.stringify({ok:false,error:String(error.message||error),code:error.code,directory:current})+"\n");
 }
});
`;

class DirectoryAnchor {
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly lines: AsyncIterator<string>;
  private readonly reader: Interface;
  private stderr = "";
  private readonly failed: Promise<Error>;
  private readonly stdinFailed: Promise<Error>;
  private readonly exited: Promise<void>;
  private settled = false;
  private constructor(
    readonly original: string,
    child: ChildProcessWithoutNullStreams,
    reader: Interface,
  ) {
    this.child = child;
    this.reader = reader;
    this.lines = reader[Symbol.asyncIterator]();
    child.stderr.on("data", (chunk: Buffer) => {
      this.stderr = (this.stderr + chunk.toString()).slice(-10_000);
    });
    this.failed = new Promise((resolve) => child.once("error", resolve));
    this.stdinFailed = new Promise((resolve) => child.stdin.once("error", resolve));
    this.exited = new Promise((resolve) => {
      child.once("close", () => {
        this.settled = true;
        resolve();
      });
      child.once("error", () => {
        this.settled = true;
        resolve();
      });
    });
  }
  static async open(
    directory: string,
    beforeSpawn?: (directory: string) => Promise<void>,
    privateBeforeOperation?: (directory: string, operation: string, pid: number) => Promise<void>,
  ): Promise<DirectoryAnchor> {
    if ((await realpath(directory)) !== directory)
      throw new Error(`transaction parent is unsafe: ${directory}`);
    const info = await lstat(directory);
    if (!info.isDirectory() || info.isSymbolicLink())
      throw new Error(`transaction parent is unsafe: ${directory}`);
    await beforeSpawn?.(directory);
    const child = spawn(
      process.execPath,
      ["-e", helper, JSON.stringify({ directory, dev: info.dev, ino: info.ino })],
      {
        cwd: directory,
        detached: process.platform !== "win32",
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    const reader = createInterface({ input: child.stdout, crlfDelay: Infinity });
    const anchor = new DirectoryAnchor(directory, child, reader);
    anchor.beforeOperation = privateBeforeOperation;
    try {
      const ready = await anchor.next();
      if (!ready.ok) throw new Error(ready.error || "directory anchor refused");
      return anchor;
    } catch (error) {
      await anchor.shutdown();
      throw error;
    }
  }
  private async next(): Promise<HelperReply> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const next = await Promise.race([
      this.lines.next(),
      this.failed.then((error) => {
        throw error;
      }),
      this.stdinFailed.then((error) => {
        throw error;
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("anchored filesystem operation timed out")), 10_000);
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });
    if (next.done || next.value.length > 10_000) throw new Error(this.stderr || "directory anchor exited");
    return JSON.parse(next.value) as HelperReply;
  }
  async operation(
    op: string,
    names: readonly string[],
    requireOriginal: boolean,
    content?: string | Uint8Array,
    mode?: number,
  ): Promise<HelperReply> {
    let reply: HelperReply;
    try {
      if (this.settled || this.child.stdin.destroyed || !this.child.pid)
        throw new Error("directory anchor is unavailable");
      await this.beforeOperation?.(this.original, op, this.child.pid);
      if (this.settled || this.child.stdin.destroyed)
        throw new Error("directory anchor exited before operation");
      this.child.stdin.write(
        JSON.stringify({
          op,
          names,
          requireOriginal,
          mode,
          content: content === undefined ? undefined : Buffer.from(content).toString("base64"),
        }) + "\n",
      );
      reply = await this.next();
    } catch (error) {
      await this.shutdown();
      throw error;
    }
    if (!reply.ok) {
      const error = new Error(reply.error || `anchored ${op} failed`) as NodeJS.ErrnoException;
      if (reply.code !== undefined) error.code = reply.code;
      throw error;
    }
    return reply;
  }
  private beforeOperation: ((directory: string, operation: string, pid: number) => Promise<void>) | undefined;
  async close(): Promise<void> {
    if (this.settled) return;
    try {
      this.child.stdin.write(JSON.stringify({ op: "close", names: [] }) + "\n");
      await this.next();
      this.child.stdin.end();
      await Promise.race([this.exited, new Promise((resolve) => setTimeout(resolve, 100))]);
    } finally {
      await this.shutdown();
    }
  }
  private async shutdown(): Promise<void> {
    this.reader.close();
    if (this.settled || !this.child.pid) return;
    const signal = (name: NodeJS.Signals): void => {
      try {
        if (process.platform === "win32") this.child.kill(name);
        else process.kill(-this.child.pid!, name);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
      }
    };
    signal("SIGTERM");
    await Promise.race([this.exited, new Promise((resolve) => setTimeout(resolve, 100))]);
    if (!this.settled) {
      signal("SIGKILL");
      await Promise.race([
        this.exited,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("directory anchor survived SIGKILL")), 500),
        ),
      ]);
    }
  }
}

function digest(source: string | Uint8Array): string {
  return new Bun.CryptoHasher("sha256").update(source).digest("hex");
}
async function identity(anchor: DirectoryAnchor, name: string, requireOriginal = true): Promise<Identity> {
  return (await anchor.operation("identity", [name], requireOriginal)).value!;
}
function same(left: Identity, right: Identity): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.sha256 === right.sha256;
}
async function removeOwned(
  anchor: DirectoryAnchor,
  name: string,
  expected: Identity,
  transaction: string,
): Promise<void> {
  const quarantine = `${name}.tailrocks-${transaction}.quarantine`;
  try {
    await anchor.operation("rename", [name, quarantine], false);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  const moved = await identity(anchor, quarantine, false);
  if (!same(moved, expected)) {
    await anchor.operation("link", [quarantine, name], false).catch(() => undefined);
    throw new Error(`changed path retained at ${path.join(anchor.original, quarantine)}`);
  }
  await anchor.operation("unlink", [quarantine], false);
}

export async function atomicWriteFiles(
  writes: readonly AtomicFileWrite[],
  runtime: AtomicFileRuntime = {},
  checks: readonly AtomicFileCheck[] = [],
): Promise<void> {
  if (writes.length === 0) return;
  const transaction = randomUUID();
  const unique = new Set([...writes, ...checks].map((item) => path.resolve(item.file)));
  if (unique.size !== writes.length + checks.length) throw new Error("transaction contains duplicate paths");
  const anchors = new Map<string, DirectoryAnchor>();
  try {
    for (const file of unique) {
      const directory = path.dirname(file);
      if (!anchors.has(directory))
        anchors.set(
          directory,
          await DirectoryAnchor.open(directory, runtime.beforeAnchorSpawn, runtime.beforeAnchoredOperation),
        );
    }
    const staged = writes.map((item) => {
      const file = path.resolve(item.file),
        name = path.basename(file);
      return {
        ...item,
        file,
        name,
        anchor: anchors.get(path.dirname(file))!,
        temporary: `${name}.tailrocks-${transaction}.next`,
        backup: `${name}.tailrocks-${transaction}.restore`,
        expectedIdentity: undefined as Identity | undefined,
        temporaryIdentity: undefined as Identity | undefined,
        backupIdentity: undefined as Identity | undefined,
        installedIdentity: undefined as Identity | undefined,
      };
    });
    const readSet = checks.map((item) => {
      const file = path.resolve(item.file);
      return {
        ...item,
        file,
        name: path.basename(file),
        anchor: anchors.get(path.dirname(file))!,
        expectedIdentity: undefined as Identity | undefined,
      };
    });
    for (const item of readSet) {
      item.expectedIdentity = await identity(item.anchor, item.name);
      if (item.expectedIdentity.sha256 !== digest(item.expected))
        throw new Error(`transaction read-set precondition changed: ${item.file}`);
    }
    const verifyReadSet = async (): Promise<void> => {
      for (const item of readSet) {
        const current = await identity(item.anchor, item.name);
        if (!same(current, item.expectedIdentity!))
          throw new Error(`transaction read-set changed: ${item.file}`);
      }
    };
    const mutate = async (
      item: (typeof staged)[number],
      op: string,
      names: readonly string[],
      content?: string | Uint8Array,
    ) => {
      await runtime.beforeMutation?.(item.file, op);
      return item.anchor.operation(op, names, true, content, item.mode);
    };
    try {
      for (const item of staged) {
        try {
          item.expectedIdentity = await identity(item.anchor, item.name);
          if (
            item.expected === null ||
            item.expectedIdentity.sha256 !== digest(item.expected) ||
            (item.expectedNode !== undefined &&
              (item.expectedIdentity.dev !== item.expectedNode.dev ||
                item.expectedIdentity.ino !== item.expectedNode.ino))
          )
            throw new Error(`transaction precondition changed: ${item.file}`);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
          if (item.expected !== null) throw new Error(`transaction target disappeared: ${item.file}`);
        }
        await mutate(item, "write", [item.temporary], item.content);
        item.temporaryIdentity = await identity(item.anchor, item.temporary);
      }
      for (const [index, item] of staged.entries()) {
        await verifyReadSet();
        if (item.expectedIdentity) {
          await mutate(item, "rename", [item.name, item.backup]);
          item.backupIdentity = await identity(item.anchor, item.backup);
          if (!same(item.backupIdentity, item.expectedIdentity))
            throw new Error(`transaction target raced: ${item.file}`);
        }
        await mutate(item, "link", [item.temporary, item.name]);
        item.installedIdentity = await identity(item.anchor, item.name);
        if (!same(item.installedIdentity, item.temporaryIdentity!))
          throw new Error(`transaction target raced: ${item.file}`);
        await runtime.afterPublish?.(item.file, index);
        const published = await identity(item.anchor, item.name);
        if (!same(published, item.installedIdentity))
          throw new Error(`transaction published target changed: ${item.file}`);
        await verifyReadSet();
      }
      await verifyReadSet();
      for (const item of staged) {
        await removeOwned(item.anchor, item.temporary, item.temporaryIdentity!, transaction);
        item.temporaryIdentity = undefined;
        if (item.backupIdentity) {
          await removeOwned(item.anchor, item.backup, item.backupIdentity, transaction);
          item.backupIdentity = undefined;
        }
      }
    } catch (caught) {
      let error: unknown = caught;
      const recovery = new Set<string>();
      for (const item of [...staged].reverse()) {
        if (item.installedIdentity) {
          try {
            await removeOwned(item.anchor, item.name, item.installedIdentity, transaction);
          } catch (rollbackError) {
            recovery.add(`${item.file}.tailrocks-${transaction}.quarantine`);
            error = new AggregateError(
              [error, rollbackError],
              `transaction rollback retained recovery beside ${item.file}`,
            );
          }
        }
        if (item.backupIdentity) {
          try {
            await item.anchor.operation("link", [item.backup, item.name], false);
            await removeOwned(item.anchor, item.backup, item.backupIdentity, transaction);
            item.backupIdentity = undefined;
          } catch (restoreError) {
            recovery.add(path.join(item.anchor.original, item.backup));
            error = new AggregateError([error, restoreError], `transaction restore retained ${item.backup}`);
          }
        }
        if (item.temporaryIdentity) {
          try {
            await removeOwned(item.anchor, item.temporary, item.temporaryIdentity, transaction);
          } catch (cleanupError) {
            recovery.add(path.join(item.anchor.original, item.temporary));
            error = new AggregateError(
              [error, cleanupError],
              `transaction cleanup retained ${item.temporary}`,
            );
          }
        }
      }
      throw new AtomicFileTransactionError([error], [...recovery].sort());
    }
  } finally {
    await Promise.all([...anchors.values()].map((anchor) => anchor.close().catch(() => undefined)));
  }
}
