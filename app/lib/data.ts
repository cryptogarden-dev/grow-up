import { prisma } from "@/app/lib/prisma";
import {
  addDays,
  addWeeks,
  formatWeekLabel,
  getWeekStart,
  weekStartKey,
} from "@/app/lib/week";
import {
  computeAdaptiveTarget,
  EQUILIBRIUM_WINDOW_WEEKS,
  type AdaptiveTarget,
} from "@/app/lib/equilibrium";
import type { CategoryModel } from "@/app/generated/prisma/models";

export type CategoryType = "counter" | "notes";

/** A rating of 7+/10 counts as a good week for "notes" categories. */
const GOOD_RATING_THRESHOLD = 7;

function adaptiveKey(categoryId: string, weekStart: Date): string {
  return `${categoryId}_${weekStart.getTime()}`;
}

/**
 * Batch-computes adaptive ("1% better") targets for every counter category
 * across a set of weeks, in a single query. For each requested week, the
 * equilibrium is derived only from the `EQUILIBRIUM_WINDOW_WEEKS` weeks
 * strictly before it, so this never leaks a week's own result into its own
 * target (no lookahead bias).
 */
async function getAdaptiveTargetMap(
  categories: Pick<CategoryModel, "id" | "type" | "weeklyTarget">[],
  weekStarts: Date[]
): Promise<Map<string, AdaptiveTarget>> {
  const result = new Map<string, AdaptiveTarget>();
  const counters = categories.filter((c) => c.type === "counter");
  if (counters.length === 0 || weekStarts.length === 0) return result;

  const earliest = weekStarts.reduce((min, w) => (w < min ? w : min));
  const latest = weekStarts.reduce((max, w) => (w > max ? w : max));
  const rangeStart = addWeeks(earliest, -EQUILIBRIUM_WINDOW_WEEKS);

  const history = await prisma.weeklyEntry.findMany({
    where: {
      categoryId: { in: counters.map((c) => c.id) },
      weekStart: { gte: rangeStart, lte: latest },
    },
    select: { categoryId: true, weekStart: true, count: true },
  });

  const countByKey = new Map(
    history.map((e) => [adaptiveKey(e.categoryId, e.weekStart), e.count ?? 0])
  );

  for (const category of counters) {
    for (const weekStart of weekStarts) {
      const priorCounts: number[] = [];
      for (let i = EQUILIBRIUM_WINDOW_WEEKS; i >= 1; i--) {
        const w = addWeeks(weekStart, -i);
        priorCounts.push(countByKey.get(adaptiveKey(category.id, w)) ?? 0);
      }
      result.set(
        adaptiveKey(category.id, weekStart),
        computeAdaptiveTarget(category.weeklyTarget ?? 1, priorCounts)
      );
    }
  }

  return result;
}

/**
 * Whether a category's weekly target was met (counter) or the check-in was
 * filled in with actual content (notes). Used to compute scores/streaks.
 *
 * For counter categories, `adaptiveTarget` (the 1%-better equilibrium bar)
 * is used when provided, falling back to the category's fixed
 * `weeklyTarget` otherwise.
 */
export function isCategoryAchieved(
  category: Pick<CategoryModel, "type" | "weeklyTarget">,
  entry:
    | { count: number | null; notes: string; rating?: number | null }
    | null
    | undefined,
  adaptiveTarget?: number | null
): boolean {
  if (!entry) return false;
  if (category.type === "counter") {
    const target = adaptiveTarget ?? category.weeklyTarget ?? 1;
    return (entry.count ?? 0) >= target;
  }
  if (typeof entry.rating === "number") {
    return entry.rating >= GOOD_RATING_THRESHOLD;
  }
  return entry.notes.trim().length > 0;
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  });
}

