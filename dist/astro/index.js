import _fetch, { setRedisClientConfig } from "../.";
export default function (opts) {
    const { redisConfig } = opts || {};
    return {
        name: "fetch-cache",
        hooks: {
            "astro:config:setup": ({ injectScript }) => {
                setRedisClientConfig(redisConfig);
                // @ts-ignore
                fetch = _fetch;
                // injectScript(
                //   "before-hydration",
                //   `
                //   import { default as _fetch, setRedisClientConfig } from "fetch-cache";
                //   setRedisClientConfig(${JSON.stringify(redisConfig)});
                //   fetch = _fetch;
                //   `
                // );
            },
        },
    };
}
