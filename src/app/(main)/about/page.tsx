"use client";
import { useLocale, useTranslations } from "next-intl";
export default function AboutPage() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const en = useLocale() === "en";
  return <main className="editorial-page about-page"><p className="eyebrow">BEHIND THE JOURNAL</p><h1>{common("about")} MingZhe<span className="text-accent">.</span></h1><p className="hero-intro">{t("bio")}</p><section className="about-panel"><h2>{t("notebook")}</h2><p>{t("note")}</p><div className="topic-links"><span>{en ? "Programming" : "编程语言"}</span><span>AI</span><span>Agent {en ? "tools" : "工具"}</span></div><a className="primary-link" href="https://github.com/MingZhe1008" target="_blank" rel="noopener noreferrer">{en ? "Explore projects on GitHub" : "在 GitHub 查看项目"} ↗</a></section></main>;
}
