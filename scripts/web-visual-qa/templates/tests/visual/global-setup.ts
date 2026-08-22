import type { FullConfig } from "@playwright/test";

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const baseURL = process.env.TAILROCKS_VISUAL_QA_BASE_URL;
  const revision = process.env.TAILROCKS_VISUAL_QA_REVISION;
  const nonce = process.env.TAILROCKS_VISUAL_QA_NONCE;
  const pid = Number(process.env.TAILROCKS_VISUAL_QA_PID);
  if (!baseURL || !revision || !nonce || !Number.isInteger(pid))
    throw new Error("owned server identity missing");
  const response = await fetch(`${baseURL}/api/tailrocks-visual-qa`, {
    cache: "no-store",
    redirect: "manual",
    headers: { "X-Tailrocks-Visual-Session": nonce },
    signal: AbortSignal.timeout(2_000),
  });
  if (
    !response.ok ||
    response.status !== 200 ||
    response.redirected ||
    response.headers.get("cache-control") !== "no-store" ||
    !response.headers.get("content-type")?.startsWith("application/json")
  )
    throw new Error(`visual-QA guard refused: ${response.status}`);
  const body = await response.json();
  const expected = { schema: "tailrocks.web-visual-qa-guard/v1", revision, nonce, pid, designRoutes: true };
  if (JSON.stringify(body) !== JSON.stringify(expected)) throw new Error("visual-QA guard identity mismatch");
}
