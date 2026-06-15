import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import PostCard from "@/components/PostCard";
import { TASK_STATUSES, BREWING_STATUSES, labelOf } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TopPage() {
  await requireSession();

  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth() + 1;

  const [
    tasks,
    shopStatusPosts, shopStatusCount,
    otherStorePosts, otherStoreCount,
    topicPosts, topicCount,
    problemPosts, problemCount,
    ideaPosts, ideaCount,
    brewing, brewingCount,
    calendar,
  ] = await Promise.all([
    prisma.task.findMany({ where: { status: { not: "kanryo" } }, orderBy: { dueDate: "asc" }, take: 5, include: { assignee: true } }),
    prisma.post.findMany({ where: { type: "shop_status" }, orderBy: { createdAt: "desc" }, take: 1, include: { author: true, images: { take: 1 } } }),
    prisma.post.count({ where: { type: "shop_status" } }),
    prisma.post.findMany({ where: { type: "other_store" }, orderBy: { createdAt: "desc" }, take: 1, include: { author: true, images: { take: 1 } } }),
    prisma.post.count({ where: { type: "other_store" } }),
    prisma.post.findMany({ where: { type: "topic" }, orderBy: { createdAt: "desc" }, take: 1, include: { author: true, images: { take: 1 } } }),
    prisma.post.count({ where: { type: "topic" } }),
    prisma.post.findMany({ where: { type: "problem" }, orderBy: { createdAt: "desc" }, take: 1, include: { author: true, images: { take: 1 } } }),
    prisma.post.count({ where: { type: "problem" } }),
    prisma.post.findMany({ where: { type: "idea" }, orderBy: { createdAt: "desc" }, take: 1, include: { author: true, images: { take: 1 } } }),
    prisma.post.count({ where: { type: "idea" } }),
    prisma.brewingProgress.findMany({ where: { status: { not: "kansei" } }, orderBy: { createdAt: "desc" }, take: 1, include: { product: true } }),
    prisma.brewingProgress.count({ where: { status: { not: "kansei" } } }),
    prisma.manufacturingCalendar.findMany({ where: { year: thisYear, month: { gte: thisMonth } }, orderBy: { month: "asc" }, take: 3 }),
  ]);

  const allLabel = (count: number) => count > 0 ? `すべて（${count}件）` : "すべて";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">ホーム</h1>
        <Link href="/posts/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full">
          ＋ 投稿する
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">

        {/* タスク */}
        <section className="bg-white rounded-xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs text-gray-600">タスク</h2>
            <Link href="/tasks" className="text-xs text-gray-400">すべて</Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-400">未完了なし</p>
          ) : (
            <ul className="space-y-1.5">
              {tasks.map((t) => (
                <li key={t.id} className="text-xs border-b pb-1.5 last:border-b-0 last:pb-0">
                  <p className="font-medium line-clamp-2">{t.title}</p>
                  <p className="text-gray-400 mt-0.5">{t.assignee?.name ?? "未割当"} ・ {labelOf(TASK_STATUSES, t.status)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 店舗状況 */}
        <section className="bg-white rounded-xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs text-gray-600">店舗状況</h2>
            <Link href="/gouton/shop-status" className="text-xs text-gray-400">{allLabel(shopStatusCount)}</Link>
          </div>
          {shopStatusPosts.length === 0 ? (
            <p className="text-xs text-gray-400">まだありません</p>
          ) : (
            <PostCard key={shopStatusPosts[0].id} id={shopStatusPosts[0].id} type={shopStatusPosts[0].type}
              category={shopStatusPosts[0].category} title={shopStatusPosts[0].title} body={shopStatusPosts[0].body}
              authorName={shopStatusPosts[0].author?.name} createdAt={shopStatusPosts[0].createdAt}
              thumbnailUrl={shopStatusPosts[0].images[0]?.imageUrl} compact />
          )}
        </section>

        {/* 他店情報 */}
        <section className="bg-white rounded-xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs text-gray-600">他店情報</h2>
            <Link href="/gouton/other-store" className="text-xs text-gray-400">{allLabel(otherStoreCount)}</Link>
          </div>
          {otherStorePosts.length === 0 ? (
            <p className="text-xs text-gray-400">まだありません</p>
          ) : (
            <PostCard key={otherStorePosts[0].id} id={otherStorePosts[0].id} type={otherStorePosts[0].type}
              category={otherStorePosts[0].category} title={otherStorePosts[0].title} body={otherStorePosts[0].body}
              authorName={otherStorePosts[0].author?.name} createdAt={otherStorePosts[0].createdAt}
              thumbnailUrl={otherStorePosts[0].images[0]?.imageUrl} compact />
          )}
        </section>

        {/* 今週のトピックス */}
        <section className="bg-white rounded-xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs text-gray-600">今週のトピックス</h2>
            <Link href="/posts/list?type=topic" className="text-xs text-gray-400">{allLabel(topicCount)}</Link>
          </div>
          {topicPosts.length === 0 ? (
            <p className="text-xs text-gray-400">まだありません</p>
          ) : (
            <PostCard key={topicPosts[0].id} id={topicPosts[0].id} type={topicPosts[0].type}
              category={topicPosts[0].category} title={topicPosts[0].title} body={topicPosts[0].body}
              authorName={topicPosts[0].author?.name} createdAt={topicPosts[0].createdAt}
              thumbnailUrl={topicPosts[0].images[0]?.imageUrl} compact />
          )}
        </section>

        {/* 困りごと */}
        <section className="bg-white rounded-xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs text-gray-600">困りごと</h2>
            <Link href="/posts/list?type=problem" className="text-xs text-gray-400">{allLabel(problemCount)}</Link>
          </div>
          {problemPosts.length === 0 ? (
            <p className="text-xs text-gray-400">まだありません</p>
          ) : (
            <PostCard key={problemPosts[0].id} id={problemPosts[0].id} type={problemPosts[0].type}
              category={problemPosts[0].category} title={problemPosts[0].title} body={problemPosts[0].body}
              authorName={problemPosts[0].author?.name} createdAt={problemPosts[0].createdAt}
              thumbnailUrl={problemPosts[0].images[0]?.imageUrl} compact />
          )}
        </section>

        {/* 改善アイデア */}
        <section className="bg-white rounded-xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs text-gray-600">改善アイデア</h2>
            <Link href="/posts/list?type=idea" className="text-xs text-gray-400">{allLabel(ideaCount)}</Link>
          </div>
          {ideaPosts.length === 0 ? (
            <p className="text-xs text-gray-400">まだありません</p>
          ) : (
            <PostCard key={ideaPosts[0].id} id={ideaPosts[0].id} type={ideaPosts[0].type}
              category={ideaPosts[0].category} title={ideaPosts[0].title} body={ideaPosts[0].body}
              status={ideaPosts[0].status} authorName={ideaPosts[0].author?.name}
              createdAt={ideaPosts[0].createdAt} thumbnailUrl={ideaPosts[0].images[0]?.imageUrl} compact />
          )}
        </section>

        {/* 仕込み進捗 */}
        <section className="bg-white rounded-xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xs text-gray-600">仕込み進捗</h2>
            <Link href="/trobar/brewing" className="text-xs text-gray-400">{allLabel(brewingCount)}</Link>
          </div>
          {brewing.length === 0 ? (
            <p className="text-xs text-gray-400">進行中なし</p>
          ) : (
            <div className="text-xs">
              <p className="font-medium line-clamp-1">
                {brewing[0].product?.name ?? "商品未指定"}
                {brewing[0].identificationTag && ` (${brewing[0].identificationTag})`}
              </p>
              <p className="text-gray-400 mt-0.5">
                {labelOf(BREWING_STATUSES, brewing[0].status)}
                {brewing[0].agingPeriod ? ` ・ ${brewing[0].agingPeriod}` : ""}
              </p>
            </div>
          )}
        </section>

        {/* 製造カレンダー（全幅） */}
        {calendar.length > 0 && (
          <section className="col-span-2 bg-white rounded-xl border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xs text-gray-600">製造カレンダー（今月以降）</h2>
              <Link href="/trobar/calendar" className="text-xs text-gray-400">すべて</Link>
            </div>
            <ul className="space-y-1">
              {calendar.map((it) => (
                <li key={it.id} className="text-xs flex gap-2">
                  <span className="text-gray-400 shrink-0">{it.month}月</span>
                  <span className="font-medium">{it.workContent}</span>
                  {it.requiredMaterials && <span className="text-gray-400 truncate">{it.requiredMaterials}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}
