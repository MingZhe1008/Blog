import { LoginForm } from "./login-form";
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/admin" } = await searchParams;
  const developmentPassword = process.env.NODE_ENV === "development" ? (process.env.ADMIN_PASSWORD || "admin123") : "";
  return <main className="admin-login"><section className="admin-login__panel">
    <p className="eyebrow">ADMIN / ACCESS</p><h1>管理台登录</h1><p>验证身份后进入内容管理。</p>
    <LoginForm next={next} developmentPassword={developmentPassword} />
  </section></main>;
}
