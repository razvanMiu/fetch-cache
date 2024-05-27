import { getMultiCache } from 'fetch-cache/cache/multicache'
import config from 'fetch-cache/config'
import { CACHE_TTL, getCachedResult, getResponse } from 'fetch-cache/utils'
import { getHashKey, log } from 'fetch-cache/utils'

export default async function fetch(
  url: URL | RequestInfo,
  init?: RequestInit,
  _fetch?: typeof fetch,
): Promise<Response> {
  const time = Date.now()
  function debug(...args: any[]) {
    if (config().settings.debug) {
      log.deb('fetch-cache', ...args, 'in', Date.now() - time, 'ms')
    }
  }
  const cache = await getMultiCache().connect()
  const key = await getHashKey({ url, ...(init || {}) })
  debug(`1. Generated hash key for ${url}: ${key}`)
  const cachedResult = (await getCachedResult(cache, key)) || ''
  if (cachedResult) {
    debug(`2. Cache hit for ${url} => responding to client`)
    return await getResponse(cachedResult)
  }
  const status = await cache.prun('hGet', 'fetch:requests', key)
  debug(`2. Status for ${key}: ${status}`)
  if (status != 'pending') {
    await cache.prun('hSet', 'fetch:requests', key, 'pending')
    debug(`3. Fetching new data for ${url}`)
    const response = await (_fetch || globalThis.fetch)(url, init)
    if (!response.ok) {
      await cache.prun('hSet', 'fetch:requests', key, 'error')
      await cache.prun('publish', `fetch:requests:${key}`, 'error')
      debug(`4. Error fetching data for ${url}: ${response.status}`)
      return response
    }
    const result = await response.text()
    debug(`4. Parsed response for ${url} as text`)
    await cache.prun('set', key, result, {
      PX: CACHE_TTL,
    })
    await cache.prun('hSet', 'fetch:requests', key, 'loaded')
    await cache.prun('publish', `fetch:requests:${key}`, 'loaded')
    // for (const tag of tags) {
    //   await cache.hSetNX('tags', tag, '')
    //   await cache.hSetNX(tag, key, '')
    // }
    debug(`5. Cached response for ${url} => responding to client`)
    return await getResponse(result, {
      'X-Fetch-Cache': 'MISS',
    })
  } else {
    debug(`3. Subscribe for fetch:requests:${key}`)
    return new Promise((resolve) => {
      cache.srun('subscribe', `fetch:requests:${key}`, async (message) => {
        cache.srun('unsubscribe', `fetch:requests:${key}`)
        if (message === 'loaded') {
          const cachedResult = await getCachedResult(cache, key)
          if (!cachedResult) {
            debug(
              `4. Subscribe (loaded) -> error getting cached key ${key}: ${message}`,
            )
            return resolve(
              new Response('Internal Server Error', { status: 500 }),
            )
          }
          debug(
            `4. Subscribe (loaded) cache hit for ${url} => responding to client`,
          )
          resolve(
            await getResponse(cachedResult, {
              'X-Fetch-Cache': 'HIT-SIGNAL',
            }),
          )
        }
        if (message === 'error') {
          debug(
            `4. Subscribe (error) -> failed fetching data for ${url}: ${message}`,
          )
          resolve(new Response('Internal Server Error', { status: 500 }))
        }
      })
    })
  }
}
