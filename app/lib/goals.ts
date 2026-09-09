import { prisma } from "@/app/lib/prisma";
import type { GoalModel, TaskModel } from "@/app/generated/prisma/models";

const AREA_ICONS: Record<string, string> = {
  "Panglima Motor": "🏍️",
  "Toko Zoya": "🛍️",
  Personal: "🎓",
  Crypgarden: "🌱",
};

export function areaIcon(area: string): string {
  return AREA_ICONS[area] ?? "🎯";
}

export type GoalWithTasks = GoalModel & { tasks: TaskModel[] };

export type GoalGroup = {
  area: string;
  goals: GoalWithTasks[];
};

/** Groups goals by `area`, preserving first-seen order (matches `order`). */
function groupByArea(goals: GoalWithTasks[]): GoalGroup[] {
  const order: string[] = [];
  const map = new Map<string, GoalWithTasks[]>();
  for (const goal of goals) {
    if (!map.has(goal.area)) {
      map.set(goal.area, []);
      order.push(goal.area);
    }
    map.get(goal.area)!.push(goal);
  }
  return order.map((area) => ({ area, goals: map.get(area)! }));
}

export async function getGoalGroups(): Promise<GoalGroup[]> {
  const goals = await prisma.goal.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
    include: { tasks: { orderBy: { order: "asc" } } },
  });
  return groupByArea(goals);
}

export async function getArchivedGoals(): Promise<GoalWithTasks[]> {
  return prisma.goal.findMany({
    where: { archived: true },
    orderBy: { order: "asc" },
    include: { tasks: { orderBy: { order: "asc" } } },
  });
}

export function goalProgress(goal: GoalWithTasks): {
  done: number;
  total: number;
} {
  return {
    done: goal.tasks.filter((t) => t.done).length,
    total: goal.tasks.length,
  };
}

export type FocusTask = TaskModel & {
  goal: Pick<GoalModel, "id" | "title" | "area">;
};

/**
 * The next few not-yet-done tasks across all goals, in goal/task order.
 * This is the "what small thing can I actually do today" view, so a big
 * roadmap doesn't feel overwhelming.
 */
export async function getTodayFocusTasks(limit = 5): Promise<FocusTask[]> {
  const tasks = await prisma.task.findMany({
    where: { done: false, goal: { archived: false } },
    orderBy: [{ goal: { order: "asc" } }, { order: "asc" }],
    take: limit,
    include: { goal: { select: { id: true, title: true, area: true } } },
  });
  return tasks;
}
