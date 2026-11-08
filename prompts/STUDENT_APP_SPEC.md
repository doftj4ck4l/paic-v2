# PIXELSPACE AI CLASSROOM — MASTER STUDENT APPLICATION BUILD SPECIFICATION

## 1. YOUR ROLE

You are the principal full-stack engineer, product architect, and senior UI/UX engineer responsible for implementing the complete student experience for **Pixelspace AI Classroom**.

This is a real Malaysian education SaaS application, not a landing page, prototype, or static dashboard.

Your responsibility is to inspect the existing repository, understand the current implementation, preserve working functionality, and build a cohesive, production-oriented student application.

Implement actual routes, reusable components, authentication flows, database models, API endpoints, authorization, persistence, loading states, error handling, and end-to-end user journeys.

Do not merely produce screenshots or non-functional mockups.

## 2. PRODUCT CONTEXT

Pixelspace AI Classroom is an AI-powered learning platform designed for Malaysian primary and secondary schools.

The first pilot will involve four schools:
- Three Sekolah Kebangsaan (SK)
- One Sekolah Menengah Kebangsaan (SMK)

The application must support expansion to many schools without rebuilding its architecture.

The platform serves students, teachers, school administrators, and platform administrators. This implementation phase focuses exclusively on the **student experience**, but the underlying data models and authorization must support the other roles later.

### Two student experiences

**Pixelspace Play — Primary School**
- Tahun 1–6
- Illustrated, friendly, colourful, age-appropriate
- Inspired by Duolingo, Khan Academy Kids, and interactive learning adventures
- Large buttons, clear language, mascot guidance, visual learning journeys
- Gamification through achievements, learning missions, and progress

**Pixelspace Studio — Secondary School**
- Tingkatan 1–5
- Modern, creative, mature, and productivity-oriented
- Inspired by NotebookLM, Brilliant, and polished creative productivity tools
- Clean workspaces, refined typography, interactive learning, AI research, and structured revision
- Gamification is subtle and secondary to learning

Both experiences share the same backend and product capabilities.

The UI must automatically adapt according to the student's school level.

Do not create separate applications for primary and secondary students.

## 3. NON-NEGOTIABLE IMPLEMENTATION PRINCIPLES

1. Inspect the existing codebase before changing anything.
2. Reuse working components, services, authentication, database infrastructure, and design tokens where appropriate.
3. Do not replace functional backend logic merely to implement a new design.
4. Build real, navigable, responsive pages.
5. No dead buttons, fake upload functionality, hardcoded user statistics, or decorative controls pretending to work.
6. Every page must have meaningful empty, loading, error, and success states.
7. Do not fabricate AI-generated results or citations.
8. Use realistic seeded demonstration data only in explicitly identified development/demo environments.
9. Implement server-side authorization and tenant isolation, not just client-side route protection.
10. Use consistent reusable components and a shared design system.
11. Prioritize accessibility, reading comfort, performance, and usability for children.
12. Make all major student journeys work end-to-end before polishing secondary visual details.
13. Preserve the existing Pixelspace branding while establishing a more distinctive student experience.
14. Support Bahasa Melayu and English, with Bahasa Melayu as the default pilot language.
15. Do not assume every child has an email address or personal mobile phone.

## 4. TECHNICAL FOUNDATION

Use the existing repository's framework and infrastructure where practical.

Preferred stack, if compatible with the current project:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui and Radix primitives
- PostgreSQL
- Existing ORM, otherwise Prisma or Drizzle
- Existing authentication solution
- Existing AI gateway/model integration
- Object storage for uploaded sources and generated artifacts
- Background job processing for long-running AI tasks
- Zod for input validation
- React Hook Form for complex forms
- Motion for React for selective animations

Do not migrate frameworks or introduce competing libraries without a concrete technical reason.

Create a shared design system with two theme variants:
- `primary`
- `secondary`

Theme selection must be derived from verified student profile and enrollment information, not from an untrusted client parameter.

## 5. SAAS AND MULTI-TENANCY ARCHITECTURE

This is a multi-school SaaS.

The core organizational hierarchy is:

Platform
→ School
→ Academic Year
→ Class
→ Enrollment
→ Student

A user may have one or more school memberships over time.

A class belongs to one school and one academic year.

A student belongs to a school through an enrollment or membership record.

