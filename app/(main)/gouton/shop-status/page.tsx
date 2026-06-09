import Link from "next/link";
import { prisma } from "@/lib/db";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ShopStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1"));
  const take = currentPage * PAGE_SIZE;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { type: "shop_status" },
      orderBy: { createdAt: "desc" },
      take,
      include: { author: true, images: { take: 1 } },
    }),
    prisma.post.count({ where: { type: "shop_status" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">店舗状況</h1>
        <Link href="/posts/new?type=shop_status" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full">＋ 投稿する</Link>
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
            authorName={p.author?.name}
            createdAt={p.createdAt}
            thumbnailUrl={p.images[0]?.imageUrl}
          />
        ))}
        {posts.length === 0 && <p className="text-sm text-gray-400">まだ投稿がありません</p>}
      </div>

      {total > take && (
        <a
          href={`?page=${currentPage + 1}`}
          className="block w-full text-center text-sm text-gray-500 border rounded-xl py-2 bg-white"
        >
          もっと見る（残り {total - take} 件）
        </a>
      )}
    </div>
  );
}
