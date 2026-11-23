import { useId } from "react";
import { useLocale } from "@antfabric/ui-core";
import Svg, { LinearGradient, Path, Stop } from "react-native-svg";
import { LineChart as GiftedLineChart } from "react-native-gifted-charts";
import { FLAT_FILL, markPath, seriesMark, sparseLabels, tipRows, type FormatSpec, type FormatWords, type MarkShape, type PreparedRow, type Scale, type Series } from "@antfabric/ui-core/chart";
import { giftedAxis, labelScale, plotHeight, plotWidth } from "./axis";
import { giftedTheme, type ChartTokens } from "./theme";
import { ChartTooltip } from "./tooltip";

export interface GiftedLinesProps {
  tk: ChartTokens;
  theme: ReturnType<typeof giftedTheme>;
  rows: PreparedRow[];
  /** The series to draw as lines: the ones showing. */
  s: Series;
  labels: Record<string, string>;
  format?: FormatSpec;
  /** The words the format writes (the chart's own strings). */
  formatWords: FormatWords;
  scale: Scale;
  /** A flat fill under the first series. */
  area?: boolean;
  target?: number;
  targetLabel?: string;
  /** The series drawn dashed and thinner (`chart.previousW`): the last period, in PeriodCompare. */
  dashed?: string[];
  /** Each series gets its own dash and marker (`seriesMark`) besides its colour. */
  marks?: boolean;
  width: number;
  height: number;
}

/** A value gifted-charts can draw: a finite number. Anything else (null, text that is not a number) is a gap, which `interpolateMissingValues={false}` leaves open, as the web's line does. */
const valueOf = (v: unknown): number | undefined => {
  const n = v == null || v === "" ? NaN : +(v as number);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * gifted-charts' LineChart for the phone, from the same rows, scale and tooltip rows as the web's: a series is `data`…`data5` with its colour and
 * thickness, the fill is `areaChart1`, the tooltip is `pointerConfig` (press and drag), a target is `referenceLine1`. A series in `dashed` is thinner and
 * dashed (`strokeDashArray<n>`, `thickness<n>`). It works out the plot's width and the spacing from the measured width, because gifted-charts takes numbers.
 */
export function GiftedLines({ tk, theme, rows, s, labels, format, formatWords, scale, area = false, target, targetLabel = "", dashed = [], marks = false, width, height }: GiftedLinesProps) {
  // gifted-charts names its area gradient `Gradient-line-0` in every chart, and an SVG id is the page's: two charts of different colours would share the first one's fill. This one's is its own.
  const gradient = `af-chart-${useId().replace(/\W/g, "")}`;
  const locale = useLocale();
  const n = rows.length;
  const axis = giftedAxis({ tk, theme, scale, format, formatWords, locale });
  const w = plotWidth(tk, width, axis);
  const edge = tk.chart.edge;
  const spacing = n > 1 ? (w - edge * 2) / (n - 1) : 0;
  // A long series has more labels than room: one in every few is drawn, the rest blank, as the web's axis thins its ticks.
  const thin = sparseLabels(rows.map((row) => row.__x), spacing || w, tk.chart.labelSize * labelScale());
  // gifted-charts draws a point as a circle or a rectangle only, so a series' marker (`seriesMark`: five shapes) is drawn by the kit, from the
  // same path the legend's key and the web's plot draw, in a box the stroke fits in.
  const markSize = theme.line.dataPointsRadius * 2;
  const markBox = markSize + tk.border.wThick;
  const markOf = (shape: MarkShape, color: string) => () => (
    <Svg width={markBox} height={markBox}>
      <Path d={markPath(shape, markBox / 2, markBox / 2, markSize)} fill={shape === "cross" ? "none" : color} stroke={color} strokeWidth={tk.border.wThick} />
    </Svg>
  );
  const series: Record<string, unknown> = {};
  s.visible.forEach((f, k) => {
    const sfx = k === 0 ? "" : String(k + 1);
    const mark = marks && !dashed.includes(f) ? seriesMark(s.fields.indexOf(f)) : null;
    const point = mark ? { customDataPoint: markOf(mark.shape, s.colorOf(f)), dataPointWidth: markBox, dataPointHeight: markBox } : null;
    const values = rows.map((row) => valueOf(row[f]));
    series[`data${sfx}`] = values.map((value, i) => ({ value, label: k === 0 ? thin[i] : undefined, ...point }));
    // A series with no number at all draws nothing, rather than a line along zero.
    const none = values.every((v) => v === undefined);
    series[`color${k + 1}`] = none ? "transparent" : s.colorOf(f);
    series[`startFillColor${k + 1}`] = none ? "transparent" : s.colorOf(f);
    series[`endFillColor${k + 1}`] = none ? "transparent" : s.colorOf(f);
    series[`dataPointsColor${k + 1}`] = s.colorOf(f);
    if (mark?.dash.length) series[`strokeDashArray${k + 1}`] = mark.dash.map((d) => d * theme.line.thickness);
    if (dashed.includes(f)) {
      series[`strokeDashArray${k + 1}`] = theme.line.seriesDash;
      series[`thickness${k + 1}`] = tk.chart.previousW;
    }
  });
  const first = s.visible[0]!;
  const shown = (i: number) => tipRows(rows[i]!, { fields: s.visible, labels, colorOf: s.colorOf, format, formatWords, locale });
  return (
    <GiftedLineChart
      {...axis}
      {...theme.motion}
      {...series}
      width={w}
      height={plotHeight(tk, height, axis)}
      spacing={spacing}
      initialSpacing={n > 1 ? edge : w / 2}
      endSpacing={edge}
      curved={theme.line.curved}
      thickness={theme.line.thickness}
      interpolateMissingValues={false}
      // One point has no line to draw: it is a dot.
      hideDataPoints={n > 1 && !(marks && n <= 40)}
      dataPointsRadius={theme.line.dataPointsRadius}
      areaChart1={area}
      startOpacity={FLAT_FILL}
      endOpacity={FLAT_FILL}
      areaGradientId={gradient}
      areaGradientComponent={() => (
        <LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={s.colorOf(first)} stopOpacity={FLAT_FILL} />
          <Stop offset="1" stopColor={s.colorOf(first)} stopOpacity={FLAT_FILL} />
        </LinearGradient>
      )}
      showReferenceLine1={target !== undefined}
      referenceLine1Position={target ?? 0}
      referenceLine1Config={{ ...theme.reference, labelText: targetLabel, labelTextStyle: theme.text("semibold", { color: tk.fg.muted, position: "absolute", left: tk.space.xs, top: -tk.space.lg }) }}
      pointerConfig={{
        ...theme.pointer,
        pointerStripUptoDataPoint: false,
        radius: theme.line.dataPointsRadius + 1,
        pointerColorsForDataSet: s.visible.map(s.colorOf),
        ...Object.fromEntries(s.visible.map((f, k) => [`pointer${k === 0 ? "" : k + 1}Color`, s.colorOf(f)])),
        pointerLabelWidth: theme.tooltip.width,
        pointerLabelHeight: theme.tooltip.heightFor(s.visible.length),
        autoAdjustPointerLabelPosition: true,
        activatePointersOnLongPress: false,
        activatePointersInstantlyOnTouch: true,
        persistPointer: false,
        shiftPointerLabelY: tk.space.sm,
        pointerLabelComponent: (_items: unknown, _secondary: unknown, index: number) => <ChartTooltip tip={shown(index ?? 0)} />,
      }}
    />
  );
}
