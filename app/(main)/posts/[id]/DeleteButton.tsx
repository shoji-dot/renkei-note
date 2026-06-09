"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      alert("削除に失敗しました");
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs px-3 py-1 rounded-full bg-red-600 text-white disabled:opacity-50"
        >
          {deleting ? "削除中..." : "本当に削除"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600"
        >
          キャンセル
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-red-500 hover:text-red-700"
    >
      削除
    </button>
  );
}