Students may belong to multiple classes.

All school-owned resources must be scoped to their correct school.

### Required database concepts

Implement or extend the existing schema to support:

- User
- UserIdentity / AuthenticationAccount
- StudentProfile
- School
- SchoolMembership
- AcademicYear
- Class
- ClassEnrollment
- SchoolInvitation
- ClassJoinCode
- GuardianRelationship
- Workbook
- WorkbookSource
- WorkbookAccess
- WorkbookClassShare
- AIConversation
- AIMessage
- GeneratedArtifact
- ArtifactGenerationJob
- Assignment
- AssignmentAttempt
- AssignmentSubmission
- AssignmentFeedback
- Quiz
- QuizQuestion
- QuizAttempt
- FlashcardDeck
- StudySession
- LearningProgress
- SubjectMastery
- Achievement
- StudentAchievement
- Notification
- AuditLog
- UsageRecord

Adapt names to existing conventions. Avoid duplicate or unnecessary tables.

Use explicit school ownership, user ownership, visibility, and access-control relationships.

Never trust a `schoolId`, `studentId`, or `classId` sent by the browser without validating membership and authorization.

Private student conversations, files, progress, and generated artifacts must not become visible to teachers, classmates, or other schools unless the product's authorization rules explicitly permit that access.

## 6. AUTHENTICATION AND REGISTRATION

Implement the complete authentication experience.

### Pages

- `/welcome`
- `/login`
- `/register`
- `/register/student`
- `/join-school`
- `/join-class`
- `/forgot-password`
- `/reset-password`
- `/verify-account`
- `/auth/error`

Adapt routes if existing project conventions differ.

### Login

Support the existing verified authentication mechanisms.

Provide:
- Email/password login for eligible users
- School-issued username/password or student ID-based login if supported by the authentication backend
- School invitation/code onboarding
- Password visibility toggle
- Remembered session
- Forgot password
- Clear validation errors
- Safe rate limiting and lockout protections

A class code alone must never be treated as sufficient authentication.

### Registration

Do not assume that every student has an email address.

Support these scenarios:

**Scenario A — Student receives school invitation**
1. Student opens invitation or enters school-issued code.
2. System identifies the school.
3. Student completes the permitted onboarding process.
4. Account is linked to the correct school.
5. Student is assigned the appropriate school level.
6. Student reaches the correct Play or Studio experience.

**Scenario B — School pre-provisions accounts**
1. School creates/imports student records.
2. Student receives a secure first-login credential or activation process.
3. Student activates account.
4. System verifies school membership.
5. Student enters the correct dashboard.

**Scenario C — Existing student joins a class**
1. Student signs in.
2. Enters teacher-issued class code.
3. System validates code, school membership, eligibility, and capacity.
4. Enrollment is created or approval is requested.
5. Student sees the class.

**Scenario D — Unaffiliated registration**
Allow registration only according to configurable platform policy. An unaffiliated account must not gain access to school resources without verified enrollment.

### Minors and safeguarding

Account creation, student information collection, and guardian/parent involvement must be configurable according to age, school policy, and applicable Malaysian requirements.

Do not assume that a child can independently consent to every type of data processing.

Avoid collecting unnecessary personal data.

### Password recovery

Implement secure token-based password recovery.

For students without personal email addresses, provide a school-authorized account recovery workflow rather than an unusable email-only reset screen.

Use short-lived, single-use recovery tokens, secure session handling, and appropriate anti-enumeration protections.

## 7. APPLICATION NAVIGATION

### Primary student sidebar

- Home
- My Workbooks
- Explore
- My Classes
- Assignments
- Practice
- My Creations
- My Progress

### Secondary student sidebar

- Home
- Workbooks
- Discover
- Classes
- Assignments
- Study & Practice
- My Creations
- Progress

Shared account menu:
- Profile
- Notifications
- Settings
- Help
- Sign Out

Do not put every subpage into the sidebar.

Use nested navigation, tabs, contextual actions, and breadcrumbs.

## 8. HOME DASHBOARD

### Primary — Pixelspace Play

Build a personalised learning dashboard.

Required sections:

1. Welcome banner
   - Student's preferred name
   - Friendly mascot
   - Illustrated school/learning scene
   - Main action: Continue Learning

2. Continue Learning
   - Last accessed workbook
   - Current topic
   - Real saved progress
   - Resume action

