"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = { id: string; name: string };
type Feedback = {
  id: string;
  productId: string | null;
  goodPoint: string | null;
  improvementPoint: string | null;
  customerComment: string | null;
};

export default function EditFeedbackItem({ feedback, products }: { feedback: Feedback; products: Product[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(feedback.productId ?? "");
  const [goodPoint, setGoodPoint] = useState(feedback.goodPoint ?? "");
  const [improvementPoint, setImprovementPoint] = useState(feedback.improvementPoint ?? "");
  const [customerComment, setCustomerComment] = useState(feedback.customerComment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/feedback/${feedback.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, goodPoint, improvementPoint, customerComment }),
    });
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "更新に失敗しました");
    }
    setSaving(false);
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
        <option value="">商品を選択（任意）</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <textarea
        value={goodPoint}
        onChange={(e) => setGoodPoint(e.target.value)}
        placeholder="良かった点"
        rows={2}
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
      />
      <textarea
        value={improvementPoint}
        onChange={(e) => setImprovementPoint(e.target.value)}
        placeholder="改善点"
        rows={2}
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
      />
      <textarea
        value={customerComment}
        onChange={(e) => setCustomerComment(e.target.value)}
        placeholder="顧客コメント"
        rows={2}
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
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
