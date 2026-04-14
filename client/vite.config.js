import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");

  return {
    envDir: "..",
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL || ""),
      "import.meta.env.VITE_ADMIN_APP_URL": JSON.stringify(env.VITE_ADMIN_APP_URL || ""),
    },
    esbuild: {
      jsx: "automatic",
    },
    resolve: {
      alias: {
        react: path.resolve("..", "frontend", "node_modules", "react"),
        "react-dom": path.resolve("..", "frontend", "node_modules", "react-dom"),
        "react/jsx-runtime": path.resolve(
          "..",
          "frontend",
          "node_modules",
          "react",
          "jsx-runtime.js"
        ),
        "react-router-dom": path.resolve(
          "..",
          "frontend",
          "node_modules",
          "react-router-dom"
        ),
        "lucide-react": path.resolve("..", "frontend", "node_modules", "lucide-react"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:4000",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
