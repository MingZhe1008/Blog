import { Header } from "@/components/header";
import { StarsCanvas } from "@/components/star-background";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <StarsCanvas />
      <Header />
      <div className="public-site__content">{children}</div>
    </div>
  );
}
