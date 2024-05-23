import type { RedisClientOptions } from "redis";

import { setRedisClientConfig } from "../.";

type Options = {
  redisConfig?: RedisClientOptions;
};

export default function (opts?: Options) {
  const { redisConfig } = opts || {};
  return {
    name: "fetch-cache",
    hooks: {
      "astro:config:setup": ({ injectScript }) => {
        setRedisClientConfig(redisConfig);

        injectScript(
          "before-hydration",
          `
          import { setRedisClientConfig } from "fetch-cache";
          setRedisClientConfig(${JSON.stringify(redisConfig)});
          `
        );
      },
    },
  };
}
