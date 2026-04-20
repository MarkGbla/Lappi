# Lappi — Engineering Architecture

| Field | Detail |
|-------|--------|
| **Document** | Engineering Architecture |
| **Product** | Lappi |
| **Version** | 1.0 |
| **Last Updated** | 2026-04-13 |
| **Status** | Approved |
| **Owner** | Christex Foundation |

---

## 1. Architecture Overview

Lappi is a monolithic Next.js application deployed to Vercel, backed by a NeonDB (serverless PostgreSQL) database. There is no separate backend service — Next.js handles both server-side rendering and data mutations via Server Actions.

```mermaid
flowchart LR
    subgraph Client
        Browser[Browser / Mobile Browser]
    end

    subgraph Vercel
        Edge[Vercel Edge Network / CDN]
        App[Next.js App Router]
        SA[Server Actions]
        MW[Auth Middleware]
    end

    subgraph NeonDB
        DB[(PostgreSQL)]
    end

    Browser -->|HTTPS| Edge
    Edge --> MW
    MW -->|Authenticated| App
    MW -->|Not authenticated| Browser
    App --> SA
    SA -->|Prisma Client| DB
    DB -->|Query results| SA
    SA -->|React Server Components| App
    App -->|HTML + RSC Payload| Edge
    Edge -->|Response| Browser
```

### Key Architectural Decisions

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Architecture style | Monolith vs Microservices | Monolith | Small team, single product, no independent scaling needs. Monolith reduces operational complexity to zero. |
| Server mutations | API Routes vs Server Actions | Server Actions | No external API consumers. Server Actions eliminate boilerplate. API routes can be added later if needed. |
| Rendering strategy | SSR vs SPA vs SSG | SSR (Server Components) | Faster initial load on 3G. Less JavaScript shipped to client. Data always fresh. |
| State management | Redux vs Zustand vs Server state | Server Components + URL state | Most state is server-rendered. Filters use URL search params. No client-side store needed. |
| Session strategy | Database sessions vs JWT | JWT | Stateless, no database lookup per request. 24-hour expiry. Role embedded in token. |

---

## 2. Tech Stack Rationale

### Next.js 14+ (App Router)
Full-stack framework in one project. Server Components reduce JavaScript sent to Freetown clients on 3G. Server Actions provide type-safe mutations without building an API layer. App Router enables nested layouts (shared sidebar, per-section headers).

### TypeScript
Type safety across the entire stack. Prisma generates types from the schema. Zod schemas validate at runtime and infer TypeScript types. Eliminates entire categories of bugs before they reach users.

### NeonDB (Serverless PostgreSQL)
Managed Postgres with a generous free tier (0.5 GB storage, 190 compute hours/month). Serverless architecture means no idle server costs. Built-in connection pooling via their serverless driver. Automatic daily backups. Sufficient for Christex Foundation's projected scale (500 assets, 5,000 sessions/month).

### Prisma ORM
Type-safe database access that generates TypeScript types from the schema. Declarative schema-as-code. Migration management with `prisma migrate`. Introspection for existing databases. The schema file is the single source of truth for the database structure.

### NextAuth.js v5 (Auth.js)
First-party Next.js integration. Credentials provider for simple email/password auth — no OAuth complexity for an internal tool. Role stored in JWT via session callback. Middleware-based route protection.

### Tailwind CSS + shadcn/ui
Utility-first CSS for rapid development. shadcn/ui provides accessible, composable components that you own (copied into the project, not imported from node_modules). Full control over styling. No external CSS dependencies at runtime.

### Phosphor Icons
9,000+ icons in 6 weights (Thin, Light, Regular, Bold, Fill, Duotone). Distinctive visual identity — avoids the "every app looks the same" problem of Lucide/Heroicons. React Context provider for global weight/size configuration. Tree-shakeable — only used icons are bundled.

### Zod
Runtime validation that works on both client and server. Schemas defined once, used for form validation (React Hook Form integration) and Server Action input validation. TypeScript type inference from schemas eliminates duplication.

