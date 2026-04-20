# Lappi — Product Requirements Document

| Field | Detail |
|-------|--------|
| **Document** | Product Requirements Document (PRD) |
| **Product** | Lappi |
| **Version** | 1.0 |
| **Last Updated** | 2026-04-13 |
| **Status** | Approved |
| **Owner** | Christex Foundation |

---

## 1. Product Overview

**Lappi** is a web-based asset and usage tracking system for Christex Foundation's Innovation Hub in Freetown, Sierra Leone. It provides a single interface for staff to manage electronic devices, track community usage, handle hardware repairs, and generate impact reports.

**Tagline**: Know your tech. Track your impact.

For executive context, see the [Concept Note](./concept-note.md).

---

## 2. Objectives and Key Results

| Objective | Key Result | Target | Phase |
|-----------|-----------|--------|-------|
| Eliminate asset blind spots | 100% of electronic devices have a digital record in Lappi | 100% within 2 weeks of launch | 1 |
| Digitise device lending | 90%+ of device check-outs recorded in Lappi | 90% within 1 month | 1 |
| Structured repair tracking | All hardware issues logged with status tracking | Zero WhatsApp-only reports within 1 month | 1 |
| Enable impact reporting | Generate quarterly usage reports from Lappi data | First report within 3 months | 2 |
| Staff operational efficiency | Average check-out time under 30 seconds | 30s target ongoing | 1 |
| Data-driven asset decisions | Utilisation rates and failure data available per device | Dashboard live by Phase 3 | 3 |

---

## 3. User Personas

### 3.1 Colin — Founder and Admin

| Attribute | Detail |
|-----------|--------|
| **Role** | Admin |
| **Background** | Founded Christex Foundation in 2022. Manages partnerships (UNDP), fundraising, and strategic direction. Not on the floor daily but needs real-time visibility. |
| **Goals** | See overall asset health at a glance. Pull usage data for donor reports. Approve or deny staff equipment requests. Know immediately if critical devices are failing. |
| **Pain points** | Has no idea how many devices are working right now. Quarterly reports to UNDP are based on rough estimates. Equipment requests come via chat and get lost. |
| **Uses Lappi** | Daily — dashboard check, weekly — report review, ad hoc — request approvals |
| **Device** | Laptop and smartphone |

### 3.2 Aminata — Hub Coordinator (Staff)

| Attribute | Detail |
|-----------|--------|
| **Role** | Staff |
| **Background** | Runs daily operations at the Innovation Hub. Sets up classrooms for cohorts, manages walk-in users, coordinates with technicians. |
| **Goals** | Check out 15 laptops quickly before a cohort session starts. Report broken devices immediately. See which devices are available without walking to storage. |
| **Pain points** | Spends 10 minutes before each session hunting for working laptops. Reports issues via WhatsApp but never hears back. Doesn't know which devices were already lent out. |
| **Uses Lappi** | Multiple times daily — check-out, check-in, issue reports |
| **Device** | Smartphone (primary), occasionally tablet |

### 3.3 Ibrahim — Cohort 7 Student (Community Member)

| Attribute | Detail |
|-----------|--------|
| **Role** | Community Member (passive) |
| **Background** | Enrolled in a 12-week Solana development cohort. Uses a foundation laptop during sessions and sometimes borrows one for evening study. |
| **Goals** | Get a working laptop quickly. Have his usage tracked so the foundation knows he's active. Report problems if a device malfunctions. |
| **Interaction with Lappi** | None directly. Aminata checks out a laptop in his name. His usage history builds in the system over time. |
| **Device** | N/A (does not access Lappi) |

---

## 4. Functional Requirements

Requirements use the following conventions:
- **ID format**: `FR-{MODULE}-{NUMBER}` (e.g., `FR-ASSET-001`)
- **Priority**: Must (M), Should (S), Could (C) — MoSCoW method
- **Phase**: 1 (Foundation), 2 (Operations), 3 (Insights)

