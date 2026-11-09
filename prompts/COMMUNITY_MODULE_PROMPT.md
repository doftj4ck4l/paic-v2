# CODEX MASTER PROMPT — PIXELSPACE AI CLASSROOM COMMUNITY MODULE

## YOUR ROLE

You are the principal full-stack engineer, product architect, and senior UI/UX designer responsible for implementing the complete **Community module** inside the existing Pixelspace AI Classroom application.

Your task is to turn the existing Community page into a production-oriented, end-to-end, multi-tenant student learning network.

**Do not build a separate application. Work inside the existing codebase.**

Inspect the current project before writing code. Identify its framework, routing conventions, database schema, authentication system, existing workbook functionality, reusable UI components, styling, and permission model.

Preserve existing functionality and reuse existing infrastructure wherever possible.

The attached Community screenshot is the primary visual reference.

---

# 1. PRODUCT VISION

Pixelspace Community is a learning-focused social discovery platform for Malaysian primary and secondary students.

It combines:

- **NotebookLM:** share and explore AI-powered workbooks.
- **Pinterest:** discover and save interesting learning resources.
- **GitHub:** remix and build upon published workbooks.
- **Learning communities:** follow approved creators, join subject-based clubs, and participate in educational challenges.
- **Pixelspace AI Classroom:** AI conversations, generated notes, slides, quizzes, flashcards, mind maps, and other learning artifacts.

The product should make students excited to discover what other students have learned and created.

It must not become an unrestricted social media platform.

Students are minors. Privacy, school boundaries, age-appropriate discovery, moderation, and permission controls must be fundamental parts of the architecture.

All interface copy must use natural Bahasa Melayu by default.

---

# 2. VISUAL DESIGN — PRESERVE THE EXISTING PIXELSPACE STYLE

The current screenshot establishes the visual direction.

Maintain:

- Horizontal top navigation.
- No permanent sidebar.
- White/off-white application background.
- Teal as the primary brand color.
- Dark navy headings.
- Rounded cards with subtle borders.
- Pastel blue, mint, lavender, peach, and yellow accents.
- Soft shadows and generous whitespace.
- 3D educational illustrations, preferably using the existing assets or Thiings-style illustrations where licensed.
- Clear typography, friendly but not childish.
- Responsive layouts.

Do not introduce neobrutalism, thick black borders, pixel-art styling, or an unrelated design system.

## Improve the existing Community layout

The current activity feed is too narrow and leaves substantial unused horizontal space.

Redesign the desktop layout with a maximum content width of approximately 1280–1360px.

Use:

1. A compact Community hero at the top.
2. Community navigation tabs.
3. A main discovery/feed column.
4. A complementary right column containing suggested creators, featured workbooks, clubs, and challenges.
5. Dedicated full-width layouts for directory and detail pages.

For smaller screens, collapse the right column below the main content.

Maintain consistent spacing, card radii, button styles, typography, and component states across every page.

Do not create a giant marketing-style hero on every page. The hero belongs primarily on the Community landing page.

Use existing project dependencies where possible. If the project already uses Next.js, Tailwind CSS, shadcn/ui, Lucide, or another component system, extend those rather than introducing a competing stack.

---

# 3. COMMUNITY INFORMATION ARCHITECTURE

The main application navigation must include:

Utama | Buku Kerja | Subjek | Jelajah | Komuniti | Hasil Karya

Inside Komuniti, implement the following navigation:

| Section | Purpose |
|---|---|
| Suapan | Personalized community activity |
| Terokai | Discover workbooks, creators, clubs, and collections |
| Pelajar | Approved student creator directory |
| Buku Kerja | Publicly discoverable shared workbooks |
| Kelab | Subject-based learning communities |
| Cabaran | Educational challenges |
| Disimpan | Saved community resources |
| Profil Saya | Student's own community identity |

Use nested navigation, tabs, or contextual menus. Do not crowd the global navigation.

Suggested routes:

