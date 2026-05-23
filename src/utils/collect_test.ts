import { assertEquals } from "@std/assert";
import { normalizeRepository } from "./collect.ts";

Deno.test({
  name: "normalizes GitHub repository URLs",
  fn() {
    assertEquals(
      normalizeRepository({
        type: "git",
        url: "git+https://github.com/ryuapp/unplugin-license.git",
      }),
      "https://github.com/ryuapp/unplugin-license",
    );
    assertEquals(
      normalizeRepository({
        type: "git",
        url: "git://github.com/ryuapp/unplugin-license.git",
      }),
      "https://github.com/ryuapp/unplugin-license",
    );
    assertEquals(
      normalizeRepository("ryuapp/unplugin-license"),
      "https://github.com/ryuapp/unplugin-license",
    );
    assertEquals(
      normalizeRepository("github:ryuapp/unplugin-license"),
      "https://github.com/ryuapp/unplugin-license",
    );
    assertEquals(
      normalizeRepository({
        url: "https://github.com/ryuapp/unplugin-license.git",
      }),
      "https://github.com/ryuapp/unplugin-license",
    );
    assertEquals(
      normalizeRepository({
        type: "git",
        url: "git+https://example.test/ryuapp/unplugin-license.git",
      }),
      "https://example.test/ryuapp/unplugin-license.git",
    );
  },
});
