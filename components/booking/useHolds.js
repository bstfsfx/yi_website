'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HOLD_SECONDS } from '@/lib/rooms';

/**
 * Temporary reservation cart with a countdown hold.
 *
 * Why: two visitors can be looking at the same "available" cell. When one clicks
 * it we place a short hold ("预訂中") so the other visitor sees it as held too.
 * If checkout isn't completed before `expiresAt`, the hold is released and the
 * cell returns to "available".
 *
 * The countdown is driven by a single 1s interval for the whole cart rather than
 * one timer per item.
 */
export default function useHolds(holdSeconds = HOLD_SECONDS) {
  const [holds, setHolds] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [expiredNotice, setExpiredNotice] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Release any hold whose countdown reached zero and surface a notice.
  useEffect(() => {
    const expired = holds.filter((h) => h.expiresAt <= now);
    if (expired.length > 0) {
      setHolds((prev) => prev.filter((h) => h.expiresAt > now));
      setExpiredNotice({ items: expired, at: now });
    }
  }, [now, holds]);

  const addHold = useCallback(
    (item) => {
      setExpiredNotice(null);
      setHolds((prev) => {
        const key = `${item.roomId}:${item.dateKey}`;
        if (prev.some((h) => h.key === key)) return prev;
        const addedAt = Date.now();
        return [
          ...prev,
          { ...item, key, addedAt, expiresAt: addedAt + holdSeconds * 1000 },
        ];
      });
    },
    [holdSeconds],
  );

  const removeHold = useCallback((key) => {
    setHolds((prev) => prev.filter((h) => h.key !== key));
  }, []);

  const clearHolds = useCallback(() => {
    setHolds([]);
    setExpiredNotice(null);
  }, []);

  const toggleHold = useCallback(
    (item) => {
      const key = `${item.roomId}:${item.dateKey}`;
      setHolds((prev) => {
        if (prev.some((h) => h.key === key)) return prev.filter((h) => h.key !== key);
        const addedAt = Date.now();
        return [...prev, { ...item, key, addedAt, expiresAt: addedAt + holdSeconds * 1000 }];
      });
    },
    [holdSeconds],
  );

  const findHold = useCallback((roomId, dateKey) => holds.find((h) => h.key === `${roomId}:${dateKey}`) || null, [holds]);

  const isHeld = useCallback((roomId, dateKey) => holds.some((h) => h.key === `${roomId}:${dateKey}`), [holds]);

  const remainingSeconds = useCallback((hold) => Math.max(0, (hold.expiresAt - now) / 1000), [now]);

  const secondsToExpiry = holds.length > 0 ? Math.max(0, Math.floor((Math.min(...holds.map((h) => h.expiresAt)) - now) / 1000)) : 0;

  const total = holds.reduce((sum, h) => sum + (h.price || 0), 0);

  return {
    holds,
    addHold,
    removeHold,
    toggleHold,
    clearHolds,
    isHeld,
    findHold,
    remainingSeconds,
    secondsToExpiry,
    expiredNotice,
    dismissExpired: () => setExpiredNotice(null),
    total,
    holdSeconds,
  };
}
