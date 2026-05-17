import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { collectLicensesFromModuleIds } from "./utils/collect.ts";
import { logGeneratedNotice } from "./utils/log.ts";
import { resolveOptions } from "./utils/option.ts";
import type {
  LicensePluginOptions,
  ResolvedLicensePluginOptions,
} from "./utils/option.ts";
import { renderLicenseFile } from "./utils/render.ts";

interface BunBuildConfig {
  metafile?: boolean;
  outdir?: string;
  outfile?: string;
}

interface BunBuildMetafile {
  inputs: Record<string, unknown>;
}

interface BunPlugin {
  name: string;
  setup(build: unknown): void;
}

interface BunPluginBuild {
  config: BunBuildConfig;
  onEnd(callback: (result: BunBuildOutput) => void): void;
}

interface BunBuildOutput {
  success: boolean;
  outputs: BunBuildArtifact[];
  metafile?: BunBuildMetafile;
}

interface BunBuildArtifact extends Blob {
  path: string;
  loader: "text";
  hash: never;
  kind: "asset";
  sourcemap: never;
}

export default function plugin(options: LicensePluginOptions): BunPlugin {
  const resolvedOptions = resolveOptions(options);

  return {
    name: "unplugin-license",
    setup(build) {
      const pluginBuild = build as BunPluginBuild;
      const config = pluginBuild.config as BunBuildConfig;
      config.metafile = true;

      pluginBuild.onEnd((result) => {
        if (!result.success || !result.metafile) {
          return;
        }

        const entries = collectLicensesFromModuleIds(
          resolvedOptions,
          Object.keys(result.metafile.inputs),
        );
        const source = renderLicenseFile(entries);

        if (resolvedOptions.output.type === "absolute") {
          mkdirSync(path.dirname(resolvedOptions.output.path), {
            recursive: true,
          });
          writeFileSync(resolvedOptions.output.path, source);
          logGeneratedNotice(undefined, resolvedOptions.output.path);
          return;
        }

        const outputPath = resolveOutputPath(config, resolvedOptions);

        result.outputs.push(createOutputFile(outputPath, source));
        logGeneratedNotice(undefined, resolvedOptions.output.path);
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

function createOutputFile(path: string, source: string): BunBuildArtifact {
  return Object.assign(new Blob([source]), {
    path,
    loader: "text" as const,
    hash: undefined as never,
    kind: "asset" as const,
    sourcemap: undefined as never,
  });
}
