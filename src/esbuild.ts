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

interface EsbuildBuildOptions {
  absWorkingDir?: string;
  metafile?: boolean;
  outdir?: string;
  outfile?: string;
}

interface EsbuildMetafile {
  inputs: Record<string, unknown>;
}

interface EsbuildOutputFile {
  path: string;
  contents: Uint8Array;
  hash: string;
  readonly text: string;
}

interface EsbuildBuildResult {
  errors: unknown[];
  outputFiles?: EsbuildOutputFile[];
  metafile?: EsbuildMetafile;
}

interface EsbuildPluginBuild {
  initialOptions: EsbuildBuildOptions;
  onEnd(callback: (result: EsbuildBuildResult) => void): void;
}

export default function plugin(options: LicensePluginOptions) {
  const resolvedOptions = resolveOptions(options);

  return {
    name: "unplugin-license",
    setup(build: EsbuildPluginBuild) {
      build.initialOptions.metafile = true;

      build.onEnd((result) => {
        if (result.errors.length > 0 || !result.metafile) {
          return;
        }

        const entries = collectLicensesFromModuleIds(
          resolvedOptions,
          Object.keys(result.metafile.inputs),
        );
        const source = renderLicenseFile(entries);
        const outputPath = resolveOutputPath(
          build.initialOptions,
          resolvedOptions,
        );

        if (result.outputFiles) {
          result.outputFiles.push(createOutputFile(outputPath, source));
          logGeneratedNotice(undefined, resolvedOptions.output.path);
          return;
        }

        mkdirSync(path.dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, source);
        logGeneratedNotice(undefined, resolvedOptions.output.path);
      });
    },
  };
}

function resolveOutputPath(
  buildOptions: EsbuildBuildOptions,
  options: ResolvedLicensePluginOptions,
): string {
  if (options.output.type === "absolute") {
    return options.output.path;
  }

  const workingDir = buildOptions.absWorkingDir ?? process.cwd();

  if (buildOptions.outdir) {
    return path.resolve(workingDir, buildOptions.outdir, options.output.path);
  }

  if (buildOptions.outfile) {
    return path.resolve(
      workingDir,
      path.dirname(buildOptions.outfile),
      options.output.path,
    );
  }

  return path.resolve(workingDir, options.output.path);
}

function createOutputFile(path: string, source: string): EsbuildOutputFile {
  const contents = new TextEncoder().encode(source);

  return {
    path,
    contents,
    hash: "",
    get text() {
      return source;
    },
  };
}
