"use client";

import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="celestial-control celestial-control--placeholder" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";
  const label = isDark
    ? locale === "zh"
      ? "切换到明亮星图"
      : "Switch to light star chart"
    : locale === "zh"
      ? "切换到深空星图"
      : "Switch to dark star chart";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="celestial-control theme-toggle"
      aria-label={label}
      title={label}
    >
      <span className={`nav-orb nav-orb--moon${isDark ? " is-dark" : ""}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
