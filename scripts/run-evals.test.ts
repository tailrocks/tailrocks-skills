import { afterEach, describe, expect, test } from "bun:test";
import { lstat, mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  aggregateVerdicts,
  claudeFailureDiagnostic,
  claudeCommand,
  collectArtifacts,
  fixtureDestination,
  initializeWorkspace,
  stageFixtures,
  withRetries,
} from "./run-evals";

const cleanup: string[] = [];
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((item) => rm(item, { recursive: true, force: true })));
});

describe("eval runner helpers", () => {
  test("keeps bounded CLI stdout diagnostics when stderr is empty", () => {
    expect(claudeFailureDiagnostic("", "provider quota reached", 2, 1)).toBe("provider quota reached");
    expect(claudeFailureDiagnostic("stderr wins", "provider quota reached", 2, 1)).toBe("stderr wins");
    expect(claudeFailureDiagnostic("", "x".repeat(501), 1, 1)).toBe("x".repeat(500));
    expect(claudeFailureDiagnostic("", "", 2, 1)).toBe("claude attempt 2/2 exited 1 (timeout cap 600000ms)");
  });
  test("allows only the fixture's read-only inspection and exact gates", () => {
    const command = claudeCommand("subject");
    const allowed = command.slice(
      command.indexOf("--allowedTools") + 1,
      command.indexOf("--no-session-persistence"),
    );
    expect(allowed).toEqual([
      "Bash(git log:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git rev-parse:*)",
      "Bash(git branch:*)",
      "Bash(mise run test)",
      "Bash(mise run lint)",
    ]);
    expect(allowed).not.toContain("Bash(*)");
    expect(allowed.join(" ")).not.toContain("commit");
    expect(allowed.join(" ")).not.toContain("push");
  });
  test("gives the adversarial-output judge no tools", () => {
    const command = claudeCommand("judge", { type: "object" });
    expect(command).toContain("--tools");
    expect(command[command.indexOf("--tools") + 1]).toBe("");
    expect(command).not.toContain("--allowedTools");
    expect(command.join(" ")).not.toContain("Bash(");
  });
  test("preserves a nested skill-relative fixture path", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    await mkdir(path.join(skillDir, "templates/a"), { recursive: true });
    await writeFile(path.join(skillDir, "templates/a/b.txt"), "nested");
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);
    await stageFixtures(root, skillDir, ["skills/x/templates/a/b.txt"], workspace);
    expect(await Bun.file(path.join(workspace, "templates/a/b.txt")).text()).toBe("nested");
    expect(fixtureDestination(root, skillDir, "skills/x/templates/a/b.txt", workspace)).toBe(
      path.join(workspace, "templates/a/b.txt"),
    );
  });
  test("stages a cross-skill fixture relative to the referenced skill", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    await mkdir(skillDir, { recursive: true });
    await mkdir(path.join(root, "skills/y/evals/fixtures/roadmap/item"), { recursive: true });
    await writeFile(path.join(root, "skills/y/evals/fixtures/roadmap/item/README.md"), "shared");
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);
    const fixture = "skills/y/evals/fixtures/roadmap/item/README.md";
    await stageFixtures(root, skillDir, [fixture], workspace);
    const destination = path.join(workspace, "roadmap/item/README.md");
    expect(await Bun.file(destination).text()).toBe("shared");
    expect(fixtureDestination(root, skillDir, fixture, workspace)).toBe(destination);
  });
  test("stages an eval fixture at the workspace root", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    const fixture = "skills/x/evals/fixtures/roadmap/item/README.md";
    await mkdir(path.join(root, "skills/x/evals/fixtures/roadmap/item"), {
      recursive: true,
    });
    await writeFile(path.join(root, fixture), "item");
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);

    await stageFixtures(root, skillDir, [fixture], workspace);

    expect(await Bun.file(path.join(workspace, "roadmap/item/README.md")).text()).toBe("item");
    expect(fixtureDestination(root, skillDir, fixture, workspace)).toBe(
      path.join(workspace, "roadmap/item/README.md"),
    );
  });
  test("rejects fixture destination collisions", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    for (const owner of ["y", "z"]) {
      await mkdir(path.join(root, `skills/${owner}/evals/fixtures/roadmap/item`), { recursive: true });
      await writeFile(path.join(root, `skills/${owner}/evals/fixtures/roadmap/item/README.md`), owner);
    }
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);

    await expect(
      stageFixtures(
        root,
        skillDir,
        ["skills/y/evals/fixtures/roadmap/item/README.md", "skills/z/evals/fixtures/roadmap/item/README.md"],
        workspace,
      ),
    ).rejects.toThrow("fixture destinations collide");
  });
  test("rejects case-folded and ancestor fixture destination collisions before copying", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    await mkdir(path.join(root, "skills/y/evals/fixtures"), { recursive: true });
    await mkdir(path.join(root, "skills/z/evals/fixtures/roadmap"), { recursive: true });
    await writeFile(path.join(root, "skills/y/evals/fixtures/roadmap"), "file");
    await writeFile(path.join(root, "skills/z/evals/fixtures/roadmap/README.md"), "nested");
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);

    await expect(
      stageFixtures(
        root,
        skillDir,
        ["skills/y/evals/fixtures/roadmap", "skills/z/evals/fixtures/roadmap/README.md"],
        workspace,
      ),
    ).rejects.toThrow("fixture destinations collide or overlap");
    expect(await Bun.file(path.join(workspace, "roadmap")).exists()).toBeFalse();

    await mkdir(path.join(root, "skills/a/evals/fixtures/ROADMAP"), { recursive: true });
    await mkdir(path.join(root, "skills/b/evals/fixtures/roadmap"), { recursive: true });
    await writeFile(path.join(root, "skills/a/evals/fixtures/ROADMAP/README.md"), "upper");
    await writeFile(path.join(root, "skills/b/evals/fixtures/roadmap/README.md"), "lower");
    await expect(
      stageFixtures(
        root,
        skillDir,
        ["skills/a/evals/fixtures/ROADMAP/README.md", "skills/b/evals/fixtures/roadmap/README.md"],
        workspace,
      ),
    ).rejects.toThrow("fixture destinations collide or overlap");
  });
  test("rejects a symlink anywhere in a fixture source path before copying", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    const outside = path.join(root, "outside.md");
    await writeFile(outside, "outside");
    await mkdir(path.join(root, "skills/y/evals/fixtures/roadmap"), { recursive: true });
    await symlink(outside, path.join(root, "skills/y/evals/fixtures/roadmap/README.md"));
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);

    await expect(
      stageFixtures(root, skillDir, ["skills/y/evals/fixtures/roadmap"], workspace),
    ).rejects.toThrow("fixture source contains symlink");
    expect(await Bun.file(path.join(workspace, "roadmap/README.md")).exists()).toBeFalse();
  });
  test("rejects nested case-folded git metadata before copying any fixture", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    await mkdir(path.join(root, "skills/y/evals/fixtures/package/.GIT"), { recursive: true });
    await writeFile(path.join(root, "skills/y/evals/fixtures/package/.GIT/config"), "metadata");
    await mkdir(path.join(root, "skills/z/evals/fixtures/roadmap"), { recursive: true });
    await writeFile(path.join(root, "skills/z/evals/fixtures/roadmap/README.md"), "safe");
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);

    await expect(
      stageFixtures(
        root,
        skillDir,
        ["skills/z/evals/fixtures/roadmap/README.md", "skills/y/evals/fixtures/package"],
        workspace,
      ),
    ).rejects.toThrow("fixture source contains git metadata");
    expect(await Bun.file(path.join(workspace, "roadmap/README.md")).exists()).toBeFalse();
  });
  test("rejects nested git worktree files before copying any fixture", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    await mkdir(path.join(root, "skills/y/evals/fixtures/package"), { recursive: true });
    await writeFile(path.join(root, "skills/y/evals/fixtures/package/.git"), "gitdir: /outside");
    await mkdir(path.join(root, "skills/z/evals/fixtures/roadmap"), { recursive: true });
    await writeFile(path.join(root, "skills/z/evals/fixtures/roadmap/README.md"), "safe");
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);

    await expect(
      stageFixtures(
        root,
        skillDir,
        ["skills/z/evals/fixtures/roadmap/README.md", "skills/y/evals/fixtures/package"],
        workspace,
      ),
    ).rejects.toThrow("fixture source contains git metadata");
    expect(await Bun.file(path.join(workspace, "roadmap/README.md")).exists()).toBeFalse();
  });
  test("rejects a symlinked owning skill directory before copying", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    const skillDir = path.join(root, "skills/x");
    const outside = path.join(root, "outside-skill");
    await mkdir(path.join(outside, "evals/fixtures/roadmap"), { recursive: true });
    await writeFile(path.join(outside, "evals/fixtures/roadmap/README.md"), "outside");
    await mkdir(path.join(root, "skills"), { recursive: true });
    await symlink(outside, path.join(root, "skills/y"));
    const workspace = path.join(root, "workspace");
    await mkdir(workspace);

    await expect(
      stageFixtures(root, skillDir, ["skills/y/evals/fixtures/roadmap/README.md"], workspace),
    ).rejects.toThrow("fixture source contains symlink");
    expect(await Bun.file(path.join(workspace, "roadmap/README.md")).exists()).toBeFalse();
  });
  test("initializes a committed repository for a nonempty workspace", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "eval-root-"));
    cleanup.push(root);
    await writeFile(path.join(root, "README.md"), "fixture");
    const inheritedKeys = [
      "GIT_DIR",
      "GIT_WORK_TREE",
      "GIT_INDEX_FILE",
      "GIT_OBJECT_DIRECTORY",
      "GIT_CONFIG_COUNT",
      "GIT_CONFIG_KEY_0",
      "GIT_CONFIG_VALUE_0",
      "GIT_CONFIG_GLOBAL",
      "GIT_AUTHOR_NAME",
      "GIT_COMMITTER_EMAIL",
    ] as const;
    const inherited = Object.fromEntries(inheritedKeys.map((key) => [key, process.env[key]]));
    process.env.GIT_DIR = path.join(root, "redirected-git-dir");
    process.env.GIT_WORK_TREE = path.join(root, "redirected-work-tree");
    process.env.GIT_INDEX_FILE = path.join(root, "redirected-index");
    process.env.GIT_OBJECT_DIRECTORY = path.join(root, "redirected-objects");
    process.env.GIT_CONFIG_COUNT = "1";
    process.env.GIT_CONFIG_KEY_0 = "commit.gpgsign";
    process.env.GIT_CONFIG_VALUE_0 = "true";
    const globalConfig = path.join(root, "inherited.gitconfig");
    await writeFile(globalConfig, "[user]\n\tname = Inherited identity\n");
    process.env.GIT_CONFIG_GLOBAL = globalConfig;
    process.env.GIT_AUTHOR_NAME = "Injected author";
    process.env.GIT_COMMITTER_EMAIL = "injected@example.invalid";
    try {
      await initializeWorkspace(root);
    } finally {
      for (const key of inheritedKeys) {
        const value = inherited[key];
        if (typeof value === "string") process.env[key] = value;
        else delete process.env[key];
      }
    }

    expect(Bun.spawnSync(["git", "rev-parse", "--verify", "HEAD"], { cwd: root }).exitCode).toBe(0);
    expect(Bun.spawnSync(["git", "branch", "--show-current"], { cwd: root }).stdout.toString()).toBe(
      "eval-fixture\n",
    );
    expect(Bun.spawnSync(["git", "status", "--porcelain"], { cwd: root }).stdout.toString()).toBe("");
    expect(Bun.spawnSync(["git", "config", "--get", "commit.gpgsign"], { cwd: root }).stdout.toString()).toBe(
      "false\n",
    );
    expect(Bun.spawnSync(["git", "log", "-1", "--format=%aI %cI"], { cwd: root }).stdout.toString()).toBe(
      "2000-01-01T00:00:00Z 2000-01-01T00:00:00Z\n",
    );
    expect(
      Bun.spawnSync(["git", "log", "-1", "--format=%an <%ae> %cn <%ce>"], { cwd: root }).stdout.toString(),
    ).toBe("Tailrocks eval <eval@example.invalid> Tailrocks eval <eval@example.invalid>\n");
    await expect(lstat(path.join(root, ".git/hooks"))).rejects.toThrow();
    expect(await Bun.file(path.join(root, "redirected-git-dir/HEAD")).exists()).toBeFalse();
  });
  test("rejects a fixture that escapes the skills tree", () => {
    expect(() => fixtureDestination("/repo", "/repo/skills/x", "skills/../secrets.txt", "/ws")).toThrow(
      "fixture escapes skill",
    );
    expect(() => fixtureDestination("/repo", "/repo/skills/x", "../y/SKILL.md", "/ws")).toThrow(
      "fixture escapes skill",
    );
  });
  test("rejects an eval fixture that targets git metadata", () => {
    expect(() =>
      fixtureDestination("/repo", "/repo/skills/x", "skills/y/evals/fixtures/config/.GIT/hooks", "/ws"),
    ).toThrow("fixture targets git metadata");
  });
  test("artifact listing marks byte-cap truncation", async () => {
    const workspace = await mkdtemp(path.join(tmpdir(), "eval-artifacts-"));
    cleanup.push(workspace);
    await writeFile(path.join(workspace, "large.txt"), "x".repeat(20));
    expect(await collectArtifacts(workspace, 8, 8)).toContain("[artifact content truncated: large.txt]");
  });
  test("artifact listing excludes root git metadata but keeps normal hidden files", async () => {
    const workspace = await mkdtemp(path.join(tmpdir(), "eval-artifacts-"));
    cleanup.push(workspace);
    await mkdir(path.join(workspace, ".git"));
    await writeFile(path.join(workspace, ".git/config"), "secret metadata");
    await mkdir(path.join(workspace, "nested/.GIT"), { recursive: true });
    await writeFile(path.join(workspace, "nested/.GIT/config"), "case variant metadata");
    await writeFile(path.join(workspace, ".hidden"), "normal evidence");

    const artifacts = await collectArtifacts(workspace);
    expect(artifacts).not.toContain(".git/config");
    expect(artifacts).not.toContain("secret metadata");
    expect(artifacts).not.toContain("nested/.GIT/config");
    expect(artifacts).not.toContain("case variant metadata");
    expect(artifacts).toContain("FILE .hidden");
    expect(artifacts).toContain("normal evidence");
  });
  test("one failure makes the aggregate fail and retains its workspace", () => {
    const verdicts = [true, true, false].map((pass, index) => ({
      run: index + 1,
      workspace: `/tmp/run-${index + 1}`,
      verdict: { pass },
    }));
    const result = aggregateVerdicts("x", 1, 3, verdicts);
    expect(result.exitCode).toBe(1);
    expect(result.summary.passed).toBe(2);
    expect(result.summary.retained_workspaces).toEqual(["/tmp/run-3"]);
  });
  test("retries transient execution failure and returns success", async () => {
    let calls = 0;
    expect(
      await withRetries(2, async () => {
        calls += 1;
        if (calls === 1) throw new Error("transient");
        return "ok";
      }),
    ).toBe("ok");
    expect(calls).toBe(2);
  });
  test("rethrows after the retry budget is exhausted", async () => {
    let calls = 0;
    await expect(
      withRetries(2, async () => {
        calls += 1;
        throw new Error(`failure-${calls}`);
      }),
    ).rejects.toThrow("failure-2");
    expect(calls).toBe(2);
  });
});

