"use client";

import * as React from "react";

/**
 * Counts up to `target` when the element scrolls into view.
 * Returns [ref, displayValue].
 */
export function useCountUp(
  target: number,
  options?: { duration?: number; decimals?: number },
) {
  const { duration = 1600, decimals = 0 } = options ?? {};
  const ref = React.useRef<HTMLSpanElement>(null);
  const [value, setValue] = React.useState(0);
  const started = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  const display =
    decimals > 0
      ? value.toLocaleString("fr-FR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(value).toLocaleString("fr-FR");

  return { ref, display };
}
