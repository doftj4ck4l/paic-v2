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

## Design language — Pixelspace Learning Studio

Bright neutral canvas (`#F8FAFC`), ink (`#0F172A`), teal (`#13B8A6`), lime (`#C6F432`),
lilac (`#A5B4FC`). Colourful 3D objects carry the personality; the interface stays clean
and readable.

## Pages

| Route | Description |
|---|---|
| `/` | Student homepage — welcome composition, Continue Learning, Ask AI, subject discovery, assignments & progress |
| `/login` | Login with demo profile picker (split-screen with 3D object panel) |
| `/register` | Registration |
| `/forgot-password` | Password recovery with confirmation state |
| `/pending/[slug]` | Honest "next in build" placeholder for unbuilt sections |

## Demo build

Authentication is a clearly-labelled demo: any valid-format email + password (8+ chars)
signs into a seeded demo profile (cookie-based session, route-protected via `proxy.ts`).
Real auth, backend and AI integrations are planned for the next phases — see
`prompts/` for the full master prompt, student app spec and design directions.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
npx tsc --noEmit   # typecheck
node tools/screenshot.mjs   # Playwright validation screenshots → docs/screenshots/
```

## Structure

```
src/app/            routes (home, login, register, forgot-password, pending)
src/components/     ui primitives, learning objects, nav, auth shell
src/lib/            demo data, session helpers, utils
public/assets/      Thiings 3D objects (thiings.co)
docs/screenshots/   visual validation captures per iteration
prompts/            master prompt, student app specification, design directions
```
