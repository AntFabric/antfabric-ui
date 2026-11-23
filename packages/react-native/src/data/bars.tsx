import { useState } from "react";
import { useLocale } from "@antfabric/ui-core";
import { View, type ViewStyle } from "react-native";
import { BarChart as GiftedBarChart } from "react-native-gifted-charts";
import { DIMMED, labelWidth, sparseLabels, tipRows, type FormatSpec, type FormatWords, type PreparedRow, type Scale, type Series } from "@antfabric/ui-core/chart";
import { giftedAxis, labelScale, plotHeight, plotWidth } from "./axis";
import { ChartTooltip } from "./tooltip";
import { giftedTheme, type ChartTokens } from "./theme";

/** How much of a category's slot its bars fill: the rest is the air between categories. */
const FILL = 0.62;
/** A label is as wide as its bars and the air around them, less a fifth: the neighbours' labels do not touch. */
const LABEL_SHARE = 0.8;
/** And it is pulled back by two fifths of the air, so it sits under its bars and not to the right of them. */
const LABEL_SHIFT = 0.4;

/** The card over a stack is laid on the plot's top edge, centred in the room the chart reserves for it (`chart.tipW`), and never takes a touch. */
const overlay: ViewStyle = { position: "absolute", top: 0, alignItems: "center" };

export interface GiftedBarsProps {
  tk: ChartTokens;
  theme: ReturnType<typeof giftedTheme>;
  rows: PreparedRow[];
  /** The series to draw as bars: the ones the legend has on. */
  s: Series;
  /** The bars' fields (the ones showing, and for a combo chart, only the bars'). */
  fields: string[];
  labels: Record<string, string>;
  format?: FormatSpec;
  /** The words the format writes (the chart's own strings). */
  formatWords: FormatWords;
  stacked?: boolean;
  /** The label of the total's row in a stack's tooltip. Needed when `stacked`. */
  totalLabel?: string;
  /** One series with a loss: each bar takes the colour of its sign. */
  signed?: boolean;
  width: number;
  height: number;
  scale: Scale;
  /** The fields a tooltip lists, when they are not the bars': a combo chart's tooltip has the line's value too. */
  tipFields?: string[];
  /** The bars are turned off but the plot stays, so a line over them has something to hang on: they are drawn transparent. */
  barsOff?: boolean;
  /** A combo chart's line: its field (null while the legend has it off), and the colour it is drawn in. */
  line?: { field: string | null; color: string };
  target?: number;
  targetLabel?: string;
}

/**
 * gifted-charts' BarChart for the phone, from the same rows, scale and tooltip rows as the web's. Grouped bars are its `data` (one entry per bar, the
 * category's label on the first), stacked ones its `stackData`; a combo chart's line is `showLine` with `lineData` and `lineConfig`, a target is
 * `referenceLine1`. It works out the plot's width and each bar's from the measured width, because gifted-charts takes numbers, not a layout.
 */
