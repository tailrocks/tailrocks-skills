import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  optimizeDeps: {
    exclude: ["react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  plugins: [
    mdx(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: { enabled: true, crawlLinks: true },
      },
      pages: [{ path: "/" }, { path: "/docs" }, { path: "/docs/skills" }],
    }),
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
