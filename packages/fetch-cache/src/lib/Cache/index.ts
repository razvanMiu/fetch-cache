import type { KeyOfType } from 'fetch-cache/types'

import EventEmitter from 'events'

import { PClient, SClient } from 'fetch-cache/client'
import { parseErr, ERROR_MESSAGES, log } from 'fetch-cache/utils'

export type CacheStore = {
  strings: Map<string, string>
  hashes: Map<string, Map<string, string>>
}

export class Cache<P, S> extends EventEmitter {
  #id: string = 'client'
  #isReady: boolean = false
  #pclient: PClient<P>
  #sclient: SClient<S>
  #store?: CacheStore

  constructor(id: string) {
    super()
    this.#id = id
    this.#pclient = this.createPClient()
    this.#sclient = this.createSClient()

    this.pclient.on('error', (e) => {
      const err = parseErr(e)
      if (err.code === ERROR_MESSAGES.esockclosed.code) {
        this.#isReady = false
      }
    })
    this.sclient.on('error', (e) => {
      const err = parseErr(e)
      if (err.code === ERROR_MESSAGES.esockclosed.code) {
        this.#isReady = false
      }
    })
  }

  get id(): string {
    return this.#id
  }

  get isReady(): boolean {
    return this.#isReady
  }

  get pclient(): PClient<P> {
    return this.#pclient
  }

  get sclient(): SClient<S> {
    return this.#sclient
  }

  get store(): CacheStore | undefined {
    return this.#store
  }

  static create<P, S>(id: string): Cache<P, S> {
    return new Cache(id)
  }

  createPClient<C>(): PClient<C> {
    return PClient.create(this.#store)
  }

  createSClient<C>(): SClient<C> {
    return SClient.create(this.#store)
  }

  async connect(): Promise<Cache<P, S>> {
    if (this.#isReady) return this
    try {
      await this.#pclient.connect()
      await this.#sclient.connect()
      this.#isReady = true
    } catch (e) {
      const err = parseErr(e)
      if (err.code === ERROR_MESSAGES.esockopened.code) {
        this.#isReady = true
      } else {
        await (this.#pclient.isReady && this.#pclient.disconnect())
        await (this.#sclient.isReady && this.#sclient.disconnect())
        throw err
      }
    }
    return this
  }

  async disconnect(): Promise<void> {
    if (!this.#isReady) return
    this.#isReady = false
    await this.#pclient.disconnect()
    await this.#sclient.disconnect()
  }

  async quit(): Promise<void> {
    if (!this.#isReady) return
    this.#isReady = false
    await this.#pclient.quit()
    await this.#sclient.quit()
  }

  async prun<K extends KeyOfType<PClient<P>, (...args: any[]) => any>>(
    cmd: K,
    ...args: Parameters<PClient<P>[K]>
  ): Promise<ReturnType<PClient<P>[K]> | undefined> {
    if (!this.isReady || !this.pclient) return
    const method = this.pclient[cmd] as (
      ...args: Parameters<PClient<P>[K]>
    ) => ReturnType<PClient<P>[K]>
    try {
      return await method?.apply(this.pclient, args)
    } catch (e: any) {
      const err = parseErr(e)
      if (err.code === ERROR_MESSAGES.econndisconnecting.code) {
        try {
          await this.connect()
          return await this.prun(cmd, ...args)
        } catch (err: any) {
          log.err(err, `failed to reconnect.`)
          return await this.prun(cmd, ...args)
        }
      }
      log.err(e, `failed to run "${cmd}" on active cache "${this.id}".`)
    }
  }

  async srun<K extends KeyOfType<SClient<S>, (...args: any[]) => any>>(
    cmd: K,
    ...args: Parameters<SClient<S>[K]>
  ): Promise<ReturnType<SClient<S>[K]> | undefined> {
    if (!this.isReady || !this.sclient) return
    const method = this.sclient[cmd] as (
      ...args: Parameters<SClient<S>[K]>
    ) => ReturnType<SClient<S>[K]>
    try {
      return await method?.apply(this.sclient, args)
    } catch (e: any) {
      const err = parseErr(e)
      if (err.code === ERROR_MESSAGES.econndisconnecting.code) {
        try {
          await this.connect()
          return await this.srun(cmd, ...args)
        } catch (err: any) {
          log.err(err, `failed to reconnect.`)
          return await this.srun(cmd, ...args)
        }
      }
      log.err(e, `failed to run "${cmd}" on active cache "${this.id}".`)
    }
  }
}

export function createCache<P, S>(id: string): Cache<P, S> {
  return Cache.create(id)
}
