/**
 * A circular progress indicator, typically wrapped around a category icon
 * to show weekly target completion at a glance. Pure presentational (no
 * client-side state needed) so it works fine inside Server Components too.
 */
export function ProgressRing({
  progress,
  size = 44,
  strokeWidth = 3,
  className,
  children,
}: {
  /** 0-100 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const clamped = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const isDone = clamped >= 100;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-zinc-200 dark:stroke-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`fill-none transition-[stroke-dashoffset] duration-700 ease-out ${
            isDone
              ? "stroke-emerald-500"
              : "stroke-emerald-500/70 dark:stroke-emerald-400/70"
          }`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
