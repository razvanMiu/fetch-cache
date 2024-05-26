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
  #isReady: boolean

  constructor() {
    super()
    this.#isReady = false
  }

  static create<C>(): Client<C> {
    return new Client()
  }

  get isReady(): boolean {
    return this.#isReady
  }

  set isReady(value: boolean) {
    this.#isReady = value
  }

  unimplemented(...args: any[]): void {
    const method = args[0]
    const argsList = args.slice(1)
    console.error(
      `Method "${method}" is not implemented with args:`,
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

  async get(key: string): Promise<string | null> {
    this.unimplemented('get', key)
    return new Promise((resolve) => {
      resolve(null)
    })
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    this.unimplemented('hGet', key, field)
    return new Promise((resolve) => {
      resolve(undefined)
    })
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    this.unimplemented('hGetAll', key)
    return new Promise((resolve) => {
      resolve({})
    })
  }

  async set(
    key: string,
    value: string,
    options?: Set['options'],
  ): Promise<void> {
    this.unimplemented('set', key, value, options)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async hSet(key: string, field: string, value: string): Promise<void> {
    this.unimplemented('hSet', key, field, value)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async hSetNX(key: string, field: string, value: string): Promise<void> {
    this.unimplemented('hSetNX', key, field, value)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async del(key: string): Promise<void> {
    this.unimplemented('del', key)
    return new Promise((resolve) => {
      resolve()
    })
  }

  async hDel(key: string, field: string): Promise<void> {
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
}
