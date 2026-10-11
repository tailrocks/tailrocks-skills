/** @type {import("dependency-cruiser").IConfiguration} */
export default {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-unresolved",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "domain-stays-inward",
      severity: "error",
      from: { path: "^src/domain" },
      to: { path: "^src/(routes|features|server|adapters|components)" },
    },
    {
      name: "inward-modules-do-not-import-routes",
      severity: "error",
      from: { path: "^src/(domain|features|server|adapters|components)" },
      to: { path: "^src/routes" },
    },
    {
      name: "ui-primitives-have-no-product-dependencies",
      severity: "error",
      from: { path: "^src/components/ui" },
      to: { path: "^src/(routes|features|server|adapters|domain)" },
    },
    {
      name: "production-does-not-import-tests",
      severity: "error",
      from: { path: "^src" },
      to: { path: "^(test|src/.+\\.(test|spec)\\.)" },
    },
    {
      name: "feature-consumers-use-entry-points",
      severity: "error",
      from: { pathNot: "^src/features" },
      to: {
        path: "^src/features/[^/]+/",
        pathNot: "^src/features/[^/]+/(index|public)\\.(ts|tsx)$",
      },
    },
  ],
  options: {
    includeOnly: "^src",
    exclude: "(^|/)routeTree\\.gen\\.ts$",
    tsConfig: { fileName: "./tsconfig.json" },
    tsPreCompilationDeps: true,
  },
};
