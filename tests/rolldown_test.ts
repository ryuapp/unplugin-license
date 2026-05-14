import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assertSpyCall, assertSpyCalls, stub } from "jsr:@std/testing/mock";
import { rolldown } from "rolldown";
import license from "unplugin-license/rolldown";

Deno.test({
  name: "rolldown emits license output from bundled modules",
  async fn() {
    const testDir = import.meta.dirname;
    assert.ok(testDir);
    const entry = path.join(testDir, "example.ts");
    const info = stub(console, "info");

    try {
      const bundle = await rolldown({
        input: entry,
        plugins: [
          license({
            output: {
              file: "NOTICE.md",
            },
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
      assertSpyCall(info, 0, {
        args: ["(unplugin-license plugin) Generated NOTICE.md."],
      });
      assertSpyCalls(info, 1);
    } finally {
      info.restore();
    }
  },
});
