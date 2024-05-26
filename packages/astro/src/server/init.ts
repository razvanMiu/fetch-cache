import { defineMiddleware } from 'astro/middleware'

import getConfig from 'fetch-cache/config'

export const onRequest = defineMiddleware(async (_, next) => {
  const config = getConfig()
  const { settings = {} } = globalThis.fetchCacheConfig || {}
  console.log('INIALIZING CONFIG', settings)

  if (!config.initialized) {
    config.settings = settings
    // config.initialized = true
    // delete globalThis.fetchCacheConfig
  }

  return next()
})
