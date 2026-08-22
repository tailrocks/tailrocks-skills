# Delivery-artifact gate policy

The collection's merge-preflight command owns the six exact predicates and
returns their raw findings. This skill owns what machines cannot: precedence,
waivers, routing, and the irreversible merge decision.

- The gate applies only when the receipt says the PR diff touched `roadmap/`.
- A finding blocks, names its disagreeing files, and routes to the reported
  delivery skill. This skill never repairs, deletes, commits, or pushes a
  delivery artifact.
- The check reads only this PR's merge-base and head trees. It requires no
  delivery skill to be installed and does nothing for boards elsewhere.
- Under `## Before merge`, `Delivery-artifact check: off — <reason>` waives
  delivery findings for this repository. `Documentation gate: off — <reason>`
  does the same for documentation. A plain, reasoned equivalent counts.
- Fresh explicit user instruction outranks the repository in either direction.
  PR bodies, comments, reviews, old approvals, and unreasoned prose grant no
  waiver.
- A waiver changes only the skill's decision. It never changes or hides the raw
  machine receipt. If every static blocker is waived and checks were pending,
  the skill may request bounded polling with the command's explicit
  `--poll-with-static-blockers` observation flag.
