# Preparing a GitHub release

## Intended destination

Create a new repository named `optimum` under the owner's GitHub account.
The intended URL is:

```text
https://github.com/mohammed-j-r-abass/optimum
```

This document does not mean that repository has been created or that the name
is available. No repository creation, push or visibility change is automated
by these preparation scripts.

## Use a clean source snapshot

Do not push a development workspace's entire history without reviewing it.
An ignore rule does not remove tracked files or historical copies of them.

The release utility copies the application, API, pitch, shared libraries,
tests, configuration and public documentation into a separate directory.
It excludes `.git`, internal notes, uploads, mockups, credentials, dependencies,
builds, caches and private release reports. The original workspace is left intact.

```sh
python3 scripts/release_audit.py
python3 scripts/prepare_public_release.py
```

The second command prints the exact snapshot and report paths under
`generated-artifacts/`. It refuses to create a snapshot directory that already
exists and stops if its credential-pattern or private-file checks find a blocker.

The checks are heuristic, not proof that all secrets or personal information
have been found. Read the report and inspect the snapshot before making it public.
Review any security findings separately; creating a snapshot does not fix
dependency vulnerabilities or application security issues.

## Create the repository privately first

1. Open `https://github.com/new` while signed in as the intended owner.
2. Name the repository `optimum` and select **Private** for the initial review.
3. Leave automatic README, licence and `.gitignore` creation unchecked:
   the snapshot already contains these files.
4. Authenticate Git using GitHub's or Replit's supported connection flow.
   Do not paste a personal access token into code, a remote URL or chat.

## Push only after approval

Run these commands **inside the printed clean snapshot directory**, not the
original workspace. They are instructions, not actions run by the preparation.

```sh
git init -b main
git add .
git status --short
git commit -m "Initial open-source release of Optimum"
git remote add origin https://github.com/mohammed-j-r-abass/optimum.git
git push -u origin main
```

Use the intended owner's Git identity. Git commit metadata can expose an email
address; use the no-reply address provided by GitHub if you want to keep your
personal email private.

## Before switching to public

- Confirm the MIT copyright holder is correct and you have the rights to release
  the included source and assets.
- Confirm third-party notices are retained.
- Inspect the README, source, commit metadata and public assets for private data.
- Confirm no `.env`, service credentials, database dumps, real CVs, recordings,
  transcripts or internal agent notes are included.
- Review security findings and resolve release blockers.
- Run the setup and validation commands against a separate development database.
- Check the programme's actual submission and visibility requirements.

When ready, change repository visibility in GitHub if the organisers require
public access, then share the **repository link**, not a profile or deployment
link. A public MIT release lets others copy, modify and redistribute the code,
including commercially; others can retain copies after your visibility changes.

If a genuine secret is ever committed, revoke/rotate it with its provider.
Removing it from the latest file or starting a fresh snapshot does not revoke it.
