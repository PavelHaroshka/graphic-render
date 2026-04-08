import { defineConfig } from "vite";

export default defineConfig({
  base: "/your-repo-name/",

  optimizeDeps: {
    include: ["threejs-math"],
  },

  build: {
    rollupOptions: {
      external: [],
    },

    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});