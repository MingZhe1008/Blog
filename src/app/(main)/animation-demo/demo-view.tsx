"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { RotateCcw } from "lucide-react";
import { HomeView } from "../home-view";

export function AnimationDemo() {
  const [play, setPlay] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const animations: Animation[] = [];
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      const hero = stage.current?.querySelector<HTMLElement>(".editorial-hero");
      if (!hero) return;
      const groups = [hero.querySelector("h1"), hero.querySelector(".hero-intro"), hero.querySelector(".hero-actions"), hero.querySelector(".hero-note")];
      groups.forEach((element, index) => {
        if (!element) return;
        animations.push(element.animate([
          { opacity: 0, transform: "translateY(28px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 1400, delay: 250 + (index === 3 ? 1 : index) * 300, easing: "cubic-bezier(.25,.65,.3,1)", fill: "both" }));
      });
    });
    return () => { cancelled = true; animations.forEach(animation => animation.cancel()); };
  }, [play]);
  const en = useLocale() === "en";
  return <div className="entrance-demo">
    <div ref={stage} key={play} className="entrance-demo-stage">
      <HomeView articles={[]} excerpts={[]} />
    </div>
    <div className="entrance-demo-controls" aria-label={en ? "Animation preview" : "动画预览"}>
      <div><span>{en ? "Entrance preview" : "入场动画预览"}</span><small>{en ? "Staggered fade up · 2.3 seconds" : "依次淡入上移 · 2.3 秒"}</small></div>
      <button type="button" onClick={() => setPlay(value => value + 1)}><RotateCcw size={15} aria-hidden="true" />{en ? "Replay" : "重新播放"}</button>
    </div>
  </div>;
}
