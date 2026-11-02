import { notFound } from "next/navigation";
import { AnimationDemo } from "./demo-view";
import "./demo.css";

export const metadata = { title: "首页入场动画预览", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AnimationDemoPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AnimationDemo />;
}
