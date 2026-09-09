"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/app/lib/prisma";
import { parseIntOrNull } from "@/app/lib/number";
import { addDays, parseWeekParam } from "@/app/lib/week";
import { requireAuth } from "@/app/lib/auth";
import type { ActionState } from "@/app/lib/action-state";

// Submitting a check-in can touch dozens of rows at once (one WeeklyEntry per
// category, plus 7 DailyEntry rows for every daily-tracking category). Doing
// that as one upsert call per row inside a single interactive transaction
// means dozens of sequential network round-trips to the database, which can
// easily blow past Prisma's default 5s transaction timeout on a remote DB
// (see P2028). Instead, batch each table's rows into a single multi-row
// `INSERT ... ON CONFLICT DO UPDATE` so the whole check-in is just two
// queries.
export async function submitWeeklyCheckin(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();
  try {
    return await doSubmitWeeklyCheckin(formData);
  } catch (error) {
    console.error("submitWeeklyCheckin failed", error);
    return {
      status: "error",
      message:
        "Gagal menyimpan check-in. Coba lagi \u2014 data yang sudah tersimpan sebelumnya aman.",
    };
  }
}

async function doSubmitWeeklyCheckin(formData: FormData): Promise<ActionState> {
  const weekStartRaw = formData.get("weekStart");
  const weekStart = parseWeekParam(
    typeof weekStartRaw === "string" ? weekStartRaw : undefined
  );

  const categories = await prisma.category.findMany({
    where: { archived: false },
  });

  const dailyRows: { categoryId: string; date: Date; value: number }[] = [];
  const weeklyRows: {
    categoryId: string;
    notes: string;
    count: number | null;
    rating: number | null;
  }[] = [];

  for (const category of categories) {
    const notes = (formData.get(`notes-${category.id}`) as string) ?? "";
    let count: number | null = null;

    if (category.dailyTracking) {
      let total = 0;
      for (let i = 0; i < 7; i++) {
        const dayRaw = formData.get(`day-${category.id}-${i}`);
        const value = parseIntOrNull(dayRaw) ?? 0;
        total += value;
        dailyRows.push({
          categoryId: category.id,
          date: addDays(weekStart, i),
          value,
        });
      }
      count = total;
    } else if (category.type === "counter") {
      count = parseIntOrNull(formData.get(`count-${category.id}`));
    }

    const ratingRaw = parseIntOrNull(formData.get(`rating-${category.id}`));
    const rating =
      category.type === "notes" && ratingRaw !== null
        ? Math.min(10, Math.max(1, ratingRaw))
        : null;

    weeklyRows.push({ categoryId: category.id, notes, count, rating });
  }

  const operations: Prisma.PrismaPromise<unknown>[] = [];

  if (dailyRows.length > 0) {
    operations.push(
      prisma.$executeRaw`
        INSERT INTO "DailyEntry" ("id", "categoryId", "date", "value", "createdAt", "updatedAt")
        VALUES ${Prisma.join(
          dailyRows.map(
            (r) =>
              Prisma.sql`(${randomUUID()}, ${r.categoryId}, ${r.date}, ${r.value}, now(), now())`
          )
        )}
        ON CONFLICT ("categoryId", "date")
        DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now()
      `
    );
  }

  if (weeklyRows.length > 0) {
    operations.push(
      prisma.$executeRaw`
        INSERT INTO "WeeklyEntry" ("id", "categoryId", "weekStart", "notes", "count", "rating", "createdAt", "updatedAt")
        VALUES ${Prisma.join(
          weeklyRows.map(
            (r) =>
              Prisma.sql`(${randomUUID()}, ${r.categoryId}, ${weekStart}, ${r.notes}, ${r.count}, ${r.rating}, now(), now())`
          )
        )}
        ON CONFLICT ("categoryId", "weekStart")
        DO UPDATE SET "notes" = EXCLUDED."notes", "count" = EXCLUDED."count", "rating" = EXCLUDED."rating", "updatedAt" = now()
      `
    );
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations, { timeout: 15000, maxWait: 10000 });
  }

  revalidatePath("/");
  revalidatePath("/checkin");
  revalidatePath("/history");

  return { status: "success", message: "Check-in tersimpan." };
}

export async function createCategory(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();
  const name = (formData.get("name") as string)?.trim();
  const type = formData.get("type") as string;
  const weeklyTargetRaw = formData.get("weeklyTarget");
  const group = ((formData.get("group") as string) || "Umum").trim();
  const icon = ((formData.get("icon") as string) || "\u{1F4CC}").trim();

  if (!name) {
    return { status: "error", message: "Nama kategori wajib diisi." };
  }
  if (type !== "counter" && type !== "notes") {
    return { status: "error", message: "Tipe kategori tidak valid." };
  }

  const weeklyTarget =
    type === "counter" ? Math.max(1, parseIntOrNull(weeklyTargetRaw) ?? 1) : null;

  try {
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
  } catch (error) {
    console.error("createCategory failed", error);
    return { status: "error", message: "Gagal menambahkan kategori. Coba lagi." };
  }

  revalidatePath("/");
  revalidatePath("/checkin");
  revalidatePath("/history");
  revalidatePath("/settings");
  return { status: "success", message: `Kategori "${name}" ditambahkan.` };
}

export async function updateCategory(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const icon = ((formData.get("icon") as string) || "\u{1F4CC}").trim();
  const group = ((formData.get("group") as string) || "Umum").trim();
  const weeklyTargetRaw = formData.get("weeklyTarget");
  const dailyTracking = formData.get("dailyTracking") === "on";

  if (!id || !name) {
    return { status: "error", message: "Nama kategori wajib diisi." };
  }

  try {
    const category = await prisma.category.findUniqueOrThrow({ where: { id } });

    const weeklyTarget =
      category.type === "counter"
        ? Math.max(1, parseIntOrNull(weeklyTargetRaw) ?? category.weeklyTarget ?? 1)
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
  } catch (error) {
    console.error("updateCategory failed", error);
    return { status: "error", message: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath("/");
  revalidatePath("/checkin");
  revalidatePath("/history");
  revalidatePath("/settings");
  return { status: "success", message: "Perubahan disimpan." };
}

export async function archiveCategory(formData: FormData) {
  await requireAuth();
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

export async function unarchiveCategory(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.category.update({
    where: { id },
    data: { archived: false },
  });

  revalidatePath("/");
  revalidatePath("/checkin");
  revalidatePath("/history");
  revalidatePath("/settings");
}
