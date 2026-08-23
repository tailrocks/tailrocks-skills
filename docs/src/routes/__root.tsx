import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
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
  notFoundComponent: NotFound,
  component: RootComponent,
});

function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-fd-muted-foreground text-sm font-medium tracking-wide uppercase">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-fd-muted-foreground max-w-lg">
        The documentation page you requested does not exist.
      </p>
      <Link
        to="/"
        className="bg-fd-primary text-fd-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
      >
        Back to home
      </Link>
    </main>
  );
}

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
