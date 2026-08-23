export async function readBoundedJsonStdin(
  maximumBytes: number,
  deadlineMilliseconds = 5_000,
): Promise<unknown> {
  const reader = Bun.stdin.stream().getReader(),
    chunks: Uint8Array[] = [];
  let bytes = 0,
    timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    void reader.cancel("stdin deadline exceeded");
  }, deadlineMilliseconds);
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      bytes += result.value.byteLength;
      if (bytes > maximumBytes) throw new Error("stdin is too large");
      chunks.push(result.value);
    }
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
  if (timedOut) throw new Error("stdin deadline exceeded");
  if (!bytes) throw new Error("stdin is empty");
  const body = Buffer.concat(
    chunks.map((chunk) => Buffer.from(chunk)),
    bytes,
  );
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
}
