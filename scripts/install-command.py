#!/usr/bin/env python3
"""Print native install commands for a package from the Tailrocks catalog."""

import argparse
import json
import re
import shlex
from pathlib import Path

CATALOG = Path(__file__).resolve().parents[1] / "catalog.json"
MARKETPLACE = "tailrocks/tailrocks-skills"
AGENTS = ("claude", "codex", "grok", "muse", "opencode", "omp", "amp", "antigravity", "pi", "kimi")


# Printed for the operator to run against their local omp registry.
OMP_USER_SKILLS_QUERY = """import json
import sys
from pathlib import Path

groups = json.load(sys.stdin)["marketplace"]
entries = [entry for group in groups if group["id"] == sys.argv[1]
           for entry in group["entries"] if entry["scope"] == "user"]
if len(entries) != 1:
    sys.exit("Expected exactly one matching user-scope package.")
directory = Path(entries[0]["installPath"]) / "skills"
if not directory.is_absolute() or not directory.is_dir():
    sys.exit("The installed skills directory is unavailable.")
print(json.dumps(str(directory)))"""


def load_package(plugin_id):
    plugins = json.loads(CATALOG.read_text(encoding="utf-8"))["plugins"]
    matches = [item for item in plugins if item["id"] == plugin_id]
    if not matches:
        raise ValueError(f"unknown plugin ID {plugin_id!r}; see catalog.json")
    if len(matches) != 1:
        raise ValueError(f"duplicate plugin ID {plugin_id!r}")
    item = matches[0]
    # These values become shell words, Git refs, and directory names in the output.
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", plugin_id):
        raise ValueError("invalid plugin ID in catalog")
    if not re.fullmatch(r"tailrocks/[a-z0-9]+(?:-[a-z0-9]+)*", item["repo"]):
        raise ValueError(f"invalid repository for {plugin_id}")
    if not re.fullmatch(r"[0-9a-f]{40}", item["rev"]):
        raise ValueError(f"invalid commit for {plugin_id}")
    return item


def install_commands(agent, item):
    plugin_id, repo, rev = item["id"], item["repo"], item["rev"]
    qualified = f"{plugin_id}@tailrocks"
    routes = {
        "claude": (f"claude plugin marketplace add {MARKETPLACE}",
                   f"claude plugin install {qualified} --scope user"),
        "codex": (f"codex plugin marketplace add {MARKETPLACE}",
                  f"codex plugin add {qualified}"),
        "grok": (f"grok plugin marketplace add {MARKETPLACE}",
                 f"grok plugin install {plugin_id} --trust"),
        "muse": (f"muse plugins marketplace add tailrocks {MARKETPLACE}",
                 f"muse plugins install {qualified}"),
        "omp": (f"omp plugin marketplace add {MARKETPLACE}",
                f"omp plugin install {qualified} --scope user"),
        "opencode": (f"opencode plugin add 'github:{repo}#{rev}'",),
        "pi": (f"pi install git:github.com/{repo}@{rev}",),
        "kimi": (f"/plugins marketplace https://raw.githubusercontent.com/{MARKETPLACE}/main/.kimi-plugin/marketplace.json",
                 f"/plugins install https://github.com/{repo}/commit/{rev}",
                 "/reload"),
    }
    if agent == "omp" and plugin_id == "tailrocks-agent-policy-skills":
        return (
            *routes["omp"],
            "# Print this user installation's skills directory as a quoted YAML value.",
            f"omp plugin list --json | python3 -c {shlex.quote(OMP_USER_SKILLS_QUERY)} {qualified}",
            "# Add the quoted path once under skills.customDirectories in ~/.omp/agent/config.yml.",
            "# Preserve other settings. Replace this package's old path after an upgrade.",
            "# After editing the setting, verify each enabled skill at that path has hide: true.",
            "omp skill list --json",
        )
    if agent in routes:
        return routes[agent]

    if agent == "amp":
        parent = '${XDG_CONFIG_HOME:-$HOME/.config}/amp/plugins'
        leaf = plugin_id
    else:
        parent = f'${{XDG_DATA_HOME:-$HOME/.local/share}}/tailrocks/antigravity/{plugin_id}'
        leaf = rev
    # Stop on a failed clone. Never switch a pre-existing directory to another commit.
    lines = [
        f'plugin_parent="{parent}"',
        f'plugin_dir="$plugin_parent/{leaf}"',
        'mkdir -p -- "$plugin_parent" &&',
        f'  git clone --no-checkout -- https://github.com/{repo}.git "$plugin_dir" &&',
        f'  git -C "$plugin_dir" checkout --detach {rev}',
    ]
    if agent == "antigravity":
        lines[-1] += " &&"
        lines.append('  agy plugin install "$plugin_dir"')
    return lines


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plugin_id", help="package ID from catalog.json")
    parser.add_argument("--agent", choices=AGENTS, required=True)
    args = parser.parse_args()
    try:
        item = load_package(args.plugin_id)
        print(*install_commands(args.agent, item), sep="\n")
    except (OSError, ValueError, TypeError, KeyError) as error:
        parser.exit(1, f"{parser.prog}: {error}\n")


if __name__ == "__main__":
    main()
