#!/usr/bin/env python3
"""Generate shared native package files in checked-out Tailrocks repositories.

The package's plugin.json owns identity and version. Canonical skills and their
agents/openai.yaml policies own the registered skill list. This script neither
fetches repositories nor changes the marketplace's approved revision pins.
"""

import argparse
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
NATIVE = ROOT / "standards/native"
MODEL = ROOT / "standards/models/model-routing.md"
SPEC = importlib.util.spec_from_file_location("native_contract", NATIVE / "validate-package.py")
CONTRACT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CONTRACT)
MODEL_LINK = (
    "When choosing a model, reasoning effort, or delegation route, read\n"
    "[model and reasoning choices](references/model-routing.md).\n"
)


def json_text(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def explicit_only(path):
    return CONTRACT.invocation_policy(path)


def render(name, values):
    text = (NATIVE / name).read_text(encoding="utf-8")
    for key, value in values.items():
        text = text.replace(f"__{key}__", str(value))
    if re.search(r"__[A-Z][A-Z_]+__", text):
        raise ValueError(f"unresolved placeholder in {name}")
    return text


def validator():
    text = (NATIVE / "validate-package.py").read_text(encoding="utf-8")
    digest = hashlib.sha256(MODEL.read_bytes()).hexdigest()
    text, count = re.subn(r'^MODEL_SHA256 = "[a-f0-9]{64}"$',
                          f'MODEL_SHA256 = "{digest}"', text, flags=re.M)
    if count != 1:
        raise ValueError("validator model digest declaration differs")
    for output, source in (("index.js", "amp-index.js.template"),
                           ("adapters/opencode/index.js", "opencode-index.js.template")):
        digest = hashlib.sha256((NATIVE / source).read_bytes()).hexdigest()
        text, count = re.subn(rf'("{re.escape(output)}": ")[a-f0-9]{{64}}(")',
                              rf'\g<1>{digest}\2', text)
        if count != 1:
            raise ValueError(f"validator adapter digest declaration differs: {output}")
    return text


def outputs_for(entry, workspace):
    repo = entry["repo"].split("/")[-1]
    directory = workspace / repo
    if not directory.is_dir():
        raise ValueError(f"missing checkout {directory}; use --only for a subset")
    portable = json.loads((directory / "plugin.json").read_text(encoding="utf-8"))
    identity = {key: portable[key] for key in ("name", "version", "description")}
    if identity["name"] != entry["id"]:
        raise ValueError(f"{repo}: plugin identity disagrees with catalog")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", identity["name"]):
        raise ValueError(f"{repo}: invalid plugin identity")
    skill_dirs = sorted(p for p in (directory / "skills").iterdir()
                        if p.is_dir() and (p / "SKILL.md").is_file())
    if not skill_dirs:
        raise ValueError(f"{repo}: no canonical skills")
    skills = [{"id": p.name, "explicitOnly": explicit_only(p / "agents/openai.yaml")}
              for p in skill_dirs]
    values = {
        "PLUGIN_ID": identity["name"], "REPO_NAME": repo,
        "VERSION": identity["version"], "SKILL_COUNT": len(skills),
        "SAMPLE_SKILL": skills[0]["id"],
        "SKILL_ENTRIES": json.dumps(skills, indent=2),
        "RUNTIME_NOTES": "See [runtime requirements](runtime.md) before running a selected workflow.",
        "VERIFICATION_NOTES": "See [package verification](verification.md) for the tested revision,\n"
                              "tools, results, and remaining host-specific limits.",
    }
    files = {}
    files[".claude-plugin/plugin.json"] = json_text(identity)
    kimi = json.loads((directory / ".kimi-plugin/plugin.json").read_text(encoding="utf-8"))
    kimi.update(identity)
    kimi["skills"] = "./skills/"
    files[".kimi-plugin/plugin.json"] = json_text(kimi)
    files[".antigravity-plugin/plugin.json"] = json_text({
        "$schema": "https://antigravity.google/schemas/v1/plugin.json", **identity,
    })
    npm_path = directory / "package.json"
    npm = json.loads(npm_path.read_text(encoding="utf-8")) if npm_path.exists() else {}
    resources = ["skills", "adapters", "index.js", "plugin.json", ".claude-plugin",
                 ".kimi-plugin", ".antigravity-plugin", "docs", "README.md", "AGENTS.md",
                 "CHANGELOG.md", "LICENSE", "scripts", "bun.lock"]
    resources.extend(name for name in ("lib", "schemas", "examples", "assets", "references",
                                      "THIRD-PARTY-NOTICES.md") if (directory / name).exists())
    npm.update({**identity, "private": True, "type": "module", "packageManager": "bun@1.4.4",
                "exports": {".": "./adapters/opencode/index.js"}, "files": resources})
    for key in ("license", "repository"):
        if key in portable:
            npm[key] = portable[key]
    npm.setdefault("dependencies", {}).update({"@opencode/plugin": "2.3.2", "yaml": "2.9.1"})
    npm.setdefault("pi", {})["skills"] = ["./skills"]
    files["package.json"] = json_text(npm)
    files["index.js"] = render("amp-index.js.template", values)
    files["adapters/opencode/index.js"] = render("opencode-index.js.template", values)
    for name in ("installation", "compatibility"):
        files[f"docs/{name}.md"] = render(f"{name}.md.template", values)
    files["scripts/validate-package.py"] = validator()
    for skill in skill_dirs:
        prefix = f"skills/{skill.name}"
        files[f"{prefix}/references/model-routing.md"] = MODEL.read_text(encoding="utf-8")
        path = skill / "SKILL.md"
        text = path.read_text(encoding="utf-8")
        if MODEL_LINK not in text:
            heading = "## Before you start\n\n"
            if heading not in text and text.count("## Steps\n\n") == 1:
                text = text.replace("## Steps\n\n", heading + "## Steps\n\n", 1)
            if text.count(heading) != 1:
                raise ValueError(f"{path}: expected one Before you start section")
            text = text.replace(heading, heading + MODEL_LINK + "\n", 1)
        files[f"{prefix}/SKILL.md"] = text
    return {directory / name: text for name, text in files.items()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", type=Path, default=ROOT.parent,
                        help="directory containing checked-out plugin repositories")
    parser.add_argument("--only", action="append", default=[], metavar="PLUGIN_ID",
                        help="generate a subset; repeat for more than one package")
    parser.add_argument("--check", action="store_true", help="report drift without writing")
    args = parser.parse_args()
    entries = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))["plugins"]
    unknown = set(args.only) - {entry["id"] for entry in entries}
    if unknown:
        raise ValueError("unknown plugin IDs: " + ", ".join(sorted(unknown)))
    selected = [entry for entry in entries if not args.only or entry["id"] in args.only]
    outputs = {}
    for entry in selected:
        outputs.update(outputs_for(entry, args.workspace.resolve()))
    changed = []
    for path, text in outputs.items():
        if path.exists() and path.read_text(encoding="utf-8") == text:
            continue
        changed.append(path)
        if not args.check:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8")
    if args.check and changed:
        for path in changed:
            print(f"stale: {path.relative_to(args.workspace.resolve())}", file=sys.stderr)
        return 1
    print(f"{'Checked' if args.check else 'Generated'} {len(outputs)} files in {len(selected)} packages"
          f"; {len(changed)} {'stale' if args.check else 'changed'}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError) as error:
        sys.exit(f"package generation failed: {error}")