### React Hook Form
Performant form library with minimal re-renders. Native Zod integration via `@hookform/resolvers/zod`. Handles form state, validation, error display, and submission in a unified API.

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```mermaid
erDiagram
    Person ||--o{ UsageSession : "checked out by"
    Person ||--o{ UsageSession : "checked out for"
    Person ||--o{ Issue : "reported by"
    Person ||--o{ Issue : "assigned to"
    Person ||--o{ TechRequest : "requested by"
    Person ||--o{ TechRequest : "reviewed by"
    Person ||--o{ ActivityLog : "performed by"
    Asset ||--o{ UsageSession : "used in"
    Asset ||--o{ Issue : "has"

    Person {
        String id PK "cuid()"
        String firstName "required"
        String lastName "required"
        String email "unique, optional"
        String phone "optional"
        Role role "ADMIN | STAFF | MEMBER"
        String hashedPassword "null for MEMBER"
        Boolean isActive "default: true"
        DateTime createdAt
        DateTime updatedAt
    }

    Asset {
        String id PK "cuid()"
        String name "required"
        AssetType type "required"
        String serialNumber "unique, optional"
        AssetStatus status "default: AVAILABLE"
        Condition condition "required"
        String location "optional"
        DateTime purchaseDate "optional"
        String notes "optional"
        String imageUrl "optional"
        DateTime createdAt
        DateTime updatedAt
    }

    UsageSession {
        String id PK "cuid()"
        String assetId FK
        String personId FK "community member"
        String checkedOutById FK "staff who checked out"
        String checkedInById FK "staff who checked in, nullable"
        Purpose purpose "required"
        DateTime checkedOutAt "default: now()"
        DateTime checkedInAt "nullable = active"
        Condition conditionOnReturn "optional"
        String notes "optional"
    }

    Issue {
        String id PK "cuid()"
        String assetId FK
        String reportedById FK
        String assignedToId FK "optional"
        String title "required"
        String description "required"
        Severity severity "required"
        IssueStatus status "default: OPEN"
        String resolutionNotes "optional"
        Decimal repairCost "optional, Phase 3"
        DateTime createdAt
        DateTime updatedAt
        DateTime resolvedAt "optional"
    }

    TechRequest {
        String id PK "cuid()"
        String requestedById FK
        String reviewedById FK "optional"
        String title "required"
        String description "required"
        Urgency urgency "required"
        RequestStatus status "default: PENDING"
        String reviewNotes "optional"
        DateTime createdAt
        DateTime updatedAt
        DateTime reviewedAt "optional"
    }

    ActivityLog {
        String id PK "cuid()"
        String personId FK "who performed the action"
        String action "e.g. ASSET_CREATED"
        String entityType "e.g. Asset"
        String entityId "related entity ID"
        Json metadata "optional, before/after"
        DateTime createdAt
    }
```

### 3.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── Enums ───────────────────────────────────────────────

enum Role {
  ADMIN
  STAFF
  MEMBER
}

enum AssetType {
  LAPTOP
  DESKTOP
  TABLET
  PROJECTOR
  ROUTER
  PHONE
  CAMERA
  PRINTER
  NETWORKING
  OTHER
}

enum AssetStatus {
  AVAILABLE
  CHECKED_OUT
  MAINTENANCE
  NEEDS_ATTENTION
  RETIRED
}

enum Condition {
  EXCELLENT
  GOOD
  FAIR
  POOR
}