- `/community`
- `/community/explore`
- `/community/students`
- `/community/students/[profileId]`
- `/community/workbooks`
- `/community/workbooks/[publicationId]`
- `/community/clubs`
- `/community/clubs/[clubId]`
- `/community/challenges`
- `/community/challenges/[challengeId]`
- `/community/saved`
- `/community/me`
- `/community/me/edit`
- `/community/my-publications`
- `/community/publish/[workbookId]`
- `/community/notifications`
- `/community/guidelines`

Use the project's established route structure if different.

All routes must be functional and connected to real application state.

---

# 4. PAGE 1 — COMMUNITY HOME / SUAPAN

## Layout

Keep the existing Community hero concept:

**Belajar bersama rakan sekolah.**

Subtitle:

"Terokai buku kerja menarik, ikuti idea pembelajaran dan kongsi hasil karya anda bersama komuniti."

Primary CTA: **Terokai komuniti**

Secondary CTA: **Kongsi buku kerja**

Below the hero, display:

- Community navigation.
- Personalized activity feed.
- Recommended creators.
- Trending workbooks.
- Suggested clubs.
- Active challenges.

## Feed events

Support:

- Student publishes a workbook.
- Student updates a published workbook.
- Student creates a public learning collection.
- Student completes an approved challenge.
- Student receives an achievement approved for sharing.
- New workbook featured by a school.
- New club learning activity.

Each feed card should contain:

- Creator avatar and display name.
- Event type.
- Relative timestamp.
- Subject and level.
- Workbook preview when applicable.
- Save action.
- Open workbook action.
- Follow/subscribe action where permitted.
- Report action.

Use different card treatments for workbook publications, achievements, and challenges without making the feed visually chaotic.

## Feed filters

- Untuk Anda
- Mengikuti
- Sekolah Saya
- Terkini

Only display filters the current user is authorized to access.

Implement cursor-based pagination or infinite scrolling, skeleton loading, empty states, and error recovery.

**Important:** Do not generate artificial social events from private learning activity. A feed event must come from an explicitly permitted publication or shareable achievement.

---

# 5. PAGE 2 — DISCOVER / TEROKAI

This is the primary exploration experience.

## Sections

1. Search across approved community content.
2. Featured workbooks.
3. Popular topics.
4. Recommended creators.
5. Subject collections.
6. Learning clubs.
7. Active challenges.
8. Recently published resources.

## Filters

- School level: Rendah / Menengah.
- Year or Form.
- Subject.
- Topic.
- Resource type.
- School or approved network.
- Newest / Most saved / Featured.

Do not expose exact class or school details for students unless explicitly authorized.

## Recommendation logic

For the pilot, start with explainable, deterministic recommendations based on:

- Student's school level.
- Subjects.
- Curriculum year/form.
- Saved resources.
- Approved club memberships.
- Recent learning topics.
- Workbook quality and moderation status.

Do not build an opaque engagement-maximizing algorithm.

---

# 6. PAGE 3 — STUDENT DIRECTORY / PELAJAR

This page lets students discover approved learning creators.

Display a grid of student creator cards.

Each card contains:

- Generated avatar.
- Public pseudonym.
- Optional learning interests.
- Number of published workbooks.
- Featured subjects.
- Approved achievement badges.
- Follow button where permitted.
- View profile button.

## Discovery categories

- Pencipta Pilihan
- Sains
- Matematik
- Bahasa
- STEM
- Pencipta Baharu
- Mengikuti

## Privacy rules

Primary-school students must not be openly searchable by real name.

For the primary experience, prioritize discovering creator profiles through approved workbooks and curated clubs rather than an unrestricted people-search directory.

For secondary students, allow creator discovery only where school policy, age-appropriate permissions, and moderation permit it.

Do not display student email addresses, phone numbers, exact class identifiers, dates of birth, or other personal information.

---

# 7. PAGE 4 — STUDENT CREATOR PROFILE

Build a polished student creator profile, similar to a lightweight academic portfolio.

## Profile header

