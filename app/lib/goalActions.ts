"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/auth";
import type { ActionState } from "@/app/lib/action-state";

/**
 * Parses a "YYYY-MM-DD" value from an `<input type="date">` into a local
 * Date at local midnight. Deliberately avoids `new Date(rawString)`: JS
 * parses date-only strings as UTC midnight, which can silently shift the
 * displayed deadline a day earlier once formatted in a timezone behind UTC
 * (see the same concern called out in `app/lib/week.ts`).
 */
function parseDeadline(raw: FormDataEntryValue | null): Date | null {
  if (typeof raw !== "string" || !raw) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createGoal(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();
  const title = (formData.get("title") as string)?.trim();
  const area = (formData.get("area") as string)?.trim();
  const period = ((formData.get("period") as string) || "").trim();
  const targetValue = ((formData.get("targetValue") as string) || "").trim();
  const deadline = parseDeadline(formData.get("deadline"));

  if (!title || !area) {
    return { status: "error", message: "Goal dan area wajib diisi." };
  }

  try {
    const maxOrder = await prisma.goal.aggregate({ _max: { order: true } });

    await prisma.goal.create({
      data: {
        title,
        area,
        period,
        targetValue,
        deadline,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  } catch (error) {
    console.error("createGoal failed", error);
    return { status: "error", message: "Gagal menambahkan goal. Coba lagi." };
  }

  revalidatePath("/goals");
  return { status: "success", message: `Goal "${title}" ditambahkan.` };
}

export async function archiveGoal(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.goal.update({ where: { id }, data: { archived: true } });

  revalidatePath("/goals");
}

export async function unarchiveGoal(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.goal.update({ where: { id }, data: { archived: false } });

  revalidatePath("/goals");
}

export async function createTask(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();
  const goalId = formData.get("goalId") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!goalId) {
    return { status: "error", message: "Goal tidak ditemukan." };
  }
  if (!title) {
    return { status: "error", message: "Langkah tidak boleh kosong." };
  }

  try {
    const maxOrder = await prisma.task.aggregate({
      where: { goalId },
      _max: { order: true },
    });

    await prisma.task.create({
      data: {
        goalId,
        title,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  } catch (error) {
    console.error("createTask failed", error);
    return { status: "error", message: "Gagal menambahkan langkah. Coba lagi." };
  }

  revalidatePath("/goals");
  return { status: "success", message: "Langkah ditambahkan." };
}

export async function toggleTask(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  if (!id) return;

  const task = await prisma.task.findUniqueOrThrow({ where: { id } });
  const done = !task.done;

  await prisma.task.update({
    where: { id },
    data: { done, doneAt: done ? new Date() : null },
  });

  revalidatePath("/goals");
}

export async function deleteTask(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.task.delete({ where: { id } });

  revalidatePath("/goals");
}
