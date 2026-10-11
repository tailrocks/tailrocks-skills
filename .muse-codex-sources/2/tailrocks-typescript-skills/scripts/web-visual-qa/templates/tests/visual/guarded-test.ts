import { expect, test as base } from "@playwright/test";

async function verifyGuard(): Promise<void> {
  const baseURL = process.env.TAILROCKS_VISUAL_QA_BASE_URL!;
  const revision = process.env.TAILROCKS_VISUAL_QA_REVISION!;
  const nonce = process.env.TAILROCKS_VISUAL_QA_NONCE!;
  const pid = Number(process.env.TAILROCKS_VISUAL_QA_PID);
  const response = await fetch(`${baseURL}/api/tailrocks-visual-qa`, {
    cache: "no-store",
    redirect: "manual",
    headers: { "X-Tailrocks-Visual-Session": nonce },
    signal: AbortSignal.timeout(2_000),
  });
  expect(response.status).toBe(200);
  expect(response.redirected).toBe(false);
  expect(response.headers.get("cache-control")).toBe("no-store");
  const body = await response.json();
  expect(body).toEqual({
    schema: "tailrocks.web-visual-qa-guard/v1",
    revision,
    nonce,
    pid,
    designRoutes: true,
  });
}

export const test = base.extend<{ ownedGuard: void }>({
  ownedGuard: [
    async ({ page }, use) => {
      await verifyGuard();
      await use();
      expect(new URL(page.url()).origin).toBe(process.env.TAILROCKS_VISUAL_QA_BASE_URL);
      await verifyGuard();
    },
    { auto: true },
  ],
});
export { expect };
