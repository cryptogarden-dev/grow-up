import Link from "next/link";
import {
  getCategoriesWithEntryForWeek,
  getCategoryHistories,
  getCurrentStreak,
  getWeeklyRecap,
} from "@/app/lib/data";
import { DAY_LABELS, formatWeekLabel, getWeekStart } from "@/app/lib/week";
import { groupByCategory, groupIcon } from "@/app/lib/groups";
import { WeeklyTrendChart } from "@/app/components/WeeklyTrendChart";
import { MiniTrendChart } from "@/app/components/MiniTrendChart";

export default async function DashboardPage() {
  const weekStart = getWeekStart();
  const [items, streak, recap, categoryHistories] = await Promise.all([
    getCategoriesWithEntryForWeek(weekStart),
    getCurrentStreak(),
    getWeeklyRecap(8),
    getCategoryHistories(10),
  ]);

  const totalCount = items.length;
  const filledCount = items.filter((i) => i.entry !== null).length;
  const allDone = totalCount > 0 && filledCount === totalCount;
  const groups = groupByCategory(items);

  const recapMessage = buildRecapMessage(recap.thisWeekScore, recap.scoreDelta);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-1">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Minggu ini
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {formatWeekLabel(weekStart)}
        </h1>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Kategori terisi"
          value={`${filledCount}/${totalCount}`}
          icon="✅"
          accent="emerald"
        />
        <StatCard
          label="Skor minggu ini"
          value={`${recap.thisWeekScore}%`}
          delta={recap.scoreDelta}
          icon="📊"
          accent="indigo"
        />
        <StatCard
          label="Beruntun"
          value={`${streak} minggu`}
          icon="🔥"
          accent="amber"
        />
        <StatCard
          label="Total kategori"
          value={`${totalCount}`}
          icon="🗂️"
          accent="zinc"
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Ringkasan Mingguan</h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            8 minggu terakhir
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {recapMessage}
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Target kategori angka otomatis naik 1% dari rata-rata performamu 6
          minggu terakhir (titik ekuilibrium) — bukan angka tetap, supaya
          &quot;tercapai&quot; selalu berarti lebih baik dari biasanya.
        </p>
        <div className="mt-4">
          <WeeklyTrendChart data={recap.weeklyScores} />
        </div>

        {recap.categoryTrends.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {recap.categoryTrends.map((trend) => (
              <span
                key={trend.category.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-800"
                title={`${trend.category.name}: minggu ini ${trend.thisValue}, minggu lalu ${trend.lastValue}${
                  trend.adaptiveTarget != null
                    ? `, target minggu ini ${trend.adaptiveTarget}`
                    : ""
                }`}
              >
                <span>{trend.category.icon}</span>
                <span className="font-medium">{trend.category.name}</span>
                <TrendArrow delta={trend.delta} />
                {trend.streak > 1 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    🔥{trend.streak}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Tren per Kategori</h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            10 minggu terakhir
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryHistories.map(({ category, points, currentValue }) => (
            <div
              key={category.id}
              className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span>{category.icon}</span>
                  {category.name}
                </span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {currentValue}
                </span>
              </div>
              <MiniTrendChart data={points} />
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30 sm:hidden">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          {allDone ? "Semua sudah terisi!" : "Belum isi check-in minggu ini"}
        </p>
        <Link
          href="/checkin"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          {allDone ? "Edit" : "Isi"}
        </Link>
      </section>

      {totalCount === 0 && (
        <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Belum ada kategori. Tambahkan di halaman{" "}
          <Link href="/settings" className="underline">
            Pengaturan
          </Link>
          .
        </p>
      )}

      {groups.map(({ group, items: groupItems }) => (
        <section key={group} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <span>{groupIcon(group)}</span>
              {group}
            </h2>
            <Link
              href="/checkin"
              className="hidden text-sm text-emerald-600 hover:underline sm:inline"
            >
              {allDone ? "Edit check-in →" : "Isi check-in →"}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupItems.map(({ category, entry, dailyValues, adaptiveTarget }) => (
              <div
                key={category.id}
                className={`rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${
                  entry
                    ? "border-emerald-200/70 bg-white dark:border-emerald-900/40 dark:bg-zinc-900"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-800">
                      {category.icon}
                    </span>
                    <div>
                      <h3 className="font-medium leading-tight">
                        {category.name}
                      </h3>
                      {category.type === "counter" && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Target minggu ini:{" "}
                          <span className="font-medium">
                            {adaptiveTarget ?? category.weeklyTarget}
                          </span>
                          {adaptiveTarget != null &&
                            category.weeklyTarget != null &&
                            adaptiveTarget > category.weeklyTarget && (
                              <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                                (dasar {category.weeklyTarget})
                              </span>
                            )}
                        </p>
                      )}
                    </div>
                  </div>
                  {category.type === "notes" && entry?.rating != null ? (
                    <span className="whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {entry.rating}/10
                    </span>
                  ) : (
                    <StatusBadge
                      filled={entry !== null}
                      type={category.type}
                      count={entry?.count ?? null}
                      target={adaptiveTarget ?? category.weeklyTarget}
                    />
                  )}
                </div>

                {category.dailyTracking && dailyValues ? (
                  <div className="mt-3 flex items-center gap-1">
                    {dailyValues.map((value, i) => (
                      <div
                        key={i}
                        title={`${DAY_LABELS[i]}: ${value}`}
                        className={`flex h-6 flex-1 items-center justify-center rounded-md text-[10px] font-medium ${
                          value > 0
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                        }`}
                      >
                        {DAY_LABELS[i][0]}
                      </div>
                    ))}
                  </div>
                ) : category.type === "counter" ? (
                  <ProgressBar
                    value={entry?.count ?? 0}
                    target={adaptiveTarget ?? category.weeklyTarget ?? 1}
                  />
                ) : null}

                {entry?.notes ? (
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                    {entry.notes}
                  </p>
                ) : (
                  <p className="mt-3 text-sm italic text-zinc-400 dark:text-zinc-600">
                    Belum ada catatan minggu ini.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function buildRecapMessage(score: number, delta: number): string {
  if (score === 100) {
    return "🎉 Sempurna! Semua kategori tercapai minggu ini. Ingat prinsip Atomic Habits: bukan soal sempurna sekali, tapi soal konsistensi tiap minggu.";
  }
  if (delta > 0) {
    return `📈 Naik ${delta} poin dari minggu lalu. Perbaikan kecil yang konsisten akan menumpuk jadi hasil besar (efek 1% lebih baik).`;
  }
  if (delta < 0) {
    return `📉 Turun ${Math.abs(delta)} poin dari minggu lalu. Wajar sesekali turun — kuncinya jangan sampai gagal 2 minggu berturut-turut.`;
  }
  if (score === 0) {
    return "Belum ada progres tercatat. Mulai dari 1 kategori kecil dulu minggu ini, sistem yang jalan lebih penting dari target besar.";
  }
  return "Skor stabil dibanding minggu lalu. Pertahankan sistemnya — hasil besar datang dari kebiasaan yang diulang, bukan motivasi sesaat.";
}

function TrendArrow({ delta }: { delta: number }) {
  if (delta > 0)
    return <span className="text-emerald-600 dark:text-emerald-400">↑{delta}</span>;
  if (delta < 0)
    return <span className="text-red-500">↓{Math.abs(delta)}</span>;
  return <span className="text-zinc-400">→</span>;
}

function StatCard({
  label,
  value,
  icon,
  accent,
  delta,
}: {
  label: string;
  value: string;
  icon: string;
  accent: "emerald" | "indigo" | "amber" | "zinc";
  delta?: number;
}) {
  const accentClasses: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${accentClasses[accent]}`}
        >
          {icon}
        </span>
        {typeof delta === "number" && delta !== 0 && (
          <TrendArrow delta={delta} />
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function StatusBadge({
  filled,
  type,
  count,
  target,
}: {
  filled: boolean;
  type: string;
  count: number | null;
  target: number | null;
}) {
  if (!filled) {
    return (
      <span className="whitespace-nowrap rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        Belum diisi
      </span>
    );
  }

  if (type === "counter") {
    const done = (count ?? 0) >= (target ?? 1);
    return (
      <span
        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
          done
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
        }`}
      >
        {count ?? 0}/{target}
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
      Terisi
    </span>
  );
}

function ProgressBar({ value, target }: { value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(target, 1)) * 100));
  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className="h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
