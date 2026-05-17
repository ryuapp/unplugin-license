import { assertEquals, assertThrows } from "@std/assert";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { resolveOutputPath } from "./output-path.ts";

Deno.test({
  name: "keeps relative output file as bundled asset",
  fn() {
    assertEquals(resolveOutputPath("NOTICE.md"), {
      type: "relative",
      path: "NOTICE.md",
    });
  },
});

Deno.test({
  name: "resolves file URL output file to filesystem path",
  fn() {
    const filePath = path.resolve("NOTICE.md");
    const file = pathToFileURL(filePath).href;

    assertEquals(resolveOutputPath(file), {
      type: "absolute",
      path: filePath,
    });
  },
});

Deno.test({
  name: "rejects absolute filesystem output file",
  fn() {
    assertThrows(
      () => resolveOutputPath(path.resolve("NOTICE.md")),
      TypeError,
      "Absolute output.file paths are not supported.",
    );
  },
});

Deno.test({
  name: "rejects non-file URL output file",
  fn() {
    assertThrows(
      () => resolveOutputPath("https://example.com/NOTICE.md"),
      TypeError,
      "Unsupported output.file URL protocol: https:",
    );
  },
});
