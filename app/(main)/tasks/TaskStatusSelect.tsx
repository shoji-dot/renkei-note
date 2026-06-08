"use client";

import { TASK_STATUSES } from "@/lib/types";
import { updateTaskStatus } from "./actions";

export default function TaskStatusSelect({ id, status }: { id: string; status: string }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateTaskStatus(id, e.target.value as any)}
      className="text-xs border rounded-full px-2 py-1 bg-gray-50"
    >
      {TASK_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
