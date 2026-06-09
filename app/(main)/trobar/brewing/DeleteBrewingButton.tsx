"use client";

import { deleteBrewing } from "./actions";

export default function DeleteBrewingButton({ id }: { id: string }) {
  async function handleClick() {
    if (!confirm("この仕込み進捗を削除しますか？")) return;
    await deleteBrewing(id);
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
