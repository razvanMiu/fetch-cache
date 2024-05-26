import type { Settings } from 'fetch-cache/config'

export default function (settings?: Settings) {
  return {
    name: 'fetch-cache',
    hooks: {
      'astro:config:setup': () => {
        globalThis.fetchCacheConfig = {
          settings,
        }
        // addMiddleware({
        //   entrypoint: '@fetch-cache/astro/server/init',
        //   order: 'pre',
        // })
      },
    },
  }
}
