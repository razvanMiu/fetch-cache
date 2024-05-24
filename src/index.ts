import type {
  RedisClientType,
  RedisModules,
  RedisFunctions,
  RedisScripts,
  RedisClientOptions,
} from "redis";
import { createClient } from "redis";
import hash from "object-hash";

import { CACHE_TTL } from "fetch-cache/constants";

export let redisConfig: RedisClientOptions;
export let redis: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

export async function setRedisClientConfig(config?: RedisClientOptions) {
  redisConfig = config;
}

export async function getRedis(): Promise<
  RedisClientType<RedisModules, RedisFunctions, RedisScripts>
> {
  if (!redis) {
    redis = await createClient(redisConfig)
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();
  }
  return redis;
}

export async function revalidateTags(tags: string[]): Promise<string | null> {
  const redis = await getRedis();
  try {
    const cachedTags = JSON.parse(await redis.get("tags")) || {};
    for (const tag of tags) {
      Object.keys(cachedTags[tag] || {}).forEach(async (key) => {
        await redis.del(key);
      });
      delete cachedTags[tag];
      await redis.set("tags", JSON.stringify(cachedTags));
      await redis.persist("tags");
    }
    return null;
  } catch {
    return `Failed to revalidate tags ${tags.join(", ")}`;
  }
}

export async function revalidateAll(): Promise<string | null> {
  const redis = await getRedis();
  try {
    await redis.flushAll();
    return null;
  } catch {
    return "Failed to revalidate all";
  }
}

export default async function api(
  url: URL | RequestInfo,
  init?: RequestInit & { tags?: string[] }
): Promise<Response> {
  const redis = await getRedis();
  const headers = init?.headers || {};
  const key = hash({ url, ...(init || {}) });
  console.log("======> Fetching", key);

  let cachedResult: any;
  try {
    cachedResult = await redis.get(key);
    cachedResult = JSON.parse(cachedResult);
  } catch {}

  if (cachedResult) {
    return Response.json(cachedResult, {
      status: 200,
      headers: {
        "X-Fetch-Cache": "HIT",
      },
    });
  }

  const response = await fetch(url, init);
  const cachedResponse = response.clone();

  if (!response.ok) return response;
  try {
    const tags = init?.tags || [];
    const cachedTags = JSON.parse(await redis.get("tags")) || {};
    const result = JSON.stringify(await cachedResponse.json());
    for (const tag of tags) {
      if (!cachedTags[tag]) {
        cachedTags[tag] = {};
      }
      cachedTags[tag][key] = true;
    }
    await redis.set(key, result, {
      PX: CACHE_TTL,
    });
    await redis.set("tags", JSON.stringify(cachedTags));
    await redis.persist("tags");
  } catch {
    console.error(`Failed to cache response for ${url}`);
  }

  return response;
}
