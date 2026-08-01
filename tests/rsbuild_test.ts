import { assert, assertEquals } from "@std/assert";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { assertSpyCall, assertSpyCalls, stub } from "jsr:@std/testing/mock";
import { createRsbuild } from "@rsbuild/core";
import License from "unplugin-license/rsbuild";

Deno.test({
  name: "rsbuild subpath export emits license output from bundled modules",
  async fn() {
    const testDir = import.meta.dirname;
    assert(testDir);

    const outputDir = await mkdtemp(path.join(tmpdir(), "unplugin-license-"));
    const info = stub(console, "info");

    try {
      const rsbuild = await createRsbuild({
        cwd: testDir,
        rsbuildConfig: {
          source: { entry: { index: path.join(testDir, "example.ts") } },
          output: { distPath: { root: outputDir } },
          plugins: [License({ output: { file: "NOTICE.md" } })],
        },
      });

      await rsbuild.build();

      const actual = await readFile(path.join(outputDir, "NOTICE.md"), "utf8");
      const expected = await readFile(
        path.join(testDir, "EXPECTED_NOTICE.md"),
        "utf8",
      );

      assertEquals(actual, expected);
      assertSpyCall(info, 0, {
        args: ["[unplugin-license] Generated NOTICE.md."],
      });
      assertSpyCalls(info, 1);
    } finally {
      info.restore();
      await rm(outputDir, { recursive: true, force: true });
    }
  },
});

Deno.test({
  name: "rsbuild subpath export writes license output to file URL",
  async fn() {
    const testDir = import.meta.dirname;
    assert(testDir);

    const outputDir = await mkdtemp(path.join(tmpdir(), "unplugin-license-"));
    const outputFile = path.join(outputDir, "NOTICE.md");
    const info = stub(console, "info");

    try {
      const rsbuild = await createRsbuild({
        cwd: testDir,
        rsbuildConfig: {
          source: { entry: { index: path.join(testDir, "example.ts") } },
          output: { distPath: { root: path.join(outputDir, "dist") } },
          plugins: [
            License({ output: { file: pathToFileURL(outputFile).href } }),
          ],
        },
      });

      await rsbuild.build();

      const actual = await readFile(outputFile, "utf8");
      const expected = await readFile(
        path.join(testDir, "EXPECTED_NOTICE.md"),
        "utf8",
      );

      assertEquals(actual, expected);
      assertSpyCall(info, 0, {
        args: [`[unplugin-license] Generated ${outputFile}.`],
      });
      assertSpyCalls(info, 1);
    } finally {
      info.restore();
      await rm(outputDir, { recursive: true, force: true });
    }
  },
});
