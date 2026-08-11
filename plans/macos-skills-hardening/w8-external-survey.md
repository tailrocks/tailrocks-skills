# W8 — External skill survey (internal evidence, 2026-08-11)

Per the maintainer's direction (2026-08-11), shipped skill content never
references external skills — knowledge is researched, analyzed, and extracted
into our own skills instead. This file preserves the raw survey as internal
planning evidence backing the distilled findings now in
`skills/tailrocks-swift-project-setup/references/agent-integration.md`.

Every URL returned HTTP 200 this session; licenses were read from the GitHub
API and raw LICENSE files.

| Repository | Stars | License | macOS coverage | Class |
|---|---|---|---|---|
| github.com/obra/superpowers | 270k | MIT | none — process/workflow skills | general |
| github.com/anthropics/skills | 167k | mixed per-skill (Apache-2.0 e.g. frontend-design; Anthropic all-rights-reserved e.g. docx); no top-level LICENSE | none — no macOS, no Liquid Glass skill | web/general |
| github.com/nextlevelbuilder/ui-ux-pro-max-skill | 115k | MIT | none | web |
| github.com/pbakaus/impeccable | 57k | Apache-2.0 | none | web |
| github.com/Prisma-Labs-Dev/apple-skills | 301 | MIT | partial — ios-liquid-glass is iOS-scoped; macOS only as SPM packaging guide | native |
| github.com/Wholiver/swiftui-design-skill | 164 | MIT | cross-platform SwiftUI, not macOS-specific | native |
| github.com/haider-nawaz/liquid-glass-skill | 37 | none — read-only, never vendor | claims iOS 26+ / macOS 26+ | native |
| github.com/Jonnycatx/apple-full-stack-genius-skill | 21 | MIT | claims iOS/macOS/visionOS | native |
| github.com/2dubu/liquid-glass | 18 | MIT | iOS 26 only | native |
| github.com/unobtuse/einui-claude-skill | 8 | none — read-only, never vendor | React glassmorphism, not the material | web |
| github.com/ngocanhnckh/liquid-glass-frontend-skill | 6 | MIT | "Apple-style" web frontends | web |
| github.com/juanlara-aidev/macos-26-design | 5 | MIT (LICENSE file; GitHub shows "Other") | macOS 26 drop-in skill | native |
| github.com/giorgio-a11y/liquid-glass-skill | 2 | none — read-only, never vendor | claims native macOS/iOS + HIG | native |

Analysis extraction policy applied to the skill file: official-set gap,
web-concentration of popularity, glassmorphism-vs-material distinction, and
the unlicensed-corpus caution — stated as findings with no external
references. Anything worth teaching from these repos is re-derived from
Apple's documentation and SDK probes before it enters a skill.
