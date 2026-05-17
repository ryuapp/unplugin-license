import { assert, assertEquals } from "@std/assert";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { assertSpyCall, assertSpyCalls, stub } from "jsr:@std/testing/mock";
import * as esbuild from "esbuild";
import License from "unplugin-license/esbuild";

Deno.test({
  name: "esbuild subpath export writes license output from bundled modules",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const testDir = import.meta.dirname;
    assert(testDir);
    const info = stub(console, "info");

    try {
      const result = await esbuild.build({
        entryPoints: [path.join(testDir, "example.ts")],
        bundle: true,
        write: false,
        format: "esm",
        tsconfigRaw: {},
        plugins: [
          License({
            output: {
              file: "NOTICE.md",
            },
          }),
        ],
      });

      const notice = result.outputFiles.find((file) =>
        path.basename(file.path) === "NOTICE.md"
      );
      assert(notice);

      const actual = notice.text;
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
      esbuild.stop();
    }
  },
});

Deno.test({
  name: "esbuild subpath export writes license output to file URL",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const testDir = import.meta.dirname;
    assert(testDir);
    const outputDir = await mkdtemp(path.join(tmpdir(), "unplugin-license-"));
    const outputFile = path.join(outputDir, "NOTICE.md");
    const outputUrl = pathToFileURL(outputFile).href;
    const info = stub(console, "info");

    try {
      await esbuild.build({
        entryPoints: [path.join(testDir, "example.ts")],
        bundle: true,
        write: true,
        format: "esm",
        outfile: path.join(outputDir, "entry.js"),
        tsconfigRaw: {},
        plugins: [
          License({
            output: {
              file: outputUrl,
            },
          }),
        ],
      });

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
      esbuild.stop();
      await rm(outputDir, { recursive: true, force: true });
    }
  },
});
