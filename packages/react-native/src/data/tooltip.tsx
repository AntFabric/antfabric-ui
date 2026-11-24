import { Text, View, type TextStyle, type ViewStyle } from "react-native";
import type { Tip } from "@antfabric/ui-core/chart";
import { createStyles } from "../theme";
import { chartFont, useChartTokens } from "./theme";

export interface ChartTooltipProps {
  /** What the card lists: `tipRows`' title, its rows (swatch, label, value) and the total of a stack. */
  tip: Tip;
  /** The label of the total's row, for a tip that has one (a stack). The chart passes its own string: the card has no text of its own. */
  totalLabel?: string;
  style?: ViewStyle;
}

const useStyles = createStyles((t) => ({
  card: {
    minWidth: 136, /* structural: the card's measure, so a short title does not give a sliver */
    gap: t.space["3xs"],
    paddingVertical: t.space.sm,
    paddingHorizontal: t.space.smMd,
    borderRadius: t.radius.control,
    backgroundColor: t.chart.tooltipColor,
    borderWidth: t.border.width.hairline,
    borderColor: t.chart.tooltipRuleColor,
    boxShadow: t.elevation.shadow.menu,
  },
  row: { flexDirection: "row", alignItems: "center", gap: t.space.xs },
  swatch: { width: t.space.sm, height: t.space.sm, borderRadius: t.radius.tag },
  label: { flex: 1 },
  total: { borderTopWidth: t.border.width.hairline, borderTopColor: t.chart.tooltipRuleColor, marginTop: t.space["3xs"], paddingTop: t.space["3xs"] },
}));

/** The tooltip every chart shows when a point or a bar is pressed: one card, fed by core's `tipRows`. The React kit draws the same card in the DOM. */
export function ChartTooltip({ tip, totalLabel, style }: ChartTooltipProps) {
  const s = useStyles();
  const t = useChartTokens();
  // A `Text` inherits nothing: each one sets its own colour, size and font file.
  const words = (weight: "regular" | "semibold", color: string): TextStyle => ({ ...chartFont(t, weight), color, fontSize: t.font.size.caption });
  return (
    <View testID="chart-tooltip" style={[s.card, style]}>
      <Text style={words("semibold", t.chart.tooltipTextColor)}>{tip.title}</Text>
      {tip.rows.map((r) => (
        <View key={r.key} style={s.row}>
          <View style={[s.swatch, { backgroundColor: r.color }]} />
          <Text numberOfLines={1} style={[s.label, words("regular", t.chart.tooltipMutedColor)]}>
            {r.label}
          </Text>
          <Text style={[words("semibold", t.chart.tooltipTextColor), { fontVariant: ["tabular-nums"] }]}>{r.value}</Text>
        </View>
      ))}
      {tip.total != null ? (
        <View style={[s.row, s.total]}>
          <View style={s.swatch} />
          <Text style={[s.label, words("regular", t.chart.tooltipMutedColor)]}>{totalLabel}</Text>
          <Text style={[words("semibold", t.chart.tooltipTextColor), { fontVariant: ["tabular-nums"] }]}>{tip.total}</Text>
        </View>
      ) : null}
    </View>
  );
}
