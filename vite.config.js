import { defineConfig } from "vite";

export default defineConfig({
  base: "/graphic-render/",

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