import config from 'fetch-cache/config'

import type { KeyOfType } from '../../types/util'

import { MemoryClient, MemoryCache } from './memory'
import { RedisClient, RedisCache } from './redis'

export type Cache = RedisCache | MemoryCache
export type Client = RedisClient | MemoryClient

export type MultiCacheType = {
  redis?: RedisCache
  memory: MemoryCache
}

let multiCache: MultiCache | undefined
const caches: Array<keyof MultiCacheType> = ['redis', 'memory']

export class MultiCache {
  #caches: MultiCacheType = {
    memory: MemoryCache.create(),
  }
  #activeCacheId: keyof MultiCacheType | undefined

  constructor() {
    if (config().settings.useRedis) {
      this.#caches.redis = RedisCache.create()
    }
  }

  get activeCacheId(): keyof MultiCacheType | undefined {
    return this.#activeCacheId
  }

  get activeCache(): Cache | undefined {
    if (!this.#activeCacheId) return undefined
    return this.#caches[this.#activeCacheId]
  }

  get activeClient(): Client | undefined {
    if (!this.#activeCacheId) return undefined
    return this.#caches[this.#activeCacheId]?.client
  }

  get isReady(): boolean {
    if (!this.#activeCacheId) return false
    return this.#caches[this.#activeCacheId]?.client?.isReady || false
  }

  async connect(): Promise<MultiCache> {
    for (const id of caches) {
      const cache = this.#caches[id]
      const client = cache?.client
      if (!cache || !client) continue
      if (client.isReady) {
        this.#activeCacheId = id
        break
      }
      try {
        await client.connect()
        if (this.#activeCacheId) {
          try {
            await this.#caches[this.#activeCacheId]?.client?.disconnect()
          } catch (err: any) {
            console.error(
              `Failed to disconnect previous active cache "${this.#activeCacheId}": ${
                err?.code || err?.message || err
              }`,
            )
          }
        }
        this.#activeCacheId = id
        break
      } catch (err: any) {
        console.error(
          `Failed to connect to ${id}: ${err?.code || err?.message || err}`,
        )
      }
    }
    return this
  }

  async disconnect() {
    if (!this.activeClient || !this.activeClient?.isReady) return
    await this.activeClient.disconnect()
    this.#activeCacheId = undefined
  }

  async run<K extends KeyOfType<Client, (...args: any[]) => any>>(
    cmd: K,
    ...args: Parameters<Client[K]>
  ): Promise<ReturnType<Client[K]> | undefined> {
    if (!this.activeClient) return
    const method = this.activeClient[cmd] as (
      ...args: Parameters<Client[K]>
    ) => ReturnType<Client[K]>
    return await method?.apply(this.activeClient, args)
  }
}

export function getMultiCache(): MultiCache {
  if (!multiCache) {
    multiCache = new MultiCache()
  }

  return multiCache
}
