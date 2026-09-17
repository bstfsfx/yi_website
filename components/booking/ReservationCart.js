'use client';

import { formatNTD, formatCountdown } from '@/lib/format';
import { formatChineseDate, formatWeekday } from '@/lib/dates';

/**
 * Reservation cart (sticky bottom bar).
 *
 * Every hold added from the grid lives here with its own countdown. When the
 * countdown reaches zero the hold is released by useHolds and the grid cell
 * flips back to 可訂房 automatically.
 */
export default function ReservationCart({ holds, remainingSeconds, secondsToExpiry, total, onRemove, onClear, onCheckout }) {
  const empty = holds.length === 0;

  const sorted = [...holds].sort((a, b) =>
    a.roomId === b.roomId ? a.dateKey.localeCompare(b.dateKey) : a.roomId.localeCompare(b.roomId),
  );

  return (
    <section className="rounded-2xl border border-line bg-paper shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg font-bold text-ink">預訂清單</h2>
          <span className="rounded-full bg-green px-2 py-0.5 text-xs font-bold text-white">{holds.length}</span>
        </div>
        {!empty && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">
              最快要釋出：<span className="font-mono font-bold text-[#8a6a2f]">{formatCountdown(secondsToExpiry)}</span>
            </span>
            <button type="button" onClick={onClear} className="text-xs text-muted underline hover:text-ink">
              清空
            </button>
          </div>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto px-5 py-3">
        {empty ? (
          <p className="py-6 text-center text-sm text-muted">
            尚未選擇房型。點選上方「可訂房」且顯示價格的日期，即可加入預訂清單。
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {sorted.map((hold) => {
              const secs = remainingSeconds(hold);
              const urgent = secs <= 60;
              return (
                <li key={hold.key} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-bold text-ink">
                      <span>{hold.roomName}</span>
                      <span className="rounded bg-soft px-1.5 py-0.5 text-[10px] font-bold text-green">預訂中</span>
                    </div>
                    <div className="text-xs text-muted">
                      {formatChineseDate(hold.dateKey)}（{formatWeekday(hold.dateKey)}）· 1 晚
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-green">{formatNTD(hold.price)}</span>
                    <span
                      className={`w-14 text-right font-mono text-sm font-bold ${urgent ? 'animate-pulse text-[#a3543f]' : 'text-[#8a6a2f]'}`}
                    >
                      {formatCountdown(secs)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(hold.key)}
                      aria-label={`移除 ${hold.roomName} ${hold.dateKey}`}
                      className="grid h-7 w-7 place-items-center rounded-full border border-line text-muted transition hover:border-[#a3543f] hover:text-[#a3543f]"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-cream/60 px-5 py-4">
        <div>
          <div className="text-xs text-muted">合計（未含加購與手續費）</div>
          <div className="font-heading text-2xl font-extrabold text-green">{formatNTD(total)}</div>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden max-w-[220px] text-[11px] leading-snug text-muted sm:block">
            房間將為您保留 {Math.round((holds[0]?.expiresAt - holds[0]?.addedAt) / 60000) || 5} 分鐘，逾時自動釋放。
          </p>
          <button type="button" className="btn primary !px-7 !py-3 !text-base" disabled={empty} onClick={onCheckout} style={empty ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
            前往結帳 →
          </button>
        </div>
      </div>
    </section>
  );
}