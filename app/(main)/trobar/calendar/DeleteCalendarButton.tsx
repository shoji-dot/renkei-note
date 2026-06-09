"use client";

import { deleteCalendarItem } from "./actions";

export default function DeleteCalendarButton({ id }: { id: string }) {
  async function handleAction(formData: FormData) {
    if (!confirm("削除しますか？")) return;
    await deleteCalendarItem(formData);
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-600 whitespace-nowrap"
      >
        削除
      </button>
    </form>
  );
}
