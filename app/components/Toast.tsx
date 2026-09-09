"use client";

import { useEffect, useState } from "react";

export type ToastState = {
  /** Bump this on every submission (even repeated identical results) so the
   * toast re-appears and its auto-dismiss timer restarts each time. */
  id: number;
  variant: "success" | "error";
  message: string;
};

/**
 * Fixed-position toast for showing save/mutation results. Auto-dismisses
 * after a few seconds, but can also be dismissed manually. Renders nothing
 * until a toast has actually fired.
 */
export function Toast({ toast }: { toast: ToastState | null }) {
  const [dismissedId, setDismissedId] = useState<number | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setDismissedId(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast || dismissedId === toast.id) return null;

  const isSuccess = toast.variant === "success";

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 sm:bottom-6"
    >
      <div
        className={`animate-pop-in flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg ${
          isSuccess
            ? "bg-emerald-600 text-white"
            : "bg-red-600 text-white"
        }`}
      >
        <span>{isSuccess ? "✓" : "⚠️"}</span>
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={() => setDismissedId(toast.id)}
          aria-label="Tutup"
          className="ml-1 opacity-80 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
