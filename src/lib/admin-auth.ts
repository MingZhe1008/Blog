import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
export const ADMIN_COOKIE = "BLOG_ADMIN_SESSION";
const SESSION_VALUE = "blog-admin-v1";
const password = () => process.env.ADMIN_PASSWORD || "admin123";
export const adminSessionToken = () => createHmac("sha256", password()).update(SESSION_VALUE).digest("hex");
export function validAdminCredentials(username: string, candidate: string) {
  const actual = Buffer.from(candidate); const expected = Buffer.from(password());
  return username === (process.env.ADMIN_USERNAME || "admin") && actual.length === expected.length && timingSafeEqual(actual, expected);
}
export async function isAdminAuthenticated() {
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  const token = adminSessionToken();
  if (cookie.length === token.length && timingSafeEqual(Buffer.from(cookie), Buffer.from(token))) return true;
  const authorization = (await headers()).get("authorization") ?? "";
  const [scheme, encoded] = authorization.split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  const decoded = Buffer.from(encoded, "base64").toString("utf8"); const colon = decoded.indexOf(":");
  return colon >= 0 && validAdminCredentials(decoded.slice(0, colon) || "admin", decoded.slice(colon + 1));
}