### 4.1 Asset Registry

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-ASSET-001 | Staff can register a new electronic device with name, type, serial number, condition, and location | M | 1 | Asset appears in list immediately after creation. All fields validated. |
| FR-ASSET-002 | Staff can edit any field on an existing asset | M | 1 | Changes persist after page reload. Activity log records the change. |
| FR-ASSET-003 | Staff can archive (retire) a device with a reason | M | 1 | Retired assets are excluded from check-out selection. Still visible in filtered lists. |
| FR-ASSET-004 | System displays a list of all assets with filters for type, status, and condition | M | 1 | Filters are combinable. List updates instantly. Empty state shown when no results. |
| FR-ASSET-005 | Each asset has a detail page showing current status, specifications, full session history, and issue history | M | 1 | All related sessions and issues displayed in reverse chronological order. |
| FR-ASSET-006 | System enforces exactly one status per asset at all times: AVAILABLE, CHECKED_OUT, MAINTENANCE, NEEDS_ATTENTION, RETIRED | M | 1 | Status transitions follow defined lifecycle. Invalid transitions are rejected. |
| FR-ASSET-007 | Staff can search assets by name or serial number | M | 1 | Search returns results within 500ms. Partial matches supported. |
| FR-ASSET-008 | System supports 10 asset categories: Laptop, Desktop, Tablet, Projector, Router, Phone, Camera, Printer, Networking, Other | M | 1 | Category is required on creation. Filterable in list view. |
| FR-ASSET-009 | Staff can upload a photo of the device | S | 2 | Image displayed on asset detail page. Max file size enforced. |
| FR-ASSET-010 | System generates a printable QR code label for each asset linking to its detail page | C | 3 | QR resolves to the correct asset detail URL when scanned. |

### 4.2 Check-Out / Check-In

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-SESSION-001 | Staff can check out an available asset to a registered person with a required purpose tag | M | 1 | Session created. Asset status changes to CHECKED_OUT. Activity logged. |
| FR-SESSION-002 | Purpose tag is required and selected from: Workshop, Cohort, Personal Learning, Research, Community Use, Staff Work | M | 1 | Dropdown enforces selection. No free-text override. |
| FR-SESSION-003 | Staff can check in a currently checked-out asset with an optional condition note | M | 1 | Session closed with timestamp. Asset status returns to AVAILABLE. Condition note saved. |
| FR-SESSION-004 | System displays all currently active (unclosed) sessions | M | 1 | Active sessions list shows asset name, person name, purpose, duration. Sorted by check-out time. |
| FR-SESSION-005 | System displays session history filterable by asset, person, purpose, and date range | M | 1 | All filters combinable. Results paginated. |
| FR-SESSION-006 | Asset status automatically transitions to CHECKED_OUT on check-out and AVAILABLE on check-in | M | 1 | No manual status change needed. Transitions are atomic with session creation/closure. |
| FR-SESSION-007 | Staff can add optional notes to a check-out session | S | 1 | Notes saved and visible on session detail. |
| FR-SESSION-008 | System prevents checking out an asset that is not in AVAILABLE status | M | 1 | Check-out action disabled or hidden for non-available assets. Error message if attempted via API. |
| FR-SESSION-009 | System highlights overdue sessions (checked out longer than 7 days) | S | 2 | Visual indicator on active sessions list. Configurable threshold. |
| FR-SESSION-010 | Staff can perform batch check-out of multiple assets to one person | C | 2 | Single form selects person + purpose + multiple assets. One session per asset created. |

