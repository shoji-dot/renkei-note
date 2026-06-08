"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { POST_TYPES, POST_CATEGORIES } from "@/lib/types";

export default function PostForm() {
  const router = useRouter();
  const [type, setType] = useState<string>(POST_TYPES[0].value);
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("タイトルと内容を入力してください");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      // 画像を先にアップロード
      const imageUrls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("画像のアップロードに失敗しました");
        const data = await res.json();
        imageUrls.push(data.url);
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, category: category || null, title, content, imageUrls }),
      });
      if (!res.ok) throw new Error("投稿に失敗しました");
      const data = await res.json();
      router.push(`/posts/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "エラーが発生しました");
      setSubmitting(false);
    }
  }

  return (
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
        <label className="block text-sm text-gray-600 mb-1">分類（任意）</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-base"
        >
          <option value="">選択しない</option>
          {POST_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">タイトル</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-base"
          placeholder="例：女性客が多かった"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-base"
          placeholder="気づいたことを自由に書いてください"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">写真（任意・複数可）</label>
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="w-full text-sm"
        />
        {files.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">{files.length}枚選択中</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
      >
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
