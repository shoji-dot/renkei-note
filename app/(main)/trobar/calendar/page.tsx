import { prisma } from "@/lib/db";
import { createCalendarItem, deleteCalendarItem } from "./actions";

export const dynamic = "force-dynamic";

const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const selectedYear = parseInt(year ?? String(THIS_YEAR));

  const items = await prisma.manufacturingCalendar.findMany({
    where: { year: selectedYear },
    orderBy: { month: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">年間製造カレンダー</h1>

      {/* 年選択 */}
      <div className="flex gap-2">
        {YEARS.map((y) => (
          <a
            key={y}
            href={`?year=${y}`}
            className={`text-sm px-3 py-1 rounded-full border ${selectedYear === y ? "bg-gray-900 text-white border-gray-900" : "text-gray-600"}`}
          >
            {y}年
          </a>
        ))}
      </div>

      <form action={createCalendarItem} className="bg-white rounded-xl border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">登録</h2>
        <input type="hidden" name="year" value={selectedYear} />
        <div className="flex gap-2">
          <select name="month" required className="border rounded-lg px-3 py-2 text-base">
            <option value="">月</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
          </select>
          <input name="requiredPeople" type="number" min={0} placeholder="必要人数" className="flex-1 border rounded-lg px-3 py-2 text-base" />
        </div>
        <input name="workContent" required placeholder="作業内容" className="w-full border rounded-lg px-3 py-2 text-base" />
        <input name="requiredMembers" placeholder="必要メンバー" className="w-full border rounded-lg px-3 py-2 text-base" />
        <input name="requiredMaterials" placeholder="必要資材" className="w-full border rounded-lg px-3 py-2 text-base" />
        <input name="note" placeholder="備考" className="w-full border rounded-lg px-3 py-2 text-base" />
        <button className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm">追加</button>
      </form>

      <div className="space-y-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
          const monthItems = items.filter((it) => it.month === month);
          if (monthItems.length === 0) return null;
          return (
            <div key={month} className="bg-white rounded-xl border p-3">
              <p className="font-semibold text-sm mb-2">{month}月</p>
              <ul className="space-y-2">
                {monthItems.map((it) => (
                  <li key={it.id} className="text-sm border-t pt-2 first:border-t-0 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{it.workContent}</p>
                        <p className="text-xs text-gray-400">
                          {it.requiredPeople ? `必要人数: ${it.requiredPeople}名 ・ ` : ""}
                          {it.requiredMembers ?? ""}
                        </p>
                        {it.requiredMaterials && <p className="text-xs text-gray-400">資材: {it.requiredMaterials}</p>}
                        {it.note && <p className="text-xs text-gray-400">備考: {it.note}</p>}
                      </div>
                      <form action={deleteCalendarItem}>
                        <input type="hidden" name="id" value={it.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-400 hover:text-red-600 whitespace-nowrap"
                          onClick={(e) => { if (!confirm("削除しますか？")) e.preventDefault(); }}
                        >
                          削除
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-sm text-gray-400">まだ登録がありません</p>}
      </div>
    </div>
  );
}
