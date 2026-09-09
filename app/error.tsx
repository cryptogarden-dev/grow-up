"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown anywhere under the root layout (pages, layouts,
 * server actions that aren't caught locally) and shows a friendly recovery
 * screen instead of Next.js' raw crash overlay. Doesn't cover errors thrown
 * inside `app/layout.tsx` itself — see `global-error.tsx` for that.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="text-4xl">⚠️</span>
      <div>
        <h1 className="text-lg font-semibold">Ada yang salah</h1>
        <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Terjadi kesalahan saat memuat atau menyimpan data. Coba lagi — kalau
          masih gagal, datamu aman, cuma perlu dicoba beberapa saat lagi.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
      >
        Coba lagi
      </button>
    </div>
  );
}
