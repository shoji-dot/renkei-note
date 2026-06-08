import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  const images = await prisma.postImage.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { post: { select: { id: true, title: true, productId: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">写真</h1>
      {images.length === 0 ? (
        <p className="text-sm text-gray-400">写真はまだありません</p>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {images.map((img) => (
            <Link key={img.id} href={`/posts/${img.post.id}`} className="block aspect-square overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt={img.post.title} className="w-full h-full object-cover" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
