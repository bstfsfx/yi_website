# Architecture — 線上訂房 (Room Booking)

> Scope: the availability grid (`/booking`), the `.ics` calendar sync, the
> reservation cart / hold timer, and the HTTP API that connects them.

---

## 1. Overview

The booking feature is a vertical slice of the Next.js app built from three layers:

| Layer | Location | Responsibility |
| --- | --- | --- |
| Presentation | `app/booking/`, `components/booking/` | Availability matrix, week navigation, cart + countdown, checkout |
| API | `app/api/sync-calendar/route.js` | HTTP boundary; validates input, shapes JSON responses |
| Integration | `lib/calendar.js`, `lib/calendar-sources.js` | Fetch + parse external `.ics` feeds, merge with business rules |

Two shared, dependency-free modules (`lib/dates.js`, `lib/rooms.js`) are imported by
**both** the browser and the server so date math and room config can never drift.

---

## 2. Tech stack

| Concern | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | 15.5.25 |
| UI runtime | React | 19.3.0 |
| Styling | Tailwind CSS + CSS custom properties | 3.4.19 |
| iCalendar parsing | `node-ical` | 0.19.0 |
| Hosting | Vercel (Node.js runtime) | — |

No state-management library, no ORM, no database. Availability is derived on demand
from the platform feeds; the cart is ephemeral client state.

---

## 3. Directory map

```
app/
  layout.js                     Root layout — shared Header/Footer + metadata
  globals.css                   Design tokens + legacy site CSS (Tailwind layers)
  page.js                       /            Homepage (migrated from index.html)
  sales/page.js                 /sales       Sales page (migrated from sales.html)
  booking/page.js               /booking     ★ Booking grid orchestrator (client)
  api/sync-calendar/route.js    /api/sync-calendar  ★ GET + POST handler

components/
  Header.js  Footer.js  Carousel.js
  booking/
    BookingGrid.js              Matrix layout, sticky first column
    BookingCell.js              One room × date badge (4 states + held)
    WeekNavigator.js            Window shifting (7 / 14 days), sync button
    StatusLegend.js             Badge key
    ReservationCart.js          Hold list, totals, checkout button
    CheckoutModal.js            Review → confirmation (2 steps)
    useAvailability.js          Fetches/parses the API payload into state
    useHolds.js                 Cart state + single 5-min countdown timer

lib/
  rooms.js                      Client-safe room catalogue + status enum
  dates.js                      Date-key helpers (YYYY-MM-DD, Monday weeks)
  format.js                     NT$ / countdown formatting
  calendar.js                   ★ SERVER ONLY — .ics fetch/parse + availability
  calendar-sources.js           ★ SERVER ONLY — env feed URLs + demo feed generator
```

★ = the two ends of the `.ics → UI` pipeline.

---

## 4. System diagram

```mermaid
flowchart LR
  subgraph Platform["External platforms"]
    A["Airbnb .ics feed"]
    B["Booking.com .ics feed"]
  end

  subgraph Server["Next.js server (Node.js runtime)"]
    SRC["lib/calendar-sources.js<br/>resolveSource(roomId)"]
    FETCH["fetchIcs(url)<br/>8s timeout · 1 retry · TTL cache"]
    PARSE["parseIcsToBookings(text)<br/>node-ical → VEVENT → nights[]"]
    BUILD["buildAvailability()<br/>merge .ics + business rules"]
    API["GET/POST /api/sync-calendar"]
    SRC --> FETCH --> PARSE --> BUILD --> API
  end

  subgraph Client["Browser"]
    HOOK["useAvailability()"]
    GRID["BookingGrid → BookingCell"]
    HOLDS["useHolds()<br/>5-min hold timer"]
    CART["ReservationCart → CheckoutModal"]
    HOOK --> GRID
    GRID --> HOLDS --> CART
  end

  A --> SRC
  B --> SRC
  API -->|JSON cells[].status| HOOK
```

---

## 5. Request lifecycle

**A. Grid load / week change**

