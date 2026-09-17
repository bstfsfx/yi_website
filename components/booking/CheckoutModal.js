'use client';

import { useState } from 'react';
import { formatNTD, formatCountdown } from '@/lib/format';
import { formatChineseDate, formatWeekday } from '@/lib/dates';
import { HOTEL } from '@/lib/rooms';

/**
 * Two-step checkout: review the held rooms, then confirm.
 * On confirm the page generates a mock reservation code (no payment backend in
 * this project) and releases the holds.
 */
export default function CheckoutModal({ open, holds, total, secondsToExpiry, remainingSeconds, onClose, onConfirm }) {
  const [stage, setStage] = useState('review');
  const [code, setCode] = useState('');

  if (!open) return null;

  const sorted = [...holds].sort((a, b) =>
    a.roomId === b.roomId ? a.dateKey.localeCompare(b.dateKey) : a.roomId.localeCompare(b.roomId),
  );

  const handleConfirm = () => {
    const generated = onConfirm();
    setCode(generated);
    setStage('done');
  };

  const handleClose = () => {
    setStage('review');
    setCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-paper p-6 shadow-soft sm:rounded-2xl">
        {stage === 'review' ? (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="font-heading text-xl font-bold text-ink">確認預訂內容</h2>
              <button type="button" onClick={handleClose} className="text-muted hover:text-ink" aria-label="關閉">
                ✕
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between rounded-lg bg-warm/40 px-3 py-2 text-sm">
              <span className="text-[#8a6a2f]">保留時間倒數</span>
              <span className="font-mono font-bold text-[#8a6a2f]">{formatCountdown(secondsToExpiry)}</span>
            </div>

            <ul className="divide-y divide-line rounded-lg border border-line">
              {sorted.map((hold) => (
                <li key={hold.key} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <div>
                    <div className="font-bold text-ink">{hold.roomName}</div>
                    <div className="text-xs text-muted">
                      {formatChineseDate(hold.dateKey)}（{formatWeekday(hold.dateKey)}）· 1 晚
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green">{formatNTD(hold.price)}</div>
                    <div className="font-mono text-[11px] text-[#8a6a2f]">{formatCountdown(remainingSeconds(hold))}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-1 rounded-lg bg-soft px-3 py-2 text-xs text-muted">
              <div>入住時間：{HOTEL.checkIn} 後　退房時間：{HOTEL.checkOut} 前</div>
              <div>如需加人、加床或特殊需求，請於入住前來電 {HOTEL.phone}。</div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <div>
                <div className="text-xs text-muted">應付總額</div>
                <div className="font-heading text-2xl font-extrabold text-green">{formatNTD(total)}</div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn light" onClick={handleClose}>
                  繼續挑選
                </button>
                <button type="button" className="btn primary" onClick={handleConfirm}>
                  確認預訂
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-green/10 text-3xl text-green">✓</div>
            <h2 className="font-heading text-xl font-bold text-ink">預訂已送出</h2>
            <p className="mt-1 text-sm text-muted">我們已收到您的需求，將由專人與您確認付款與入住細節。</p>
            <div className="mx-auto mt-4 w-fit rounded-lg border border-dashed border-green/40 bg-soft px-5 py-3">
              <div className="text-xs text-muted">預訂編號</div>
              <div className="font-mono text-lg font-bold text-green">{code}</div>
            </div>
            <p className="mt-4 text-xs text-muted">
              貼心提醒：如需盡快確認，可加入 LINE 或來電 {HOTEL.phone}。
            </p>
            <button type="button" className="btn primary mt-5" onClick={handleClose}>
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}