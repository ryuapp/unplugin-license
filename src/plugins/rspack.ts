import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderLicenseFile } from "../utils/render.ts";
import { collectLicensesFromModuleIds } from "../utils/collect.ts";
import type { ResolvedLicensePluginOptions } from "../utils/option.ts";

interface EmitFileContext {
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

      if (path.isAbsolute(options.output)) {
        mkdirSync(path.dirname(options.output), { recursive: true });
        writeFileSync(options.output, source);
        return;
      }

      this.emitFile({
        type: "asset",
        fileName: options.output,
        source,
      });
    },
  };
}
