#!/usr/bin/env python3
"""Local, redacted pre-release checks. Never prints matched secret values."""

import argparse
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "generated-artifacts"
SKIP_DIRS = {
    ".git", ".agents", ".local", ".cache", ".config", "node_modules",
    "dist", "generated-artifacts", "__pycache__", ".vite", "coverage", ".slide-thumbnails",
}
SECRET_RULES = {
    "private_key": re.compile(rb"-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----"),
    "github_token": re.compile(rb"\b(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,})\b"),
    "gitlab_token": re.compile(rb"\bglpat-[A-Za-z0-9_-]{20,}\b"),
    "slack_token": re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    "npm_token": re.compile(rb"\bnpm_[A-Za-z0-9]{30,}\b"),
    "openai_style_key": re.compile(rb"\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}\b"),
    "anthropic_style_key": re.compile(rb"\bsk-ant-[A-Za-z0-9_-]{20,}\b"),
    "google_api_key": re.compile(rb"\bAIza[0-9A-Za-z_-]{30,}\b"),
    "secret_test_or_live_key": re.compile(rb"\bsk_(?:test|live)_[A-Za-z0-9]{20,}\b"),
    "stripe_restricted_key": re.compile(rb"\brk_(?:test|live)_[A-Za-z0-9]{20,}\b"),
    "aws_access_key_id": re.compile(rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "sendgrid_key": re.compile(rb"\bSG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b"),
    "twilio_auth_token": re.compile(rb"\bSK[0-9a-fA-F]{32}\b"),
    "credentialed_database_url": re.compile(rb"postgres(?:ql)?://[^:\s/'\"]+:[^@\s/'\"]+@"),
    "jwt_literal": re.compile(rb"\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b"),
    "quoted_credential": re.compile(
        rb"""(?i)\b(?:api[_-]?key|secret[_-]?key|session[_-]?secret|password|auth[_-]?token|access[_-]?token)\s*[:=]\s*["'][^"'\s]{24,}["']"""
    ),
    "npm_auth_assignment": re.compile(rb"(?im)_authToken\s*=\s*[A-Za-z0-9_/-]{24,}"),
}
PII_EMAIL = re.compile(rb"\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b")


def git(*args):
    return subprocess.run(
        ["git", "-C", str(ROOT), *args], check=True, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    ).stdout


def protected_name(path):
    name = Path(path).name.lower()
    return (
        name.startswith(".env")
        or name.endswith((".pem", ".key", ".p12", ".pfx"))
        or name.endswith((".p8", ".keystore", ".jks", ".mobileprovision"))
        or "credential" in name
        or "api-key" in name
        or "api_key" in name
        or "apikey" in name
        or (name.startswith("service-account") and name.endswith(".json"))
    )


def inspect_bytes(content, path, scope):
    findings = []
    for rule, pattern in SECRET_RULES.items():
        if pattern.search(content):
            findings.append({"scope": scope, "path": path, "rule": rule, "level": "blocker"})
    if b"\0" not in content:
        domains = (m.group(1).lower() for m in PII_EMAIL.finditer(content))
        if any(domain not in {
            b"example.com", b"example.org", b"example.net", b"test.com",
            b"users.noreply.github.com",
        } for domain in domains):
            findings.append({
                "scope": scope, "path": path, "rule": "email_literal_review",
                "level": "review",
            })
    return findings


def audit_tree(root):
    import os

    findings, scanned, skipped = [], 0, []
    for directory, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for name in sorted(files):
            path = Path(directory) / name
            relative = path.relative_to(root).as_posix()
            if path.is_symlink():
                findings.append({"scope": "tree", "path": relative, "rule": "symlink_review", "level": "review"})
                continue
            if protected_name(relative):
                findings.append({"scope": "tree", "path": relative, "rule": "private_file", "level": "blocker"})
                continue  # Do not open credential files.
            if name.endswith((".tsbuildinfo", ".log", ".map")):
                continue
            content = path.read_bytes()
            scanned += 1
            findings.extend(inspect_bytes(content, relative, "tree"))
            if b"\0" in content:
                skipped.append(relative)
    return {"files_scanned": scanned, "binary_files_for_manual_review": skipped, "findings": findings}


def audit_history():
    # Freeze the reachable commit set once; no unreachable objects/reflogs promised.
    commits = git("rev-list", "--all").splitlines()
    historical_private_paths = set()
    for commit in commits:
        for path in git("ls-tree", "-r", "--name-only", "-z", commit.decode()).split(b"\0"):
            name = path.decode("utf-8", "replace")
            if name and protected_name(name):
                historical_private_paths.add(name)
    objects = {}
    for line in git("rev-list", "--objects", "--all").splitlines():
        parts = line.split(b" ", 1)
        objects.setdefault(parts[0], parts[1].decode("utf-8", "replace") if len(parts) > 1 else "<object>")
    findings = [
        {"scope": "history", "path": path, "rule": "private_file", "level": "blocker"}
        for path in sorted(historical_private_paths)
    ]
    binaries, count = [], 0
    process = subprocess.Popen(
        ["git", "-C", str(ROOT), "cat-file", "--batch"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    try:
        for oid, path in objects.items():
            process.stdin.write(oid + b"\n")
            process.stdin.flush()
            header = process.stdout.readline().split()
            if len(header) != 3:
                raise RuntimeError("Could not read a reachable Git object")
            size = int(header[2])
            content = process.stdout.read(size)
            if len(content) != size or process.stdout.read(1) != b"\n":
                raise RuntimeError("Incomplete Git object read")
            if header[1] == b"commit":
                message = content.partition(b"\n\n")[2]
                findings.extend(inspect_bytes(message, "<commit message>", "history"))
            if header[1] != b"blob":
                continue
            count += 1
            findings.extend(inspect_bytes(content, path, "history"))
            if b"\0" in content:
                binaries.append(path)
    finally:
        process.stdin.close()
        process.wait()
    internal = git("ls-files", ".agents", ".config", "attached_assets").decode().splitlines()
    return {
        "reachable_commits": len(commits), "unique_blobs_scanned": count,
        "tracked_private_context": internal,
        "historical_binary_files_for_manual_review": sorted(set(binaries)),
        "findings": findings,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tree", type=Path, default=ROOT)
    parser.add_argument("--no-history", action="store_true")
    args = parser.parse_args()
    report = {
        "scope_note": "Heuristic checks, not proof of absence of secrets/PII. No secret values are printed.",
        "tree": audit_tree(args.tree.resolve()),
    }
    if not args.no_history:
        report["history"] = audit_history()
    OUTPUT.mkdir(exist_ok=True)
    target = OUTPUT / "release-audit.json"
    target.write_text(json.dumps(report, indent=2) + "\n")
    findings = report["tree"]["findings"] + report.get("history", {}).get("findings", [])
    blockers = sum(f["level"] == "blocker" for f in findings)
    print(f"Audit report: {target.relative_to(ROOT)}")
    print(f"Credential/private-file flags: {blockers}; manual-review flags: {len(findings) - blockers}")
    if report.get("history", {}).get("tracked_private_context"):
        print("Internal files are tracked: do not push this workspace's history; prepare a clean snapshot.")
    return 1 if blockers else 0


if __name__ == "__main__":
    raise SystemExit(main())
