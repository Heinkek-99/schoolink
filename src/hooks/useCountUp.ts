import { useState, useEffect, useRef } from 'react';

export function useCountUp(end: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const prevEnd = useRef(0);

  useEffect(() => {
    if (typeof end !== 'number' || isNaN(end)) {
      setValue(0);
      return;
    }
    const start = prevEnd.current;
    prevEnd.current = end;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return value;
}
