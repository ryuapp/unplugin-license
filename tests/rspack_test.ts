import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { rspack } from "@rspack/core";
import { createFsFromVolume, Volume } from "memfs";
import license from "unplugin-license/rspack";

type MemfsVolume = InstanceType<typeof Volume>;

Deno.test({
  name: "rspack emits license output from bundled modules",
  async fn() {
    const testDir = import.meta.dirname;
    assert.ok(testDir);

    const volume = new Volume();
    const compiler = rspack({
      mode: "production",
      context: testDir,
      entry: path.join(testDir, "example.ts"),
      plugins: [license({ output: "NOTICE.md" })],
    });
    compiler.outputFileSystem = createFsFromVolume(
      volume,
    ) as typeof compiler.outputFileSystem;

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
    await promise;

    const dist = readVolumeFiles(volume, compiler.outputPath);
    const actual = dist.get("NOTICE.md");
    assert.ok(actual);

    const expected = await readFile(
      path.join(testDir, "EXPECTED_NOTICE.md"),
      "utf8",
    );

    assert.equal(actual, expected);
  },
});

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
