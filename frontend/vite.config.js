import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        "views/login": resolve(__dirname, "views/login.html"),
        "views/signup": resolve(__dirname, "views/signup.html"),
        "views/playground": resolve(__dirname, "views/playground.html"),
        "views/profile": resolve(__dirname, "views/profile.html"),
      },
    },
  },
});
