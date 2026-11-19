#!/usr/bin/env python3
"""Check the Tailrocks native package declarations and installed-resource contracts."""

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
PORTABLE_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
MODEL_REFERENCE = "references/model-routing.md"
POLICY_PACKAGE = "tailrocks-agent-policy-skills"
POLICY_DESCRIPTION = "Use only when the user explicitly invokes this skill."
POLICY_ENTRY = "Proceed only after the user explicitly invokes this skill for the current work."
MODEL_SHA256 = "5a2dab29c9cb60200b0a84f812af1f50de811ababf933568f2fa94b1ff3f4788"
MODELS = (
    "claude-fable-5-2", "claude-opus-5-5", "gpt-6.2-astra", "gpt-6.2-sol",
    "gemini-4-argon", "gemini-4-carbon", "gemini-4-neon", "muse-wonder-1.0",
    "muse-wonder-full-1.0",
)
ADAPTER_HASHES = {
    "index.js": "ddf0472f2ea96939650802dec7e8ec08b067c4b80420bff62d73244adcb74d71",
    "adapters/opencode/index.js": "200a15c5a39cc583cc143508d13d36c6955aaf9630515ca7a71acf6c729486de",
}
SLUG = r"[a-z0-9]+(?:-[a-z0-9]+)*"
TOP_KEY = re.compile(r"[a-zA-Z][\w.-]*")
BLOCK_SCALAR = re.compile(r"[|>]([1-9][+-]?|[+-][1-9]?)?(?:[ \t]+#.*)?")
YAML_COMMENT = re.compile(r"(?<!\S)#")
VISUAL_FILES = {
    "tailrocks-macos-skills": (
        "macos-visual-qa/install.ts", "macos-visual-qa/templates/AuditTests.swift",
        "macos-visual-qa/templates/app-launcher.swift", "macos-visual-qa/templates/ax-drive.swift",
        "macos-visual-qa/templates/capture.sh", "macos-visual-qa/templates/permissions.swift",
        "macos-visual-qa/templates/process-owner.swift", "macos-visual-qa/templates/run.ts",
        "macos-visual-qa/templates/state.sh", "macos-visual-qa/templates/window-id.swift",
    ),
    "tailrocks-typescript-skills": (
        "bounded-command.ts", "bounded-fetch.ts", "web-visual-qa/install.ts",
        "web-visual-qa/capture.ts", "web-visual-qa/templates/playwright.visual.config.ts",
        "web-visual-qa/templates/src/routes/api.tailrocks-visual-qa.ts",
        "web-visual-qa/templates/tests/visual/global-setup.ts",
        "web-visual-qa/templates/tests/visual/guarded-test.ts",
        "web-visual-qa/templates/tests/visual/settings.spec.ts",
    ),
}


def require(test, message):
    if not test:
        raise ValueError(message)


def object_pairs(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f"duplicate JSON key {key!r}")
        result[key] = value
    return result


def invalid_constant(value):
    raise ValueError(f"invalid JSON number {value!r}")


DECODER = json.JSONDecoder(object_pairs_hook=object_pairs, parse_constant=invalid_constant)


def read_object(relative):
    try:
        value = DECODER.decode((ROOT / relative).read_text(encoding="utf-8"))
    except ValueError as error:
        raise ValueError(f"{relative}: {error}") from error
    require(isinstance(value, dict), f"{relative}: expected an object")
    return value


def yaml_fields(lines, path):
    """Collect top-level keys in the repository's block-style metadata format."""
    result = {}
    current = None
    for line in lines:
        if not line.strip():
            continue
        if line.lstrip().startswith("#") and (current != "description" or not line.startswith(" ")):
            continue
        if line.startswith(" "):
            require(current is not None, f"{path}: unexpected indented metadata")
            result[current].append(line)
            continue
        key, separator, value = line.partition(":")
        require(
            separator and TOP_KEY.fullmatch(key) and (not value or value[0] in " \t"),
            f"{path}: expected a block-style top-level key",
        )
        current = key
        require(current not in result, f"{path}: duplicate {current}")
        result[current] = [value.lstrip(" \t")]
    return result


