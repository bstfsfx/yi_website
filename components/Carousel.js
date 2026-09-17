'use client';

import { useEffect, useRef, useState } from 'react';

const IMAGES = [
  { src: '/media/p1.jpeg', alt: '天台邑旅店環境' },
  { src: '/media/p3.jpeg', alt: '天台邑旅店環境' },
  { src: '/media/p4.jpeg', alt: '天台邑旅店環境' },
];

export default function Carousel() {
  const [cur, setCur] = useState(0);
  const timerRef = useRef(null);

  const go = (n) => {
    setCur((c) => (n + IMAGES.length) % IMAGES.length);
  };

  const start = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCur((c) => (c + 1) % IMAGES.length), 5000);
  };

  useEffect(() => {
    start();
    return () => clearInterval(timerRef.current);
  }, []);

  const onNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    go(cur + 1);
    start();
  };
  const onPrev = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    go(cur - 1);
    start();
  };
  const onDot = (i) => {
    if (timerRef.current) clearInterval(timerRef.current);
    go(i);
    start();
  };

  return (
    <div className="carousel">
      <div className="carousel-track">
        {IMAGES.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.src} src={img.src} alt={img.alt} className={i === cur ? 'active' : ''} />
        ))}
      </div>
      <button className="carousel-arrow prev" aria-label="上一張" onClick={onPrev}>
        ←
      </button>
      <button className="carousel-arrow next" aria-label="下一張" onClick={onNext}>
        →
      </button>
      <div className="carousel-dots">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === cur ? 'active' : ''}`}
            data-i={i}
            aria-label={`圖片${i + 1}`}
            onClick={() => onDot(i)}
          />
        ))}
      </div>
    </div>
  );
}