#!/usr/bin/env python3
"""Validate the Tailrocks central catalog and all generated marketplace files."""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "catalog.json"


def strict_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=strict_object)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def expected_codex(plugins):
    return {
        "interface": {"displayName": "Tailrocks"},
        "name": "tailrocks",
        "plugins": [
            {
                "category": "Productivity",
                "name": item["id"],
                "policy": {"authentication": "ON_INSTALL", "installation": "AVAILABLE"},
                "source": {
                    "ref": item["sourceRef"],
                    "source": "url",
                    "url": f"https://github.com/{item['repo']}",
                },
            }
            for item in plugins
        ],
    }


def expected_claude(plugins):
    return {
        "name": "tailrocks",
        "owner": {"name": "tailrocks"},
        "plugins": [
            {
                "name": item["id"],
                "source": {
                    "ref": item["tag"],
                    "repo": item["repo"],
                    "sha": item["rev"],
                    "source": "github",
                },
            }
            for item in plugins
        ],
    }


def expected_kimi(plugins):
    return {
        "plugins": [
            {
                "displayName": item["displayName"],
                "id": item["id"],
                "source": f"https://github.com/{item['repo']}/commit/{item['rev']}",
            }
            for item in plugins
        ],
        "version": "2",
    }


def check_remote(plugins):
    require(shutil.which("gh") is not None, "--verify-github requires GitHub CLI authentication")
    for item in plugins:
        repo = item["repo"]
        metadata = json.loads(subprocess.check_output(["gh", "api", f"repos/{repo}"], text=True))
        require(metadata["private"] is item["private"], f"GitHub privacy mismatch for {repo}")
        source = json.loads(subprocess.check_output(["gh", "api", f"repos/{repo}/commits/{item['sourceRef']}"], text=True))
        require(bool(source.get("sha")), f"source ref does not resolve for {repo}")
        pin = json.loads(subprocess.check_output(["gh", "api", f"repos/{repo}/commits/{item['rev']}"], text=True))
        require(pin.get("sha") == item["rev"], f"pinned commit does not resolve for {repo}")
        tag = json.loads(subprocess.check_output(["gh", "api", f"repos/{repo}/commits/{item['tag']}"], text=True))
        require(tag.get("sha") == item["rev"], f"release tag/revision mismatch for {repo}")


def main():
    verify_github = "--verify-github" in sys.argv[1:]
    check_only = "--check" in sys.argv[1:]
    require(set(sys.argv[1:]) <= {"--verify-github", "--check"}, "usage: validate-marketplace.py [--check] [--verify-github]")
    catalog = read_json(CATALOG)
    plugins = catalog.get("plugins")
    require(isinstance(plugins, list) and len(plugins) == 10, "catalog must contain exactly ten plugins")

    ids = set()
    repos = set()
    private_repos = set()
    for item in plugins:
        for field in ("id", "repo", "rev", "sourceRef", "tag", "version", "description", "displayName", "private"):
            require(field in item, f"{item.get('id', '<unknown>')} is missing {field}")
        require(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", item["id"]) is not None, f"invalid plugin ID: {item['id']}")
        require(item["id"] not in ids, f"duplicate plugin ID: {item['id']}")
        require(item["repo"] not in repos, f"duplicate source repository: {item['repo']}")
        require(re.fullmatch(r"[0-9a-f]{40}", item["rev"]) is not None, f"invalid pinned revision for {item['id']}")
        require(item["tag"] == f"v{item['version']}", f"tag/version mismatch for {item['id']}")
        require(item["sourceRef"] == "main", f"plugin source-following ref must be main for {item['id']}")
        require(re.fullmatch(r"tailrocks/[A-Za-z0-9._-]+", item["repo"]) is not None, f"invalid GitHub repository: {item['repo']}")
        ids.add(item["id"])
        repos.add(item["repo"])
        if item["private"]:
            private_repos.add(item["repo"])

    require(private_repos == {"tailrocks/tailrocks-asd-ste100-skills", "tailrocks/tailrocks-agent-policy-skills"}, "private source inventory changed; review before updating policy")

    outputs = {
        ROOT / ".agents/plugins/marketplace.json": expected_codex(plugins),
        ROOT / ".claude-plugin/marketplace.json": expected_claude(plugins),
        ROOT / ".kimi-plugin/marketplace.json": expected_kimi(plugins),
    }
    for path, expected in outputs.items():
        actual = read_json(path)
        require(actual == expected, f"generated marketplace is stale or malformed: {path.relative_to(ROOT)}")

    if verify_github:
        check_remote(plugins)

    suffix = ", live GitHub branches/tags/privacy" if verify_github else ""
    if not check_only:
        print(f"validated {len(plugins)} unique plugins, GitHub source refs, and 3 generated catalogs{suffix}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError, subprocess.CalledProcessError) as error:
        print(f"marketplace validation failed: {error}", file=sys.stderr)
        sys.exit(1)
