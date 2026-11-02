"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { RotateCcw } from "lucide-react";
import { HomeView } from "../home-view";

export function AnimationDemo() {
  const [play, setPlay] = useState(0);
  const en = useLocale() === "en";
  return <div className="entrance-demo">
    <div key={play} className="entrance-demo-stage">
      <HomeView articles={[]} excerpts={[]} />
    </div>
    <div className="entrance-demo-controls" aria-label={en ? "Animation preview" : "动画预览"}>
      <div><span>{en ? "Entrance preview" : "入场动画预览"}</span><small>{en ? "Staggered fade up · 2.3 seconds" : "依次淡入上移 · 2.3 秒"}</small></div>
      <button type="button" onClick={() => setPlay(value => value + 1)}><RotateCcw size={15} aria-hidden="true" />{en ? "Replay" : "重新播放"}</button>
    </div>
  </div>;
}
