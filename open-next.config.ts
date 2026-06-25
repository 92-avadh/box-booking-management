import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({});

(config as any).buildCommand = "npx next build";

(config as any).default = {
  ...(config.default ?? {}),
  minify: true,
};

export default config;
