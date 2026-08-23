import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  blessInputSchema,
  blessMacosDesign,
  finalizeMacosDesignReview,
  liveSessionSchema,
  macosReviewCaps,
  macosReviewCategories,
  macosReviewHardFailures,
  macosReviewStates,
  reviewInputSchema,
  reviewReceiptSchema,
  systematizeInputSchema,
  systematizeMacosDesign,
} from "./macos-design-contract";

const revision = "a".repeat(40),
  packageHash = "b".repeat(64);
const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");
const rows = [...macosReviewStates];
const evidence = rows.map((state) => ({
  state,
  evidence: "live" as const,
  observation: `observed ${state}`,
}));
function input(mode: "preliminary" | "acceptance" = "acceptance") {
  return {
    schema: reviewInputSchema,
    mode,
    subject_revision: revision,
    package_sha256: packageHash,
    author: "implementer-1",
    reviewer: "reviewer-2",
    evidence,
    live_session: {
      schema: liveSessionSchema,
      id: "session-1",
      prototype_revision: revision,
      package_sha256: packageHash,
      pid: 321,
      window_id: 654,
      ready_nonce: "TR-READY-nonce",
      matrix: evidence,
      capture_artifacts: [],
    },
    category_scores: Object.entries(macosReviewCategories).map(([id, points]) => ({ id, points })),
    cap_triggers: Object.keys(macosReviewCaps).map((id) => ({ id, present: false })),
    hard_failures: macosReviewHardFailures.map((id) => ({ id, present: false, evidence: "checked live" })),
    findings: ["Preserve native toolbar behavior."],
  };
}
function pass() {
  return finalizeMacosDesignReview(input());
}
function canonicalSignoff(reviewHash: string): string {
  return `# Feature prototype sign-off\n\n- **Prototype identity**: ${revision} — ${packageHash}\n- **Acceptance review**: ${reviewReceiptSchema} ${reviewHash} — \`PASS\` by reviewer-2 in session-1\n- **Invocation**: bless-invocation-1\n- **Scenarios**: ${rows.join(", ")}\n- **Blessed**: 2026-08-23 by human-1 — reviewed running\n`;
}

test("acceptance PASS requires exact live, current, non-capturing evidence", () => {
  expect(pass()).toMatchObject({
    schema: reviewReceiptSchema,
    outcome: "PASS",
    live_session_id: "session-1",
    mutations: [],
  });
  for (const changed of [
    { evidence: evidence.map((row, index) => (index ? row : { ...row, evidence: "static" as const })) },
    { evidence: evidence.slice(1) },
    { category_scores: input().category_scores.slice(1) },
    { live_session: null },
    { live_session: { ...input().live_session, prototype_revision: "c".repeat(40) } },
    { live_session: { ...input().live_session, capture_artifacts: ["capture.png"] } },
    { reviewer: "implementer-1" },
  ])
    expect(finalizeMacosDesignReview({ ...input(), ...changed }).outcome).toBe("REFUSED");
  expect(
    finalizeMacosDesignReview({
      ...input(),
      category_scores: input().category_scores.map((row, index) => (index ? row : { ...row, points: 0 })),
    }).outcome,
  ).toBe("FAIL");
  expect(
    finalizeMacosDesignReview({
      ...input(),
      cap_triggers: input().cap_triggers.map((row, index) => ({ ...row, present: index === 0 })),
    }).outcome,
  ).toBe("FAIL");
  expect(
    finalizeMacosDesignReview({
      ...input(),
      hard_failures: input().hard_failures.map((row, index) => ({ ...row, present: index === 0 })),
    }).outcome,
  ).toBe("FAIL");
});

test("preliminary remains visibly non-accepting with static evidence", () => {
  const staticEvidence = evidence.map((row) => ({ ...row, evidence: "static" as const }));
  const receipt = finalizeMacosDesignReview({
    ...input("preliminary"),
    evidence: staticEvidence,
    live_session: null,
  });
  expect(receipt).toMatchObject({ outcome: "PRELIMINARY", live_session_id: null, mutations: [] });
});

