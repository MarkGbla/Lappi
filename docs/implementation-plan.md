# Lappi — Implementation Plan

| Field | Detail |
|-------|--------|
| **Document** | Implementation Plan |
| **Product** | Lappi |
| **Version** | 1.0 |
| **Last Updated** | 2026-04-13 |
| **Status** | Approved |
| **Owner** | Christex Foundation |

---

## 1. Implementation Philosophy

- **Vertical slices**: Each task delivers a working, testable feature end-to-end (schema → action → UI). No "build all components, then wire them up."
- **Phase gates**: Each phase ends with a verifiable milestone before the next begins.
- **One thing at a time**: Each block focuses on a single module. Complete it before starting the next.
- **Ship early, iterate**: Phase 1 is usable on its own. Phases 2 and 3 add capability, not fix gaps.

---

## 2. Phase 0 — Project Scaffolding

**Goal**: A deployed skeleton app with auth, database, and UI framework ready.

| Task | Description | Deliverable |
|------|-------------|-------------|
| 0.1 | Initialise Next.js 14+ project with App Router, TypeScript, Tailwind CSS | `package.json`, `tsconfig.json`, `tailwind.config.ts` |
| 0.2 | Install and configure shadcn/ui (CLI init, add base components: Button, Card, Input, Table, Badge, Dialog, Select, Form, Tabs, Sheet, Dropdown Menu, Toast, Skeleton, Separator) | `components/ui/` directory with all base components |
| 0.3 | Install and configure Phosphor Icons (`@phosphor-icons/react`). Set up IconContext in root layout. | Global icon defaults in `layout.tsx` |
| 0.4 | Create NeonDB project. Configure Prisma with connection strings. | `prisma/schema.prisma`, `.env.local`, `.env.example` |
| 0.5 | Write full Prisma schema (all 6 models + enums per [Engineering Architecture](./engineering-architecture.md)) | Complete `prisma/schema.prisma` |
| 0.6 | Run initial migration (`prisma migrate dev`) | `prisma/migrations/` with initial migration |
| 0.7 | Write seed script with realistic sample data (10 assets, 15 people, 20 sessions, 5 issues) | `prisma/seed.ts` |
| 0.8 | Configure NextAuth.js v5 with Credentials provider. Implement JWT callbacks for role. Create auth helpers (`getSession`, `requireAuth`, `requireRole`). | `lib/auth.ts`, `lib/auth-helpers.ts` |
| 0.9 | Create middleware for route protection (protect `/(dashboard)/*`, allow `/login`) | `middleware.ts` |
| 0.10 | Set up project directory structure per [Engineering Architecture](./engineering-architecture.md) Section 6 | All directories created with placeholder files |
| 0.11 | Configure Zod validation schemas for all entities | `lib/validations/*.ts` |
| 0.12 | Create `lib/db.ts` (Prisma client singleton) and `lib/activity.ts` (activity logging helper) | Utility files ready |
| 0.13 | Deploy to Vercel. Confirm NeonDB connectivity. Verify login works. | Live URL with working login page |

**Milestone**: Skeleton app deploys to Vercel. Auth works. Database has seed data. Empty dashboard shell loads after login.

---

## 3. Phase 1 — Foundation

**Goal**: A working system that replaces manual tracking on day one.

### Block 1.1 — Layout and Navigation

| Task | Description | Features |
|------|-------------|----------|
| 1.1.1 | Build dashboard layout shell: sidebar (desktop), bottom tab bar (mobile), page header component | — |
| 1.1.2 | Implement sidebar navigation with Phosphor Icons (Bold weight, Fill for active) | — |
| 1.1.3 | Implement mobile bottom tab bar (Dashboard, Assets, Sessions, People, More) | — |
| 1.1.4 | Build page header component (title, breadcrumb, primary action button) | — |
| 1.1.5 | Build user menu (profile info, dark mode toggle, logout) | — |
| 1.1.6 | Build dashboard page with placeholder KPI cards | F-DASH-01 |

**Depends on**: Phase 0 complete.

### Block 1.2 — Asset Registry

