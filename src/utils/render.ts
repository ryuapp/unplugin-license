export interface LicenseEntry {
  name: string;
  version: string;
  license: string;
  repository: string | undefined;
  homepage: string | undefined;
  licenseText: string | undefined;
}

export function renderLicenseFile(entries: LicenseEntry[]): string {
  const header = [
    "# NOTICES AND INFORMATION",
    "",
    "This project includes third-party licenses.\\",
    "Please see the details below.",
  ].join("\n");
  const body = entries.map((entry) => renderEntry(entry)).join("\n\n");

  return body ? `${header}\n\n${body}\n` : `${header}\n`;
}

function renderEntry(entry: LicenseEntry): string {
  const lines = [
    `## ${entry.name}@${entry.version}`,
    "",
    `- License: ${entry.license}`,
  ];

  if (entry.repository) {
    lines.push(`- Repository: ${entry.repository}`);
  }

  if (entry.homepage) {
    lines.push(`- Homepage: ${entry.homepage}`);
  }

  if (entry.licenseText) {
    lines.push("", "### License", "", "```txt", entry.licenseText, "```");
  }

  return lines.join("\n");
}
