# Pixelspace AI Classroom (paic-v2)

A playful, modern AI learning studio for Malaysian primary and secondary students —
built as a premium consumer application, not an LMS.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (design tokens in `src/app/globals.css`)
- shadcn-style primitives, Lucide icons
- Motion-ready (subtle interactions, reduced-motion supported)
- **Thiings 3D illustrations** (`public/assets/thiings/`) as the primary visual language
  — see the README in that folder for licensing (commercial use requires the Indie licence)
- Montserrat typography
- **Auth**: [Better Auth](https://better-auth.com) (email/password + username login,
  email verification, password reset) on **Drizzle ORM** + PostgreSQL
  (embedded PGlite for local development)
- **Email**: nodemailer over SMTP, with a development mailbox when SMTP is unconfigured

## Design language — Pixelspace Learning Studio

Bright neutral canvas (`#F8FAFC`), ink (`#0F172A`), teal (`#13B8A6`), lime (`#C6F432`),
lilac (`#A5B4FC`). Colourful 3D objects carry the personality; the interface stays clean
and readable.

## Pages

| Route | Description |
|---|---|
| `/` | Student homepage — welcome composition, Continue Learning, Ask AI, subject discovery, quizzes & progress |
| `/login` | Login with email or student ID (username) |
| `/register` | Registration with **school search** (not a dropdown), year selection by school type |
| `/forgot-password` | Password recovery — sends a real reset link (30 min, single use) |
| `/reset-password?token=…` | Set a new password; all other sessions are revoked |
| `/workbooks` | Workbook library (own + saved + remixed) |
| `/subjects`, `/explore`, `/community`, `/creations`, `/progress`, `/profile`, `/settings` | Student experience |

## Authentication

Real auth backed by PostgreSQL:

- **Registration** — search for your school (only listed schools can be selected;
  "request a school" is captured for admins), choose year (Tahun/Tingkatan based on the
  school type), pick a student ID (username) and password. The student's experience level
  (Rendah/Menengah) is derived from the school — never from a client toggle.
- **Login** — email **or** student ID + password. "Remember me" extends the session.
  Generic error messages (no account enumeration), rate-limited endpoints.
- **Password reset** — `/forgot-password` always shows a generic confirmation; real emails
  are sent via SMTP. In development (no SMTP configured) emails are captured by the
  dev mailbox.
- **Email verification** — sent on sign-up (soft verification for the pilot: accounts work
  immediately, with a banner to verify).
- **Audit trail** — register/login/logout/password-reset events recorded in `auth_events`.
- Sessions are httpOnly cookies managed by Better Auth; `proxy.ts` guards app routes and
  `requireUser()` enforces auth in server components.

## Local setup

```bash
npm install
cp .env.example .env   # then fill BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:migrate     # apply migrations (creates ./.pglite by default)
npm run db:seed        # seed the 4 pilot schools + 2 demo accounts
npm run dev            # http://localhost:3000
```

No database server is required locally: without `DATABASE_URL` the app uses an embedded
PGlite database persisted in `./.pglite`. Set `DATABASE_URL` to use a real Postgres
(Neon/Supabase/Railway) — migrations and the app work unchanged.

### Demo accounts

| Account | Login | Password | School |
|---|---|---|---|
| Aiman (Rendah) | `aiman@demo.pixelspace.my` or `aiman` | `DemoPelajar123` | SK Bukit Ramun |
| Nurul (Menengah) | `nurul@demo.pixelspace.my` or `nurul` | `DemoPelajar123` | SMS Johor |

### Seeded schools

SK Bukit Ramun · SMS Johor · SK Bukit Senta · SK Pekan Dua (all Johor).
Registration search only returns seeded/active schools.

### Emails in development

With no SMTP configured, reset/verification emails are captured in a development mailbox
and logged to the server console. Inspect them at `GET /api/dev/emails`
(enabled with `DEV_MAILBOX=1`; never enable in production). For real email delivery set
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.

## Commands

```bash
npm run dev          # development server
npm run build        # production build
npm run lint         # ESLint
npx tsc --noEmit     # typecheck
npm run db:generate  # generate migrations from src/db/schema.ts
npm run db:migrate   # apply migrations
npm run db:seed      # seed schools + demo accounts (idempotent)
```

## Structure

```
src/app/            routes — (app) group (authenticated), login/register/forgot/reset
src/app/api/        auth handler, school search, school requests, dev mailbox
src/components/     ui primitives, learning objects, nav, auth shell, school picker
src/db/             Drizzle schema, client, migrations runner, seed script
src/lib/            auth (Better Auth), session helpers, email, demo data, utils
public/assets/      Thiings 3D objects (thiings.co)
docs/screenshots/   visual validation captures per iteration
prompts/            master prompt, student app spec, design directions, community module
```

## Demo content

Learning content (workbooks, community, artifacts) is still seeded demonstration data
(`src/lib/demo-data.ts`) — clearly fictional, to be replaced by real queries per module.

## AI generation (workbook slides)

The Slaid tab generates real slide decks from workbook sources via the
**Pixelspace Router** (OpenAI-compatible):

- `ROUTER_BASE_URL` (e.g. `https://router.pixel-space.co/v1`), `ROUTER_API_KEY`
- `MODEL_TEXT` (default `gemini-2.5-flash`), `MODEL_IMAGE` (default `gemini-3.1-flash-image`)
- `GENERATION_MOCK=1` fakes generation locally without calling the router
- Generated illustrations live in `ASSETS_DIR` (Docker: `./assets:/app/assets`);
  on servers the host directory must be writable by the container user
  (`chown -R 100:101 /opt/paicv3/assets` for the paic deployment).

Decks are structured text (house style, BM, speaker notes) with AI flat-vector
illustrations on the cover and requested slides — not text-baked images.
