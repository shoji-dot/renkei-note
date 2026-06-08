import { prisma } from "@/lib/db";
import { createBrewing } from "./actions";
import StatusSelect from "./StatusSelect";

export const dynamic = "force-dynamic";

export default async function BrewingPage() {
  const [items, products, members] = await Promise.all([
    prisma.brewingProgress.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { product: true, assignee: true } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">仕込み進捗</h1>

      <form action={createBrewing} className="bg-white rounded-xl border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">新規登録</h2>
        <select name="productId" className="w-full border rounded-lg px-3 py-2 text-base">
          <option value="">商品を選択</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="date" name="startDate" className="flex-1 border rounded-lg px-3 py-2 text-base" />
          <select name="assigneeId" className="flex-1 border rounded-lg px-3 py-2 text-base">
            <option value="">担当者</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <input name="comment" placeholder="コメント" className="w-full border rounded-lg px-3 py-2 text-base" />
        <button className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm">追加</button>
      </form>

      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="bg-white rounded-xl border p-3 text-sm space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{it.product?.name ?? "商品未指定"}</p>
              <StatusSelect id={it.id} status={it.status} />
            </div>
            <p className="text-xs text-gray-400">
              担当: {it.assignee?.name ?? "未割当"}
              {it.startDate ? ` ・ 開始 ${new Date(it.startDate).getMonth() + 1}/${new Date(it.startDate).getDate()}` : ""}
            </p>
            {it.comment && <p className="text-gray-600">{it.comment}</p>}
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">まだ登録がありません</p>}
      </ul>
    </div>
  );
}
