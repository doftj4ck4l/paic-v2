# Pixelspace AI Classroom — Design Directions (Study & Plan)

Status: **approved direction, November 2026.** Companion document to `MASTER_PROMPT.md`.
Purpose: give Codex a specific, verified UI strategy — real libraries it can actually implement,
instead of AI-generated mockups or unverifiable component names.

The product serves two age groups: **Sekolah Rendah (Tahun 1–6)** and **Sekolah Menengah
(Tingkatan 1–5)**. The challenge is making the application feel exciting without making secondary
students feel like they are using an app for little kids.

---

## 1. The six directions studied

| # | Direction | Inspired by | What it is | Verdict |
|---|---|---|---|---|
| 1 | Playful Gamified Learning | Duolingo | Rounded characters, lesson journeys, animated rewards, XP, friendly progress indicators | **Primary foundation.** Excellent for primary; use a restrained version for secondary |
| 2 | Sandbox / Block World | Minecraft Education | Lessons as explorations, workbooks as worlds, assignments as quests | **Accent only.** Most distinctive alternative to conventional LMS design, but a full commitment makes the product feel like a game |
| 3 | Interactive Discovery | Brilliant | Beautiful illustrations, interactive problems, visual explanations, focused learning screens | **Secondary foundation.** Suitable for students who want something sophisticated rather than childish |
| 4 | Illustrated Storybook | Khan Academy Kids | Hand-drawn scenery, storybook cards, mascots, friendly subject illustrations | **Primary accent.** Excellent for younger pupils; too juvenile as a universal secondary interface |
| 5 | Modern Creative Workspace | Linear, NotebookLM | Spacious layouts, refined typography, minimal distractions, carefully chosen colourful accents | **Secondary foundation + management UI.** Ideal for Form 4–5 students, teachers and serious AI study sessions |
| 6 | Retro-Futurist / Sticker UI | Y2K, creative studio sites | Floating stickers, editorial typography, colourful geometric shapes, collectible badges, subtle motion | **Selective accents.** A middle ground between neo-brutalism and gaming (badges, empty states, celebrations) |

## 2. Decision

Build **Interactive Discovery + Modern Creative Workspace + selective Game UI**.

- Not an entire app that looks like Minecraft.
- Not another neo-brutalist admin dashboard.
- Primary = **Playful Gamified Learning**. Secondary = **Interactive AI Study Studio**.
- Both may carry a hint of neo-brutalism, but neither should be dominated by it.

This gives Pixelspace a recognizable identity without turning the product into either a cartoon game
or a conventional LMS.

## 3. The separation principle (critical)

**Separate the learning experience from the game-like rewards.**

A student should enjoy opening the app, but when they start reading a textbook, solving mathematics
or asking the AI a question, the workspace becomes clean and focused. Gamification lives on the home
screen, the progress page and celebration moments — never on top of the learning content itself.

## 4. Pixelspace Play — Tahun 1–6

Design direction: **Gamified learning adventure + illustrated storybook.**
Think Duolingo's progression, Khan Academy Kids' friendliness, and a little Minecraft-inspired
exploration. Primary students should feel like they are entering a learning playground, not opening
school software.

### Screens

| Screen | Specification |
|---|---|
| Home | Colourful illustrated welcome scene with their AI mascot, daily missions and a prominent **Continue Adventure** button |
| Workbooks | Illustrated subject books with recognizable Matematik, Sains, Bahasa Melayu and English icons |
| Explore | A colourful world of learning topics, displayed as destinations or activity cards |
| AI Tutor | Friendly mascot-led conversation with short messages, voice interaction and visual explanations |
| Assignments | Presented as missions with clear instructions, completion states and small rewards |
| Progress | Learning journey, stars, achievement badges and mastery milestones |

### Visual system

Rounded illustrated cards, playful characters, large touch targets, colourful subject artwork,
friendly typography.

### Component sources

- **Mekai UI** for gamification (XP bar, pixel buttons, progress, rewards).
- **React Bits** for selective animations.
- **Custom illustrated school assets** and the existing Pixelspace mascots.

