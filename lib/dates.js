/**
 * Small, dependency-free date helpers shared by the server (.ics parsing) and
 * the client (availability grid rendering).
 *
 * Convention used everywhere in the app:
 *   - A "date key" is a local calendar day formatted as `YYYY-MM-DD`.
 *   - A "night" is identified by the day it starts on.
 *   - Range end is EXCLUSIVE (matching iCal's DTEND semantics and hotel checkout).
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Convert a Date into a `YYYY-MM-DD` key.
 *
 * iCal `VALUE=DATE` values (all-day events, which is what Airbnb/Booking export)
 * are parsed by node-ical as UTC midnight, while `DATE-TIME` values carry a real
 * timezone. We therefore format date-only values from their UTC components and
 * date-time values from their local components so neither shifts a day.
 */
export function toDateKey(date, isDateOnly = false) {
  if (!date || Number.isNaN(date.getTime?.())) return null;
  const get = isDateOnly ? 'getUTC' : 'get';
  const y = date[`${get}FullYear`]();
  const m = date[`${get}Month`]() + 1;
  const d = date[`${get}Date`]();
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** Parse a `YYYY-MM-DD` key into a Date at local midnight. */
export function fromDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Add N days to a date, returning a new Date (local, DST-safe via calendar math). */
export function addDays(date, n) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + n);
  return next;
}

export function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, date.getDate());
}

/** Monday-based start of week. */
export function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  return addDays(d, -day);
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function diffDays(a, b) {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ub - ua) / MS_PER_DAY);
}

/** Inclusive list of date keys from `startKey` to `endKey`. */
export function eachDateKey(startKey, endKey) {
  const out = [];
  let cursor = fromDateKey(startKey);
  const end = fromDateKey(endKey);
  while (cursor <= end) {
    out.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return out;
}

/** All date keys in [start, endExclusive) — useful for expanding booking ranges. */
export function eachNightKey(start, endExclusive) {
  const keys = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const end = new Date(endExclusive.getFullYear(), endExclusive.getMonth(), endExclusive.getDate());
  while (cursor < end) {
    keys.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return keys;
}

export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

export function formatMonthDay(key) {
  const [, m, d] = key.split('-');
  return `${Number(m)}/${Number(d)}`;
}

export function formatChineseDate(key) {
  const [y, m, d] = key.split('-');
  return `${y}/${Number(m)}/${Number(d)}`;
}

export function formatWeekday(key) {
  const day = fromDateKey(key).getDay();
  return ['日', '一', '二', '三', '四', '五', '六'][day];
}

/** True when the given key is today (local time). */
export function isTodayKey(key) {
  return key === toDateKey(new Date());
}

/** Stable "today at local midnight" helper for SSR + client hydration safety. */
export function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}