| Task | Description | Features |
|------|-------------|----------|
| 1.2.1 | Implement `createAsset` Server Action with Zod validation and activity logging | F-ASSET-01 |
| 1.2.2 | Implement `updateAsset` Server Action | F-ASSET-02 |
| 1.2.3 | Implement `retireAsset` Server Action | F-ASSET-03 |
| 1.2.4 | Build asset list page with filters (type, status, condition) and search | F-ASSET-04, F-ASSET-07 |
| 1.2.5 | Build asset detail page (info card, status badge, placeholder for sessions/issues tabs) | F-ASSET-05 |
| 1.2.6 | Build create asset form (name, type, condition, serial, location, purchase date, notes) | F-ASSET-01 |
| 1.2.7 | Build edit asset form (reuse form component) | F-ASSET-02 |
| 1.2.8 | Build status badge component with semantic colours per [Design Doc](./design-doc.md) | F-ASSET-06 |
| 1.2.9 | Build data table component (sortable, responsive — table on desktop, cards on mobile) | Shared |
| 1.2.10 | Build empty state component | Shared |

**Depends on**: Block 1.1 complete (layout shell exists).

### Block 1.3 — Community Registry (People)

| Task | Description | Features |
|------|-------------|----------|
| 1.3.1 | Implement `createPerson` Server Action (handle Member vs Staff/Admin creation) | F-PEOPLE-01 |
| 1.3.2 | Implement `updatePerson` Server Action | F-PEOPLE-02 |
| 1.3.3 | Implement `deactivatePerson` Server Action | F-PEOPLE-05 |
| 1.3.4 | Build people list page with role filter and search | F-PEOPLE-04 |
| 1.3.5 | Build person detail page (info, usage metrics, session history tab) | F-PEOPLE-03, F-PEOPLE-06 |
| 1.3.6 | Build create/edit person form | F-PEOPLE-01, F-PEOPLE-02 |
| 1.3.7 | Build person search component (reusable in check-out flow) | Shared |

**Depends on**: Block 1.2 complete (shared components like data table, empty state exist).

### Block 1.4 — Check-Out / Check-In

This is the most critical block. The core daily workflow.

| Task | Description | Features |
|------|-------------|----------|
| 1.4.1 | Implement `checkOutAsset` Server Action (atomic: create session + update asset status + log activity) | F-SESSION-01, F-SESSION-05 |
| 1.4.2 | Implement `checkInAsset` Server Action (atomic: close session + update asset status + log activity) | F-SESSION-02 |
| 1.4.3 | Build check-out page: person search → asset search (AVAILABLE only) → purpose select → notes → confirm | F-SESSION-01 |
| 1.4.4 | Build active sessions list page (person name, asset name, purpose, duration, check-in button) | F-SESSION-03 |
| 1.4.5 | Build check-in dialog (condition on return, notes, confirm) | F-SESSION-02 |
| 1.4.6 | Build session history page with filters (asset, person, purpose, date range) | F-SESSION-04 |
| 1.4.7 | Build session detail page | F-SESSION-04 |
| 1.4.8 | Wire sessions tab on asset detail page (show sessions for this asset) | F-ASSET-05 |
| 1.4.9 | Wire sessions tab on person detail page (show sessions for this person) | F-PEOPLE-03 |

**Depends on**: Block 1.3 complete (person search component, people exist in system).

### Block 1.5 — Issue Tracking (Basic)

| Task | Description | Features |
|------|-------------|----------|
| 1.5.1 | Implement `createIssue` Server Action (with auto-status change on Critical severity) | F-ISSUE-01, F-ISSUE-07 |
| 1.5.2 | Implement `assignIssue` Server Action | F-ISSUE-04 |
| 1.5.3 | Implement `updateIssueStatus` Server Action (enforce valid transitions, log each change) | F-ISSUE-03 |
| 1.5.4 | Build issue list page with filters (status, severity, asset, assignee) | F-ISSUE-05 |
| 1.5.5 | Build report issue form (asset selector, title, description, severity) | F-ISSUE-01, F-ISSUE-02 |
| 1.5.6 | Build issue detail page (info, status controls, assignment, resolution notes) | F-ISSUE-06 |
| 1.5.7 | Build severity badge component | F-ISSUE-02 |
| 1.5.8 | Wire issues tab on asset detail page | F-ASSET-05 |

**Depends on**: Block 1.4 complete (assets and people in system, shared components).

### Block 1.6 — Dashboard (Real Data)