test("installed review command is loader-bound and rejects oversized stdin", async () => {
  const sourceRoot = path.resolve(import.meta.dir, ".."),
    root = await realpath(await mkdtemp(path.join(tmpdir(), "macos-review-cli-")));
  await mkdir(path.join(root, "scripts"));
  await mkdir(path.join(root, "skills", "tailrocks-macos-design-review"), { recursive: true });
  for (const name of [
    "macos-design-review-finalize.ts",
    "macos-design-contract.ts",
    "bounded-json-stdin.ts",
    "atomic-file-transaction.ts",
  ])
    await cp(path.join(sourceRoot, "scripts", name), path.join(root, "scripts", name));
  const skill = path.join(root, "skills", "tailrocks-macos-design-review", "SKILL.md");
  await writeFile(skill, "# Installed\n");
  const command = [
    process.execPath,
    path.join(root, "scripts", "macos-design-review-finalize.ts"),
    "--skill-file",
    skill,
  ];
  const success = Bun.spawn(command, {
    cwd: root,
    stdin: new Blob([JSON.stringify(input())]),
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(await success.exited).toBe(0);
  expect(JSON.parse(await new Response(success.stdout).text())).toMatchObject({
    outcome: "PASS",
    mutations: [],
  });
  const oversized = Bun.spawn(command, {
    cwd: root,
    stdin: new Blob([" ".repeat(1_000_001)]),
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(await oversized.exited).toBe(2);
  expect(JSON.parse(await new Response(oversized.stdout).text())).toMatchObject({
    outcome: "REFUSED",
    detail: "stdin is too large",
  });
});

test("blessing writes only current reviewed SIGNOFF and cannot capture or alias", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "macos-bless-")));
  await mkdir(path.join(root, "Design", "Prototypes", "Feature"), { recursive: true });
  const base = {
    schema: blessInputSchema,
    root,
    target: "Design/Prototypes/Feature/SIGNOFF.md",
    expected_utf8: null,
    feature: "Feature",
    subject_revision: revision,
    package_sha256: packageHash,
    review: pass(),
    review_sha256: sha256(JSON.stringify(pass())),
    invocation_id: "bless-invocation-1",
    human_signoff: {
      source: "live_user",
      user: "human-1",
      date: "2026-08-23",
      invocation_id: "bless-invocation-1",
      subject_revision: revision,
      package_sha256: packageHash,
      review_sha256: sha256(JSON.stringify(pass())),
      reviewer: "reviewer-2",
      live_session_id: "session-1",
      states: rows,
    },
  };
  const result = await blessMacosDesign(base);
  expect(result).toMatchObject({ outcome: "BLESSED", mutations: [base.target] });
  expect(await readFile(path.join(root, base.target), "utf8")).toContain("reviewed running");
  for (const target of [
    "Design/Prototypes/Feature/BASELINE.json",
    "Design/Prototypes/Feature/capture.png",
    "Design/Prototypes/Feature/DesignReview.md",
    "Design/Prototypes/Feature/SIGNOFF-old.md",
  ])
    expect((await blessMacosDesign({ ...base, target })).outcome).toBe("REFUSED");
  expect((await blessMacosDesign({ ...base, expected_utf8: null })).outcome).toBe("REFUSED");
  expect((await blessMacosDesign({ ...base, review: { ...pass(), outcome: "PRELIMINARY" } })).outcome).toBe(
    "REFUSED",
  );
  expect(
    (await blessMacosDesign({ ...base, human_signoff: { ...base.human_signoff, invocation_id: "stale" } }))
      .outcome,
  ).toBe("REFUSED");
  expect(
    await blessMacosDesign({ ...base, human_signoff: { ...base.human_signoff, date: "2026-99-99" } }),
  ).toMatchObject({ outcome: "REFUSED", detail: "human_signoff.date is invalid" });
});

