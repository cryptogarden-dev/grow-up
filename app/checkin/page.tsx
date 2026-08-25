import Link from "next/link";
import { getCategoriesWithEntryForWeek } from "@/app/lib/data";
import { submitWeeklyCheckin } from "@/app/lib/actions";
import {
  addWeeks,
  formatWeekLabel,
  parseWeekParam,
  weekStartKey,
} from "@/app/lib/week";
import { CheckinForm } from "@/app/components/CheckinForm";

export default async function CheckinPage(props: PageProps<"/checkin">) {
  const searchParams = await props.searchParams;
  const weekParam =
    typeof searchParams.week === "string" ? searchParams.week : undefined;
  const weekStart = parseWeekParam(weekParam);

  const rawItems = await getCategoriesWithEntryForWeek(weekStart);
  const items = rawItems.map(
    ({ category, entry, dailyValues, adaptiveTarget }) => ({
      category: {
        id: category.id,
        name: category.name,
        type: category.type,
        weeklyTarget: category.weeklyTarget,
        adaptiveTarget,
        icon: category.icon,
        group: category.group,
        dailyTracking: category.dailyTracking,
      },
      count: entry?.count ?? 0,
      notes: entry?.notes ?? "",
      rating: entry?.rating ?? null,
      dailyValues: dailyValues ?? [0, 0, 0, 0, 0, 0, 0],
    })
  );

  const prevWeekKey = weekStartKey(addWeeks(weekStart, -1));
  const nextWeekKey = weekStartKey(addWeeks(weekStart, 1));
  const thisWeekKey = weekStartKey(parseWeekParam(undefined));
  const isCurrentWeek = weekStartKey(weekStart) === thisWeekKey;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/checkin?week=${prevWeekKey}`}
          className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ← Minggu lalu
        </Link>
        <div className="text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Check-in untuk
          </p>
          <p className="font-medium">{formatWeekLabel(weekStart)}</p>
        </div>
        <Link
          href={`/checkin?week=${nextWeekKey}`}
          className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Minggu depan →
        </Link>
      </div>

      {!isCurrentWeek && (
        <Link
          href="/checkin"
          className="self-center text-sm text-emerald-600 underline hover:no-underline"
        >
          Kembali ke minggu ini
        </Link>
      )}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Belum ada kategori. Tambahkan di halaman{" "}
          <Link href="/settings" className="underline">
            Pengaturan
          </Link>
          .
        </p>
      ) : (
        <CheckinForm
          key={weekStartKey(weekStart)}
          items={items}
          weekStartKeyStr={weekStartKey(weekStart)}
          action={submitWeeklyCheckin}
        />
      )}
    </div>
  );
}