| Task | Description | Features |
|------|-------------|----------|
| 1.6.1 | Build stat card component (icon, label, value, breakdown) | Shared |
| 1.6.2 | Wire Total Assets KPI (aggregate query by status) | F-DASH-01 |
| 1.6.3 | Wire Active Sessions KPI (count where checkedInAt IS NULL) | F-DASH-01 |
| 1.6.4 | Wire Open Issues KPI (count by severity where status != CLOSED) | F-DASH-01 |
| 1.6.5 | Wire People Registered KPI (count by role) | F-DASH-01 |
| 1.6.6 | Build recent activity feed (last 10 log entries) | F-DASH-02 |
| 1.6.7 | Build quick action buttons (New Check-Out, Report Issue, Add Asset) | F-DASH-03 |
| 1.6.8 | Build "Assets Needing Attention" section (maintenance, overdue) | F-DASH-04 |

**Depends on**: Blocks 1.2-1.5 complete (real data exists to display).

### Block 1.7 — Activity Log and Settings

| Task | Description | Features |
|------|-------------|----------|
| 1.7.1 | Build activity log page with filters (entity type, person, date range) | F-LOG-01, F-LOG-02 |
| 1.7.2 | Verify all Server Actions create activity log entries | F-LOG-01 |
| 1.7.3 | Build settings page: staff account management (create, edit, deactivate) | F-AUTH-04 |
| 1.7.4 | Build login page with proper styling and branding | F-AUTH-01 |

**Depends on**: Block 1.6 complete.

### Phase 1 Milestone

> A staff member can log in, register devices, check them in and out to community members, report issues, assign them, and see everything on a real-time dashboard. All actions are logged. The system is deployed and accessible from any device.

---

## 4. Phase 2 — Operations

**Goal**: Complete operational workflows and initial data insights.

### Block 2.1 — Tech Requests

| Task | Description | Features |
|------|-------------|----------|
| 2.1.1 | Implement `createTechRequest`, `reviewTechRequest`, `fulfillTechRequest` Server Actions | F-REQUEST-01 to F-REQUEST-03 |
| 2.1.2 | Build request list page (my requests for staff, all requests for admin) | F-REQUEST-04, F-REQUEST-05 |
| 2.1.3 | Build submit request form | F-REQUEST-01 |
| 2.1.4 | Build request detail page with review dialog (approve/deny with note) | F-REQUEST-02, F-REQUEST-03 |

### Block 2.2 — Issue Tracking Enhancements

| Task | Description | Features |
|------|-------------|----------|
| 2.2.1 | Build issue timeline component (status changes with who/when) | F-ISSUE-08 |
| 2.2.2 | Implement issue reopen flow | F-ISSUE-10 |
| 2.2.3 | Add field change diffs to activity log entries | F-LOG-03 |

### Block 2.3 — Session Enhancements

| Task | Description | Features |
|------|-------------|----------|
| 2.3.1 | Implement overdue session detection and visual indicators | F-SESSION-06 |
| 2.3.2 | Build batch check-out flow (select multiple assets for one person) | F-SESSION-07 |

### Block 2.4 — Analytics and Reporting

| Task | Description | Features |
|------|-------------|----------|
| 2.4.1 | Install charting library (Recharts) with dynamic import for code splitting | — |
| 2.4.2 | Build sessions by purpose chart (bar chart, time period selector) | F-ANALYTICS-01 |
| 2.4.3 | Build unique members served chart (line chart over time) | F-ANALYTICS-03 |
| 2.4.4 | Build most-used assets ranking (top 10 list) | F-ANALYTICS-04 |
| 2.4.5 | Build CSV export for all list views (assets, sessions, people, issues) | F-ANALYTICS-06 |
| 2.4.6 | Build reports page consolidating all analytics views | F-ANALYTICS-01 to F-ANALYTICS-06 |

### Block 2.5 — Asset Photo Upload

| Task | Description | Features |
|------|-------------|----------|
| 2.5.1 | Configure Vercel Blob for image storage | — |
| 2.5.2 | Add photo upload to asset create/edit forms | F-ASSET-08 |
| 2.5.3 | Display asset photo on detail page | F-ASSET-08 |

### Phase 2 Milestone

