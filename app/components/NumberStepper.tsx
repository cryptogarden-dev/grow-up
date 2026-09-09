import { clampInt, selectOnFocus } from "@/app/lib/number";

export function NumberStepper({
  name,
  value,
  onValueChange,
  min = 0,
}: {
  name: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onValueChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg leading-none text-zinc-600 transition-all hover:bg-zinc-100 active:scale-90 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        aria-label="Kurangi"
      >
        −
      </button>
      <input
        type="number"
        name={name}
        min={min}
        step={1}
        value={value}
        onChange={(e) => onValueChange(clampInt(e.target.value, min))}
        onFocus={selectOnFocus}
        className="w-16 rounded-lg border border-zinc-300 px-2 py-1.5 text-center text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <button
        type="button"
        onClick={() => onValueChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg leading-none text-zinc-600 transition-all hover:scale-105 hover:bg-zinc-100 active:scale-90 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        aria-label="Tambah"
      >
        +
      </button>
    </div>
  );
}