import {
  afterEach as linkedAfterEach,
  describe as linkedDescribe,
  expect as linkedExpect,
  test as linkedTest,
} from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import {
  collectLinkedSkillReferences,
  main,
  renderSkillMaterials,
  SKILL_REFERENCE_PER_FILE_CAP,
  SKILL_REFERENCE_TOTAL_CAP,
  workflowRequiredSummary,
} from "./run-evals";

const roots: string[] = [];
const EXPECTED_DIRECT_MARKDOWN_LINKS: Record<string, string[]> = {
  "tailrocks-agents-md": ["references/placement-and-topology.md", "references/rule-writing.md"],
  "tailrocks-audit": [
    "references/audit-lanes.md",
    "references/execution-loop.md",
    "references/plan-seeding.md",
  ],
  "tailrocks-axum-best-practices": [
    "references/architecture-and-state.md",
    "references/extractors-and-errors.md",
    "references/lifecycle-and-testing.md",
    "references/middleware-and-security.md",
  ],
  "tailrocks-brainstorm": ["references/grilling-method.md"],
  "tailrocks-checkout-pr": [],
  "tailrocks-code-health": [
    "references/architecture-and-docs.md",
    "references/defects-flakes-and-reports.md",
    "references/ratchets-and-baselines.md",
    "references/verification-lanes.md",
    "references/versions-and-dependencies.md",
    "templates/DEFECT_LEDGER.md",
  ],
  "tailrocks-contribute": [
    "references/etiquette-and-hard-stops.md",
    "references/project-contract.md",
    "references/review-response.md",
    "references/submission-gate.md",
  ],
  "tailrocks-create-pr": ["references/pr-body.md", "references/repo-conventions.md"],
  "tailrocks-finalize": ["references/readiness-and-grilling.md"],
  "tailrocks-graphql-best-practices": [
    "references/client-tanstack.md",
    "references/contract-gates.md",
    "references/schema-design.md",
    "references/server-rust.md",
  ],
  "tailrocks-grpc-best-practices": [
    "references/operations.md",
    "references/proto-contracts.md",
    "references/tonic-server-client.md",
  ],
  "tailrocks-idea": ["references/delivery-git-contract.md", "references/roadmap-item-format.md"],
  "tailrocks-improve": ["references/audit-playbook.md", "references/plan-format.md"],
  "tailrocks-macos-design": [
    "references/anti-patterns.md",
    "references/appkit-api.md",
    "references/apple-patterns.md",
    "references/archetypes.md",
    "references/custom-component-contract.md",
    "references/custom-renderers.md",
    "references/experience-brief.md",
    "references/launch-contract.md",
    "references/layer-model.md",
    "references/match-policy.md",
    "references/native-component-map.md",
    "references/platform-baseline.md",
    "references/prototype-package.md",
    "references/review-mode.md",
    "references/rubric.md",
    "references/swiftui-api.md",
    "references/verification.md",
    "templates/DesignReview.md",
    "templates/ExperienceBrief.md",
    "templates/NativeComponentMap.md",
  ],
  "tailrocks-macos-visual-qa": [
    "references/build-and-launch.md",
    "references/interaction.md",
    "references/regression.md",
    "references/state-matrix.md",
  ],
  "tailrocks-merge-pr": ["references/delivery-artifacts.md"],
  "tailrocks-plan": [
    "references/coverage-ledger.md",
    "references/execution-roles.md",
    "references/goal-handoff.md",
    "references/plan-template.md",
    "references/research-shape.md",
    "references/spec-format.md",
  ],
  "tailrocks-pr-template": ["references/PULL_REQUEST_TEMPLATE.md"],
  "tailrocks-record-feedback": ["templates/feedback.md"],
  "tailrocks-reconcile": [
    "references/remaining.md",
    "references/retirement.md",
    "references/row-verification.md",
  ],
  "tailrocks-prove": [
    "references/execution-evidence.md",
    "references/report-format.md",
    "references/subagent-fanout.md",
    "references/surface-inventory.md",
    "templates/report.md",
  ],
  "tailrocks-record-decision": [],
  "tailrocks-refresh-pr": [],
  "tailrocks-remediate": ["references/principles-and-evidence.md"],
  "tailrocks-research": ["references/research-playbook.md"],
  "tailrocks-rethink": ["references/concept-corpus.md", "references/redesign-discipline.md"],
  "tailrocks-retrospect": [
    "references/divergence-detectors.md",
    "references/patch-shape.md",
    "references/subagent-fanout.md",
    "templates/retrospective.md",
  ],
  "tailrocks-review-pr": [
    "references/finding-bar.md",
    "references/reporting.md",
    "references/specialist-lanes.md",
    "references/structural-review.md",
  ],
  "tailrocks-rust-best-practices": [
    "references/api-design.md",
    "references/errors-testing-docs.md",
    "references/ownership-performance.md",
    "references/readability-style-architecture.md",
    "references/review-checklist.md",
    "references/tooling-lints.md",
  ],
  "tailrocks-rust-project-setup": [
    "references/lints-clippy-rustfmt.md",
    "references/supply-chain-and-testing.md",
    "references/toolchain-and-mise.md",
    "references/version-policy.md",
    "references/workspace-and-layout.md",
  ],
  "tailrocks-simplify": ["references/behavior-preservation.md", "references/simplification-ladder.md"],
  "tailrocks-skill-author": [
    "references/design-doctrine.md",
    "references/house-wiring.md",
    "references/testing-doctrine.md",
  ],
  "tailrocks-swift-best-practices": [
    "references/accessibility.md",
    "references/appkit-interop.md",
    "references/apple-platform-shell.md",
    "references/concurrency.md",
    "references/errors-and-api.md",
    "references/rust-core-boundary.md",
    "references/swiftui.md",
  ],
  "tailrocks-swift-project-setup": [
    "references/agent-integration.md",
    "references/lint-and-format.md",
    "references/project-generation.md",
    "references/rust-core.md",
    "references/testing.md",
    "references/toolchain.md",
  ],
  "tailrocks-tanstack-project-setup": [
    "references/boundaries-and-data.md",
    "references/migration-checklist.md",
    "references/shadcn-ui.md",
    "references/stack-and-layout.md",
    "references/tooling-and-quality.md",
    "references/version-policy.md",
  ],
  "tailrocks-tui-design": [
    "references/gallery.md",
    "references/golden-frames.md",
    "references/screen-package.md",
    "references/tui-craft.md",
  ],
  "tailrocks-typescript-best-practices": [
    "references/boundaries-and-domain-values.md",
    "references/compiler-lint-testing.md",
    "references/mutation-and-api-safety.md",
    "references/react-and-async.md",
    "references/state-and-errors.md",
  ],
  "tailrocks-web-design": [
    "references/design-routes.md",
    "references/screen-package.md",
    "references/web-screen-craft.md",
  ],
  "tailrocks-web-visual-qa": ["references/screenshot-baselines.md"],
};
function skillFixture(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "tailrocks-run-evals-"));
  roots.push(root);
  const skillDir = join(root, "skills", "fixture");
  for (const [name, content] of Object.entries(files)) {
    const target = join(skillDir, name);
    mkdirSync(join(target, ".."), { recursive: true });
    writeFileSync(target, content);
  }
  return skillDir;
}
linkedAfterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
linkedDescribe("linked skill material", () => {
  linkedTest("rejects workflow cases before any workspace or subject launch", async () => {
    for (const caseId of [1, 4, 5]) {
      let launched = false;
      const exitCode = await main(["--skill", "tailrocks-plan", "--case", String(caseId)], {
        createWorkspace: async () => {
          launched = true;
          throw new Error("workspace must not be created");
        },
        invoke: async () => {
          launched = true;
          throw new Error("subject must not launch");
        },
      });

      linkedExpect(exitCode).toBe(3);
      linkedExpect(launched).toBeFalse();
      linkedExpect(workflowRequiredSummary("tailrocks-plan", caseId, 1)).toEqual({
        skill: "tailrocks-plan",
        case: caseId,
        runs: 1,
        execution_mode: "workflow",
        error: "workflow_required",
      });
    }
  });
  linkedTest("collects direct Markdown links in normalized order and renders binding material", async () => {
    const skillDir = skillFixture({
      "SKILL.md": "Read [z](references/z.md) and [a](references/a.md).\n",
      "references/a.md": "alpha\n",
      "references/z.md": "zulu\n",
      "references/nested.md": "not direct\n",
    });
    const materials = await collectLinkedSkillReferences(skillDir);
    linkedExpect(materials.map((material) => material.path)).toEqual(["references/a.md", "references/z.md"]);
    linkedExpect(renderSkillMaterials("router\n", materials)).toContain(
      '<binding-skill-material path="references/a.md">\nalpha\n</binding-skill-material>',
    );
  });
  linkedTest("rejects absolute and parent-directory link escapes", async () => {
    const absolute = skillFixture({ "SKILL.md": "Read [bad](/tmp/outside.md).\n" });
    await linkedExpect(collectLinkedSkillReferences(absolute)).rejects.toThrow("absolute");
    const parent = skillFixture({ "SKILL.md": "Read [bad](../outside.md).\n" });
    await linkedExpect(collectLinkedSkillReferences(parent)).rejects.toThrow("escape");
  });
  linkedTest("rejects a linked symlink even when its lexical path is inside the skill", async () => {
    const skillDir = skillFixture({ "SKILL.md": "Read [bad](references/outside.md).\n" });
    const outside = join(skillDir, "../outside.md");
    writeFileSync(outside, "outside\n");
    mkdirSync(join(skillDir, "references"), { recursive: true });
    symlinkSync(outside, join(skillDir, "references/outside.md"));
    await linkedExpect(collectLinkedSkillReferences(skillDir)).rejects.toThrow("regular file");
  });
  linkedTest("truncates material at explicit per-file and total caps", async () => {
    const perFile = skillFixture({
      "SKILL.md": "Read [large](references/large.md).\n",
      "references/large.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP + 1),
    });
    const perFileMaterials = await collectLinkedSkillReferences(perFile);
    linkedExpect(Buffer.byteLength(perFileMaterials[0]?.content ?? "", "utf8")).toBe(
      SKILL_REFERENCE_PER_FILE_CAP,
    );
    linkedExpect(perFileMaterials[0]?.truncated).toBeTrue();
    const total = skillFixture({
      "SKILL.md":
        "Read [a](references/a.md), [b](references/b.md), [c](references/c.md), [d](references/d.md), and [e](references/e.md).\n",
      "references/a.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP),
      "references/b.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP),
      "references/c.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP),
      "references/d.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP),
      "references/e.md": "x",
    });
    const materials = await collectLinkedSkillReferences(total);
    linkedExpect(
      materials.reduce((sum, material) => sum + Buffer.byteLength(material.content, "utf8"), 0),
    ).toBe(SKILL_REFERENCE_TOTAL_CAP);
    linkedExpect(materials.at(-1)?.truncated).toBeTrue();
  });
  linkedTest("caps UTF-8 by bytes without embedding a split code point", async () => {
    const skillDir = skillFixture({
      "SKILL.md": "Read [unicode](references/unicode.md).\n",
      "references/unicode.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP - 1) + "€",
    });
    const material = (await collectLinkedSkillReferences(skillDir))[0]!;
    linkedExpect(Buffer.byteLength(material.content, "utf8")).toBe(SKILL_REFERENCE_PER_FILE_CAP - 1);
    linkedExpect(material.content.endsWith("€")).toBeFalse();
    linkedExpect(material.truncated).toBeTrue();
  });
  linkedTest("applies the total cap in UTF-8 bytes across references", async () => {
    const skillDir = skillFixture({
      "SKILL.md":
        "Read [a](references/a.md), [b](references/b.md), [c](references/c.md), [d](references/d.md), and [e](references/e.md).\n",
      "references/a.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP),
      "references/b.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP),
      "references/c.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP),
      "references/d.md": "x".repeat(SKILL_REFERENCE_PER_FILE_CAP - 2) + "€",
      "references/e.md": "€",
    });
    const materials = await collectLinkedSkillReferences(skillDir);
    linkedExpect(materials.map((material) => Buffer.byteLength(material.content, "utf8"))).toEqual([
      SKILL_REFERENCE_PER_FILE_CAP,
      SKILL_REFERENCE_PER_FILE_CAP,
      SKILL_REFERENCE_PER_FILE_CAP,
      SKILL_REFERENCE_PER_FILE_CAP - 2,
      0,
    ]);
    linkedExpect(
      materials.reduce((sum, material) => sum + Buffer.byteLength(material.content, "utf8"), 0),
    ).toBeLessThanOrEqual(SKILL_REFERENCE_TOTAL_CAP);
    linkedExpect(materials.every((material) => !material.content.includes("�"))).toBeTrue();
  });
  linkedTest("rejects invalid UTF-8 that is fully inside the byte cap", async () => {
    const skillDir = skillFixture({ "SKILL.md": "Read [invalid](references/invalid.md).\n" });
    mkdirSync(join(skillDir, "references"), { recursive: true });
    writeFileSync(join(skillDir, "references/invalid.md"), Buffer.from([0x61, 0xff]));
    await linkedExpect(collectLinkedSkillReferences(skillDir)).rejects.toThrow("invalid UTF-8");
  });
  linkedTest("rejects malformed UTF-8 at the cap boundary when an extra byte proves truncation", async () => {
    const skillDir = skillFixture({ "SKILL.md": "Read [invalid](references/invalid.md).\n" });
    mkdirSync(join(skillDir, "references"), { recursive: true });
    writeFileSync(
      join(skillDir, "references/invalid.md"),
      Buffer.concat([Buffer.alloc(SKILL_REFERENCE_PER_FILE_CAP - 1, 0x78), Buffer.from([0xff, 0x61])]),
    );
    await linkedExpect(collectLinkedSkillReferences(skillDir)).rejects.toThrow("invalid UTF-8 at byte cap");
  });
  linkedTest(
    "matches the independent full-tree direct-link oracle and renders every collected reference",
    async () => {
      const root = resolve(import.meta.dir, "..");
      const skillPaths = await Array.fromAsync(new Bun.Glob("skills/*/SKILL.md").scan({ cwd: root }));
      const names = skillPaths.map((skillPath) => skillPath.split("/")[1]!).sort();
      linkedExpect(names).toEqual(Object.keys(EXPECTED_DIRECT_MARKDOWN_LINKS).sort());
      for (const name of names) {
        const skillDir = join(root, "skills", name);
        const materials = await collectLinkedSkillReferences(skillDir);
        linkedExpect(materials.map((material) => material.path)).toEqual(
          EXPECTED_DIRECT_MARKDOWN_LINKS[name],
        );
        const rendered = renderSkillMaterials(await Bun.file(join(skillDir, "SKILL.md")).text(), materials);
        for (const material of materials) {
          linkedExpect(relative(skillDir, resolve(skillDir, material.path)).startsWith("..")).toBeFalse();
          linkedExpect(Buffer.byteLength(material.content, "utf8")).toBeLessThanOrEqual(
            SKILL_REFERENCE_PER_FILE_CAP,
          );
          linkedExpect(rendered).toContain(`<binding-skill-material path=\"${material.path}\">`);
          linkedExpect(rendered).toContain(material.content);
        }
        linkedExpect(
          materials.reduce((sum, material) => sum + Buffer.byteLength(material.content, "utf8"), 0),
        ).toBeLessThanOrEqual(SKILL_REFERENCE_TOTAL_CAP);
      }
    },
  );
  linkedTest("keeps exactly the earned tailrocks-plan eval cases", async () => {
    const root = resolve(import.meta.dir, "..");
    const evals = await Bun.file(join(root, "skills/tailrocks-plan/evals/evals.json")).json();
    linkedExpect(evals.evals.map((item: { id: number }) => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  linkedTest("stages fixtures at the paths a skill would really read", async () => {
    // The mechanism, not one skill's fixture data: a leading case-id segment is
    // stripped so a fixture lands where the skill reads it, and nowhere else.
    const root = resolve(import.meta.dir, "..");
    const skillDir = join(root, "skills/tailrocks-plan");
    const evals = await Bun.file(join(skillDir, "evals/evals.json")).json();
    for (const evaluation of evals.evals as { id: number; files: string[] }[]) {
      if (evaluation.files.length === 0) continue;
      const workspace = await mkdtemp(join(tmpdir(), `tailrocks-eval-fixture-${evaluation.id}-`));
      cleanup.push(workspace);
      await stageFixtures(root, skillDir, evaluation.files, workspace);
      for (const file of evaluation.files) {
        const authoritative = file.replace(/^skills\/[^/]+\/evals\/fixtures\/(?:\d+\/)?/, "");
        linkedExpect(await Bun.file(join(workspace, authoritative)).exists()).toBeTrue();
        linkedExpect(
          await Bun.file(join(workspace, String(evaluation.id), authoritative)).exists(),
        ).toBeFalse();
      }
    }
  });
});
