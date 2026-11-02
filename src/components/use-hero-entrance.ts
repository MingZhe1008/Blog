"use client";

import { useLayoutEffect, useRef } from "react";

export function useHeroEntrance() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const hero = ref.current;
    if (!hero || !Element.prototype.animate) return;
    const groups = ["h1", ".hero-intro", ".hero-actions", ".hero-note"]
      .map(selector => hero.querySelector<HTMLElement>(selector));
    const animations: Animation[] = [];
    let stopped = false;
    let started = false;
    const reveal = () => {
      stopped = true;
      animations.forEach(animation => animation.cancel());
      groups.forEach(element => element?.style.removeProperty("opacity"));
    };
    groups.forEach(element => { if (element) element.style.opacity = "0"; });
    const start = () => {
      if (stopped || started) return;
      started = true;
      groups.forEach((element, index) => {
        if (!element) return;
        animations.push(element.animate([
          { opacity: 0, transform: "translateY(28px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 1400, delay: 250 + (index === 3 ? 1 : index) * 300,
          easing: "cubic-bezier(.25,.65,.3,1)", fill: "both" }));
        element.style.removeProperty("opacity");
      });
    };
    // A slow font request must not keep the introduction hidden indefinitely.
    const timeout = window.setTimeout(start, 1500);
    void document.fonts.ready.then(start);
    return () => {
      window.clearTimeout(timeout);
      reveal();
    };
  }, []);
  return ref;
}
