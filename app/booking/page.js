'use client';

import { useEffect, useState } from 'react';
import BookingGrid from '@/components/booking/BookingGrid';
import WeekNavigator from '@/components/booking/WeekNavigator';
import StatusLegend from '@/components/booking/StatusLegend';
import ReservationCart from '@/components/booking/ReservationCart';
import CheckoutModal from '@/components/booking/CheckoutModal';
import useAvailability from '@/components/booking/useAvailability';
import useHolds from '@/components/booking/useHolds';
import { HOTEL } from '@/lib/rooms';

/**
 * 線上訂房 — availability grid + reservation cart.
 *
 * DATA FLOW (how the .ics sync reaches this UI):
 *   1. useAvailability() requests /api/sync-calendar for the visible window.
 *   2. The API fetches each room's external .ics feed, parses DTSTART/DTEND via
 *      node-ical and merges the booked nights with the room business rules.
 *   3. It returns `rooms[].cells[].status` which is stored in React state.
 *   4. BookingGrid renders one badge per cell from that status; nothing in the
 *      UI re-derives availability, so grid and calendar can never disagree.
 *   5. Clicking an 可訂房 cell creates a local 5-minute hold in useHolds; when the
 *      countdown hits zero the hold is released and the cell shows 可訂房 again.
 */
export default function BookingPage() {
  const { weekStartKey, days, setDays, data, loading, error, lastSyncedAt, goToWeek, goToToday, refresh } =
    useAvailability(7);

  const {
    holds,
    toggleHold,
    removeHold,
    clearHolds,
    findHold,
    remainingSeconds,
    secondsToExpiry,
    expiredNotice,
    dismissExpired,
    total,
  } = useHolds();

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Auto-hide the "hold expired" toast.
  useEffect(() => {
    if (!expiredNotice) return undefined;
    const t = setTimeout(dismissExpired, 6000);
    return () => clearTimeout(t);
  }, [expiredNotice, dismissExpired]);

  const handleConfirm = () => {
    const code = `TY${Date.now().toString().slice(-8)}`;
    clearHolds();
    return code;
  };

  const handleCheckout = () => {
    if (holds.length === 0) return;
    setCheckoutOpen(true);
  };

  return (
    <main>
      <section
        className="hero hero-sales"
        style={{
          minHeight: 360,
          background:
            'linear-gradient(90deg,rgba(255,253,248,.98) 0%,rgba(255,253,248,.9) 45%,rgba(255,253,248,.3) 75%),url("/media/p3.jpeg") center 40%/cover',
        }}
      >
        <div className="container hero-copy" style={{ padding: '56px 0' }}>
          <div className="kicker">即時空房 · 線上訂房</div>
          <h1 style={{ fontSize: 'clamp(32px,4.4vw,50px)' }}>
            選好日期，
            <br />
            直接查看房型空房
          </h1>
          <p>
            下方表格為各房型的即時空房狀態，資料由訂房平台日曆（.ics）自動同步。點選顯示價格的日期即可加入預訂清單，
            我們會為您保留 {Math.round((holds[0]?.expiresAt - holds[0]?.addedAt) / 60000) || 5} 分鐘。
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 40 }}>
        <div className="container space-y-4">
          {/* Sync explainer */}
          <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-green/20 bg-soft px-4 py-3 text-sm text-ink">
            <span className="text-xl leading-none">⟳</span>
            <div className="min-w-0 flex-1">
              <b>日曆自動同步：</b>
              本頁空房由 Airbnb 等平台的 .ics 日曆自動彙整（每 10 分鐘更新）。顯示「已客滿」代表該日期已有訂單；
              「請電話訂房」與「未開放」為現場房況與開放規則。入住 {HOTEL.checkIn}、退房 {HOTEL.checkOut}。
            </div>
          </div>

          <WeekNavigator
            rangeStart={weekStartKey}
            days={days}
            onPrev={() => goToWeek(-1)}
            onNext={() => goToWeek(1)}
            onToday={goToToday}
            onDaysChange={setDays}
            onRefresh={refresh}
            loading={loading}
            lastSyncedAt={lastSyncedAt}
          />

          <StatusLegend />

          {error && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c98b76] bg-danger px-4 py-3 text-sm text-[#7d4030]">
              <span>同步日曆時發生問題：{error}</span>
              <button type="button" className="btn light !py-1.5" onClick={refresh}>
                重試
              </button>
            </div>
          )}

          {!data && loading && (
            <div className="grid gap-2 rounded-2xl border border-line bg-paper p-6 shadow-card">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-soft" />
              ))}
            </div>
          )}

          {data && <BookingGrid availability={data} findHold={findHold} remainingSeconds={remainingSeconds} onToggle={toggleHold} disabled={false} />}

          <p className="text-[11px] text-muted">
            房價以每晚計價，週五、週六入住加收 NT$500。實際房價與空房以結帳確認時為準。
          </p>

          <ReservationCart
            holds={holds}
            remainingSeconds={remainingSeconds}
            secondsToExpiry={secondsToExpiry}
            total={total}
            onRemove={removeHold}
            onClear={clearHolds}
            onCheckout={handleCheckout}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-5 py-4 text-sm shadow-card">
            <div>
              <b className="text-ink">需要協助嗎？</b>
              <span className="ml-2 text-muted">特殊需求、加床或包棟歡迎直接與我們聯繫。</span>
            </div>
            <div className="flex gap-2">
              <a className="btn primary" href={HOTEL.phoneHref}>
                來電 {HOTEL.phone}
              </a>
              <a className="btn light" href={HOTEL.lineUrl} target="_blank" rel="noreferrer">
                加入 LINE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Expired hold toast */}
      {expiredNotice && (
        <div className="fixed bottom-5 left-1/2 z-40 w-[92%] max-w-md -translate-x-1/2 rounded-xl border border-[#c98b76] bg-danger px-4 py-3 text-sm text-[#7d4030] shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <span>
              {expiredNotice.items.length} 個保留已逾時並自動釋放：
              {expiredNotice.items.map((h) => `${h.roomName} ${h.dateKey}`).join('、')}
            </span>
            <button type="button" onClick={dismissExpired} aria-label="關閉通知" className="text-[#a3543f]">
              ✕
            </button>
          </div>
        </div>
      )}

      <CheckoutModal
        open={checkoutOpen}
        holds={holds}
        total={total}
        secondsToExpiry={secondsToExpiry}
        remainingSeconds={remainingSeconds}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleConfirm}
      />
    </main>
  );
}