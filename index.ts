import nodeFetch, { Response } from "node-fetch";

import { CACHE_TTL } from "./constants";

let cache;

class MemoryCache {
  #cache: Record<
    string,
    {
      value: any;
      tags: string[];
      ttl: number;
      timeout?: NodeJS.Timeout;
    }
  > = {};
  #tags: Record<string, Record<string, number>> = {};

  get tags() {
    return this.tags;
  }

  get(key: string) {
    const cache = this.#cache[key];
    if (!cache) return null;
    const { timeout, ttl, value } = cache;
    clearTimeout(timeout);
    this.#cache[key].timeout = setTimeout(() => {
      this.delete(key);
    }, ttl);
    return value;
  }

  set(key: string, value: any, tags: string[], ttl: number = CACHE_TTL) {
    this.#cache[key] = {
      value,
      tags,
      ttl,
      timeout: setTimeout(() => {
        this.delete(key);
      }, ttl),
    };
    tags?.forEach((tag) => {
      if (!this.#tags[tag]) {
        this.#tags[tag] = {
          [key]: 0,
        };
      }
      this.#tags[tag][key]++;
    });
  }

  delete(key: string) {
    const cache = this.#cache[key];
    if (!cache) return;
    const { timeout, tags } = cache;
    clearTimeout(timeout);
    delete this.#cache[key];
    tags?.forEach((tag) => {
      if (this.#tags[tag][key] === 1) {
        delete this.#tags[tag][key];
      } else {
        this.#tags[tag][key]--;
      }
      if (Object.keys(this.#tags[tag]).length === 0) {
        delete this.#tags[tag];
      }
    });
  }

  reset() {
    Object.entries(this.#cache).forEach(([, cache]) => {
      clearTimeout(cache.timeout);
    });
    this.#cache = {};
    this.#tags = {};
  }

  log() {
    console.log(this.#cache, this.#tags);
  }
}

function getCache() {
  if (!cache) {
    cache = new MemoryCache();
  }
  return cache;
}

export function revalidateTags(tags: string[]) {
  const cache = getCache();
  tags.forEach((tag) => {
    Object.keys(cache.tags[tag]).forEach((key) => {
      cache.delete(key);
    });
  });
}

export default async function fetch(
  url: URL | RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const cache = getCache();
  const key = url;

  console.log("HERE", init);

  // return new Response(JSON.stringify({}));

  cache.log();

  if (cache.get(key)) {
    return new Response(JSON.stringify(cache.get(key)));
  }

  // @ts-ignore
  const response = await nodeFetch(url, init);
  const cachedResponse = response.clone();

  if (!response.ok) return response;

  try {
    // @ts-ignore
    cache.set(key, await cachedResponse.json(), init.tags || [], CACHE_TTL);
  } catch (e) {
    console.error("Failed to cache response");
  }

  return response;
}
