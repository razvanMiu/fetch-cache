import type { Settings } from 'fetch-cache/config'

import fetch from 'fetch-cache'

export default function (settings?: Settings) {
  return {
    name: 'fetch-cache',
    hooks: {
      'astro:config:setup': () => {
        globalThis.fetchCacheConfig = {
          settings,
        }
        const _fetch = globalThis.fetch
        globalThis.fetch = async function (...args: Parameters<typeof _fetch>) {
          return fetch.apply(this, [...args, _fetch])
        }
      },
    },
  }
}