- Avatar.
- Public display name.
- Short learning bio.
- Subject interests.
- Approved achievement badges.
- Number of published workbooks.
- Number of saved resources or other non-sensitive contribution metrics.
- Follow/unfollow action when permitted.

## Tabs

- Buku Kerja
- Koleksi
- Pencapaian
- Aktiviti

## Workbook gallery

Show published workbooks as visually rich cards.

Each workbook card contains:

- Cover illustration.
- Title.
- Subject.
- Year/Form.
- Description.
- Save count if allowed.
- Open button.
- Remix button if permitted.

## Follow model

Following should mean subscribing to approved learning publications.

It must not reveal private activity, school attendance, student relationships, or profile visits.

Do not implement profile-view notifications or visitor tracking.

Do not implement public direct messaging.

Do not display public follower rankings.

For primary-school students, use curated subscriptions or teacher-approved creator follows rather than unrestricted peer following.

---

# 8. PAGE 5 — SHARED WORKBOOK DIRECTORY

This is one of the most important Community pages.

Students should be able to browse workbooks published by other approved creators.

## Workbook card

- Attractive subject illustration.
- Workbook title.
- Description.
- Subject.
- Year/Form.
- Creator pseudonym.
- Resource count.
- Save count.
- Publication date.
- Open action.
- Save action.
- Remix action when allowed.

## Filters

- Subject.
- Curriculum level.
- Topic.
- Resource type.
- Featured.
- Newest.
- Most saved.

## Search

Implement real server-side search with pagination.

Search must respect school tenancy, publication visibility, moderation state, and the student's permissions.

---

# 9. PAGE 6 — SHARED WORKBOOK DETAIL

When a student clicks a shared workbook, open a dedicated Community workbook page.

Do not immediately open the creator's private workspace.

## Header

- Workbook title.
- Cover illustration.
- Creator.
- Subject and level.
- Description.
- Publication date.
- Save button.
- Remix button.
- Report button.

## Tabs

**Gambaran Keseluruhan**

Overview of the workbook and its learning objectives.

**Sumber**

Only explicitly licensed and approved sources included in the published snapshot.

**Nota**

Published notes.

**Kuiz**

Approved interactive quizzes.

**Slaid**

Published slide decks.

**Kad Imbas**

Published flashcards.

**Peta Minda**

Published mind maps.

**Tanya AI**

Optional AI interaction grounded only in the published, permitted workbook material.

Do not expose the creator's private chat history, unpublished sources, hidden metadata, or teacher-only material.

AI interaction must have appropriate safeguards, rate limits, and source attribution.

---

# 10. PAGE 7 — SAVE AND REMIX WORKBOOK

This is a core differentiating feature.

## Save

Students can save approved community workbooks into their own saved collection.

Saving does not duplicate the workbook.

## Remix

Students can click:

**Buat versi saya**

The system should:

1. Verify the source publication permits remixing.
2. Verify the requesting student has access.
3. Display a confirmation dialog.
4. Create a new private workbook owned by the student.
5. Copy only explicitly remixable content and permitted source references.
6. Preserve attribution to the original publication.
7. Exclude private chat history, private files, private progress, unpublished artifacts, and restricted content.
8. Open the newly created workbook in the existing workbook workspace.

## Remix attribution

Display:

"Diadaptasi daripada buku kerja oleh [Creator]"

Support version lineage:

Original publication → Student remix → Student's private workbook.

A remix must not automatically become publicly visible.

If the source is revoked or removed for safety, apply a defined revocation policy to derived copies and associated source material.

---

# 11. PAGE 8 — PUBLISH WORKBOOK

Students must be able to publish their own workbook through a guided workflow.

Add a **Kongsi ke Komuniti** action inside the existing workbook interface.

## Publishing wizard

### Step 1 — Select workbook

Choose a workbook the student owns and is authorized to publish.

### Step 2 — Select content

Choose individual items:

- Notes.
- Slides.
- Quizzes.
- Flashcards.
- Mind maps.
- Approved sources.

