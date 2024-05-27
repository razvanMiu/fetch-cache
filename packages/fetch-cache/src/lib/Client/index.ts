import type { CacheStore } from 'fetch-cache/cache'
import type { SetOptions } from 'redis'

import { EventEmitter } from 'events'

export type PubSubListener<RETURN_BUFFERS extends boolean = false> = <
  T extends RETURN_BUFFERS extends true ? Buffer : string,
>(
  message: T,
  channel: T,
) => unknown

export interface Get {
  key: string
  output: string | null
  hOutput: string | undefined
}

export interface Set {
  key: string
  value: string
  field: string
  options: SetOptions | undefined
}

export class Client<C> extends EventEmitter {
  #id: string
  #isReady: boolean
  #store?: CacheStore

  constructor(id: string, store?: CacheStore) {
    super()
    this.#id = id
    this.#isReady = false
    this.#store = store
  }

  static create<C>(store?: CacheStore): Client<C> {
    return new Client('Client', store)
  }

  get id(): string {
    return this.#id
  }

  get isReady(): boolean {
    return this.#isReady
  }

  set isReady(value: boolean) {
    this.#isReady = value
  }

  get store(): CacheStore | undefined {
    return this.#store
  }

  unimplemented(...args: any[]): void {
    const method = args[0]
    const argsList = args.slice(1)
    console.error(
      `Method "${method}" is not implemented for ${this.#id} with args:`,
      argsList.map((arg) => [arg, typeof arg]),
    )
  }

  async connect(): Promise<Client<C>> {
    this.#isReady = true
    this.unimplemented('connect')
    return new Promise((resolve) => {
      resolve(this)
    })
  }

  async disconnect(): Promise<void> {
    this.#isReady = false
    this.unimplemented('disconnect')
    return new Promise((resolve) => {
      resolve()
    })
  }

  async quit(): Promise<void> {
    this.#isReady = false
    this.unimplemented('quit')
    return new Promise((resolve) => {
      resolve()
    })
  }
}

export class PClient<C> extends Client<C> {
  static override create<C>(store?: CacheStore): PClient<C> {
    return new PClient('PClient', store)
  }

  async get(key: Get['key']): Promise<Get['output']> {
    this.unimplemented('get', key)
    return new Promise((resolve) => {
      resolve(null)
    })
  }

  async hGet(key: Get['key'], field: Set['field']): Promise<Get['hOutput']> {
    this.unimplemented('hGet', key, field)
    return new Promise((resolve) => {
      resolve(undefined)
    })
  }

  async hGetAll(key: Get['key']): Promise<Record<string, string>> {
    this.unimplemented('hGetAll', key)
    return new Promise((resolve) => {
      resolve({})
    })
  }

  async set(
    key: Set['key'],
    value: Set['value'],
    options?: Set['options'],
  ): Promise<void> {
    this.unimplemented('set', key, value, options)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async hSet(
    key: Set['key'],
    field: Set['field'],
    value: Set['value'],
  ): Promise<void> {
    this.unimplemented('hSet', key, field, value)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async hSetNX(
    key: Set['key'],
    field: Set['field'],
    value: Set['value'],
  ): Promise<void> {
    this.unimplemented('hSetNX', key, field, value)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async del(key: Get['key']): Promise<void> {
    this.unimplemented('del', key)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async hDel(key: Get['key'], field: Set['field']): Promise<void> {
    this.unimplemented('hDel', key, field)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async flushAll(): Promise<void> {
    this.unimplemented('flushAll')
    return new Promise((resolve) => {
      resolve()
    })
  }

  async publish(channel: string, message: string): Promise<void> {
    this.unimplemented('publish', channel, message)
    return new Promise((resolve) => {
      resolve()
    })
  }
}

export class SClient<C> extends Client<C> {
  static override create<C>(store?: CacheStore): SClient<C> {
    return new SClient('SClient', store)
  }

  async subscribe(
    channels: string | Array<string>,
    listener: PubSubListener,
    bufferMode?: boolean,
  ): Promise<void> {
    this.unimplemented('subscribe', channels, listener, bufferMode)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async unsubscribe(channels: string | Array<string>): Promise<void> {
    this.unimplemented('unsubscribe', channels)
    return new Promise((resolve) => {
      resolve()
    })
  }
}
