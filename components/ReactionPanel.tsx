"use client";

import { useState } from "react";

export const REACTIONS = [
  {
    type: "like",
    emoji: "👍",
    label: "いいね",
    desc: "共感・いい情報",
    scene: "トピックス・アイデア",
  },
  {
    type: "confirmed",
    emoji: "✅",
    label: "確認しました",
    desc: "読んで把握した",
    scene: "業務連絡・店舗状況",
  },
  {
    type: "will_contact",
    emoji: "📞",
    label: "後で連絡します",
    desc: "追って個別に話す",
    scene: "困りごと・要対応事項",
  },
] as const;

type ReactionType = (typeof REACTIONS)[number]["type"];

type Reaction = {
  id: string;
  type: ReactionType;
  memberId: string;
  member: { id: string; name: string };
};

export default function ReactionPanel({
  postId,
  initialReactions,
  myMemberId,
}: {
  postId: string;
  initialReactions: Reaction[];
  myMemberId: string | null;
}) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(false);

  const myReaction = reactions.find((r) => r.memberId === myMemberId);

  async function handleClick(type: ReactionType) {
    if (!myMemberId || loading) return;
    setLoading(true);

    try {
      if (myReaction?.type === type) {
        // 同じボタンを押したら取り消し
        await fetch(`/api/posts/${postId}/reactions`, { method: "DELETE" });
        setReactions((prev) => prev.filter((r) => r.memberId !== myMemberId));
      } else {
        // 追加 or 上書き
        const res = await fetch(`/api/posts/${postId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        const data = await res.json();
        setReactions((prev) => {
          const without = prev.filter((r) => r.memberId !== myMemberId);
          return [...without, { ...data, member: { id: myMemberId, name: "あなた" } }];
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* ボタン行 */}
      <div className="flex items-center gap-2 flex-wrap">
        {REACTIONS.map((r) => {
          const count = reactions.filter((x) => x.type === r.type).length;
          const isActive = myReaction?.type === r.type;
          return (
            <button
              key={r.type}
              onClick={() => handleClick(r.type)}
              disabled={!myMemberId || loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                isActive
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              } disabled:opacity-40`}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
              {count > 0 && (
                <span className={`text-xs font-medium ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* 凡例ボタン */}
        <button
          onClick={() => setShowHelp((v) => !v)}
          className="w-7 h-7 rounded-full border border-gray-200 text-gray-400 text-xs hover:border-gray-400 flex items-center justify-center"
          aria-label="リアクションの説明"
        >
          ?
        </button>
      </div>

      {/* 凡例ポップアップ */}
      {showHelp && (
        <div className="bg-gray-50 border rounded-xl p-3 space-y-2 text-xs text-gray-600">
          <p className="font-semibold text-gray-700 mb-1">リアクションの意味</p>
          {REACTIONS.map((r) => (
            <div key={r.type} className="flex gap-2">
              <span className="shrink-0">{r.emoji}</span>
              <div>
                <span className="font-medium">{r.label}</span>
                <span className="text-gray-400">（{r.scene}）</span>
                <br />
                <span>{r.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 誰がリアクションしたか */}
      {reactions.length > 0 && (
        <div className="space-y-1">
          {REACTIONS.map((r) => {
            const names = reactions
              .filter((x) => x.type === r.type)
              .map((x) => x.member.name);
            if (names.length === 0) return null;
            return (
              <p key={r.type} className="text-xs text-gray-500">
                {r.emoji} {names.join("・")}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
