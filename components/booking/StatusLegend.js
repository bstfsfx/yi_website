'use client';

const ITEMS = [
  { label: '可訂房', desc: '顯示每晚房價，點擊加入預訂', swatch: 'border border-green/30 bg-white' },
  { label: '已客滿', desc: '由平台日曆自動同步', swatch: 'bg-danger' },
  { label: '請電話訂房', desc: '需來電確認房況', swatch: 'bg-warm/60 border border-gold/50' },
  { label: '未開放', desc: '尚未開放或已過期', swatch: 'bg-soft border border-line' },
  { label: '預訂中', desc: '保留中，倒數結束自動釋放', swatch: 'bg-gold/20 border border-gold' },
];

export default function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-line bg-cream/50 px-4 py-3 text-xs text-muted">
      <span className="font-bold text-ink">狀態說明</span>
      {ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5" title={item.desc}>
          <span className={`inline-block h-3.5 w-3.5 rounded-sm ${item.swatch}`} />
          <span className="font-bold text-ink">{item.label}</span>
        </span>
      ))}
    </div>
  );
}