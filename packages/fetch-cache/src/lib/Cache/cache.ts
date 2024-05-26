import { Client } from './client'

export class Cache<C> {
  #id: string = 'client'
  #client: Client<C>

  constructor(id: string) {
    this.#id = id
    this.#client = this.createClient()
  }

  get id(): string {
    return this.#id
  }

  get client(): Client<C> {
    return this.#client
  }

  static create<C>(id: string): Cache<C> {
    return new Cache(id)
  }

  createClient<C>(): Client<C> {
    return Client.create()
  }
}

export function createCache<C>(id: string): Cache<C> {
  return Cache.create(id)
}
