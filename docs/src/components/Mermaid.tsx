'use client'

import { use, useEffect, useId, useState } from 'react'
import { useTheme } from 'next-themes'

const cache = new Map<string, Promise<unknown>>()

function cachePromise<T>(key: string, create: () => Promise<T>): Promise<T> {
  const cached = cache.get(key)
  if (cached) return cached as Promise<T>
  const promise = create()
  cache.set(key, promise)
  return promise
}

/**
 * Renders ```mermaid code blocks. The remark plugin in source.config.ts rewrites
 * those fences into this component. Mermaid runs in the browser, so the diagram
 * appears after hydration rather than in the prerendered HTML — the surrounding
 * prose has to carry the meaning on its own.
 */
export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  return <MermaidContent chart={chart} />
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId()
  const { resolvedTheme } = useTheme()
  const { default: mermaid } = use(cachePromise('mermaid', () => import('mermaid')))

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    fontFamily: 'inherit',
    theme: resolvedTheme === 'dark' ? 'dark' : 'default',
  })

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () =>
      mermaid.render(id.replaceAll(':', ''), chart.replaceAll('\\n', '\n')),
    ),
  )

  return (
    <div
      className="my-6 overflow-x-auto"
      ref={(container) => {
        if (container) bindFunctions?.(container)
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
