"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createCategory } from "@/app/lib/actions";
import { initialActionState } from "@/app/lib/action-state";
import { SubmitButton } from "@/app/components/SubmitButton";
import { Toast, type ToastState } from "@/app/components/Toast";
import { selectOnFocus } from "@/app/lib/number";

const COMMON_ICONS = ["📌", "📺", "🎵", "📸", "💼", "📚", "🌙", "🕌", "🤲", "💪", "💰", "🎯"];

export function AddCategoryForm({ groups }: { groups: string[] }) {
  const [type, setType] = useState<"counter" | "notes">("notes");
  const [icon, setIcon] = useState("📌");
  const [state, formAction] = useActionState(createCategory, initialActionState);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastIdRef = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "idle" || !state.message) return;
    toastIdRef.current += 1;
    setToast({
      id: toastIdRef.current,
      variant: state.status === "success" ? "success" : "error",
      message: state.message,
    });
    if (state.status === "success") {
      setType("notes");
      setIcon("📌");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <label className="text-sm font-medium" htmlFor="name">
            Nama kategori
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Misal: Konten LinkedIn"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Icon</label>
          <input type="hidden" name="icon" value={icon} />
          <div className="mt-1 flex flex-wrap gap-2">
            {COMMON_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-base transition-colors ${
                  icon === emoji
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                    : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="group">
            Grup
          </label>
          <input
            type="text"
            id="group"
            name="group"
            list="group-suggestions"
            defaultValue={groups[0] ?? "Umum"}
            placeholder="Misal: Ibadah"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <datalist id="group-suggestions">
            {groups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="type">
            Tipe
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "counter" | "notes")}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="notes">Catatan mingguan (freeform)</option>
            <option value="counter">Target angka mingguan (misal: konten, rakaat)</option>
          </select>
        </div>

        {type === "counter" && (
          <div>
            <label className="text-sm font-medium" htmlFor="weeklyTarget">
              Target per minggu
            </label>
            <input
              type="number"
              min={1}
              id="weeklyTarget"
              name="weeklyTarget"
              defaultValue={1}
              onFocus={selectOnFocus}
              className="mt-1 w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        )}

        <SubmitButton>Tambah Kategori</SubmitButton>
      </form>
      <Toast toast={toast} />
    </>
  );
}
