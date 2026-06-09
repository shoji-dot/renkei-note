import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { createTask } from "./actions";
import TaskStatusSelect from "./TaskStatusSelect";
import DeleteTaskButton from "./DeleteTaskButton";
import EditTaskItem from "./EditTaskItem";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await requireSession();
  const user = session.user as any;

  const [tasks, members] = await Promise.all([
    prisma.task.findMany({ orderBy: [{ status: "asc" }, { dueDate: "asc" }], include: { assignee: true } }),
    prisma.member.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">タスク</h1>

      <form action={createTask} className="bg-white rounded-xl border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">新規タスク</h2>
        <input
          name="title"
          required
          placeholder="タイトル"
          className="w-full border rounded-lg px-3 py-2 text-base"
        />
        <div className="flex gap-2">
          <select name="assigneeId" className="flex-1 border rounded-lg px-3 py-2 text-base">
            <option value="">担当者未定</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <input type="date" name="dueDate" className="border rounded-lg px-3 py-2 text-base" />
        </div>
        <button className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm">追加</button>
      </form>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="bg-white rounded-xl border p-3 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{t.title}</p>
                <p className="text-xs text-gray-400">
                  {t.assignee?.name ?? "未割当"}
                  {t.dueDate ? ` ・ 期限 ${new Date(t.dueDate).getMonth() + 1}/${new Date(t.dueDate).getDate()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <TaskStatusSelect id={t.id} status={t.status} />
                {(t.createdBy === user.memberId || user.role === "admin") && (
                  <DeleteTaskButton id={t.id} />
                )}
              </div>
            </div>
            {(t.createdBy === user.memberId || user.role === "admin") && (
              <EditTaskItem
                task={{ id: t.id, title: t.title, assigneeId: t.assigneeId, dueDate: t.dueDate }}
                members={members}
              />
            )}
          </li>
        ))}
        {tasks.length === 0 && <p className="text-sm text-gray-400">タスクはまだありません</p>}
      </ul>
    </div>
  );
}
