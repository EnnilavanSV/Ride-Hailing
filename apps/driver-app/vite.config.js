import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // This forces Vite to always resolve these packages to the same instance
    dedupe: ["react", "react-dom"],
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    minify: "esbuild", // (Optional, as this is the default)
    target: "esnext",
  },
});
