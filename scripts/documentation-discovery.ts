import path from "node:path";

export const documentationDiscoverySchema = "tailrocks.documentation-discovery/v1" as const;

export interface DocumentationTreeEntry {
  readonly revision: "base" | "head";
  readonly mode: string;
  readonly type: "blob" | "commit";
  readonly path: string;
}

export interface DocumentationSurface {
  readonly kind: "docs_tree" | "site_project" | "readme_set" | "api_reference";
  readonly root: string;
  readonly states: readonly ("base" | "head")[];
  readonly content: readonly string[];
  readonly rules: readonly string[];
  readonly navigation: readonly string[];
  readonly generator_markers: readonly string[];
  readonly command_sources: readonly string[];
}

export interface DocumentationDiscovery {
  readonly schema: typeof documentationDiscoverySchema;
  readonly surfaces: readonly DocumentationSurface[];
  readonly documentation_paths: readonly string[];
  readonly unmatched_candidates: readonly string[];
  readonly entries_scanned: number;
}

const maximumEntries = 20_000;
const maximumDocumentationPaths = 5_000;
const docsDirectory = /^(?:docs?|documentation|wiki)$/i;
const readme = /^(?:readme|install|contributing|changelog)(?:\.[^.]+)?\.(?:md|mdx|rst|adoc)$/i;
const apiReference =
  /^(?:(?:openapi|asyncapi)(?:\.[^.]+)?\.(?:json|ya?ml)|(?:schema|api)\.(?:graphql|gql|proto))$/i;
const siteMarker =
  /^(?:docusaurus\.config\.[^.]+|mkdocs\.ya?ml|book\.toml|source\.config\.[^.]+|docs\.config\.[^.]+)$/i;
const navigation = /^(?:sidebars?\.[^.]+|_sidebar\.md|summary\.md|docs\.json|mint\.json|meta\.json)$/i;
const instruction = /^(?:agents|contributing)(?:\.[^.]+)?\.(?:md|mdx|rst|adoc)$/i;
const clientInstructionLink = /^(?:claude|gemini)\.md$/i;
const commandSource = /^(?:package\.json|mise\.toml|makefile|justfile|taskfile\.ya?ml|cargo\.toml)$/i;
const prose = /\.(?:md|mdx|rst|adoc)$/i;

function safePath(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 4_096 &&
    !value.startsWith("/") &&
    !value.includes("\\") &&
    !value.includes("\0") &&
    value.split("/").every((part) => part !== "" && part !== "." && part !== "..")
  );
}

function ancestors(root: string): string[] {
  if (root === ".") return ["."];
  const parts = root.split("/");
  return [".", ...parts.map((_, index) => parts.slice(0, index + 1).join("/"))];
}

function inside(pathname: string, root: string): boolean {
  return root === "." || pathname === root || pathname.startsWith(`${root}/`);
}

function nearestDocsRoot(pathname: string): string | undefined {
  const parts = pathname.split("/");
  const index = parts.findIndex((part) => docsDirectory.test(part));
  return index < 0 ? undefined : parts.slice(0, index + 1).join("/");
}

function addSeed(
  seeds: Map<string, { kind: DocumentationSurface["kind"]; root: string; exacts: Set<string> }>,
  kind: DocumentationSurface["kind"],
  root: string,
  exact?: string,
): void {
  const key = `${kind}\0${root}`;
  const current = seeds.get(key);
  if (current) {
    if (exact) current.exacts.add(exact);
  } else {
    seeds.set(key, { kind, root, exacts: new Set(exact ? [exact] : []) });
  }
}

function ownedBySurface(
  pathname: string,
  seed: { kind: DocumentationSurface["kind"]; root: string; exacts: ReadonlySet<string> },
): boolean {
  const basename = path.posix.basename(pathname);
  if (seed.kind === "docs_tree") return inside(pathname, seed.root);
  if (seed.kind === "readme_set") return path.posix.dirname(pathname) === seed.root && readme.test(basename);
  if (seed.kind === "api_reference")
    return path.posix.dirname(pathname) === seed.root && apiReference.test(basename);
  return (
    seed.exacts.has(pathname) ||
    (path.posix.dirname(pathname) === seed.root &&
      (navigation.test(basename) || siteMarker.test(basename))) ||
    inside(pathname, seed.root === "." ? "content" : `${seed.root}/content`) ||
    nearestDocsRoot(pathname)?.startsWith(seed.root === "." ? "" : `${seed.root}/`) === true
  );
}

