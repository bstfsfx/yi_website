'use client';

import { useEffect, useState } from 'react';

export default function FloatingWidgets() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={`floating-widgets ${shown ? 'shown' : ''}`}>
      <a className="slide-buttons btn primary" href="tel:0938591059">
        電話
      </a>
    </div>
  );
}