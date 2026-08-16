import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";

import { AgentProvider } from "@/components/AgentContext";

import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content:
          "Manual-only engineering skills for Claude Code, Codex, OpenCode, Grok Build, Kimi Code, Antigravity, and Amp.",
      },
      { title: "tailrocks-skills" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ enabled: false }}>
          <AgentProvider>
            <Outlet />
          </AgentProvider>
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
