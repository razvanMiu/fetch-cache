import type { RedisClientOptions } from 'redis'

import { setRedisClientConfig } from 'fetch-cache'

type Options = {
  redisConfig?: RedisClientOptions
}

export default function (opts?: Options) {
  const { redisConfig } = opts || {}
  return {
    name: 'fetch-cache',
    hooks: {
      'astro:config:setup': () => {
        setRedisClientConfig(redisConfig)
      },
    },
  }
}