Nothing should be selected automatically if it contains potentially private or restricted information.

### Step 3 — Publication details

- Title.
- Description.
- Subject.
- Year/Form.
- Topic.
- Cover.
- Tags.
- Remix permission.

### Step 4 — Visibility

Options based on school policy:

- Private.
- Class.
- School.
- Approved school network.
- Community-wide.

### Step 5 — Safety review

Scan for:

- Personal information.
- Student identities.
- Contact information.
- Restricted teacher materials.
- Copyright or licensing restrictions.
- Sensitive content.
- Unsafe external links.
- Prompt injection embedded in documents.

Automated checks should assist, not replace required human approval.

### Step 6 — Submit for approval

Show a publication preview and moderation status.

Possible states:

- Draf.
- Menunggu Kelulusan.
- Diterbitkan.
- Perlu Pembetulan.
- Ditolak.
- Dinyahterbitkan.

## Publication architecture

A published workbook must be an immutable or versioned publication snapshot.

It must not expose the underlying private workbook directly.

Changes to the original private workbook must not silently update its public publication.

Implement a controlled republishing flow.

---

# 12. PAGE 9 — LEARNING CLUBS / KELAB

Build topic-based learning communities.

Examples:

- Kelab Sains.
- Kelab Matematik.
- Kelab STEM.
- Kelab Bahasa Melayu.
- Kelab Bahasa Inggeris.
- Kelab Persediaan SPM.

## Club directory

Each club card contains:

- Cover illustration.
- Club name.
- Description.
- Subject.
- Member count, where permitted.
- School/network visibility.
- Join button.

## Club detail page

Tabs:

- Utama.
- Bahan Pembelajaran.
- Aktiviti.
- Cabaran.
- Ahli, if permitted.

## Club functions

- Join/leave according to school permissions.
- View approved shared workbooks.
- Save resources.
- Participate in structured learning activities.
- Submit challenge work.
- Follow club announcements.

Clubs should be created or approved by authorized teachers/admins during the pilot.

Do not implement unrestricted student-created clubs or open chat rooms in the initial release.

---

# 13. PAGE 10 — COMMUNITY CHALLENGES / CABARAN

Challenges should make learning collaborative and engaging.

Examples:

- Cabaran 7 Hari Matematik.
- Minggu Eksperimen Sains.
- Bina Buku Kerja Sistem Suria.
- Cabaran Kosa Kata Bahasa Melayu.
- Cabaran Ulang Kaji SPM.

## Challenge detail

- Title.
- Description.
- Learning objectives.
- Eligibility.
- Start/end dates.
- Rules.
- Submission format.
- Participation status.
- Approved rewards or badges.

## Participation

Students can submit:

- A workbook publication.
- A quiz result.
- A learning artifact.
- A structured answer.

Implement teacher/admin review where appropriate.

Use mastery, completion, creativity, and helpfulness rather than raw popularity as recognition criteria.

Do not introduce public competitive leaderboards for primary-school students.

---

# 14. PAGE 11 — SAVED RESOURCES / DISIMPAN

Students need a personal library of community discoveries.

Sections:

- Buku Kerja Disimpan.
- Pencipta Diikuti.
- Kelab Saya.
- Koleksi Saya.

Support:

- Search.
- Filtering.
- Remove from saved.
- Open resource.
- Create personal collection.
- Organize saved workbooks.

Saved content must remain private by default.

---

# 15. PAGE 12 — MY COMMUNITY PROFILE

Implement a profile dashboard where students manage their community identity.

## Profile sections

- Avatar.
- Pseudonym.
- Bio.
- Subject interests.
- Approved achievements.
- Published workbooks.
- Saved resources.
- Club memberships.
- Followed creators, where permitted.

## Profile settings

- Edit display name.
- Choose avatar.
- Update interests.
- Manage profile visibility.
- Manage subscriptions.
- Manage publication settings.
- Request deletion of community content.
- View community guidelines.

Use safe generated aliases for minors and prevent students from publishing personal contact information.

