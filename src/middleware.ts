import { NextRequest, NextResponse } from "next/server";
import { sitePath } from "@/lib/site-paths";
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
  const loginUrl = new URL(sitePath("/admin-login"), request.url);
  // Next's internal request URL can contain localhost behind a reverse proxy.
  // Nginx supplies the original public host and scheme for redirects.
  const publicHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (publicHost) {
    loginUrl.port = "";
    loginUrl.host = publicHost;
  }
  const publicProtocol = request.headers.get("x-forwarded-proto");
  if (publicProtocol === "https" || publicProtocol === "http") loginUrl.protocol = `${publicProtocol}:`;
  loginUrl.searchParams.set("next", sitePath(`${request.nextUrl.pathname}${request.nextUrl.search}`));
  return NextResponse.redirect(loginUrl);
}
export const config = { matcher: ["/admin/:path*"] };
