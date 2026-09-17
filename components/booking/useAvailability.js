'use client';

import { useCallback, useEffect, useState } from 'react';
import { addDays, startOfWeek, toDateKey, todayStart } from '@/lib/dates';

/**
 * Fetches the availability matrix from /api/sync-calendar and keeps it in sync
 * with the visible week.
 *
 * ── UI state ← .ics state ─────────────────────────────────────────────────────
 * The server has already merged the parsed .ics bookings with the static room
 * rules into `cells[].status`. This hook simply stores that payload; the grid
 * never re-derives bookings, so the UI and the calendar feed can't disagree.
 */
export default function useAvailability(daysVisible = 7) {
  const [weekStartKey, setWeekStartKey] = useState(null);
  const [days, setDays] = useState(daysVisible);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Initialise the window on the client only (avoids SSR/client timezone drift).
  useEffect(() => {
    setWeekStartKey(toDateKey(startOfWeek(todayStart())));
  }, []);

  const load = useCallback(
    async (fromKey, signal) => {
      setLoading(true);
      setError(null);
      try {
        const toKey = toDateKey(addDays(new Date(`${fromKey}T00:00:00`), days - 1));
        const res = await fetch(`/api/sync-calendar?from=${fromKey}&to=${toKey}`, { signal, cache: 'no-store' });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error || '無法取得空房資料');
        setData(json);
        setLastSyncedAt(json.generatedAt);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [days],
  );

  useEffect(() => {
    if (!weekStartKey) return undefined;
    const controller = new AbortController();
    load(weekStartKey, controller.signal);
    return () => controller.abort();
  }, [weekStartKey, load]);

  const goToWeek = useCallback((offsetWeeks) => {
    setWeekStartKey((prev) => (prev ? toDateKey(addDays(new Date(`${prev}T00:00:00`), offsetWeeks * 7)) : prev));
  }, []);

  const goToToday = useCallback(() => {
    setWeekStartKey(toDateKey(startOfWeek(todayStart())));
  }, []);

  const refresh = useCallback(() => {
    if (weekStartKey) load(weekStartKey);
  }, [weekStartKey, load]);

  return {
    weekStartKey,
    days,
    setDays,
    data,
    loading,
    error,
    lastSyncedAt,
    goToWeek,
    goToToday,
    refresh,
  };
}
