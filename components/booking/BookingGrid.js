'use client';

import BookingCell from './BookingCell';
import { ROOMS } from '@/lib/rooms';
import { formatMonthDay, formatWeekday, isTodayKey } from '@/lib/dates';

/**
 * Availability matrix: rows = room types, columns = dates.
 *
 * It is a plain CSS grid (not <table>) so the first column and header row can be
 * sticky while the whole thing scrolls horizontally on mobile.
 */
export default function BookingGrid({ availability, findHold, remainingSeconds, onToggle, disabled }) {
  const dates = availability?.dates || [];
  const roomsById = new Map((availability?.rooms || []).map((r) => [r.roomId, r]));

  const gridTemplate = { gridTemplateColumns: `170px repeat(${dates.length}, minmax(104px, 1fr))` };

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-paper shadow-card">
      <div className="min-w-[820px]">
        {/* Header row: dates */}
        <div className="grid border-b border-line bg-cream/70" style={gridTemplate}>
          <div className="sticky left-0 z-10 flex items-center border-r border-line bg-cream px-4 py-3 text-xs font-bold text-muted">
            房型 / 日期
          </div>
          {dates.map((dateKey) => {
            const today = isTodayKey(dateKey);
            const wd = formatWeekday(dateKey);
            const weekend = wd === '六' || wd === '日';
            return (
              <div
                key={dateKey}
                className={`flex flex-col items-center justify-center border-r border-line px-1 py-2 text-center ${
                  today ? 'bg-green/10' : weekend ? 'bg-warm/30' : ''
                }`}
              >
                <span className={`text-[11px] ${weekend ? 'text-[#a4863f]' : 'text-muted'}`}>週{wd}</span>
                <span className={`text-sm font-bold ${today ? 'text-green' : 'text-ink'}`}>{formatMonthDay(dateKey)}</span>
                {today && <span className="mt-0.5 rounded-full bg-green px-2 text-[9px] font-bold text-white">今天</span>}
              </div>
            );
          })}
        </div>

        {/* One row per room type */}
        {ROOMS.map((room) => {
          const roomData = roomsById.get(room.id);
          const cellByDate = new Map((roomData?.cells || []).map((c) => [c.dateKey, c]));
          return (
            <div key={room.id} className="grid border-b border-line last:border-b-0" style={gridTemplate}>
              <div className="sticky left-0 z-10 flex flex-col justify-center gap-0.5 border-r border-line bg-paper px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-[15px] font-bold text-ink">{room.name}</span>
                  {roomData?.source === 'demo' && (
                    <span className="rounded bg-soft px-1 text-[9px] text-muted" title="示範資料">
                      示範
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wide text-muted">{room.enName}</span>
                <span className="text-[11px] text-muted">
                  可住 {room.capacity} 人 · 起 {room.price ? `NT$${room.price.toLocaleString('zh-TW')}` : '—'}
                </span>
              </div>

              {dates.map((dateKey) => {
                const cell = cellByDate.get(dateKey) || { dateKey, status: 'closed', price: null, note: null };
                const held = findHold(room.id, dateKey);
                return (
                  <div key={dateKey} className="border-r border-line p-1.5">
                    <BookingCell
                      room={room}
                      cell={cell}
                      held={held}
                      remainingSeconds={remainingSeconds}
                      disabled={disabled}
                      onToggle={onToggle}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}