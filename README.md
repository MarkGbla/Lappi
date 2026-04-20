<div align="center">
  <img src="public/mascot/lappi.png" alt="Lappi mascot" width="120" />

  # Lappi

  **Asset tracking, checkouts, issues, and tech requests — built for the Christex Foundation.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
  [![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)](https://www.prisma.io)
  [![Neon Postgres](https://img.shields.io/badge/Database-Neon-00e699)](https://neon.tech)
  [![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8)](https://web.dev/progressive-web-apps/)
</div>

---

## Overview

Lappi is a mobile-first web application for tracking the Christex Foundation's computing equipment across workshops, cohorts, and community programmes in Freetown, Sierra Leone. Staff register devices, hand them out to members, log issues when things break, and review tech requests — all from a phone or laptop, online or offline.

The app replaces scattered spreadsheets and WhatsApp threads with a single source of truth that keeps usage history, repair costs, and asset health in one place.

## Features

- **Asset registry** — Register laptops, phones, projectors, networking gear and more; track status (Available / Checked Out / Maintenance / Needs Attention / Retired), condition, location, purchase date, serial number, and up to five photos per asset.
- **Photo capture** — Upload from the gallery or take a photo in-app with front/back camera toggle. Images are auto-compressed to WebP in a web worker before upload for fast, data-friendly transfers on slow networks.
- **Check-outs & check-ins** — Record who has which device, why (Workshop / Cohort / Research / Personal Learning / Community Use / Staff Work), and how long. Overdue sessions flag automatically. Batch check-out supports cohort-day workflows.
- **People** — Community members, staff, and admins with usage metrics per person. Soft-deactivate without losing history.
- **Issues & repairs** — Report issues against an asset with severity (Critical / High / Medium / Low), assign them to staff, track resolution notes and repair cost. Critical issues move the asset to Maintenance automatically.
- **Tech requests** — Staff submit equipment or resource requests; admins approve, deny, or mark fulfilled.
- **Activity log & reports** — Every meaningful action is logged; the reports page surfaces utilisation rate, health score, and programme breakdowns.
- **Role-based access** — Admin, Staff, and Member roles with permissions enforced at the server-action layer.
- **PWA + offline-ready** — Installable on iOS and Android home screens with the Lappi mascot as the app icon.
- **QR code labels** — Generate printable QR sheets to stick on each device for faster check-out on mobile.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Server components, server actions, file-based routing |
| Language | **TypeScript 5** | End-to-end type safety |
| Database | **Neon Postgres** | Serverless Postgres, branching, generous free tier |
| ORM | **Prisma 7** | Type-safe queries, migrations, generated client |
| Auth | **NextAuth v5** (Auth.js) | Shared staff access token + session-based auth |
| UI | **Tailwind CSS 4** + **Base UI** + **shadcn-style components** | Minimal black/white aesthetic, accessible primitives |
| Icons | **Phosphor Icons** | Consistent, lightweight icon set |
| File uploads | **UploadThing v7** | Presigned-URL uploads direct to CDN; web worker compresses images first |
| Forms | **React Hook Form** + **Zod** | Type-safe validation shared between client and server actions |
| Toasts | **Sonner** | |
| Hosting | **Vercel** | |

## Project structure

```
Lappi/
├── docs/                         # PRD, feature list, completion checklist
├── prisma/
│   ├── schema.prisma             # Postgres schema (Person, Asset, UsageSession, Issue, TechRequest, ActivityLog)
│   ├── migrations/               # Migration history
│   └── seed.ts                   # Demo data seeder
├── public/
│   ├── mascot/                   # Lappi mascot artwork (used in logo + PWA icons)
│   ├── icon-192.png              # PWA icon (maskable)
│   ├── icon-512.png              # PWA icon (maskable)
│   ├── manifest.webmanifest      # PWA manifest
│   └── sw.js                     # Service worker
└── src/
    ├── app/                      # Next.js App Router routes
    │   ├── (auth)/               # /login — public
    │   ├── (dashboard)/          # / /assets /sessions /people /issues /requests /reports /activity
    │   ├── api/
    │   │   ├── auth/             # NextAuth routes
    │   │   ├── uploadthing/      # Signed-URL issuer + upload callback
    │   │   └── export/           # CSV/JSON data export
    │   ├── icon.png              # Favicon (mascot)
    │   ├── apple-icon.png        # iOS home-screen icon (mascot)
    │   └── layout.tsx
    ├── actions/                  # Server actions (one file per entity)
    │   ├── assets.ts
    │   ├── people.ts
    │   ├── issues.ts
    │   ├── requests.ts
    │   └── sessions.ts
    ├── components/
    │   ├── assets/               # AssetForm, PhotoUpload
    │   ├── layout/               # Sidebar, MobileNav, MobileHeader, PageHeader
    │   ├── shared/               # CameraCapture, RowActions, EmptyState, FilterBar, Pagination …
    │   ├── pwa/                  # InstallPrompt
    │   ├── sessions/             # CheckInButton
    │   └── ui/                   # Button, Dialog, Table, Dropdown, etc.
    ├── lib/
    │   ├── db.ts                 # Prisma client singleton (Neon adapter)
    │   ├── auth.ts               # NextAuth config
    │   ├── auth-helpers.ts       # getSession, requireAuth, requireRole
    │   ├── uploadthing.ts        # Typed React helpers
    │   ├── image-compress.ts     # WebP compression in a web worker
    │   ├── compress-worker.ts    # OffscreenCanvas worker
    │   ├── activity.ts           # logActivity()
    │   ├── asset-metrics.ts      # utilisationRate, healthScore
    │   ├── diff.ts               # Field diffs for activity log
    │   ├── csv.ts                # CSV export helpers
    │   └── validations/          # Zod schemas
    ├── proxy.ts                  # Next.js 16 edge proxy (formerly middleware.ts) — redirects unauth'd requests
    └── types/                    # Shared type defs
```

## Getting started

### Prerequisites

- Node.js 20+
- A Neon (or any Postgres) database URL
- An [UploadThing](https://uploadthing.com) v7 token for image storage

### 1. Clone and install

```bash
git clone https://github.com/MarkGbla/Lappi.git
cd Lappi
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

Required variables:

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-32+-char-random-string"

# Shared staff access token — single credential all staff use at /login
STAFF_ACCESS_TOKEN="your-staff-token"

# Postgres (Neon recommended — pooled + direct URLs for Prisma)
DATABASE_URL="postgresql://…?sslmode=require"
DIRECT_URL="postgresql://…?sslmode=require"

# UploadThing v7
UPLOADTHING_TOKEN="base64-token-from-uploadthing-dashboard"
NEXT_PUBLIC_UPLOADTHING_APP_ID="your-app-id"   # used to build CDN URLs at render time
```

### 3. Migrate and seed the database

```bash
npx prisma migrate deploy
npx prisma generate
npx tsx prisma/seed.ts            # optional — creates demo people and assets
npx tsx prisma/seed-staff.ts      # creates the first admin and staff accounts
```

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000. Sign in with the staff token you set above.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Deployment

The app is designed to deploy to **Vercel** with **Neon Postgres**:

1. Import the repo on Vercel.
2. Add the environment variables from `.env.example` in the Vercel project settings.
3. Set **Install Command** to `npm install && npx prisma generate`.
4. Push to `main` — Vercel builds and deploys automatically.

For the PWA to work correctly over HTTPS, make sure the `manifest.webmanifest` and `sw.js` are served from the production origin.

## Data model

The core entities are defined in [`prisma/schema.prisma`](prisma/schema.prisma):

- **`Person`** — Admins, staff, and members. Soft-deactivated via `isActive`.
- **`Asset`** — A physical device with type, status, condition, location, photos (`imageKeys`), serial number, purchase date.
- **`UsageSession`** — A check-out record linking a Person to an Asset with `purpose`, `checkedOutAt`, `checkedInAt`, and `conditionOnReturn`.
- **`Issue`** — Maintenance/repair tickets attached to an Asset with `severity` and `status`, optional `repairCost` and resolution notes.
- **`TechRequest`** — Staff requests for equipment or resources with approval workflow.
- **`ActivityLog`** — Append-only log of every meaningful action for audit and the Activity tab.

## Contributing

This is a first-party tool for the Christex Foundation. External PRs aren't currently accepted, but if you spot a bug or have a suggestion, open an issue.

## Acknowledgements

Built for [**Christex Foundation**](https://christex.foundation) — a nonprofit expanding access to computing education and tools across Sierra Leone.

Mascot artwork © Christex Foundation.