---

# 16. PAGE 13 — MY PUBLICATIONS

Create a publication management interface.

Students can view:

- Drafts.
- Pending submissions.
- Approved publications.
- Rejected submissions.
- Unpublished workbooks.

Actions:

- Preview.
- Edit draft.
- Resubmit.
- Unpublish.
- View moderation feedback.
- View approved engagement metrics.

Do not allow students to bypass approval by editing an already approved public publication.

---

# 17. PAGE 14 — COMMUNITY NOTIFICATIONS

Create a dedicated Community notifications view.

Support notifications for:

- Publication approved.
- Publication requires changes.
- Workbook featured.
- New approved content from followed creators.
- Club announcement.
- Challenge reminder.
- Challenge result.
- Content moderation decision.

Do not expose who viewed someone's profile or private learning activities.

Support read/unread state and notification preferences.

Respect school policies and student age.

---

# 18. PAGE 15 — COMMUNITY GUIDELINES AND REPORTING

Create an accessible Community Guidelines page in Bahasa Melayu.

Explain:

- What students may share.
- What must remain private.
- Respectful behavior.
- Copyright and attribution.
- AI-generated content.
- Reporting inappropriate content.
- Consequences of misuse.

Every published resource and creator profile must have a report action.

Reporting flow:

1. Select reason.
2. Add optional explanation.
3. Submit report.
4. Show confirmation.
5. Route to the appropriate moderation queue.

Students must not see the reporter's identity.

---

# 19. PRIMARY VS SECONDARY EXPERIENCE

The system must adapt to the student's verified school level.

## Primary school — SK

Design language:

- More colorful.
- Larger touch targets.
- More illustrations.
- Simpler copy.
- Guided navigation.

Community behavior:

- Curated discovery.
- School-approved workbooks.
- Teacher-managed clubs.
- No unrestricted student search.
- No open peer messaging.
- No public comments.
- No public popularity rankings.
- Restricted following/subscriptions.
- Teacher/guardian-controlled publishing according to school policy.

## Secondary school — SMK

Design language:

- More mature.
- Cleaner information density.
- More creator-oriented.
- More academic portfolio features.

Community behavior:

- Approved creator profiles.
- Topic-based subscriptions.
- Curated cross-school discovery.
- More advanced collections.
- SPM-focused communities.
- Collaborative educational challenges.

The secondary experience may enable additional interactions only after explicit school-policy approval and appropriate safeguards.

Do not trust a client-side primary/secondary toggle for permissions.

Derive permissions from verified enrollment, age-appropriate policy, tenant settings, and server-side authorization.

---

# 20. MULTI-TENANT SAAS ARCHITECTURE

The application will initially serve:

- Three Sekolah Kebangsaan.
- One Sekolah Menengah Kebangsaan.

The architecture must support future expansion to many schools.

Every student belongs to an authenticated school tenant.

Every publication must have an owner and a visibility scope.

Never expose one school's private data to another school.

## Required authorization

Implement server-side authorization for:

- Reading community content.
- Following creators.
- Saving workbooks.
- Remixing.
- Publishing.
- Joining clubs.
- Submitting challenges.
- Moderating content.
- Accessing reports.

Use the existing authentication and tenancy architecture.

Never rely on hidden UI buttons as the security boundary.

## Required onboarding

Because pilot-school teacher and student data is not yet available, support:

- School-created invitation codes.
- Student join codes.
- Teacher/admin-managed enrollment.
- CSV import for school rosters.
- Pending enrollment approval.
- Role verification.
- Class/year assignment.
- Duplicate account handling.
- School transfer and account deactivation.

Do not allow an unverified public signup to self-declare membership in a school and gain access to its private community.

---

# 21. DATABASE DESIGN

Inspect the existing database schema and extend it safely.

Suggested entities:

