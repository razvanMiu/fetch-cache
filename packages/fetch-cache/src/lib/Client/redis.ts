import type {
  RedisClientType as ClientType,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from 'redis'

import { createClient } from 'redis'

import { PClient, SClient } from 'fetch-cache/client'
import config from 'fetch-cache/config'

function createRedisClient<T>(): T {
  return createClient({
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
  }) as unknown as T
}

export class RedisPClient extends PClient<
  ClientType<RedisModules, RedisFunctions, RedisScripts>
> {
  static override create(): RedisPClient {
    return createRedisClient<RedisPClient>()
  }
}

export class RedisSClient extends SClient<
  ClientType<RedisModules, RedisFunctions, RedisScripts>
> {
  static override create(): RedisSClient {
    return createRedisClient<RedisSClient>()
  }
}
