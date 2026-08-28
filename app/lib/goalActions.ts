"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

function parseDeadline(raw: FormDataEntryValue | null): Date | null {
  if (typeof raw !== "string" || !raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createGoal(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const area = (formData.get("area") as string)?.trim();
  const period = ((formData.get("period") as string) || "").trim();
  const targetValue = ((formData.get("targetValue") as string) || "").trim();
  const deadline = parseDeadline(formData.get("deadline"));

  if (!title || !area) {
    throw new Error("Invalid goal input");
  }

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

  revalidatePath("/goals");
}

export async function archiveGoal(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.goal.update({ where: { id }, data: { archived: true } });

  revalidatePath("/goals");
}

export async function createTask(formData: FormData) {
  const goalId = formData.get("goalId") as string;
  const title = (formData.get("title") as string)?.trim();
  if (!goalId || !title) return;

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

  revalidatePath("/goals");
}

export async function toggleTask(formData: FormData) {
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
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.task.delete({ where: { id } });

  revalidatePath("/goals");
}