enum Purpose {
  WORKSHOP
  COHORT
  PERSONAL_LEARNING
  RESEARCH
  COMMUNITY_USE
  STAFF_WORK
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum IssueStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum Urgency {
  LOW
  MEDIUM
  HIGH
}

enum RequestStatus {
  PENDING
  APPROVED
  DENIED
  FULFILLED
}

// ─── Models ──────────────────────────────────────────────

model Person {
  id             String   @id @default(cuid())
  firstName      String
  lastName       String
  email          String?  @unique
  phone          String?
  role           Role     @default(MEMBER)
  hashedPassword String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Sessions where this person used a device
  sessions       UsageSession[] @relation("SessionPerson")
  // Sessions where this person (staff) performed the check-out
  checkedOut     UsageSession[] @relation("SessionCheckedOutBy")
  // Sessions where this person (staff) performed the check-in
  checkedIn      UsageSession[] @relation("SessionCheckedInBy")

  reportedIssues Issue[]        @relation("IssueReporter")
  assignedIssues Issue[]        @relation("IssueAssignee")

  techRequests        TechRequest[] @relation("RequestRequester")
  reviewedRequests    TechRequest[] @relation("RequestReviewer")

  activityLogs  ActivityLog[]

  @@index([role])
  @@index([isActive])
  @@index([lastName, firstName])
}

model Asset {
  id           String      @id @default(cuid())
  name         String
  type         AssetType
  serialNumber String?     @unique
  status       AssetStatus @default(AVAILABLE)
  condition    Condition
  location     String?
  purchaseDate DateTime?
  notes        String?
  imageUrl     String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  sessions UsageSession[]
  issues   Issue[]

  @@index([status])
  @@index([type])
  @@index([condition])
}

model UsageSession {
  id              String     @id @default(cuid())
  assetId         String
  personId        String
  checkedOutById  String
  checkedInById   String?
  purpose         Purpose
  checkedOutAt    DateTime   @default(now())
  checkedInAt     DateTime?
  conditionOnReturn Condition?
  notes           String?

  asset          Asset  @relation(fields: [assetId], references: [id])
  person         Person @relation("SessionPerson", fields: [personId], references: [id])
  checkedOutBy   Person @relation("SessionCheckedOutBy", fields: [checkedOutById], references: [id])
  checkedInBy    Person? @relation("SessionCheckedInBy", fields: [checkedInById], references: [id])

  @@index([assetId, checkedInAt])
  @@index([personId])
  @@index([checkedOutAt])
  @@index([purpose])
}

model Issue {
  id              String      @id @default(cuid())
  assetId         String
  reportedById    String
  assignedToId    String?
  title           String
  description     String
  severity        Severity
  status          IssueStatus @default(OPEN)
  resolutionNotes String?
  repairCost      Decimal?    @db.Decimal(10, 2)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  resolvedAt      DateTime?

  asset      Asset  @relation(fields: [assetId], references: [id])
  reportedBy Person @relation("IssueReporter", fields: [reportedById], references: [id])
  assignedTo Person? @relation("IssueAssignee", fields: [assignedToId], references: [id])

  @@index([status, severity])
  @@index([assetId])
  @@index([assignedToId])
}

model TechRequest {
  id            String        @id @default(cuid())
  requestedById String
  reviewedById  String?
  title         String
  description   String
  urgency       Urgency
  status        RequestStatus @default(PENDING)
  reviewNotes   String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  reviewedAt    DateTime?

  requestedBy Person  @relation("RequestRequester", fields: [requestedById], references: [id])
  reviewedBy  Person? @relation("RequestReviewer", fields: [reviewedById], references: [id])

  @@index([status])
  @@index([requestedById])
}

model ActivityLog {
  id         String   @id @default(cuid())
  personId   String
  action     String
  entityType String
  entityId   String
  metadata   Json?
  createdAt  DateTime @default(now())

  person Person @relation(fields: [personId], references: [id])

  @@index([entityType, entityId])
  @@index([personId])
  @@index([createdAt])
}
```

### 3.3 Index Strategy

| Model | Index | Columns | Purpose |
|-------|-------|---------|---------|
| Person | role filter | `[role]` | Filter people list by role |
| Person | active filter | `[isActive]` | Exclude deactivated in check-out search |
| Person | name search | `[lastName, firstName]` | Sort and search people by name |
| Asset | status filter | `[status]` | Dashboard KPIs, available assets for check-out |
| Asset | type filter | `[type]` | Filter asset list by category |
| Asset | condition filter | `[condition]` | Filter assets needing attention |
| UsageSession | active sessions | `[assetId, checkedInAt]` | Find active session for an asset (checkedInAt IS NULL) |
| UsageSession | person history | `[personId]` | Usage history per person |
| UsageSession | date range | `[checkedOutAt]` | Analytics time-based queries |
| UsageSession | purpose analytics | `[purpose]` | Analytics by session type |
| Issue | status + severity | `[status, severity]` | Issue list default sort (open + critical first) |
| Issue | per asset | `[assetId]` | Issues on asset detail page |
| Issue | per assignee | `[assignedToId]` | "My assigned issues" view |
| TechRequest | status filter | `[status]` | Request list by status |
| TechRequest | per requester | `[requestedById]` | "My requests" view |
| ActivityLog | per entity | `[entityType, entityId]` | Activity for a specific asset/person/etc. |
| ActivityLog | per person | `[personId]` | Actions performed by a specific user |
| ActivityLog | chronological | `[createdAt]` | Activity feed, default sort |

---

## 4. API Design

### 4.1 Server Actions (Primary Mutation Layer)

All mutations use Next.js Server Actions. Each action follows this pattern:

```typescript
// Pattern for all Server Actions
"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logActivity } from "@/lib/activity"

// 1. Define Zod input schema
const CreateAssetSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(AssetType),
  condition: z.nativeEnum(Condition),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  purchaseDate: z.date().optional(),
  notes: z.string().optional(),
})

