"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const hide = () => { if (glow.current) glow.current.style.opacity = "0"; };
    const move = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType === "touch") { hide(); return; }
      if (glow.current) {
        glow.current.style.transform = `translate3d(${event.clientX - 24}px, ${event.clientY - 22}px, 0)`;
        glow.current.style.opacity = "1";
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("pointerleave", hide);
    pointer.addEventListener("change", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("pointerleave", hide);
      pointer.removeEventListener("change", hide);
    };
  }, []);
  return <div ref={glow} className="cursor-blue-glow" aria-hidden="true" />;
}
