import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/lib/layout.shared'

export const Route = createFileRoute('/')({ component: Home })

const highlights = [
  {
    title: 'Manual-only',
    body: 'No skill activates on its own. You name it, or it stays out of the way.',
  },
  {
    title: 'One source, every agent',
    body: 'Claude Code, Codex CLI, OpenCode, Grok Build, Kimi Code, Antigravity CLI, and Amp read the same skills/ tree.',
  },
  {
    title: 'Opinionated on purpose',
    body: 'Rust 2024 with Axum, TypeScript 7 with Bun and TanStack Start, and native macOS with SwiftUI and Liquid Glass.',
  },
]

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-4 py-16">
        <section className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">tailrocks-skills</h1>
          <p className="text-fd-muted-foreground text-lg">
            Reusable engineering skills for coding agents — strict Rust and Axum, strict
            TypeScript and TanStack, native macOS with Liquid Glass, code-health ratchets,
            correctness-first remediation, and a roadmap delivery pipeline.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/docs/$"
              params={{ _splat: 'skills' }}
              className="bg-fd-primary text-fd-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
            >
              Browse the skills
            </Link>
            <Link
              to="/docs/$"
              params={{ _splat: 'install' }}
              className="border-fd-border rounded-md border px-4 py-2 text-sm font-medium"
            >
              Install
            </Link>
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="border-fd-border bg-fd-card rounded-lg border p-4">
              <h2 className="font-medium">{item.title}</h2>
              <p className="text-fd-muted-foreground mt-2 text-sm">{item.body}</p>
            </div>
          ))}
        </section>
      </main>
    </HomeLayout>
  )
}
