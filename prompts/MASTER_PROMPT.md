# Pixelspace AI Classroom (paicv3) — Master Prompt

You are building **Pixelspace AI Classroom**, an AI-powered learning product for Malaysian schools.
The goal is not merely a functioning LMS. It is a distinctive, polished AI learning product with a
recognizable Pixelspace identity.

## 1. Surfaces and audiences

| Surface | Audience | Visual direction |
|---|---|---|
| **Pixelspace Play** (primary) | Primary students | Expressive, colourful subject cards, illustrated learning journeys, playful interactions, mascot animations |
| **Pixelspace Studio** (secondary) | Secondary students | Cleaner, more mature, shadcn/ui foundations, selective neo-brutalist styling, stronger typography, subtle motion |
| **Teacher (Guru)** | Teachers | Mature application UI on shadcn/ui foundations |
| **Administrator** | Admins | Mature application UI on shadcn/ui foundations |

The approved direction is **Interactive Discovery + Modern Creative Workspace + selective Game UI**
(full study in `DESIGN_DIRECTIONS.md`). Two critical rules follow from it:

- **Separation principle:** gamification and rewards live at the edges of the product (home, progress,
  celebrations). The learning surface — reading a textbook, solving mathematics, asking the AI —
  stays clean and focused.
- The student experience (Play or Studio) is selected from the student's school level in their
  profile, never a manual theme toggle.

## 2. Technology stack (all entries verified as installable, November 2026)

| Technology | Purpose |
|---|---|
| **Next.js 16 + React 19 + TypeScript** | Application framework (matches the existing mascot repo) |
| **Tailwind CSS v4** | Layout, spacing, responsive styling, theme tokens (`@theme` CSS-first config) |
| **shadcn/ui** | Reliable application primitives: forms, dialogs, dropdowns, tabs, menus, tables, accessible inputs |
| **Motion for React** (`motion` package) | Page transitions, interactive cards, progress animations, mascot choreography |
| **Lucide** (`lucide-react`) | Consistent functional icons |
| **Mekai UI** (ui.mekaigames.com) | Game-feel components for Pixelspace Play: XP bar, pixel buttons, progress, rewards, animated text/backgrounds. 48 free components (MIT), React 19 + Tailwind 4 + Motion, installs via shadcn CLI (`npx shadcn@latest add https://ui.mekaigames.com/r/<component>.json`) |
| **Cult UI** (cult-ui.com) | 154 free MIT animated components that drop into shadcn/ui projects — workspace and AI patterns for Pixelspace Studio |
| **React Bits** (reactbits.dev) | 215+ free animated components for selective personality; license is MIT + Commons Clause (never resell the components themselves) |
| **Magic UI** (magicui.design) | Optional animated components for highlights and onboarding; free core with paid premium templates |
| **BlockUI** (`@malilion/block-ui-react`) | Optional block/pixel game components — Play accents only; the app must never look like Minecraft |
| **3dicons.co** | 3D icon renders (CC0) for Play and the workbook workspace: subjects, achievements, missions, studio tools, welcome illustrations. Bundled as 500px transparent PNGs in `public/assets/3d/` |
| **Custom Pixelspace assets** | School illustrations, mascots, subject artwork, distinctive branding |

**Naming correction:** earlier drafts referenced "Mekar UI", which does not exist. The real library is
**Mekai UI** (ui.mekaigames.com), verified November 2026. If any document or person references
"Mekar UI", they mean Mekai UI. Never use a component that cannot be verified against real
documentation.

## 3. MANDATORY UI DESIGN AND COMPONENT SOURCING

Before implementing the student interface, inspect **shadcn/ui**, **Mekai UI**, **Cult UI**, **React Bits**,
**Magic UI**, and the existing project's component library.

Do not immediately generate custom UI components from scratch.

1. Identify available components from these libraries suitable for educational dashboards, interactive
   cards, navigation, visual effects and student engagement.
2. Verify the actual component APIs, installation requirements, licenses, dependencies and compatibility
   with the existing Next.js/React stack. **Do not invent component names or props.** Read the actual
   documentation for every component before using it (for example, Mekai UI's XP bar is imported from
   `@/components/ui/xp-bar` and takes `xp` and `perLevel` props — verify each component the same way
   before use).
3. Use shadcn/ui for reliable application primitives such as forms, dialogs, dropdowns, tabs, menus and
   accessible inputs.
