import { createFileRoute } from "@tanstack/react-router";

const schema = "tailrocks.web-visual-qa-guard/v1";

export const Route = createFileRoute("/api/tailrocks-visual-qa")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expectedNonce = process.env.TAILROCKS_VISUAL_QA_NONCE;
        const revision = process.env.TAILROCKS_VISUAL_QA_REVISION;
        const nonce = request.headers.get("X-Tailrocks-Visual-Session");
        if (process.env.TAILROCKS_VISUAL_QA !== "1" || !expectedNonce || !revision || nonce !== expectedNonce)
          return new Response("Not Found", { status: 404 });
        return Response.json(
          { schema, revision, nonce, pid: process.pid, designRoutes: process.env.VITE_DESIGN_ROUTES === "1" },
          { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
        );
      },
    },
  },
});
