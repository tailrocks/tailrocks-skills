import { expect, test } from "bun:test";

import { boundedFetchJson, boundedFetchText } from "./bounded-fetch";

test("accepts bounded typed JSON", async () => {
  const value = await boundedFetchJson<{ ok: boolean }>("https://example.invalid", {
    fetcher: (async () => Response.json({ ok: true })) as typeof fetch,
  });
  expect(value).toEqual({ ok: true });
});

test("never-resolving fetch reaches the hard timeout", async () => {
  const started = performance.now();
  await expect(
    boundedFetchText("https://example.invalid", {
      fetcher: (() => new Promise<Response>(() => {})) as typeof fetch,
      timeoutMilliseconds: 50,
    }),
  ).rejects.toThrow("fetch timed out");
  expect(performance.now() - started).toBeLessThan(1_000);
});

test("rejects declared and streamed body saturation", async () => {
  await expect(
    boundedFetchText("https://example.invalid", {
      fetcher: (async () => new Response("small", { headers: { "Content-Length": "1000" } })) as typeof fetch,
      maximumBytes: 10,
    }),
  ).rejects.toThrow("response body exceeds limit");
  await expect(
    boundedFetchText("https://example.invalid", {
      fetcher: (async () => new Response("x".repeat(100))) as typeof fetch,
      maximumBytes: 10,
    }),
  ).rejects.toThrow("response body exceeds limit");
});
