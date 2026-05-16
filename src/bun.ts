import { resolveOptions } from "./utils/option.ts";
import { createBunPlugin } from "./plugins/bun.ts";
import type { LicensePluginOptions } from "./utils/option.ts";

export default function plugin(options: LicensePluginOptions): Bun.BunPlugin {
  return createBunPlugin(resolveOptions(options));
}