> Full operational workflow is digitalised. Staff manage issues end-to-end with timelines, request equipment through a formal process, and export data for reporting. Basic analytics charts show usage patterns.

---

## 5. Phase 3 — Insights

**Goal**: Turn data into intelligence for leadership and donors.

### Block 3.1 — Advanced Analytics

| Task | Description | Features |
|------|-------------|----------|
| 3.1.1 | Build asset utilisation rate calculation and display | F-ANALYTICS-02 |
| 3.1.2 | Build peak usage patterns heatmap | F-ANALYTICS-05 |
| 3.1.3 | Build asset health score (composite of issue frequency, age, condition) | — |
| 3.1.4 | Build predefined report templates for donor meetings | — |

### Block 3.2 — Repair Cost Tracking

| Task | Description | Features |
|------|-------------|----------|
| 3.2.1 | Add repair cost field to issue form and detail | F-ISSUE-09 |
| 3.2.2 | Build cost-per-asset report | F-ISSUE-09 |

### Block 3.3 — QR Code Labels

| Task | Description | Features |
|------|-------------|----------|
| 3.3.1 | Generate QR codes per asset (link to detail page URL) | F-ASSET-09 |
| 3.3.2 | Build printable QR label sheet (multiple assets per page) | F-ASSET-09 |

### Block 3.4 — PWA Offline Mode

| Task | Description | Features |
|------|-------------|----------|
| 3.4.1 | Configure service worker and PWA manifest | — |
| 3.4.2 | Implement offline check-out/in queue (stores locally, syncs when online) | — |
| 3.4.3 | Add install prompt for mobile users | — |

### Phase 3 Milestone

> Lappi generates actionable intelligence. Leadership can walk into a UNDP meeting with auto-generated usage reports. QR codes on every device. Works offline for check-out/in on the hub floor.

---

## 6. Testing Strategy

| Level | Scope | Tool | When |
|-------|-------|------|------|
| **Type checking** | All TypeScript code | `tsc --noEmit` | Every commit (CI) |
| **Linting** | Code style and common errors | ESLint | Every commit (CI) |
| **Schema validation** | Zod schemas match Prisma types | Unit tests | Per-module |
| **Server Action tests** | Input validation, auth checks, database operations | Vitest + test database | Per-action |
| **Component tests** | Key interactive components (forms, dialogs) | Vitest + Testing Library | Per-component |
| **E2E tests** | Critical user journeys | Playwright | Per-phase milestone |

### Critical E2E Test Scenarios (Phase 1)

1. **Login flow**: Navigate to app → redirect to login → enter credentials → arrive at dashboard
2. **Asset CRUD**: Create asset → appears in list → edit → verify changes → retire → verify excluded from check-out
3. **Check-out → Check-in**: Create person → create asset → check out to person → verify active session → check in → verify asset available
4. **Issue pipeline**: Report issue on asset → assign to staff → resolve → close
5. **Dashboard accuracy**: Verify KPI counts match actual data after performing operations

---

## 7. Deployment Strategy

### Development Workflow
1. Local development with `npm run dev` against NeonDB development branch
2. Feature branches for each block (e.g., `feature/block-1.2-asset-registry`)
3. Vercel Preview Deployments on every push (automatic)
4. Merge to `main` for production deployment

### Database Migrations
1. Schema changes made in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name` locally
3. Migration files committed to git
4. Production: `npx prisma migrate deploy` runs automatically via Vercel build command

### Environment Configuration

| Environment | Database | URL | Purpose |
|-------------|----------|-----|---------|
| Local dev | NeonDB dev branch | localhost:3000 | Development |
| Preview | NeonDB dev branch | *.vercel.app | PR review |
| Production | NeonDB main branch | lappi.vercel.app (or custom domain) | Live system |

### Build Command (Vercel)
```bash
npx prisma generate && npx prisma migrate deploy && next build
```

---

## Related Documents

- [Feature List](./feature-list.md) — Feature IDs referenced in task tables
- [Engineering Architecture](./engineering-architecture.md) — Technical specs for each task
- [Design Document](./design-doc.md) — Visual patterns to implement
- [User Flows](./user-flow.md) — Workflows that define acceptance criteria
- [Completion Checklist](./completion-checklist.md) — Phase gate verification
- [PRD](./prd.md) — Requirements traceability
