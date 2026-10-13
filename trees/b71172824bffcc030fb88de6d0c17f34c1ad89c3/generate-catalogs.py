#!/usr/bin/env python3
"""Generate native marketplace catalogs from catalog.json.

Source: catalog.json (central inventory, design §4).
Outputs (exact design §4 shapes):
  .claude-plugin/marketplace.json  (Claude Code; also read by Muse and Grok)
  .agents/plugins/marketplace.json (Codex)
  .kimi-plugin/marketplace.json    (Kimi Code, JSON v2)

Deterministic: entry order follows catalog.json, object keys sorted,
2-space indent, one trailing newline. Standard library only.
"""

import json
import sys
from pathlib import Path

MARKETPLACE_NAME = "tailrocks"
MARKETPLACE_DISPLAY = "Tailrocks"
MARKETPLACE_OWNER = "tailrocks"

ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = ROOT / "catalog.json"
CLAUDE_PATH = ROOT / ".claude-plugin" / "marketplace.json"
CODEX_PATH = ROOT / ".agents" / "plugins" / "marketplace.json"
KIMI_PATH = ROOT / ".kimi-plugin" / "marketplace.json"

REQUIRED_FIELDS = ("id", "repo", "rev", "version", "description", "displayName", "private")


def load_catalog(path):
    with open(path, encoding="utf-8") as handle:
        data = json.load(handle)
    plugins = data["plugins"]
    seen = set()
    for entry in plugins:
        for field in REQUIRED_FIELDS:
            if field not in entry:
                raise KeyError("catalog entry misses %r: %r" % (field, entry))
        if entry["id"] in seen:
            raise ValueError("duplicate plugin id: %r" % entry["id"])
        seen.add(entry["id"])
    return plugins


def build_claude(plugins):
    return {
        "name": MARKETPLACE_NAME,
        "owner": {"name": MARKETPLACE_OWNER},
        "plugins": [
            {
                "description": entry["description"],
                "name": entry["id"],
                "source": {
                    "ref": entry["rev"],
                    "repo": entry["repo"],
                    "source": "github",
                },
                "version": entry["version"],
            }
            for entry in plugins
        ],
    }


def build_codex(plugins):
    return {
        "interface": {"displayName": MARKETPLACE_DISPLAY},
        "name": MARKETPLACE_NAME,
        "plugins": [
            {
                "category": "Productivity",
                "name": entry["id"],
                "policy": {
                    "authentication": "ON_INSTALL",
                    "installation": "AVAILABLE",
                },
                "source": {
                    "ref": entry["rev"],
                    "source": "url",
                    "url": "https://github.com/" + entry["repo"],
                },
            }
            for entry in plugins
        ],
    }


def build_kimi(plugins):
    return {
        "plugins": [
            {
                "displayName": entry["displayName"],
                "id": entry["id"],
                "source": "https://github.com/%s/commit/%s" % (entry["repo"], entry["rev"]),
            }
            for entry in plugins
        ],
        "version": "2",
    }


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, indent=2, sort_keys=True) + "\n"
    path.write_text(text, encoding="utf-8")
    return path


def main():
    plugins = load_catalog(CATALOG_PATH)
    write_json(CLAUDE_PATH, build_claude(plugins))
    write_json(CODEX_PATH, build_codex(plugins))
    write_json(KIMI_PATH, build_kimi(plugins))
    print("plugins: %d" % len(plugins))
    for path in (CLAUDE_PATH, CODEX_PATH, KIMI_PATH):
        print("wrote %s" % path.relative_to(ROOT))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError) as error:
        print("error: %s" % error, file=sys.stderr)
        sys.exit(1)
