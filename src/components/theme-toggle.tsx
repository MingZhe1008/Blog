"use client";

import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

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
      ? "切换到浅色模式"
      : "Switch to light mode"
    : locale === "zh"
      ? "切换到深色模式"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="celestial-control theme-toggle"
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={19} strokeWidth={1.6} aria-hidden="true" /> : <Moon size={19} strokeWidth={1.6} aria-hidden="true" />}
      <span className="sr-only">{label}</span>
    </button>
  );
}
