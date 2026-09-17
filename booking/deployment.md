# Deployment — 線上訂房 (Room Booking)

Target platform: **Vercel** (the project is already Vercel-managed). The app is a
standard Next.js 15 App Router project — one deployment serves both the marketing
pages and the booking API.

---

## 1. Prerequisites

| Requirement | Version / note |
| --- | --- |
| Node.js | 20 LTS or 22 (developed on 22.23.1) |
| npm | 10+ |
| Vercel account | Free/Hobby tier is sufficient |
| `.ics` feed URLs | One per online room (see §3) |

---

## 2. Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build (must pass before deploying) |
| `npm run start` | Serve the production build locally |

Useful URLs:

- `/` — homepage
- `/sales` — sales page
- `/booking` — availability grid
- `/api/sync-calendar?from=2026-10-05&to=2026-10-11` — availability JSON
- `/api/sync-calendar?url=<public .ics>` — ad-hoc external parse

> Localhost URLs are intentionally blocked by the API's SSRF guard, so to test the
> ad-hoc `?url=` mode point it at a **public** `.ics` file, not a local one.

---

## 3. Environment variables

Copy `.env.example` → `.env.local` for development:

```bash
ICS_DOUBLE_URL=https://www.airbnb.com/calendar/ical/12345678.ics?s=xxxxxxxx
ICS_QUAD_URL=https://ical.booking.com/v1/export?t=xxxxxxxx
```

| Variable | Required | Behaviour when unset |
| --- | --- | --- |
| `ICS_DOUBLE_URL` | no | 雙人房 uses the generated demo feed (labelled 示範) |
| `ICS_QUAD_URL` | no | 四人房 uses the generated demo feed (labelled 示範) |

Notes:

- These are **server-only**. `lib/calendar-sources.js` is imported exclusively by API
  routes, so the URLs never enter the client bundle. Do **not** prefix them with
  `NEXT_PUBLIC_`.
- The remaining rooms (`family`, `whole`) are rule-driven (`call` / `closed`) and need
  no feed.
- Changing a variable requires a redeploy (Vercel injects env at build/runtime).

---

## 4. Deploy to Vercel

### Option A — Git integration (recommended)

1. Push the repository to GitHub/GitLab/Bitbucket.
2. In Vercel: **Add New → Project → Import** the repo.
3. Vercel auto-detects the framework. Confirm:
   - **Framework preset:** Next.js
   - **Build command:** `next build` (default)
   - **Output:** `.next` (default)
   - **Install command:** `npm install` (default)
   - **Root directory:** repository root
4. Add the environment variables from §3 (Production **and** Preview).
5. **Deploy.** Every push to the production branch redeploys; PRs get preview URLs.

### Option B — CLI

```bash
npm i -g vercel        # or use the local devDependency: npx vercel
vercel link            # link the local folder to a Vercel project
vercel env add ICS_DOUBLE_URL production
vercel env add ICS_QUAD_URL production
vercel --prod          # production deploy
```

### Pre-deploy checklist

```bash
npm run build          # must exit 0
```

- [ ] `npm run build` passes locally.
- [ ] `.env.local` is **not** committed (already covered by `.gitignore`).
- [ ] Env vars set for Production and Preview.
- [ ] A known-good `.ics` URL returns `BEGIN:VCALENDAR`.

---

## 5. Build & runtime characteristics

| Item | Value |
| --- | --- |
| Routes | `/`, `/sales` prerendered static; `/booking` static shell + client fetch; `/api/sync-calendar` dynamic |
| API runtime | Node.js (`export const runtime = 'nodejs'`) — required by `node-ical` |
| Caching | `dynamic = 'force-dynamic'`; responses are not CDN-cached |
| Function timeout | Default (Hobby ≈ 10 s). Feed fetch is capped at 8 s + one retry, so a slow feed can approach the limit — monitor and consider Pro's longer timeout |
| Region | Place functions close to the audience (Taipei) where available |

---

## 6. Caching in a serverless environment

`lib/calendar.js` caches each parsed feed **in process memory for 10 minutes**. On
Vercel this means:

- The cache is **per instance** — different cold instances re-fetch independently.
- The cache is lost on every cold start.
- Traffic spikes can cause several concurrent fetches of the same feed.

This is acceptable for a small property. For durable, shared caching choose one:

**a) Vercel KV / Redis (recommended for scale)**

```js
// lib/calendar.js — replace the in-memory Map with KV
await kv.set(`ics:${url}`, bookings, { ex: 600 });
```

**b) Scheduled sync (Vercel Cron)**

Add a cron that refreshes feeds and stores the result, so page requests only read:

```json
// vercel.json
{ "crons": [{ "path": "/api/cron/sync-calendars", "schedule": "*/10 * * * *" }] }
```

> Vercel Cron requires a paid plan on some tiers; verify current limits.

**c) HTTP caching** — if a shared cache is unavailable, at minimum keep
`cache: 'no-store'` on the upstream fetch (already set) and rely on the in-memory TTL.

