# unplugin-license

[![License](https://img.shields.io/github/license/ryuapp/unplugin-license?labelColor=171717&color=39b54a&label=License)](https://github.com/ryuapp/unplugin-license/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/unplugin-license?labelColor=171717&color=39b54a)](https://npmx.dev/package/unplugin-license)

A plugin for [tsdown](https://tsdown.dev), [Vite](https://vite.dev), and other bundlers that collects OSS licenses from bundled files and outputs third-party licenses.

Supported adapters:

- [Rolldown](https://rolldown.rs): `unplugin-license/rolldown`
- [Rollup](https://rollupjs.org): `unplugin-license/rollup`
- [Vite](https://vite.dev): `unplugin-license/vite`
- [esbuild](https://esbuild.github.io): `unplugin-license/esbuild`
- [Rspack](https://rspack.dev): `unplugin-license/rspack`
- [Bun](https://bun.com): `unplugin-license/bun`

## Install

```sh
pnpm add -D unplugin-license
```

## Usage

### tsdown

```ts
import { defineConfig } from "tsdown";
import license from "unplugin-license/rolldown";

export default defineConfig({
  plugins: [
    license({
      output: {
        file: "NOTICE.md",
      },
    }),
  ],
});
```

### Vite

```ts
import { defineConfig } from "vite";
import license from "unplugin-license/vite";

export default defineConfig({
  plugins: [
    license({
      output: {
        file: "NOTICE.md",
      },
    }),
  ],
});
```

## Feedback

Found a bug or have an idea for a new feature? [Please fill out an issue](https://github.com/ryuapp/unplugin-license/issues/new).

## License

MIT-0
