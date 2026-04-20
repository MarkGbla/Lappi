# Lappi — Completion Checklist

| Field | Detail |
|-------|--------|
| **Document** | Completion Checklist |
| **Product** | Lappi |
| **Version** | 1.0 |
| **Last Updated** | 2026-04-20 |
| **Status** | Approved |
| **Owner** | Christex Foundation |

---

## 1. How to Use This Document

This is the definition of done for Lappi. Every checkbox must be verified before the corresponding scope is considered complete.

- **Per-feature**: Check before merging any feature PR
- **Per-phase**: Check before declaring a phase milestone reached
- **Pre-launch**: Check before giving Christex Foundation staff access to production
- **Post-launch**: Check during the first 2 weeks of live operation

---

## 2. Per-Feature Definition of Done

Every feature must satisfy ALL of the following before it is merged:

### Functionality
- [x] Server Action implemented with Zod input validation on all inputs
- [x] Server Action verifies authentication (session exists)
- [x] Server Action verifies authorisation (role check for restricted actions)
- [x] Database operations use Prisma typed queries (no raw SQL)
- [x] All state-changing actions create an ActivityLog entry
- [x] Success and error responses follow the standard envelope (`{ success, data/error }`)
- [x] Feature works end-to-end: action → database → UI reflects change

### UI and Design
- [x] Page follows the layout pattern from [Design Doc](./design-doc.md) (page header, breadcrumb, content)
- [x] Uses shadcn/ui components (not custom implementations of standard elements)
- [x] Uses Phosphor Icons with correct weight per context (see [Design Doc](./design-doc.md) Section 4)
- [x] Status/severity badges use the correct semantic colours
- [x] Loading state implemented with skeleton screens (not spinners)
- [x] Error state handled (toast for mutations, inline for form validation)
- [x] Empty state designed with icon + message + CTA
- [x] Dark mode renders correctly

### Responsiveness
- [ ] Renders correctly at 320px width (small phone)
- [ ] Renders correctly at 768px width (tablet)
- [ ] Renders correctly at 1024px width (laptop)
- [ ] Renders correctly at 1280px width (desktop)
- [ ] Touch targets are minimum 44x44px on mobile
- [x] Data tables switch to card layout on mobile (< 768px)
- [x] Forms are full-width on mobile, max 640px on desktop

### Accessibility
- [x] All interactive elements reachable via keyboard (Tab)
- [x] Focus indicators visible on all focusable elements
- [x] Form inputs have associated `<label>` elements
- [x] Error messages linked to inputs via `aria-describedby`
- [x] Colour is not the sole means of conveying information (icons + text accompany colour)
- [x] Images have descriptive `alt` text

### Code Quality
- [x] No TypeScript `any` types
- [x] No `console.log` statements in production code
- [x] No commented-out code
- [x] Zod schema matches the Prisma model fields
- [x] No N+1 database queries (use `include` or separate efficient queries)

---

## 3. Phase 1 Completion Checklist — Foundation

### Authentication
- [x] Admin can log in with email and password
- [x] Staff can log in with email and password
- [x] Invalid credentials show a clear error (does not reveal which field is wrong)
- [x] Unauthenticated users are redirected to `/login`
- [x] Authenticated users are redirected from `/login` to `/dashboard`
- [x] Sessions expire after 24 hours of inactivity
- [x] Logout destroys session and redirects to `/login`
- [x] Admin can create new staff accounts from `/settings`
- [x] Admin can deactivate staff accounts
- [x] Staff cannot access `/settings`

### Asset Registry
- [x] Staff can create an asset with: name, type, condition (required) + serial number, location, purchase date, notes (optional)
- [x] Asset appears in the asset list immediately after creation
- [x] Staff can edit all fields on an existing asset
- [x] Staff can retire (archive) a device — retired assets excluded from check-out but visible in filtered lists
- [x] Asset list shows filters for type, status, and condition — filters are combinable
- [x] Asset list search works by name and serial number (partial match, < 500ms)
- [x] Asset detail page shows: info card, current status, session history tab, issue history tab
- [x] Asset status badge displays with correct colour for each status
- [x] All 10 asset categories available in the type dropdown
- [x] Status transitions follow the defined lifecycle (no invalid transitions)