export function discoverDocumentation(entries: readonly DocumentationTreeEntry[]): DocumentationDiscovery {
  if (entries.length > maximumEntries) throw new Error("documentation tree inventory is saturated");
  const seen = new Set<string>();
  const ordered = [...entries].sort((left, right) =>
    left.path === right.path
      ? left.revision.localeCompare(right.revision)
      : left.path.localeCompare(right.path),
  );
  for (const entry of ordered) {
    if (!safePath(entry.path)) throw new Error("documentation tree path is unsafe");
    const key = `${entry.revision}\0${entry.path}`;
    if (seen.has(key)) throw new Error("documentation tree path is duplicated");
    seen.add(key);
  }
  // The agent-topology gate owns the target proof for these client links.
  // Keep their symlink mode out of documentation surfaces while rejecting all
  // other unsafe documentation tree entries below.
  const documentationEntries = ordered.filter(
    (entry) =>
      !(
        entry.type === "blob" &&
        entry.mode === "120000" &&
        clientInstructionLink.test(path.posix.basename(entry.path))
      ),
  );
  const regular = documentationEntries.filter(
    (entry) => entry.type === "blob" && ["100644", "100755"].includes(entry.mode),
  );
  const seeds = new Map<string, { kind: DocumentationSurface["kind"]; root: string; exacts: Set<string> }>();
  const unmatched = new Set<string>();
  for (const entry of documentationEntries) {
    const basename = path.posix.basename(entry.path);
    const root = path.posix.dirname(entry.path);
    const docsRoot = nearestDocsRoot(entry.path);
    const candidate =
      docsRoot ||
      readme.test(basename) ||
      apiReference.test(basename) ||
      siteMarker.test(basename) ||
      navigation.test(basename) ||
      instruction.test(basename) ||
      commandSource.test(basename);
    if (candidate && (entry.type !== "blob" || !["100644", "100755"].includes(entry.mode))) {
      unmatched.add(entry.path);
      continue;
    }
    if (docsRoot) addSeed(seeds, "docs_tree", docsRoot);
    if (siteMarker.test(basename)) addSeed(seeds, "site_project", root, entry.path);
    if (readme.test(basename) && !docsRoot) addSeed(seeds, "readme_set", root, entry.path);
    if (apiReference.test(basename) && !docsRoot) addSeed(seeds, "api_reference", root, entry.path);
  }
  if (unmatched.size > 0)
    throw new Error(`documentation candidates have unsafe tree modes: ${[...unmatched].sort().join(", ")}`);
  const unsafeOwned = documentationEntries
    .filter(
      (entry) =>
        (entry.type !== "blob" || !["100644", "100755"].includes(entry.mode)) &&
        [...seeds.values()].some((seed) => ownedBySurface(entry.path, seed)),
    )
    .map((entry) => entry.path);
  if (unsafeOwned.length > 0)
    throw new Error(
      `documentation surfaces have unsafe tree modes: ${[...new Set(unsafeOwned)].sort().join(", ")}`,
    );

  const documentationPaths = new Set<string>();
  const surfaces = [...seeds.values()]
    .map((seed): DocumentationSurface => {
      const files = regular.filter((entry) => {
        return ownedBySurface(entry.path, seed);
      });
      const content = [
        ...new Set(
          files
            .filter((entry) => prose.test(entry.path) || apiReference.test(path.posix.basename(entry.path)))
            .map((entry) => entry.path),
        ),
      ].sort();
      const markerFiles = [
        ...new Set(
          files
            .filter((entry) => siteMarker.test(path.posix.basename(entry.path)))
            .map((entry) => entry.path),
        ),
      ].sort();
      const navFiles = [
        ...new Set(
          files
            .filter((entry) => navigation.test(path.posix.basename(entry.path)))
            .map((entry) => entry.path),
        ),
      ].sort();
      const scopes = new Set(ancestors(seed.root));
      const rules = [
        ...new Set(
          regular
            .filter((entry) => {
              const directory = path.posix.dirname(entry.path);
              return (
                instruction.test(path.posix.basename(entry.path)) &&
                (scopes.has(directory) ||
                  (["docs_tree", "site_project"].includes(seed.kind) && inside(entry.path, seed.root)))
              );
            })
            .map((entry) => entry.path),
        ),
      ].sort();
      const commandSources = [
        ...new Set(
          regular
            .filter((entry) => {
              const directory = path.posix.dirname(entry.path);
              return commandSource.test(path.posix.basename(entry.path)) && scopes.has(directory);
            })
            .map((entry) => entry.path),
        ),
      ].sort();
      for (const pathname of files.map((entry) => entry.path)) documentationPaths.add(pathname);
      if (["docs_tree", "site_project"].includes(seed.kind) && seed.root !== ".") {
        for (const pathname of [...rules, ...commandSources]) {
          if (inside(pathname, seed.root)) documentationPaths.add(pathname);
        }
      }
      const states = [...new Set(files.map((entry) => entry.revision))].sort() as ("base" | "head")[];
      return {
        kind: seed.kind,
        root: seed.root,
        states,
        content,
        rules,
        navigation: navFiles,
        generator_markers: markerFiles,
        command_sources: commandSources,
      };
    })
    .sort((left, right) =>
      left.root === right.root ? left.kind.localeCompare(right.kind) : left.root.localeCompare(right.root),
    );
  if (documentationPaths.size > maximumDocumentationPaths)
    throw new Error("documentation path set is saturated");
  const unmatchedCandidates = [
    ...new Set(
      regular
        .filter(
          (entry) =>
            prose.test(entry.path) &&
            !documentationPaths.has(entry.path) &&
            !instruction.test(path.posix.basename(entry.path)) &&
            !entry.path.startsWith(".github/") &&
            !entry.path.startsWith("roadmap/") &&
            !entry.path.startsWith("delivery/"),
        )
        .map((entry) => entry.path),
    ),
  ].sort();
  return {
    schema: documentationDiscoverySchema,
    surfaces,
    documentation_paths: [...documentationPaths].sort(),
    unmatched_candidates: unmatchedCandidates,
    entries_scanned: entries.length,
  };
}
