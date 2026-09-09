import { deleteTask, toggleTask } from "@/app/lib/goalActions";

export function TaskRow({
  task,
  subtitle,
}: {
  task: { id: string; title: string; done: boolean };
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <form action={toggleTask} className="min-w-0 flex-1">
        <input type="hidden" name="id" value={task.id} />
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-all duration-200 ${
              task.done
                ? "animate-pop-in border-emerald-500 bg-emerald-500 text-white"
                : "border-zinc-300 text-transparent hover:border-emerald-400 dark:border-zinc-600"
            }`}
          >
            ✓
          </span>
          <span className="min-w-0 flex-1 truncate">
            <span
              className={
                task.done
                  ? "text-zinc-400 line-through dark:text-zinc-500"
                  : ""
              }
            >
              {task.title}
            </span>
            {subtitle && (
              <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                · {subtitle}
              </span>
            )}
          </span>
        </button>
      </form>
      <form action={deleteTask}>
        <input type="hidden" name="id" value={task.id} />
        <button
          type="submit"
          aria-label="Hapus langkah"
          className="shrink-0 rounded-full p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-900/20"
        >
          ✕
        </button>
      </form>
    </div>
  );
}
