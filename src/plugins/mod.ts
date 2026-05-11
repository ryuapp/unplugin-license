import { createUnplugin } from "unplugin";
import { UnpluginInstance } from "unplugin";
import type { LicensePluginOptions } from "../utils/option.ts";
import { resolveOptions } from "../utils/option.ts";
import { createEsbuildPlugin } from "./esbuild.ts";
import { createRollupPlugin } from "./rollup.ts";
import { createRspackPlugin } from "./rspack.ts";

export const plugin: UnpluginInstance<LicensePluginOptions, false> =
  createUnplugin<LicensePluginOptions, false>((rawOptions, meta) => {
    const options = resolveOptions(rawOptions);

    if (meta.framework === "rspack") {
      return {
        name: "unplugin-license",
        enforce: "post",
        ...createRspackPlugin(options),
      };
    }

    return {
      name: "unplugin-license",
      enforce: "post",
      rollup: createRollupPlugin(options),
      vite: createRollupPlugin(options),
      rolldown: createRollupPlugin(options),
      esbuild: createEsbuildPlugin(options),
    };
  });
