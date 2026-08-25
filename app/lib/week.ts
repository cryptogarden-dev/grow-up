/**
 * Week utilities. Weeks run Monday -> Sunday, and are always identified by
 * the Date (at local midnight) of their Monday.
 */

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

export function addWeeks(weekStart: Date, amount: number): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + amount * 7);
  return d;
}

export function getWeekEnd(weekStart: Date): Date {
  return addWeeks(weekStart, 1);
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function isSameWeek(a: Date, b: Date): boolean {
  return getWeekStart(a).getTime() === getWeekStart(b).getTime();
}

const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
});

const DATE_FORMAT_WITH_YEAR = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return `${DATE_FORMAT.format(weekStart)} - ${DATE_FORMAT_WITH_YEAR.format(end)}`;
}

export function weekStartKey(weekStart: Date): string {
  const y = weekStart.getFullYear();
  const m = String(weekStart.getMonth() + 1).padStart(2, "0");
  const d = String(weekStart.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parses a "YYYY-MM-DD" key (as produced by weekStartKey) back into a local
 * Date, normalized to the start of that week. Falls back to the current
 * week for missing/invalid input.
 */
export function parseWeekParam(value: string | undefined | null): Date {
  if (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      const [, y, m, d] = match;
      return getWeekStart(new Date(Number(y), Number(m) - 1, Number(d)));
    }
  }
  return getWeekStart(new Date());
}