export function GiftedBars({ tk, theme, rows, s, fields, labels, format, formatWords, stacked = false, totalLabel, signed = false, width, height, scale, tipFields, barsOff = false, line, target, targetLabel }: GiftedBarsProps) {
  const locale = useLocale();
  // The bar (or stack) last pressed, as gifted-charts numbers it.
  const [hit, setHit] = useState<number | null>(null);
  const axis = giftedAxis({ tk, theme, scale, format, formatWords, locale });
  const plotW = plotWidth(tk, width, axis);
  const per = stacked ? 1 : fields.length;
  const group = plotW / rows.length;
  const inner = theme.bar.gap;
  // One bar to a category (a single series, a stack, ComboChart's bars) has the room to itself, so it grows wider than a grouped one.
  const barW = Math.max(tk.chart.barMinW, Math.min(per === 1 ? theme.bar.soloWidth : theme.bar.width, (group * FILL - (per - 1) * inner) / per));
  const span = per * barW + (per - 1) * inner;
  const gap = group - span;
  // A long series has more labels than room: one in every few, drawn wider than its bar and centred on it.
  const thin = sparseLabels(rows.map((r) => r.__x), group, tk.chart.labelSize * labelScale());
  const crowded = thin.some((l, i) => l !== rows[i]!.__x);
  const tick = labelWidth(rows.map((r) => r.__x), tk.chart.labelSize * labelScale());
  const labelOf = (row: PreparedRow, i: number) =>
    crowded
      ? { label: thin[i]!, labelWidth: tick, labelTextStyle: theme.text("regular", { textAlign: "center", marginLeft: -(tick - span) / 2 }) }
      : { label: row.__x, labelWidth: span + gap * LABEL_SHARE, labelTextStyle: theme.text("regular", { textAlign: "center", marginLeft: -gap * LABEL_SHIFT }) };
  const signColors = signed ? { positive: tk.data.positive, negative: tk.data.negative } : undefined;
  const tipOf = (i: number) => tipRows(rows[i]!, { fields: tipFields ?? fields, labels, colorOf: s.colorOf, format, formatWords, locale, stacked, signColors });
  const rowOf = (index: number) => (stacked ? index : Math.floor(index / fields.length));
  // New data with fewer rows (or series) than the press was made on: nothing is pressed any more.
  const pressed = hit !== null && rowOf(hit) < rows.length ? hit : null;
  if (pressed !== hit) setHit(null);
  const active = pressed === null ? null : rowOf(pressed);
  // The category last pressed keeps its colour and the rest step back, as the web's hovered one does. Pressing the same bar again, or the
  // plot beside the bars, lets go.
  const press = () => ({
    onPress: (_item: unknown, index: number) => setHit(index === pressed ? null : index),
    onBackgroundPress: () => setHit(null),
    highlightEnabled: true,
    lowlightOpacity: DIMMED,
    // The bars of the pressed category: a group's (an array), or a stack (a number: gifted-charts compares a stack's with `===`). `-1` is none, which leaves every bar as it is.
    highlightedBarIndex: stacked ? (active ?? -1) : active === null ? [-1] : fields.map((_, j) => active * fields.length + j),
  });
  const tooltip = () => ({
    ...press(),
    // gifted-charts' own card follows this rather than its own state, so a second press or a press beside the bars takes it away.
    focusedBarIndex: pressed ?? -1,
    renderTooltip: (_item: unknown, index: number) => (
      <View style={{ marginBottom: tk.space.xs, marginLeft: -(theme.tooltip.width / 2 - barW / 2) }}>
        <ChartTooltip totalLabel={totalLabel} tip={tipOf(rowOf(index))} />
      </View>
    ),
    leftShiftForTooltip: 0,
    autoCenterTooltip: true,
  });
  const below = axis.noOfSectionsBelowXAxis ?? 0;
  const common = {
    ...axis,
    ...theme.motion,
    width: plotW,
    // gifted-charts' `height` is the part above zero: the sections below it are added on top, so the plot is shrunk by their share.
    height: plotHeight(tk, height, axis),
    barWidth: barW,
    initialSpacing: gap / 2,
    endSpacing: 0,
    xAxisLabelsVerticalShift: tk.space["3xs"],
    autoShiftLabels: below > 0,
  };
  if (stacked) {
    const stackData = rows.map((row, i) => ({
      ...labelOf(row, i),
      spacing: gap,
      stacks: fields.map((f, j) => ({ value: +(row[f] as number) || 0, color: s.colorOf(f), marginBottom: j ? tk.chart.stackGap : 0 })),
    }));
    // gifted-charts compares a stack's selection with `===` against an array, so its own tooltip never opens on a stack: the card is drawn here, above the pressed stack.
    // A stack's own spacing is applied before it as well as the chart's initial spacing, so the first stack stands a whole gap in from the axis, not half of one.
    const centre = axis.yAxisLabelWidth + gap + (active ?? 0) * group + span / 2;
    const left = Math.min(Math.max(0, centre - theme.tooltip.width / 2), Math.max(0, width - theme.tooltip.width));
    return (
      <View>
        <GiftedBarChart {...common} stackData={stackData} stackBorderTopLeftRadius={theme.bar.radius} stackBorderTopRightRadius={theme.bar.radius} {...press()} />
        {active !== null ? (
          <View pointerEvents="none" style={[overlay, { left, width: theme.tooltip.width }]}>
            <ChartTooltip totalLabel={totalLabel} tip={tipOf(active)} />
          </View>
        ) : null}
      </View>
    );
  }
  const data = rows.flatMap((row, i) =>
    fields.map((f, j) => ({
      value: +(row[f] as number) || 0,
      frontColor: barsOff ? "transparent" : signed ? ((row[f] as number) < 0 ? tk.data.negative : tk.data.positive) : s.colorOf(f),
      spacing: j === fields.length - 1 ? gap : inner,
      ...(j === 0 ? labelOf(row, i) : {}),
    })),
  );
  const radius = signed ? tk.chart.signedRadius : theme.bar.radius;
  // gifted-charts puts a line's first point half a bar in from `initialSpacing` and steps by a bar's width plus `spacing`, so these land each point on its category's centre.
  const lineAt = { initialSpacing: gap / 2 + span / 2 - barW / 2, spacing: group - barW, curved: theme.line.curved, isAnimated: theme.motion.isAnimated };
  const lineData = line?.field != null ? rows.map((row) => ({ value: row[line.field!] as number })) : [];
  const dot = theme.line.dataPointsRadius - 1;
  const lineProps =
    line?.field != null
      ? {
          showLine: true,
          // The line, drawn as PeriodCompare's last period is (thinner, dashed), with a disc of the card under each point.
          lineData,
          lineConfig: { ...lineAt, color: line.color, thickness: tk.chart.previousW, strokeDashArray: theme.line.seriesDash, dataPointsColor: theme.card, dataPointsRadius: dot + tk.border.wThick },
          // The dots, on those discs: gifted-charts draws a point as one circle with no stroke, so the card's ring around it is the first line's point.
          lineData2: lineData,
          lineConfig2: { ...lineAt, color: "transparent", thickness: 0, dataPointsColor: line.color, dataPointsRadius: dot },
        }
      : {};
  return (
    <GiftedBarChart
      {...common}
      {...lineProps}
      data={data}
      barBorderTopLeftRadius={radius}
      barBorderTopRightRadius={radius}
      {...(signed ? { barBorderBottomLeftRadius: radius, barBorderBottomRightRadius: radius } : {})}
      showReferenceLine1={target !== undefined}
      referenceLine1Position={target ?? 0}
      referenceLine1Config={{ ...theme.reference, labelText: targetLabel, labelTextStyle: theme.text("semibold", { color: tk.fg.muted, position: "absolute", left: tk.space.xs, top: -tk.space.lg }) }}
      {...tooltip()}
    />
  );
}
