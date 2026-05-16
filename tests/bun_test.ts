import { assert, assertEquals } from "@std/assert";
import { readFile } from "node:fs/promises";
import path from "node:path";

const testName = "bun writes license output from bundled modules";
const isBun = navigator.userAgent.startsWith("Bun/");

if (isBun) {
  const { afterEach, beforeEach, test } = await import("bun:test");
  let infoCalls: unknown[][] = [];
  let restoreInfo: (() => void) | undefined;

  beforeEach(() => {
    infoCalls = [];
    const originalInfo = console.info;

    console.info = (...args: unknown[]) => {
      infoCalls.push(args);
    };
    restoreInfo = () => {
      console.info = originalInfo;
    };
  });

  afterEach(() => {
    restoreInfo?.();
    restoreInfo = undefined;
  });

  test(testName, async () => {
    const testDir = import.meta.dirname;
    assert(testDir);

    const { default: license } = await import("../src/bun.ts");

    const result = await Bun.build({
      entrypoints: [path.join(testDir, "example.ts")],
      plugins: [
        license({
          output: {
            file: "NOTICE.md",
          },
        }),
      ],
    });

    assertEquals(result.success, true);

    const notice = result.outputs.find((file) =>
      path.basename(file.path) === "NOTICE.md"
    );
    assert(notice);

    const actual = await notice.text();
    const expected = await readFile(
      path.join(testDir, "EXPECTED_NOTICE.md"),
      "utf8",
    );

    assertEquals(actual, expected);
    assertEquals(infoCalls, [["[unplugin-license] Generated NOTICE.md."]]);
  });
}
