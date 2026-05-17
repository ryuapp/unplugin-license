# unplugin-license

[![License](https://img.shields.io/github/license/ryuapp/unplugin-license?labelColor=171717&color=39b54a&label=License)](https://github.com/ryuapp/unplugin-license/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/unplugin-license?labelColor=171717&color=39b54a)](https://npmx.dev/package/unplugin-license)

A plugin for [tsdown](https://tsdown.dev), [Vite](https://vite.dev), and other bundlers that collects OSS licenses from bundled files and outputs third-party licenses.

## Install

```sh
pnpm add -D unplugin-license
```

<details>
<summary>tsdown</summary><br>

```ts
// tsdown.config.ts
import { defineConfig } from "tsdown";
import License from "unplugin-license/rolldown";

export default defineConfig({
  plugins: [
    License({
      output: {
        file: "NOTICE.md",
      },
    }),
  ],
});
```

<br></details>

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import { defineConfig } from "vite";
import License from "unplugin-license/vite";

export default defineConfig({
  plugins: [
    License({
      output: {
        file: "NOTICE.md",
      },
    }),
  ],
});
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.ts
import License from "unplugin-license/rollup";

export default {
  plugins: [
    License({
      output: {
        file: "NOTICE.md",
      },
    }),
  ],
};
```

<br></details>

<details>
<summary>Rolldown</summary><br>

```ts
// rolldown.config.ts
import License from "unplugin-license/rolldown";

export default {
  plugins: [
    License({
      output: {
        file: "NOTICE.md",
      },
    }),
  ],
};
```

<br></details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.ts
import License from "unplugin-license/rspack";

export default {
  plugins: [
    License({
      output: {
        file: "NOTICE.md",
      },
    }),
  ],
};
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// build.ts
import { build } from "esbuild";
import License from "unplugin-license/esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  plugins: [
    License({
      output: {
        file: "NOTICE.md",
      },
    }),
  ],
});
```

<br></details>

<details>
<summary>Bun</summary><br>

```ts
// build.ts
import License from "unplugin-license/bun";

await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  plugins: [
    License({
      output: {
        file: "NOTICE.md",
      },
    }),
  ],
});
```

<br></details>

## Options

### `output.file`

The output path for the generated license notice.

Relative paths are emitted as bundled assets:

```ts
License({
  output: {
    file: "NOTICE.md",
  },
});
```

If you want to specify the output destination using an absolute path, please use a URL that follows the file protocol. For example:

```ts
License({
  output: {
    file: import.meta.resolve("./NOTICE.md"), // file:///absolute/path/to/NOTICE.md
  },
});
```

## Feedback

Found a bug or have an idea for a new feature? [Please fill out an issue](https://github.com/ryuapp/unplugin-license/issues/new).

## License

MIT-0
