# Lappi — Completion Checklist

| Field | Detail |
|-------|--------|
| **Document** | Completion Checklist |
| **Product** | Lappi |
| **Version** | 1.0 |
| **Last Updated** | 2026-04-13 |
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
- [ ] Server Action implemented with Zod input validation on all inputs
- [ ] Server Action verifies authentication (session exists)
- [ ] Server Action verifies authorisation (role check for restricted actions)
- [ ] Database operations use Prisma typed queries (no raw SQL)
- [ ] All state-changing actions create an ActivityLog entry
- [ ] Success and error responses follow the standard envelope (`{ success, data/error }`)
- [ ] Feature works end-to-end: action → database → UI reflects change

### UI and Design
- [ ] Page follows the layout pattern from [Design Doc](./design-doc.md) (page header, breadcrumb, content)
- [ ] Uses shadcn/ui components (not custom implementations of standard elements)
- [ ] Uses Phosphor Icons with correct weight per context (see [Design Doc](./design-doc.md) Section 4)
- [ ] Status/severity badges use the correct semantic colours
- [ ] Loading state implemented with skeleton screens (not spinners)
- [ ] Error state handled (toast for mutations, inline for form validation)
- [ ] Empty state designed with icon + message + CTA
- [ ] Dark mode renders correctly

### Responsiveness
- [ ] Renders correctly at 320px width (small phone)
- [ ] Renders correctly at 768px width (tablet)
- [ ] Renders correctly at 1024px width (laptop)
- [ ] Renders correctly at 1280px width (desktop)
- [ ] Touch targets are minimum 44x44px on mobile
- [ ] Data tables switch to card layout on mobile (< 768px)
- [ ] Forms are full-width on mobile, max 640px on desktop

### Accessibility
- [ ] All interactive elements reachable via keyboard (Tab)
- [ ] Focus indicators visible on all focusable elements
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Colour is not the sole means of conveying information (icons + text accompany colour)
- [ ] Images have descriptive `alt` text

### Code Quality
- [ ] No TypeScript `any` types
- [ ] No `console.log` statements in production code
- [ ] No commented-out code
- [ ] Zod schema matches the Prisma model fields
- [ ] No N+1 database queries (use `include` or separate efficient queries)

---

## 3. Phase 1 Completion Checklist — Foundation

### Authentication
- [ ] Admin can log in with email and password
- [ ] Staff can log in with email and password
- [ ] Invalid credentials show a clear error (does not reveal which field is wrong)
- [ ] Unauthenticated users are redirected to `/login`
- [ ] Authenticated users are redirected from `/login` to `/dashboard`
- [ ] Sessions expire after 24 hours of inactivity
- [ ] Logout destroys session and redirects to `/login`
- [ ] Admin can create new staff accounts from `/settings`
- [ ] Admin can deactivate staff accounts
- [ ] Staff cannot access `/settings`

### Asset Registry
- [ ] Staff can create an asset with: name, type, condition (required) + serial number, location, purchase date, notes (optional)
- [ ] Asset appears in the asset list immediately after creation
- [ ] Staff can edit all fields on an existing asset
- [ ] Staff can retire (archive) a device — retired assets excluded from check-out but visible in filtered lists
- [ ] Asset list shows filters for type, status, and condition — filters are combinable
- [ ] Asset list search works by name and serial number (partial match, < 500ms)
- [ ] Asset detail page shows: info card, current status, session history tab, issue history tab
- [ ] Asset status badge displays with correct colour for each status
- [ ] All 10 asset categories available in the type dropdown
- [ ] Status transitions follow the defined lifecycle (no invalid transitions)

### Community Registry
- [ ] Staff can register a person with: first name, last name, phone (required for Member) + email (optional)
- [ ] Members are created without login credentials
- [ ] Staff/Admin accounts require email and password
- [ ] People directory is searchable by name and filterable by role
- [ ] Person detail page shows: contact info, total sessions, last active date, usage history
- [ ] Staff can deactivate a person (excluded from check-out, historical data preserved)

### Check-Out / Check-In
- [ ] Staff can check out an available asset to a registered person
- [ ] Purpose tag is required (6 options: Workshop, Cohort, Personal Learning, Research, Community Use, Staff Work)
- [ ] Check-out creates a UsageSession record and changes asset status to CHECKED_OUT
- [ ] Cannot check out an asset that is not AVAILABLE
- [ ] Active sessions list shows: asset name, person name, purpose, duration since check-out
- [ ] Staff can check in an active session with optional condition note
- [ ] Check-in closes the session (timestamps it) and returns asset to AVAILABLE
- [ ] Session history is filterable by asset, person, purpose, and date range
- [ ] Check-out flow completable in under 30 seconds (measured)
- [ ] Sessions appear on both asset detail and person detail pages

### Issue Tracking
- [ ] Staff can report an issue linked to a specific asset (title, description, severity required)
- [ ] Severity levels displayed with correct colour-coded badges (Critical=red, High=orange, Medium=amber, Low=blue)
- [ ] Issue status flow enforced: Open → In Progress → Resolved → Closed
- [ ] Staff can assign an issue to another staff member
- [ ] Issue list filterable by status, severity, asset, assignee
- [ ] Default issue list view: open issues sorted by severity (critical first)
- [ ] Resolver can add resolution notes when marking as Resolved
- [ ] Critical issues automatically change asset status to MAINTENANCE
- [ ] Issues appear on the asset detail page (issues tab)

