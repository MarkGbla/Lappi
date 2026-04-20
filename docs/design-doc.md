# Lappi — Design Document

| Field | Detail |
|-------|--------|
| **Document** | Design System |
| **Product** | Lappi |
| **Version** | 1.0 |
| **Last Updated** | 2026-04-13 |
| **Status** | Approved |
| **Owner** | Christex Foundation |

---

## 1. Design Philosophy

Lappi is an operational tool for a nonprofit, not a consumer product. The design prioritises:

1. **Speed over delight** — Staff check out 15 laptops in a row. Every interaction must be fast and predictable.
2. **Clarity over cleverness** — Status should be obvious at a glance. No ambiguous icons. No hidden features.
3. **Mobile-first** — Coordinators use phones on the hub floor. Every screen must work at 320px width.
4. **Forgiveness** — Staff range from developers to non-technical coordinators. Confirmation dialogs for destructive actions. Clear undo paths.
5. **Restraint** — Black and white foundation with purposeful colour for status and severity. No decorative gradients, shadows, or animations beyond functional transitions.

**Reference aesthetic**: Linear, Vercel Dashboard, Raycast — monochrome base, clean typography, precise spacing, colour reserved for meaning.

---

## 2. Colour System

### 2.1 Base Palette

Lappi uses a monochrome base (black and white) with Christex Foundation's brand accent colour for primary interactive elements.

| Token | CSS Variable | Light Mode | Dark Mode | Usage |
|-------|-------------|------------|-----------|-------|
| Background | `--background` | `#FFFFFF` | `#09090B` | Page background |
| Foreground | `--foreground` | `#09090B` | `#FAFAFA` | Primary text |
| Card | `--card` | `#FFFFFF` | `#09090B` | Card surfaces |
| Card Foreground | `--card-foreground` | `#09090B` | `#FAFAFA` | Card text |
| Muted | `--muted` | `#F4F4F5` | `#27272A` | Secondary backgrounds, disabled states |
| Muted Foreground | `--muted-foreground` | `#71717A` | `#A1A1AA` | Secondary text, placeholders |
| Border | `--border` | `#E4E4E7` | `#27272A` | Borders, dividers |
| Input | `--input` | `#E4E4E7` | `#27272A` | Input borders |
| Ring | `--ring` | `#18181B` | `#D4D4D8` | Focus rings |
| Primary | `--primary` | `#18181B` | `#FAFAFA` | Primary buttons, key interactive elements |
| Primary Foreground | `--primary-foreground` | `#FAFAFA` | `#18181B` | Text on primary buttons |
| Secondary | `--secondary` | `#F4F4F5` | `#27272A` | Secondary buttons |
| Secondary Foreground | `--secondary-foreground` | `#18181B` | `#FAFAFA` | Text on secondary buttons |
| Accent | `--accent` | `#F4F4F5` | `#27272A` | Hover states, active nav items |
| Accent Foreground | `--accent-foreground` | `#18181B` | `#FAFAFA` | Text on accent |
| Destructive | `--destructive` | `#EF4444` | `#7F1D1D` | Delete, retire, destructive actions |
| Destructive Foreground | `--destructive-foreground` | `#FAFAFA` | `#FAFAFA` | Text on destructive buttons |

**Christex brand accent**: To be extracted from the Christex Foundation website/logo assets. This colour will be used sparingly — for the logo mark in the sidebar, the login page branding, and optionally as a subtle accent on the dashboard. It does not replace the primary black interactive colour.

### 2.2 Semantic Status Colours

Used consistently across all status badges, icons, and indicators.

