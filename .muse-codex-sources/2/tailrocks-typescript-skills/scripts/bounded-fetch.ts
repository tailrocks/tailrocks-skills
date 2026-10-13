export interface BoundedFetchOptions {
  readonly fetcher?: typeof fetch;
  readonly init?: RequestInit;
  readonly timeoutMilliseconds?: number;
  readonly maximumBytes?: number;
  readonly contentTypes?: readonly string[];
}

export async function boundedFetchText(
  input: string | URL,
  {
    fetcher = fetch,
    init,
    timeoutMilliseconds = 30_000,
    maximumBytes = 2_000_000,
    contentTypes,
  }: BoundedFetchOptions = {},
): Promise<string> {
  if (
    !Number.isSafeInteger(timeoutMilliseconds) ||
    timeoutMilliseconds < 1 ||
    !Number.isSafeInteger(maximumBytes) ||
    maximumBytes < 1
  )
    throw new Error("bounded fetch options are invalid");
  const controller = new AbortController();
  const timeout = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error("fetch timed out"));
    }, timeoutMilliseconds);
    controller.signal.addEventListener("abort", () => clearTimeout(timer), { once: true });
  });
  const operation = (async (): Promise<string> => {
    const response = await fetcher(input, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (contentTypes && !contentTypes.some((expected) => contentType.startsWith(expected)))
      throw new Error(`unexpected content type: ${contentType || "missing"}`);
    const declared = Number(response.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > maximumBytes) throw new Error("response body exceeds limit");
    if (!response.body) throw new Error("response body missing");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > maximumBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error("response body exceeds limit");
      }
      chunks.push(next.value);
    }
    const body = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder().decode(body);
  })();
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    controller.abort();
  }
}

export async function boundedFetchJson<T>(
  input: string | URL,
  options: BoundedFetchOptions = {},
): Promise<T> {
  const source = await boundedFetchText(input, {
    ...options,
    contentTypes: options.contentTypes ?? ["application/json"],
  });
  try {
    return JSON.parse(source) as T;
  } catch {
    throw new Error("response is not valid JSON");
  }
}
