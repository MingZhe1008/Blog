"use client";

import { deleteArticle } from "@/server-actions/articles";
import { useState } from "react";

export function AdminActions({
  articleId,
  confirmMsg,
  deleteLabel,
}: {
  articleId: number;
  confirmMsg: string;
  deleteLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (pending || !confirm(confirmMsg)) return;
    setPending(true); setError("");
    try { await deleteArticle(articleId); }
    catch { setError("删除失败，请重试。"); }
    finally { setPending(false); }
  }

  return (
    <><button
      disabled={pending}
      aria-busy={pending}
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 transition-colors"
    >
      {pending ? "…" : deleteLabel}
    </button>{error && <span role="alert">{error}</span>}</>
  );
}
