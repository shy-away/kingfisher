import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: "electron/main.ts",
      fileName: "main",
      formats: ["es"],
    },
  },
});
