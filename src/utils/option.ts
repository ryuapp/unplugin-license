import { resolveOutputPath } from "./output-path.ts";

export interface LicensePluginOptions {
  /**
   * Output options for generated license notice.
   */
  output: {
    /**
     * Generated asset file name.
     *
     * Relative paths are emitted as bundler assets.
     * File URLs are written directly to the filesystem.
     *
     * Use file URLs when specifying absolute output paths.
     */
    file: string;
  };
}

export interface ResolvedLicensePluginOptions {
  output:
    | {
      type: "relative";
      path: string;
    }
    | {
      type: "absolute";
      path: string;
    };
}

export function resolveOptions(
  options: LicensePluginOptions,
): ResolvedLicensePluginOptions {
  const output = resolveOutputPath(options.output.file);

  return {
    output,
  };
}