### 4.3 Community Registry (People)

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-PEOPLE-001 | Staff can register a new person with first name, last name, phone number, and optional email | M | 1 | Person appears in directory immediately. Phone number format validated. |
| FR-PEOPLE-002 | Staff can edit a person's details | M | 1 | Changes persist. Activity logged. |
| FR-PEOPLE-003 | Each person has a detail page showing their role, contact info, total sessions, and full usage history | M | 1 | Sessions displayed in reverse chronological order. Total count matches. |
| FR-PEOPLE-004 | System displays a people directory searchable by name and filterable by role (Admin, Staff, Member) | M | 1 | Search and filters combinable. Results paginated. |
| FR-PEOPLE-005 | Members are created without login credentials. Only Admin and Staff have accounts. | M | 1 | Member creation form does not include email/password. Admin/Staff creation requires email + password. |
| FR-PEOPLE-006 | Staff can deactivate a person (soft delete) | S | 1 | Deactivated people are excluded from check-out selection but their historical data remains. |
| FR-PEOPLE-007 | System tracks total session count and last active date per person | M | 1 | Metrics visible on person detail page. Updated automatically when sessions close. |

### 4.4 Issue and Repair Tracking

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-ISSUE-001 | Staff can report an issue against a specific asset with title, description, and severity | M | 1 | Issue created and linked to asset. Appears on asset detail page and issue list. |
| FR-ISSUE-002 | Severity levels: Low, Medium, High, Critical | M | 1 | Severity required on creation. Displayed with colour-coded badge. |
| FR-ISSUE-003 | Issue status flow: Open → In Progress → Resolved → Closed | M | 1 | Only valid transitions allowed. Timestamps recorded for each transition. |
| FR-ISSUE-004 | Admin or staff can assign an issue to a staff member | M | 1 | Assignee receives the issue in their view. Assignment logged. |
| FR-ISSUE-005 | System displays issue list filterable by status, severity, asset, and assignee | M | 1 | All filters combinable. Default view shows open issues sorted by severity (critical first). |
| FR-ISSUE-006 | Resolver can add resolution notes when closing an issue | M | 1 | Resolution notes saved and visible on issue detail. |
| FR-ISSUE-007 | When a Critical issue is reported, asset status automatically changes to MAINTENANCE | S | 1 | Status transition is automatic. Reversible when issue is resolved. |
| FR-ISSUE-008 | Issue detail page shows a timeline of all status changes | S | 2 | Timeline entries include who, what, and when. |
| FR-ISSUE-009 | Staff can log estimated repair cost on an issue | C | 3 | Decimal field with currency. Visible in reports. |
| FR-ISSUE-010 | Staff can reopen a resolved issue if the problem recurs | S | 2 | Status returns to Open. Reopen logged in timeline. |

### 4.5 Tech Requests

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-REQUEST-001 | Staff can submit a tech request with title, description, and urgency (Low, Medium, High) | M | 2 | Request created in Pending status. Visible to admin. |
| FR-REQUEST-002 | Admin can approve or deny a request with a note | M | 2 | Status changes to Approved or Denied. Note saved. Requester can see updated status. |
| FR-REQUEST-003 | Admin can mark an approved request as Fulfilled | M | 2 | Status changes to Fulfilled. Timestamp recorded. |
| FR-REQUEST-004 | Staff can view their own submitted requests and status | M | 2 | Filtered to current user by default. |
| FR-REQUEST-005 | Admin can view all requests with filters by status and urgency | M | 2 | All filters combinable. Sortable by date and urgency. |
| FR-REQUEST-006 | Request status flow: Pending → Approved/Denied, Approved → Fulfilled | M | 2 | Only valid transitions allowed. |

### 4.6 Usage Analytics

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-ANALYTICS-001 | Dashboard shows total sessions grouped by purpose over a selectable time period | S | 2 | Bar or pie chart. Time period selector (week, month, quarter, year). |
| FR-ANALYTICS-002 | Dashboard shows asset utilisation rate (% of time checked out vs. available) | S | 3 | Per-asset metric. Sortable list of most/least utilised. |
| FR-ANALYTICS-003 | Dashboard shows unique community members served over time | M | 2 | Line chart. Filterable by purpose. |
| FR-ANALYTICS-004 | Dashboard shows most-used assets ranked by session count | S | 2 | Top 10 list. Clickable to asset detail. |
| FR-ANALYTICS-005 | Dashboard shows peak usage hours/days | C | 3 | Heatmap or bar chart showing check-out frequency by hour/day. |
| FR-ANALYTICS-006 | All analytics views exportable to CSV | M | 2 | Export button on each view. CSV includes all visible data. |