| Status Context | Colour Name | Hex (Light) | Hex (Dark) | Tailwind Class |
|----------------|-------------|-------------|------------|----------------|
| Available / Success | Green | `#22C55E` | `#16A34A` | `text-green-500 bg-green-50` / `dark:text-green-400 dark:bg-green-950` |
| Checked Out / Warning | Amber | `#F59E0B` | `#D97706` | `text-amber-500 bg-amber-50` / `dark:text-amber-400 dark:bg-amber-950` |
| Maintenance / Error | Orange | `#F97316` | `#EA580C` | `text-orange-500 bg-orange-50` / `dark:text-orange-400 dark:bg-orange-950` |
| Needs Attention | Yellow | `#EAB308` | `#CA8A04` | `text-yellow-500 bg-yellow-50` / `dark:text-yellow-400 dark:bg-yellow-950` |
| Retired / Inactive | Gray | `#71717A` | `#A1A1AA` | `text-zinc-500 bg-zinc-50` / `dark:text-zinc-400 dark:bg-zinc-900` |

### 2.3 Severity Colours

| Severity | Colour | Hex (Light) | Badge Style |
|----------|--------|-------------|-------------|
| Critical | Red | `#EF4444` | `bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400` |
| High | Orange | `#F97316` | `bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400` |
| Medium | Amber | `#F59E0B` | `bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400` |
| Low | Blue | `#3B82F6` | `bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400` |

### 2.4 Dark Mode

Dark mode is supported from day one via shadcn/ui's `class` strategy on `<html>`. Toggle is available in the user menu. System preference is respected by default.

---

## 3. Typography

### 3.1 Font Stack

**Primary**: Inter (loaded via `next/font/google` with `display: swap`)
**Fallback**: system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)

Inter is chosen for its legibility at small sizes (critical for mobile), its tabular number support (good for data tables), and its wide availability as a Google Font (cached on many devices already).

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `h1` | 30px / 1.875rem | 700 (Bold) | 36px | Page titles |
| `h2` | 24px / 1.5rem | 600 (Semibold) | 32px | Section headings |
| `h3` | 20px / 1.25rem | 600 (Semibold) | 28px | Card titles, subsections |
| `h4` | 16px / 1rem | 600 (Semibold) | 24px | Table headers, labels |
| `body` | 14px / 0.875rem | 400 (Regular) | 20px | Default body text, table cells |
| `body-sm` | 13px / 0.8125rem | 400 (Regular) | 18px | Secondary text, descriptions |
| `caption` | 12px / 0.75rem | 500 (Medium) | 16px | Badges, timestamps, metadata |
| `overline` | 11px / 0.6875rem | 600 (Semibold) | 16px | Category labels, section overlines |

### 3.3 Responsive Type Adjustments

| Token | Mobile (< 768px) | Desktop (>= 768px) |
|-------|-------------------|---------------------|
| `h1` | 24px | 30px |
| `h2` | 20px | 24px |
| `h3` | 18px | 20px |
| All others | No change | No change |

---

## 4. Iconography — Phosphor Icons

### 4.1 Why Phosphor

Phosphor Icons provides 9,000+ icons in 6 weight variants. This gives Lappi a distinctive visual identity (avoiding the "every shadcn app looks identical" problem of Lucide). The weight system allows visual hierarchy without switching icon families.

### 4.2 Weight Conventions

| Context | Weight | Rationale |
|---------|--------|-----------|
| Navigation items (sidebar, tabs) | Bold | Needs to stand out at small sizes in the nav |
| Page content UI (buttons, inline icons) | Regular | Default weight. Clean and balanced. |
| Form field icons (input prefixes) | Light | Subtle, doesn't compete with input text |
| Dashboard KPI cards | Duotone | Two-tone fills add visual richness to the data-heavy dashboard |
| Empty states | Thin | Large decorative icons. Thin weight keeps them light. |
| Active/selected states | Fill | Solid fill indicates selection (e.g., active nav item) |

### 4.3 Size Conventions

| Context | Size | Tailwind Class |
|---------|------|----------------|
| Inline with text | 16px | `size={16}` |
| Buttons | 20px | `size={20}` |
| Navigation items | 24px | `size={24}` |
| Dashboard KPI cards | 32px | `size={32}` |
| Empty state illustrations | 48-64px | `size={48}` or `size={64}` |

