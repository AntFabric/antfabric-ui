/** A formatted value as the pieces a KPI draws at two sizes, and what a card's sentence about a change is made of. Shared by both kits. */

import { fmt, withoutSign, type FormatSpec, type FormatWords } from "./format";

/** One piece of a formatted value: the digits (and a sign), or what is around them (`$`, `K`, `%`, `m`). */
export interface ValuePart {
  s: string;
  digits: boolean;
}

const SIGN = /^[+\-−]+/;

/**
 * A value as its format prints it, split into the digits and the rest, so the rest ($, K, %, m, a unit) can be drawn smaller and
 * fainter: `"$184,200"` is `$` and `184,200`; `"2m 14s"` is `2`, `m `, `14`, `s`. A sign before a symbol stays with the digits
 * (`-$4,200` is `-`, `$`, `4,200`). Text with no digit in it (an en dash for a missing value, a word) is all digits: nothing to shrink.
 */
export function valueParts(spec: FormatSpec | undefined, value: unknown, words: FormatWords, locale = "en-US"): ValuePart[] {
  const text = fmt(spec, value, words, locale);
  const parts: ValuePart[] = [];
  const push = (s: string, digits: boolean) => {
    if (!s) return;
    const last = parts[parts.length - 1];
    if (last && last.digits === digits) last.s += s;
    else parts.push({ s, digits });
  };
  // Alternating runs: what is not a digit run, then a digit run (`1,234.5`; a separator between digits is part of it).
  for (const piece of text.split(/(\d[\d.,]*\d|\d)/)) {
    if (!piece) continue;
    if (/^\d/.test(piece)) push(piece, true);
    else {
      const sign = parts.length ? "" : (SIGN.exec(piece)?.[0] ?? "");
      push(sign, true);
      push(piece.slice(sign.length), false);
    }
  }
  return parts.some((p) => p.digits) ? parts : [{ s: text, digits: true }];
}

export type Direction = "up" | "down" | "flat";

/**
 * What moved, before it has words: its direction, whether there is a number at all, and the amount as the Delta's format prints it without a sign (`4.4%`;
 * empty when it is flat or not a number), in `locale`, so it is said as the figure beside it is printed (`11,3 %` in German). The kit says it ("Up 4.4%",
 * "No change", "Change unavailable") from its own strings. `format` is the Delta's (default a percent).
 */
export function moved(delta: number, words: FormatWords, format?: FormatSpec, locale?: string): { direction: Direction; known: boolean; value: string } {
  const known = Number.isFinite(delta);
  const direction: Direction = !known || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
  return { direction, known, value: direction === "flat" ? "" : fmt(withoutSign(format ?? "percent"), Math.abs(delta), words, locale) };
}
