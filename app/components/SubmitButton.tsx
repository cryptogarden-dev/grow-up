"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : children}
    </button>
  );
}
