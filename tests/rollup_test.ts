import { assert, assertEquals } from "@std/assert";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assertSpyCall, assertSpyCalls, stub } from "jsr:@std/testing/mock";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";
import license from "unplugin-license/rollup";

Deno.test({
  name: "rollup emits license output from bundled modules",
  async fn() {
    const testDir = import.meta.dirname;
    assert(testDir);
    const entry = path.join(testDir, "example.ts");
    const info = stub(console, "info");

    try {
      const bundle = await rollup({
        input: entry,
        plugins: [
          nodeResolve(),
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
      assert(notice?.type === "asset");

      const actual = String(notice.source);
      const expected = await readFile(
        path.join(testDir, "EXPECTED_NOTICE.md"),
        "utf8",
      );

      assertEquals(actual, expected);
      assertSpyCall(info, 0, {
        args: ["[plugin unplugin-license] Generated NOTICE.md."],
      });
      assertSpyCalls(info, 1);
    } finally {
      info.restore();
    }
  },
});
