import { getMultiCache, MultiCache } from 'fetch-cache/cache'
import { CACHE_TTL } from 'fetch-cache/utils'
import { getHashKey } from 'fetch-cache/utils'

import getConfig from './config'

function debug(start: number, ...args: any[]) {
  const config = getConfig()
  if (config.settings.debug) {
    console.debug(...args, 'Took:', Date.now() - start, 'ms')
  }
}

async function getCachedResult(
  cache: MultiCache,
  key: string,
): Promise<string | null | undefined> {
  try {
    return await cache.run('get', key)
  } catch (err) {
    console.error(`Failed to get cache for ${key}: ${err}`)
    return null
  }
}

async function getResponse(result: string, headers?: HeadersInit) {
  return new Response(result, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Fetch-Cache': 'HIT',
      ...(headers || {}),
    },
  })
}

export default async function fetch(
  url: URL | RequestInfo,
  init?: RequestInit & { tags?: string[] },
): Promise<Response> {
  const now = Date.now()
  const cache = await getMultiCache().connect()
  debug(now, `1. Connecting to cache: "${cache.activeCacheId}"`)
  const key = await getHashKey({ url, ...(init || {}) })
  debug(now, `2. Generating hash key for ${url}: ${key}.`)
  const cachedResult = (await getCachedResult(cache, key)) || ''
  debug(
    now,
    `3. Getting cached data${cachedResult ? `. Data length is: ${cachedResult?.length}.` : " but it's undefined."}`,
  )
  if (cachedResult) {
    debug(now, `4. Responding with cached data for ${url}.`)
    return await getResponse(cachedResult)
  }
  const status = await cache.run('hGet', 'fetch:requests', key)
  debug(now, '4. Getting request status ${status}.')
  if (status != 'pending') {
    await cache.run('hSet', 'fetch:requests', key, 'pending')
    debug(now, '5. Setting request status to "pending".')
    const response = await globalThis.fetch(url, init)
    debug(now, `6. Fetching new data for ${url}.`)
    if (!response.ok) {
      await cache.run('hSet', 'fetch:requests', key, 'error')
      debug(
        now,
        `7. Setting request status to "error" and responding without caching for ${url}.`,
      )
      return response
    }
    const result = await response.text()
    debug(now, '7. Parsing response as text.')
    await cache.run('set', key, result, {
      PX: CACHE_TTL,
    })
    debug(now, '8. Caching response as text.')
    await cache.run('hSet', 'fetch:requests', key, 'loaded')
    debug(now, '9. Setting request status to "loaded".')
    await cache.run('publish', `fetch:requests:${key}`, 'loaded')
    debug(now, '10. Publishing "loaded" signal to listeners.')
    debug(now, '11. Finishing request.')
    // for (const tag of tags) {
    //   await cache.hSetNX('tags', tag, '')
    //   await cache.hSetNX(tag, key, '')
    // }
    return await getResponse(result, {
      'X-Fetch-Cache': 'MISS',
    })
  } else {
    return new Promise((resolve) => {
      debug(now, `5. Subscribing to fetch:requests:${key}.`)
      cache.run('subscribe', `fetch:requests:${key}`, async (message) => {
        debug(now, `6. Receiving message: ${message}.`)
        cache.run('unsubscribe', `fetch:requests:${key}`)
        debug(now, `7. Unsubscribing from fetch:requests:${key}.`)
        if (message === 'loaded') {
          const cachedResult = await getCachedResult(cache, key)
          debug(now, `8. Getting cached data for ${url}.`)
          if (!cachedResult) {
            debug(
              now,
              `9. Responding with Internal Server Error for ${url} because cached data is undefined.`,
            )
            return resolve(
              new Response('Internal Server Error', { status: 500 }),
            )
          }
          debug(now, `10. Responding with cached data for ${url}.`)
          resolve(
            await getResponse(cachedResult, {
              'X-Fetch-Cache': 'HIT-SIGNAL',
            }),
          )
        }
        if (message === 'error') {
          debug(
            now,
            `8. Responding with Internal Server Error for ${url} because request status is "error".`,
          )
          resolve(new Response('Internal Server Error', { status: 500 }))
        }
      })
    })
  }
}
