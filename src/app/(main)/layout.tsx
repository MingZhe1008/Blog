import { Header } from "@/components/header";
import { GalaxyBackground } from "@/components/galaxy-background";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <GalaxyBackground />
      <Header />
      <div className="public-site__content">{children}</div>
    </div>
  );
}
