"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const ROLE_LABEL: Record<string, string> = {
  admin: "管理者",
  trobar: "八ヶ岳トロバール",
  gouton: "グートンデリ",
  both: "八ヶ岳トロバール / グートンデリ",
};

export default function HeaderNav({
  name,
  role,
  locationName,
}: {
  name?: string;
  role?: string;
  locationName?: string | null;
}) {
  const pathname = usePathname();

  const isTrobar = role === "trobar" || role === "both" || role === "admin";
  const isGouton = role === "gouton" || role === "both" || role === "admin";

  // 共通（全員）
  const links = [
    { href: "/", label: "ホーム" },
    { href: "/posts/new", label: "投稿する" },
    { href: "/tasks", label: "タスク" },
    { href: "/images", label: "写真" },
    { href: "/gouton/feedback", label: "商品フィードバック" },
  ];

  // 八ヶ岳トロバール
  if (isTrobar) {
    links.push({ href: "/trobar/calendar", label: "製造カレンダー" });
    links.push({ href: "/trobar/brewing", label: "仕込み進捗" });
  }

  // グートンデリ
  if (isGouton) {
    links.push({ href: "/gouton/shop-status", label: "店舗状況" });
  }

  // 管理者のみ
  if (role === "admin") {
    links.push({ href: "/settings", label: "⚙ 設定" });
  }

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <Link href="/" className="font-bold text-lg">連携ノート</Link>
          <p className="text-xs text-gray-500">
            {name} ・ {locationName ?? ROLE_LABEL[role ?? ""] ?? ""}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ログアウト
        </button>
      </div>
      <nav className="max-w-2xl mx-auto px-4 pb-2 flex gap-3 overflow-x-auto text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full ${
              pathname === l.href ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
