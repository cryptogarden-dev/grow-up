"use client";

import { useMemo, useState } from "react";
import { NumberStepper } from "@/app/components/NumberStepper";
import { SubmitButton } from "@/app/components/SubmitButton";
import { groupIcon } from "@/app/lib/groups";
import { DAY_LABELS } from "@/app/lib/week";

export type CheckinCategory = {
  id: string;
  name: string;
  type: string;
  weeklyTarget: number | null;
  /** "1% better" target for this week, derived from recent equilibrium. */
  adaptiveTarget: number | null;
  icon: string;
  group: string;
  dailyTracking: boolean;
};

export type CheckinItem = {
  category: CheckinCategory;
  count: number;
  notes: string;
  rating: number | null;
  dailyValues: number[];
};

type FormValues = {
  count: number;
  notes: string;
  rating: number | null;
  daily: number[];
};

export function CheckinForm({
  items,
  weekStartKeyStr,
  action,
}: {
  items: CheckinItem[];
  weekStartKeyStr: string;
  action: (formData: FormData) => void;
}) {
  const [values, setValues] = useState<Record<string, FormValues>>(() =>
    Object.fromEntries(
      items.map((item) => [
        item.category.id,
        {
          count: item.count,
          notes: item.notes,
          rating: item.rating,
          daily: [...item.dailyValues],
        },
      ])
    )
  );

  function update(id: string, patch: Partial<FormValues>) {
    setValues((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function updateDay(id: string, dayIndex: number, value: number) {
    setValues((prev) => {
      const daily = [...prev[id].daily];
      daily[dayIndex] = value;
      return { ...prev, [id]: { ...prev[id], daily } };
    });
  }

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, CheckinItem[]>();
    for (const item of items) {
      if (!map.has(item.category.group)) {
        map.set(item.category.group, []);
        order.push(item.category.group);
      }
      map.get(item.category.group)!.push(item);
    }
    return order.map((group) => ({ group, items: map.get(group)! }));
  }, [items]);

  function isFilled(item: CheckinItem) {
    const v = values[item.category.id];
    if (item.category.dailyTracking) {
      return v.daily.some((d) => d > 0);
    }
    if (item.category.type === "counter") {
      return v.count > 0;
    }
    return v.notes.trim().length > 0 || v.rating !== null;
  }

  function isDone(item: CheckinItem) {
    const v = values[item.category.id];
    const target =
      item.category.adaptiveTarget ?? item.category.weeklyTarget ?? 1;
    if (item.category.dailyTracking) {
      const total = v.daily.reduce((a, b) => a + b, 0);
      return total >= target;
    }
    if (item.category.type === "counter") {
      return v.count >= target;
    }
    return v.rating !== null ? v.rating >= 7 : v.notes.trim().length > 0;
  }

  const filledCount = items.filter(isFilled).length;

  return (
    <form action={action} className="flex flex-col gap-8 pb-28">
      <input type="hidden" name="weekStart" value={weekStartKeyStr} />

      {groups.map(({ group, items: groupItems }) => (
        <section key={group} className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <span>{groupIcon(group)}</span>
            {group}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {groupItems.map((item) => {
              const { category } = item;
              const v = values[category.id];
              const done = isDone(item);
              const dailyTotal = v.daily.reduce((a, b) => a + b, 0);

              return (
                <div
                  key={category.id}
                  className={`rounded-2xl border p-4 shadow-sm transition-colors ${
                    done
                      ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-800">
                      {category.icon}
                    </span>
                    <div>
                      <p className="font-medium leading-tight">
                        {category.name}
                      </p>
                      {category.type === "counter" && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Target minggu ini:{" "}
                          <span className="font-medium">
                            {item.category.adaptiveTarget ??
                              category.weeklyTarget}
                          </span>
                          {item.category.adaptiveTarget != null &&
                            category.weeklyTarget != null &&
                            item.category.adaptiveTarget >
                              category.weeklyTarget && (
                              <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                                (dasar {category.weeklyTarget}, +1% dari
                                rata-ratamu)
                              </span>
                            )}
                        </p>
                      )}
                    </div>
                    {done && (
                      <span className="ml-auto text-emerald-600">✓</span>
                    )}
                  </div>

                  {category.dailyTracking ? (
                    <div className="mt-3">
                      <div className="grid grid-cols-7 gap-1">
                        {DAY_LABELS.map((label, i) => (
                          <div key={label} className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-zinc-400">
                              {label}
                            </span>
                            <input
                              type="number"
                              name={`day-${category.id}-${i}`}
                              min={0}
                              value={v.daily[i]}
                              onChange={(e) =>
                                updateDay(
                                  category.id,
                                  i,
                                  Math.max(0, Number(e.target.value) || 0)
                                )
                              }
                              className="w-full rounded-lg border border-zinc-300 px-1 py-1.5 text-center text-xs dark:border-zinc-700 dark:bg-zinc-800"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Total minggu ini: {dailyTotal}/
                        {item.category.adaptiveTarget ??
                          category.weeklyTarget}
                      </p>
                    </div>
                  ) : category.type === "counter" ? (
                    <div className="mt-3">
                      <NumberStepper
                        name={`count-${category.id}`}
                        value={v.count}
                        onValueChange={(count) =>
                          update(category.id, { count })
                        }
                      />
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        Skor minggu ini (opsional)
                      </p>
                      <input
                        type="hidden"
                        name={`rating-${category.id}`}
                        value={v.rating ?? ""}
                      />
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() =>
                                update(category.id, {
                                  rating: v.rating === n ? null : n,
                                })
                              }
                              className={`h-7 flex-1 rounded-md text-xs font-medium transition-colors ${
                                v.rating !== null && n <= v.rating
                                  ? "bg-emerald-500 text-white"
                                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                              }`}
                            >
                              {n}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <textarea
                    name={`notes-${category.id}`}
                    value={v.notes}
                    onChange={(e) =>
                      update(category.id, { notes: e.target.value })
                    }
                    rows={category.type === "counter" ? 2 : 4}
                    placeholder={
                      category.type === "counter"
                        ? "Catatan (opsional)..."
                        : "Apa yang dikerjakan/dicapai minggu ini?"
                    }
                    className="mt-3 w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200/70 bg-white/90 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {filledCount}/{items.length} kategori terisi
          </span>
          <SubmitButton>Simpan Check-in</SubmitButton>
        </div>
      </div>
    </form>
  );
}