def description_text(lines):
    """Extract the text of a block-style or inline YAML description."""
    header, *continuation = lines
    block = BLOCK_SCALAR.fullmatch(header.rstrip())
    if block:
        first = continuation[0] if continuation else ""
        indent = len(first) - len(first.lstrip(" "))
        for flag in block[1] or "":
            if flag.isdigit():
                indent = int(flag)
        prefix = " " * indent
        return " ".join(line for line in continuation if line.startswith(prefix)).strip()

    value = " ".join(lines).strip()
    quote = value[:1]
    if quote not in ("'", '"'):
        parts = (YAML_COMMENT.split(line, maxsplit=1)[0] for line in lines)
        return " ".join(parts).strip()

    index = 1
    while index < len(value):
        char = value[index]
        escaped = quote == '"' and char == "\\"
        doubled = quote == "'" and value[index:index + 2] == "''"
        if escaped or doubled:
            index += 2
            continue
        if char == quote:
            suffix = value[index + 1:]
            if not suffix or (suffix[:1].isspace() and suffix.lstrip().startswith("#")):
                return value[1:index].strip()
            break
        index += 1
    return value


def invocation_policy(path):
    lines = path.read_text(encoding="utf-8").splitlines()
    fields = yaml_fields(lines, path)
    policy = fields.get("policy", [])
    require(policy and not policy[0].strip(), f"{path}: expected a policy mapping")
    key = "allow_implicit_invocation"
    entries = [line for line in lines if re.match(rf"^\s*{key}\s*:", line)]
    require(len(entries) == 1 and entries[0] in policy[1:], f"{path}: expected one {key} in policy")
    indent = min(len(line) - len(line.lstrip()) for line in policy[1:])
    flag = re.fullmatch(rf" {{{indent}}}{key}: *(true|false) *(?:#.*)?", entries[0])
    require(flag is not None, f"{path}: {key} needs an unquoted Boolean directly inside policy")
    return flag[1] == "false"


def unfenced_lines(text):
    fence = ""
    minimum = 0
    for line in text.splitlines(keepends=True):
        stripped = line.lstrip(" ")
        if len(line) - len(stripped) <= 3 and stripped.startswith(("```", "~~~")):
            marker = stripped[0]
            suffix = stripped.lstrip(marker)
            width = len(stripped) - len(suffix)
            if not fence and (marker == "~" or "`" not in suffix):
                fence, minimum = marker, width
                continue
            if marker == fence and width >= minimum and not suffix.strip(" \t\r\n"):
                fence = ""
                continue
        if not fence:
            yield line


def link_targets(text):
    """Yield inline destinations and skip optional titles in one forward scan."""
    label_open = False
    index = 0
    while index < len(text):
        char = text[index]
        index += 1
        if char == "[":
            label_open = True
        elif char == "\n":
            label_open = False
        elif char == "]":
            follows_label, label_open = label_open, False
            if not follows_label or text[index:index + 1] != "(":
                continue
            start = index + 1
            if start == len(text) or text[start] == ")" or text[start].isspace():
                continue
            end = text.find(")", start)
            if end == -1:
                break
            yield text[start:end].split(maxsplit=1)[0]
            index = end + 1


def linked_files(path, boundary):
    text = path.read_text(encoding="utf-8")
    for raw in link_targets("".join(unfenced_lines(text))):
        url = urlsplit(raw)
        if url.scheme or url.netloc or not url.path:
            continue
        resolved = (path.parent / unquote(url.path)).resolve()
        require(resolved.is_relative_to(boundary) and resolved.exists(), f"{path}: missing or external local target {raw}")


