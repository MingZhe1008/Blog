import { Header } from "@/components/header";
import { StarsCanvas } from "@/components/star-background";
import { SiteFooter } from "@/components/site-footer";
import { CursorGlow } from "@/components/cursor-glow";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <StarsCanvas />
      <CursorGlow />
      <Header />
      <div className="public-site__content">{children}<SiteFooter /></div>
    </div>
  );
}
