import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import laravel from "laravel-vite-plugin";

export default defineConfig({
  plugins: [
    laravel({ input: ["resources/css/app.css", "resources/js/app.tsx"], refresh: true }),
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("react") || id.includes("@inertiajs")) return "framework";
        },
      },
    },
  },
});
