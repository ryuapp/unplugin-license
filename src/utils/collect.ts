import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import type { ResolvedLicensePluginOptions } from "./option.ts";
import type { LicenseEntry } from "./render.ts";

interface PackageJson {
  name?: string;
  version?: string;
  private?: boolean;
  license?: string | { type?: string };
  licenses?: Array<string | { type?: string }>;
  repository?: string | { url?: string };
  homepage?: string;
}

export type Bundle = Record<
  string,
  { type: string; modules?: Record<string, unknown> }
>;

const LICENSE_FILE_PATTERN = /^(licen[cs]e|notice)(\..*)?$/iu;
const GITHUB_SHORTHAND_PATTERN = /^[^/\s]+\/[^/\s]+$/u;

export function collectLicensesFromBundle(
  options: ResolvedLicensePluginOptions,
  bundle: Bundle,
): LicenseEntry[] {
  const moduleIds = Object.values(bundle).flatMap((output) => {
    if (output.type !== "chunk") {
      return [];
    }

    return Object.keys(output.modules ?? {});
  });

  return collectLicensesFromModuleIds(options, moduleIds);
}

export function collectLicensesFromModuleIds(
  _options: ResolvedLicensePluginOptions,
  moduleIds: Iterable<string>,
): LicenseEntry[] {
  const entries = new Map<string, LicenseEntry>();

  for (const moduleId of moduleIds) {
    const packagePath = findPackageJsonForModule(moduleId);

    if (!packagePath) {
      continue;
    }

    const packageJson = readPackageJson(packagePath);

    if (packageJson.name && packageJson.version && !packageJson.private) {
      entries.set(
        `${packageJson.name}@${packageJson.version}`,
        createLicenseEntry(packageJson, path.dirname(packagePath)),
      );
    }
  }

  return sortLicenseEntries(entries);
}

function findPackageJsonForModule(moduleId: string): string | undefined {
  if (
    !moduleId.includes("/node_modules/") &&
    !moduleId.includes("\\node_modules\\")
  ) {
    return undefined;
  }

  let current = path.dirname(realpath(moduleId));

  while (true) {
    const candidate = path.join(current, "package.json");

    if (existsSync(candidate)) {
      const packageJson = readPackageJson(candidate);

      if (packageJson.name && packageJson.version) {
        return candidate;
      }
    }

    const parent = path.dirname(current);

    if (parent === current || current.endsWith(`${path.sep}node_modules`)) {
      return undefined;
    }

    current = parent;
  }
}

function createLicenseEntry(
  packageJson: PackageJson,
  packageDir: string,
): LicenseEntry {
  return {
    name: packageJson.name ?? "",
    version: packageJson.version ?? "",
    license: normalizeLicense(packageJson),
    repository: normalizeRepository(packageJson.repository),
    homepage: packageJson.homepage,
    licenseText: readLicenseText(packageDir),
  };
}

function sortLicenseEntries(
  entries: Map<string, LicenseEntry>,
): LicenseEntry[] {
  return [...entries.values()].sort((a, b) => {
    const nameOrder = a.name.localeCompare(b.name);
    return nameOrder === 0 ? a.version.localeCompare(b.version) : nameOrder;
  });
}

function realpath(filePath: string): string {
  try {
    return realpathSync(filePath);
  } catch {
    return filePath;
  }
}

function readPackageJson(filePath: string): PackageJson {
  return JSON.parse(readFileSync(filePath, "utf8")) as PackageJson;
}

function normalizeLicense(packageJson: PackageJson): string {
  if (typeof packageJson.license === "string") {
    return packageJson.license;
  }

  if (packageJson.license?.type) {
    return packageJson.license.type;
  }

  if (packageJson.licenses?.length) {
    return packageJson.licenses
      .map((license) => (typeof license === "string" ? license : license.type))
      .filter(Boolean)
      .join(", ");
  }

  return "UNKNOWN";
}

function normalizeRepository(
  repository: PackageJson["repository"],
): string | undefined {
  if (typeof repository === "string") {
    return normalizeRepositoryUrl(repository);
  }

  return repository?.url ? normalizeRepositoryUrl(repository.url) : undefined;
}

function normalizeRepositoryUrl(repository: string): string {
  if (GITHUB_SHORTHAND_PATTERN.test(repository)) {
    return `https://github.com/${repository}`;
  }

  return repository;
}

function readLicenseText(packageDir: string): string | undefined {
  const fileName = readdirSync(packageDir).find((entry) =>
    LICENSE_FILE_PATTERN.test(entry)
  );

  if (!fileName) {
    return undefined;
  }

  return readFileSync(path.join(packageDir, fileName), "utf8").trim();
}
