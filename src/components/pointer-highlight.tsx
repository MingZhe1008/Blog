"use client";

import { useEffect, useRef } from "react";

export function PointerHighlight() {
  const halo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const move = (event: PointerEvent) => {
      if (!halo.current || !media.matches || event.pointerType === "touch") return;
      halo.current.style.transform = `translate3d(${event.clientX - 19}px, ${event.clientY - 19}px, 0)`;
      halo.current.dataset.visible = "true";
    };
    const hide = () => { if (halo.current) halo.current.dataset.visible = "false"; };
    const down = () => { if (halo.current) halo.current.dataset.pressed = "true"; };
    const up = () => { if (halo.current) halo.current.dataset.pressed = "false"; };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("pointerleave", hide);
    media.addEventListener("change", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("pointerleave", hide);
      media.removeEventListener("change", hide);
    };
  }, []);
  return <div ref={halo} className="pointer-highlight" aria-hidden="true"><span /></div>;
}
