import fetchCache from "../.";

export default function () {
  return {
    name: "fetch-cache",
    hooks: {
      "astro:config:setup": ({ injectScript }) => {
        fetch = fetchCache;
      },
    },
  };
}
