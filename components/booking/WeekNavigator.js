'use client';

import { addDays, formatChineseDate, fromDateKey, toDateKey } from '@/lib/dates';

/**
 * Week/month window navigation. Shifting the window is just a change of
 * `rangeStart`, which triggers a fresh /api/sync-calendar request in
 * useAvailability — so the .ics sync stays the single source of truth.
 */
export default function WeekNavigator({
  rangeStart,
  days,
  onPrev,
  onNext,
  onToday,
  onDaysChange,
  onRefresh,
  loading,
  lastSyncedAt,
}) {
  const start = rangeStart ? formatChineseDate(rangeStart) : '—';
  const end = rangeStart ? formatChineseDate(toDateKey(addDays(fromDateKey(rangeStart), days - 1))) : '—';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 shadow-card">
      <div className="flex items-center gap-2">
        <button type="button" className="btn light !px-4 !py-2" onClick={onPrev} aria-label="上一週">
          ← 上一週
        </button>
        <button type="button" className="btn light !px-4 !py-2" onClick={onToday}>
          回到本週
        </button>
        <button type="button" className="btn light !px-4 !py-2" onClick={onNext} aria-label="下一週">
          下一週 →
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold text-ink">{start}</span>
        <span className="text-muted">–</span>
        <span className="font-bold text-ink">{end}</span>
        {loading && <span className="ml-1 text-xs text-muted">同步中…</span>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex overflow-hidden rounded-full border border-line text-xs">
          {[
            { value: 7, label: '一週' },
            { value: 14, label: '雙週' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onDaysChange(opt.value)}
              className={`px-3 py-1.5 font-bold transition ${
                days === opt.value ? 'bg-green text-white' : 'bg-white text-muted hover:bg-soft'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn light !px-4 !py-2" onClick={onRefresh} aria-label="重新同步日曆">
          ⟳ 同步
        </button>
      </div>

      {lastSyncedAt && (
        <div className="w-full text-right text-[11px] text-muted">
          日曆最後同步：{new Date(lastSyncedAt).toLocaleString('zh-TW', { hour12: false })}
        </div>
      )}
    </div>
  );
}