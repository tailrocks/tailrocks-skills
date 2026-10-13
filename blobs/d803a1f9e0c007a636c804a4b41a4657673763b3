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
| .claude-plugin/plugin.json | The necessary Claude manifest |
| .kimi-plugin/plugin.json | The necessary Kimi manifest |
| .alint.yml | Shared policy references, narrow local settings |
| .velnor/config.toml | The supported source configuration for CI |
| .github/ | Files from the supported CI generation method |
| .github/PULL_REQUEST_TEMPLATE.md | The single PR template |
| skills/ID/SKILL.md | The authoritative skill instructions |
| skills/ID/references/ | Necessary detailed agent references |
| skills/ID/assets/ | Necessary static examples and templates |
| skills/ID/agents/ | Documented optional agent metadata |
| docs/README.md | Documentation index |
| docs/installation.md | Installation for all eight agents |
| docs/usage.md | Use cases, inputs, and examples |
| docs/compatibility.md | Versions, evidence, and limitations |
| docs/maintenance.md | Contribution, verification, release steps |
| docs/troubleshooting.md | Known failures and recovery steps |

In the table, ID means the skill ID.
Before you create an optional skill directory, make sure that its
planned files are necessary.
Record other necessary files in the shared structure policy.
Keep required attribution and notices.
Use the same location for each notice type across active packages.

Before you keep tool configuration, make sure that a documented
maintenance command needs it.
Use one common filename for each retained configuration.
If a language build file is not necessary for maintenance, do not
add it.

Keep task procedures in skills and their required resources.
Keep manifests, project documentation, and maintenance files in the
source package.
Do not add an archive build only to remove them.
Keep maintenance configuration separate from agent procedures.
Remove unnecessary index adapters, copied scripts, build output, and
obsolete lockfiles.

Do not create MCP servers, hooks, background processes, or executable
plugins for these instruction packages.
Do not keep an executable wrapper only to load Markdown.

## Marketplace additions

Use the common README and documentation conventions.
Add only the central inventory, native catalogs, shared policy, and
their maintenance configuration.
Put shared alint rules under standards/alint/.
Put the common structure and writing rules under docs/standards/.
Use .alint.yml with the marketplace profile.
Make that profile reject active skill payloads.

The marketplace lists packages.
It does not duplicate their instructions.
Do not add a marketplace plugin.json file.
Do not add a fake skills directory.

The marketplace keeps these files:

- README.md
- docs/migration.md
- docs/verification.md
- docs/standards/
- standards/alint/active.yml
- standards/alint/marketplace.yml
- standards/alint/retired.yml
- catalog.json and the generated native catalogs
- .alint.yml with the marketplace profile
- .velnor/config.toml
- .github/ from the supported generation method

## Retired repository

Keep the repository history and required notices.
Before you remove the old payload, move useful differences to the
current owner.
Remove active skill definitions, plugin manifests, catalogs, and
obsolete automation.

Keep .alint.yml with the retired profile.
Keep the policy configuration and minimal generated CI.
Make that CI reject active skills, plugin manifests, and catalogs.
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
Make necessary host manifests agree with those values.
Use deterministic generation or exact consistency checks for repeated
metadata.

Keep the Claude manifest only for the supported Claude method.
In the Kimi manifest, set "skills": "./skills/".
Without this field, Kimi uses a root SKILL.md file.
Do not create both Kimi manifest alternatives.

Remove redundant Muse or Codex manifests when the portable method
replaces them.
Before removal, examine the declared minimum client version.
Do not give the portable root manifest an Antigravity schema.
Use the native skill method for Antigravity.

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

Use References only when references are necessary.
Put the required inputs before the procedure.
Put the intended output before the completion checks.
Put important side effects before the applicable action.
Keep failure handling near the action that can fail.

Keep each SKILL.md file below 500 lines.
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

In Install, show all eight agents in a compact table.
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
