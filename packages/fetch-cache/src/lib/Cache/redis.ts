import type {
  RedisClientType as ClientType,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from 'redis'

import { createClient } from 'redis'

import config from 'fetch-cache/config'

import { Cache } from './cache'
import { Client } from './client'

export class RedisClient extends Client<
  ClientType<RedisModules, RedisFunctions, RedisScripts>
> {
  static override create(): RedisClient {
    const client = createClient({
      ...(config().settings.redis || {}),
      socket: {
        ...(config().settings.redis?.socket || {}),
        reconnectStrategy: (retries: number, cause: Error) => {
          const targetError = 'READONLY'
          if (cause.message.includes(targetError)) {
            return Math.min(retries * 50, 500)
          }
          return false
        },
      },
    }) as unknown as RedisClient
    client.on('connect', () => {
      console.log('Redis client connected')
    })
    client.on('error', (err) => {
      console.error('===>', err)
    })
    client.on('reconnecting', (time) => {
      console.log(`Reconnecting to Redis in ${time}ms`)
    })
    return client
  }

  override unimplemented(...args: any[]): void {
    const method = args[0]
    const argsList = args.slice(1)
    console.error(
      `Method ${method} is not implemented for redis client with args: ${argsList.map((arg) => [arg, typeof arg])}`,
    )
  }
}

export class RedisCache extends Cache<RedisClient> {
  constructor() {
    super('redis')
  }

  static override create(): RedisCache {
    return new RedisCache()
  }

  override createClient(): RedisClient {
    return RedisClient.create()
  }
}

export function createRedisCache(): RedisCache {
  return RedisCache.create()
}
