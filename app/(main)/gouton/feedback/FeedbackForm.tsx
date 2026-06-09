"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = { id: string; name: string };

export default function FeedbackForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [goodPoint, setGoodPoint] = useState("");
  const [improvementPoint, setImprovementPoint] = useState("");
  const [customerComment, setCustomerComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goodPoint.trim() && !improvementPoint.trim() && !customerComment.trim()) {
      setError("いずれか1項目を入力してください");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("画像のアップロードに失敗しました");
        const data = await res.json();
        imageUrls.push(data.url);
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productId || null, goodPoint, improvementPoint, customerComment, imageUrls }),
      });
      if (!res.ok) throw new Error("登録に失敗しました");

      setProductId("");
      setGoodPoint("");
      setImprovementPoint("");
      setCustomerComment("");
      setFiles([]);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-600">新規フィードバック</h2>
      <select
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-base"
      >
        <option value="">商品を選択（任意）</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <textarea
        value={goodPoint}
        onChange={(e) => setGoodPoint(e.target.value)}
        placeholder="良かった点"
        rows={2}
        className="w-full border rounded-lg px-3 py-2 text-base"
      />
      <textarea
        value={improvementPoint}
        onChange={(e) => setImprovementPoint(e.target.value)}
        placeholder="改善点"
        rows={2}
        className="w-full border rounded-lg px-3 py-2 text-base"
      />
      <textarea
        value={customerComment}
        onChange={(e) => setCustomerComment(e.target.value)}
        placeholder="顧客コメント"
        rows={2}
        className="w-full border rounded-lg px-3 py-2 text-base"
      />
      <div>
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="w-full text-sm"
        />
        {files.length > 0 && <p className="text-xs text-gray-400 mt-1">{files.length}枚選択中</p>}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
      >
        {submitting ? "登録中..." : "追加"}
      </button>
    </form>
  );
}
