import { runBoundedCommand } from "../../../scripts/bounded-command";

type Envelope = {
  schema: "tailrocks.github-recon/v1";
  outcome: "success" | "refused" | "failed";
  code: "scanned" | "invalid_arguments" | "lookup_failed";
  command: string;
  ok: boolean;
  data: unknown;
  warnings: string[];
  errors: string[];
  mutations: [];
  detail: string;
};

const args = Bun.argv.slice(2);
const [command = "", rawRepo = "", subject = ""] = args;
const normalized = rawRepo
  .replace(/^https?:\/\/github\.com\//, "")
  .replace(/\.git$/, "")
  .replace(/\/$/, "");
const repo = normalized.split("/").slice(0, 2).join("/");
const errors: string[] = [];
const warnings: string[] = [];
const subjectCommands = new Set(["issue", "issue-comments", "related-prs"]);
const knownCommands = new Set([
  "repo-scan",
  "ai-policy",
  "legal",
  "liveness",
  "issue",
  "issue-comments",
  "related-prs",
  "prs-closed",
  "templates-issue",
  "templates-pr",
  "commit-log",
  "pr-stats",
  "codeowners",
  "pr-caps",
]);
const argumentsValid =
  knownCommands.has(command) &&
  args.length === (subjectCommands.has(command) ? 3 : 2) &&
  (!subjectCommands.has(command) || (subject.length > 0 && subject.length <= 1_000)) &&
  (!new Set(["issue", "issue-comments"]).has(command) || /^[1-9]\d*$/.test(subject));

async function api(endpoint: string): Promise<unknown | null> {
  const result = await runBoundedCommand({ command: ["gh", "api", endpoint], cwd: process.cwd() });
  if (result.code !== 0 || result.timedOut) {
    errors.push(`${endpoint}: ${result.stderr.trim() || `gh exited ${result.code}`}`);
    return null;
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    errors.push(`${endpoint}: invalid JSON from gh`);
    return null;
  }
}

async function optional(endpoint: string): Promise<unknown | null> {
  const before = errors.length;
  const value = await api(endpoint);
  if (value === null) {
    warnings.push(errors.splice(before).join("; "));
  }
  return value;
}

async function repoFile(path: string): Promise<unknown | null> {
  return optional(`repos/${repo}/contents/${path}`);
}

async function run(): Promise<unknown> {
  if (!argumentsValid) {
    errors.push("invalid or unmatched command arguments");
    return {};
  }
  if (!/^[^/]+\/[^/]+$/.test(repo) || (!rawRepo.includes("github.com") && rawRepo.includes("://"))) {
    errors.push("target is not a GitHub owner/repo; detect and follow its documented channel");
    return {};
  }
  if (!command) {
    errors.push("missing subcommand");
    return {};
  }
  switch (command) {
    case "repo-scan": {
      const metadata = await api(`repos/${repo}`);
      if (!metadata) return {};
      const paths = [
        "CONTRIBUTING.md",
        "CODE_OF_CONDUCT.md",
        "SECURITY.md",
        "LICENSE",
        "AI_POLICY.md",
        "DCO",
        "MAINTAINERS",
        "CODEOWNERS",
        ".github/CODEOWNERS",
        ".github/ISSUE_TEMPLATE",
        ".github/PULL_REQUEST_TEMPLATE.md",
        ".github/workflows",
        "AGENTS.md",
        "CLAUDE.md",
        ".cursorrules",
      ];
      const found: string[] = [];
      const missing: string[] = [];
      await Promise.all(
        paths.map(async (path) => {
          (await repoFile(path)) ? found.push(path) : missing.push(path);
        }),
      );
      return { metadata, found: found.sort(), missing: missing.sort() };
    }
    case "ai-policy":
      return {
        ai_policy: await repoFile("AI_POLICY.md"),
        contributing: await repoFile("CONTRIBUTING.md"),
        code_of_conduct: await repoFile("CODE_OF_CONDUCT.md"),
      };
    case "legal": {
      const commits = await api(`repos/${repo}/commits?per_page=30`);
      const messages = Array.isArray(commits) ? commits.map((item: any) => item.commit?.message ?? "") : [];
      return {
        license: await repoFile("LICENSE"),
        dco: await repoFile("DCO"),
        signoff_density:
          messages.length === 0
            ? null
            : messages.filter((message) => /Signed-off-by:/i.test(message)).length / messages.length,
        workflows: await repoFile(".github/workflows"),
      };
    }
    case "liveness":
      return {
        repo: await api(`repos/${repo}`),
        latest_release: await optional(`repos/${repo}/releases/latest`),
        open_pulls: await api(`repos/${repo}/pulls?state=open&per_page=100`),
        closed_pulls: await api(`repos/${repo}/pulls?state=closed&per_page=100`),
      };
    case "issue":
      return api(`repos/${repo}/issues/${subject}`);
    case "issue-comments": {
      const comments = await api(`repos/${repo}/issues/${subject}/comments?per_page=100`);
      const claimPattern = /\b(I(?:'ll| will| am going to)|working on|claim(?:ing)?|assigned)\b/i;
      return {
        comments,
        claim_candidates: Array.isArray(comments)
          ? comments.filter((item: any) => claimPattern.test(item.body ?? ""))
          : [],
      };
    }
    case "related-prs":
      return api(`search/issues?q=repo:${repo}+type:pr+${encodeURIComponent(subject)}`);
    case "prs-closed":
      return api(`repos/${repo}/pulls?state=closed&per_page=100`);
    case "templates-issue":
      return repoFile(".github/ISSUE_TEMPLATE");
    case "templates-pr":
      return repoFile(".github/PULL_REQUEST_TEMPLATE.md");
    case "commit-log":
      return api(`repos/${repo}/commits?per_page=50`);
    case "pr-stats":
      return api(`repos/${repo}/pulls?state=closed&per_page=50`);
    case "codeowners":
      return {
        root: await repoFile("CODEOWNERS"),
        github: await repoFile(".github/CODEOWNERS"),
      };
    case "pr-caps": {
      const viewer = await api("user");
      const login = (viewer as any)?.login;
      return login ? api(`search/issues?q=repo:${repo}+type:pr+state:open+author:${login}`) : null;
    }
    default:
      errors.push(`unknown subcommand: ${command}`);
      return {};
  }
}

try {
  const data = await run();
  const invalid = !argumentsValid || errors.some((error) => error.startsWith("target is not"));
  const envelope: Envelope = {
    schema: "tailrocks.github-recon/v1",
    outcome: errors.length === 0 ? "success" : invalid ? "refused" : "failed",
    code: errors.length === 0 ? "scanned" : invalid ? "invalid_arguments" : "lookup_failed",
    command,
    ok: errors.length === 0,
    data,
    warnings,
    errors,
    mutations: [],
    detail: errors.length === 0 ? "GitHub reconnaissance complete" : errors.join("; "),
  };
  console.log(JSON.stringify(envelope, null, 2));
  if (envelope.outcome !== "success") process.exit(envelope.outcome === "refused" ? 2 : 1);
} catch (error) {
  console.log(
    JSON.stringify({
      schema: "tailrocks.github-recon/v1",
      outcome: "failed",
      code: "lookup_failed",
      command,
      ok: false,
      data: {},
      warnings,
      errors: [error instanceof Error ? error.message : String(error)],
      mutations: [],
      detail: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
}
