import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Playfair_Display, Crimson_Pro, JetBrains_Mono, DM_Sans } from "next/font/google";
import { I18nProvider } from "@/components/i18n-provider";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "900"],
  display: "swap",
});

const crimson = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const dmsans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Blog — Thoughts on Code & Learning",
    template: "%s — Blog",
  },
  description: "Personal blog about programming languages, AI, and agent tools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh"
      suppressHydrationWarning
      className={`${playfair.variable} ${crimson.variable} ${jetbrains.variable} ${dmsans.variable}`}
    >
      <body className="min-h-screen bg-bg-base text-text-primary font-body antialiased">
        <I18nProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
