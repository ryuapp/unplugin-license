import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { collectLicensesFromModuleIds } from "./utils/collect.ts";
import { logGeneratedNotice } from "./utils/log.ts";
import { resolveOptions } from "./utils/option.ts";
import type {
  LicensePluginOptions,
  ResolvedLicensePluginOptions,
} from "./utils/option.ts";
import { renderLicenseFile } from "./utils/render.ts";

interface RspackCompiler {
  webpack: {
    sources: {
      RawSource: new (source: string) => unknown;
    };
  };
  hooks: {
    thisCompilation: TapHook<[RspackCompilation]>;
  };
}

interface RspackCompilation {
  hooks: {
    succeedModule: TapHook<[RspackModule]>;
    processAssets: TapHook<[]>;
  };
  emitAsset(fileName: string, source: unknown): void;
}

interface RspackModule {
  resource?: string;
}

interface TapHook<TArgs extends unknown[]> {
  tap(name: string, callback: (...args: TArgs) => void): void;
}

export default function plugin(options: LicensePluginOptions) {
  const resolvedOptions = resolveOptions(options);

  return {
    apply(compiler: RspackCompiler) {
      compiler.hooks.thisCompilation.tap(
        "unplugin-license",
        (compilation) => {
          const moduleIds = new Set<string>();

          compilation.hooks.succeedModule.tap("unplugin-license", (module) => {
            if (module.resource) {
              moduleIds.add(module.resource);
            }
          });

          compilation.hooks.processAssets.tap("unplugin-license", () => {
            emitLicenseFile(
              compiler,
              compilation,
              resolvedOptions,
              moduleIds,
            );
          });
        },
      );
    },
  };
}

function emitLicenseFile(
  compiler: RspackCompiler,
  compilation: RspackCompilation,
  options: ResolvedLicensePluginOptions,
  moduleIds: Iterable<string>,
) {
  const entries = collectLicensesFromModuleIds(options, moduleIds);
  const source = renderLicenseFile(entries);

  if (options.output.type === "absolute") {
    mkdirSync(path.dirname(options.output.path), { recursive: true });
    writeFileSync(options.output.path, source);
    logGeneratedNotice(undefined, options.output.path);
    return;
  }

  compilation.emitAsset(
    options.output.path,
    new compiler.webpack.sources.RawSource(source),
  );
  logGeneratedNotice(undefined, options.output.path);
}
