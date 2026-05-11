import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
    pedantic: "error",
    perf: "error",
  },
  rules: {
    "eslint/no-restricted-globals": [
      "error",
      "__dirname",
      "__filename",
      "Buffer",
      "clearImmediate",
      "exports",
      "global",
      "module",
      "process",
      "require",
      "setImmediate",
    ],
    "eslint/curly": "error",
    "import/consistent-type-specifier-style": "error",
    "import/no-empty-named-blocks": "error",
    "unicorn/prefer-node-protocol": "error",
    "unicorn/no-null": "error",
    "unicorn/new-for-builtins": "error",
    "unicorn/no-array-for-each": "error",
    "unicorn/no-array-reverse": "error",
    "unicorn/no-instanceof-builtins": "error",
    "oxc/bad-bitwise-operator": "error",
    "oxc/no-map-spread": "error",
    "typescript/ban-ts-comment": "error",
    "typescript/ban-tslint-comment": "error",
    "typescript/no-explicit-any": "error",
  },
});
