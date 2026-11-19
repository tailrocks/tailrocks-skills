"""Validate package identity, portable skill structure, and local resources.

This maintenance command uses the Python standard library. It does not run a
skill, call a model, install a plugin, or access the network.
"""

import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
HEADINGS = [
    "Use this skill",
    "Before you start",
    "Procedure",
    "Result",
    "Completion checks",
    "References",
]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def strict_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f"duplicate JSON key: {key}")
        result[key] = value
    return result


def read_json(relative):
    return json.loads(
        (ROOT / relative).read_text(encoding="utf-8"),
        object_pairs_hook=strict_object,
    )


def inspect_links(path, boundary):
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"(?ms)^(`{3,}|~{3,}).*?^\1\s*$", "", text)
    for raw in re.findall(r"\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)", text):
        target = urlsplit(raw)
        if target.scheme or target.netloc or not target.path:
            continue
        resolved = (path.parent / unquote(target.path)).resolve()
        require(resolved.is_relative_to(boundary), f"resource escapes package: {path}: {raw}")
        require(resolved.exists(), f"missing local resource: {path}: {raw}")


def main():
    portable = read_json("plugin.json")
    require(
        portable.get("$schema") == "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
        "portable manifest schema differs",
    )
    require(portable.get("name") == "tailrocks-vitalik-mode-skills", "package name differs")
    require(re.fullmatch(r"\d+\.\d+\.\d+", portable.get("version", "")), "invalid version")
    require("skills" not in portable, "portable manifest must use its fixed skills directory")
    for relative in (".claude-plugin/plugin.json", ".kimi-plugin/plugin.json"):
        host = read_json(relative)
        for field in ("name", "version", "description"):
            require(host.get(field) == portable.get(field), f"{relative}: {field} differs")
    require(read_json(".kimi-plugin/plugin.json").get("skills") == "./skills/", "Kimi skills path differs")

    skills = sorted((ROOT / "skills").glob("*/SKILL.md"))
    require(len(skills) == 1, "package must contain exactly one skill")
    for path in skills:
        text = path.read_text(encoding="utf-8")
        require(len(text.splitlines()) < 500, "SKILL.md must stay below 500 lines")
        match = re.match(r"\A---\n(.*?)\n---\n", text, re.S)
        require(match is not None, "missing skill frontmatter")
        front = match.group(1)
        keys = re.findall(r"^([A-Za-z][^:\s]*):", front, re.M)
        require(len(keys) == len(set(keys)), "duplicate frontmatter key")
        require(set(keys) <= {"name", "description", "license"}, "nonportable frontmatter key")
        require({"name", "description"} <= set(keys), "missing required frontmatter key")
        name = re.search(r"^name:\s*([^\n]+)$", front, re.M)
        require(name is not None and name.group(1).strip() == path.parent.name == "vitalik-mode", "skill name differs")
        headings = re.findall(r"^## (.+)$", text[match.end():], re.M)
        require(headings == HEADINGS, "skill heading order differs from shared structure")
        metadata = path.parent / "agents" / "openai.yaml"
        require(metadata.exists(), "missing Codex metadata")
        require(
            re.search(r"^\s+allow_implicit_invocation:\s*false\s*$", metadata.read_text(), re.M),
            "Codex metadata must disable implicit invocation",
        )
        for resource in path.parent.rglob("*"):
            require(resource.resolve().is_relative_to(path.parent.resolve()), f"resource escapes skill: {resource}")
            if resource.is_file() and resource.suffix == ".md":
                inspect_links(resource, path.parent.resolve())

    for path in [ROOT / "README.md", ROOT / "AGENTS.md", ROOT / "CHANGELOG.md", *sorted((ROOT / "docs").glob("*.md"))]:
        require(path.exists(), f"missing document: {path.name}")
        inspect_links(path, ROOT)
    print("OK: three manifest identities, one portable skill, explicit activation, and local resource paths")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, TypeError) as error:
        print(f"package validation failed: {error}", file=sys.stderr)
        sys.exit(1)
