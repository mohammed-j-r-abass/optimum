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

Live voice coaching requires an internet connection. Camera sharing is optional and off by default. With the applicant’s consent, Google processes live audio and any camera frames shared during the session. Optimum keeps written interview transcripts. Uploaded documents are processed to extract text, and the original files are discarded.

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

## Licence

Original project contributions are released under the [MIT licence](LICENSE).

Third-party dependencies and derived components retain their own licences;
see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
