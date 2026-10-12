#!/usr/bin/env python3
"""Update catalog pins from each source repository's latest stable release."""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "catalog.json"
VERSION_TAG = re.compile(r"v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)\Z")


def gh_json(path):
    return json.loads(subprocess.check_output(["gh", "api", path], text=True))


def latest_release(repo):
    release = gh_json(f"repos/{repo}/releases/latest")
    tag = release.get("tag_name", "")
    match = VERSION_TAG.fullmatch(tag)
    if not match or release.get("draft") or release.get("prerelease"):
        raise ValueError(f"latest stable release for {repo} has an unsupported tag")
    commit = gh_json(f"repos/{repo}/commits/{tag}").get("sha", "")
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError(f"latest release ref for {repo} did not resolve to a commit")
    return tag, ".".join(match.groups()), commit


def main():
    if len(sys.argv) != 1:
        raise ValueError("usage: update-catalog-pins.py")
    if not shutil.which("gh"):
        raise ValueError("GitHub CLI is required")

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    plugins = catalog.get("plugins")
    if not isinstance(plugins, list) or len(plugins) != 9:
        raise ValueError("catalog must contain exactly nine plugins")

    updates = []
    for plugin in plugins:
        tag, version, revision = latest_release(plugin["repo"])
        plugin["tag"] = tag
        plugin["version"] = version
        plugin["rev"] = revision
        updates.append(plugin["id"])

    CATALOG.write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8")
    print(f"checked latest stable release pins for {len(updates)} marketplace sources")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError, subprocess.CalledProcessError) as error:
        print(f"catalog release pin update failed: {error}", file=sys.stderr)
        sys.exit(1)