- `community_profiles`
- `community_profile_interests`
- `community_follows`
- `community_publications`
- `community_publication_versions`
- `community_publication_assets`
- `community_publication_sources`
- `community_saved_items`
- `community_collections`
- `community_collection_items`
- `community_feed_events`
- `community_clubs`
- `community_club_memberships`
- `community_challenges`
- `community_challenge_submissions`
- `community_achievements`
- `community_notifications`
- `community_reports`
- `community_moderation_actions`
- `community_visibility_policies`
- `community_audit_logs`

Reuse existing user, tenant, school, class, subject, workbook, and artifact entities instead of duplicating them.

Each entity must have appropriate ownership, tenant scope, timestamps, indexes, foreign keys, and lifecycle states.

Implement database migrations and seed data.

## Important

The system must distinguish:

1. Private workbook.
2. Published workbook snapshot.
3. Saved reference to a publication.
4. Remixed private workbook.

These are different objects with different permissions.

---

# 22. BACKEND AND API REQUIREMENTS

Implement real server-side services for:

- Community feed.
- Creator discovery.
- Profile management.
- Following/subscriptions.
- Publication creation and review.
- Publication search.
- Saved resources.
- Workbook remixing.
- Clubs.
- Challenges.
- Notifications.
- Reports and moderation.

Follow existing API conventions.

All write operations must have:

- Authentication.
- Authorization.
- Input validation.
- Rate limiting.
- Audit logging where appropriate.
- Meaningful error responses.

Implement cursor pagination for feeds and large directories.

Search must be scoped to authorized publications.

Prevent unauthorized cross-school queries, direct-object-reference vulnerabilities, and accidental leakage of private files.

---

# 23. TEACHER AND ADMIN DEPENDENCIES

Although the primary deliverable is the student Community experience, the module cannot operate safely without moderation.

Implement the minimum teacher/admin backend capabilities required for the student features to work.

These include:

- Review publication submissions.
- Approve or reject shared workbooks.
- Moderate reported content.
- Create/approve clubs.
- Create/approve challenges.
- Feature approved resources.
- Configure school visibility.
- Suspend community publishing permissions.
- Review audit events.

These may initially use simple internal administrative screens consistent with the existing application.

Do not leave moderation as a nonfunctional placeholder.

---

# 24. COMPONENT ARCHITECTURE

Build reusable components such as:

- `CommunityHero`
- `CommunityTabs`
- `CommunityFeed`
- `FeedEventCard`
- `CreatorCard`
- `CreatorProfileHeader`
- `WorkbookPublicationCard`
- `WorkbookPublicationPreview`
- `SaveWorkbookButton`
- `RemixWorkbookDialog`
- `PublishWorkbookWizard`
- `PublicationVisibilitySelector`
- `PublicationStatusBadge`
- `CommunitySearch`
- `CommunityFilterBar`
- `ClubCard`
- `ChallengeCard`
- `AchievementBadge`
- `CommunityNotificationItem`
- `CommunityReportDialog`
- `CommunityEmptyState`
- `CommunitySkeleton`

Use consistent design tokens.

Avoid large monolithic page components.

---

# 25. UI INTERACTION REQUIREMENTS

Every visible control must have a meaningful function.

Examples:

- Clicking a creator opens the creator profile.
- Clicking a workbook opens its detail page.
- Saving persists the saved state.
- Following updates the subscription state.
- Remixing creates a real private workbook.
- Publishing creates a real submission.
- Joining a club creates a membership.
- Filtering changes results.
- Searching queries actual authorized data.
- Reporting creates a moderation report.
- Notifications open relevant content.

Implement loading, success, error, empty, permission-denied, and retry states.

No fake buttons.

No static hardcoded counters masquerading as real data.

No toast claiming success unless the backend operation succeeds.

---

# 26. DEMO AND SEED DATA

Create a realistic development dataset for the four pilot schools.

Use fictional:

- Schools.
- Students.
- Teacher accounts.
- Creator profiles.
- Workbooks.
- Publications.
- Clubs.
- Challenges.
- Achievements.
- Activity feed events.

Include examples for:

