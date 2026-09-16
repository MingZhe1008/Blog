"use server";
import { headers } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { persistReadingExcerpt, type ExcerptInput } from "@/lib/reading-excerpts";
export async function saveReadingExcerpt(input: ExcerptInput) {
  const authorization = (await headers()).get("authorization") ?? "";
  const [scheme, encoded] = authorization.split(" ");
  const decoded = scheme === "Basic" && encoded ? Buffer.from(encoded, "base64").toString("utf8") : "";
  const colon = decoded.indexOf(":");
  const actual = Buffer.from(colon < 0 ? "" : decoded.slice(colon + 1));
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || "admin123");
  if (colon < 0 || actual.length !== expected.length || !timingSafeEqual(actual, expected)) return { error: "unauthorized" } as const;
  try {
    const id = await persistReadingExcerpt(input);
    revalidatePath("/"); revalidatePath("/admin/excerpts");
    return { id } as const;
  } catch { return { error: "saveFailed" } as const; }
}