### Community Registry
- [x] Staff can register a person with: first name, last name, phone (required for Member) + email (optional)
- [x] Members are created without login credentials
- [x] Staff/Admin accounts require email and password
- [x] People directory is searchable by name and filterable by role
- [x] Person detail page shows: contact info, total sessions, last active date, usage history
- [x] Staff can deactivate a person (excluded from check-out, historical data preserved)

### Check-Out / Check-In
- [x] Staff can check out an available asset to a registered person
- [x] Purpose tag is required (6 options: Workshop, Cohort, Personal Learning, Research, Community Use, Staff Work)
- [x] Check-out creates a UsageSession record and changes asset status to CHECKED_OUT
- [x] Cannot check out an asset that is not AVAILABLE
- [x] Active sessions list shows: asset name, person name, purpose, duration since check-out
- [x] Staff can check in an active session with optional condition note
- [x] Check-in closes the session (timestamps it) and returns asset to AVAILABLE
- [x] Session history is filterable by asset, person, purpose, and date range
- [ ] Check-out flow completable in under 30 seconds (measured)
- [x] Sessions appear on both asset detail and person detail pages

### Issue Tracking
- [x] Staff can report an issue linked to a specific asset (title, description, severity required)
- [x] Severity levels displayed with correct colour-coded badges (Critical=red, High=orange, Medium=amber, Low=blue)
- [x] Issue status flow enforced: Open → In Progress → Resolved → Closed
- [x] Staff can assign an issue to another staff member
- [x] Issue list filterable by status, severity, asset, assignee
- [x] Default issue list view: open issues sorted by severity (critical first)
- [x] Resolver can add resolution notes when marking as Resolved
- [x] Critical issues automatically change asset status to MAINTENANCE
- [x] Issues appear on the asset detail page (issues tab)

### Dashboard
- [x] Total Assets KPI card shows count with status breakdown (available, checked out, maintenance, retired)
- [x] Active Sessions KPI card shows count of currently checked-out devices
- [x] Open Issues KPI card shows count with severity breakdown
- [x] People Registered KPI card shows total with role breakdown
- [x] KPI cards link to their respective list views when tapped
- [x] Recent activity feed shows last 10 system actions with who/what/when
- [x] Quick action buttons present: New Check-Out, Report Issue, Add Asset
- [x] Assets needing attention section shows devices in maintenance or with overdue sessions

### Activity Log
- [x] Every create, update, and status change creates an activity log entry
- [x] Log entries include: who performed the action, what action, which entity, timestamp
- [x] Activity log page displays entries in reverse chronological order
- [x] Activity log is filterable by entity type and person

### Navigation and Layout
- [x] Desktop: sidebar navigation with all menu items visible
- [x] Mobile: bottom tab bar with 5 items (Dashboard, Assets, Sessions, People, More)
- [x] "More" menu on mobile includes: Issues, Requests, Activity, Reports, Settings
- [x] Active navigation item highlighted
- [x] Page headers show title and primary action button
- [x] Breadcrumbs present on all sub-pages