### 4.7 Dashboard

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-DASH-001 | Dashboard displays 4 KPI cards: Total Assets (by status), Active Sessions, Open Issues (by severity), People Registered | M | 1 | Numbers update in real-time. Cards link to respective list views. |
| FR-DASH-002 | Dashboard shows recent activity feed (last 10 actions) | M | 1 | Shows who did what, when. Links to relevant entity. |
| FR-DASH-003 | Dashboard has quick-action buttons: New Check-Out, Report Issue, Add Asset | M | 1 | Buttons navigate to respective forms. |
| FR-DASH-004 | Dashboard shows assets needing attention (in maintenance, overdue sessions) | S | 1 | Separate section or card. Links to asset detail. |

### 4.8 Activity Log

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-LOG-001 | System records an activity log entry for every create, update, and status change across all entities | M | 1 | Log entry includes who, what action, which entity, and timestamp. |
| FR-LOG-002 | Activity log is viewable as a chronological feed filterable by entity type and person | M | 1 | Filters combinable. Paginated. Reverse chronological by default. |
| FR-LOG-003 | Log entries store before/after values for field changes | S | 2 | Diff visible on log entry detail. |

### 4.9 Authentication and Authorisation

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-AUTH-001 | Admin and Staff can log in with email and password | M | 1 | Successful login redirects to dashboard. Failed login shows error. |
| FR-AUTH-002 | All pages except /login require authentication | M | 1 | Unauthenticated requests redirect to /login. |
| FR-AUTH-003 | Role-based access: Admin can access all features. Staff cannot access settings or approve tech requests. | M | 1 | Unauthorised actions return 403. UI hides inaccessible features. |
| FR-AUTH-004 | Admin can create and manage staff accounts | M | 1 | CRUD for staff users in settings. Password reset capability. |
| FR-AUTH-005 | Sessions expire after 24 hours of inactivity | M | 1 | User is redirected to login. Session token invalidated. |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| Page load (initial) | < 3s on 3G connection | Freetown network conditions. Staff use phones on 3G. |
| Page load (subsequent navigation) | < 1s | Client-side routing after initial load. |
| Search results | < 500ms | Check-out flow must be fast. Staff check out multiple devices in sequence. |
| Database queries | < 200ms per query | NeonDB serverless has cold-start overhead. Connection pooling required. |
| Lighthouse Performance score | > 85 | Baseline for mobile performance on constrained networks. |

### 5.2 Security

| Requirement | Detail |
|-------------|--------|
| Authentication | Email + password via NextAuth.js. JWT-based sessions. |
| Authorisation | Role-based (Admin, Staff). Enforced at Server Action level, not just UI. |
| Input validation | Zod schemas on every Server Action. No raw user input reaches the database. |
| CSRF protection | Built into Next.js Server Actions. |
| HTTPS | Enforced by Vercel. All traffic encrypted in transit. |
| Data at rest | Encrypted by NeonDB (AES-256). |
| Secrets management | Environment variables via Vercel. Never committed to source. |

### 5.3 Accessibility

| Requirement | Standard |
|-------------|----------|
| Compliance level | WCAG 2.1 AA |
| Keyboard navigation | All interactive elements reachable via Tab. All actions performable without a mouse. |
| Screen reader support | Semantic HTML. ARIA labels on custom components. |
| Colour contrast | Minimum 4.5:1 for normal text, 3:1 for large text. |
| Touch targets | Minimum 44x44px on mobile. |
| Focus indicators | Visible focus ring on all interactive elements. |

### 5.4 Reliability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% (Vercel + NeonDB SLA) |
| Error handling | All Server Actions return structured error responses. No unhandled exceptions in production. |
| Data integrity | Atomic transactions for status changes (check-out/in must update both session and asset atomically). |
| Backup | NeonDB automated daily backups. Point-in-time recovery available. |

