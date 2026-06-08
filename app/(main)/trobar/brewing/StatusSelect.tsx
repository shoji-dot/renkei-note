"use client";
import { updateBrewingStatus } from "./actions";

const OPTIONS = [
  { value: "junbichu", label: "準備中" },
  { value: "shikomichu", label: "仕込み中" },
  { value: "jukuseichu", label: "熟成中" },
  { value: "kansei", label: "完成" },
];

export default function StatusSelect({ id, status }: { id: string; status: string }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateBrewingStatus(id, e.target.value)}
      className="text-xs border rounded-full px-2 py-1 bg-gray-50"
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
