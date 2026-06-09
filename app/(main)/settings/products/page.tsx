"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  category: string | null;
  note: string | null;
};

export default function ProductsSettingsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addForm, setAddForm] = useState({ name: "", category: "", note: "" });
  const [adding, setAdding] = useState(false);

  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", note: "" });
  const [editing, setEditing] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/settings/products");
    if (res.status === 403) { router.replace("/"); return; }
    setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    const res = await fetch("/api/settings/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "エラーが発生しました");
    } else {
      setAddForm({ name: "", category: "", note: "" });
      await load();
    }
    setAdding(false);
  }

  function openEdit(p: Product) {
    setEditTarget(p);
    setEditForm({ name: p.name, category: p.category ?? "", note: p.note ?? "" });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditing(true);
    setError("");
    const res = await fetch("/api/settings/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editTarget.id, ...editForm }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "エラーが発生しました");
    } else {
      setEditTarget(null);
      await load();
    }
    setEditing(false);
  }

  async function handleDelete(p: Product) {
    if (!confirm(`「${p.name}」を削除しますか？`)) return;
    await fetch("/api/settings/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    await load();
  }

  if (loading) return <p className="text-gray-500">読み込み中...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-gray-500 text-sm">← 戻る</button>
        <h1 className="text-xl font-bold">商品マスタ</h1>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* 商品一覧 */}
      <div className="space-y-2">
        {products.length === 0 && <p className="text-gray-400 text-sm">商品が登録されていません</p>}
        {products.map((p) => (
          <div key={p.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              {p.category && <div className="text-sm text-gray-500">{p.category}</div>}
              {p.note && <div className="text-xs text-gray-400 mt-0.5">{p.note}</div>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(p)}
                className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50"
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(p)}
                className="text-sm px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 編集モーダル */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <form onSubmit={handleEdit} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg">商品を編集</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">商品名</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">カテゴリ（任意）</label>
              <input
                type="text"
                value={editForm.category}
                onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">メモ（任意）</label>
              <input
                type="text"
                value={editForm.note}
                onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="flex-1 border rounded-lg py-2 text-sm"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={editing}
                className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm"
              >
                {editing ? "保存中..." : "保存"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 商品追加フォーム */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-bold mb-3">商品を追加</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">商品名</label>
            <input
              type="text"
              required
              value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">カテゴリ（任意）</label>
            <input
              type="text"
              value={addForm.category}
              onChange={(e) => setAddForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">メモ（任意）</label>
            <input
              type="text"
              value={addForm.note}
              onChange={(e) => setAddForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm"
          >
            {adding ? "追加中..." : "追加する"}
          </button>
        </form>
      </div>
    </div>
  );
}
