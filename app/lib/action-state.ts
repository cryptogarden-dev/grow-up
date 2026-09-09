/**
 * Shared result shape for Server Actions used with `useActionState`, so
 * forms can show an explicit "saved" or "failed" toast instead of leaving
 * the user to guess whether it worked. Also why action bodies that use this
 * wrap their logic in try/catch: an uncaught throw would trip the nearest
 * `error.tsx` boundary and blow away the form's in-progress state instead
 * of just showing an inline error next to the field that caused it.
 */
export type ActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const initialActionState: ActionState = {
  status: "idle",
  message: null,
};
