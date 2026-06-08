"use client";
import { updateDevMemoStatus } from "./actions";

const OPTIONS = [
  { value: "shinki", label: "新規" },
  { value: "kentochu", label: "検討中" },
  { value: "shisakuchu", label: "試作中" },
  { value: "saiyo", label: "採用" },
  { value: "fusaiyo", label: "不採用" },
];

export default function StatusSelect({ id, status }: { id: string; status: string }) {
  return (
    <select
      defaultValue={status}
      onChange={(e) => updateDevMemoStatus(id, e.target.value)}
      className="text-xs border rounded-full px-2 py-1 bg-gray-50"
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
