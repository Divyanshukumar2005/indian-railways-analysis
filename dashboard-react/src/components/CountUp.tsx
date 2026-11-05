import React, { useEffect, useRef, useState } from 'react';

// Animates a number to its new value. Respects "reduce motion" and never shows NaN.
export const CountUp: React.FC<{ value: number; decimals?: number; suffix?: string }> = ({ value, decimals = 0, suffix = '' }) => {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(target); from.current = target; return; }
    const start = from.current, t0 = performance.now(), dur = 700;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      const v = start + (target - start) * e;
      setShown(v); from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{shown.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
};
