import { prisma } from "@/lib/db";
import { createFeedback } from "./actions";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const [items, products] = await Promise.all([
    prisma.productFeedback.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { product: true } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">商品フィードバック</h1>

      <form action={createFeedback} className="bg-white rounded-xl border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">新規フィードバック</h2>
        <select name="productId" className="w-full border rounded-lg px-3 py-2 text-base">
          <option value="">商品を選択（任意）</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input name="goodPoint" placeholder="良かった点" className="w-full border rounded-lg px-3 py-2 text-base" />
        <input name="improvementPoint" placeholder="改善点" className="w-full border rounded-lg px-3 py-2 text-base" />
        <input name="customerComment" placeholder="顧客コメント" className="w-full border rounded-lg px-3 py-2 text-base" />
        <button className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm">追加</button>
      </form>

      <ul className="space-y-2">
        {items.map((f) => (
          <li key={f.id} className="bg-white rounded-xl border p-3 text-sm space-y-1">
            <p className="font-medium">{f.product?.name ?? "商品未指定"}</p>
            {f.goodPoint && <p className="text-gray-600">👍 {f.goodPoint}</p>}
            {f.improvementPoint && <p className="text-gray-600">✏️ {f.improvementPoint}</p>}
            {f.customerComment && <p className="text-gray-500">💬 {f.customerComment}</p>}
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">まだフィードバックがありません</p>}
      </ul>
    </div>
  );
}