### 5.5 Scalability

| Dimension | Current | Design Target |
|-----------|---------|---------------|
| Assets | 31-60 | 500 |
| People (all roles) | ~50 | 1,000 |
| Sessions per month | ~100 | 5,000 |
| Concurrent staff users | 3-5 | 20 |

---

## 6. Constraints and Assumptions

### Constraints

| Constraint | Detail | Impact |
|------------|--------|--------|
| Zero infrastructure cost | Must run entirely on free tiers (Vercel, NeonDB) | Limits compute, storage, and bandwidth. Acceptable at current scale. |
| 3G network baseline | Freetown mobile networks are primarily 3G | Requires aggressive performance optimisation. Mobile-first design. Minimal JavaScript payload. |
| Single-tenant deployment | One instance, one organisation | No multi-tenancy architecture needed. Simplifies auth and data isolation. |
| Staff technical range | Users range from developers to non-technical coordinators | UI must be self-explanatory. Confirmation dialogs for destructive actions. Minimal training required. |
| No native mobile app | Web-only (responsive PWA in Phase 3) | Must work well in mobile browsers. No app store dependency. |

### Assumptions

- Christex Foundation will designate at least one admin user responsible for initial data entry
- Staff have consistent (if slow) internet access at the Innovation Hub
- Community members are willing to provide name and phone number for usage tracking
- The foundation's device count will not exceed 500 in the next 2 years
- English is the primary interface language (no localisation required in MVP)

---

## 7. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Staff don't adopt Lappi (continue using WhatsApp) | Medium | High | Make check-out faster than the current method. Train 2-3 champion users. Dashboard visible on a hub monitor. |
| Internet outage during check-out | Medium | Medium | Phase 3 PWA with offline queue. Phase 1: staff can note manually and enter later. |
| NeonDB free tier limits exceeded | Low | Medium | Monitor usage. NeonDB free tier allows 0.5 GB storage and 190 compute hours — sufficient for projected scale. Upgrade path is $19/month. |
| Device data entry is too tedious | Medium | Medium | Keep required fields minimal (name, type, condition). Everything else optional. Consider CSV bulk import in Phase 2. |
| Sensitive personal data exposure | Low | High | Role-based access enforced at server level. No public endpoints. Phone numbers visible only to staff. |

---

## 8. Glossary

| Term | Definition |
|------|-----------|
| **Asset** | Any electronic device owned by Christex Foundation and tracked in Lappi. |
| **Person** | Any individual in the Lappi system — may be an Admin, Staff, or Member. |
| **Member** | A community member whose usage is tracked. Does not have a login account. |
| **Session** | A UsageSession — a time-bounded record of a person using an asset, from check-out to check-in. |
| **Active Session** | A session that has been checked out but not yet checked in. |
| **Issue** | A reported hardware problem linked to a specific asset. |
| **Tech Request** | A formal staff request for equipment, subject to admin approval. |
| **Purpose** | The reason for a usage session: Workshop, Cohort, Personal Learning, Research, Community Use, or Staff Work. |
| **Hub** | The Christex Foundation Innovation Hub at Fourah Bay College, Freetown. |
| **Check-out** | The act of recording that a person is taking an asset for use. |
| **Check-in** | The act of recording that a person is returning an asset. |

---

## Related Documents

- [Concept Note](./concept-note.md) — Executive summary and vision
- [Feature List](./feature-list.md) — Complete feature inventory by module and phase
- [User Flows](./user-flow.md) — Step-by-step workflows for all key actions
- [Engineering Architecture](./engineering-architecture.md) — Technical blueprint and database schema
- [Design Document](./design-doc.md) — Visual design system and component patterns
- [Implementation Plan](./implementation-plan.md) — Phased build sequence with milestones
- [Completion Checklist](./completion-checklist.md) — Definition of done and launch readiness criteria
