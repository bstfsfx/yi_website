/** Client-safe formatting helpers. */

export function formatNTD(amount) {
  if (amount == null) return '';
  return `NT$${Number(amount).toLocaleString('zh-TW')}`;
}

export function formatCountdown(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function nightsBetween(startKey, endKeyExclusive) {
  const a = new Date(`${startKey}T00:00:00`);
  const b = new Date(`${endKeyExclusive}T00:00:00`);
  return Math.round((b - a) / 86400000);
}