3. My Subjects
   - Subject cards
   - Illustrated icons
   - Age-appropriate labels

4. Today's Learning
   - Recommended learning activity
   - Due assignments
   - Suggested practice

5. My Missions
   - Small achievable learning goals
   - Completion indicators

6. My Achievements
   - Earned badges
   - Learning milestones
   - Optional XP, if enabled

7. School Announcements
   - Relevant school/class notices

Do not overwhelm the screen with every section simultaneously. Prioritize the main learning action.

### Secondary — Pixelspace Studio

Build a modern student workspace.

Required sections:

1. Personalised welcome
2. Continue Studying
3. Recent Workbooks
4. Upcoming Assignments
5. Quick Ask AI entry point
6. Recommended Revision
7. Subject Mastery Overview
8. Recent Creations
9. Class Announcements

Avoid childish illustrations, excessive badges, or arcade-style navigation.

Use clear information hierarchy and generous whitespace.

## 9. WORKBOOK SYSTEM — CORE PRODUCT

This is the most important feature.

A workbook is a NotebookLM-inspired AI learning workspace.

A workbook can contain:
- Documents
- PDFs
- Notes
- Teacher-provided materials
- Supported uploaded files
- Web sources where permitted
- AI conversations
- Generated learning materials
- Study activities

### Pages

- `/workbooks`
- `/workbooks/new`
- `/workbooks/[id]`
- `/workbooks/[id]/sources`
- `/workbooks/[id]/chat`
- `/workbooks/[id]/studio`
- `/workbooks/[id]/settings`

Use route nesting or tabs appropriately.

### My Workbooks

Features:
- Workbook grid/list
- Search
- Filter by subject
- Filter by class
- Recent activity
- Ownership/teacher-shared indicators
- Create workbook
- Rename owned workbook
- Duplicate when permitted
- Archive/delete owned workbook
- Open workbook

### Create Workbook

Students can create personal workbooks, subject to school policy.

Required fields:
- Title
- Subject
- Optional topic
- Description
- Cover image/icon
- Initial sources

Do not force students to select a class for a personal workbook.

### Workbook workspace

Implement a responsive three-panel workspace inspired by NotebookLM.

**Left: Sources**
- Uploaded materials
- Source list
- Source status
- Add source
- View source
- Remove source if authorized
- Source selection for AI grounding

**Center: AI Learning Chat**
- Conversation history
- Ask questions
- Context-aware responses
- Source citations
- Suggested questions
- Follow-up questions
- Save useful responses
- Loading/streaming state
- AI error/retry handling

**Right: Learning Studio**
- Generate Slides
- Generate Notes
- Generate Quiz
- Generate Flashcards
- Generate Mind Map
- Generate Study Guide
- Generate Audio Lesson

The right panel may collapse on smaller screens.

### AI behavior

AI answers must use the workbook's selected sources where available.

Show traceable citations linked to actual sources and relevant passages.

Distinguish grounded answers from general-knowledge answers.

Do not invent references.

Use the existing AI infrastructure and gateway if available.

For primary students:
- Simpler vocabulary
- Shorter explanations
- More guided questions
- Visual support where available
- Encouragement without excessive gamification
- Age-appropriate response filtering

For secondary students:
- Deeper explanations
- Structured reasoning
- Citations
- Revision assistance
- Guided problem-solving
- Exam-oriented learning support

AI should help students understand and learn, not automatically complete graded work on their behalf.

## 10. MY CREATIONS — GENERATED ARTIFACTS

Students must have a central library for all AI-generated learning materials.

### Routes

- `/creations`
- `/creations/slides/[id]`
- `/creations/notes/[id]`
- `/creations/quizzes/[id]`
- `/creations/flashcards/[id]`
- `/creations/mindmaps/[id]`
- `/creations/audio/[id]`
- `/creations/study-guides/[id]`

Each artifact must:
- Have a persistent database record
- Reference its originating workbook
- Store creation status
- Support reopening
- Have clear ownership and access controls
- Display actual generated content
- Provide appropriate actions for its format

Generation jobs must show queued, processing, completed, and failed states.

Never display a successful result before generation completes.

### 10.1 AI Slides

Create a dedicated slide-generation flow.

Inputs:
- Topic
- Source selection
- Slide count
- Language
- Learning level
- Optional presentation style