## 5. Pixelspace Studio — Tingkatan 1–5

Design direction: **Interactive discovery + modern creative workspace.**
Secondary students should feel like they are using a powerful AI learning tool, not a children's
educational game. Inspiration: Brilliant for interactive learning, NotebookLM for source-grounded AI
workspaces, modern productivity apps for visual clarity.

### Screens

| Screen | Specification |
|---|---|
| Home | Clean, editorial dashboard with current subjects, study activity, upcoming assignments and a personalised AI prompt |
| Workbooks | Beautiful cover cards with subject, form level, topic and progress information |
| Explore | Search-first discovery, topic collections, SPM preparation and recommended learning resources |
| AI Tutor | A serious AI study workspace with source documents, conversation, citations, practice questions and generated notes |
| Assignments | Structured task management with deadlines, submission states and teacher feedback |
| Progress | Topic mastery, performance trends, strengths, weaknesses and recommended revision |
| Study Mode | Focused reading, quizzes, flashcards, exam practice and revision planning |

### Visual system

Refined typography, structured grids, restrained colour accents, subtle neo-brutalist borders and
purposeful animations.

### Component sources

- **shadcn/ui** for the workspace foundation.
- **Cult UI** for workspace and AI patterns that drop into shadcn/ui.
- **Brilliant-style custom learning components** (interactive problems, visual explanations).
- **React Bits** for restrained motion.
- **Selected Mekai UI elements** for achievements.

## 6. How they differ

| Design decision | Primary (Play) | Secondary (Studio) |
|---|---|---|
| Product experience | Play | Studio |
| Main inspiration | Duolingo + Khan Kids | Brilliant + NotebookLM |
| Navigation | Large illustrated icons | Compact sidebar |
| Homepage | Learning adventure | Study workspace |
| AI personality | Friendly mascot | Helpful study assistant |
| Gamification | Stars, missions, rewards | Streaks, mastery, milestones |
| Learning content | Short, visual, guided | Deeper, independent, interactive |
| Typography | Rounded, friendly | Modern, clean |
| Animations | Expressive | Subtle |
| Main goal | Make learning enjoyable | Make studying effective |

## 7. Architecture

```
Pixelspace AI Classroom
One platform · Shared backend · Shared learning data

   Play UI                Studio UI
   Primary                Secondary

        Shared Learning Engine
Workbooks · AI Tutor · Classes · Assignments · Curriculum · Progress
```

- The UI experience is selected from the student's **school level in their profile** — not a manual
  theme toggle.
- Teachers and administrators use a **third, professional management interface** (shadcn/ui
  foundations, Guru/Admin mascot wiring as specified in `MASTER_PROMPT.md`).
- The Pixelspace brand is preserved across both experiences: same logo, consistent accent colours,
  familiar navigation concepts and the same AI assistant identity.

## 8. Verified component sources (checked 2026-11-08)

