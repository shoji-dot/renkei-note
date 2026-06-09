"use client";

import { useState } from "react";
import { updateBrewing } from "./actions";

type Product = { id: string; name: string };
type Member = { id: string; name: string };
type Brewing = {
  id: string;
  productId: string | null;
  identificationTag: string | null;
  pigOrigin: string | null;
  agingPeriod: string | null;
  startDate: Date | null;
  assigneeId: string | null;
  comment: string | null;
};

export default function EditBrewingItem({
  item,
  products,
  members,
}: {
  item: Brewing;
  products: Product[];
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(item.productId ?? "");
  const [identificationTag, setIdentificationTag] = useState(item.identificationTag ?? "");
  const [pigOrigin, setPigOrigin] = useState(item.pigOrigin ?? "");
  const [agingPeriod, setAgingPeriod] = useState(item.agingPeriod ?? "");
  const [startDate, setStartDate] = useState(
    item.startDate ? new Date(item.startDate).toISOString().split("T")[0] : ""
  );
  const [assigneeId, setAssigneeId] = useState(item.assigneeId ?? "");
  const [comment, setComment] = useState(item.comment ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateBrewing(item.id, {
      productId: productId || null,
      identificationTag: identificationTag || null,
      pigOrigin: pigOrigin || null,
      agingPeriod: agingPeriod || null,
      startDate: startDate || null,
      assigneeId: assigneeId || null,
      comment: comment || null,
    });
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
      <select
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
      >
        <option value="">商品を選択</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input
        value={identificationTag}
        onChange={(e) => setIdentificationTag(e.target.value)}
        placeholder="識別タグ"
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <input
          value={pigOrigin}
          onChange={(e) => setPigOrigin(e.target.value)}
          placeholder="豚の産地"
          className="flex-1 border rounded-lg px-2 py-1.5 text-sm"
        />
        <input
          value={agingPeriod}
          onChange={(e) => setAgingPeriod(e.target.value)}
          placeholder="熟成期間"
          className="flex-1 border rounded-lg px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-1 border rounded-lg px-2 py-1.5 text-sm"
        />
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="flex-1 border rounded-lg px-2 py-1.5 text-sm"
        >
          <option value="">担当者</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="コメント"
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
      />
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
