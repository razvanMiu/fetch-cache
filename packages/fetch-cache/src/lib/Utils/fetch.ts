import type { MultiCache } from 'fetch-cache/cache/multicache'

export async function getCachedResult(
  cache: MultiCache,
  key: string,
): Promise<string | null | undefined> {
  try {
    return await cache.prun('get', key)
  } catch (err) {
    console.error(`Failed to get cache for ${key}: ${err}`)
    return null
  }
}

export async function getResponse(result: string, headers?: HeadersInit) {
  return new Response(result, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Fetch-Cache': 'HIT',
      ...(headers || {}),
    },
  })
}
