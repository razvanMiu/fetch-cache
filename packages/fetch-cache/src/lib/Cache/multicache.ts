import type { KeyOfType } from 'src/types/util'

import { MemoryCache } from 'fetch-cache/cache/memory'
import { RedisCache } from 'fetch-cache/cache/redis'
import { MemoryPClient, MemorySClient } from 'fetch-cache/client/memory'
import { RedisPClient, RedisSClient } from 'fetch-cache/client/redis'
import config from 'fetch-cache/config'
import { parseErr, log, ERROR_MESSAGES } from 'fetch-cache/utils'

export type Caches = RedisCache | MemoryCache
export type PClients = RedisPClient | MemoryPClient
export type SClients = RedisSClient | MemorySClient
export type Clients = PClients | SClients

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
  #cacheId: keyof MultiCacheType | undefined
  #debug: boolean = config().settings.debug || false

  constructor() {
    if (config().settings.useRedis) {
      this.#caches.redis = RedisCache.create()
    }
  }

  get cacheId(): keyof MultiCacheType | undefined {
    if (!this.#cacheId) return undefined
    const cache = this.#caches[this.#cacheId]
    if (!cache || !cache.isReady) return undefined
    return this.#cacheId
  }

  get cache(): Caches | undefined {
    if (!this.cacheId) return undefined
    return this.#caches[this.cacheId]
  }

  get isReady(): boolean {
    if (!this.cache) return false
    return this.cache?.isReady
  }

  get pclient(): PClients | undefined {
    if (!this.cache) return undefined
    return this.cache.pclient
  }

  get sclient(): SClients | undefined {
    if (!this.cache) return undefined
    return this.cache.sclient
  }

  debug(...args: any[]) {
    if (!this.#debug) return
    log.deb(`MultiCache - ${this.cacheId || 'not connected'}`, ...args)
  }

  async connect(): Promise<MultiCache> {
    this.debug('Connecting to cache.')
    for (const id of caches) {
      this.debug(`Try connecting to "${id}" cache.`)
      const cache = this.#caches[id]
      if (!cache) continue
      if (cache.isReady) {
        this.debug(`Already connected to "${id}" cache.`)
        if (this.#cacheId !== id) {
          await this.disconnectId(this.#cacheId)
          this.#cacheId = id
        }
        break
      }
      try {
        await cache.connect()
        this.debug(`Connected to "${id}" cache.`)
        if (this.#cacheId !== id) {
          await this.disconnectId(this.#cacheId)
          this.#cacheId = id
        }
        break
      } catch (e: any) {
        const err = parseErr(e)
        this.debug(`Failed to connect to "${id}" cache:`, err)
        if (cache.isReady || err.code === ERROR_MESSAGES.esockopened.code) {
          this.#cacheId = id
          this.debug(`Already connected to "${id}" cache.`, cache.isReady)
          break
        }
      }
    }
    this.debug(`End: connected to "${this.cacheId}" cache.`)
    return this
  }

  async disconnect() {
    if (!this.cache?.isReady) return
    this.debug('Disconnecting cache.')
    try {
      await this.cache.disconnect()
    } catch (err: any) {
      log.err(err, `failed to disconnect active cache "${this.cacheId}".`)
    }
    this.#cacheId = undefined
    this.debug(`Cache "${this.cacheId}" disconnected.`)
  }

  async disconnectId(id?: keyof MultiCacheType) {
    const cache = id && this.#caches[id]
    if (!cache?.isReady) return
    this.debug(`Disconnecting cache "${id}".`)
    try {
      await cache.disconnect()
    } catch (err: any) {
      log.err(err, `failed to disconnect cache "${id}".`)
    }
    this.debug(`Cache "${id}" disconnected.`)
  }

  async quit() {
    if (!this.cache?.isReady) return
    this.debug('Quitting cache.')
    try {
      await this.cache.quit()
    } catch (err: any) {
      log.err(err, `failed to quit active cache "${this.cacheId}".`)
    }
    this.#cacheId = undefined
    this.debug(`Cache "${this.cacheId}" quit.`)
  }

  async quitId(id?: keyof MultiCacheType) {
    const cache = id && this.#caches[id]
    if (!cache?.isReady) return
    this.debug(`Quitting cache "${id}".`)
    try {
      await cache.quit()
    } catch (err: any) {
      log.err(err, `failed to quit cache "${id}".`)
    }
    this.debug(`Cache "${id}" quit.`)
  }

  async prun<K extends KeyOfType<PClients, (...args: any[]) => any>>(
    cmd: K,
    ...args: Parameters<PClients[K]>
  ): Promise<ReturnType<PClients[K]> | undefined> {
    return await this.cache?.prun(cmd, ...args)
  }

  async srun<K extends KeyOfType<SClients, (...args: any[]) => any>>(
    cmd: K,
    ...args: Parameters<SClients[K]>
  ): Promise<ReturnType<SClients[K]> | undefined> {
    return await this.cache?.srun(cmd, ...args)
  }

  async revalidateAll(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  async revalidateTags(tags: Array<string>): Promise<void> {
    console.log(tags)
    return new Promise((resolve) => {
      resolve()
    })
  }
}

export function getMultiCache(): MultiCache {
  if (!multiCache) {
    multiCache = new MultiCache()
  }

  return multiCache
}
