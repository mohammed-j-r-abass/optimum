#!/usr/bin/env python3
"""Create an allowlisted source snapshot; no Git initialisation or network."""

from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import shutil

from release_audit import ROOT, SKIP_DIRS, audit_tree, protected_name

ROOT_FILES = {
    "LICENSE", "README.md", "GITHUB_RELEASE.md", "THIRD_PARTY_NOTICES.md",
    ".gitignore", ".replitignore", ".replit", ".npmrc", "package.json",
    "pnpm-lock.yaml", "pnpm-workspace.yaml", "tsconfig.base.json", "tsconfig.json",
}
SOURCE_DIRS = (
    "artifacts/firststep", "artifacts/api-server", "artifacts/optimum-pitch",
    "lib", "scripts",
)


def main():
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    destination = ROOT / "generated-artifacts" / f"optimum-source-{stamp}"
    destination.mkdir(parents=True, exist_ok=False)
    manifest = []

    def copy_file(source):
        relative = source.relative_to(ROOT)
        if source.is_symlink():
            raise RuntimeError("Refusing to include a symlink")
        if protected_name(relative):
            raise RuntimeError("Refusing to include a credential/private file")
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        content = target.read_bytes()
        manifest.append({
            "path": relative.as_posix(), "bytes": len(content),
            "sha256": hashlib.sha256(content).hexdigest(),
        })

    for name in sorted(ROOT_FILES):
        copy_file(ROOT / name)  # Missing required files fail explicitly.
    for name in SOURCE_DIRS:
        source = ROOT / name
        if not source.is_dir():
            raise RuntimeError(f"Missing source directory: {name}")
        for directory, dirs, files in os.walk(source, followlinks=False):
            if any((Path(directory) / d).is_symlink() for d in dirs):
                raise RuntimeError("Refusing to include a symlinked source directory")
            dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
            for filename in sorted(files):
                if Path(directory).name == ".replit-artifact" and filename != "artifact.toml":
                    continue
                if filename.endswith((".tsbuildinfo", ".log", ".map", ".pyc")):
                    continue
                copy_file(Path(directory) / filename)

    audit = audit_tree(destination)
    blockers = [f for f in audit["findings"] if f["level"] == "blocker"]
    report = {
        "snapshot": destination.relative_to(ROOT).as_posix(),
        "file_count": len(manifest), "total_bytes": sum(f["bytes"] for f in manifest),
        "excluded": [
            "original Git history", "internal agent notes", "attached uploads",
            "design mockups", "credentials", "databases", "dependencies",
            "build output", "private reports",
        ],
        "audit": audit, "files": manifest,
        "public_release_status": "Prepared locally only; not pushed or made public.",
    }
    report_path = destination.with_suffix(".review.json")
    report_path.write_text(json.dumps(report, indent=2) + "\n")
    print(f"Snapshot: {destination.relative_to(ROOT)}")
    print(f"Private review report: {report_path.relative_to(ROOT)}")
    print(f"Files: {len(manifest)}; source bytes: {report['total_bytes']}")
    if blockers:
        print("BLOCKED: inspect the redacted report before proceeding.")
        return 1
    print("No credential/private-file pattern flags. Manual review is still required.")
    print("No repository was created or pushed. No original files or history were removed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
