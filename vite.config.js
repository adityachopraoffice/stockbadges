import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { vercelPreset } from "@vercel/remix/vite";

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
    allowedHosts: true,
  },
  plugins: [
    remix({
      presets: [vercelPreset()],
      ignoredRouteFiles: ["**/.*"],
    }),
  ],
});