// 2. Define return type
type ActionResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  fieldErrors?: Record<string, string[]>
}

// 3. Implement action with auth check, validation, and activity logging
export async function createAsset(
  input: z.infer<typeof CreateAssetSchema>
): Promise<ActionResult<Asset>> {
  const session = await getSession()
  if (!session) return { success: false, error: "Not authenticated" }

  const parsed = CreateAssetSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const asset = await prisma.asset.create({ data: parsed.data })

  await logActivity({
    personId: session.user.id,
    action: "ASSET_CREATED",
    entityType: "Asset",
    entityId: asset.id,
    metadata: { name: asset.name, type: asset.type },
  })

  return { success: true, data: asset }
}
```

### 4.2 Server Action Inventory

| Action | File | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| `createAsset` | `actions/assets.ts` | Register a new device | Required | Admin, Staff |
| `updateAsset` | `actions/assets.ts` | Edit device details | Required | Admin, Staff |
| `retireAsset` | `actions/assets.ts` | Archive a device | Required | Admin, Staff |
| `createPerson` | `actions/people.ts` | Register a new person | Required | Admin, Staff |
| `updatePerson` | `actions/people.ts` | Edit person details | Required | Admin, Staff |
| `deactivatePerson` | `actions/people.ts` | Soft-delete a person | Required | Admin, Staff |
| `checkOutAsset` | `actions/sessions.ts` | Create a usage session | Required | Admin, Staff |
| `checkInAsset` | `actions/sessions.ts` | Close a usage session | Required | Admin, Staff |
| `createIssue` | `actions/issues.ts` | Report an issue | Required | Admin, Staff |
| `assignIssue` | `actions/issues.ts` | Assign issue to staff | Required | Admin, Staff |
| `updateIssueStatus` | `actions/issues.ts` | Change issue status | Required | Admin, Staff |
| `createTechRequest` | `actions/requests.ts` | Submit equipment request | Required | Staff |
| `reviewTechRequest` | `actions/requests.ts` | Approve or deny request | Required | Admin |
| `fulfillTechRequest` | `actions/requests.ts` | Mark request as fulfilled | Required | Admin |
| `createStaffAccount` | `actions/auth.ts` | Create staff/admin user | Required | Admin |

### 4.3 Return Envelope

Every Server Action returns one of two shapes:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "fieldErrors": {
    "name": ["Name is required"],
    "serialNumber": ["Serial number already exists"]
  }
}
```