### 4.4 Icon Mapping

| UI Element | Phosphor Icon | Weight |
|------------|---------------|--------|
| Dashboard nav | `House` | Bold / Fill (active) |
| Assets nav | `Desktop` | Bold / Fill (active) |
| Sessions nav | `ArrowsLeftRight` | Bold / Fill (active) |
| People nav | `Users` | Bold / Fill (active) |
| Issues nav | `Warning` | Bold / Fill (active) |
| Requests nav | `ClipboardText` | Bold / Fill (active) |
| Activity nav | `Activity` | Bold / Fill (active) |
| Reports nav | `ChartBar` | Bold / Fill (active) |
| Settings nav | `Gear` | Bold / Fill (active) |
| Search | `MagnifyingGlass` | Regular |
| Add/Create | `Plus` | Regular |
| Edit | `PencilSimple` | Regular |
| Delete/Retire | `Trash` | Regular |
| Check-out | `SignOut` | Regular |
| Check-in | `SignIn` | Regular |
| Filter | `Funnel` | Regular |
| Export CSV | `DownloadSimple` | Regular |
| Status: Available | `CheckCircle` | Duotone (green) |
| Status: Checked Out | `ArrowCircleRight` | Duotone (amber) |
| Status: Maintenance | `Wrench` | Duotone (orange) |
| Status: Needs Attention | `WarningCircle` | Duotone (yellow) |
| Status: Retired | `MinusCircle` | Duotone (gray) |
| Severity: Critical | `FireSimple` | Fill (red) |
| Severity: High | `WarningOctagon` | Bold (orange) |
| Severity: Medium | `WarningDiamond` | Regular (amber) |
| Severity: Low | `Info` | Light (blue) |

### 4.5 Global Configuration

```tsx
// In root layout.tsx or providers.tsx
import { IconContext } from "@phosphor-icons/react"

<IconContext.Provider value={{ size: 20, weight: "regular" }}>
  {children}
</IconContext.Provider>
```

Override per-component as needed. The context provides sensible defaults so most icons only need the icon name.

---

## 5. Component Patterns

### 5.1 Layout Components

**App Shell (Desktop)**
```
┌─────────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────────┐ │
│ │           │ │ Page Header                    │ │
│ │  Sidebar  │ │ [Breadcrumb]                   │ │
│ │           │ │ Title            [Action Btn]  │ │
│ │  - Dash   │ ├────────────────────────────────┤ │
│ │  - Assets │ │                                │ │
│ │  - Sess.  │ │  Page Content                  │ │
│ │  - People │ │                                │ │
│ │  - Issues │ │                                │ │
│ │  - Req.   │ │                                │ │
│ │  - Act.   │ │                                │ │
│ │  - Report │ │                                │ │
│ │           │ │                                │ │
│ │ ───────── │ │                                │ │
│ │  [User]   │ │                                │ │
│ │  Settings │ │                                │ │
│ └──────────┘ └────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**App Shell (Mobile)**
```
┌────────────────────────┐
│ Page Header            │
│ Title      [Action]    │
├────────────────────────┤
│                        │
│  Page Content          │
│                        │
│                        │
│                        │
│                        │
│                        │
├────────────────────────┤
│ [Dash][Asset][Sess][Ppl][More] │
└────────────────────────┘
```

### 5.2 Data Display Components

**Stat Card (Dashboard KPI)**
```
┌─────────────────────────┐
│ [Icon]  Total Assets    │
│                         │
│ 47                      │
│ 32 available · 10 out   │
│ 3 repair · 2 retired    │
└─────────────────────────┘
```
- Phosphor Duotone icon (32px) top-left
- Label in `body-sm` muted text
- Value in `h2` bold
- Breakdown in `caption` muted text

**Status Badge**
```
[ ● Available ]    [ ● Checked Out ]    [ ● Maintenance ]
  green              amber                orange
