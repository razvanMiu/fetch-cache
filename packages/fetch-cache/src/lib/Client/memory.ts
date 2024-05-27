import type { CacheStore } from 'fetch-cache/cache'
import type { Get, Set } from 'fetch-cache/client'

import { PClient, SClient } from 'fetch-cache/client'

export class MemoryPClient extends PClient<MemoryPClient> {
  static override create(store: CacheStore): MemoryPClient {
    return new MemoryPClient('MemoryPClient', store)
  }

  override async connect(): Promise<PClient<MemoryPClient>> {
    this.isReady = true
    return new Promise((resolve) => resolve(this))
  }

  override async disconnect(): Promise<void> {
    this.isReady = false
    return new Promise((resolve) => resolve())
  }

  async get(key: Get['key']): Promise<Get['output']> {
    return new Promise((resolve) => {
      resolve(this.store?.strings.get(key) || null)
    })
  }

  async hGet(key: Get['key'], field: Set['field']): Promise<Get['hOutput']> {
    return new Promise((resolve) => {
      const hash = this.store?.hashes.get(key)
      resolve(hash?.get(field))
    })
  }

  async hGetAll(key: Get['key']): Promise<Record<string, string>> {
    return new Promise((resolve) => {
      const hash = this.store?.hashes.get(key)
      resolve(Object.fromEntries(hash || []))
    })
  }

  async set(
    key: Set['key'],
    value: Set['value'],
    options?: Set['options'],
  ): Promise<void> {
    return new Promise((resolve) => {
      this.store?.strings.set(key, value)
      resolve()
    })
  }

  async hSet(
    key: Set['key'],
    field: Set['field'],
    value: Set['value'],
  ): Promise<void> {
    return new Promise((resolve) => {
      let hash = this.store?.hashes.get(key)
      if (!hash) {
        hash = new Map()
        this.store?.hashes.set(key, hash)
      }
      hash.set(field, value)
      resolve()
    })
  }
}

export class MemorySClient extends SClient<MemorySClient> {
  static override create(store: CacheStore): MemorySClient {
    return new MemorySClient('MemorySClient', store)
  }

  override async connect(): Promise<SClient<MemorySClient>> {
    this.isReady = true
    return new Promise((resolve) => resolve(this))
  }

  override async disconnect(): Promise<void> {
    this.isReady = false
    return new Promise((resolve) => resolve())
  }
}
