import { ERROR_MESSAGES } from './constants'

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

export function parseErr(err: any): { code: string; message: string } {
  let parsedErr = err.code || err.message || err

  if (typeof parsedErr !== 'string') {
    return ERROR_MESSAGES['eunknown']
  }

  parsedErr = parsedErr.toLowerCase()

  return ERROR_MESSAGES[parsedErr] || ERROR_MESSAGES['eunknown']
}

export const log = {
  err: function err(err: any, ...args: any[]) {
    let parsedErr
    if (typeof err === 'string') {
      parsedErr = parseErr(err)
    } else if (
      err.code &&
      err.message &&
      err.code !== ERROR_MESSAGES['eunknown'].code
    ) {
      parsedErr = err
    } else {
      console.error(...args, err)
      return
    }
    console.error(`${parsedErr?.message} (${parsedErr?.code}):`, ...args)
  },
  deb: function debug(worker: string, ...args: any[]) {
    console.debug(`[${worker}] >`, ...args)
  },
}
