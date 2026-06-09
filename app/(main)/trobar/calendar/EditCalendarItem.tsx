"use client";

import { useState } from "react";
import { updateCalendarItem } from "./actions";

type Item = {
  id: string;
  workContent: string;
  requiredPeople: number | null;
  requiredMembers: string | null;
  requiredMaterials: string | null;
  note: string | null;
};

export default function EditCalendarItem({ item }: { item: Item }) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-blue-400 hover:text-blue-600 px-2 py-1 rounded shrink-0"
      >
        編集
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateCalendarItem(formData);
        setEditing(false);
      }}
      className="w-full space-y-2 mt-2 p-2 bg-gray-50 rounded-lg"
    >
      <input type="hidden" name="id" value={item.id} />
      <input
        name="workContent"
        defaultValue={item.workContent}
        required
        placeholder="作業内容"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <input
          name="requiredPeople"
          type="number"
          min={0}
          defaultValue={item.requiredPeople ?? ""}
          placeholder="必要人数"
          className="w-24 border rounded-lg px-3 py-2 text-sm"
        />
        <input
          name="requiredMembers"
          defaultValue={item.requiredMembers ?? ""}
          placeholder="必要メンバー"
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <input
        name="requiredMaterials"
        defaultValue={item.requiredMaterials ?? ""}
        placeholder="必要資材"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <input
        name="note"
        defaultValue={item.note ?? ""}
        placeholder="備考"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg"
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-gray-500 px-3 py-1.5 rounded-lg border"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
