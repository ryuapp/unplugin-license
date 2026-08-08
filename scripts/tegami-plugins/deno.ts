import $ from "dax";
import {
  type PublishTaskRunContext,
  type PackagePublishTaskResult,
  type TegamiContext,
  type TegamiPlugin,
} from "tegami";
import {
  NpmPackage,
  NpmPublishTask,
} from "tegami/providers/npm";

class DenoNpmPublishTask extends NpmPublishTask {
  override async run(opts: PublishTaskRunContext): Promise<PackagePublishTaskResult> {
    if (opts.plan.options.dryRun) {
      await $`deno task publish --dry-run`.cwd(this.pkg.path);
      return { type: "published" };
    }

    return super.run(opts);
  }

  override async publish(): Promise<PackagePublishTaskResult> {
    await $`deno task publish`.cwd(this.pkg.path);
    return { type: "published" };
  }
}

export const denoPublishTaskPlugin: TegamiPlugin = {
  name: "deno-task-publish",
  init(this: TegamiContext) {
    const npmPlugin = this.plugins.find((plugin) => plugin.name === "npm");
    if (!npmPlugin) return;

    npmPlugin.publishTasks = ({ plan }) =>
      plan.getPackagesToPublish().map((pkg) =>
        pkg instanceof NpmPackage
          ? new DenoNpmPublishTask(pkg, "deno")
          : undefined
      );
  },
};
