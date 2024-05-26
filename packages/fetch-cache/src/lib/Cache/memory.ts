import { Cache } from './cache'
import { Client } from './client'

export class MemoryClient extends Client<MemoryClient> {
  static override create(): MemoryClient {
    return new MemoryClient()
  }

  override unimplemented(...args: any[]): void {
    const method = args[0]
    const argsList = args.slice(1)
    console.error(
      `Method "${method}" is not implemented for memory cache client with args:`,
      argsList.map((arg) => [arg, typeof arg]),
    )
  }

  override async connect(): Promise<Client<MemoryClient>> {
    this.isReady = true
    return new Promise((resolve) => resolve(this))
  }

  override async disconnect(): Promise<void> {
    this.isReady = false
    return new Promise((resolve) => resolve())
  }
}

export class MemoryCache extends Cache<MemoryClient> {
  constructor() {
    super('memory')
  }

  static override create(): MemoryCache {
    return new MemoryCache()
  }

  override createClient(): MemoryClient {
    return MemoryClient.create()
  }
}

export function createMemoryCache(): MemoryCache {
  return MemoryCache.create()
}
