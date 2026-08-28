import { createGoal } from "@/app/lib/goalActions";
import { SubmitButton } from "@/app/components/SubmitButton";

export function AddGoalForm({ areas }: { areas: string[] }) {
  return (
    <form
      action={createGoal}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div>
        <label className="text-sm font-medium" htmlFor="goal-title">
          Goal
        </label>
        <input
          type="text"
          id="goal-title"
          name="title"
          required
          placeholder="Misal: Modal 250 juta"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="goal-area">
          Area / Project
        </label>
        <input
          type="text"
          id="goal-area"
          name="area"
          list="goal-area-suggestions"
          required
          placeholder="Misal: Panglima Motor"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <datalist id="goal-area-suggestions">
          {areas.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium" htmlFor="goal-period">
            Periode
          </label>
          <input
            type="text"
            id="goal-period"
            name="period"
            placeholder="2026-2027"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="goal-deadline">
            Deadline
          </label>
          <input
            type="date"
            id="goal-deadline"
            name="deadline"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="goal-target">
          Target (opsional)
        </label>
        <input
          type="text"
          id="goal-target"
          name="targetValue"
          placeholder="Misal: 10rb follower"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>

      <SubmitButton>Tambah Goal</SubmitButton>
    </form>
  );
}