test("systematize publishes only accepted product design-system ledger rows by CAS", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "macos-system-")));
  const directory = path.join(root, "Design", "System", "MacOS");
  await mkdir(directory, { recursive: true });
  const signoffPath = "Design/Prototypes/Feature/SIGNOFF.md";
  await mkdir(path.dirname(path.join(root, signoffPath)), { recursive: true });
  const reviewHash = sha256(JSON.stringify(pass()));
  const signoff = canonicalSignoff(reviewHash);
  await writeFile(path.join(root, signoffPath), signoff);
  await writeFile(path.join(directory, "Tokens.md"), "before\n");
  const base = {
    schema: systematizeInputSchema,
    root,
    design_system_root: "Design/System/MacOS",
    subject_revision: revision,
    package_sha256: packageHash,
    review: pass(),
    review_sha256: reviewHash,
    signoff_path: signoffPath,
    signoff_sha256: sha256(signoff),
    ledger: [
      {
        id: "TOKEN-1",
        disposition: "accepted",
        path: "Design/System/MacOS/Tokens.md",
        expected_utf8: "before\n",
        postimage_utf8: "after\n",
        evidence: "PASS session-1 and live sign-off",
      },
    ],
  };
  expect(await systematizeMacosDesign(base)).toMatchObject({
    outcome: "SYSTEMATIZED",
    mutations: ["Design/System/MacOS/Tokens.md"],
  });
  expect(await readFile(path.join(directory, "Tokens.md"), "utf8")).toBe("after\n");
  const noChange = {
    ...base,
    ledger: [{ ...base.ledger[0]!, expected_utf8: "after\n", postimage_utf8: "after\n" }],
  };
  expect((await systematizeMacosDesign(noChange)).outcome).toBe("NO_CHANGE");
  await writeFile(path.join(directory, "Tokens.md"), "drift\n");
  expect((await systematizeMacosDesign(noChange)).outcome).toBe("REFUSED");
  await writeFile(path.join(directory, "Tokens.md"), "after\n");
  await writeFile(
    path.join(root, signoffPath),
    `${revision}\n${packageHash}\n${reviewHash}\nreviewer-2\nsession-1\n`,
  );
  expect(
    (
      await systematizeMacosDesign({
        ...noChange,
        signoff_sha256: sha256(await readFile(path.join(root, signoffPath), "utf8")),
      })
    ).outcome,
  ).toBe("REFUSED");
  const invalidDateSignoff = canonicalSignoff(reviewHash).replace("2026-08-23", "2026-99-99");
  await writeFile(path.join(root, signoffPath), invalidDateSignoff);
  expect(
    await systematizeMacosDesign({ ...noChange, signoff_sha256: sha256(invalidDateSignoff) }),
  ).toMatchObject({ outcome: "REFUSED", detail: "SIGNOFF.md date is invalid" });
  await writeFile(path.join(root, signoffPath), signoff);
  for (const pathName of [
    "skills/tailrocks-macos-design/references/rubric.md",
    "Design/Prototypes/Feature/SIGNOFF.md",
    "Sources/App/View.swift",
  ])
    expect(
      (await systematizeMacosDesign({ ...base, ledger: [{ ...base.ledger[0]!, path: pathName }] })).outcome,
    ).toBe("REFUSED");
  expect(
    (await systematizeMacosDesign({ ...base, ledger: [{ ...base.ledger[0]!, disposition: "rejected" }] }))
      .outcome,
  ).toBe("REFUSED");
});

test("systematize reports partial-write recovery without overwriting concurrent replacement", async () => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "macos-system-race-")));
  const directory = path.join(root, "Design", "System", "MacOS");
  await mkdir(directory, { recursive: true });
  const signoffPath = "Design/Prototypes/Feature/SIGNOFF.md";
  await mkdir(path.dirname(path.join(root, signoffPath)), { recursive: true });
  const reviewHash = sha256(JSON.stringify(pass()));
  const signoff = canonicalSignoff(reviewHash);
  await writeFile(path.join(root, signoffPath), signoff);
  await writeFile(path.join(directory, "A.md"), "a0");
  await writeFile(path.join(directory, "B.md"), "b0");
  const result = await systematizeMacosDesign(
    {
      schema: systematizeInputSchema,
      root,
      design_system_root: "Design/System/MacOS",
      subject_revision: revision,
      package_sha256: packageHash,
      review: pass(),
      review_sha256: reviewHash,
      signoff_path: signoffPath,
      signoff_sha256: sha256(signoff),
      ledger: [
        {
          id: "A",
          disposition: "accepted",
          path: "Design/System/MacOS/A.md",
          expected_utf8: "a0",
          postimage_utf8: "a1",
          evidence: "accepted",
        },
        {
          id: "B",
          disposition: "accepted",
          path: "Design/System/MacOS/B.md",
          expected_utf8: "b0",
          postimage_utf8: "b1",
          evidence: "accepted",
        },
      ],
    },
    {
      afterPublish: async (_file, index) => {
        if (index === 0) await writeFile(path.join(directory, "A.md"), "concurrent");
      },
    },
  );
  expect(result.outcome).toBe("RECOVERY_REQUIRED");
  expect(result.recovery_artifacts.length).toBeGreaterThan(0);
  expect(result.ledger.map(({ path: relative, state }) => [relative, state])).toEqual([
    ["Design/System/MacOS/A.md", "concurrent_replacement"],
    ["Design/System/MacOS/B.md", "restored"],
  ]);
  expect(result.partial_state).toEqual(["Design/System/MacOS/A.md:concurrent_replacement"]);
  expect(await readFile(path.join(directory, "A.md"), "utf8")).toBe("concurrent");
  expect(await readFile(path.join(directory, "B.md"), "utf8")).toBe("b0");
});
