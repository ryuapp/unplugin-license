export interface LicensePluginOptions {
  /**
   * Output options for generated license notice.
   */
  output: {
    /**
     * Generated asset file name.
     *
     * Relative paths are emitted as bundler assets.
     * Absolute paths are written directly to the filesystem.
     */
    file: string;
  };
}

export interface ResolvedLicensePluginOptions {
  output: {
    file: string;
  };
}

export function resolveOptions(
  options: LicensePluginOptions,
): ResolvedLicensePluginOptions {
  return {
    output: {
      file: options.output.file,
    },
  };
}
