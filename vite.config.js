export default defineConfig({
  base: "/graphic-render/",
  optimizeDeps: {
    include: ["threejs-math"],
  },
  resolve: {
    dedupe: ["threejs-math"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
