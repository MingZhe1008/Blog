"use client";
import { useTranslations } from "next-intl";

export function AdminPageHeading({ message }: { message: "newPost" | "editPost" | "importMD" }) {
  const t = useTranslations("admin");
  return <h1 className="mb-8">{t(message)}</h1>;
}