---

## 7. Custom domain

1. Vercel project → **Settings → Domains → Add**.
2. Point the registrar at Vercel's nameservers, or add the shown `A`/`CNAME` records.
3. Wait for TLS provisioning (automatic, via Let's Encrypt).
4. If the old static site is still live elsewhere, add 301 redirects for
   `/index.html` → `/` and `/sales.html` → `/sales`.

---

## 8. Post-deploy verification

```bash
BASE=https://<your-domain>

# 1. Pages respond
curl -s -o /dev/null -w "%{http_code}  /\n"        $BASE/
curl -s -o /dev/null -w "%{http_code}  /sales\n"   $BASE/sales
curl -s -o /dev/null -w "%{http_code}  /booking\n" $BASE/booking

# 2. Availability API returns all four statuses
curl -s "$BASE/api/sync-calendar?from=2026-10-05&to=2026-10-11" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);
    const s=new Set();j.rooms.forEach(r=>r.cells.forEach(c=>s.add(c.status)));
    console.log('ok:',j.ok,'statuses:',[...s].join(','),'errors:',j.errors.length);})"

# 3. External mode against a public feed
curl -s "$BASE/api/sync-calendar?url=https://raw.githubusercontent.com/jens-maus/node-ical/master/examples/example-rrule.ics" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);
    console.log('ok:',j.ok,'count:',j.count,'dates:',JSON.stringify(j.unavailableDates));})"

# 4. Guards
curl -s "$BASE/api/sync-calendar?url=http://127.0.0.1/x.ics"   # expect: private host blocked
```

Manual smoke test in a browser at `/booking`:

- [ ] Grid shows four rooms × 7 columns.
- [ ] All badges appear: 可訂房 (with NT$), 已客滿, 請電話訂房, 未開放.
- [ ] 上一週 / 下一週 / 回到本週 shift the window and reload data.
- [ ] 一週 / 雙週 toggle changes column count.
- [ ] Clicking 可訂房 adds a 預訂中 item with a counting-down timer.
- [ ] Cart total updates; ✕ removes a hold.
- [ ] Let a hold expire → it disappears and the cell returns to 可訂房.
- [ ] 前往結帳 → confirm → a reservation code is shown.
- [ ] Mobile width: grid scrolls horizontally, room column stays sticky.

---

## 9. Monitoring & logs

- **Runtime logs:** Vercel → Project → **Logs/Deployments**. Filter for
  `ICS fetch failed`, `timed out`, or the `errors[]` payload.
- **Feed health:** periodically hit `/api/sync-calendar?from=&to=` and assert
  `ok === true` and `errors.length === 0` (uptime monitor / cron health check).
- **Alerts:** add an external monitor (e.g. Better Stack, UptimeRobot) on `/booking`
  returning 200 and on the availability API returning `ok: true`.

---

## 10. Rollback

Vercel keeps every deployment immutable:

1. **Deployments → … → Promote to Production** on the last good build, or
2. `git revert <sha> && git push`, or
3. CLI: `vercel rollback`.

Because availability is derived at request time, rolling back the app does not touch
any data — only the code and env vars change.

---

## 11. Security checklist

- [ ] Feed URLs only in env vars; never `NEXT_PUBLIC_`, never committed.
- [ ] `.gitignore` excludes `.env*.local` and `.vercel`.
- [ ] Confirm the API rejects non-`http(s)` schemes and private hosts (§8 step 4).
- [ ] If `/api/sync-calendar?url=` is exposed publicly, restrict it to known feed
      hosts or require a shared secret — the hostname blocklist is not full SSRF
      protection (no DNS pinning).
- [ ] Keep `node-ical` and Next.js patched; run `npm audit` on each release.
- [ ] No customer PII is stored by this feature in v1 (the cart is client-side only).

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Grid shows all 示範, no real bookings | `ICS_*_URL` unset or wrong environment | Set vars for the right environment, redeploy |
| Border shows 同步日曆時發生問題 | Upstream feed unreachable/invalid | Check the URL returns `BEGIN:VCALENDAR`; inspect logs |
| `502 ICS fetch failed (404)` | Bad feed URL | Re-copy the export link from the platform |
| `502 … not a valid iCalendar file` | URL returns HTML (login page) | Use the public iCal export URL, not the dashboard URL |
| Bookings off by one day | Feed uses `DATE-TIME` with an unexpected TZ | Verify `hotelDateKey` handling; prefer `VALUE=DATE` exports |
| Changes to a feed not visible | 10-min in-memory TTL | Click **⟳ 同步** after the TTL, or add scheduled sync (§6) |
| Build fails on Vercel but passes locally | Node version mismatch | Pin Node 20/22 in project settings |
| `Function timeout` | Slow feed + retry | Reduce `timeoutMs`, or raise the plan's function timeout |
| Old `index.html` still served | Static file deployed outside Next | Remove the root HTML files / add redirects |
