"use client";

import { useEffect, useRef } from "react";

/**
 * IntersectionObserver-based scroll reveal.
 * Adds class "in" to the ref when it enters the viewport.
 * Pair with CSS classes: reveal | reveal-left | reveal-right | reveal-scale.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("in");
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}
