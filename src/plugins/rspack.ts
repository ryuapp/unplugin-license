import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderLicenseFile } from "../utils/render.ts";
import { collectLicensesFromModuleIds } from "../utils/collect.ts";
import { logGeneratedNotice } from "../utils/log.ts";
import type { LoggerContext } from "../utils/log.ts";
import type { ResolvedLicensePluginOptions } from "../utils/option.ts";

interface EmitFileContext extends LoggerContext {
  emitFile(asset: { type: "asset"; fileName: string; source: string }): void;
}

export function createRspackPlugin(options: ResolvedLicensePluginOptions) {
  const moduleIds = new Set<string>();

  return {
    buildStart() {
      moduleIds.clear();
    },
    load(id: string) {
      moduleIds.add(id);
    },
    buildEnd(this: EmitFileContext) {
      const entries = collectLicensesFromModuleIds(options, moduleIds);
      const source = renderLicenseFile(entries);

      if (options.output.type === "absolute") {
        mkdirSync(path.dirname(options.output.path), { recursive: true });
        writeFileSync(options.output.path, source);
        logGeneratedNotice(this, options.output.path);
        return;
      }

      this.emitFile({
        type: "asset",
        fileName: options.output.path,
        source,
      });
      logGeneratedNotice(this, options.output.path);
    },
  };
}