4. Use Mekai UI for gamification surfaces (XP, rewards, progress) in Pixelspace Play, Cult UI for
   Pixelspace Studio workspace patterns, and React Bits or Magic UI only where they materially improve
   the student experience and fit the product's visual direction.
5. Prefer free/MIT components. Do not pull in paid Pro components without explicit approval — flag them
   instead (some Mekai UI gamification components such as Streak, Leaderboard and Daily Rewards are Pro).
6. Customize components using Pixelspace design tokens rather than retaining default demo styling.
7. Establish two consistent themes: **Pixelspace Play** for primary students and **Pixelspace Studio**
   for secondary students.
8. Use the approved visual references to define typography, spacing, colours, borders, shadows,
   illustrations and interaction patterns.
9. Build a shared component showcase with representative buttons, cards, navigation, form fields, modals
   and learning components **before** implementing all pages.
10. Validate the actual rendered interface in a browser at desktop, tablet and mobile widths.
11. Compare the implemented pages with the approved references and correct visual inconsistencies before
    proceeding.

Avoid generic SaaS templates, excessive gradients, repetitive statistic cards and inconsistent component
styling.

## 4. Design tokens and theming

- Define Pixelspace tokens as CSS custom properties under Tailwind v4 `@theme`: colour palette,
  typography scale, spacing, radii, borders and shadows.
- Derive the core palette from the approved mascot artwork: cream body (`#FCECD2`-family), dark-brown
  outlines (`#37200B`-family), teal `>>` accents, yellow accent rays.
- Both themes share the token foundation; Pixelspace Play overrides expressiveness (claymorphism-style
  depth, saturated subject colours, illustrated journey elements) and Pixelspace Studio overrides
  restraint (flatter surfaces, selective neo-brutalist borders, stronger typographic hierarchy).
- No component may ship with unmodified library demo styling.

## 5. Mascot integration (existing, already built — do not rebuild)

The mascot animation system already exists in `~/Developer/pixelspace-ai-classroom` (Phases A–D
complete, Pixi validated; CSS-only motion, no animation library):

- `<Mascot character="pixi | guru | pelajar | admin" state={...} size={...} />`
- `<RobotFace expression="smile | joyful | surprised | thinking | sparkle | sleeping" />`
- `MascotAnimationProvider` for app-wide speed / paused / reduced-motion settings
- States: `idle, sleeping, waking, thinking, working, happy, celebrating, confused, error, success,
  greeting, processing, explaining`

Copy the component folder and `public/mascots/` assets into paicv3 (or extract a shared package).
Wiring rules:

- Student: Pixi `greeting` on lesson open; `processing` while the AI answers; `success`/`error` on
  correct/incorrect answers; Pelajar `celebrating` on lesson completion.
- Teacher: Guru `greeting` on login; `working` while generating a lesson plan; `celebrating` on success.
- Admin: Admin `working` during processing; `success`/`celebrating` on completed actions.

Never redraw, approximate, or place emoji over the mascot artwork.

## 6. Build sequence (guardrail — do not skip ahead)

Build and **visually validate** the following before generating any other pages:

- **Phase 0** — Design system + shared component showcase: tokens, Play and Studio themes,
  representative buttons, cards, navigation, form fields, modals and learning components.
- **Phase 1** — Login.
- **Phase 2** — Dashboard (both student tiers).
- **Phase 3** — Workbook workspace.

**Stop after Phase 3.** Validate in a browser at desktop, tablet and mobile widths, compare against the
approved references, and get approval. Only then generate the remaining 30+ pages. Otherwise a weak
initial design propagates throughout the application.

## 7. Visual validation loop (required per phase)

1. Run the dev server and capture screenshots at desktop, tablet and mobile widths.
2. Compare implemented pages side-by-side with the approved references.
3. Correct visual inconsistencies; re-validate.
4. Report measured results, not claims.

## 8. Anti-patterns (do not ship)

- Generic SaaS templates.
- Excessive gradients.
- Repetitive statistic cards.
- A full Minecraft-style game look, or another neo-brutalist admin dashboard.
- Copying static inspiration screenshots instead of using verified libraries.
- Inconsistent component styling or leftover default demo styles.
- Invented component names, props or APIs.
- Redrawn or approximated mascot artwork; emoji over mascot faces.
