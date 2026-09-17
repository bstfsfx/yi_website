'use client';

import { ROOM_STATUS } from '@/lib/rooms';
import { formatNTD, formatCountdown } from '@/lib/format';

/**
 * One room × one date cell in the availability grid.
 *
 * The visual state is driven purely by `cell.status`, which the API derived by
 * merging the parsed .ics bookings with the static room business rules:
 *
 *   available → 可訂房 + NT$ rate      (clickable, can be held)
 *   booked    → 已客滿                (locked)
 *   call      → 請電話訂房 + phone     (tel: link)
 *   closed    → 未開放                (locked)
 *   held      → 预訂中 + countdown     (a local hold, click again to release)
 */

const TONE = {
  [ROOM_STATUS.AVAILABLE]: {
    wrap: 'border-green/25 bg-white hover:border-green hover:bg-soft',
    main: 'text-green',
    sub: 'text-muted',
  },
  [ROOM_STATUS.BOOKED]: {
    wrap: 'border-transparent bg-danger cursor-not-allowed',
    main: 'text-[#a3543f]',
    sub: 'text-[#b98473]',
  },
  [ROOM_STATUS.CALL]: {
    wrap: 'border-gold/50 bg-warm/60 hover:border-gold',
    main: 'text-[#8a6a2f]',
    sub: 'text-[#a4863f]',
  },
  [ROOM_STATUS.CLOSED]: {
    wrap: 'border-line bg-soft cursor-not-allowed',
    main: 'text-muted',
    sub: 'text-muted/80',
  },
};

const stripeStyle = {
  backgroundImage:
    'repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(111,119,115,.08) 6px, rgba(111,119,115,.08) 12px)',
};

export default function BookingCell({ room, cell, held, remainingSeconds, disabled, onToggle }) {
  const { status, price, note, dateKey } = cell;
  const tone = TONE[status] || TONE[ROOM_STATUS.CLOSED];

  // A hold overrides the underlying status for display purposes.
  if (held) {
    const secs = remainingSeconds(held);
    return (
      <button
        type="button"
        onClick={() => onToggle && onToggle({ roomId: room.id, roomName: room.name, dateKey, price })}
        aria-label={`${room.name} ${dateKey} 預訂中，剩餘 ${formatCountdown(secs)}，點擊取消`}
        className="relative flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-gold bg-gold/15 px-1 py-2 text-center transition"
      >
        <span className="text-[11px] font-bold tracking-wide text-[#8a6a2f]">預訂中</span>
        <span className="font-mono text-sm font-bold text-[#8a6a2f]">⏳ {formatCountdown(secs)}</span>
        <span className="text-[10px] text-[#a4863f]">點擊取消</span>
      </button>
    );
  }

  if (status === ROOM_STATUS.AVAILABLE) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle && onToggle({ roomId: room.id, roomName: room.name, dateKey, price })}
        aria-label={`${room.name} ${dateKey} 可訂房，每晚 ${formatNTD(price)}，點擊加入預訂`}
        className={`flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-2 text-center transition disabled:cursor-not-allowed disabled:opacity-50 ${tone.wrap}`}
      >
        <span className={`text-sm font-extrabold leading-tight ${tone.main}`}>{formatNTD(price)}</span>
        <span className={`text-[10px] ${tone.sub}`}>可訂房</span>
      </button>
    );
  }

  if (status === ROOM_STATUS.CALL) {
    return (
      <a
        href={room.phoneHref}
        aria-label={`${room.name} ${dateKey} 請電話訂房 ${room.phone}`}
        className={`flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-2 text-center transition ${tone.wrap}`}
      >
        <span className={`text-[11px] font-bold leading-tight ${tone.main}`}>請電話訂房</span>
        <span className={`text-[10px] font-mono ${tone.sub}`}>{room.phone}</span>
      </a>
    );
  }

  const isBooked = status === ROOM_STATUS.BOOKED;
  return (
    <div
      aria-label={`${room.name} ${dateKey} ${isBooked ? '已客滿' : '未開放'}`}
      className={`flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-2 text-center ${tone.wrap}`}
      style={isBooked ? undefined : stripeStyle}
    >
      <span className={`text-[12px] font-bold leading-tight ${tone.main}`}>{isBooked ? '已客滿' : '未開放'}</span>
      <span className={`text-[10px] ${tone.sub}`}>{note && note !== '已客滿' ? note : isBooked ? '不可預訂' : ''}</span>
    </div>
  );
}