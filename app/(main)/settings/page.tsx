import { requireSession } from "@/lib/session";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await requireSession();
  const user = session.user as any;
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">設定</h1>
      <div className="grid gap-3">
        <Link
          href="/settings/notifications"
          className="block p-4 bg-white border rounded-lg hover:bg-gray-50"
        >
          <div className="font-medium">🔔 通知設定</div>
          <div className="text-sm text-gray-500 mt-1">メール通知のON/OFF・Gmailアプリパスワード管理</div>
        </Link>
        {isAdmin && (
          <>
            <Link
              href="/settings/users"
              className="block p-4 bg-white border rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium">ユーザー管理</div>
              <div className="text-sm text-gray-500 mt-1">メンバーの追加・パスワード変更・所属変更</div>
            </Link>
            <Link
              href="/settings/products"
              className="block p-4 bg-white border rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium">商品マスタ</div>
              <div className="text-sm text-gray-500 mt-1">商品の追加・編集・削除</div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
