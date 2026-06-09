"use client";

import { useState } from "react";
import { updateTask } from "./actions";

type Member = { id: string; name: string };
type Task = {
  id: string;
  title: string;
  assigneeId: string | null;
  dueDate: Date | null;
};

export default function EditTaskItem({ task, members }: { task: Task; members: Member[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    await updateTask(task.id, { title: title.trim(), assigneeId: assigneeId || null, dueDate: dueDate || null });
    setSaving(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 border rounded-lg text-gray-500"
      >
        編集
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 border-t pt-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
        placeholder="タイトル"
      />
      <div className="flex gap-2">
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="flex-1 border rounded-lg px-2 py-1.5 text-sm"
        >
          <option value="">担当者未定</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 border rounded-lg py-1.5 text-xs text-gray-600"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gray-900 text-white rounded-lg py-1.5 text-xs disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
