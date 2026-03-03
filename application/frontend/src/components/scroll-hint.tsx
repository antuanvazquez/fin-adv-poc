'use client';

import { useEffect } from 'react';

export function ScrollHint() {
  useEffect(() => {
    if (window.innerWidth > 640) return;

    const outers = document.querySelectorAll<HTMLElement>('.table-outer');
    if (!outers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (!entry.isIntersecting) return;
          if (el.dataset.hintShown) return;

          // Check if the inner table actually overflows
          const wrap = el.querySelector('.table-wrap');
          if (!wrap || wrap.scrollWidth <= wrap.clientWidth + 4) return;

          el.dataset.hintShown = '1';
          el.classList.add('scroll-hint-visible');

          setTimeout(() => {
            el.classList.add('scroll-hint-done');
          }, 6000);

          observer.unobserve(el);
        });
      },
      { threshold: 0.3 },
    );

    outers.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