1. `useAvailability` computes the window (`weekStartKey` … `+days-1`).
2. `GET /api/sync-calendar?from=&to=` is issued (`cache: 'no-store'`).
3. The route calls `buildAvailability({ fromKey, toKey })`.
4. For each room, `loadBookings(roomId)` resolves a source:
   - **remote** — fetch the `.ics`, parse, and memoise for 10 minutes.
   - **demo** — generate a valid VCALENDAR string and run it through the *same*
     parser (no special-casing).
5. Booked nights are expanded into a `Set<string>` of `YYYY-MM-DD` keys.
6. `resolveCellStatus()` assigns each date a status; the result is the JSON payload.
7. React stores the payload; `BookingGrid` renders one `BookingCell` per cell.
8. Selecting an available cell adds a hold to `useHolds` and starts its countdown.

**B. Ad-hoc external sync**

`GET /api/sync-calendar?url=<ics>` (or `POST { "url": ... }`) skips room merging and
returns a flat `unavailableDates[]` list plus the raw booking ranges.

---

## 6. Status resolution rules

The API owns all availability logic — the UI never re-derives it. Priority order
(`lib/calendar.js` → `resolveCellStatus`):

| # | Condition | Status | Badge | Clickable |
| --- | --- | --- | --- | --- |
| 1 | Room `bookingMode === 'closed'` | `closed` | 未開放 | no |
| 2 | `dateKey < todayKey` | `closed` | 未開放 / 已過去 | no |
| 3 | Date ∈ booked set (from `.ics`) | `booked` | 已客滿 | no |
| 4 | Room `bookingMode === 'call'` | `call` | 請電話訂房 + `tel:` | link |
| 5 | Otherwise | `available` | NT$ rate + 可訂房 | yes |

The external `.ics` feed always wins over the static `call` rule (rule 3 before 4),
so a phone-only room still shows 已客滿 for dates that are genuinely taken.

**Pricing:** `priceForDate()` returns `room.price`, plus a flat NT$500 surcharge on
Friday and Saturday nights. `price` is `null` for non-bookable states.

**v1 hold state:** `held` is *client-only*. It is not persisted server-side, so two
visitors can hold the same cell simultaneously. See §11 for the persistence path.

---

## 7. API reference

### `GET /api/sync-calendar` (availability matrix)

| Query | Required | Default | Notes |
| --- | --- | --- | --- |
| `from` | no | today | `YYYY-MM-DD` |
| `to` | no | `from + 6d` | max window 120 days |
| `url` | no | — | switches to ad-hoc external mode |

```json
{
  "ok": true,
  "mode": "availability",
  "fromKey": "2026-10-05",
  "toKey": "2026-10-11",
  "dates": ["2026-10-05", "2026-10-06"],
  "generatedAt": "2026-09-17T09:00:00.000Z",
  "rooms": [
    {
      "roomId": "double",
      "roomName": "雙人房",
      "source": "remote",
      "cached": false,
      "bookings": [
        { "uid": "…", "summary": "Reserved", "source": "remote",
          "startKey": "2026-10-07", "endKey": "2026-10-09",
          "nights": ["2026-10-07", "2026-10-08"] }
      ],
      "cells": [
        { "dateKey": "2026-10-05", "status": "available", "price": 2000, "note": null }
      ]
    }
  ],
  "errors": []
}
```

### `GET /api/sync-calendar?url=<ics>` / `POST /api/sync-calendar`

```json
{
  "ok": true,
  "mode": "external",
  "url": "https://www.airbnb.com/calendar/ical/….ics",
  "generatedAt": "2026-09-17T09:00:00.000Z",
  "count": 12,
  "bookings": [ /* same shape as above */ ],
  "unavailableDates": ["2026-10-07", "2026-10-08"]
}
```

### Errors

| Status | When | Body |
| --- | --- | --- |
| 400 | Missing/invalid URL, bad JSON, window > 120d | `{ "ok": false, "error": "…" }` |
| 500 | Unexpected build failure | `{ "ok": false, "error": "…" }` |
| 502 | Upstream `.ics` fetch failed | `{ "ok": false, "mode": "external", "error": "…" }` |

