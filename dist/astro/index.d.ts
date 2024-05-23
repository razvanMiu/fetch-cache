import type { RedisClientOptions } from "redis";
type Options = {
    redisConfig?: RedisClientOptions;
};
export default function (opts?: Options): {
    name: string;
    hooks: {
        "astro:config:setup": ({ injectScript }: {
            injectScript: any;
        }) => void;
    };
};
export {};
//# sourceMappingURL=index.d.ts.map