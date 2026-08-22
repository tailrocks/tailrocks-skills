# Agent integration

## The Xcode bridge

Xcode exposes project context, building, testing, and previews to external agents
through a bridge command. Enable it in Xcode's settings under Intelligence —
allow external agents to use Xcode tools — and keep the relevant project or
workspace **open in a running Xcode**; the bridge fails outright otherwise.

It provides build, file, and preview-rendering tools. It provides **no screenshot
capability and no interface automation** — that gap is filled by the visual QA
harness, not by the bridge.

Verify what the installed Xcode actually exposes before writing instructions that
depend on a specific tool name; the tool list has changed between releases.

## Vendor upstream agent knowledge read-only

Recent Xcode versions ship first-party agent skills that can be exported for use
with external agents. Vendor the export into the application repository and treat it as
read-only upstream material:

```
Vendor/
└── AppleAgentSkills/
```

Refresh it whenever the project's Xcode version changes. It should outrank
community framework guidance when the two conflict on API facts.

Two limits to record so nobody assumes otherwise:

- The export command is **not documented by Apple**. Only the bridge command is.
  Treat the export as useful but unsupported, and re-verify it after each Xcode
  update rather than depending on it in an automated pipeline.
- The exported set covers framework specialization, framework release notes, an
  interface-framework modernization skill, test modernization, device
  interaction, memory-safety adoption, and a security-settings audit. **It
  contains no Liquid Glass skill and no macOS skill.** That gap is exactly why
  project-local material and vetted third-party skills remain necessary.

## One owner per responsibility

Installing more design skills does not monotonically improve output. Published
evaluation of curated agent skills found an average pass-rate improvement
alongside a meaningful set of tasks made *worse*, with focused two-or-three-module
skills outperforming comprehensive documentation. Retrieval degrades as a skill
collection grows.

Assign exactly one automatic owner per responsibility and make everything else
explicitly invoked:

| Responsibility | Owner |
|---|---|
| Framework correctness | `tailrocks-swift-best-practices` |
| Material policy, visual direction, and acceptance rubric | `tailrocks-macos-design` |
| Current render, baseline freeze, regression | `tailrocks-macos-visual-qa`, `tailrocks-macos-visual-baseline`, `tailrocks-macos-visual-regression` |
| Project mechanics | `tailrocks-swift-project-setup` |
| Agent integration | `tailrocks-swift-agent-integration` |
README's family ownership table is canonical.

Never run two skills that both encode aesthetic taste. They conflict, and the
conflict is invisible in the output — it surfaces as inconsistency across
features rather than as an error.

## Third-party skills are dependencies

Treat every installed third-party skill as a dependency with the same review a library gets.
An empirical study of a large public skill corpus reported that roughly a quarter
contained at least one identified vulnerability pattern, with skills bundling
executable scripts significantly more likely to. That is one methodology and not
proof about any particular repository, but it justifies dependency-level review.

Policy:

1. Install project-locally, not globally.
2. Pin a tag or commit. Do not track the default branch.
3. Read the whole skill file.
4. Inspect bundled scripts, hooks, tool-server dependencies, install steps, and
   network calls before enabling execution.
5. Record which responsibility it owns.
6. Disable overlapping automatic skills.
7. Run a controlled before-and-after comparison rather than assuming improvement.
8. Update only through reviewed changes.

Two selection cautions specific to this platform:

- **License.** Much of the macOS and Liquid Glass skill ecosystem ships with no
  license file at all. Read a skill for ideas freely; do not vendor an unlicensed
  one into a repository.
- **Web-built design skills.** The most popular design-taste skills are built for
  the web, and their defaults — avoid system fonts, avoid neutral grays, avoid
  spring easing — are reasonable there and wrong on Apple platforms, where the
  system font, semantic neutrals, and interruptible springs are the correct
  tools. A web taste skill left automatically active will push an agent toward
  hand-rolled glassmorphism instead of the real material APIs.

## What the skill ecosystem does and does not cover (surveyed 2026-08-11)

The public agent-skill ecosystem was surveyed and analyzed rather than
adopted: this collection never links to or vendors third-party skills.
Relevant knowledge is extracted, verified against Apple's own documentation
and SDKs, and carried in these skills directly. The survey's durable findings:

- **The official sets have the gap.** Neither Apple's Xcode-exported skills
  (see "Vendor upstream agent knowledge read-only" above) nor the major
  first-party skill collections contains a Liquid Glass skill or a macOS
  skill. Native macOS material policy has to come from a project's own
  skills — which is exactly what this family provides.
- **Popularity concentrates on web.** Every widely adopted design skill is
  web-oriented or process-generic; native macOS coverage in the wild is
  sparse, young, and thin. Popularity is not a signal of macOS correctness.
- **"Liquid glass" in a name does not mean the material.** A large share of
  self-described liquid-glass guidance teaches CSS/React glassmorphism — the
  hand-rolled imitation the web-taste caution above warns about. Anything
  adopted by analogy from that corpus produces frozen fakes instead of the
  system material. Extract ideas; never copy recipes.
- **Licensing in that corpus is unreliable.** Much of it ships with no
  license at all. Read for analysis only; never vendor unlicensed content —
  and since this collection extracts and re-verifies rather than vendors,
  nothing external enters the repository either way.

## Project instructions

Keep the repository's agent instructions file compact: platform and the four
target values, architecture, build and test commands, the native-first
requirement, where the design artifacts live, the required review sequence,
completion criteria, and prohibited patterns.

Do not put a design textbook in it. Long reusable workflows belong in skills,
which load on demand; instructions files are loaded for every task and compete
with the actual work for context.

A completion rule worth stating verbatim in that file:

```
A user-interface change is not complete until the build succeeds, tests pass,
the required states are rendered, screenshots are attached to the review, the
visual and accessibility reviews are done by an agent that did not implement
the change, the rubric passes, and no hard failure remains.
```