Outputs:
- Slide deck preview
- Slide navigation
- Full-screen presentation
- Regenerate slide/deck where supported
- Download PPTX/PDF when the export service is implemented

Use structured slide data rather than generating uneditable screenshots as the primary format.

Persist generated slides.

### 10.2 AI Notes

Generate structured notes from workbook materials.

Features:
- Headings
- Summaries
- Key concepts
- Definitions
- Examples
- Source citations
- Save and reopen
- Export when implemented

### 10.3 AI Quizzes

Generate questions based on selected sources.

Support:
- Multiple-choice questions
- True/false
- Short answers where reliable evaluation is available
- Difficulty levels
- Attempt submission
- Scoring
- Explanations
- Review incorrect answers
- Saved attempt history

### 10.4 Flashcards

Support:
- Front/back cards
- Flip interaction
- Previous/next
- Shuffle
- Mark known/needs practice
- Saved progress
- Optional spaced repetition

### 10.5 Mind Maps

Generate structured concept maps.

Support:
- Interactive nodes
- Expand/collapse
- Zoom/pan
- Readable mobile fallback
- Source links where relevant
- Save and reopen
- Export where implemented

### 10.6 Audio Lessons

Support:
- Generate spoken explanations from approved learning content
- Playback
- Pause
- Seek
- Transcript
- Playback speed
- Save/reopen

Use a real TTS or audio-generation service. Do not simulate generated audio.

### 10.7 Study Guides

Generate:
- Topic overview
- Learning objectives
- Key concepts
- Worked examples
- Practice recommendations
- Revision checklist

## 11. EXPLORE / DISCOVER

Create a discovery experience for learning materials.

Pages:
- `/explore`
- `/explore/subjects/[id]`
- `/explore/topics/[id]`
- `/explore/workbooks/[id]`
- `/search`

Features:
- Search
- Subject filters
- Year/form filters
- Curriculum/topic filters
- Recommended workbooks
- Teacher-shared workbooks
- School-approved public resources
- Workbook preview
- Save/copy workbook when permitted

Primary:
- Illustrated subject collections
- Friendly discovery cards
- Guided browsing

Secondary:
- Search-first interface
- Topic collections
- Revision resources
- Clear metadata

Public discovery must not expose private school materials.

## 12. MY CLASSES

Pages:
- `/classes`
- `/classes/[id]`
- `/classes/[id]/materials`
- `/classes/[id]/assignments`
- `/classes/[id]/announcements`

Features:
- View enrolled classes
- Class name
- Subject
- Teacher name where permitted
- Shared workbooks
- Announcements
- Assigned activities
- Join class
- Leave class only when school policy allows

Students must not be able to browse other schools' classes.

## 13. ASSIGNMENTS

Pages:
- `/assignments`
- `/assignments/[id]`
- `/assignments/[id]/attempt`
- `/assignments/[id]/result`

Features:
- Upcoming
- In progress
- Submitted
- Completed
- Overdue
- Assignment detail
- Instructions
- Due date
- Attached resources
- Quiz attempts
- File submission when supported
- Submission confirmation
- Teacher feedback
- Results

Use real assignment state transitions.

Prevent unauthorized resubmissions or attempts when assignment policy disallows them.

## 14. STUDY & PRACTICE

Pages:
- `/practice`
- `/practice/subjects/[id]`
- `/practice/topics/[id]`
- `/practice/session/[id]`
- `/practice/results/[id]`

Capabilities:
- Subject practice
- Topic practice
- AI-guided exercises
- Revision quizzes
- Practice history
- Weak-topic recommendations
- Form 4–5 exam practice where appropriate

Use KSSR/KSSM curriculum metadata where available.

Do not claim official curriculum alignment unless the corresponding curriculum data has actually been loaded and verified.

For primary students, emphasize guided practice and explanations.

For secondary students, emphasize independent practice, structured revision, and examination preparation.

## 15. PROGRESS AND ACHIEVEMENTS

Pages:
- `/progress`
- `/progress/subjects/[id]`
- `/progress/achievements`
- `/progress/history`

Track real learning events:
- Workbook activity
- Completed practice
- Quiz attempts
- Assignment completion
- Topic mastery
- Study sessions
- Learning milestones

Avoid deriving mastery solely from time spent or number of AI messages.

