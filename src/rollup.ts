import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { collectLicensesFromBundle } from "./utils/collect.ts";
import type { Bundle } from "./utils/collect.ts";
import { logGeneratedNotice } from "./utils/log.ts";
import type { LoggerContext } from "./utils/log.ts";
import { resolveOptions } from "./utils/option.ts";
import type { LicensePluginOptions } from "./utils/option.ts";
import { renderLicenseFile } from "./utils/render.ts";

interface EmitFileContext extends LoggerContext {
  emitFile(asset: { type: "asset"; fileName: string; source: string }): void;
}

export default function plugin(options: LicensePluginOptions) {
  const resolvedOptions = resolveOptions(options);

  return {
    name: "unplugin-license",
    generateBundle(
      this: EmitFileContext,
      _outputOptions: unknown,
      bundle: Bundle,
    ) {
      const entries = collectLicensesFromBundle(resolvedOptions, bundle);
      const source = renderLicenseFile(entries);

      if (resolvedOptions.output.type === "absolute") {
        mkdirSync(path.dirname(resolvedOptions.output.path), {
          recursive: true,
        });
        writeFileSync(resolvedOptions.output.path, source);
        logGeneratedNotice(this, resolvedOptions.output.path);
        return;
      }

      this.emitFile({
        type: "asset",
        fileName: resolvedOptions.output.path,
        source,
      });
      logGeneratedNotice(this, resolvedOptions.output.path);
    },
  };
}
