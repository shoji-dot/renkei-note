"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { POST_TYPES } from "@/lib/types";

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${id}/data`)
      .then((r) => r.json())
      .then((data) => {
        setType(data.type);
        setTitle(data.title);
        setContent(data.body);
        setLoading(false);
      })
      .catch(() => {
        setError("投稿の読み込みに失敗しました");
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { setError("内容を入力してください"); return; }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title, content }),
    });
    if (res.ok) {
      router.push(`/posts/${id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "更新に失敗しました");
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-400">読み込み中...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">投稿を編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl border">
        <div>
          <label className="block text-sm text-gray-600 mb-1">種類</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-base"
          >
            {POST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">タイトル（任意）</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full border rounded-lg px-3 py-2 text-base"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border rounded-lg py-2.5 text-sm text-gray-600"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}
