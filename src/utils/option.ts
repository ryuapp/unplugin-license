export interface LicensePluginOptions {
  /**
   * Generated asset file name.
   *
   * Relative paths are emitted as bundler assets.
   * Absolute paths are written directly to the filesystem.
   */
  output: string;
}

export interface ResolvedLicensePluginOptions {
  output: string;
}

export function resolveOptions(
  options: LicensePluginOptions,
): ResolvedLicensePluginOptions {
  return {
    output: options.output,
  };
}
