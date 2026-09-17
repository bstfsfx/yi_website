# Implementation Plan — 線上訂房 (Room Booking)

> Status: **delivered** (v1). This document is the plan of record: what was in
> scope, how it was sequenced, what shipped, and what is deliberately deferred.

---

## 1. Goal

Add a Traiwan-style room-booking experience to the 天台邑旅店 site:

- A weekly/monthly availability matrix where **rows = room types** and
  **columns = dates**.
- Availability driven by **external platform `.ics` calendars** (Airbnb et al.).
- A temporary reservation cart with a **5-minute hold countdown**.
- A responsive UI consistent with the existing site design.

The starting point was a **static HTML site** (`index.html`, `sales.html`, `media/`)
with no build tooling. The agreed approach was a full migration to Next.js so the
backend and frontend could ship together.

---

## 2. Scope

### In scope

| # | Deliverable |
| --- | --- |
| 1 | Migrate the site to Next.js (App Router) + Tailwind, preserving the design |
| 2 | `.ics` fetch + parse service and an HTTP API |
| 3 | Availability grid with four status badges |
| 4 | Week navigation (previous / next / today, 7- or 14-day window) |
| 5 | Reservation cart with a 5-minute hold countdown |
| 6 | Checkout / confirmation action |

### Out of scope (v1)

- Payment processing, deposits, or invoices.
- A database or user accounts — the cart is ephemeral and client-side.
- Server-enforced holds (see roadmap R1).
- Admin UI for editing rooms or overriding dates by hand.
- i18n beyond the existing Traditional Chinese copy.

---

## 3. Execution phases

### Phase 0 — Reconnaissance

- Mapped the existing site: 2 static HTML pages, inline CSS with a `:root` token set,
  `media/` images, Vercel static hosting, no framework.
- **Decision:** full Next.js migration (user-selected) rather than a CDN-React drop-in.

### Phase 1 — Project scaffold

- `package.json` with Next 15 / React 19 / `node-ical` / Tailwind 3; `next.config.mjs`,
  `tailwind.config.js`, `postcss.config.js`, `jsconfig.json` (`@/*` path alias).
- Copied `media/` → `public/media/`.
- **Decision:** keep the original site's semantic CSS classes in `app/globals.css`
  (low-risk design fidelity) and use Tailwind for all *new* booking components.

### Phase 2 — Site migration

- `app/layout.js` with shared `Header`/`Footer` and metadata.
- `components/Header.js` (mobile hamburger), `components/Footer.js`,
  `components/Carousel.js` (ported vanilla-JS carousel to a React client component).
- `app/page.js` ← `index.html`; `app/sales/page.js` ← `sales.html`.
- Added header/footer/CTA links to `/booking`.

### Phase 3 — Calendar service

- `lib/dates.js` — dependency-free `YYYY-MM-DD` key helpers, Monday weeks, night ranges.
- `lib/rooms.js` — client-safe room catalogue (4 rooms, `bookingMode`, pricing, phone).
- `lib/calendar-sources.js` — env-configured feed URLs + deterministic **demo feed
  generator** that emits valid VCALENDAR text.
- `lib/calendar.js` — `fetchIcs`, `parseIcsToBookings`, `priceForDate`,
  `resolveCellStatus`, `buildAvailability`, `unavailableDatesForUrl`.
- **Decision:** demo data flows through the real parser so the demo and production
  code paths are identical.

### Phase 4 — API

- `app/api/sync-calendar/route.js`:
  - `GET ?from&to` → availability matrix.
  - `GET ?url=` / `POST {url}` → ad-hoc external parse returning `unavailableDates[]`.
  - URL validation (protocol + private-host block), 120-day window cap, JSON errors.
  - `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.

### Phase 5 — Booking UI

- `useAvailability` (window + fetch) and `useHolds` (cart + single countdown interval).
- `BookingGrid` (CSS grid, sticky room column, horizontal scroll on mobile).
- `BookingCell` (4 statuses + held state, `tel:` link for 請電話訂房).
- `WeekNavigator`, `StatusLegend`, `ReservationCart`, `CheckoutModal`.
- `app/booking/page.js` wires the hooks to the components and surfaces sync errors.

### Phase 6 — Verification

- `npm run build` passes.
- API smoke tests: all four statuses present, weekend surcharge, POST/GET external
  parsing against public `.ics` files, validation + SSRF guards, date-only parsing
  verified under `TZ=UTC`.

---

## 4. File manifest (new / changed)

| File | Status | Purpose |
| --- | --- | --- |
| `package.json`, `next.config.mjs`, `tailwind.config.js`, `postcss.config.js`, `jsconfig.json`, `.gitignore` | new | Next.js + Tailwind toolchain |
| `app/layout.js`, `app/globals.css` | new | Shell + design tokens |
| `app/page.js`, `app/sales/page.js` | new | Migrated marketing pages |
| `components/Header.js`, `Footer.js`, `Carousel.js` | new | Shared chrome |
| `app/booking/page.js` | new | Booking orchestrator |
| `components/booking/*` (9 files) | new | Grid, cell, nav, cart, modal, hooks |
| `lib/rooms.js`, `dates.js`, `format.js` | new | Shared client-safe modules |
| `lib/calendar.js`, `calendar-sources.js` | new | Server-only `.ics` service |
| `app/api/sync-calendar/route.js` | new | HTTP API |
| `.env.example` | new | Feed URL configuration |
| `public/media/*` | copied | Served image assets |
| `index.html`, `sales.html`, `media/` | unchanged | Left in place; superseded |

---

## 5. Key decisions & trade-offs

| Decision | Rationale | Trade-off |
| --- | --- | --- |
| Full Next.js migration | One deploy unit for API + UI | Heavier than a static drop-in |
| `node-ical` over `ical.js` | Simpler `parseICS` API, handles `VALUE=DATE` | Adds a server dependency |
| Server owns all status logic | Grid and feed can never disagree | Any rule change needs a deploy |
| Demo feed through the real parser | Demo exercises production code | Slightly more code than hard-coded dates |
| Client-only holds | No DB required for v1 | Not race-safe across visitors (R1) |
| In-memory 10-min cache | Zero infra | Per-instance; resets on cold start (R2) |
| Keep legacy CSS + Tailwind for new UI | Design fidelity, smaller diff | Two styling idioms coexist |
| `DTEND` exclusive | Matches iCal and hotel checkout | Must be documented for maintainers |

---

## 6. Roadmap (post-v1)

| ID | Item | Notes |
| --- | --- | --- |
| R1 | **Server-enforced holds** | Persist holds in KV/Redis with a 5-min TTL; reject double holds with `409`. |
| R2 | **Durable feed cache / scheduled sync** | Vercel Cron + KV, or a `revalidate`-tagged fetch, so all instances share one snapshot. |
| R3 | **Real checkout** | Guest details form, payment provider, confirmation email/LINE. |
| R4 | **Admin availability editor** | Manual blocks (`closed` dates) and price overrides per room/date. |
| R5 | **Multi-unit inventory** | `totalUnits` is display-only today; make availability per physical unit. |
| R6 | **Observability** | Structured logs for feed fetch failures + a health endpoint per feed. |
| R7 | **Tests** | Unit tests for `parseIcsToBookings` / `resolveCellStatus`; Playwright for the grid + timer. |
| R8 | **Remove legacy files** | Delete root `index.html`, `sales.html`, and `media/` once redirects are confirmed. |
