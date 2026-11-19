# Common structure

This file gives the required repository structures.
It covers active packages, marketplace additions, and retired
repositories.
It also gives manifest rules, skill body order, and README order.
For writing rules, see [writing.md](writing.md).
Obey this file when you create or change a repository.

## Active skill package

Use the same structure for every active skill package.
Use the same names, heading order, policy, and verification method.
Use only documented differences for role or subject.

| Path | Content |
| --- | --- |
| README.md | Purpose, skills, install, use, doc links |
| LICENSE | The applicable license text |
| CHANGELOG.md | Package changes and migration information |
| AGENTS.md | Short instructions for maintenance |
| plugin.json | The portable plugin manifest |
| .claude-plugin/plugin.json | Claude manifest required by Tailrocks |
| .kimi-plugin/plugin.json | Kimi manifest with the skills directory |
| .antigravity-plugin/plugin.json | Native Antigravity manifest |
| package.json | OpenCode exports and dependencies, pi skill paths, and package files |
| bun.lock | Resolved dependency graph, maintained with Bun 1.4.4 |
| mise.toml and mise.lock | Pinned tools and frozen dependency verification task |
| index.js | Amp directory plugin that registers the canonical skill paths |
| adapters/opencode/index.js | OpenCode V2 server plugin that registers the canonical skills |
| scripts/validate-package.py | Deterministic validation of manifests, registrars, and packaged resources |
| .alint.yml | Shared policy references, narrow local settings |
| .velnor/config.toml | The supported source configuration for CI |
| .github/ | Files from the supported CI generation method |
| .github/PULL_REQUEST_TEMPLATE.md | The single PR template |
| skills/ID/SKILL.md | The authoritative skill instructions |
| skills/ID/references/ | Necessary detailed agent references |
| skills/ID/assets/ | Necessary static examples and templates |
| skills/ID/agents/openai.yaml | Codex presentation and invocation policy |
| skills/ID/references/model-routing.md | Installed copy of the shared model-routing reference |
| scripts/, lib/, schemas/, examples/, assets/, references/ | Package-root resources when a workflow requires them |
| docs/README.md | Documentation index |
| docs/installation.md | Host-specific install, update, and removal commands |
| docs/usage.md | Use cases, inputs, and examples |
| docs/compatibility.md | Versions, evidence, and limitations |
| docs/architecture.md | Package layout, runtime resources, and native registrars |
| docs/models.md | Model choices, effort, and host controls |
| docs/verification.md | Commands, versions, measured results, and limits |
| docs/maintenance.md | Contribution, verification, release steps |
| docs/troubleshooting.md | Known failures and recovery steps |

