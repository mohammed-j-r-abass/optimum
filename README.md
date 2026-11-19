# Optimum

**Helping first-time job seekers understand, demonstrate and communicate
their fit for a job.**

Optimum is a career-preparation platform designed especially for applicants
with limited access to career guidance, including people in rural areas.
Limited access to support is not a lack of ability.

Instead of requiring an existing CV, Optimum starts with the employer's
requirements and a conversation about the applicant's real experience.

## What it does

- Explains a job advert's requirements and the evidence an applicant needs.
- Discovers relevant experience from school, projects, work, volunteering,
  home and community responsibilities.
- Advises against irrelevant examples and identifies skills still to build.
- Creates saved, job-specific CVs from confirmed information, with PDF export.
- Supports scheduled, role-specific interview practice and feedback.
- Offers live voice conversations and optional camera sharing through the
  configured live interview provider.
- Lets applicants try a guest workspace and save progress to an account.
- Includes a six-slide, two-minute pitch accessible from the landing page.

The coaching experience helps applicants identify relevant evidence without
inventing qualifications or promising employment. Camera coaching is limited to observable presentation,
such as framing and lighting—not inferred emotions, personality or ability.

## Connectivity and privacy

The public landing page loads independently of the account and workspace
tools. Workspace pages load on demand, and the presentation is loaded only
when opened. Camera sharing is optional and off by default.

**Live coaching still requires an internet connection and provider quota.**
This is not an offline interview service.

Profiles, job applications, CVs and interview transcripts are persisted in
PostgreSQL. During a live call, consented audio and optional camera frames
are processed by Google. The app saves written transcripts, not raw call
recordings. Uploaded files are parsed transiently rather than retained as
original files. Provider terms and data handling still apply.

## Repository structure

| Directory | Purpose |
| --- | --- |
| `artifacts/firststep/` | Optimum's React/Vite web app; the internal folder name is retained for compatibility |
| `artifacts/api-server/` | Express API, AI coaching, CV creation and live-session endpoints |
| `artifacts/optimum-pitch/` | The six-slide product pitch |
| `lib/api-spec/` | OpenAPI contract and code generation |
| `lib/api-client-react/` | Typed API client and React Query hooks |
| `lib/api-zod/` | Generated request/response validation |
| `lib/db/` | PostgreSQL schema and Drizzle configuration |
| `scripts/` | Regression tests and release-preparation utilities |

The source distribution excludes development notes, uploaded documents, private
workspace state, generated output, credentials and experimental design files.
No database contents or applicant records are included.

## Run on Replit

The project is configured for Replit's path-based artifact router. The simplest
setup is to import this repository into Replit, configure the services below,
and use the existing managed workflows.

### Prerequisites

- Node.js 24 and pnpm 10.
- A new development PostgreSQL database.
- Clerk authentication configured for the application's origin.
- A compatible model-provider connection for career guidance and CV creation.
- A Google Gemini Live connection with **direct live access and available
  quota**. An ordinary text-generation proxy is not a substitute for Live.

### Configuration

Add the required database, authentication and model-provider credentials
through the hosting platform's secrets manager. Keep all credential values
out of source files, examples, commits, logs, screenshots and documentation.
Use only server-side configuration for private credentials. Browser-exposed
variables must never contain secret values.

Replit's managed workflows supply service-specific `PORT` and `BASE_PATH`
values.

### Install, initialise and check

```sh
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
pnpm run typecheck
pnpm --filter @workspace/scripts run test:live-audio
```

**Run the database command only against your new development database.**
It applies schema changes; it is not a command to run blindly against an
existing or production database.

Start the managed workflows:

- `artifacts/api-server: API Server`
- `artifacts/firststep: web`
- `artifacts/optimum-pitch: web`

The web app is mounted at `/`, the API at `/api`, and the pitch at
`/optimum-pitch/`. Open the landing page and select **Get started**.

Outside Replit, provide equivalent same-origin routing for all three services,
set each service's `PORT`/`BASE_PATH`, and configure Clerk for that host.
The API must receive the `/api` prefix unchanged. Authentication, AI services
and the database are not bundled with this source release.

## Development checks

```sh
# Rebuild shared declarations, then check all workspace packages
pnpm run typecheck

# Live audio packet and transcript recovery checks
pnpm --filter @workspace/scripts run test:live-audio

# Local release scanner/filter regression checks
python3 -m unittest discover -s scripts/tests -p 'test_release*.py'

# Validate the pitch's manifest and slide structure
pnpm --filter @workspace/optimum-pitch run validate-slides

# After editing the OpenAPI contract
pnpm --filter @workspace/api-spec run codegen
```

For artifact production builds, use the hosting workflow's service-specific
environment. A root build without `PORT`/`BASE_PATH` is not a standalone
deployment configuration.

## Release preparation

See [GITHUB_RELEASE.md](GITHUB_RELEASE.md) before pushing a copy of a development
workspace. Its Git history may contain files that are no longer meant to be
public. `.gitignore` does not remove already tracked files or older commits.

```sh
python3 scripts/release_audit.py
python3 scripts/prepare_public_release.py
```

These commands perform local preparation only. They do not contact GitHub,
create a repository, publish a deployment, or change the original Git history.

## Licence

Original project contributions are released under the [MIT licence](LICENSE).

Third-party dependencies and derived components retain their own licences;
see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The MIT licence does not
grant access to paid APIs, credentials, third-party trademarks or applicant data.