def inspect_skill(directory, policy_package):
    name = directory.name
    path = directory / "SKILL.md"
    require(len(name) <= 64 and re.fullmatch(SLUG, name), f"invalid skill directory {name!r}")
    text = path.read_text(encoding="utf-8")
    require(len(text.splitlines()) <= 500, f"{path}: skill must have at most 500 total lines")
    match = re.match(r"\A---\n(.*?)\n---\n", text, re.S)
    require(match is not None, f"{path}: missing frontmatter")
    fields = yaml_fields(match[1].splitlines(), path)
    allowed = {"name", "description", "license", "metadata"}
    if policy_package:
        allowed.add("disable-model-invocation")
    require({"name", "description"} <= fields.keys() <= allowed, f"{path}: invalid frontmatter keys")
    value = fields['name']
    require(len(value) == 1 and re.fullmatch(rf'''(["']?){re.escape(name)}\1''', value[0].strip()), f"{path}: name must match the directory")
    description = description_text(fields["description"])
    require(description and len(description) <= 1024, f"{path}: missing or oversized description")
    require("<" not in description and ">" not in description, f"{path}: description contains an angle bracket")
    explicit = invocation_policy(directory / "agents/openai.yaml")
    if policy_package:
        require(fields.get("disable-model-invocation") == ["true"],
                f"{path}: user-only policies require literal disable-model-invocation: true")
        require(explicit, f"{path}: user-only policies must disable implicit invocation")
        require(description.startswith(POLICY_DESCRIPTION),
                f"{path}: description must begin with the user invocation requirement")
        body = text[match.end():].lstrip("\n")
        title, _, entry = body.partition("\n")
        guard = f"\n## Use this skill\n\n{POLICY_ENTRY}\n"
        entry_headings = sum(line.rstrip() == "## Use this skill" for line in unfenced_lines(body))
        require(title.startswith("# ") and title[2:].strip()
                and entry.startswith(guard) and entry_headings == 1,
                f"{path}: first workflow instruction must require user invocation")
    reference = (directory / MODEL_REFERENCE).read_bytes()
    require(f"({MODEL_REFERENCE})" in text, f"{path}: link the bundled model guide")
    guide = reference.decode("utf-8")
    require(all(f"`{model}`" in guide for model in MODELS), f"{name}: missing model identity")
    require(hashlib.sha256(reference).hexdigest() == MODEL_SHA256, f"{name}: model guide differs from the shared revision")
    if name == "vitalik-mode":
        require(policy_package and explicit, "Vitalik must belong to the user-invoked Agent Policy package")
        require("explicit" in description.lower() and "same goal" in description.lower(), "Vitalik activation or same-goal guard is missing")
        headings = re.findall(r"^## (.+)$", text[match.end():], re.M)
        require(headings == ["Use this skill", "Before you start", "Procedure", "Result", "Completion checks", "References"], "Vitalik heading order differs")
        for resource in ("references/mode-state.md", "references/planner-contract.md", "assets/goal-record.md"):
            require(f"({resource})" in text, f"Vitalik is missing {resource}")
        for markdown in directory.rglob("*.md"):
            linked_files(markdown, directory)
    return {"id": name, "explicitOnly": explicit}


def check_adapter(relative, package, skills):
    source = (ROOT / relative).read_bytes().decode("utf-8")
    marker = "const skillEntries = "
    require(source.count(marker) == 1, f"{relative}: missing or duplicate skill registry")
    start = source.index(marker) + len(marker)
    rows, end = DECODER.raw_decode(source[start:])
    require(isinstance(rows, list) and all(isinstance(r, dict) and type(r.get('explicitOnly')) is bool for r in rows), f"{relative}: invalid registry flags")
    require(rows == skills, f"{relative}: skill IDs, order, or invocation policies differ")
    shape = (source[:start] + "__SKILL_ENTRIES__" + source[start + end:]).replace(package, "__PLUGIN_ID__")
    require(hashlib.sha256(shape.encode()).hexdigest() == ADAPTER_HASHES[relative], f"{relative}: native adapter code differs from the verified template")


