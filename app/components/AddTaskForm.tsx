"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTask } from "@/app/lib/goalActions";
import { initialActionState } from "@/app/lib/action-state";
import { SubmitButton } from "@/app/components/SubmitButton";
import { Toast, type ToastState } from "@/app/components/Toast";

export function AddTaskForm({ goalId }: { goalId: string }) {
  const [state, formAction] = useActionState(createTask, initialActionState);
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
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <>
      <form ref={formRef} action={formAction} className="mt-3 flex gap-2">
        <input type="hidden" name="goalId" value={goalId} />
        <input
          type="text"
          name="title"
          placeholder="Tambah langkah kecil..."
          required
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <SubmitButton>+</SubmitButton>
      </form>
      <Toast toast={toast} />
    </>
  );
}