### 4.4 Reference REST Endpoints (Future Use)

These are not built in Phase 1 but documented for future API consumers (mobile app, integrations).

| Method | Path | Description | Auth | Roles |
|--------|------|-------------|------|-------|
| GET | /api/assets | List assets (query: type, status, search, page) | Required | Admin, Staff |
| POST | /api/assets | Create asset | Required | Admin, Staff |
| GET | /api/assets/[id] | Get asset detail | Required | Admin, Staff |
| PATCH | /api/assets/[id] | Update asset | Required | Admin, Staff |
| DELETE | /api/assets/[id] | Retire asset (soft delete) | Required | Admin, Staff |
| GET | /api/sessions | List sessions (query: active, personId, assetId, purpose, page) | Required | Admin, Staff |
| POST | /api/sessions | Check-out (create session) | Required | Admin, Staff |
| PATCH | /api/sessions/[id]/check-in | Check-in (close session) | Required | Admin, Staff |
| GET | /api/people | List people (query: role, search, page) | Required | Admin, Staff |
| POST | /api/people | Create person | Required | Admin, Staff |
| GET | /api/people/[id] | Get person detail | Required | Admin, Staff |
| PATCH | /api/people/[id] | Update person | Required | Admin, Staff |
| GET | /api/issues | List issues (query: status, severity, assetId, assigneeId, page) | Required | Admin, Staff |
| POST | /api/issues | Create issue | Required | Admin, Staff |
| PATCH | /api/issues/[id] | Update issue (status, assignment, resolution) | Required | Admin, Staff |
| GET | /api/requests | List tech requests (query: status, urgency, page) | Required | Admin, Staff |
| POST | /api/requests | Create tech request | Required | Staff |
| PATCH | /api/requests/[id] | Review/fulfil request | Required | Admin |
| GET | /api/activity | List activity logs (query: entityType, personId, page) | Required | Admin, Staff |

