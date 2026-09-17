/**
 * Server-only .ics sync + availability builder.
 *
 * ── How the .ics sync connects to the UI state ────────────────────────────────
 *
 *   external platform (.ics feed)
 *        │  fetchIcs()                HTTP GET, 8s timeout, no-store
 *        ▼
 *   raw iCalendar text
 *        │  parseIcsToBookings()      node-ical → VEVENTs → date ranges
 *        ▼
 *   [{ startKey, endKey, nights[] }]  ← DTEND is exclusive (checkout day is free)
 *        │  buildAvailability()        expand nights into a per-room Set
 *        ▼
 *   { rooms: [{ cells: [{ dateKey, status, price }] }] }
 *        │  GET /api/sync-calendar
 *        ▼
 *   React state (app/booking/page.js) → BookingGrid → BookingCell badges
 *
 * A status is decided in this priority order:
 *   1. room closed           → 未開放     (static business rule)
 *   2. date already passed   → 未開放
 *   3. date in booked Set    → 已客滿     (external .ics wins)
 *   4. room needs a phone    → 請電話訂房 (static business rule)
 *   5. otherwise             → 可訂房 + NT$ nightly rate
 */

import ical from 'node-ical';
import { ROOMS, ROOM_STATUS, HOTEL } from './rooms';
import { resolveSource } from './calendar-sources';
import { pad2, fromDateKey, eachNightKey, eachDateKey, toDateKey, todayStart } from './dates';

const TAIPEI_TZ = 'Asia/Taipei';
const taipeiDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: TAIPEI_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const CACHE_TTL_MS = 10 * 60 * 1000; // "periodic" refresh window

/** In-memory cache so we don't hammer the platform feed on every page view. */
const icsCache = new Map();

/** Format an iCal date as a `YYYY-MM-DD` key anchored to the hotel's timezone. */
function hotelDateKey(date, datetype) {
  if (!date || typeof date.getTime !== 'function' || Number.isNaN(date.getTime())) return null;
  // VALUE=DATE (Airbnb-style all-day events) are normalised by node-ical to
  // local midnight representing the literal calendar date -> read local parts.
  if (datetype === 'date') {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }
  // Real DATE-TIME values carry a timezone -> read them in Taipei wall-clock time.
  return taipeiDate.format(date);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch an external .ics feed with a hard timeout and one retry.
 * `cache: 'no-store'` is intentional: refresh is driven by our own TTL cache.
 */
export async function fetchIcs(url, { timeoutMs = 8000, retries = 1 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        cache: 'no-store',
        headers: {
          Accept: 'text/calendar, text/plain, */*',
          'User-Agent': 'TIANTAIYI-Booking/1.0 (+https://tiantaiyi.example)',
        },
      });
      if (!res.ok) throw new Error(`ICS fetch failed (${res.status} ${res.statusText})`);
      const text = await res.text();
      if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error('Response is not a valid iCalendar file');
      return text;
    } catch (err) {
      lastError = err.name === 'AbortError' ? new Error('ICS fetch timed out') : err;
      if (attempt < retries) await sleep(400);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

/**
 * Parse raw iCalendar text into booking ranges.
 * Returns `{ uid, summary, startKey, endKey, nights: string[] }` per VEVENT.
 * `nights` excludes the DTEND day (checkout) — iCal DTEND is exclusive.
 */
export function parseIcsToBookings(icsText, { sourceName = 'external' } = {}) {
  const parsed = ical.parseICS(icsText);
  const bookings = [];

  for (const key of Object.keys(parsed)) {
    const event = parsed[key];
    if (!event || event.type !== 'VEVENT') continue;
    if (!event.start || !event.end) continue;
    if (String(event.status || '').toUpperCase() === 'CANCELLED') continue;
    if (String(event.transparency || '').toUpperCase() === 'TRANSPARENT') continue;

    const startKey = hotelDateKey(event.start, event.datetype);
    const endKey = hotelDateKey(event.end, event.datetype);
    if (!startKey || !endKey || endKey <= startKey) continue;

    const nights = eachNightKey(fromDateKey(startKey), fromDateKey(endKey));
    bookings.push({
      uid: event.uid || key,
      summary: event.summary || 'Reserved',
      source: sourceName,
      startKey,
      endKey,
      nights,
    });
  }

  bookings.sort((a, b) => (a.startKey < b.startKey ? -1 : 1));
  return bookings;
}

/** Fetch + parse with a TTL cache (remote feeds only). */
async function loadBookings(roomId) {
  const source = resolveSource(roomId);

  if (source.type === 'demo') {
    return { source: 'demo', url: null, bookings: parseIcsToBookings(source.ics, { sourceName: 'demo' }) };
  }

  const cacheKey = `remote:${source.url}`;
  const cached = icsCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { source: 'remote', url: source.url, bookings: cached.bookings, cached: true };
  }

  const text = await fetchIcs(source.url);
  const bookings = parseIcsToBookings(text, { sourceName: 'remote' });
  icsCache.set(cacheKey, { fetchedAt: Date.now(), bookings });
  return { source: 'remote', url: source.url, bookings, cached: false };
}

