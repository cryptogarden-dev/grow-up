"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary: catches crashes in the root layout itself
 * (where `app/error.tsx` can't reach, since that boundary is rendered
 * *inside* the layout). Must render its own <html>/<body> since the real
 * layout may be the thing that failed.
 */
export default function GlobalError({
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
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center text-zinc-900">
        <span className="text-4xl">⚠️</span>
        <div>
          <h1 className="text-lg font-semibold">Aplikasi gagal dimuat</h1>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">
            Terjadi kesalahan yang nggak terduga. Coba muat ulang halaman ini.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          Muat ulang
        </button>
      </body>
    </html>
  );
}
