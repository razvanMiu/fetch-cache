import { Cache } from 'fetch-cache/cache'
import { RedisPClient, RedisSClient } from 'fetch-cache/client/redis'

export class RedisCache extends Cache<RedisPClient, RedisSClient> {
  constructor() {
    super('redis')
  }

  static override create(): RedisCache {
    return new RedisCache()
  }

  override createPClient(): RedisPClient {
    return RedisPClient.create()
  }

  override createSClient(): RedisSClient {
    return RedisSClient.create()
  }
}

export function createRedisCache(): RedisCache {
  return RedisCache.create()
}