- Tahun 4 Sains — Kitaran Air.
- Tahun 5 Sains — Sistem Suria.
- Tahun 4 Matematik — Pecahan.
- Tahun 6 Bahasa Melayu — Karangan.
- Tingkatan 4 Matematik — Fungsi Kuadratik.
- Tingkatan 5 Sains — Tenaga.
- SPM revision collections.

Clearly mark demo data.

Provide realistic empty states for brand-new schools with no existing community content.

Do not make the application dependent on having a large active community from day one.

---

# 27. TESTING REQUIREMENTS

Add automated tests for:

- Tenant isolation.
- Student permission enforcement.
- Primary/secondary policy differences.
- Publication approval workflow.
- Private workbook access prevention.
- Public snapshot sanitization.
- Workbook remixing.
- Source attribution.
- Saving and unsaving.
- Following and unfollowing.
- Club membership.
- Challenge submissions.
- Moderation.
- Report handling.
- Search filtering.
- Publication revocation.
- Account deactivation.

Add end-to-end tests for the main student journeys.

Test with primary and secondary student accounts from different school tenants.

Include negative security tests to ensure a student cannot access another student's private workbooks by guessing IDs or manipulating requests.

---

# 28. IMPLEMENTATION ORDER

Work in the following order.

**Phase 1 — Foundation**
- Inspect codebase.
- Establish design tokens and reusable components.
- Create schema and migrations.
- Implement authorization and tenant policies.
- Create demo seed data.

**Phase 2 — Discovery**
- Community homepage.
- Feed.
- Creator directory.
- Creator profiles.
- Shared workbook directory.
- Workbook detail.

**Phase 3 — Social Learning**
- Save resources.
- Follow/subscriptions.
- Collections.
- Workbook remixing.

**Phase 4 — Publishing**
- Publishing wizard.
- Publication snapshots.
- Approval workflow.
- My Publications.
- Moderation.

**Phase 5 — Engagement**
- Clubs.
- Challenges.
- Achievements.
- Notifications.

**Phase 6 — Hardening**
- Security tests.
- End-to-end tests.
- Responsive design.
- Accessibility.
- Performance.
- Documentation.

Complete each phase with working code and tests before moving to the next.

Do not replace existing application features or rewrite unrelated modules.

---

# 29. DEFINITION OF DONE

The Community module is complete when a student can:

1. Log into their school account.
2. Open Community.
3. Discover approved workbooks.
4. View an approved student creator profile.
5. Follow an approved creator where permitted.
6. Save a shared workbook.
7. Open and study a published workbook.
8. Remix an eligible workbook into a private workspace.
9. Publish their own workbook through the approval process.
10. Join an approved learning club.
11. Participate in an educational challenge.
12. Manage their profile and publications.
13. Receive community notifications.
14. Report inappropriate content.
15. Use the application on desktop, tablet, and mobile.

Additionally:

- Primary and secondary policies must be enforced server-side.
- Cross-school privacy must be verified.
- Teacher/admin moderation must function.
- No private workbook content may leak through public sharing.
- The design must remain consistent with Pixelspace AI Classroom.
- The application must work with the seeded demo dataset and handle empty new-school accounts gracefully.

---

# 30. FINAL INSTRUCTION

Do not merely produce a design concept, screenshot, or static frontend.

Build the actual Community module inside the existing Pixelspace AI Classroom application.

Before coding, inspect the repository and provide a concise implementation plan describing existing reusable functionality, required migrations, key security decisions, and the files/modules to be changed.

Then implement the module phase by phase.

Make reasonable technical decisions based on the existing codebase without repeatedly asking for approval.

Do not invent working backend integrations, successful tests, or completed features.

After implementation, provide:

- Routes created.
- Components created.
- Database migrations.
- API endpoints.
- Permission rules.
- Test results.
- Demo credentials or documented seed-account setup.
- Remaining limitations, if any.

**The final result should feel like a real, polished educational SaaS product—not a social-media clone, generic LMS, or disconnected UI prototype.**
