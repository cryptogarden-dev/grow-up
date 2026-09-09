import { describe, expect, it } from "vitest";
import { computeAdaptiveTarget, EQUILIBRIUM_WINDOW_WEEKS } from "./equilibrium";

describe("computeAdaptiveTarget", () => {
  it("falls back to the fixed weekly target when there's no history yet", () => {
    const result = computeAdaptiveTarget(5, []);
    expect(result).toEqual({ equilibrium: 0, adaptiveTarget: 5 });
  });

  it("keeps the target stable at the floor when performance exactly matches it", () => {
    // 1% of 10 rounds back down to 10, so a category that's merely keeping
    // pace with its own target shouldn't see the bar move.
    const result = computeAdaptiveTarget(10, [10, 10, 10, 10, 10, 10]);
    expect(result.equilibrium).toBe(10);
    expect(result.adaptiveTarget).toBe(10);
  });

  it("raises both equilibrium and target when sustaining above the fixed target", () => {
    const result = computeAdaptiveTarget(10, [12, 12, 12, 12, 12, 12]);
    expect(result.equilibrium).toBe(12);
    // 12 * 1.01 = 12.12 -> rounds to 12, still above the original floor of 10.
    expect(result.adaptiveTarget).toBe(12);
    expect(result.adaptiveTarget).toBeGreaterThan(10);
  });

  it("never drops the adaptive target below the original weeklyTarget floor", () => {
    // Underperforming recently (equilibrium well below target) must not
    // quietly lower the bar — the fixed target always wins as a floor.
    const result = computeAdaptiveTarget(10, [2, 2, 2, 2, 2, 2]);
    expect(result.equilibrium).toBe(2);
    expect(result.adaptiveTarget).toBe(10);
  });

  it("applies the 1%-better growth rate on top of a raised equilibrium", () => {
    // Pick a sustained level where +1% actually changes the rounded result,
    // to make sure GROWTH_RATE is actually being applied and not a no-op.
    const result = computeAdaptiveTarget(1, [100, 100, 100, 100, 100, 100]);
    expect(result.equilibrium).toBe(100);
    expect(result.adaptiveTarget).toBe(Math.round(100 * 1.01));
    expect(result.adaptiveTarget).toBe(101);
  });

  it("dampens a single-week outlier spike instead of chasing it fully", () => {
    const spike = 50;
    const result = computeAdaptiveTarget(5, [5, 5, 5, 5, 5, spike]);
    // Without the outlier cap, EMA would pull equilibrium much closer to the
    // spike. With the cap (1.5x the reference level), it should land well
    // short of it.
    expect(result.equilibrium).toBeGreaterThan(5);
    expect(result.equilibrium).toBeLessThan(spike * 0.5);
    expect(result.adaptiveTarget).toBeLessThan(spike);
  });

  it("caps the outlier relative to the median, not the fixed weeklyTarget", () => {
    // A category whose recent median (20) is already well above its
    // original fixed target (1) should have outliers capped relative to
    // that higher, more realistic level (20 * 1.5 = 30) rather than the
    // stale original target (1 * 1.5 = 1.5) — otherwise growth would be
    // permanently capped near the original target forever.
    const result = computeAdaptiveTarget(1, [20, 20, 20, 20, 20, 60]);
    expect(result.equilibrium).toBeGreaterThan(20);
  });

  it("weighs more recent weeks more heavily than older ones (EMA behavior)", () => {
    const increasing = computeAdaptiveTarget(1, [1, 2, 3, 4, 5, 6]);
    const decreasing = computeAdaptiveTarget(1, [6, 5, 4, 3, 2, 1]);
    // Same values, same average — but the improving trend should produce a
    // higher equilibrium since EMA weights recent weeks more.
    expect(increasing.equilibrium).toBeGreaterThan(decreasing.equilibrium);
  });

  it("treats a single prior week as its own equilibrium (EMA base case)", () => {
    const result = computeAdaptiveTarget(5, [7]);
    expect(result.equilibrium).toBe(7);
    expect(result.adaptiveTarget).toBe(Math.round(7 * 1.01));
  });

  it("uses the standard window size for its smoothing factor", () => {
    // Sanity check that the constant used elsewhere (e.g. in data.ts, to
    // build the priorCounts window) still matches what this module assumes.
    expect(EQUILIBRIUM_WINDOW_WEEKS).toBe(6);
  });
});
