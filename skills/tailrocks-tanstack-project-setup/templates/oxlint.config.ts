import { defineConfig } from "oxlint";

export default defineConfig({
  options: {
    typeAware: true,
  },
  plugins: ["typescript", "react", "unicorn", "import", "promise"],
  categories: {
    correctness: "error",
    suspicious: "error",
    perf: "warn",
  },
  rules: {
    "typescript/no-unsafe-assignment": "error",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "react/no-array-index-key": "error",
  },
});
