import nx from "@nx/eslint-plugin"
import simpleImportSort from "eslint-plugin-simple-import-sort"

export default [
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  {
    ignores: ["**/dist", "**/out-tsc", "pnpm-lock.yaml", "**/generated/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
      "**/*.cts",
      "**/*.mts",
      "**/*.js",
      "**/*.jsx",
      "**/*.cjs",
      "**/*.mjs",
    ],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side-effect imports (e.g. import "reflect-metadata")
            ["^\\u0000"],
            // Node.js built-ins — both `node:` protocol and unqualified names
            [
              "^node:",
              "^(assert|buffer|child_process|cluster|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|perf_hooks|process|querystring|readline|stream|string_decoder|timers|tls|tty|url|util|v8|vm|worker_threads|zlib)(/|$)",
            ],
            // External npm packages (everything except internal monorepo)
            ["^(?!@fleetrel/)@?\\w"],
            // Internal monorepo packages
            ["^@fleetrel/"],
            // Parent-directory relative imports (../../)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Same-directory relative imports (./)
            ["^\\.(?!/?$)", "^\\./?$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
]
