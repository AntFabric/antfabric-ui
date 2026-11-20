/**
 * Largest-Triangle-Three-Buckets downsampling (Sveinn Steinarsson, 2013): 50,000 points reach a chart as about 1,000, and the
 * line keeps its peaks and dips, because each bucket keeps the point that makes the largest triangle with the last kept point
 * and the average of the next bucket.
 */

/**
 * `data` cut to `threshold` rows, in order, always keeping the first and last. `x` and `y` read a row's position and value
 * (finite numbers; a value that is not counts as 0). Returns the rows themselves, not copies. Data already within the
 * threshold, or a threshold under 3, comes back whole.
 */
export function lttb<T>(data: readonly T[], threshold: number, x: (row: T, i: number) => number, y: (row: T, i: number) => number): T[] {
  const n = data.length;
  if (threshold >= n || threshold < 3) return data.slice();
  const px = (i: number) => x(data[i]!, i);
  const py = (i: number) => {
    const v = y(data[i]!, i);
    return Number.isFinite(v) ? v : 0;
  };
  const every = (n - 2) / (threshold - 2);
  const out: T[] = [data[0]!];
  let a = 0;
  for (let i = 0; i < threshold - 2; i++) {
    // The average of the next bucket is the third corner of every triangle in this one.
    const nextStart = Math.floor((i + 1) * every) + 1;
    const nextEnd = Math.min(Math.floor((i + 2) * every) + 1, n);
    let ax = 0;
    let ay = 0;
    for (let j = nextStart; j < nextEnd; j++) {
      ax += px(j);
      ay += py(j);
    }
    ax /= nextEnd - nextStart;
    ay /= nextEnd - nextStart;
    const from = Math.floor(i * every) + 1;
    const to = Math.floor((i + 1) * every) + 1;
    const [x0, y0] = [px(a), py(a)];
    let best = -1;
    let pick = from;
    for (let j = from; j < to; j++) {
      const area = Math.abs((x0 - ax) * (py(j) - y0) - (x0 - px(j)) * (ay - y0)) / 2;
      if (area > best) {
        best = area;
        pick = j;
      }
    }
    out.push(data[pick]!);
    a = pick;
  }
  out.push(data[n - 1]!);
  return out;
}