**Pagination pattern:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 147,
    "totalPages": 8
  }
}
```

---

## 5. Authentication and Authorisation

### 5.1 NextAuth Configuration

```typescript
// lib/auth.ts — configuration overview
{
  providers: [
    CredentialsProvider({
      // Validate email + password against Person table
      // Only ADMIN and STAFF roles can authenticate
      // MEMBER role has no hashedPassword and cannot log in
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    jwt({ token, user }) {
      // Embed role in JWT token
      if (user) { token.role = user.role; token.id = user.id }
      return token
    },
    session({ session, token }) {
      // Expose role and id in session object
      session.user.role = token.role
      session.user.id = token.id
      return session
    }
  }
}
```

### 5.2 Role-Based Access Control Matrix

| Resource / Action | Admin | Staff | Member |
|-------------------|-------|-------|--------|
| View dashboard | Yes | Yes | N/A |
| Create/edit/retire assets | Yes | Yes | N/A |
| Check-out / check-in devices | Yes | Yes | N/A |
| Create/edit people | Yes | Yes | N/A |
| Report issues | Yes | Yes | N/A |
| Assign issues | Yes | Yes | N/A |
| Close issues | Yes | No | N/A |
| Submit tech requests | Yes | Yes | N/A |
| Approve/deny tech requests | Yes | No | N/A |
| View analytics/reports | Yes | Limited | N/A |
| Manage staff accounts | Yes | No | N/A |
| Access settings | Yes | No | N/A |
| View activity log | Yes | Yes | N/A |

### 5.3 Middleware

```typescript
// middleware.ts — route protection
// Protected: everything under /(dashboard)/*
// Public: /login only
// Redirect unauthenticated users to /login
// Redirect authenticated users from /login to /dashboard
// Admin-only routes: /settings, /requests/[id] (approve action)
```

---

## 6. Project Structure

```
lappi/
├── prisma/
│   ├── schema.prisma              # Database schema (source of truth)
│   ├── migrations/                # Generated migration files
│   └── seed.ts                    # Development seed data
├── public/
│   └── ...                        # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (html, body, providers)
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx       # Login page
│   │   └── (dashboard)/
│   │       ├── layout.tsx         # Dashboard shell (sidebar, nav, auth gate)
│   │       ├── page.tsx           # Dashboard (/dashboard)
│   │       ├── assets/
│   │       │   ├── page.tsx       # Asset list
│   │       │   ├── new/
│   │       │   │   └── page.tsx   # Create asset form
│   │       │   └── [id]/
│   │       │       ├── page.tsx   # Asset detail
│   │       │       └── edit/
│   │       │           └── page.tsx # Edit asset form
│   │       ├── sessions/
│   │       │   ├── page.tsx       # Session list
│   │       │   ├── checkout/
│   │       │   │   └── page.tsx   # Check-out flow
│   │       │   └── [id]/
│   │       │       └── page.tsx   # Session detail / check-in
│   │       ├── people/
│   │       │   ├── page.tsx       # People directory
│   │       │   ├── new/
│   │       │   │   └── page.tsx   # Create person form
│   │       │   └── [id]/
│   │       │       ├── page.tsx   # Person detail
│   │       │       └── edit/
│   │       │           └── page.tsx # Edit person form
│   │       ├── issues/
│   │       │   ├── page.tsx       # Issue list
│   │       │   ├── new/
│   │       │   │   └── page.tsx   # Report issue form
│   │       │   └── [id]/
│   │       │       └── page.tsx   # Issue detail
│   │       ├── requests/
│   │       │   ├── page.tsx       # Request list
│   │       │   ├── new/
│   │       │   │   └── page.tsx   # Submit request form
│   │       │   └── [id]/
│   │       │       └── page.tsx   # Request detail / review
│   │       ├── activity/
│   │       │   └── page.tsx       # Activity log
│   │       ├── reports/
│   │       │   └── page.tsx       # Analytics and reports
│   │       └── settings/
│   │           └── page.tsx       # Admin settings
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (Button, Card, Table, etc.)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx        # Desktop sidebar navigation
│   │   │   ├── mobile-nav.tsx     # Mobile bottom tab bar
│   │   │   ├── page-header.tsx    # Page title + breadcrumb + action
│   │   │   └── user-menu.tsx      # Profile + logout dropdown
│   │   ├── assets/
│   │   │   ├── asset-form.tsx     # Shared create/edit form
│   │   │   ├── asset-card.tsx     # Asset card for mobile lists
│   │   │   ├── asset-table.tsx    # Asset table for desktop
│   │   │   └── status-badge.tsx   # Colour-coded status badge
│   │   ├── sessions/
│   │   │   ├── checkout-form.tsx  # Multi-step check-out flow
│   │   │   ├── checkin-dialog.tsx # Check-in confirmation dialog
│   │   │   └── session-card.tsx   # Session card for lists
│   │   ├── issues/
│   │   │   ├── issue-form.tsx     # Report issue form
│   │   │   ├── severity-badge.tsx # Colour-coded severity badge
│   │   │   └── issue-timeline.tsx # Status change timeline
│   │   ├── people/
│   │   │   ├── person-form.tsx    # Shared create/edit form
│   │   │   └── person-search.tsx  # Searchable person selector
│   │   ├── requests/
│   │   │   ├── request-form.tsx   # Submit request form
│   │   │   └── review-dialog.tsx  # Approve/deny dialog
│   │   └── shared/
│   │       ├── data-table.tsx     # Generic sortable, filterable table
│   │       ├── stat-card.tsx      # Dashboard KPI card
│   │       ├── empty-state.tsx    # Empty state with illustration + CTA
│   │       ├── search-input.tsx   # Debounced search input
│   │       └── confirm-dialog.tsx # Confirmation for destructive actions
│   ├── lib/
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── auth-helpers.ts        # getSession, requireAuth, requireRole helpers
│   │   ├── activity.ts            # logActivity helper function
│   │   ├── utils.ts               # cn() and shared utilities
│   │   └── validations/
│   │       ├── asset.ts           # Zod schemas for asset operations
│   │       ├── session.ts         # Zod schemas for session operations
│   │       ├── person.ts          # Zod schemas for person operations
│   │       ├── issue.ts           # Zod schemas for issue operations
│   │       └── request.ts         # Zod schemas for request operations
│   ├── actions/
│   │   ├── assets.ts              # Asset Server Actions
│   │   ├── sessions.ts            # Session Server Actions (check-out, check-in)
│   │   ├── people.ts              # Person Server Actions
│   │   ├── issues.ts              # Issue Server Actions
│   │   ├── requests.ts            # Tech Request Server Actions
│   │   └── auth.ts                # Auth-related Server Actions
│   └── types/
│       └── index.ts               # Shared TypeScript types and interfaces
├── middleware.ts                   # NextAuth route protection middleware
├── .env.local                     # Environment variables (not committed)
├── .env.example                   # Template for environment variables
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json
└── docs/                          # This documentation suite
```

---

## 7. Performance Strategy

### 7.1 Network Optimisation (3G Baseline)

| Strategy | Implementation |
|----------|---------------|
| Server Components by default | Minimal JavaScript sent to client. HTML streamed. |
| Dynamic imports for heavy components | Charts (Phase 2) loaded only when needed. |
| Image optimisation | Next.js `<Image>` component with WebP format, appropriate sizing. |
| Font optimisation | `next/font` with system font fallback. Inter loaded from Google Fonts with `display: swap`. |
| Minimal client-side JavaScript | Only interactive components (forms, dropdowns) use `"use client"`. |

### 7.2 Database Optimisation

| Strategy | Implementation |
|----------|---------------|
| Connection pooling | NeonDB serverless driver with `@neondatabase/serverless` adapter for Prisma. |
| Indexed queries | All filter and sort columns indexed (see Section 3.3). |
| Select only needed fields | Prisma `select` used to avoid fetching unnecessary columns on list views. |
| Pagination | All list endpoints paginated (20 items default). No unbounded queries. |
| Aggregation queries | Dashboard KPIs use `COUNT` and `GROUP BY` instead of fetching all records. |

### 7.3 Caching

| Layer | Strategy |
|-------|----------|
| Static assets | Vercel CDN with long cache headers (immutable for hashed assets). |
| Server Components | `revalidatePath` after mutations. No stale data shown. |
| Search | 300ms debounce on client. No server-side cache (data changes frequently). |

---

## 8. Security Considerations

| Concern | Mitigation |
|---------|------------|
| SQL injection | Prisma parameterised queries. No raw SQL. |
| XSS | React's built-in escaping. No `dangerouslySetInnerHTML`. |
| CSRF | Next.js Server Actions include CSRF tokens automatically. |
| Authentication bypass | Middleware protects all routes. Server Actions verify session independently. |
| Authorisation bypass | Server Actions check role before executing. UI hiding is cosmetic, not security. |
| Secrets exposure | Environment variables via Vercel. `.env.local` in `.gitignore`. No secrets in client bundles. |
| Password storage | bcrypt hashing with salt. Never stored in plaintext. |
| Data privacy | Phone numbers and emails visible only to authenticated staff/admin. No public endpoints. |

---

## 9. Environment Variables

```bash
# .env.example

# NeonDB PostgreSQL
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret"

# Optional: Vercel Blob (Phase 2 — device photos)
# BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

---

## Related Documents

- [PRD](./prd.md) — Requirements this architecture implements
- [Feature List](./feature-list.md) — Features mapped to Server Actions
- [User Flows](./user-flow.md) — Workflows that drive the API design
- [Design Document](./design-doc.md) — Component architecture and visual patterns
- [Implementation Plan](./implementation-plan.md) — Build sequence for this architecture
