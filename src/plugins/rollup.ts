import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderLicenseFile } from "../utils/render.ts";
import { collectLicensesFromBundle } from "../utils/collect.ts";
import type { Bundle } from "../utils/collect.ts";
import { logGeneratedNotice } from "../utils/log.ts";
import type { LoggerContext } from "../utils/log.ts";
import type { ResolvedLicensePluginOptions } from "../utils/option.ts";

interface EmitFileContext extends LoggerContext {
  emitFile(asset: { type: "asset"; fileName: string; source: string }): void;
}

export function createRollupPlugin(options: ResolvedLicensePluginOptions) {
  return {
    generateBundle(
      this: EmitFileContext,
      _outputOptions: unknown,
      bundle: Bundle,
    ) {
      const entries = collectLicensesFromBundle(options, bundle);
      const source = renderLicenseFile(entries);

      if (path.isAbsolute(options.output.file)) {
        mkdirSync(path.dirname(options.output.file), { recursive: true });
        writeFileSync(options.output.file, source);
        logGeneratedNotice(this, options.output.file);
        return;
      }

      this.emitFile({
        type: "asset",
        fileName: options.output.file,
        source,
      });
      logGeneratedNotice(this, options.output.file);
    },
  };
}
