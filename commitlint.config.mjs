export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 110],
    "subject-case": [0],
  },
  ignores: [(commit) => commit.startsWith("Merge")],
}
