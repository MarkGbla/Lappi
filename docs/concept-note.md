# Lappi — Concept Note

| Field | Detail |
|-------|--------|
| **Document** | Concept Note |
| **Product** | Lappi |
| **Version** | 1.0 |
| **Last Updated** | 2026-04-13 |
| **Status** | Approved |
| **Owner** | Christex Foundation |

---

## 1. Executive Summary

Lappi is a centralised asset and usage tracking system built for Christex Foundation. It gives staff a single place to register every electronic device the foundation owns, track who is using each device and why, report and resolve hardware issues, and generate usage data that demonstrates community impact.

Christex Foundation operates a 216 m² Innovation Hub at Fourah Bay College in Freetown, Sierra Leone. The hub runs 12-week development cohorts, hackathon bootcamps, community workshops, and open co-working sessions — all of which depend on a pool of 31-60+ electronic devices. Today there is no system of record for these assets. Lappi closes that gap.

The name "Lappi" is a working title for the platform. It is designed to be spoken aloud, typed quickly, and remembered easily by staff and community members.

---

## 2. Problem Statement

| Problem | Who It Affects | Current Workaround | Impact |
|---------|----------------|-------------------|--------|
| No inventory of devices | Leadership, staff | Mental notes, informal spreadsheets | Devices go missing without anyone noticing. No reliable count of working equipment. |
| No visibility into device condition | Staff, technicians | Devices are used until they fail visibly | Preventable damage escalates into costly replacements. Workshops disrupted by surprise failures. |
| No record of who uses what | Leadership, donors | Manual sign-in sheets (inconsistent) | Cannot measure community reach. Cannot identify heavy or at-risk users. |
| No structured way to report or track repairs | Staff, technicians | WhatsApp messages, verbal requests | Issues fall through the cracks. No repair history. No data on failure patterns. |
| No data for impact reporting | Leadership, donors (UNDP) | Anecdotal estimates | Funding proposals lack hard numbers. Quarterly reports are guesswork. |
| No system for staff equipment requests | Staff, leadership | Informal asks | Requests are forgotten. No prioritisation. No audit trail of approvals. |

---

## 3. Vision

Lappi turns Christex Foundation's Innovation Hub into a data-driven operation where every device is accounted for, every usage session is recorded with purpose, every hardware fault enters a visible repair pipeline, and every report writes itself from real data.

**One-line vision**: Know your tech. Track your impact.

---

## 4. Target Users

| User Type | Role in Lappi | Key Actions | Frequency |
|-----------|---------------|-------------|-----------|
| **Admin** | Full system control | Manage all assets and users. Approve tech requests. View analytics and reports. Configure system settings. | Daily |
| **Staff** | Operational user | Check devices in and out. Register community members. Report and resolve issues. Submit tech requests. | Multiple times daily |
| **Community Member** | Passive data subject | Does not log in. Represented in the system by name and phone number. Usage history is visible to staff. | N/A (staff-mediated) |

**Design implication**: Community members never create accounts or interact with the UI. Staff register them (name + phone) during check-out. This eliminates onboarding friction for walk-in community users while still building a usage profile over time.

---

## 5. Value Proposition

### For Christex Leadership (Colin Ogoo, Operations Lead)
- Real-time visibility into how many devices are working, in use, or need repair
- Donor-ready usage reports generated from actual session data
- Data-backed decisions on whether to repair or replace failing equipment
- Audit trail of every tech request and approval

### For Hub Staff (Coordinators, Instructors, Facilitators)
- Check out 15 laptops for a cohort session in under 2 minutes
- Report a broken keyboard in 30 seconds, not via a WhatsApp thread
- See which devices are available right now without walking to the storage room
- Request equipment formally and track the request to resolution

### For Partners and Donors (UNDP, Solana Foundation)
- Verified metrics: unique users, sessions by purpose, device utilisation rates
- Transparent impact data tied to real device usage, not estimates
- Evidence of responsible asset stewardship

---

## 6. Scope Boundaries

### What Lappi IS
- An internal asset management and usage tracking tool for Christex Foundation's Innovation Hub
- A device registry covering all electronic gadgets (laptops, desktops, tablets, projectors, phones, cameras, printers, networking gear)
- A check-out/check-in system for tracking who uses which device and why
- An issue tracker for hardware faults with assignment and resolution workflow
- A tech request system for staff to formally request equipment
- A reporting layer that turns usage data into actionable metrics

### What Lappi IS NOT
- A financial accounting or procurement system (it tracks devices, not budgets)
- A public-facing application (only staff and admins log in)
- A general inventory system for non-electronic items (furniture, supplies, etc.)
- A workshop scheduling or event management platform
- A communication tool (it does not replace WhatsApp or email for discussions)

---

## 7. Success Metrics

| KPI | Target | Measurement Method | Timeframe |
|-----|--------|--------------------|-----------|
| Asset registration completeness | 100% of electronic devices registered | Count of registered assets vs. physical audit | Within 2 weeks of launch |
| Check-out adoption | 90% of device loans recorded in Lappi | Spot-check sessions vs. physical usage | Within 1 month of launch |
| Issue reporting rate | All hardware faults logged in Lappi, zero WhatsApp-only reports | Staff survey + issue count vs. prior period | Within 1 month of launch |
| Average check-out time | Under 30 seconds per device | Measure time from "start check-out" to confirmation | Ongoing |
| Report generation | Quarterly usage reports generated from Lappi data | Leadership confirms reports used for UNDP meetings | First quarter after launch |
| Staff satisfaction | 80%+ of staff rate Lappi as easier than prior method | Anonymous staff survey | 3 months after launch |

---

## 8. Assumptions

- Christex Foundation has 31-60 electronic devices at the Innovation Hub, with potential to grow to 100+
- Staff have access to smartphones or tablets with internet connectivity (3G minimum)
- The foundation has at least one person capable of basic system administration (creating accounts, adding assets)
- Community members are comfortable giving their name and phone number to staff during check-out
- Internet connectivity at the hub is sufficient for a web application (intermittent connectivity is acceptable — the system should handle brief disconnections gracefully)

---

## 9. Constraints

| Constraint | Detail |
|------------|--------|
| **Budget** | $0 infrastructure cost. Must run entirely on free tiers (Vercel, NeonDB). |
| **Network** | 3G baseline in Freetown. Application must be performant on slow connections. |
| **Technical literacy** | Staff range from tech-savvy developers to non-technical coordinators. UI must be forgiving. |
| **Single tenant** | One instance for one organisation. No multi-tenancy required. |
| **Device diversity** | Staff access Lappi from phones, tablets, and laptops. Mobile-first responsive design is mandatory. |

---

## Related Documents

- [Product Requirements Document](./prd.md) — Detailed functional and non-functional requirements
- [Feature List](./feature-list.md) — Complete feature inventory by module and phase
- [User Flows](./user-flow.md) — Step-by-step workflows for all key actions
- [Engineering Architecture](./engineering-architecture.md) — Technical blueprint and database schema
- [Design Document](./design-doc.md) — Visual design system and component patterns
- [Implementation Plan](./implementation-plan.md) — Phased build sequence with milestones
- [Completion Checklist](./completion-checklist.md) — Definition of done and launch readiness criteria
