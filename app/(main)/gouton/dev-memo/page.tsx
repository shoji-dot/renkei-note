import { prisma } from "@/lib/db";
import { createDevMemo } from "./actions";
import StatusSelect from "./StatusSelect";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function DevMemoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1"));
  const take = currentPage * PAGE_SIZE;

  const [items, total, products] = await Promise.all([
    prisma.productDevMemo.findMany({ orderBy: { createdAt: "desc" }, take, include: { proposer: true, relatedProduct: true } }),
    prisma.productDevMemo.count(),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">商品開発メモ</h1>

      <form action={createDevMemo} className="bg-white rounded-xl border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">新規メモ</h2>
        <input name="ideaName" required placeholder="アイデア名" className="w-full border rounded-lg px-3 py-2 text-base" />
        <input name="reason" placeholder="発案理由" className="w-full border rounded-lg px-3 py-2 text-base" />
        <input name="customerRequest" placeholder="顧客要望" className="w-full border rounded-lg px-3 py-2 text-base" />
        <select name="relatedProductId" className="w-full border rounded-lg px-3 py-2 text-base">
          <option value="">関連商品（任意）</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm">追加</button>
      </form>

      <ul className="space-y-2">
        {items.map((m) => (
          <li key={m.id} className="bg-white rounded-xl border p-3 text-sm space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{m.ideaName}</p>
              <StatusSelect id={m.id} status={m.status} />
            </div>
            {m.reason && <p className="text-gray-600">理由: {m.reason}</p>}
            {m.customerRequest && <p className="text-gray-500">顧客要望: {m.customerRequest}</p>}
            <p className="text-xs text-gray-400">
              発案者: {m.proposer?.name ?? "不明"}
              {m.relatedProduct ? ` ・ 関連商品: ${m.relatedProduct.name}` : ""}
            </p>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">まだメモがありません</p>}
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
