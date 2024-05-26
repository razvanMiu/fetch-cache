interface MaybeHasCause {
  name?: string
  statusCode?: number
  cause?: any
}

export class CacheError extends Error {
  cause: any
  statusCode: number

  constructor(message: string, options?: MaybeHasCause) {
    super(message)

    this.name = options?.name || 'CacheError'
    this.statusCode = options?.statusCode || 500
    this.cause = options?.cause
  }
}

export class RedisError extends CacheError {
  constructor(message: string, options?: MaybeHasCause) {
    super(message, { name: 'RedisCacheError', ...options })
  }
}

export class MemoryError extends CacheError {
  constructor(message: string, options?: MaybeHasCause) {
    super(message, { name: 'MemoryCacheError', ...options })
  }
}
