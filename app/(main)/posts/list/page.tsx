import { prisma } from "@/lib/db";
import PostCard from "@/components/PostCard";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { POST_TYPES, labelOf } from "@/lib/types";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function PostListPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string; q?: string }>;
}) {
  const { type, page, q } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1"));
  const take = currentPage * PAGE_SIZE;

  const validTypes = POST_TYPES.map((t) => t.value);
  const typeFilter = type && validTypes.includes(type as any) ? (type as any) : undefined;
  const keyword = q?.trim() || undefined;

  const where = {
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" as const } },
            { body: { contains: keyword, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: { author: true, images: { take: 1 }, _count: { select: { reactions: true } } },
    }),
    prisma.post.count({ where }),
  ]);

  const hasMore = total > take;
  const title = typeFilter ? labelOf(POST_TYPES, typeFilter) : "すべての投稿";

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (keyword) params.set("q", keyword);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    return params.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{title}</h1>
        <Link href="/" className="text-xs text-gray-400">← ホーム</Link>
      </div>

      {/* 検索バー */}
      <Suspense>
        <SearchBar defaultValue={keyword ?? ""} />
      </Suspense>

      {/* キーワード表示 */}
      {keyword && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>「{keyword}」の検索結果: {total}件</span>
          <Link href={`/posts/list?${buildQuery({ q: undefined })}`} className="text-xs text-gray-400 underline">
            クリア
          </Link>
        </div>
      )}

      {/* タイプ切り替え */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href={`/posts/list?${buildQuery({ type: undefined })}`}
          className={`text-xs px-3 py-1 rounded-full border ${!typeFilter ? "bg-gray-900 text-white border-gray-900" : "text-gray-600"}`}
        >
          すべて
        </Link>
        {POST_TYPES.map((t) => (
          <Link
            key={t.value}
            href={`/posts/list?${buildQuery({ type: t.value })}`}
            className={`text-xs px-3 py-1 rounded-full border ${typeFilter === t.value ? "bg-gray-900 text-white border-gray-900" : "text-gray-600"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {posts.map((p) => (
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
            reactionCount={p._count.reactions}
          />
        ))}
        {posts.length === 0 && (
          <p className="text-sm text-gray-400">
            {keyword ? `「${keyword}」に一致する投稿はありません` : "投稿はありません"}
          </p>
        )}
      </div>

      {hasMore && (
        <Link
          href={`/posts/list?${buildQuery({ page: String(currentPage + 1) })}`}
          className="block w-full text-center text-sm text-gray-500 border rounded-xl py-2 bg-white"
        >
          もっと見る（残り {total - take} 件）
        </Link>
      )}
    </div>
  );
}
