"use client";

import { useEffect, useState } from "react";

type Settings = {
  smtpUser: string;
  smtpConfigured: boolean;
  notifyPost: boolean;
  notifyFeedback: boolean;
  notifyTask: boolean;
};

export default function NotificationSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [notifyPost, setNotifyPost] = useState(true);
  const [notifyFeedback, setNotifyFeedback] = useState(false);
  const [notifyTask, setNotifyTask] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/me/notifications")
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data);
        setSmtpUser(data.smtpUser);
        setNotifyPost(data.notifyPost);
        setNotifyFeedback(data.notifyFeedback);
        setNotifyTask(data.notifyTask);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/me/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smtpUser, smtpPass: smtpPass || undefined, notifyPost, notifyFeedback, notifyTask }),
      });
      if (!res.ok) throw new Error();
      setSmtpPass("");
      setSettings((prev) => prev ? { ...prev, smtpConfigured: !!smtpPass || prev.smtpConfigured, smtpUser } : prev);
      setMessage("保存しました");
    } catch {
      setMessage("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="text-sm text-gray-400">読み込み中...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SMTP設定 */}
      <section className="bg-white rounded-xl border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">メール送信設定（Gmail）</h2>
        <p className="text-xs text-gray-400">
          新規投稿時に通知メールを送るためのGmailアドレスとアプリパスワードを設定してください。
        </p>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Gmailアドレス</label>
          <input
            type="email"
            value={smtpUser}
            onChange={(e) => setSmtpUser(e.target.value)}
            placeholder="your@gmail.com"
            className="w-full border rounded-lg px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            アプリパスワード
            {settings.smtpConfigured && (
              <span className="ml-2 text-green-600 font-normal">✓ 設定済み</span>
            )}
          </label>
          <input
            type="password"
            value={smtpPass}
            onChange={(e) => setSmtpPass(e.target.value)}
            placeholder={settings.smtpConfigured ? "変更する場合のみ入力" : "アプリパスワードを入力"}
            className="w-full border rounded-lg px-3 py-2 text-base"
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-400 mt-1">
            Googleアカウント → セキュリティ → 2段階認証 → アプリパスワードで取得できます
          </p>
        </div>
      </section>

      {/* 通知設定 */}
      <section className="bg-white rounded-xl border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">通知を受け取るタイミング</h2>
        <p className="text-xs text-gray-400">自分の投稿・操作には通知が届きません</p>

        {[
          { label: "新規投稿", value: notifyPost, set: setNotifyPost },
          { label: "商品フィードバック", value: notifyFeedback, set: setNotifyFeedback },
          { label: "タスク作成", value: notifyTask, set: setNotifyTask },
        ].map(({ label, value, set }) => (
          <label key={label} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">{label}</span>
            <button
              type="button"
              onClick={() => set(!value)}
              className={`w-12 h-6 rounded-full transition-colors ${value ? "bg-gray-900" : "bg-gray-300"}`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${value ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </label>
        ))}
      </section>

      {message && (
        <p className={`text-sm ${message.includes("失敗") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {saving ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
