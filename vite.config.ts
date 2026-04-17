import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import Sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    Sitemap({
      hostname: "https://recurraio.vercel.app",
      readable: true,
      changefreq: "monthly",
      dynamicRoutes: [
        "/features",
        "/process",
        "/docs",
      ],
      exclude: ["/googlee07c147967664aeb"],
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
