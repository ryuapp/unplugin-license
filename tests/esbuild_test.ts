import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as esbuild from "esbuild";
import license from "unplugin-license/esbuild";

Deno.test({
  name: "esbuild writes license output from bundled modules",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const testDir = import.meta.dirname;
    assert.ok(testDir);

    try {
      const result = await esbuild.build({
        entryPoints: [path.join(testDir, "example.ts")],
        bundle: true,
        write: false,
        format: "esm",
        plugins: [
          license({
            output: "NOTICE.md",
          }),
        ],
      });

      const notice = result.outputFiles.find((file) =>
        path.basename(file.path) === "NOTICE.md"
      );
      assert.ok(notice);

      const actual = notice.text;
      const expected = await readFile(
        path.join(testDir, "EXPECTED_NOTICE.md"),
        "utf8",
      );

      assert.equal(actual, expected);
    } finally {
      esbuild.stop();
    }
  },
});
