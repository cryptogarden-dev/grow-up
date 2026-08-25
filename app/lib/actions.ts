"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { addDays, parseWeekParam } from "@/app/lib/week";

type TransactionOp =
  | ReturnType<typeof prisma.weeklyEntry.upsert>
  | ReturnType<typeof prisma.dailyEntry.upsert>;

export async function submitWeeklyCheckin(formData: FormData) {
  const weekStartRaw = formData.get("weekStart");
  const weekStart = parseWeekParam(
    typeof weekStartRaw === "string" ? weekStartRaw : undefined
  );

  const categories = await prisma.category.findMany({
    where: { archived: false },
  });

  const operations: TransactionOp[] = [];

  for (const category of categories) {
    const notes = (formData.get(`notes-${category.id}`) as string) ?? "";
    let count: number | null = null;

    if (category.dailyTracking) {
      let total = 0;
      for (let i = 0; i < 7; i++) {
        const dayRaw = formData.get(`day-${category.id}-${i}`) as
          | string
          | null;
        const value = dayRaw ? Number.parseInt(dayRaw, 10) || 0 : 0;
        total += value;
        const date = addDays(weekStart, i);
        operations.push(
          prisma.dailyEntry.upsert({
            where: { categoryId_date: { categoryId: category.id, date } },
            update: { value },
            create: { categoryId: category.id, date, value },
          })
        );
      }
      count = total;
    } else if (category.type === "counter") {
      const countRaw = formData.get(`count-${category.id}`) as string | null;
      count =
        countRaw !== null && countRaw !== ""
          ? Number.parseInt(countRaw, 10)
          : null;
    }

    const ratingRaw = formData.get(`rating-${category.id}`) as string | null;
    const rating =
      category.type === "notes" && ratingRaw !== null && ratingRaw !== ""
        ? Number.parseInt(ratingRaw, 10)
        : null;

    operations.push(
      prisma.weeklyEntry.upsert({
        where: {
          categoryId_weekStart: {
            categoryId: category.id,
            weekStart,
          },
        },
        update: { notes, count, rating },
        create: {
          categoryId: category.id,
          weekStart,
          notes,
          count,
          rating,
        },
      })
    );
  }

  await prisma.$transaction(operations);

  revalidatePath("/");
  revalidatePath("/checkin");
  revalidatePath("/history");
}

export async function createCategory(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const type = formData.get("type") as string;
  const weeklyTargetRaw = formData.get("weeklyTarget") as string | null;
  const group = ((formData.get("group") as string) || "Umum").trim();
  const icon = ((formData.get("icon") as string) || "\u{1F4CC}").trim();

  if (!name || (type !== "counter" && type !== "notes")) {
    throw new Error("Invalid category input");
  }

  const weeklyTarget =
    type === "counter" && weeklyTargetRaw
      ? Number.parseInt(weeklyTargetRaw, 10)
      : null;

  const maxOrder = await prisma.category.aggregate({
    _max: { order: true },
  });

  await prisma.category.create({
    data: {
      name,
      type,
      weeklyTarget,
      group,
      icon,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/");
  revalidatePath("/checkin");
  revalidatePath("/history");
  revalidatePath("/settings");
}

export async function updateCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const icon = ((formData.get("icon") as string) || "\u{1F4CC}").trim();
  const group = ((formData.get("group") as string) || "Umum").trim();
  const weeklyTargetRaw = formData.get("weeklyTarget") as string | null;
  const dailyTracking = formData.get("dailyTracking") === "on";

  if (!id || !name) {
    throw new Error("Invalid category input");
  }

  const category = await prisma.category.findUniqueOrThrow({ where: { id } });

  const weeklyTarget =
    category.type === "counter" && weeklyTargetRaw
      ? Number.parseInt(weeklyTargetRaw, 10)
      : category.weeklyTarget;

  await prisma.category.update({
    where: { id },
    data: {
      name,
      icon,
      group,
      weeklyTarget,
      dailyTracking: category.type === "counter" ? dailyTracking : false,
    },
  });

  revalidatePath("/");
  revalidatePath("/checkin");
  revalidatePath("/history");
  revalidatePath("/settings");
}

export async function archiveCategory(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.category.update({
    where: { id },
    data: { archived: true },
  });

  revalidatePath("/");
  revalidatePath("/checkin");
  revalidatePath("/history");
  revalidatePath("/settings");
}
