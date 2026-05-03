import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(process.cwd(), "mobile"),
  base: "/gattografy/mobile/",
  build: {
    outDir: path.resolve(process.cwd(), "mobile-dist"),
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5175,
  },
});

