'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/#about', label: '關於旅店' },
  { href: '/#photos', label: '旅店實景' },
  { href: '/#features', label: '特色' },
  { href: '/sales#stay', label: '住宿方案' },
  { href: '/booking', label: '線上訂房' },
  { href: '/sales#faq', label: '常見問題' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header>
      <div className="container nav">
        <Link href="/" className="logo" onClick={close}>
          <span aria-hidden>⌂</span>
          <span>
            天台邑旅店<small>TIANTAIYI HOTEL</small>
          </span>
        </Link>

        <button className={`hamburger ${open ? 'open' : ''}`} aria-label="選單" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span />
          <span />
          <span />
        </button>

        <nav className="nav-links">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions ctas" style={{ margin: 0 }}>
          <Link className="btn primary" href="/booking">
            線上訂房
          </Link>
          <Link className="btn light" href="/sales#contact">
            加入LINE詢問
          </Link>
        </div>

        {open && (
          <div className="nav-panel">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={close}>
                {l.label}
              </Link>
            ))}
            <div className="nav-actions ctas">
              <Link className="btn primary" href="/booking" onClick={close}>
                線上訂房
              </Link>
              <Link className="btn light" href="/sales#contact" onClick={close}>
                加入LINE詢問
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}