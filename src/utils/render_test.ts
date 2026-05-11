import assert from "node:assert/strict";
import { renderLicenseFile } from "./render.ts";
import type { LicenseEntry } from "./render.ts";

Deno.test({
  name: "renders header without entries",
  fn() {
    assert.equal(
      renderLicenseFile([]),
      "# NOTICES AND INFORMATION\n\nThis project includes third-party licenses.\\\nPlease see the details below.\n",
    );
  },
});

Deno.test({
  name: "renders package metadata",
  fn() {
    assert.equal(
      renderLicenseFile([
        entry({
          name: "alpha",
          version: "1.0.0",
          license: "MIT",
          repository: "https://example.test/alpha.git",
          homepage: "https://example.test/alpha",
        }),
      ]),
      [
        "# NOTICES AND INFORMATION",
        "",
        "This project includes third-party licenses.\\",
        "Please see the details below.",
        "",
        "## alpha@1.0.0",
        "",
        "- License: MIT",
        "- Repository: https://example.test/alpha.git",
        "- Homepage: https://example.test/alpha",
        "",
      ].join("\n"),
    );
  },
});

Deno.test({
  name: "renders license text as txt code block",
  fn() {
    assert.equal(
      renderLicenseFile([
        entry({
          name: "beta",
          version: "2.0.0",
          license: "Apache-2.0",
          licenseText: "Beta license text",
        }),
      ]),
      [
        "# NOTICES AND INFORMATION",
        "",
        "This project includes third-party licenses.\\",
        "Please see the details below.",
        "",
        "## beta@2.0.0",
        "",
        "- License: Apache-2.0",
        "",
        "### License",
        "",
        "```txt",
        "Beta license text",
        "```",
        "",
      ].join("\n"),
    );
  },
});

Deno.test({
  name: "separates multiple entries with a blank line",
  fn() {
    assert.equal(
      renderLicenseFile([
        entry({ name: "alpha", version: "1.0.0", license: "MIT" }),
        entry({ name: "beta", version: "2.0.0", license: "ISC" }),
      ]),
      [
        "# NOTICES AND INFORMATION",
        "",
        "This project includes third-party licenses.\\",
        "Please see the details below.",
        "",
        "## alpha@1.0.0",
        "",
        "- License: MIT",
        "",
        "## beta@2.0.0",
        "",
        "- License: ISC",
        "",
      ].join("\n"),
    );
  },
});

function entry(input: Partial<LicenseEntry> & Pick<LicenseEntry, "name">) {
  return {
    version: input.version ?? "0.0.0",
    license: input.license ?? "UNKNOWN",
    repository: input.repository,
    homepage: input.homepage,
    licenseText: input.licenseText,
    ...input,
  };
}
