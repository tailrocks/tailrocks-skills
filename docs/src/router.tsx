import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const basepath = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
  return createRouter({
    routeTree,
    basepath,
    defaultPreload: 'intent',
    scrollRestoration: true,
  })
}
