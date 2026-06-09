import { prisma } from "@/lib/db";
import FeedbackForm from "./FeedbackForm";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1"));
  const take = currentPage * PAGE_SIZE;

  const [items, total, products] = await Promise.all([
    prisma.productFeedback.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: { product: true, images: true },
    }),
    prisma.productFeedback.count(),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">商品フィードバック</h1>

      <FeedbackForm products={products} />

      <ul className="space-y-2">
        {items.map((f) => (
          <li key={f.id} className="bg-white rounded-xl border p-3 text-sm space-y-2">
            <p className="font-medium">{f.product?.name ?? "商品未指定"}</p>
            {f.goodPoint && <p className="text-gray-600">👍 {f.goodPoint}</p>}
            {f.improvementPoint && <p className="text-gray-600">✏️ {f.improvementPoint}</p>}
            {f.customerComment && <p className="text-gray-500">💬 {f.customerComment}</p>}
            {f.images.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {f.images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={img.id} src={img.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400">
              {new Date(f.createdAt).getMonth() + 1}/{new Date(f.createdAt).getDate()}
            </p>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">まだフィードバックがありません</p>}
      </ul>

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