### Dashboard
- [ ] Total Assets KPI card shows count with status breakdown (available, checked out, maintenance, retired)
- [ ] Active Sessions KPI card shows count of currently checked-out devices
- [ ] Open Issues KPI card shows count with severity breakdown
- [ ] People Registered KPI card shows total with role breakdown
- [ ] KPI cards link to their respective list views when tapped
- [ ] Recent activity feed shows last 10 system actions with who/what/when
- [ ] Quick action buttons present: New Check-Out, Report Issue, Add Asset
- [ ] Assets needing attention section shows devices in maintenance or with overdue sessions

### Activity Log
- [ ] Every create, update, and status change creates an activity log entry
- [ ] Log entries include: who performed the action, what action, which entity, timestamp
- [ ] Activity log page displays entries in reverse chronological order
- [ ] Activity log is filterable by entity type and person

### Navigation and Layout
- [ ] Desktop: sidebar navigation with all menu items visible
- [ ] Mobile: bottom tab bar with 5 items (Dashboard, Assets, Sessions, People, More)
- [ ] "More" menu on mobile includes: Issues, Requests, Activity, Reports, Settings
- [ ] Active navigation item highlighted
- [ ] Page headers show title and primary action button
- [ ] Breadcrumbs present on all sub-pages

### Technical
- [ ] All Prisma migrations applied cleanly to production database
- [ ] Seed script works and creates realistic test data
- [ ] Zero TypeScript errors (`tsc --noEmit` passes)
- [ ] ESLint passes with no errors
- [ ] Deployed to Vercel production
- [ ] NeonDB production branch configured and connected
- [ ] Environment variables set in Vercel (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
- [ ] `.env.example` committed with all required variable names (no values)
- [ ] No secrets committed to git

---

## 4. Phase 2 Completion Checklist — Operations

### Tech Requests
- [ ] Staff can submit a tech request (title, description, urgency)
- [ ] Request created in PENDING status
- [ ] Admin can approve or deny with a note
- [ ] Admin can mark approved requests as FULFILLED
- [ ] Staff can view their own requests and status
- [ ] Admin can view all requests with filters (status, urgency)
- [ ] Request status flow enforced: Pending → Approved/Denied, Approved → Fulfilled

### Issue Enhancements
- [ ] Issue detail shows a timeline of all status changes (who, what, when)
- [ ] Staff can reopen a resolved issue (returns to OPEN)
- [ ] Activity log shows before/after values for field changes

### Session Enhancements
- [ ] Overdue sessions (> 7 days) visually highlighted in active sessions list
- [ ] Batch check-out: select multiple assets for one person + purpose in a single flow

### Analytics and Reporting
- [ ] Sessions by purpose chart (bar/pie, with time period selector)
- [ ] Unique community members served chart (line chart over time)
- [ ] Most-used assets ranking (top 10 with session count)
- [ ] CSV export available for assets, sessions, people, and issues lists
- [ ] Reports page consolidates all analytics views

### Asset Photo Upload
- [ ] Staff can upload a photo when creating or editing an asset
- [ ] Photo displayed on asset detail page
- [ ] File size limit enforced (max 5MB)

---

## 5. Phase 3 Completion Checklist — Insights

### Advanced Analytics
- [ ] Asset utilisation rate calculated and displayed (% of time in use)
- [ ] Peak usage patterns shown (heatmap or chart by day/hour)
- [ ] Asset health score displayed per device (composite metric)
- [ ] Predefined report templates available for export

### Repair Costs
- [ ] Repair cost field available on issue form
- [ ] Cost-per-asset report available in reports section

### QR Codes
- [ ] QR code generated per asset linking to its detail page
- [ ] Printable label sheet supports multiple assets per page

### PWA Offline Mode
- [ ] Service worker configured and installable
- [ ] Check-out and check-in work offline (queue and sync)
- [ ] Install prompt shown to mobile users

---

## 6. Pre-Launch Checklist

Complete ALL items before giving Christex Foundation staff access to production.

### Security
- [ ] All routes behind authentication middleware (verified by attempting unauthenticated access)
- [ ] Role-based access verified for every page (staff cannot access admin-only features)
- [ ] Server Actions independently verify auth (not just UI hiding)
- [ ] No API routes exposed without authentication
- [ ] Environment variables not leaked to client bundle (check page source)
- [ ] HTTPS enforced on production domain
- [ ] Passwords stored as bcrypt hashes (verified in database)
- [ ] No default or test passwords in production

### Performance
- [ ] Lighthouse Performance score > 85 on mobile
- [ ] Lighthouse Accessibility score > 90
- [ ] Lighthouse Best Practices score > 90
- [ ] Largest Contentful Paint < 3s on simulated 3G
- [ ] No N+1 database queries (verified via Prisma query logs)
- [ ] All list views paginated (no unbounded queries)
- [ ] Images optimised (Next.js Image component, WebP)

### Data
- [ ] Seed data removed from production database
- [ ] Admin account created for Colin Ogoo
- [ ] Staff accounts created for hub coordinators
- [ ] Initial asset registration completed (all physical devices entered)
- [ ] NeonDB automated backups verified
- [ ] Data export (CSV) verified for all entity types

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
- [ ] All forms completable via keyboard only
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip-to-main-content link present and functional
- [ ] No `aria-hidden` on focusable elements

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

## Related Documents

- [Implementation Plan](./implementation-plan.md) — Phase definitions and task ordering
- [Design Document](./design-doc.md) — Design standards to verify against
- [Engineering Architecture](./engineering-architecture.md) — Technical standards to verify against
- [PRD](./prd.md) — Requirements and acceptance criteria
- [Feature List](./feature-list.md) — Feature inventory with phase assignments
