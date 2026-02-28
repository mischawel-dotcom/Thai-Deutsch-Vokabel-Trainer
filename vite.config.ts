import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: "/Thai-Deutsch-Vokabel-Trainer/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "react-vendor";
          }
          if (id.includes("node_modules/dexie")) {
            return "db-vendor";
          }
          if (id.includes("node_modules/@radix-ui")) {
            return "ui-vendor";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons-vendor";
          }
          if (id.includes("node_modules/papaparse")) {
            return "csv-vendor";
          }
          return undefined;
        },
      },
    },
  },
});