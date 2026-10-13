# macOS skills guides

This package holds fifteen skills. The skills design native macOS
interfaces, scaffold and audit Swift projects, integrate a Rust
application core, and verify rendering through capture and comparison.

Two skills are model-selectable. Thirteen skills are user-only and
need an explicit human command:

- `tailrocks-macos-design-review` scores a rendered screen.
- `tailrocks-macos-design-systematize` persists approved design
  learning.
- `tailrocks-macos-visual-baseline` freezes a visual baseline.
- `tailrocks-macos-visual-qa` verifies the current render.
- `tailrocks-macos-visual-regression` compares captures with a
  baseline.
- `tailrocks-swift-agent-integration` wires Xcode for agent work.
- `tailrocks-swift-project-audit` audits a project baseline.
- `tailrocks-swift-project-remediate` closes approved baseline gaps.
- `tailrocks-swift-project-setup` scaffolds a new project baseline.
- `tailrocks-swift-refactor` restructures Swift code.
- `tailrocks-swift-review` reviews Swift code.
- `tailrocks-swift-rust-core-boundary` designs the Swift and Rust
  boundary.
- `tailrocks-swift-rust-core-setup` wires the Rust core lane.

## Guides

- `installation.md` installs the package on eight coding agents.
- `usage.md` shows how to select each skill and what each skill
  returns.
- `compatibility.md` records the test result of each client route.
- `maintenance.md` lists the checks, the policy version, and the
  release procedure.
- `troubleshooting.md` fixes common install and selection failures.

## Skills

| Skill | Task |
| --- | --- |
| `tailrocks-macos-design` | Design a native screen and prototype it. |
| `tailrocks-macos-design-review` | Score a rendered screen. User-only. |
| `tailrocks-macos-design-systematize` | Record approved learning. User-only. |
| `tailrocks-macos-visual-baseline` | Freeze a visual baseline. User-only. |
| `tailrocks-macos-visual-qa` | Verify the current render. User-only. |
| `tailrocks-macos-visual-regression` | Compare captures. User-only. |
| `tailrocks-swift-agent-integration` | Wire Xcode for agent work. User-only. |
| `tailrocks-swift-best-practices` | Write Swift and SwiftUI code. |
| `tailrocks-swift-project-audit` | Audit a project baseline. User-only. |
| `tailrocks-swift-project-remediate` | Close baseline gaps. User-only. |
| `tailrocks-swift-project-setup` | Start a project baseline. User-only. |
| `tailrocks-swift-refactor` | Restructure Swift code. User-only. |
| `tailrocks-swift-review` | Review Swift code. User-only. |
| `tailrocks-swift-rust-core-boundary` | Plan Swift/Rust boundary. User-only. |
| `tailrocks-swift-rust-core-setup` | Wire the Rust core lane. User-only. |

Each skill body lives in its own directory under `skills/`. Read
`skills/tailrocks-swift-review/SKILL.md` for one complete example.

## Requirements

Build and test work needs Xcode on macOS. Visual work needs an
interactive graphical session with Screen Recording, Accessibility,
and Automation grants. Keep the complete package checkout for
the visual harness installer and the project setup templates.