```
- Rounded pill shape
- Coloured dot + text
- Consistent sizing (height 24px, padding 8px 12px)
- Used everywhere a status appears: tables, cards, detail pages

**Data Table (Desktop)**
- Fixed header row
- Alternating row backgrounds (subtle, `bg-muted/50`)
- Sortable columns (click header to sort)
- Row click navigates to detail page
- Status and severity columns use badge components
- Pagination at bottom: "Showing 1-20 of 147" + page navigation

**Card Stack (Mobile)**
- Replaces data table below 768px
- Each row becomes a card with key fields
- Status badge prominent
- Tap navigates to detail page
- Infinite scroll or "Load more" button

### 5.3 Form Components

**Standard Form Layout**
```
┌────────────────────────────────────────┐
│ [Breadcrumb: Assets > New Asset]       │
│                                        │
│ Register New Asset                     │
│                                        │
│ Name *                                 │
│ ┌──────────────────────────────────┐   │
│ │ Dell Latitude 5520 #3           │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Type *                                 │
│ ┌──────────────────────────────────┐   │
│ │ Laptop                      ▾   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Condition *                            │
│ ┌──────────────────────────────────┐   │
│ │ Good                        ▾   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Serial Number                          │
│ ┌──────────────────────────────────┐   │
│ │ ABC123XYZ                       │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Location                               │
│ ┌──────────────────────────────────┐   │
│ │ Lab A                           │   │
│ └──────────────────────────────────┘   │
│                                        │
│         [Cancel]  [Create Asset]       │
└────────────────────────────────────────┘
```

- Single column, max-width 640px, centred on desktop
- Full width on mobile
- Labels above inputs
- Required fields marked with `*`
- Inline error messages below fields in red
- Submit button right-aligned, primary style
- Cancel button secondary style, left of submit
- On mobile: buttons sticky at bottom of viewport

### 5.4 Feedback Components

**Toast Notifications**
- Bottom-right on desktop, bottom-centre on mobile
- Success: dark background, white text, checkmark icon
- Error: red background, white text, warning icon
- Auto-dismiss after 4 seconds
- Dismissible with close button

**Confirmation Dialog**
- Modal overlay for destructive actions (retire asset, close issue)
- Clear description of what will happen
- "Cancel" + "[Destructive Action]" buttons
- Destructive button uses `--destructive` colour

**Loading States**
- Skeleton screens that match the shape of the content they replace
- No spinners (skeletons provide spatial context, spinners don't)
- Used on: tables, cards, stat cards, detail pages

**Empty States**
- Large Phosphor icon (Thin weight, 64px)
- Short message: "No assets registered yet"
- CTA button: "Register your first asset"
- Centred in the content area

---

## 6. Responsive Strategy

### 6.1 Breakpoints

| Token | Width | Tailwind | Description |
|-------|-------|----------|-------------|
| `mobile` | < 640px | Default (no prefix) | Phones in portrait. The baseline. |
| `sm` | >= 640px | `sm:` | Large phones, small tablets |
| `md` | >= 768px | `md:` | Tablets in portrait |
| `lg` | >= 1024px | `lg:` | Tablets in landscape, small laptops |
| `xl` | >= 1280px | `xl:` | Desktops |

### 6.2 Layout Shifts by Component

| Component | Mobile (< 768px) | Tablet (768-1023px) | Desktop (>= 1024px) |
|-----------|-------------------|---------------------|----------------------|
| Navigation | Bottom tab bar (5 items) | Collapsed sidebar (icons only) | Expanded sidebar (icons + labels) |
| Dashboard KPIs | 1 column stack | 2x2 grid | 4-column row |
| Data tables | Card stack | Horizontal scroll table | Full table |
| Forms | Full width | Full width, max 640px | Centred, max 640px |
| Detail pages | Stacked sections | Stacked sections | 2-column (info + sidebar) |
| Dialogs | Full screen sheet | Centred modal | Centred modal |
| Page header | Title + icon action | Title + text action button | Title + breadcrumb + action button |

### 6.3 Mobile-First CSS Approach

All styles are written mobile-first. Desktop overrides use `md:`, `lg:`, `xl:` prefixes.

```tsx
// Example: Dashboard KPI grid
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
  {/* KPI cards */}
