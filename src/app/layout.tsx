import type { Metadata } from "next";
import { cookies } from "next/headers";
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
    default: "MingZhe",
    template: "%s — MingZhe",
  },
  description: "Personal blog about programming languages, AI, and agent tools.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await cookies()).get("NEXT_LOCALE")?.value === "en" ? "en" : "zh";
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${playfair.variable} ${crimson.variable} ${jetbrains.variable} ${dmsans.variable}`}
    >
      <body className="min-h-screen bg-bg-base text-text-primary font-body antialiased">
        <I18nProvider initialLocale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            storageKey="galaxy-theme"
            enableSystem={false}
          >
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