def package_files(package, npm):
    entries = npm.get("files")
    require(isinstance(entries, list) and all(isinstance(p, str) for p in entries), "package.json: files must be a path list")
    paths = set()
    for entry in entries:
        path = Path(entry)
        require(path.parts and ".." not in path.parts and not path.is_absolute() and (ROOT / path).exists(), f"package.json: invalid packaged path {entry!r}")
        paths.add(path)
    runtime = list(map(Path, (
        "skills", "adapters", "index.js", "plugin.json", ".claude-plugin", ".kimi-plugin",
        ".antigravity-plugin", "docs", "README.md", "LICENSE", "bun.lock", *ADAPTER_HASHES,
    )))
    for item in ("scripts", "lib", "schemas", "examples", "assets", "references", "THIRD-PARTY-NOTICES.md"):
        if (ROOT / item).exists():
            runtime.append(Path(item))
    if package in VISUAL_FILES:
        runtime.extend(Path("scripts") / rel for rel in ("atomic-file-transaction.ts", *VISUAL_FILES[package]))
    for path in runtime:
        require((ROOT / path).exists(), f"missing runtime resource {path}")
        require(path in paths or any(parent in paths for parent in path.parents), f"package.json: files omit {path}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="print only failures")
    args = parser.parse_args()
    # Developer installations may contain large, symlinked dependency caches.
    for directory, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "__pycache__", ".venv"}]
        for leaf in [*dirs, *files]:
            p = Path(directory) / leaf
            require(not p.is_symlink(), f"plugin payload contains a symlink: {p.relative_to(ROOT)}")
    portable = read_object("plugin.json")
    package = portable.get("name", "")
    require(isinstance(package, str) and re.fullmatch(SLUG, package), "invalid portable plugin name")
    require(re.fullmatch(r"\d+\.\d+\.\d+", portable.get("version", "")), "invalid portable plugin version")
    require(isinstance(portable.get("description"), str) and portable['description'].strip(), "portable description is required")
    require(portable.get("$schema") == PORTABLE_SCHEMA and "skills" not in portable, "portable plugin schema or fixed skills path differs")
    manifests = {p: read_object(p) for p in (".claude-plugin/plugin.json", ".kimi-plugin/plugin.json", ".antigravity-plugin/plugin.json", "package.json")}
    for relative, m in manifests.items():
        for key in ("name", "version", "description"):
            require(m.get(key) == portable[key], f"{relative}: {key} disagrees with portable manifest")
    antigravity = manifests[".antigravity-plugin/plugin.json"]
    require(antigravity.get("$schema") == "https://antigravity.google/schemas/v1/plugin.json", "Antigravity manifest schema differs")
    require(manifests[".kimi-plugin/plugin.json"].get("skills") == "./skills/", "Kimi skills path differs")
    npm = manifests["package.json"]
    require(npm.get("packageManager") == "bun@1.4.4", "package.json: packageManager must be bun@1.4.4")
    require((ROOT / "bun.lock").is_file(), "missing Bun lockfile")
    require(npm.get("type") == "module" and npm.get("exports", {}).get(".") == "./adapters/opencode/index.js", "OpenCode ESM entry differs")
    require(npm.get("pi", {}).get("skills") == ["./skills"], "pi skills path differs")
    deps = npm.get("dependencies", {})
    require(deps.get("@opencode/plugin") == "2.3.2" and deps.get("yaml") == "2.9.1", "OpenCode runtime dependency versions differ")
    package_files(package, npm)
    require(package != "tailrocks-vitalik-mode-skills", "the standalone Vitalik package is retired")
    policy_package = package == POLICY_PACKAGE
    directories = sorted(p for p in (ROOT / 'skills').iterdir() if p.is_dir())
    skills = [inspect_skill(p, policy_package) for p in directories]
    require(skills, "package must contain skills")
    if policy_package:
        require(any(s["id"] == "vitalik-mode" for s in skills),
                "Agent Policy must contain Vitalik Mode")
        for name in ("runtime-trust.md", "policy-glossary.md"):
            copies = [(p / "references" / name).read_bytes() for p in directories]
            require(all(value == copies[0] for value in copies),
                    f"Agent Policy copies of {name} differ")
    for relative in ADAPTER_HASHES:
        check_adapter(relative, package, skills)
    if policy_package:
        for p in [ROOT / 'README.md', ROOT / 'AGENTS.md', ROOT / 'CHANGELOG.md', *sorted((ROOT / 'docs').glob('*.md'))]:
            linked_files(p, ROOT)
    if not args.check:
        print(f"Validated {package} {portable['version']} and {len(skills)} bundled skills")


if __name__ == "__main__":
    try:
        main()
    except (AttributeError, OSError, TypeError, ValueError) as error:
        sys.exit(f"package validation failed: {error}")
