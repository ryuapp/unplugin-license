import path from "node:path";
import { fileURLToPath } from "node:url";

const packageJsonPath = fileURLToPath(
  import.meta.resolve("deno-test/package.json"),
);
const binPath = path.join(
  path.dirname(packageJsonPath),
  "bin",
  "deno-test.mjs",
);
const command = new Deno.Command("node", {
  args: [binPath, ...Deno.args],
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});
const status = await command.spawn().status;

Deno.exit(status.code);
