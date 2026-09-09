import Link from "next/link";
import {
  areaIcon,
  getArchivedGoals,
  getGoalGroups,
  getTodayFocusTasks,
} from "@/app/lib/goals";
import { unarchiveGoal } from "@/app/lib/goalActions";
import { GoalCard } from "@/app/components/GoalCard";
import { AddGoalForm } from "@/app/components/AddGoalForm";
import { TaskRow } from "@/app/components/TaskRow";

export default async function GoalsPage() {
  const [groups, focusTasks, archivedGoals] = await Promise.all([
    getGoalGroups(),
    getTodayFocusTasks(5),
    getArchivedGoals(),
  ]);
  const areas = groups.map((g) => g.area);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Goals &amp; Roadmap
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Goal besar dipecah jadi langkah-langkah kecil yang bisa kamu
          kerjakan hari ini.
        </p>
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900/40 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">🎯 Fokus Hari Ini</h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {focusTasks.length} langkah
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {focusTasks.length > 0
            ? "Kerjakan ini dulu — goal besar jadi ringan kalau dipecah sekecil ini."
            : "🎉 Semua langkah kecil sudah selesai. Tambahkan langkah baru di goal manapun di bawah."}
        </p>
        {focusTasks.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            {focusTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                subtitle={`${areaIcon(task.goal.area)} ${task.goal.title}`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-6">
          {groups.map(({ area, goals }) => (
            <div key={area} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <span>{areaIcon(area)}</span>
                {area}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              Belum ada goal. Tambahkan roadmap pertamamu lewat form di
              samping.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 font-medium">Tambah Goal Baru</h2>
            <AddGoalForm areas={areas} />
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              Setelah goal dibuat, pecah jadi langkah-langkah kecil langsung
              di kartunya. Lihat progres keseluruhan di{" "}
              <Link href="/" className="underline">
                Dashboard
              </Link>
              .
            </p>
          </div>

          {archivedGoals.length > 0 && (
            <div>
              <h2 className="mb-3 font-medium">Goal Diarsipkan</h2>
              <div className="flex flex-col gap-2">
                {archivedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <span>{areaIcon(goal.area)}</span>
                      {goal.title}
                    </span>
                    <form action={unarchiveGoal}>
                      <input type="hidden" name="id" value={goal.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Aktifkan lagi
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
