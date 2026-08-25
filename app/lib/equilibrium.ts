/**
 * Adaptive "1% better" weekly targets.
 *
 * Atomic Habits' core idea is that small, compounding improvements matter
 * more than hitting a fixed number. A static weekly target stops being a
 * meaningful signal once you're comfortably clearing it every week — from
 * then on "done" no longer means "better than before".
 *
 * Instead of a fixed bar, we estimate each counter category's *equilibrium
 * point*: the level you've actually been sustaining lately, via an
 * exponential moving average (EMA) of your recent weekly counts. Your target
 * for this week is then 1% above that equilibrium — a target that moves
 * with your real, current performance instead of a number you picked once
 * and forgot about.
 */

/** Trailing window (in weeks) used to estimate the equilibrium point. */
export const EQUILIBRIUM_WINDOW_WEEKS = 6;

/** Standard EMA smoothing factor for an N-week window: alpha = 2 / (N + 1). */
const SMOOTHING = 2 / (EQUILIBRIUM_WINDOW_WEEKS + 1);

/** Atomic Habits' "1% better" growth applied on top of the equilibrium. */
const GROWTH_RATE = 1.01;

/**
 * How far above the base target a single week is allowed to pull the
 * equilibrium. Without this, one outlier week (e.g. a 10x content sprint)
 * would drag next weeks' expectations up to a level you likely can't
 * sustain. Clamping keeps the equilibrium point realistic and stable.
 */
const OUTLIER_CAP_MULTIPLIER = 1.5;

/**
 * Exponential moving average over chronologically-ordered values (oldest
 * first). Recent weeks influence the result more than old ones, but a
 * single spike or slump doesn't swing it as hard as a plain
 * "compare to last week" would.
 */
function ema(values: number[]): number {
  if (values.length === 0) return 0;
  let value = values[0];
  for (let i = 1; i < values.length; i++) {
    value = SMOOTHING * values[i] + (1 - SMOOTHING) * value;
  }
  return value;
}

export type AdaptiveTarget = {
  /** The EMA-estimated level you've actually been sustaining. */
  equilibrium: number;
  /** max(base target, 1% above equilibrium) — this week's real bar. */
  adaptiveTarget: number;
};

/**
 * Computes the adaptive weekly target for a counter category.
 *
 * @param weeklyTarget The originally configured target (acts as a floor —
 *   the adaptive target never drops below it, so equilibrium can only raise
 *   the bar, never quietly lower it).
 * @param priorCounts This category's actual counts for the
 *   `EQUILIBRIUM_WINDOW_WEEKS` weeks strictly before the week being
 *   evaluated, in chronological order (oldest first). Weeks with no entry
 *   should be passed as 0.
 */
export function computeAdaptiveTarget(
  weeklyTarget: number,
  priorCounts: number[]
): AdaptiveTarget {
  if (priorCounts.length === 0) {
    return { equilibrium: 0, adaptiveTarget: weeklyTarget };
  }
  const cap = weeklyTarget * OUTLIER_CAP_MULTIPLIER;
  const clamped = priorCounts.map((v) => Math.min(v, cap));
  const equilibrium = ema(clamped);
  const adaptiveTarget = Math.max(
    weeklyTarget,
    Math.round(equilibrium * GROWTH_RATE)
  );
  return { equilibrium, adaptiveTarget };
}
