"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminSessionToken, validAdminCredentials } from "@/lib/admin-auth";
export async function loginAction(_: { error?: string }, formData: FormData) {
  const username = String(formData.get("username") ?? ""); const password = String(formData.get("password") ?? "");
  const requested = String(formData.get("next") ?? "/admin");
  const next = requested.startsWith("/admin") && !requested.startsWith("//") ? requested : "/admin";
  if (!validAdminCredentials(username, password)) return { error: "账号或密码错误" };
  (await cookies()).set(ADMIN_COOKIE, adminSessionToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  redirect(next);
}
