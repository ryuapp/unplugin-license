import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const testName = "bun writes license output from bundled modules";
const isBun = navigator.userAgent.startsWith("Bun/");

if (isBun) {
  const { afterEach, beforeEach, expect, test } = await import("bun:test");
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
    expect(testDir).toBeDefined();

    const { default: license } = await import("../src/bun.ts");

    const result = await Bun.build({
      entrypoints: [path.join(testDir!, "example.ts")],
      plugins: [
        license({
          output: {
            file: "NOTICE.md",
          },
        }),
      ],
    });

    expect(result.success).toBe(true);

    const notice = result.outputs.find((file) =>
      path.basename(file.path) === "NOTICE.md"
    );
    expect(notice).toBeDefined();

    const actual = await notice!.text();
    const expected = await readFile(
      path.join(testDir!, "EXPECTED_NOTICE.md"),
      "utf8",
    );

    expect(actual).toBe(expected);
    expect(infoCalls).toEqual([["[unplugin-license] Generated NOTICE.md."]]);
  });

  test("bun writes license output to file URL", async () => {
    const testDir = import.meta.dirname;
    expect(testDir).toBeDefined();

    const outputDir = await mkdtemp(path.join(tmpdir(), "unplugin-license-"));
    const outputFile = path.join(outputDir, "NOTICE.md");
    const outputUrl = pathToFileURL(outputFile).href;
    const { default: license } = await import("../src/bun.ts");

    try {
      const result = await Bun.build({
        entrypoints: [path.join(testDir!, "example.ts")],
        outdir: path.join(outputDir, "dist"),
        plugins: [
          license({
            output: {
              file: outputUrl,
            },
          }),
        ],
      });

      expect(result.success).toBe(true);

      const actual = await readFile(outputFile, "utf8");
      const expected = await readFile(
        path.join(testDir!, "EXPECTED_NOTICE.md"),
        "utf8",
      );

      expect(actual).toBe(expected);
      expect(infoCalls).toEqual([[
        `[unplugin-license] Generated ${outputFile}.`,
      ]]);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });
}
