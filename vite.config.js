import { defineConfig } from "vite";

export default defineConfig({
  base: "/graphic-render/",

  optimizeDeps: {
    include: ["threejs-math"],
  },

  build: {
    target: "es2022",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