| Source | Provides | License | Install | Use it for | Caveats |
|---|---|---|---|---|---|
| **shadcn/ui** (ui.shadcn.com) | Application primitives: forms, dialogs, dropdowns, tabs, tables, accessible inputs | MIT | shadcn CLI | Both surfaces + management UI | None |
| **Mekai UI** (ui.mekaigames.com) | 117 game-feel components, 48 free: XP bar, pixel button, health bar, animated tabs, dialog, accordion, tooltips, text effects, backgrounds | Free components MIT; Pro one-time (€31.20) | `npx shadcn@latest add https://ui.mekaigames.com/r/<name>.json` (needs `motion`) | Play gamification; selective Studio achievements | Streak, Leaderboard, Loot Reveal, Achievement Toast, Daily Rewards, Spin Wheel are **Pro** — flag for approval; free set includes XP Bar, Pixel Button, Health Bar, Animated Tabs, Segmented Control, Dialog, Accordion, Carousel, Bounce Cards, Star Rating, Magnetic Button, Tilt Card, Click Spark, Aurora, Dot Grid, Meteors, Orb, Plasma and more |
| **Cult UI** (cult-ui.com) | 154 free animated components that drop into shadcn/ui projects (workspace, AI, carousels, floating panels, dynamic island) | MIT | shadcn CLI / copy | Studio workspace patterns | None |
| **React Bits** (reactbits.dev) | 215+ animated components: backgrounds, animated text, playful micro-interactions | MIT + Commons Clause | CLI / copy (JS + TS variants) | Selective personality in both surfaces | Commons Clause: components may not be resold; Pro tier exists for extras |
| **Magic UI** (magicui.design) | Animated components for highlights and onboarding | Free core; paid premium templates | shadcn-compatible registry | Onboarding, highlights | Premium templates cost money — flag |
| **BlockUI** (`@malilion/block-ui-react`) | Block/pixel/crafting game components: inventory, crafting, HUD, cards, forms | MIT per npm (repo badge shows Apache-2.0 — resolve before shipping) | npm | Optional Play accents only | Full Minecraft-style commitment is rejected; verify license field before use |
| **Motion for React** (`motion`) | Animation engine underpinning Mekai UI and React Bits | MIT | npm | Page transitions, interactive cards, progress, mascot choreography | Required dependency of Mekai UI |
| **Lucide** (`lucide-react`) | Functional icons | ISC | npm | Both surfaces | None |
| **3dicons.co** | 200+ hand-made 3D icon renders (calculator, lab, crown, trophy, medal, star, rocket, bulb…) | **CC0** (public domain; commercial use, no attribution) | 500px transparent PNGs bundled in `public/assets/3d/` (front angle, color style) | Play + workbook: subjects, achievements, missions, studio tools, welcome illustrations | Keep one consistent angle/style; never mix other illustration packs; never use emoji as stand-in artwork; Studio stays on Lucide |

### Naming correction

Earlier drafts referenced **"Mekar UI"** — a misspelling. The real library is **Mekai UI**
(ui.mekaigames.com), verified above. Do not invent or reference "Mekar UI" components.

## 9. Rules for Codex

**Do**

- Use verified libraries and their documented APIs; read each component's docs page before use.
- Theme every component with Pixelspace design tokens — no unmodified demo styling.
- Keep gamification at the edges; keep the learning workspace clean.
- Prefer free/MIT components; flag Pro/paid ones for approval instead of silently using them.
- Build the shared component showcase first and validate visually before mass page generation.

**Do not**

- Make the entire app look like Minecraft.
- Produce another neo-brutalist admin dashboard.
- Copy static inspiration screenshots as mockups — implement from real libraries.
- Invent component names, props or APIs.
- Use the same presentation for a 7-year-old and a 17-year-old — two experiences, one platform.

## 10. Verification log (2026-11-08)

| Check | Method | Result |
|---|---|---|
| Mekai UI exists | Site fetch + raw GitHub README (mekai-ui/mekai-ui) | Live: 117 components, 48 free MIT; React 19 + Tailwind 4 + Motion; shadcn CLI install confirmed (`XpBar` with `xp`/`perLevel` props) |
| Mekai UI Game UI category | Category page fetch | XP Bar, Pixel Button, Health Bar free; Streak, Leaderboard, Loot Reveal, Achievement Toast, Cooldown Button, Daily Rewards, Spin Wheel, Dialogue Box Pro |
| React Bits | Site + GitHub README | Live: 215+ free components, MIT + Commons Clause, MCP server, Pro tier |
| Cult UI | Site fetch | Live: 154 free MIT components, shadcn drop-in, 7.0k stars, MCP server |
| BlockUI | GitHub + npm registry | Repo exists; `@malilion/block-ui-react` v0.6.1 published (Oct 2026), MIT per npm, React 18/19 |
| Magic UI | Site check | Live (free core + paid templates) |
| Motion / Lucide | npm registry | `motion` 14.10.1 (MIT); `lucide-react` 1.70.0 (ISC) |
| 3dicons.co | Site + download API | Live; CC0 confirmed; 500px transparent PNGs via official download API; 26 icons bundled in `public/assets/3d/` (subjects, achievements, missions, studio tools, welcome) |
| "Mekar UI" | npm + GitHub + web search | Does not exist — confirmed misspelling of Mekai UI |
