import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localeDetection: true,
  localePrefix: "never",
});

export type Locale = (typeof routing.locales)[number];
