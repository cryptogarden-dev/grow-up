"use client";

import { useState } from "react";
import { archiveCategory, updateCategory } from "@/app/lib/actions";
import { SubmitButton } from "@/app/components/SubmitButton";

const COMMON_ICONS = [
  "📌",
  "📺",
  "🎵",
  "📸",
  "💼",
  "📚",
  "🌙",
  "🕌",
  "🤲",
  "💪",
  "💰",
  "🎯",
];

export type EditableCategory = {
  id: string;
  name: string;
  type: string;
  weeklyTarget: number | null;
  group: string;
  icon: string;
  dailyTracking: boolean;
};

export function CategoryRow({
  category,
  groups,
}: {
  category: EditableCategory;
  groups: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [icon, setIcon] = useState(category.icon);

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-base dark:bg-zinc-800">
            {category.icon}
          </span>
          <div>
            <p className="font-medium leading-tight">{category.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {category.type === "counter"
                ? `Target ${category.weeklyTarget}/minggu${
                    category.dailyTracking ? " · dicatat harian" : ""
                  }`
                : "Catatan mingguan"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Edit
          </button>
          <form action={archiveCategory}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Arsipkan
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form
      action={updateCategory}
      onSubmit={() => setEditing(false)}
      className="flex flex-col gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/40 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20"
    >
      <input type="hidden" name="id" value={category.id} />
      <input type="hidden" name="icon" value={icon} />

      <div className="flex flex-wrap gap-2">
        {COMMON_ICONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => setIcon(emoji)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-colors ${
              icon === emoji
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <input
        type="text"
        name="name"
        defaultValue={category.name}
        required
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />

      <input
        type="text"
        name="group"
        defaultValue={category.group}
        list="edit-group-suggestions"
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <datalist id="edit-group-suggestions">
        {groups.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>

      {category.type === "counter" && (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            Target/minggu
            <input
              type="number"
              name="weeklyTarget"
              min={1}
              defaultValue={category.weeklyTarget ?? 1}
              className="w-20 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="dailyTracking"
              defaultChecked={category.dailyTracking}
              className="h-4 w-4"
            />
            Catat per hari
          </label>
        </div>
      )}

      <div className="flex gap-2">
        <SubmitButton>Simpan</SubmitButton>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
