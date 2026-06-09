import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import PostCard from "@/components/PostCard";
import { TASK_STATUSES, BREWING_STATUSES, labelOf } from "@/lib/types";

export const dynamic = "force-dynamic";

const POST_SECTIONS = [
  { type: "topic", title: "今週のトピックス" },
  { type: "problem", title: "困りごと" },
  { type: "idea", title: "改善アイデア" },
] as const;

export default async function TopPage() {
  const session = await requireSession();
  const user = session.user as any;
  const isTrobar = user.role === "trobar" || user.role === "both" || user.role === "admin";
  const isGouton = user.role === "gouton" || user.role === "both" || user.role === "admin";

  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth() + 1;

  const [posts, shopStatusPosts, tasks, brewing, calendar] = await Promise.all([
    prisma.post.findMany({
      where: { type: { in: ["topic", "problem", "idea"] } },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { author: true, images: { take: 1 } },
    }),
    isGouton ? prisma.post.findMany({
      where: { type: "shop_status" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { author: true, images: { take: 1 } },
    }) : Promise.resolve([]),
    prisma.task.findMany({
      where: { status: { not: "kanryo" } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { assignee: true },
    }),
    isTrobar ? prisma.brewingProgress.findMany({
      where: { status: { not: "kansei" } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { product: true },
    }) : Promise.resolve([]),
    isTrobar ? prisma.manufacturingCalendar.findMany({
      where: { year: thisYear, month: { gte: thisMonth } },
      orderBy: [{ month: "asc" }],
      take: 3,
    }) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">ホーム</h1>
        <Link href="/posts/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full">
          ＋ 投稿する
        </Link>
      </div>

      {/* タスク */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm text-gray-600">タスク</h2>
          <Link href="/tasks" className="text-xs text-gray-400">すべて見る</Link>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400">未完了のタスクはありません</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="bg-white rounded-xl border p-3 text-sm flex justify-between items-center">
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-gray-400">
                    {t.assignee?.name ?? "未割当"}
                    {t.dueDate ? ` ・ 期限 ${new Date(t.dueDate).getMonth() + 1}/${new Date(t.dueDate).getDate()}` : ""}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {labelOf(TASK_STATUSES, t.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 店舗状況（gouton/both/admin） */}
      {isGouton && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm text-gray-600">店舗状況</h2>
            <Link href="/gouton/shop-status" className="text-xs text-gray-400">すべて見る</Link>
          </div>
          {shopStatusPosts.length === 0 ? (
            <p className="text-sm text-gray-400">まだ投稿がありません</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {shopStatusPosts.map((p) => (
                <PostCard
                  key={p.id}
                  id={p.id}
                  type={p.type}
                  category={p.category}
                  title={p.title}
                  body={p.body}
                  authorName={p.author?.name}
                  createdAt={p.createdAt}
                  thumbnailUrl={p.images[0]?.imageUrl}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 仕込み進捗（trobar/both/admin） */}
      {isTrobar && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm text-gray-600">仕込み進捗（進行中）</h2>
            <Link href="/trobar/brewing" className="text-xs text-gray-400">すべて見る</Link>
          </div>
          {brewing.length === 0 ? (
            <p className="text-sm text-gray-400">進行中の仕込みはありません</p>
          ) : (
            <ul className="space-y-2">
              {brewing.map((it) => (
                <li key={it.id} className="bg-white rounded-xl border p-3 text-sm">
                  <p className="font-medium">
                    {it.product?.name ?? "商品未指定"}
                    {it.identificationTag && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {it.identificationTag}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {labelOf(BREWING_STATUSES, it.status)}
                    {it.agingPeriod ? ` ・ 熟成 ${it.agingPeriod}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 製造カレンダー（trobar/both/admin） */}
      {isTrobar && calendar.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm text-gray-600">製造カレンダー（今月以降）</h2>
            <Link href="/trobar/calendar" className="text-xs text-gray-400">すべて見る</Link>
          </div>
          <ul className="space-y-2">
            {calendar.map((it) => (
              <li key={it.id} className="bg-white rounded-xl border p-3 text-sm">
                <p className="font-medium">{it.month}月 — {it.workContent}</p>
                {it.requiredMaterials && (
                  <p className="text-xs text-gray-400 mt-0.5">資材: {it.requiredMaterials}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 投稿セクション */}
      {POST_SECTIONS.map((sec) => {
        const items = posts.filter((p) => p.type === sec.type);
        return (
          <section key={sec.type}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm text-gray-600">{sec.title}</h2>
              <Link href={`/posts/list?type=${sec.type}`} className="text-xs text-gray-400">すべて見る</Link>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-gray-400">まだ投稿がありません</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {items.slice(0, 6).map((p) => (
                  <PostCard
                    key={p.id}
                    id={p.id}
                    type={p.type}
                    category={p.category}
                    title={p.title}
                    body={p.body}
                    status={p.status}
                    authorName={p.author?.name}
                    createdAt={p.createdAt}
                    thumbnailUrl={p.images[0]?.imageUrl}
                    compact
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