Primary:
- Visual progress journeys
- Earned badges
- Friendly feedback

Secondary:
- Topic performance
- Strengths and weaknesses
- Revision recommendations
- Study history

Do not implement public leaderboards or social comparison by default.

## 16. PROFILE AND ACCOUNT SETTINGS

Pages:
- `/profile`
- `/profile/edit`
- `/settings`
- `/settings/security`
- `/settings/preferences`
- `/notifications`
- `/help`

Profile:
- Display name
- Avatar
- School
- Class
- Year/form
- Preferred language
- Account details

Security:
- Change password
- Active sessions where supported
- Sign out
- Account recovery information

Preferences:
- Language
- Accessibility
- Motion reduction
- Notification preferences
- Learning preferences

Students must not freely edit verified school enrollment, role, or year/form data.

## 17. NOTIFICATIONS

Support:
- New assignments
- Assignment deadlines
- Teacher-shared workbooks
- Class announcements
- Generation completion
- Important account notices

Provide:
- Notification center
- Read/unread status
- Relevant navigation
- Notification preferences

Avoid excessive gamification notifications or engagement pressure on minors.

## 18. UI DESIGN SYSTEM

### Shared visual identity

Use:
- Pixelspace branding
- Modern sans-serif typography
- Strong visual hierarchy
- Carefully chosen bright accent colours
- Clear borders
- Accessible contrast
- Reusable cards and navigation
- Subtle neo-brutalist influences

Do not create another generic LMS dashboard.

Do not copy a commercial website's proprietary artwork or assets.

### Primary theme

- Warm backgrounds
- Colourful illustrated subject cards
- Friendly AI mascot
- Larger buttons
- Rounded shapes
- Playful, limited animations
- Visual progress indicators
- Short text blocks
- Clear navigation

### Secondary theme

- Off-white backgrounds
- Dark text
- Refined lime, blue, yellow, and lavender accents
- Clean structured layouts
- Modern typography
- Compact navigation
- Minimal decorative animation
- NotebookLM-inspired workbook workspace

### Shared component library

Build reusable:
- AppShell
- StudentSidebar
- TopNavigation
- SearchCommand
- WorkbookCard
- SubjectCard
- AssignmentCard
- LearningProgress
- AchievementBadge
- SourceList
- SourceViewer
- AIChat
- AIComposer
- CitationReference
- StudioToolCard
- ArtifactCard
- QuizPlayer
- FlashcardPlayer
- SlideViewer
- MindMapViewer
- AudioPlayer
- EmptyState
- LoadingState
- ErrorState
- ConfirmationDialog
- NotificationCenter

Use theme variants rather than duplicating all components.

## 19. RESPONSIVE DESIGN

Support:
- Desktop
- Tablet
- Mobile

Primary users may access the platform through school computers or shared tablets.

Secondary users may access it through laptops or smartphones.

Workbook three-panel layouts must adapt gracefully to smaller screens.

Maintain accessible touch targets and readable text.

Respect reduced-motion preferences.

## 20. SECURITY, PRIVACY, AND SAFEGUARDING

This application serves minors.

Implement:
- Strict school tenant isolation
- Role-based access control
- Object-level authorization
- Secure file access
- Safe upload validation
- Rate limits and usage quotas
- Session security
- Audit logging
- Data minimization
- Configurable retention
- Safe AI content handling
- Appropriate abuse reporting
- Account recovery procedures
- Secure secret management

Avoid exposing student identities, private learning records, and conversations through public routes or shared links.

Student AI conversations must not automatically be visible to teachers or administrators without an explicit, documented access policy and appropriate safeguards.

Do not expose raw AI API keys in the browser.

## 21. FOUR-SCHOOL PILOT REQUIREMENTS

The student application must work without manually hardcoding students or teachers.

Create the underlying mechanisms for:
- School provisioning
- Student invitation
- Student bulk-import compatibility
- First-login activation
- School-specific enrollment
- Class join codes
- Class membership validation
- School-level feature configuration
- Primary/secondary UI assignment
- Usage quotas
- AI generation limits
- Support and issue reporting

These mechanisms should be designed for a future school administration interface.

Do not build the complete teacher/admin interface in this phase.

Provide seed data and test accounts for development only.

Use generic fictional schools and fictional student records in demo data.