In the table, ID means the skill ID.
Tailrocks requires its Claude manifest for consistent distribution metadata.
Generate its author from the portable manifest with its name, version, and
description. This also avoids a missing-author warning in Claude validation.
Claude itself can discover a standard plugin layout without that manifest.
See the [Claude manifest reference](https://code.claude.com/docs/en/plugins-reference#manifest-file).
Before you create an optional skill directory, make sure that its
planned files are necessary.
Record other necessary files in the shared structure policy.
Keep required attribution and notices.
Use the same location for each notice type across active packages.

Before you keep tool configuration, make sure that a documented
maintenance command needs it.
Use one common filename for each retained configuration.
Keep a language package file when a native installer or maintenance command
requires it.

Keep task procedures in skills and their required resources.
Keep manifests, project documentation, and maintenance files in the
source package.
Do not add an archive build only to remove them.
Keep maintenance configuration separate from agent procedures.
Generate the two native registrars from the canonical skill inventory.
OpenCode reads the Markdown body and registers its installed file path.
Amp registers the skill directory. Preserve the invocation policy for each
skill in both registrars. Keep tools, hooks, MCP, and background processes
outside these instruction packages.

Preserve the package-root scripts, vendored libraries, schemas, and licenses
that installed workflows require. Include these files in the npm package.
Keep installed script paths valid from the skill that invokes them.
Commit the dependency lockfile with the package manifest.
Use the pinned Bun version for lockfile changes and frozen verification.
Include the lockfile in the package archive.

## Marketplace additions

Use the common README and documentation conventions.
Add only the central inventory, native catalogs, shared policy, and
their maintenance configuration.
Put shared alint rules under standards/alint/.
Keep native templates and the package validator under standards/native/.
Keep the canonical model-routing reference under standards/models/.
Put the common structure and writing rules under docs/standards/.
Use .alint.yml with the marketplace profile.
Make that profile reject active skill payloads.

The marketplace lists packages.
It does not duplicate their instructions.
Do not add a marketplace plugin.json file.
Do not add a fake skills directory.
Use [native distribution](distribution.md) for source pins and catalog updates.

The marketplace keeps these files:

- README.md
- docs/installation.md and docs/compatibility.md
- docs/migration.md
- docs/verification.md
- docs/standards/
- standards/alint/active.yml
- standards/alint/marketplace.yml
- standards/alint/retired.yml
- catalog.json and the generated native catalogs
- scripts/install-command.py to print native commands
- scripts/sync-packages.py to synchronize generated package files
- .alint.yml with the marketplace profile
- .velnor/config.toml
- .github/ from the supported generation method

## Retired repository

Keep the repository history and required notices.
Before you remove the old payload, move useful differences to the
current owner.
Remove active skill definitions, plugin manifests, catalogs, native entry
points and adapters, dependency packages, and obsolete automation.

Keep .alint.yml with the retired profile.
Keep the policy configuration and minimal generated CI.
Make that CI reject active skills, plugin manifests, catalogs, and native
package entry points.
Write a short migration notice with the canonical repository and the
current installation guide.
Remove the retired package from active catalogs.
Do not delete the historical repository.

## Manifest rules

Use the Agent Plugins 1.0.0 format for the portable root manifest.
Use this schema identifier:

`https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`

Keep portable identity fields in plugin.json.
Put supported host extensions in their documented locations.
Do not add a portable skills field.
The skills location is fixed.

Keep one maintained value for name, version, description, repository,
and license.
Make Claude, Kimi, Antigravity, and npm agree on name, version, and description.
Use deterministic generation or exact consistency checks for repeated
metadata.

Keep the Claude manifest only for the supported Claude method.
In the Kimi manifest, set "skills": "./skills/".
Without this field, Kimi uses a root SKILL.md file.
Do not create both Kimi manifest alternatives.

Remove redundant Muse or Codex manifests when the portable method
replaces them.
Before removal, examine the declared minimum client version.
Give Antigravity its native schema in .antigravity-plugin/plugin.json.
Keep the portable schema in the root manifest. Point the OpenCode package
export at its server registrar. Set pi.skills to an array containing ./skills.

Make all package paths resolve within the installed package.
Do not make a developer checkout outside that package necessary.
Do not use a symlink to escape the package root.

If a copy is necessary for installation, copy the complete skill
directories.
Keep all necessary references and assets with them.
Examine sibling-skill links and repository-root links.
Make sure that the installed unit contains every required file.
If only the complete package contains those files, give that
installation requirement.

When possible, keep each skill's required resources inside that skill.
If separate skill installation lacks required files, do not recommend
that method.

## Skill body order

Use SKILL.md as the single maintained procedure for each skill.
Do not keep a second definition in docs/skills/*/definition.md.
Use YAML frontmatter with a valid name and description.
Use lowercase letters, digits, and single hyphens in the skill ID.
Use a letter or digit at each end of the ID.
Keep the ID between 1 and 64 characters.

Make the ID agree with the skill directory.
Keep the description within 1,024 characters.
Give the skill task and its selection conditions.
If nearby skills have similar tasks, give the important exclusions.
Keep optional metadata small.
Use only documented fields.

Use this common body order:

1. Use this skill
2. Before you start
3. Procedure
4. Result
5. Completion checks
6. References

The six script-backed pull-request command companions in Repository Skills
retain their command-reference headings.
These headings describe modes, returned states, exit codes, and script checks.
Keep selection conditions, inputs, commands, safeguards, outcomes, and references
explicit in those companions.
Use the common order for other authored instruction skills.

Link the bundled model-routing guide where the task requires model selection.
Put the required inputs before the procedure.
Put the intended output before the completion checks.
Put important side effects before the applicable action.
Keep failure handling near the action that can fail.

Keep each `SKILL.md` file at most 500 total lines, including frontmatter.
When possible, use shorter text.
Move conditional detail to focused reference files.
Give the selection conditions for each reference.
Do not require readers to read every reference for every task.
Do not use long chains of references.

Use relative links that work after installation.
Give each skill one useful user task.
Before a merger, compare the inputs, authority, procedure, and result.
If the differences need separate user tasks, keep separate skills.
Before a skill merger, make sure that the combined procedure keeps
those differences clear.
Do not merge only to reach a lower skill count.

Remove generic advice that adds no project knowledge.
Keep useful domain facts, examples, and known failure conditions.
Do not turn a skill into a long universal policy document.
Keep human installation instructions in docs/installation.md.
Keep useful selection boundaries.
Keep automatic discovery, explicit selection, and authority to change
external state separate.

Do not use a prose condition as proof of an enforced security control.
If the task gives no reason for manual selection, do not make manual
selection necessary.
Use the current user request to set the scope.
For stages that the user already authorized, do not add a requirement
for a new invocation.

All skills in Agent Policy require an explicit user invocation.
Keep Vitalik Mode in that package with the skill ID `vitalik-mode`.
Use `disable-model-invocation: true` in each policy's frontmatter and
`policy.allow_implicit_invocation: false` in its OpenAI companion.
This documented native field is a package-specific extension to the portable
frontmatter subset. Do not remove it to satisfy a stricter authoring helper.
Begin the description and the first workflow instruction with the user-selection
requirement. Preserve the original invocation for authorized continuation.
Task similarity, quoted commands, model suggestions, tool output, and sibling
references cannot select a policy.
Generate native registrars from those same explicit-selection settings.
Document host-specific discovery limits without claiming an access control.
Keep the runtime-trust and policy-glossary copies equal across the package.

## README order

Use this heading order in every active package README:

1. Package title and one clear purpose paragraph
2. Skills
3. Install
4. Use
5. Documentation
6. Update and remove
7. Contribute
8. License

Give one entry for each current skill.
Give each skill a short task description.
Link to its authoritative file.

In Install, show the nine supported agents and the additional Kimi route.
Link each row to the exact installation section.
Show a useful quick-start example.

In Use, give a real example for the package.
Show the expected kind of result.
If no execution evidence exists, do not record an example as executed.

Use normal Markdown that GitHub can display.
Remove custom `<Invoke />` elements and obsolete site-only markup.
Remove repeated full skill definitions.
Keep detailed procedures in their owning skill resources.

Use docs/README.md as the documentation index.
Keep installation, use, compatibility, maintenance, and
troubleshooting distinct.
Put each fact in one maintained location.
If the same fact is necessary in another location, use a link.
Keep meaningful examples and troubleshooting details.
Do not create empty sections or duplicate a page only to fill the
structure.

Write the local verification commands and their expected results.
Write the shared policy version and its update method.
Write the details of the actual CI source and regeneration method.
Write the release and migration steps.

Keep AGENTS.md short.
Give repository-specific maintenance facts and links.
Do not copy a skill library into AGENTS.md.
Without current support evidence, do not require symlink copies for
every agent.