const WEEKEND_SURCHARGE = 500;

/** Nightly rate, with a flat surcharge on Friday & Saturday nights. */
export function priceForDate(room, dateKey) {
  const weekday = fromDateKey(dateKey).getDay(); // 5 = Fri, 6 = Sat
  return room.price + (weekday === 5 || weekday === 6 ? WEEKEND_SURCHARGE : 0);
}

/** Decide the UI status for one room on one date. */
export function resolveCellStatus({ room, dateKey, bookedSet, todayKey }) {
  if (room.bookingMode === 'closed') {
    return { status: ROOM_STATUS.CLOSED, price: null, note: '未開放訂房' };
  }
  if (dateKey < todayKey) {
    return { status: ROOM_STATUS.CLOSED, price: null, note: '已過去' };
  }
  if (bookedSet.has(dateKey)) {
    return { status: ROOM_STATUS.BOOKED, price: null, note: '已客滿' };
  }
  if (room.bookingMode === 'call') {
    return { status: ROOM_STATUS.CALL, price: room.price, note: `請來電 ${room.phone || HOTEL.phone}` };
  }
  return { status: ROOM_STATUS.AVAILABLE, price: priceForDate(room, dateKey), note: null };
}

/**
 * Build the full availability matrix for every room across [fromKey, toKey].
 * This is the single payload the booking grid renders from.
 */
export async function buildAvailability({ fromKey, toKey, roomIds }) {
  const rooms = roomIds?.length ? ROOMS.filter((r) => roomIds.includes(r.id)) : ROOMS;
  const dateKeys = eachDateKey(fromKey, toKey);
  const todayKey = toDateKey(todayStart());

  const result = [];
  const errors = [];

  for (const room of rooms) {
    let bookings = [];
    let source = 'demo';
    let cached = false;

    try {
      const loaded = await loadBookings(room.id);
      bookings = loaded.bookings;
      source = loaded.source;
      cached = Boolean(loaded.cached);
    } catch (err) {
      // A broken external feed must not take the whole grid down: fall back to
      // "everything available" and surface the error to the UI instead.
      errors.push({ roomId: room.id, message: err.message });
    }

    const bookedSet = new Set(bookings.flatMap((b) => b.nights));
    const cells = dateKeys.map((dateKey) => {
      const { status, price, note } = resolveCellStatus({ room, dateKey, bookedSet, todayKey });
      return { dateKey, status, price, note };
    });

    result.push({
      roomId: room.id,
      roomName: room.name,
      source,
      cached,
      bookings: bookings.filter((b) => b.endKey > fromKey && b.startKey <= toKey),
      cells,
    });
  }

  return { fromKey, toKey, dates: dateKeys, generatedAt: new Date().toISOString(), rooms: result, errors };
}

/** Convenience: just the booked/unavailable date list for one external feed. */
export async function unavailableDatesForUrl(url) {
  const text = await fetchIcs(url);
  const bookings = parseIcsToBookings(text, { sourceName: 'external' });
  const nights = [...new Set(bookings.flatMap((b) => b.nights))].sort();
  return { bookings, unavailableDates: nights };
}
