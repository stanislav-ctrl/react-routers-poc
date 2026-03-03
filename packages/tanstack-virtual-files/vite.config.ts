import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { virtualRouteConfig } from "./src/routes.virtual";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      virtualRouteConfig,
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ["@router-poc/shared"],
  },
});
