import type { RedisClientOptions } from 'redis'

let config: Config | undefined

export type Settings = {
  debug?: boolean
  useRedis?: boolean
  redis?: RedisClientOptions
  inMemory?: null
}

class Config {
  #initialized: boolean = false
  #settings: Settings = {
    useRedis: false,
    debug: false,
  }

  get settings() {
    return this.#settings
  }

  set settings(value: Settings) {
    this.#settings = {
      ...(this.#settings || {}),
      ...(value || {}),
    }
  }

  get initialized() {
    return this.#initialized
  }

  set initialized(value: boolean) {
    this.#initialized = value
  }
}

export default function getConfig(): Config {
  if (!config) {
    const { settings } = globalThis.fetchCacheConfig || {}
    config = new Config()
    config.settings = settings
  }
  return config
}
