# Maintenance

## Verify commands

Run each command from the repository root. Every command must exit 0.

Structure check:

```sh
alint check
```

Expected result: no errors. The check enforces required paths,
manifest agreement, README sections, skill-id shape, and the ban on
component catalogs.

Strict-JSON check. It rejects comments, trailing commas, and
duplicate keys in the three manifests:

```sh
python3 - <<'EOF'
import json
FILES = ["plugin.json", ".claude-plugin/plugin.json", ".kimi-plugin/plugin.json"]
def hook(pairs):
    seen = set()
    for key, _ in pairs:
        if key in seen:
            raise ValueError("duplicate key: " + key)
        seen.add(key)
    return dict(pairs)
for path in FILES:
    with open(path) as handle:
        json.load(handle, object_pairs_hook=hook)
    print("OK " + path)
EOF
```

Expected result: one `OK` line per manifest.

Frontmatter and ID check. It verifies the frontmatter block, the
name key, name and directory agreement, id charset, and the
description key for each skill:

```sh
python3 - <<'EOF'
import glob, os, re, sys
found = sorted(glob.glob("skills/*/SKILL.md"))
errors = []
for path in found:
    skill_id = path.split(os.sep)[1]
    text = open(path).read()
    match = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not match:
        errors.append(path + ": missing frontmatter block")
        continue
    front = match.group(1)
    name = re.search(r"^name:\s*(\S+)\s*$", front, re.M)
    if not name:
        errors.append(path + ": missing name key")
        continue
    if name.group(1) != skill_id:
        errors.append(path + ": name does not match directory")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", name.group(1)):
        errors.append(path + ": invalid skill id")
    if not re.search(r"^description:", front, re.M):
        errors.append(path + ": missing description key")
if errors:
    print("\n".join(errors))
    sys.exit(1)
print("OK %d skills: names match, ids valid, descriptions present"
      % len(found))
EOF
```

Expected result: `OK 1 skills` plus the verified-facts summary.

Markdown check:

```sh
npx --yes markdownlint-cli2@0.23.3 "README.md" "AGENTS.md" \
  "CHANGELOG.md" "docs/**/*.md" "skills/*/SKILL.md"
```

Expected result: no issues. The version is pinned. There is no
shared markdownlint config yet, so the check uses default rules.
The scope covers the maintained package files. It excludes
`skills/asd-ste100/references/`, which carries pre-existing
line-length debt from the untouched corpus, and `.github/`,
which the generator owns. Do not hand-edit `.github/` to
clear its findings.

Native validator probes (read-only, no install):

```sh
claude plugin validate ./
muse plugins validate ./ --json
muse skills validate ./skills/asd-ste100
```

Expected result, observed 2026-10-07: `claude plugin validate`
passes with one author warning (the host manifest carries name,
version, and description only, per the common structure).
`muse plugins validate` reports `valid: true`, finds the skill
through the portable root manifest, and lists warnings only. The
warnings list inactive `.claude-plugin` overlay fields beside the
authoritative root. `muse skills validate` reports valid.

Known tension: `claude plugin validate --strict` promotes the author
warning to an error. Plain validation passes, so the package
installs. Do not add `author` to the host manifest as a local fix:
that would break the common structure. Resolve the tension in the
common design instead.

A validator pass never proves that installation succeeds.

Generation diff. It proves `.github/` matches the generator output:

```sh
velnor-actions generate --output-dir /private/tmp/velnor-preview
diff -r --brief .github /private/tmp/velnor-preview/.github
```

Expected result: empty diff. Use `velnor-actions` 0.1.0 built
from `velnor-new` at `47c7b5b2e` or a later release with the
same behavior. That generator preserves the hand-placed
`.github/PULL_REQUEST_TEMPLATE.md`. Observed 2026-10-07:
exit 0, empty diff, template byte-identical.

## Policy version and update

- alint: v0.17.0.
- Shared profile: `standards/alint/active.yml` at
  tailrocks-skills commit
  `7bdfcdd610aa95bb13f62261cda1a53f0fa870d3`.
- Pin:
  `sha256-dae9e8f91ac3f5e6a28fb56d67f230fc4c23cc4fbab4763ecc5cc5477a903fba`.
- markdownlint-cli2: 0.23.3.

Bump the pin in one pull request. Update the REV and HASH together
in `.alint.yml`, regenerate, and re-run every verify command.

## CI source and regeneration

`.velnor/config.toml` is the source. `velnor-actions generate` writes
`.github/` from it. Never hand-edit `.github/` as the fix for a
workflow problem. Change the config and regenerate. The
0.1.0 generator preserves the hand-placed
`.github/PULL_REQUEST_TEMPLATE.md` across regenerates.

## Release and migration

Release in this order:

1. Tag the release commit.
2. Resolve the exact commit SHA of the tag.
3. Bump the `rev` of this plugin in the central catalog at
   `tailrocks/tailrocks-skills`.
4. Align the central entry id with the installed plugin name
   `asd-ste100-skill`.
5. Regenerate the native catalogs from the central source.
6. Re-run every verify command.
7. Publish the tag.

Keep the repository private through the release. Publish only the
permitted catalog metadata. Never publish the bundled references.

Migrate installs per the agent procedures in `installation.md`.
Uninstall each plugin per scope, remove the old marketplace, add the
new marketplace, and install the plugin. The order prevents
duplicates.

## Dictionary coverage and source gaps

The bundled dictionary holds 20 letter shards with 1,956 entries.
Letters A through H use full entries. Letters I through Z use compact
table rows. `skills/asd-ste100/references/dictionary/index.md`
records the per-shard counts. The authorized Issue 9 copy stays
authoritative for words outside the bundled coverage.

Four shard tails disagree with the final headwords in
`maintainer/source-ledger.md`. `d.md` ends at `dust`, `e.md` ends at
`exude`, `f.md` ends at `further`, and `q-r.md` ends at `rub`. Only
a source-holder can decide whether the shard or the ledger is right.
Do not edit entries to close these gaps without that examination.

## Prohibited evaluation content

Never add evaluation content to skills, references, templates, task
definitions, or CI. This ban covers behavioral benchmarks, trigger
precision and recall, repeated model trials, scored wording
comparisons, model-family matrices, and pressure scenarios. It also
covers holdout datasets, judge or grader models, pass-rate targets,
token and latency comparisons, mandatory failing baselines, and task
trials under any name. Do not relabel such work as smoke, pressure,
or compatibility checks. A sample task never proves behavior.

Before aggregate commands, read each task definition and strip
evaluation steps. Never trust the command name. To find violations,
search case-insensitively for `benchmark`, `trigger precision`,
`trigger recall`, `model trial`, `scored output`, `model-family`,
`pressure scenario`, `holdout`, `judge`, `grader`, `pass-rate`, and
`task trial`. Read the surrounding text before a change: a
prohibition or a historical explanation is not an active
requirement.
