"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 text-sm pr-16"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 px-1"
      >
        {show ? "隠す" : "表示"}
      </button>
    </div>
  );
}

type Member = {
  id: string;
  name: string;
  role: string;
  user: { id: string; email: string } | null;
};

const ROLE_OPTIONS = [
  { value: "trobar", label: "八ヶ岳トロバール" },
  { value: "gouton", label: "グートンデリ" },
  { value: "both", label: "両方" },
  { value: "admin", label: "管理者" },
];

export default function UsersSettingsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 新規ユーザー追加フォーム
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "trobar" });
  const [adding, setAdding] = useState(false);

  // 編集
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ email: "", password: "", role: "" });
  const [editing, setEditing] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/settings/users");
    if (res.status === 403) { router.replace("/"); return; }
    const data = await res.json();
    setMembers(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    const res = await fetch("/api/settings/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "エラーが発生しました");
    } else {
      setAddForm({ name: "", email: "", password: "", role: "trobar" });
      await load();
    }
    setAdding(false);
  }

  function openEdit(m: Member) {
    setEditTarget(m);
    setEditForm({ email: m.user?.email ?? "", password: "", role: m.role });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget?.user) return;
    setEditing(true);
    setError("");
    const res = await fetch("/api/settings/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: editTarget.user.id,
        email: editForm.email || undefined,
        password: editForm.password || undefined,
        role: editForm.role,
      }),
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

  async function handleDelete(m: Member) {
    if (!m.user) return;
    if (!confirm(`${m.name} を削除しますか？`)) return;
    await fetch("/api/settings/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: m.user.id }),
    });
    await load();
  }

  const roleLabel = (role: string) => ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;

  if (loading) return <p className="text-gray-500">読み込み中...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-gray-500 text-sm">← 戻る</button>
        <h1 className="text-xl font-bold">ユーザー管理</h1>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* ユーザー一覧 */}
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-sm text-gray-500">{m.user?.email}</div>
              <div className="text-xs text-gray-400 mt-0.5">{roleLabel(m.role)}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(m)}
                className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50"
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(m)}
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
            <h2 className="font-bold text-lg">{editTarget.name} を編集</h2>
            <div>
              <label className="block text-sm text-gray-600 mb-1">メールアドレス</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">新しいパスワード（変更する場合のみ）</label>
              <PasswordInput
                value={editForm.password}
                onChange={(v) => setEditForm((f) => ({ ...f, password: v }))}
                placeholder="入力しない場合は変更しない"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">所属</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
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

      {/* ユーザー追加フォーム */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-bold mb-3">新しいメンバーを追加</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">名前</label>
            <input
              type="text"
              required
              value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">メールアドレス</label>
            <input
              type="email"
              required
              value={addForm.email}
              onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">パスワード</label>
            <PasswordInput
              value={addForm.password}
              onChange={(v) => setAddForm((f) => ({ ...f, password: v }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">所属</label>
            <select
              value={addForm.role}
              onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
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