export async function getCategoriesWithEntryForWeek(weekStart: Date) {
  const categories = await getCategories();
  const entries = await prisma.weeklyEntry.findMany({
    where: { weekStart },
  });
  const entryByCategory = new Map(entries.map((e) => [e.categoryId, e]));

  const dailyCategoryIds = categories
    .filter((c) => c.dailyTracking)
    .map((c) => c.id);
  const weekEnd = addDays(weekStart, 6);
  const dailyEntries = dailyCategoryIds.length
    ? await prisma.dailyEntry.findMany({
        where: {
          categoryId: { in: dailyCategoryIds },
          date: { gte: weekStart, lte: weekEnd },
        },
      })
    : [];

  const adaptiveTargets = await getAdaptiveTargetMap(categories, [weekStart]);

  return categories.map((category) => {
    const dailyValues = category.dailyTracking
      ? Array.from({ length: 7 }, (_, i) => {
          const day = addDays(weekStart, i);
          const found = dailyEntries.find(
            (d) =>
              d.categoryId === category.id &&
              d.date.getTime() === day.getTime()
          );
          return found?.value ?? 0;
        })
      : null;

    const adaptive = adaptiveTargets.get(adaptiveKey(category.id, weekStart));

    return {
      category,
      entry: entryByCategory.get(category.id) ?? null,
      dailyValues,
      adaptiveTarget: adaptive?.adaptiveTarget ?? category.weeklyTarget ?? null,
      equilibrium: adaptive?.equilibrium ?? null,
    };
  });
}

export async function getHistory(limit = 12) {
  const categories = await getCategories();

  const weekStarts = await prisma.weeklyEntry.findMany({
    distinct: ["weekStart"],
    orderBy: { weekStart: "desc" },
    take: limit,
    select: { weekStart: true },
  });

  const weekStartDates = weekStarts.map((w) => w.weekStart);

  const entries = await prisma.weeklyEntry.findMany({
    where: {
      weekStart: { in: weekStartDates },
    },
  });

  const adaptiveTargets = await getAdaptiveTargetMap(
    categories,
    weekStartDates
  );
  const counterCategoryIds = categories
    .filter((c) => c.type === "counter")
    .map((c) => c.id);

  const weeks = weekStartDates.map((weekStart) => {
    const entriesForWeek = entries.filter(
      (e) => e.weekStart.getTime() === weekStart.getTime()
    );
    const adaptiveTargetByCategory = new Map(
      counterCategoryIds.map((id) => {
        const category = categories.find((c) => c.id === id)!;
        const adaptive = adaptiveTargets.get(adaptiveKey(id, weekStart));
        return [
          id,
          adaptive?.adaptiveTarget ?? category.weeklyTarget ?? 1,
        ] as const;
      })
    );
    return {
      weekStart,
      entriesByCategory: new Map(
        entriesForWeek.map((e) => [e.categoryId, e])
      ),
      adaptiveTargetByCategory,
    };
  });

  return { categories, weeks };
}

export async function getCurrentStreak() {
  const categories = await getCategories();
  if (categories.length === 0) return 0;

  const entries = await prisma.weeklyEntry.findMany({
    orderBy: { weekStart: "desc" },
  });

  let streak = 0;
  const weekCursor = getWeekStart(new Date());

  // If the current week hasn't been filled in yet, start counting from last
  // week instead, so an in-progress week doesn't reset the streak to 0.
  const hasCurrentWeekEntries = entries.some(
    (e) => e.weekStart.getTime() === weekCursor.getTime()
  );
  if (!hasCurrentWeekEntries) {
    weekCursor.setDate(weekCursor.getDate() - 7);
  }

  while (true) {
    const entriesThisWeek = entries.filter(
      (e) => e.weekStart.getTime() === weekCursor.getTime()
    );
    if (entriesThisWeek.length === 0) break;

    const allFilled = categories.every((c) =>
      entriesThisWeek.some((e) => e.categoryId === c.id)
    );
    if (!allFilled) break;

    streak += 1;
    weekCursor.setDate(weekCursor.getDate() - 7);
  }

  return streak;
}

export type WeeklyScorePoint = {
  weekStart: Date;
  label: string;
  score: number;
};

export type CategoryTrend = {
  category: CategoryModel;
  thisValue: number;
  lastValue: number;
  delta: number;
  streak: number;
  /** This week's 1%-better adaptive target (counter categories only). */
  adaptiveTarget: number | null;
};

/**
 * Weekly recap inspired by Atomic Habits' idea of measuring the system, not
 * just the outcome: a completion score per week (percentage of categories
 * that hit their target / were filled in), a trend over the last N weeks,
 * and per-category deltas plus individual streaks (do not break the chain).
 */
