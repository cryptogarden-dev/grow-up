import { archiveGoal, createTask } from "@/app/lib/goalActions";
import { goalProgress, type GoalWithTasks } from "@/app/lib/goals";
import { SubmitButton } from "@/app/components/SubmitButton";
import { TaskRow } from "@/app/components/TaskRow";

const DEADLINE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function GoalCard({ goal }: { goal: GoalWithTasks }) {
  const { done, total } = goalProgress(goal);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const meta = [
    goal.targetValue,
    goal.period && `Periode ${goal.period}`,
    goal.deadline && `Target ${DEADLINE_FORMAT.format(goal.deadline)}`,
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium leading-tight">{goal.title}</h3>
          {meta.length > 0 && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {meta.join(" · ")}
            </p>
          )}
        </div>
        <form action={archiveGoal}>
          <input type="hidden" name="id" value={goal.id} />
          <button
            type="submit"
            className="shrink-0 whitespace-nowrap rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Arsipkan
          </button>
        </form>
      </div>

      {total > 0 && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            {done}/{total} langkah selesai
          </p>
        </div>
      )}

      {goal.tasks.length > 0 && (
        <div className="mt-3 flex flex-col">
          {goal.tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}

      <form action={createTask} className="mt-3 flex gap-2">
        <input type="hidden" name="goalId" value={goal.id} />
        <input
          type="text"
          name="title"
          placeholder="Tambah langkah kecil..."
          required
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <SubmitButton>+</SubmitButton>
      </form>
    </div>
  );
}
