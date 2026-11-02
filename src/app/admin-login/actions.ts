"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminSessionToken, validAdminCredentials } from "@/lib/admin-auth";
import { BASE_PATH, adminReturnPath, appPath } from "@/lib/site-paths";
export async function loginAction(_: { error?: string }, formData: FormData) {
  const username = String(formData.get("username") ?? ""); const password = String(formData.get("password") ?? "");
  const requested = String(formData.get("next") ?? "/admin");
  const next = adminReturnPath(requested);
  if (!validAdminCredentials(username, password)) return { error: "账号或密码错误" };
  (await cookies()).set(ADMIN_COOKIE, adminSessionToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: BASE_PATH, maxAge: 60 * 60 * 12 });
  // Server Action redirects add Next's configured basePath themselves.
  redirect(appPath(next));
}
