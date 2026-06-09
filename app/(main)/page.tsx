import Link from "next/link";
import { prisma } from "@/lib/db";
import PostCard from "@/components/PostCard";
import { TASK_STATUSES, labelOf } from "@/lib/types";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { type: "topic", title: "今週のトピックス" },
  { type: "problem", title: "困りごと" },
  { type: "idea", title: "改善アイデア" },
] as const;

export default async function TopPage() {
  const [posts, tasks] = await Promise.all([
    prisma.post.findMany({
      where: { type: { in: ["topic", "problem", "idea"] } },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { author: true, images: { take: 1 } },
    }),
    prisma.task.findMany({
      where: { status: { not: "kanryo" } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { assignee: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">ホーム</h1>
        <Link
          href="/posts/new"
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full"
        >
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

      {/* 投稿セクション */}
      {SECTIONS.map((sec) => {
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
              <div className="space-y-2">
                {items.slice(0, 5).map((p) => (
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
