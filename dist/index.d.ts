import type { RequestInfo, RequestInit } from "node-fetch";
import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts, RedisClientOptions } from "redis";
import { Response } from "node-fetch";
export declare let redisConfig: RedisClientOptions;
export declare let redis: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
export declare function setRedisClientConfig(config?: RedisClientOptions): Promise<void>;
export declare function getRedis(): Promise<RedisClientType<RedisModules, RedisFunctions, RedisScripts>>;
export declare function revalidateTags(tags: string[]): Promise<string | null>;
export declare function revalidateAll(): Promise<string | null>;
export default function fetch(url: URL | RequestInfo, init?: RequestInit): Promise<Response>;
//# sourceMappingURL=index.d.ts.map