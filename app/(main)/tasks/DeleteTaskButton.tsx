"use client";

import { deleteTask } from "./actions";

export default function DeleteTaskButton({ id }: { id: string }) {
  async function handleClick() {
    if (!confirm("このタスクを削除しますか？")) return;
    await deleteTask(id);
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded"
    >
      削除
    </button>
  );
}
