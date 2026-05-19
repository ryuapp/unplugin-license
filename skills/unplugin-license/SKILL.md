---
name: unplugin-license
license: MIT-0
compatibility: Works with projects using tsdown, Vite, Rollup, Rolldown, Rspack, esbuild, Bun, or build tools and frameworks based on them.
description: Use this skill whenever the user wants to add license notice generation to a JavaScript or TypeScript bundler project using unplugin-license. Trigger when the user mentions OSS license collection, third-party license output, NOTICE file generation, license compliance in builds, or wants to add a license plugin to tsdown, Vite, Rollup, Rolldown, Rspack, esbuild, or Bun builds. Also trigger when the user asks how to set up unplugin-license, configure its output, or integrate it into an existing bundler config.
---

# unplugin-license Skill

`unplugin-license` is a plugin for tsdown, Vite, Rollup, Rolldown, Rspack, esbuild, and Bun that collects OSS licenses from bundled dependencies and outputs a third-party license notice file such as `NOTICE.md`.

## Installation

```bash
pnpm add -D unplugin-license
# or
bun add -d unplugin-license
```

## Setup by Bundler

### tsdown / Rolldown

```ts
// tsdown.config.ts or rolldown.config.ts
import { defineConfig } from "tsdown"; // for tsdown
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

### Vite

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

### Rollup

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

### Rspack

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

### esbuild

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

### Bun

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

## Options

### `output.file`

Set `output.file` to the output path for the generated license notice file.

Use a relative path to emit the notice as a bundled asset inside the output directory:

```ts
License({ output: { file: "NOTICE.md" } });
```

Use a `file:` protocol URL to write the notice to an absolute path:

```ts
License({
  output: {
    file: import.meta.resolve("./NOTICE.md"),
  },
});
```

## Tips

- Relative output paths are written into the bundler output directory, for example `dist/NOTICE.md`.
- Absolute output paths should use `import.meta.resolve()` when writing to a specific location such as the project root.
- Markdown is a common notice format, but any filename works, for example `THIRD_PARTY_LICENSES.txt`.

## Links

- [GitHub Repository](https://github.com/ryuapp/unplugin-license)
- [npm Package](https://www.npmjs.com/package/unplugin-license)
- [Report an Issue](https://github.com/ryuapp/unplugin-license/issues/new)
