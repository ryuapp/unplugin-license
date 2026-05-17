import { assert, assertEquals } from "@std/assert";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { assertSpyCall, assertSpyCalls, stub } from "jsr:@std/testing/mock";
import { rspack } from "@rspack/core";
import type { Compiler } from "@rspack/core";
import { createFsFromVolume, Volume } from "memfs";
import License from "unplugin-license/rspack";

type MemfsVolume = InstanceType<typeof Volume>;

Deno.test({
  name: "rspack subpath export emits license output from bundled modules",
  async fn() {
    const testDir = import.meta.dirname;
    assert(testDir);

    const volume = new Volume();
    const info = stub(console, "info");
    const compiler = rspack({
      mode: "production",
      context: testDir,
      entry: path.join(testDir, "example.ts"),
      plugins: [License({ output: { file: "NOTICE.md" } })],
    });
    compiler.outputFileSystem = createFsFromVolume(
      volume,
    ) as typeof compiler.outputFileSystem;

    try {
      await runCompiler(compiler);

      const dist = readVolumeFiles(volume, compiler.outputPath);
      const actual = dist.get("NOTICE.md");
      assert(actual);

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
    }
  },
});

Deno.test({
  name: "rspack subpath export writes license output to file URL",
  async fn() {
    const testDir = import.meta.dirname;
    assert(testDir);

    const outputDir = await mkdtemp(path.join(tmpdir(), "unplugin-license-"));
    const outputFile = path.join(outputDir, "NOTICE.md");
    const outputUrl = pathToFileURL(outputFile).href;
    const info = stub(console, "info");
    const compiler = rspack({
      mode: "production",
      context: testDir,
      entry: path.join(testDir, "example.ts"),
      output: {
        path: path.join(outputDir, "dist"),
      },
      plugins: [License({ output: { file: outputUrl } })],
    });

    try {
      await runCompiler(compiler);

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

function runCompiler(compiler: Compiler): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();

  compiler.run((error, stats) => {
    compiler.close((closeError) => {
      if (error) {
        reject(error);
        return;
      }

      if (closeError) {
        reject(closeError);
        return;
      }

      if (stats?.hasErrors()) {
        reject(new Error(stats.toString(false)));
        return;
      }

      resolve();
    });
  });

  return promise;
}

function readVolumeFiles(
  volume: MemfsVolume,
  outputPath: string,
): Map<string, string> {
  const fileNames = volume.readdirSync(outputPath) as string[];

  return new Map(
    fileNames.map((name) => {
      const source = volume.readFileSync(
        path.join(outputPath, name),
        "utf8",
      );

      return [name, source.toString()];
    }),
  );
}
