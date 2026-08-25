import Link from "next/link";
import { getHistory } from "@/app/lib/data";
import { formatWeekLabel, weekStartKey } from "@/app/lib/week";

export default async function HistoryPage() {
  const { categories, weeks } = await getHistory(20);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Riwayat Progres
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Lihat perkembangan kamu dari minggu ke minggu.
        </p>
      </div>

      {weeks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Belum ada riwayat. Isi{" "}
          <Link href="/checkin" className="underline">
            check-in
          </Link>{" "}
          pertamamu dulu.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {weeks.map(({ weekStart, entriesByCategory, adaptiveTargetByCategory }) => (
            <div
              key={weekStartKey(weekStart)}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{formatWeekLabel(weekStart)}</h2>
                <Link
                  href={`/checkin?week=${weekStartKey(weekStart)}`}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:border-zinc-700 dark:hover:bg-emerald-950/30"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const entry = entriesByCategory.get(category.id);
                  return (
                    <div
                      key={category.id}
                      className="rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-800/60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span>{category.icon}</span>
                          {category.name}
                        </span>
                        {category.type === "counter" ? (
                          (() => {
                            const target =
                              adaptiveTargetByCategory.get(category.id) ??
                              category.weeklyTarget ??
                              1;
                            return (
                              <span
                                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                                  !entry
                                    ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                                    : (entry.count ?? 0) >= target
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                }`}
                                title={`Target minggu itu: ${target}`}
                              >
                                {entry ? entry.count ?? 0 : "-"}/{target}
                              </span>
                            );
                          })()
                        ) : (
                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                              entry?.rating != null
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : entry
                                  ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                                  : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                            }`}
                          >
                            {entry?.rating != null
                              ? `${entry.rating}/10`
                              : entry
                                ? "Terisi"
                                : "Kosong"}
                          </span>
                        )}
                      </div>
                      {entry?.notes ? (
                        <p className="mt-1 whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">
                          {entry.notes}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