Do not hardcode the pilot schools into the application logic.

## 22. REQUIRED END-TO-END JOURNEYS

The following journeys must work:

1. New student receives an invitation → activates account → joins school → sees correct dashboard.
2. Existing student logs in → opens workbook → asks AI a question → receives grounded answer.
3. Student creates workbook → uploads PDF → waits for processing → chats with sources.
4. Student opens workbook → generates slides → previews and reopens saved deck.
5. Student generates quiz → completes attempt → sees score and explanations.
6. Student generates flashcards → studies cards → saves progress.
7. Student opens class → accesses teacher-shared workbook.
8. Student opens assignment → completes and submits → sees submission status.
9. Student visits Progress → sees real recorded learning activity.
10. Student resets password or follows authorized account recovery.
11. Student changes language and account preferences.
12. Student from School A attempts access to School B resources → access is denied.
13. Primary student receives Play interface.
14. Secondary student receives Studio interface.
15. Student signs out and protected pages become inaccessible.

## 23. IMPLEMENTATION ORDER

Work in the following sequence:

**Phase 0 — Repository Audit**
- Inspect existing implementation
- Identify reusable functionality
- Document gaps
- Define architecture and route map
- Identify migrations and compatibility risks

**Phase 1 — SaaS Foundation**
- School tenancy
- Student profiles
- Memberships
- Enrollment
- Authorization
- Authentication
- Registration
- Account recovery

**Phase 2 — Student App Shell**
- Primary and secondary themes
- Navigation
- Dashboard
- Profile
- Settings
- Notifications

**Phase 3 — Workbook Core**
- Workbook CRUD
- Source upload and processing
- Source viewing
- AI chat
- Citations
- Conversation persistence

**Phase 4 — AI Studio**
- Generated artifacts
- Notes
- Slides
- Quizzes
- Flashcards
- Mind maps
- Audio lessons
- Study guides

**Phase 5 — Learning Workflows**
- Classes
- Assignments
- Practice
- Progress
- Achievements
- Discovery

**Phase 6 — Pilot Hardening**
- Responsive QA
- Accessibility
- Tenant isolation tests
- Security checks
- Error handling
- AI usage controls
- End-to-end testing
- Deployment readiness

Implement the smallest working vertical slice in each phase before expanding.

## 24. TESTING REQUIREMENTS

Implement automated tests for:
- Authentication
- Student registration
- School membership
- Tenant isolation
- Workbook permissions
- File upload permissions
- AI generation lifecycle
- Assignment submission
- Progress persistence
- Primary/secondary theme routing

Use browser-based end-to-end tests for critical user journeys.

Test with:
- Primary student account
- Secondary student account
- Student without email
- Student with no classes
- Student with no workbooks
- Student with existing workbooks
- Student with assignments
- Student with failed AI generation
- Student from a different school

## 25. DELIVERABLES

Provide:

1. Working student application
2. Complete route structure
3. Reusable component library
4. Database migrations
5. Authentication and authorization
6. SaaS school membership infrastructure
7. Workbook AI integration
8. Generated artifact persistence
9. Responsive primary and secondary interfaces
10. Development seed data
11. Automated tests
12. Environment variable documentation
13. Setup instructions
14. Deployment instructions
15. Known limitations and unimplemented dependencies

For every phase, report:
- What was implemented
- Which routes work
- Which backend services are connected
- Which tests passed
- What remains blocked
- What needs configuration

Do not mark a feature complete when it only has a visual placeholder.

## 26. FINAL INSTRUCTION

Build Pixelspace AI Classroom as a distinctive, scalable, real-world AI education SaaS.

The product must not feel like Moodle, Google Classroom, or a generic admin template.

Primary students should experience an inviting learning adventure.

Secondary students should experience a powerful AI study workspace.

The workbook and its AI-generated learning materials are the heart of the product.

Prioritize functional correctness, maintainable architecture, student safety, and coherent user experience over unnecessary visual effects.

Start by auditing the existing repository and producing a concrete implementation plan. Then execute the phases sequentially, validating each phase before moving on.

Do not silently replace existing working functionality. Do not invent unsupported capabilities. If an external integration is unavailable, clearly identify the dependency and implement a truthful disabled or pending state.

The goal is a student application that can be deployed to the four pilot schools and subsequently expanded into a multi-school SaaS.
