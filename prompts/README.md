# paicv3 — Prompt Set

Documents for instructing Codex (or any agent) building Pixelspace AI Classroom.

| File | Role |
|---|---|
| `MASTER_PROMPT.md` | The primary instruction document. Paste it to Codex first. |
| `STUDENT_APP_SPEC.md` | The full build specification for the student application: product context, multi-tenant architecture, authentication/registration, every route and feature, security/safeguarding, pilot requirements, end-to-end journeys, implementation order, testing and deliverables. |
| `DESIGN_DIRECTIONS.md` | The design study and plan: six directions evaluated, the approved direction, per-surface specs (Play / Studio), architecture, verified component sources and licenses. Supply it as context after the master prompt. |

Usage order:

1. `MASTER_PROMPT.md` — the rules, stack, guardrails and build sequence.
2. `STUDENT_APP_SPEC.md` — the complete functional specification of the student experience
   (what to build, route by route, with implementation phases).
3. `DESIGN_DIRECTIONS.md` — the visual direction and the verified library catalogue Codex must
   source components from.

All files are self-contained but reference each other. Library claims in `MASTER_PROMPT.md` and
`DESIGN_DIRECTIONS.md` were verified against npm, GitHub and the vendors' sites on 2026-11-08 (see
the verification log in `DESIGN_DIRECTIONS.md`).
