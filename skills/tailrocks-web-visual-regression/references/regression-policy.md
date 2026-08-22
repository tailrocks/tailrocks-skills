# Regression policy

The baseline record is the comparison contract. Before launch, verify every
requested matrix cell has one regular baseline PNG and matching environment,
mask, and budget metadata. Hash the baselines and project state before and after.

Run without snapshot-update authority. Candidate screenshots, traces, reports,
browser caches, and temporary output live outside the subject repository. A
missing baseline is `MISSING`, not a new baseline. A skipped browser assertion or
unexplained registry cell is `SKIPPED`, never green.

Classify each cell independently. `MATCH` means the exact environment stayed
within its declared budget. `DRIFT` includes pixel excess or dimension mismatch.
`INVALID` covers changed identities, wrong server, source mutation, baseline
mutation, malformed metadata, or cleanup uncertainty. Any status other than
`MATCH` blocks overall `PASS`.

Never invoke snapshot updates, accept received pixels as expected pixels, widen a
budget, add a mask, edit a fixture, or claim design approval. Those are baseline
or human decisions outside this owner.
