import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";
import license from "unplugin-license/rollup";

Deno.test({
  name: "rollup emits license output from bundled modules",
  async fn() {
    const testDir = import.meta.dirname;
    assert.ok(testDir);
    const entry = path.join(testDir, "example.ts");

    const bundle = await rollup({
      input: entry,
      plugins: [
        nodeResolve(),
        license({
          output: "NOTICE.md",
        }),
      ],
    });
    const { output } = await bundle.generate({
      format: "esm",
    });

    const notice = output.find((file) => file.fileName === "NOTICE.md");
    assert.equal(notice?.type, "asset");

    const actual = String(notice.source);
    const expected = await readFile(
      path.join(testDir, "EXPECTED_NOTICE.md"),
      "utf8",
    );

    assert.equal(actual, expected);
  },
});
