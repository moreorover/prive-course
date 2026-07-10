import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";
import type { PluginOption } from "vite-plus";

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: lazyPlugins(() => {
    const routerPlugin = tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    });
    const routerPlugins = Array.isArray(routerPlugin) ? routerPlugin : [routerPlugin];

    return [tailwindcss(), ...routerPlugins, react()] as PluginOption[];
  }),
});
