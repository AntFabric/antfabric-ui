/**
 * The ids the chart libraries generate, folded to the order they first appear in, so a chart's hash does not depend on what drew before it.
 *
 * recharts numbers its clip paths from a counter (`recharts1-clip`, then `recharts3-clip` for the next chart drawn in the same run) and names
 * its shapes with React's `useId` (`recharts-area-«r0»`, written as an `id` and, on a pie's sectors, as `data-recharts-item-id`; an animated line or bar's clip path is `clipPath-recharts-line-«r0»`); the data components name their own gradients `af-chart-<useId>`; gifted-charts'
 * are fixed names (`Gradient-line-0`, `Clip-range-0`) that only the order of charts would move. Each id, and every `url(#…)` and `href="#…"`
 * that names it, becomes `af-id-<n>`. Only ids of these families are folded: any other id (a form field's, a component's own) is left as it is,
 * so no existing component's hash changes.
 */

const GENERATED = /^(?:(?:clipPath-)?recharts[\w-]*(?:«[^»]*»|_[\w]+_)?|af-chart-\w+|Gradient[\w-]*|Clip-range[\w-]*)$/;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function foldIds(html: string): string {
  const ids: string[] = [];
  for (const m of html.matchAll(/\s(?:id|data-recharts-item-id)="([^"]+)"/g)) if (GENERATED.test(m[1]!) && !ids.includes(m[1]!)) ids.push(m[1]!);
  let out = html;
  // Longest first, so `recharts11-clip` is not eaten by `recharts1-clip`.
  for (const id of [...ids].sort((a, b) => b.length - a.length)) out = out.replace(new RegExp(`(?<![\\w«-])${escape(id)}(?![\\w»-])`, "g"), `af-id-${ids.indexOf(id)}`);
  return out;
}

/**
 * The ids React itself gives `useId` once mounted (`«r0»`, or `_r_0_` in later versions), folded to the order they first appear in. They
 * come from one counter for the whole process, so what a component is given depends on what mounted before it: only the *mounted*
 * hashes (`pnpm rerender`) need this. The server render counts from zero in every `renderToString`, so it never does.
 */
const USE_ID = /«r[0-9a-z]+»|_r_[0-9a-z]+_/g;

export function foldUseIds(html: string): string {
  const seen: string[] = [];
  return html.replace(USE_ID, (id) => {
    if (!seen.includes(id)) seen.push(id);
    return `af-uid-${seen.indexOf(id)}`;
  });
}
