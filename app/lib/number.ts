/**
 * Small shared helpers for turning raw, possibly-invalid string input (from
 * controlled `<input type="number">` elements or `FormData` values) into
 * safe integers. Centralized here so client inputs and server actions treat
 * malformed/empty input the same way instead of each guessing separately.
 */

/**
 * Parses a live `<input type="number">` value while the user is typing.
 * Rounds to the nearest integer (number inputs here are always whole
 * counts) and clamps to `min`. Empty or non-numeric input falls back to
 * `min` rather than producing `NaN`.
 */
export function clampInt(raw: string, min = 0): number {
  const n = Math.round(Number(raw));
  return Number.isFinite(n) ? Math.max(min, n) : min;
}

/**
 * Parses a `FormData` string value as a base-10 integer, returning `null`
 * for anything that isn't a valid, finite number (missing, empty, or
 * garbage that bypassed client-side validation) instead of `NaN`.
 */
export function parseIntOrNull(
  raw: FormDataEntryValue | null | undefined
): number | null {
  if (typeof raw !== "string" || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Focus handler for `<input type="number">` fields that selects the
 * existing value. Without this, tapping into a field pre-filled with `0`
 * (a common default for counters) puts the cursor after the digit instead
 * of selecting it — especially on mobile, where there's no click-drag to
 * select manually — so typing a new digit appends to "0" instead of
 * replacing it. Selecting on focus means the first keystroke always
 * replaces the old value.
 */
export function selectOnFocus(e: import("react").FocusEvent<HTMLInputElement>) {
  e.target.select();
}
