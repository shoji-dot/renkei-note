import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { createBrewing } from "./actions";
import StatusSelect from "./StatusSelect";
import DeleteBrewingButton from "./DeleteBrewingButton";
import EditBrewingItem from "./EditBrewingItem";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function BrewingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1"));
  const take = currentPage * PAGE_SIZE;

  const session = await requireSession();
  const user = session.user as any;

  const [items, total, products, members] = await Promise.all([
    prisma.brewingProgress.findMany({ orderBy: { createdAt: "desc" }, take, include: { product: true, assignee: true } }),
    prisma.brewingProgress.count(),
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
        <input
          name="identificationTag"
          placeholder="識別タグ（例: 2024-001）"
          className="w-full border rounded-lg px-3 py-2 text-base"
        />
        <div className="flex gap-2">
          <input
            name="pigOrigin"
            placeholder="豚の産地（例: イベリコ）"
            className="flex-1 border rounded-lg px-3 py-2 text-base"
          />
          <input
            name="agingPeriod"
            placeholder="熟成期間（例: 12ヶ月）"
            className="flex-1 border rounded-lg px-3 py-2 text-base"
          />
        </div>
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
              <p className="font-medium">
                {it.product?.name ?? "商品未指定"}
                {it.identificationTag && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {it.identificationTag}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-1 shrink-0">
                <StatusSelect id={it.id} status={it.status} />
                {(it.createdBy === user.memberId || user.role === "admin") && (
                  <DeleteBrewingButton id={it.id} />
                )}
              </div>
            </div>
            {(it.pigOrigin || it.agingPeriod) && (
              <p className="text-xs text-gray-500">
                {it.pigOrigin && `産地: ${it.pigOrigin}`}
                {it.pigOrigin && it.agingPeriod && " ・ "}
                {it.agingPeriod && `熟成: ${it.agingPeriod}`}
              </p>
            )}
            <p className="text-xs text-gray-400">
              担当: {it.assignee?.name ?? "未割当"}
              {it.startDate ? ` ・ 開始 ${new Date(it.startDate).getMonth() + 1}/${new Date(it.startDate).getDate()}` : ""}
            </p>
            {it.comment && <p className="text-gray-600">{it.comment}</p>}
            {(it.createdBy === user.memberId || user.role === "admin") && (
              <EditBrewingItem
                item={{ id: it.id, productId: it.productId, identificationTag: it.identificationTag, pigOrigin: it.pigOrigin, agingPeriod: it.agingPeriod, startDate: it.startDate, assigneeId: it.assigneeId, comment: it.comment }}
                products={products}
                members={members}
              />
            )}
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">まだ登録がありません</p>}
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
