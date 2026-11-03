# FirstStep

FirstStep helps first-time job seekers build truthful tailored CVs and practise role-specific interviews with an AI career mentor.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/firststep run dev` — web app (use its managed workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Web app: `artifacts/firststep/`; API handlers: `artifacts/api-server/src/routes/career.ts`
- Contract: `lib/api-spec/openapi.yaml`; persistence: `lib/db/src/schema/career.ts`

## Architecture decisions

- Guest workspaces let applicants try the product before signing up. Signed-in Clerk accounts isolate saved information and claim the current browser's guest work when signing in.
- AI must never invent experience or qualifications. Interview ratings assess answer quality, not hiring probability or inferred personality.
- MVP voice is recorded turn-by-turn speech-to-speech with separately transcribed user answers for history/scoring. This is not continuous duplex streaming.
- Camera is an opt-in local preview with explicitly shared snapshots for lighting/framing feedback. No emotion, personality, disability or employability inference.
- Files are transiently parsed into text. Original file bytes, camera snapshots and audio recordings are not retained.

## Product

Saved career profiles, conversational CV discovery, per-job tailored CVs with TXT download and print-to-PDF, spoken/text interview practice, practice feedback and scheduling, transient PDF/DOCX/TXT imports, curated resources and source-linked web research.

## User preferences

The MVP targets graduating and first-time applicants, especially rural applicants without access to job-application support. It should be appealing but not overly fancy.

## Gotchas

After contract changes regenerate API clients. Clerk uses cookie transport on web and canonical proxy middleware. Web research fails explicitly if its provider is unavailable; guides remain accessible.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
