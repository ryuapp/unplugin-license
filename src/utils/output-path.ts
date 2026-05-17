import path from "node:path";
import { fileURLToPath } from "node:url";

export type ResolvedOutputPath =
  | {
    type: "relative";
    path: string;
  }
  | {
    type: "absolute";
    path: string;
  };

export function resolveOutputPath(file: string): ResolvedOutputPath {
  if (path.isAbsolute(file)) {
    throw new TypeError(
      'Absolute output.file paths are not supported. Use a file: URL, such as import.meta.resolve("./NOTICE.md").',
    );
  }

  const url = parseUrl(file);

  if (url?.protocol === "file:") {
    return {
      type: "absolute",
      path: fileURLToPath(url.href),
    };
  }

  if (url) {
    throw new TypeError(
      `Unsupported output.file URL protocol: ${url.protocol}`,
    );
  }

  return {
    type: "relative",
    path: file,
  };
}

function parseUrl(file: string): URL | undefined {
  if (!URL.canParse(file)) {
    return undefined;
  }

  return new URL(file);
}
