import { tegami } from "tegami";
import { runCli } from "tegami/cli";
import { github } from "tegami/plugins/github";
import { denoPublishTaskPlugin } from "./tegami-plugins/deno.ts";

const paper = tegami({
  conventionalCommits: true,
  npm: {
    updateLockFile: false,
  },
  plugins: [
    denoPublishTaskPlugin,
    github({
      repo: "ryuapp/unplugin-license",
      versionPr: {
        base: "main",
        create() {
          return {
            title: "chore(release): version packages",
          };
        },
      },
    }),
  ],
});

await runCli(paper);
