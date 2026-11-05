import React, { useEffect, useRef } from 'react';

export const ScrollProgress: React.FC = () => {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return <div ref={bar} aria-hidden className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-violet-500 to-amber-400" />;
};
