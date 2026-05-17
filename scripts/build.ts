import { build } from "tsdown";

await build({
  configLoader: "native",
  entry: {
    bun: "src/bun.ts",
    esbuild: "src/esbuild.ts",
    rolldown: "src/rolldown.ts",
    rollup: "src/rollup.ts",
    rspack: "src/rspack.ts",
    vite: "src/vite.ts",
  },
  format: "esm",
  clean: true,
  tsconfig: "tsconfig.json",
  dts: {
    tsgo: true,
  },
});
