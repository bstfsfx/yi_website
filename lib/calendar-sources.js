/**
 * Server-only calendar sources (imported by API routes, never by the client).
 *
 * Each online room points at an external platform .ics feed (Airbnb, Booking.com
 * or any iCal export). The URLs come from environment variables so real feeds are
 * never committed:
 *
 *   ICS_DOUBLE_URL=https://www.airbnb.com/calendar/ical/12345.ics?s=xxxx
 *   ICS_QUAD_URL=https://ical.booking.com/v1/export?t=xxxx
 *
 * When no URL is configured we fall back to a *generated demo feed* that is real
 * valid iCalendar text. This means the demo data travels through the exact same
 * `parseIcsToBookings()` parser as production data — no special-casing.
 */

import { pad2, todayStart, addDays } from './dates';

export const EXTERNAL_SOURCES = {
  double: process.env.ICS_DOUBLE_URL || null,
  quad: process.env.ICS_QUAD_URL || null,
};

const ICS_DATE = (d) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;

/**
 * Deterministic 32-bit hash so a given room always produces the same mock
 * bookings (stable across requests, SSR and cold starts).
 */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Tiny seeded PRNG (mulberry32). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a valid VCALENDAR string containing plausible booked ranges for a room.
 * Bookings start a few days in the past and run ~75 days into the future so the
 * grid always has something to show, whatever week the visitor browses.
 */
export function buildDemoIcs(roomId) {
  const rand = mulberry32(hashString(`tiantaiyi:${roomId}`));
  const origin = addDays(todayStart(), -9); // start slightly in the past
  const daysToCover = 100;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TIANTAIYI HOTEL//Demo Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${roomId}-demo`,
  ];

  let cursor = 0;
  let uid = 1;
  while (cursor < daysToCover) {
    // 1–3 free nights, then a 1–4 night booking (DTEND is exclusive checkout day).
    const gap = 1 + Math.floor(rand() * 3);
    const stay = 1 + Math.floor(rand() * 4);
    cursor += gap;
    if (cursor + stay > daysToCover) break;

    const start = addDays(origin, cursor);
    const end = addDays(start, stay);
    lines.push(
      'BEGIN:VEVENT',
      `UID:demo-${roomId}-${uid}@tiantaiyi.local`,
      `DTSTAMP:${ICS_DATE(origin)}T000000Z`,
      `SUMMARY:Reserved (${roomId})`,
      `DTSTART;VALUE=DATE:${ICS_DATE(start)}`,
      `DTEND;VALUE=DATE:${ICS_DATE(end)}`,
      'END:VEVENT',
    );
    uid += 1;
    cursor += stay;
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/** Resolve where a room's bookings should come from. */
export function resolveSource(roomId) {
  const url = EXTERNAL_SOURCES[roomId];
  if (url) return { type: 'remote', url, ics: null };
  return { type: 'demo', url: null, ics: buildDemoIcs(roomId) };
}