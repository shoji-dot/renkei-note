import Link from "next/link";
import { prisma } from "@/lib/db";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function ShopStatusPage() {
  const posts = await prisma.post.findMany({
    where: { type: "shop_status" },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { author: true, images: { take: 1 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">店舗状況</h1>
        <Link href="/posts/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full">＋ 投稿する</Link>
      </div>
      <p className="text-xs text-gray-400">投稿時に種類「店舗状況」を選んでください</p>
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
    </div>
  );
}
