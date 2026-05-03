"use client";

import { useMemo } from "react";

interface Props {
  count?: number;
}

/**
 * Floating sparkle/heart decorations layer.
 * Place inside a `relative` container; it absolutely fills it.
 * Decorations are positioned randomly but deterministically per render.
 */
export default function Decorations({ count = 16 }: Props) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const t = (["heart", "star", "star", "heart"] as const)[i % 4];
        // Use a stable pseudo-random sequence so SSR/CSR match
        const seed = (i + 1) * 1373;
        const left = (seed * 17) % 100;
        const top = (seed * 31) % 100;
        const size = 12 + ((seed * 7) % 18);
        const delay = (seed % 40) / 10;
        const dur = 4 + ((seed * 3) % 6);
        return { i, t, left, top, size, delay, dur };
      }),
    [count]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {dots.map((d) => (
        <span
          key={d.i}
          className={`absolute deco-${d.t} sparkle`}
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            fontSize: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
