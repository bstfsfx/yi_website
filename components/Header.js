'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/#about', label: '關於旅店' },
  { href: '/#photos', label: '旅店實景' },
  { href: '/#features', label: '特色' },
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
          <a className="btn light" href="tel:0938591059">
            聯絡我們
          </a>
        </div>

        {open && (
          <div className="nav-panel">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={close}>
                {l.label}
              </Link>
            ))}
            <div className="nav-actions ctas">
              <a className="btn light" href="tel:0938591059" onClick={close}>
                聯絡我們
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}