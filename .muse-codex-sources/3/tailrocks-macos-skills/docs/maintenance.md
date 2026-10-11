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

Frontmatter and ID check. It does a check of the frontmatter
block, the name key, name and directory agreement, id charset, and
the description key for each skill:

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

Expected result: `OK 15 skills` plus the verified-facts summary.

Markdown check:

```sh
npx --yes markdownlint-cli2@0.23.3 "**/*.md"
```

Expected result: no issues. The version is pinned. There is no
shared markdownlint config yet, so the check uses default rules.

Native validator probes (read-only, no install):

```sh
claude plugin validate ./
muse plugins validate ./ --json
muse skills validate ./skills/tailrocks-swift-review
```

Expected result: `claude plugin validate` gives no errors.
`muse plugins validate` gives no errors and lists warnings only.
`muse skills validate` gives no errors. These probes did not run
for this revision. Record their output when they run.

Generation diff. It proves `.github/` matches the generator output:

```sh
velnor-actions generate --output-dir /private/tmp/velnor-preview
diff -r --brief .github /private/tmp/velnor-preview/.github
```

Expected result: empty diff. The generator preserves
`.github/PULL_REQUEST_TEMPLATE.md`. No restore step is necessary.
See the CI source section below.

## Policy version and update

- alint: v0.17.0.
- Shared profile: `standards/alint/active.yml` at
  tailrocks-skills commit
  `7bdfcdd610aa95bb13f62261cda1a53f0fa870d3`.
- Pin:
  `sha256-dae9e8f91ac3f5e6a28fb56d67f230fc4c23cc4fbab4763ecc5cc5477a903fba`.
- markdownlint-cli2: 0.23.3.

Bump the pin in one pull request: update the REV and HASH together
in `.alint.yml`, regenerate, and re-run every verify command.

## CI source and regeneration

`.velnor/config.toml` is the source. `velnor-actions generate` writes
`.github/` from it. Never hand-edit `.github/` as the fix for a
workflow problem. Change the config and regenerate.

Template preservation: the 0.1.0 generator (velnor-new commit
47c7b5b2e) preserves the hand-placed
`.github/PULL_REQUEST_TEMPLATE.md`. The file survives each
regenerate. A comparison of `.github/` against a fresh preview gave
an empty diff.

## Release and migration

Release in this order:

1. Tag the release commit.
2. Resolve the exact commit SHA of the tag.
3. Bump the `rev` of this plugin in the central catalog at
   `tailrocks/tailrocks-skills`.
4. Regenerate the native catalogs from the central source.
5. Re-run every verify command.
6. Publish the tag.

Migrate installs per the agent procedures in `installation.md`.
Uninstall each plugin per scope, remove the old marketplace, add the
new marketplace, and install the plugin. The order prevents
duplicates.

## Prohibited evaluation content

Never add evaluation content to skills, references, templates, task
definitions, or CI. This ban covers behavioral benchmarks, trigger
precision and recall, repeated model trials, scored wording
comparisons, model-family matrices, pressure scenarios, holdout
datasets, judge or grader models, pass-rate targets, token and
latency comparisons, mandatory failing baselines, and task trials
under any name. Do not relabel such work as smoke, pressure, or
compatibility checks. A sample task never proves behavior.

Before aggregate commands, read each task definition and strip
evaluation steps. Never trust the command name. To find violations,
search case-insensitively for `benchmark`, `trigger precision`,
`trigger recall`, `model trial`, `scored output`, `model-family`,
`pressure scenario`, `holdout`, `judge`, `grader`, `pass-rate`, and
`task trial`. Read the surrounding text before a change: a
prohibition or a historical explanation is not an active
requirement.