</div>

// Example: Data table / card toggle
<div className="block md:hidden">
  <CardStack items={assets} />
</div>
<div className="hidden md:block">
  <DataTable columns={columns} data={assets} />
</div>
```

---

## 7. Interaction Patterns

### 7.1 Touch Targets
All interactive elements have a minimum touch target of 44x44px on mobile (WCAG 2.5.5). This applies to:
- Buttons
- Table rows
- Navigation items
- Form inputs
- Badge links
- Card tap areas

### 7.2 Progressive Disclosure
Secondary information is hidden behind tabs or expandable sections. Examples:
- Asset detail: Info tab (default) | Sessions tab | Issues tab
- Person detail: Profile tab (default) | Usage History tab
- Dashboard: KPIs visible first, activity feed below the fold

### 7.3 Optimistic UI
Check-out and check-in actions update the UI immediately before the server confirms. This makes the 30-second check-out target achievable even on slow connections. If the server returns an error, the UI reverts and shows an error toast.

### 7.4 Search Behaviour
- Debounced at 300ms
- Minimum 2 characters to trigger
- Results displayed as a dropdown list for entity selection (person, asset)
- Results displayed inline for list filtering
- Clear button to reset search

---

## 8. Accessibility Standards

### 8.1 WCAG 2.1 AA Compliance

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 Non-text Content | All images have alt text | `alt` prop on all `<Image>` components |
| 1.3.1 Info and Relationships | Structure conveyed through markup | Semantic HTML: `<nav>`, `<main>`, `<section>`, `<table>`, `<form>` |
| 1.4.3 Contrast (Minimum) | 4.5:1 for normal text, 3:1 for large text | Verified for all colour combinations in both light and dark mode |
| 2.1.1 Keyboard | All functionality via keyboard | Tab order follows visual order. All actions reachable. |
| 2.4.1 Bypass Blocks | Skip to main content | Skip link as first focusable element |
| 2.4.7 Focus Visible | Focus indicator on all elements | Tailwind `ring` utilities. Never `outline-none` without replacement. |
| 3.3.1 Error Identification | Errors identified and described | Inline form errors below fields. `aria-describedby` linking. |
| 3.3.2 Labels or Instructions | All inputs have labels | `<label>` elements with `htmlFor`. No placeholder-only inputs. |
| 4.1.2 Name, Role, Value | Custom components have ARIA roles | shadcn/ui components include ARIA by default. Custom components audited. |

### 8.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus forward |
| Shift+Tab | Move focus backward |
| Enter | Activate button / submit form / open link |
| Escape | Close dialog / dropdown / sheet |
| Arrow keys | Navigate within dropdown, table, tabs |
| Space | Toggle checkbox, activate button |

---

## 9. Animation and Motion

Minimal motion. Functional transitions only.

| Element | Transition | Duration | Easing |
|---------|-----------|----------|--------|
| Page transitions | None | — | — |
| Sidebar collapse | Width | 200ms | `ease-in-out` |
| Dropdown open/close | Opacity + scale | 150ms | `ease-out` |
| Toast enter/exit | Slide + opacity | 200ms | `ease-out` |
| Dialog overlay | Opacity | 150ms | `ease-out` |
| Skeleton pulse | Opacity | 1.5s loop | `ease-in-out` |

No decorative animations. No parallax. No hover scale effects. Motion is reduced for users with `prefers-reduced-motion: reduce`.

---

## Related Documents

- [Engineering Architecture](./engineering-architecture.md) — Component file structure, tech stack details
- [User Flows](./user-flow.md) — Screen inventory and interaction flows
- [Feature List](./feature-list.md) — What each component displays
- [Completion Checklist](./completion-checklist.md) — Design verification criteria
