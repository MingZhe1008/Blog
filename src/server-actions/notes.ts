"use server";
import { headers } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { persistNote } from "@/lib/notes";

export async function saveNote(input: Parameters<typeof persistNote>[0]) {
  // Server actions can be invoked independently of the page that displays them.
  const authorization = (await headers()).get("authorization") ?? "";
  const [scheme, encoded] = authorization.split(" ");
  const decoded = scheme === "Basic" && encoded ? Buffer.from(encoded, "base64").toString("utf8") : "";
  const colon = decoded.indexOf(":");
  const actual = Buffer.from(colon < 0 ? "" : decoded.slice(colon + 1));
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || "admin123");
  if (colon < 0 || actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return { error: "unauthorized" } as const;
  }
  try {
    const id = await persistNote(input);
    revalidatePath("/notes", "layout");
    revalidatePath("/admin/notes", "layout");
    return { id } as const;
  } catch {
    return { error: "saveFailed" } as const;
  }
}
