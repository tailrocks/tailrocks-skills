import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: 'tailrocks-skills', url: '/docs' },
    githubUrl: 'https://github.com/tailrocks/tailrocks-skills',
    searchToggle: { enabled: false },
  }
}
