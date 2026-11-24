import type { CSSProperties } from "react";
import type { Row, Tip } from "@antfabric/ui-core/chart";
import { t } from "../tokens";
import { box, css, row, text } from "../lib/style";

export interface ChartTooltipProps {
  /** What the card lists: `tipRows`' title, its rows (swatch, label, value) and the total of a stack. */
  tip: Tip;
  /** The label of the total's row, for a tip that has one (a stack). The chart passes its own string: the card has no text of its own. */
  totalLabel?: string;
  style?: CSSProperties;
}

const card: CSSProperties = {
  ...box,
  minWidth: 150, /* structural: the card's measure, so a short title does not give a sliver */
  maxWidth: 240, /* structural: and a long label wraps instead of widening it */
  gap: t.space["3xs"],
  padding: `${t.space.sm} ${t.space.smMd}`,
  borderRadius: t.radius.control,
  background: t.chart.tooltipColor,
  borderWidth: t.border.width.hairline,
  borderStyle: "solid",
  borderColor: t.chart.tooltipRuleColor,
  boxShadow: t.elevation.shadow.menu,
  fontFamily: t.chart.fontFamily,
  fontSize: t.font.size.caption,
  pointerEvents: "none",
};

const line: CSSProperties = { ...row, gap: t.space.xs };
const swatch = (color?: string): CSSProperties => ({ width: t.space.smMd, height: t.space.smMd, borderRadius: t.radius.tag, flexShrink: 0, background: color });
const number: CSSProperties = { fontVariantNumeric: "tabular-nums", fontWeight: t.font.weight.semibold, color: t.chart.tooltipTextColor };

/** The tooltip every chart shows on hover: one card, fed by core's `tipRows`. The phone kit draws the same card in `View`s and `Text`. */
export function ChartTooltip({ tip, totalLabel, style }: ChartTooltipProps) {
  return (
    <div role="tooltip" style={css(card, style)}>
      <span style={css(text, { fontWeight: t.font.weight.semibold, color: t.chart.tooltipTextColor, marginBottom: t.space["3xs"] })}>{tip.title}</span>
      {tip.rows.map((r) => (
        <div key={r.key} style={line}>
          <span aria-hidden style={swatch(r.color)} />
          <span style={css(text, { flex: 1, color: t.chart.tooltipMutedColor })}>{r.label}</span>
          <span style={number}>{r.value}</span>
        </div>
      ))}
      {tip.total != null ? (
        <div style={css(line, { borderTopWidth: t.border.width.hairline, borderTopStyle: "solid", borderTopColor: t.chart.tooltipRuleColor, marginTop: t.space["3xs"], paddingTop: t.space["3xs"] })}>
          <span aria-hidden style={swatch()} />
          <span style={css(text, { flex: 1, color: t.chart.tooltipMutedColor })}>{totalLabel}</span>
          <span style={number}>{tip.total}</span>
        </div>
      ) : null}
    </div>
  );
}

/** What recharts hands a tooltip's `content`: whether it is showing, and what is under the pointer. */
export interface TipContentArgs {
  active?: boolean;
  payload?: readonly { payload?: Row }[];
}

/** The row under the pointer (every series of a category shares one), or null while the tooltip is not showing. */
export const hoveredRow = ({ active, payload }: TipContentArgs): Row | null => (active && payload?.length ? (payload[0]!.payload ?? null) : null);
