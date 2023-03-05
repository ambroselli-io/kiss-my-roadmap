import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  if (command === "serve") {
    return {
      plugins: [react()],
    };
  }
  // command === 'build'
  return {
    plugins: [react()],
    base: "https://roadmap.kiss-my.app/",
    build: {
      outDir: "./dist",
    },
  };
});
