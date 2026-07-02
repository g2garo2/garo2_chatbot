import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (id.includes("@react-oauth/google")) {
            return "google-auth";
          }

          if (
            id.includes("react-markdown")
            || id.includes("remark-")
            || id.includes("rehype-")
            || id.includes("micromark")
            || id.includes("mdast")
            || id.includes("unist")
            || id.includes("hast")
            || id.includes("property-information")
          ) {
            return "markdown";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
