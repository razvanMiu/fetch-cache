import { Cache } from 'fetch-cache/cache'
import { MemoryPClient, MemorySClient } from 'fetch-cache/client/memory'

export class MemoryCache extends Cache<MemoryPClient, MemorySClient> {
  constructor() {
    super('memory')
  }

  static override create(): MemoryCache {
    return new MemoryCache()
  }

  override createPClient(): MemoryPClient {
    return MemoryPClient.create({
      strings: new Map<string, string>(),
      hashes: new Map<string, Map<string, string>>(),
    })
  }

  override createSClient(): MemorySClient {
    return MemorySClient.create({
      strings: new Map<string, string>(),
      hashes: new Map<string, Map<string, string>>(),
    })
  }
}

export function createMemoryCache(): MemoryCache {
  return MemoryCache.create()
}
