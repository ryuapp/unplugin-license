import { applyRspackPlugin, type RspackCompiler } from "./rspack.ts";
import type { LicensePluginOptions } from "./utils/option.ts";

interface RsbuildCompiler {
  compilers?: RspackCompiler[];
}

interface RsbuildPluginApi {
  onAfterCreateCompiler(
    callback: (params: { compiler: RsbuildCompiler }) => void,
  ): void;
}

export default function plugin(options: LicensePluginOptions) {
  return {
    name: "unplugin-license",
    setup(api: RsbuildPluginApi) {
      api.onAfterCreateCompiler(({ compiler }) => {
        if (compiler.compilers) {
          for (const childCompiler of compiler.compilers) {
            applyRspackPlugin(childCompiler, options);
          }
          return;
        }

        applyRspackPlugin(compiler as RspackCompiler, options);
      });
    },
  };
}
