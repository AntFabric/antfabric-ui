/**
 * The value scale both chart libraries draw: the extent of the data and round ticks over it. The kits pass these ticks to
 * recharts and gifted-charts, so the web and the phone print the same axis.
 */

import type { Row } from "./types";

export interface DomainOptions {
  /** Sum the fields of a row, positives and negatives apart, as a stacked bar does. */
  stacked?: boolean;
  /** Values the domain must include: a target line, a threshold. */
  include?: number[];
  /** Keep 0 in the domain: bars must, lines need not (default true). */
  zero?: boolean;
}

/** The extent of the values: stacked sums positives and negatives apart; `zero` keeps 0 in (bars must, lines need not). */
export function valueDomain(rows: Row[], fields: string[], { stacked = false, include = [], zero = true }: DomainOptions = {}): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const r of rows) {
    if (stacked) {
      let pos = 0;
      let neg = 0;
      for (const f of fields) {
        const v = +(r[f] as number) || 0;
        if (v >= 0) pos += v;
        else neg += v;
      }
      lo = Math.min(lo, neg);
      hi = Math.max(hi, pos);
    } else
      for (const f of fields) {
        const v = r[f];
        if (v == null || Number.isNaN(+v)) continue;
        lo = Math.min(lo, +v);
        hi = Math.max(hi, +v);
      }
  }
  for (const v of include) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  if (!Number.isFinite(lo)) {
    lo = 0;
    hi = 1;
  }
  if (zero) {
    lo = Math.min(0, lo);
    hi = Math.max(0, hi);
  }
  return [lo, hi];
}

export interface Scale {
  min: number;
  max: number;
  step: number;
  ticks: number[];
}

export interface ScaleOptions {
  /** About how many intervals the axis has (default 4); the step is the nearest round one at or above. */
  count?: number;
  /** A share of the range added on each side, so a line never runs along the frame (0.1 is a tenth). It never carries a side across zero. */
  pad?: number;
}

/**
 * Round ticks over a domain (steps of 1, 2, 2.5, 5 and 10 times a power of ten). A domain of one value is widened to a range
 * around it, and neither that nor `pad` carries a side across zero: a line of positive values never gets a negative axis.
 */
export function niceScale([lo, hi]: [number, number], { count = 4, pad = 0 }: ScaleOptions = {}): Scale {
  const out = (v: number, to: "lo" | "hi") => (to === "lo" ? (lo >= 0 ? Math.max(0, v) : v) : hi <= 0 ? Math.min(0, v) : v);
  if (pad && hi > lo) {
    const p = (hi - lo) * pad;
    [lo, hi] = [out(lo - p, "lo"), out(hi + p, "hi")];
  }
  if (lo === hi) {
    const w = Math.max(1, Math.abs(lo) * 0.1);
    // All zero has nothing to stay on one side of: it reads 0 to 1.
    [lo, hi] = lo === 0 ? [0, 1] : [out(lo - w, "lo"), out(hi + w, "hi")];
  }
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw - 1e-12)!;
  const min = Math.floor(lo / step + 1e-9) * step;
  const max = Math.ceil(hi / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(+v.toPrecision(12));
  return { min: ticks[0]!, max: ticks[ticks.length - 1]!, step, ticks };
}
