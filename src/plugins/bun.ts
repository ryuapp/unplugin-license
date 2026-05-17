import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { collectLicensesFromModuleIds } from "../utils/collect.ts";
import { logGeneratedNotice } from "../utils/log.ts";
import { renderLicenseFile } from "../utils/render.ts";
import type { ResolvedLicensePluginOptions } from "../utils/option.ts";

interface BunBuildConfig {
  metafile?: boolean;
  outdir?: string;
  outfile?: string;
}

interface BunBuildMetafile {
  inputs: Record<string, unknown>;
}

interface BunBuildOutput {
  success: boolean;
  outputs: Bun.BuildArtifact[];
  metafile?: BunBuildMetafile;
}

export function createBunPlugin(
  options: ResolvedLicensePluginOptions,
): Bun.BunPlugin {
  return {
    name: "unplugin-license",
    setup(build) {
      const config = build.config as BunBuildConfig;
      config.metafile = true;

      build.onEnd((result: BunBuildOutput) => {
        if (!result.success || !result.metafile) {
          return;
        }

        const entries = collectLicensesFromModuleIds(
          options,
          Object.keys(result.metafile.inputs),
        );
        const source = renderLicenseFile(entries);

        if (options.output.type === "absolute") {
          mkdirSync(path.dirname(options.output.path), { recursive: true });
          writeFileSync(options.output.path, source);
          logGeneratedNotice(undefined, options.output.path);
          return;
        }

        const outputPath = resolveOutputPath(config, options);

        result.outputs.push(createOutputFile(outputPath, source));
        logGeneratedNotice(undefined, options.output.path);
      });
    },
  };
}

function resolveOutputPath(
  buildConfig: BunBuildConfig,
  options: ResolvedLicensePluginOptions,
): string {
  if (buildConfig.outdir) {
    return path.resolve(buildConfig.outdir, options.output.path);
  }

  if (buildConfig.outfile) {
    return path.resolve(path.dirname(buildConfig.outfile), options.output.path);
  }

  return path.resolve(process.cwd(), options.output.path);
}

function createOutputFile(path: string, source: string): Bun.BuildArtifact {
  return Object.assign(new Blob([source]), {
    path,
    loader: "text" as const,
    hash: undefined as never,
    kind: "asset" as const,
    sourcemap: undefined as never,
  });
}
