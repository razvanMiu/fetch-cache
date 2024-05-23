import nodeFetch, { Response } from "node-fetch";
import { createClient } from "redis";
import hash from "object-hash";
import { CACHE_TTL } from "./constants";
export let redisConfig;
export let redis;
export async function setRedisClientConfig(config) {
    redisConfig = config;
}
export async function getRedis() {
    if (!redis) {
        redis = await createClient(redisConfig)
            .on("error", (err) => console.log("Redis Client Error", err))
            .connect();
    }
    return redis;
}
export async function revalidateTags(tags) {
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
    }
    catch {
        return `Failed to revalidate tags ${tags.join(", ")}`;
    }
}
export async function revalidateAll() {
    const redis = await getRedis();
    try {
        await redis.flushAll();
        return null;
    }
    catch {
        return "Failed to revalidate all";
    }
}
export default async function fetch(url, init) {
    console.log("======> Fetching");
    const redis = await getRedis();
    const headers = init?.headers || {};
    const key = hash({ url, ...(init || {}) });
    const cachedResult = await redis.get(key);
    if (cachedResult) {
        return new Response(JSON.stringify(cachedResult));
    }
    const response = await nodeFetch(url, init);
    const cachedResponse = response.clone();
    if (!response.ok)
        return response;
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
    }
    catch {
        console.error(`Failed to cache response for ${url}`);
    }
    return response;
}
