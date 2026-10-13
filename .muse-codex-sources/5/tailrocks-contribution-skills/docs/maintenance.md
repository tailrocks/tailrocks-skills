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

Expected result: `OK 5 skills` plus the verified-facts summary.

Markdown check:

```sh
npx --yes markdownlint-cli2@0.23.3 "**/*.md" \
  "!.github/AGENTS.md" "!.github/CLAUDE.md"
```

Expected result: no issues. The version is pinned. There is no
shared markdownlint config yet, so the check uses default rules.
The two negations skip the generated `.github/AGENTS.md` and
`.github/CLAUDE.md` files. Never hand-edit generated files.

Native validator probes (read-only, no install):

```sh
claude plugin validate ./
muse plugins validate ./ --json
muse skills validate ./skills/tailrocks-contribute-recon
```

This record observed the expected result on 2026-10-07. `claude
plugin validate` passes with one author warning. The host manifest
holds name, version, and description only, per the common
structure.

`muse plugins validate` reports `valid: true`. It finds all five
skills through the portable root manifest. It lists warnings only:
inactive `.claude-plugin` overlay fields beside the authoritative
root, and the generated `.github/CLAUDE.md` symlink. `muse skills
validate` reports valid.

A known tension remains. `claude plugin validate --strict` fails
because it promotes the author warning to an error. Plain
validation passes, so the package installs. Do not add `author` to the host manifest
as a local fix: that would break the common structure. Resolve the
tension in the common design instead.

Generation diff. It proves `.github/` matches the generator output:

```sh
velnor-actions generate --output-dir /private/tmp/velnor-preview
diff -r --brief .github /private/tmp/velnor-preview/.github
```

Expected result: empty diff. The 0.1.0 generator preserves
`.github/PULL_REQUEST_TEMPLATE.md`. No restore step is necessary.
See the CI source section below.

## Policy version and update

The package pins these versions:

- alint: v0.17.0.
- Shared profile: `standards/alint/active.yml` at
  tailrocks-skills commit
  `7bdfcdd610aa95bb13f62261cda1a53f0fa870d3`.
- Pin:
  `sha256-dae9e8f91ac3f5e6a28fb56d67f230fc4c23cc4fbab4763ecc5cc5477a903fba`.
- markdownlint-cli2: 0.23.3.

Bump the pin in one pull request. Update the REV and HASH
together in `.alint.yml`. After the update, regenerate. Re-run
every verify command.

## CI source and regeneration

`.velnor/config.toml` is the source. `velnor-actions generate` writes
`.github/` from it. Never hand-edit `.github/` as the fix for a
workflow problem. Change the config. After the change, regenerate.

The 0.1.0 generator from velnor-new commit `47c7b5b2e` preserves
the required `.github/PULL_REQUEST_TEMPLATE.md` file. A regenerate
keeps the file in place. The generation diff comparison is empty.

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
Uninstall each plugin from each scope. Remove the old
marketplace. Add the new marketplace. Install the plugin. The order prevents
duplicates.

## Shared references

`runtime-trust.md` and `contribution-handoff.md` repeat in every
skill directory. Per-skill installs need self-contained directories.
Update every copy together. Compare one hash over the copies:

```sh
md5sum skills/*/references/runtime-trust.md skills/*/references/contribution-handoff.md
```

Expected result: one shared hash per filename across all five
skills.

## Prohibited evaluation content

Never add evaluation content to skills, references, templates,
task definitions, or CI. This ban covers behavioral benchmarks,
trigger precision and recall, repeated model trials, and scored
wording comparisons. It covers model-family matrices, pressure
scenarios, holdout datasets, and judge or grader models. It covers
pass-rate targets, token and latency comparisons, mandatory failing
baselines, and task trials under any name. Do not relabel such work
as smoke, pressure, or compatibility checks. A sample task never
proves behavior.

Before aggregate commands, read each task definition. Before
execution, strip evaluation steps. Never trust the command name.

To find violations, search case-insensitively for `benchmark`,
`trigger precision`, `trigger recall`, and `model trial`. Include
`scored output`, `model-family`, `pressure scenario`, and `holdout`.
Include `judge`, `grader`, `pass-rate`, and `task trial`. Before a
change, read the surrounding text: a prohibition or a historical
explanation is not an active requirement.
