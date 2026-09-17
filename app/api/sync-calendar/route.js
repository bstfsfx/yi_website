/**
 * /api/sync-calendar
 *
 * Bridges external platform calendars (.ics) into the booking grid.
 *
 * ── GET /api/sync-calendar?from=YYYY-MM-DD&to=YYYY-MM-DD ──────────────────────
 *   Returns the full availability matrix for every room: each room carries a
 *   `cells[]` array of { dateKey, status, price } that the React grid renders.
 *   Bookings come from the configured room feeds (env) or the demo feed.
 *
 * ── GET /api/sync-calendar?url=<external .ics url>[&from&to] ──────────────────
 *   Ad-hoc sync: fetch an arbitrary Airbnb/Booking.com .ics URL, parse DTSTART /
 *   DTEND pairs and return the flat list of booked (unavailable) dates.
 *
 * ── POST /api/sync-calendar { "url": "...", "from": "...", "to": "..." } ──────
 *   Same as the ad-hoc GET, for clients that prefer sending a JSON body.
 *
 * Responses are JSON. External fetches are cached for 10 minutes (see
 * lib/calendar.js) so repeated grid navigation doesn't re-download every feed.
 */

import { NextResponse } from 'next/server';
import { buildAvailability, unavailableDatesForUrl } from '@/lib/calendar';
import { todayStart, addDays, toDateKey, fromDateKey, diffDays } from '@/lib/dates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_RANGE_DAYS = 120;

/** Only http(s) URLs pointing at public hosts are accepted. */
function validateIcsUrl(raw) {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, error: 'Only http(s) .ics URLs are supported' };
  }
  const host = parsed.hostname.toLowerCase();
  const blocked =
    host === 'localhost' ||
    host === '::1' ||
    host.endsWith('.local') ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (blocked) return { ok: false, error: 'Private/loopback hosts are not allowed' };
  return { ok: true, url: parsed.toString() };
}

function badRequest(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function handleExternalUrl(rawUrl, from, to) {
  const check = validateIcsUrl(rawUrl);
  if (!check.ok) return badRequest(check.error);

  try {
    const { bookings, unavailableDates } = await unavailableDatesForUrl(check.url);
    let dates = unavailableDates;
    if (from && to) dates = dates.filter((d) => d >= from && d <= to);

    return NextResponse.json({
      ok: true,
      mode: 'external',
      url: check.url,
      generatedAt: new Date().toISOString(),
      count: bookings.length,
      bookings,
      unavailableDates: dates,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, mode: 'external', error: err.message }, { status: 502 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  if (url) return handleExternalUrl(url, fromParam, toParam);

  // Default window: two weeks starting this Monday (matches the grid's default).
  const defaultFrom = toDateKey(todayStart());
  const from = fromParam || defaultFrom;
  const to = toParam || toDateKey(addDays(fromDateKey(from), 6));

  if (diffDays(fromDateKey(from), fromDateKey(to)) > MAX_RANGE_DAYS) {
    return badRequest(`Range too large (max ${MAX_RANGE_DAYS} days)`);
  }

  try {
    const availability = await buildAvailability({ fromKey: from, toKey: to });
    return NextResponse.json({ ok: true, mode: 'availability', ...availability });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Request body must be JSON');
  }

  if (!body?.url) return badRequest('Missing "url" field');

  if (body.url && !body.from && !body.to) {
    return handleExternalUrl(body.url, null, null);
  }
  return handleExternalUrl(body.url, body.from, body.to);
}