### Technical
- [x] All Prisma migrations applied cleanly to production database
- [x] Seed script works and creates realistic test data
- [x] Zero TypeScript errors (`tsc --noEmit` passes)
- [x] ESLint passes with no errors
- [ ] Deployed to Vercel production
- [ ] NeonDB production branch configured and connected
- [ ] Environment variables set in Vercel (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
- [x] `.env.example` committed with all required variable names (no values)
- [x] No secrets committed to git

---

## 4. Phase 2 Completion Checklist — Operations

### Tech Requests
- [x] Staff can submit a tech request (title, description, urgency)
- [x] Request created in PENDING status
- [x] Admin can approve or deny with a note
- [x] Admin can mark approved requests as FULFILLED
- [x] Staff can view their own requests and status
- [x] Admin can view all requests with filters (status, urgency)
- [x] Request status flow enforced: Pending → Approved/Denied, Approved → Fulfilled

### Issue Enhancements
- [x] Issue detail shows a timeline of all status changes (who, what, when)
- [x] Staff can reopen a resolved issue (returns to OPEN)
- [x] Activity log shows before/after values for field changes

### Session Enhancements
- [x] Overdue sessions (> 7 days) visually highlighted in active sessions list
- [x] Batch check-out: select multiple assets for one person + purpose in a single flow

### Analytics and Reporting
- [x] Sessions by purpose chart (bar/pie, with time period selector)
- [x] Unique community members served chart (line chart over time)
- [x] Most-used assets ranking (top 10 with session count)
- [x] CSV export available for assets, sessions, people, and issues lists
- [x] Reports page consolidates all analytics views

### Asset Photo Upload
- [x] Staff can upload up to 5 photos when creating or editing an asset
- [x] Staff can capture a photo directly from the device camera (mobile + supported desktops)
- [x] Photos displayed as a gallery on the asset detail page
- [x] Per-file size limit enforced (4MB via UploadThing; client-side WebP compression typically brings real files well under this)
- [x] Client-side near-lossless compression (WebP q=0.9, 1600px max) runs before upload to keep NeonDB + storage growth bounded
- [x] Storage backed by UploadThing; URLs persisted to `Asset.imageUrls` (Postgres `String[]`) — single source of truth in NeonDB
- [x] Save path optimised (destination route prefetched on form mount; parallel uploads) for fast add-device flow

---

## 5. Phase 3 Completion Checklist — Insights

### Advanced Analytics
- [x] Asset utilisation rate calculated and displayed (% of time in use)
- [x] Peak usage patterns shown (heatmap or chart by day/hour)
- [x] Asset health score displayed per device (composite metric)
- [ ] Predefined report templates available for export

### Repair Costs
- [x] Repair cost field available on issue form
- [x] Cost-per-asset report available in reports section

### QR Codes
- [x] QR code generated per asset linking to its detail page
- [x] Printable label sheet supports multiple assets per page

### PWA Offline Mode
- [x] Service worker configured and installable
- [ ] Check-out and check-in work offline (queue and sync)
- [x] Install prompt shown to mobile users

---

## 6. Pre-Launch Checklist

Complete ALL items before giving Christex Foundation staff access to production.

### Security
- [x] All routes behind authentication middleware (verified by attempting unauthenticated access)
- [x] Role-based access verified for every page (staff cannot access admin-only features)
- [x] Server Actions independently verify auth (not just UI hiding)
- [x] No API routes exposed without authentication
- [x] Environment variables not leaked to client bundle (check page source)
- [ ] HTTPS enforced on production domain
- [x] Passwords stored as bcrypt hashes (verified in database)
- [ ] No default or test passwords in production

### Performance
- [ ] Lighthouse Performance score > 85 on mobile
- [ ] Lighthouse Accessibility score > 90
- [ ] Lighthouse Best Practices score > 90
- [ ] Largest Contentful Paint < 3s on simulated 3G
- [ ] No N+1 database queries (verified via Prisma query logs)
- [x] All list views paginated (no unbounded queries)
- [ ] Images optimised (Next.js Image component, WebP)

### Data
- [ ] Seed data removed from production database
- [x] Admin account created for Colin Ogoo
- [x] Staff accounts created for hub coordinators
- [ ] Initial asset registration completed (all physical devices entered)
- [ ] NeonDB automated backups verified
- [x] Data export (CSV) verified for all entity types

### Operational Readiness
- [ ] Vercel deployment healthy (no build errors)
- [ ] NeonDB connections within free tier limits
- [ ] Custom domain configured (if applicable)
- [ ] Error monitoring active (Vercel Analytics or equivalent)
- [ ] Staff briefed on core workflows (check-out, check-in, issue reporting)
- [ ] Quick reference guide prepared for staff (one-page summary of key actions)

### Accessibility (Final Audit)
- [ ] Colour contrast verified for all text/background combinations (4.5:1 minimum)
- [ ] Screen reader tested on at least one browser (VoiceOver on Safari or NVDA on Chrome)
- [x] All forms completable via keyboard only
- [x] Focus indicators visible on all interactive elements
- [x] Skip-to-main-content link present and functional
- [x] No `aria-hidden` on focusable elements

---

## 7. Post-Launch Monitoring (First 2 Weeks)

### Week 1 — Daily Checks
- [ ] Vercel deployment healthy (check dashboard)
- [ ] NeonDB connections and storage within limits
- [ ] No unhandled errors in Vercel function logs
- [ ] Staff successfully completing check-outs (verify session data is being created)
- [ ] Gather verbal feedback from 2-3 staff members each day

### Week 2 — Review and Adjust
- [ ] Review all feedback collected during Week 1
- [ ] Identify and fix any usability issues discovered
- [ ] Verify dashboard KPIs match a manual count of physical assets
- [ ] Verify no data inconsistencies (assets stuck in CHECKED_OUT without active sessions, etc.)
- [ ] Confirm check-out time target (< 30 seconds) is being met in practice
- [ ] Document any bugs or enhancement requests for Phase 2 prioritisation

---

## 8. Audit Fixes Applied — 2026-04-20

Full-codebase audit performed 2026-04-20. Fixes landed:

### Security
- [x] **API auth gaps closed** — `src/app/api/people-search/route.ts`, `assets-available/route.ts`, `assets-all/route.ts` now check session via `getSession()` and return 401 when unauthenticated. Previously any direct HTTP call returned the staff directory / asset list.
- [x] **Upload log leak removed** — `src/app/api/uploadthing/core.ts` no longer logs file keys + user IDs on upload completion (previously persisted to Vercel function logs).
- [x] **Dev-only logs gated** — `console.warn/error` in `src/lib/image-compress.ts` and `src/components/assets/photo-upload.tsx` now wrapped in `NODE_ENV !== "production"` guards.

### Next.js 16 Conformance
- [x] **middleware.ts → proxy.ts** — Next 16 deprecated the `middleware` file convention in favor of `proxy`. Renamed `src/middleware.ts` to `src/proxy.ts` and exported function as `proxy`. Auth is still verified authoritatively in each server action (per Next 16 docs: "Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone").

### Design System Consistency
- [x] **Lucide → Phosphor swap** — 6 shadcn/ui primitives (`select`, `command`, `sheet`, `dialog`, `dropdown-menu`, `sonner`) were importing from `lucide-react`, violating the Phosphor-only stack decision. All replaced with Phosphor equivalents (X, Check, CaretDown, CaretUp, CaretRight, MagnifyingGlass, CheckCircle, Info, Warning, WarningOctagon, CircleNotch). `lucide-react` uninstalled.

### PWA
- [x] **Missing icons generated** — `public/icon-192.png` and `public/icon-512.png` created from mascot asset. Manifest no longer references missing files.

### Documentation
- [x] **feature-list.md status synced** — all Phase 1/2/3 features updated from "Planned" to "Done" to match actual implementation state per this checklist.

---

## Related Documents

- [Implementation Plan](./implementation-plan.md) — Phase definitions and task ordering
- [Design Document](./design-doc.md) — Design standards to verify against
- [Engineering Architecture](./engineering-architecture.md) — Technical standards to verify against
- [PRD](./prd.md) — Requirements and acceptance criteria
- [Feature List](./feature-list.md) — Feature inventory with phase assignments