export async function getWeeklyRecap(weeksBack = 8) {
  const categories = await getCategories();
  const currentWeekStart = getWeekStart();

  const weekStarts: Date[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    weekStarts.push(addWeeks(currentWeekStart, -i));
  }

  const allEntries = await prisma.weeklyEntry.findMany({
    where: { weekStart: { in: weekStarts } },
  });

  const entryByKey = new Map(
    allEntries.map((e) => [`${e.categoryId}_${e.weekStart.getTime()}`, e])
  );

  // Each week's score is measured against *that week's own* adaptive
  // target, computed only from the weeks before it, so the trend line
  // reflects "were you 1% better than your own recent self" rather than a
  // number frozen at category-creation time.
  const adaptiveTargets = await getAdaptiveTargetMap(categories, weekStarts);

  const weeklyScores: WeeklyScorePoint[] = weekStarts.map((weekStart) => {
    const achieved = categories.filter((category) => {
      const adaptive = adaptiveTargets.get(
        adaptiveKey(category.id, weekStart)
      );
      return isCategoryAchieved(
        category,
        entryByKey.get(`${category.id}_${weekStart.getTime()}`),
        adaptive?.adaptiveTarget
      );
    }).length;
    const score = categories.length
      ? Math.round((achieved / categories.length) * 100)
      : 0;
    return { weekStart, label: formatWeekLabel(weekStart), score };
  });

  const thisWeekScore = weeklyScores.at(-1)?.score ?? 0;
  const lastWeekScore = weeklyScores.at(-2)?.score ?? 0;
  const scoreDelta = thisWeekScore - lastWeekScore;

  // For streaks, look further back than the chart window so a long-running
  // habit isn't artificially capped by weeksBack.
  const streakEntries = await prisma.weeklyEntry.findMany({
    orderBy: { weekStart: "desc" },
  });

  const categoryTrends: CategoryTrend[] = categories.map((category) => {
    const lastWeekStart = addWeeks(currentWeekStart, -1);
    const thisEntry = entryByKey.get(
      `${category.id}_${currentWeekStart.getTime()}`
    );
    const lastEntry = entryByKey.get(
      `${category.id}_${lastWeekStart.getTime()}`
    );

    const thisValue =
      category.type === "counter"
        ? thisEntry?.count ?? 0
        : thisEntry?.rating ?? (thisEntry ? 1 : 0);
    const lastValue =
      category.type === "counter"
        ? lastEntry?.count ?? 0
        : lastEntry?.rating ?? (lastEntry ? 1 : 0);

    const categoryEntries = streakEntries.filter(
      (e) => e.categoryId === category.id
    );
    let streak = 0;
    let cursor = currentWeekStart;
    const hasCurrent = categoryEntries.some(
      (e) => e.weekStart.getTime() === cursor.getTime()
    );
    if (!hasCurrent) {
      cursor = addWeeks(cursor, -1);
    }
    while (true) {
      const entry = categoryEntries.find(
        (e) => e.weekStart.getTime() === cursor.getTime()
      );
      if (!isCategoryAchieved(category, entry)) break;
      streak += 1;
      cursor = addWeeks(cursor, -1);
    }

    const currentAdaptive = adaptiveTargets.get(
      adaptiveKey(category.id, currentWeekStart)
    );

    return {
      category,
      thisValue,
      lastValue,
      delta: thisValue - lastValue,
      streak,
      adaptiveTarget: currentAdaptive?.adaptiveTarget ?? null,
    };
  });

  return {
    weeklyScores,
    thisWeekScore,
    lastWeekScore,
    scoreDelta,
    categoryTrends,
  };
}

export type CategoryHistoryPoint = { label: string; value: number };
export type CategoryHistory = {
  category: CategoryModel;
  points: CategoryHistoryPoint[];
  currentValue: number;
};

/**
 * Per-category history for sparkline charts: the measurable value each week
 * (count for counter categories, rating -or filled-in flag- for notes ones).
 */
export async function getCategoryHistories(
  weeksBack = 12
): Promise<CategoryHistory[]> {
  const categories = await getCategories();
  const currentWeekStart = getWeekStart();

  const weekStarts: Date[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    weekStarts.push(addWeeks(currentWeekStart, -i));
  }

  const entries = await prisma.weeklyEntry.findMany({
    where: { weekStart: { in: weekStarts } },
  });

  return categories.map((category) => {
    const categoryEntries = entries.filter(
      (e) => e.categoryId === category.id
    );

    const points = weekStarts.map((weekStart) => {
      const entry = categoryEntries.find(
        (e) => e.weekStart.getTime() === weekStart.getTime()
      );
      const value =
        category.type === "counter"
          ? entry?.count ?? 0
          : entry?.rating ?? (entry ? 1 : 0);
      return { label: weekStartKey(weekStart), value };
    });

    return {
      category,
      points,
      currentValue: points.at(-1)?.value ?? 0,
    };
  });
}
