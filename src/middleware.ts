import { NextRequest, NextResponse } from "next/server";
const COOKIE_NAME = "BLOG_ADMIN_SESSION";
const SESSION_VALUE = "blog-admin-v1";
async function sessionToken(password: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(SESSION_VALUE));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
}
export async function middleware(request: NextRequest) {
  const expected = await sessionToken(process.env.ADMIN_PASSWORD || "admin123");
  if (request.cookies.get(COOKIE_NAME)?.value === expected) return NextResponse.next();
  const loginUrl = new URL("/admin-login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}
export const config = { matcher: ["/admin/:path*"] };