---

## 8. Data model

```ts
type Status = 'available' | 'booked' | 'call' | 'closed';

interface Cell   { dateKey: string; status: Status; price: number | null; note: string | null; }
interface Booking{ uid: string; summary: string; source: 'remote'|'demo'|'external';
                   startKey: string; endKey: string; nights: string[]; }   // endKey exclusive
interface Room   { id: string; name: string; enName: string; capacity: number;
                   totalUnits: number; price: number; bookingMode: 'online'|'call'|'closed';
                   image: string; phone?: string; phoneHref?: string; }
interface Hold   { key: string; roomId: string; roomName: string; dateKey: string;
                   price: number; addedAt: number; expiresAt: number; }
```

Date keys are always **local calendar days** (`YYYY-MM-DD`) and a *night* is
identified by its start day. `DTEND` is exclusive (iCal semantics), so the checkout
day remains bookable.

---

## 9. Frontend state

### `useAvailability(days)`

Owns the server payload and window position.

```
weekStartKey ─┬─> fetch /api/sync-calendar ──> data { dates, rooms[].cells[] }
days ─────────┘
```

- Window is initialised **after mount** (`useEffect`) to avoid SSR/client timezone drift.
- Exposes `goToWeek(±1)`, `goToToday()`, `refresh()`, `loading`, `error`, `lastSyncedAt`.

### `useHolds(holdSeconds = 300)`

Owns the cart and one interval for the whole cart (not one per item).

```
addHold / toggleHold ──> holds[] ──> interval(1s) ──> now
                                      └─ expire: holds with expiresAt <= now are dropped
                                         and reported via expiredNotice
```

- A hold key is `${roomId}:${dateKey}`.
- `BookingCell` renders 預訂中 with `remainingSeconds(hold)` when a hold exists.
- Expiry drives the toast in `app/booking/page.js`; the grid cell flips back to 可訂房.

---

## 10. Timezone handling

`.ics` date-only values (`DTSTART;VALUE=DATE`, what Airbnb exports) are normalised by
`node-ical` to local midnight of the literal calendar date — so local getters are
used and the date never shifts, on any server timezone. Real `DATE-TIME` values carry
a timezone and are formatted in **`Asia/Taipei`** via `Intl.DateTimeFormat`. This is
why `hotelDateKey()` branches on `event.datetype`.

---

## 11. Caching, performance, limits

| Concern | Behaviour |
| --- | --- |
| Feed caching | In-memory `Map`, 10-minute TTL, keyed by feed URL |
| Concurrent readers | Fetch is not de-duplicated; a cold cache with N simultaneous requests may fetch N times |
| Fetch timeout | 8 s, one retry, `cache: 'no-store'` |
| Max window | 120 days per request |
| Failure isolation | A broken feed degrades that room only and adds to `errors[]` |

**Known limitation:** the cache lives in the serverless instance's memory, so it is
per-instance and evaporates on cold start. For durable, global caching move the cache
to Vercel KV/Redis or a scheduled job (see `deployment.md` §6).

---

## 12. Security

- **URL validation** — only `http:`/`https:`, with `localhost`, `::1`, `.local`,
  `127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.0.0/16`, and
  `172.16.0.0/12` blocked. This is a first line of defence, not complete SSRF
  protection (no DNS pinning); lock the endpoint to known hosts if it is public.
- **Secrets** — feed URLs live in environment variables, never in the client bundle
  or the repo. Only `lib/rooms.js` (display data) reaches the browser; `lib/calendar*`
  is server-only.
- **Response validation** — upstream bodies must contain `BEGIN:VCALENDAR` before parsing.

---

## 13. Degradation model

| Failure | Result |
| --- | --- |
| One room's feed unreachable | That room renders all-available; `errors[]` populated; banner shown with retry |
| Invalid `.ics` body | Fetch throws, treated as the above |
| Whole availability build fails | `500`; page keeps the previous payload and offers retry |
| Demo mode (no env URLs) | Generated feed parsed through the real pipeline; row tagged 示範 |
