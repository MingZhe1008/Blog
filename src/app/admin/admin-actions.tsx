"use client";

import { deleteArticle } from "@/server-actions/articles";
import { useRouter } from "next/navigation";

export function AdminActions({
  articleId,
  confirmMsg,
  deleteLabel,
}: {
  articleId: number;
  confirmMsg: string;
  deleteLabel: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(confirmMsg)) return;
    await deleteArticle(articleId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 transition-colors"
    >
      {deleteLabel}
    </button>
  );
}
