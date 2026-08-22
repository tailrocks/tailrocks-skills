# Portfolio behavioral-evidence matrix

- Source revision: `2626d51827747c3b3e0e76cd20a7d38363c82648`
- Coverage is authored intent, not execution proof. `N/B/S/NM` means normal/boundary/safety/near-miss.
- “Fixture adequate” means the stored fixture can establish every claimed normal path. It does not mean the case ran.
- Baseline, repeated/pass^k, mutation, complete runtime lock, and tool trace are absent for every skill. Historical prose claiming a smoke run has no persisted pinned/raw record and remains unmeasured.

| Skill | Cases | Authored coverage | Fixture adequate | Baseline | Repeated/pass^k | Mutation | Complete model/tool/checker/runtime pins | Tool trace |
|---|---:|---|:---:|:---:|:---:|:---:|:---:|:---:|
| tailrocks-agents-md | 5 | N,B,S | yes | no | no | no | no | no |
| tailrocks-audit | 14 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-axum-best-practices | 4 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-brainstorm | 7 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-checkout-pr | 3 | N,B,S | no | no | no | no | no | no |
| tailrocks-code-health | 3 | N,B,S | yes | no | no | no | no | no |
| tailrocks-contribute | 8 | N,B,S | no | no | no | no | no | no |
| tailrocks-create-pr | 3 | N,B,S | no | no | no | no | no | no |
| tailrocks-document | 5 | N,B,S | no | no | no | no | no | no |
| tailrocks-finalize | 6 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-graphql-best-practices | 4 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-grpc-best-practices | 3 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-idea | 3 | N,B,S,NM | yes | no | no | no | no | no |
| tailrocks-improve | 6 | N,B,S | no | no | no | no | no | no |
| tailrocks-macos-design | 21 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-macos-visual-qa | 6 | N,B,S | no | no | no | no | no | no |
| tailrocks-merge-pr | 11 | N,B,S | no | no | no | no | no | no |
| tailrocks-plan | 12 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-pr-template | 3 | N,B,S | no | no | no | no | no | no |
| tailrocks-prove | 7 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-reconcile | 18 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-record-decision | 4 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-record-feedback | 4 | N,B,S,NM | yes | no | no | no | no | no |
| tailrocks-refresh-pr | 3 | N,B,S | no | no | no | no | no | no |
| tailrocks-remediate | 5 | N,B,S,NM | yes | no | no | no | no | no |
| tailrocks-research | 6 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-rethink | 5 | N,B,S,NM | yes | no | no | no | no | no |
| tailrocks-retrospect | 11 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-review-pr | 5 | N,B,S,NM | yes | no | no | no | no | no |
| tailrocks-rust-best-practices | 4 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-rust-project-setup | 3 | N,B,S | no | no | no | no | no | no |
| tailrocks-simplify | 5 | N,B,S,NM | yes | no | no | no | no | no |
| tailrocks-skill-audit | 3 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-skill-create | 3 | N,B,S | no | no | no | no | no | no |
| tailrocks-skill-refactor | 3 | B,S,NM | no | no | no | no | no | no |
| tailrocks-skill-update | 3 | N,B | no | no | no | no | no | no |
| tailrocks-swift-best-practices | 7 | N,B,S | no | no | no | no | no | no |
| tailrocks-swift-project-setup | 7 | N,B,S | no | no | no | no | no | no |
| tailrocks-tanstack-project-setup | 3 | N,B,S | no | no | no | no | no | no |
| tailrocks-tui-design | 6 | N,B,S,NM | yes | no | no | no | no | no |
| tailrocks-typescript-best-practices | 3 | N,B,S | no | no | no | no | no | no |
| tailrocks-web-design | 7 | N,B,S,NM | no | no | no | no | no | no |
| tailrocks-web-visual-qa | 6 | N,B,S,NM | yes | no | no | no | no | no |

Totals: 43 skills, 258 authored cases, 10 fixture-adequate skill sets, zero persisted behavioral certification records.
