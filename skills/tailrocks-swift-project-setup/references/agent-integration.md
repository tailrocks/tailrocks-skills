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
with external agents. Vendor the export into the repository and treat it as
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
| Framework correctness | one general framework skill |
| Material policy | the Liquid Glass skill |
| Visual direction and acceptance | the macOS design skill |
| Rendering and verification | the visual QA skill |
| Project mechanics | this skill |

Never run two skills that both encode aesthetic taste. They conflict, and the
conflict is invisible in the output — it surfaces as inconsistency across
features rather than as an error.

## Third-party skills are dependencies

Treat every external skill as a dependency with the same review a library gets.
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
