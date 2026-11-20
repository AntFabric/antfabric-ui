import { useId } from "react";
import { useLocale } from "@antfabric/ui-core";
import { LinearGradient, Stop } from "react-native-svg";
import { LineChart as GiftedLineChart } from "react-native-gifted-charts";
import { FLAT_FILL, seriesMark, sparseLabels, tipRows, type FormatSpec, type FormatWords, type PreparedRow, type Scale, type Series } from "@antfabric/ui-core/chart";
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
  const series: Record<string, unknown> = {};
  s.visible.forEach((f, k) => {
    const sfx = k === 0 ? "" : String(k + 1);
    series[`data${sfx}`] = rows.map((row, i) => ({ value: row[f] as number, label: k === 0 ? thin[i] : undefined }));
    series[`color${k + 1}`] = s.colorOf(f);
    series[`startFillColor${k + 1}`] = s.colorOf(f);
    series[`endFillColor${k + 1}`] = s.colorOf(f);
    series[`dataPointsColor${k + 1}`] = s.colorOf(f);
    if (marks && !dashed.includes(f)) {
      const mark = seriesMark(s.fields.indexOf(f));
      if (mark.dash.length) series[`strokeDashArray${k + 1}`] = mark.dash.map((d) => d * theme.line.thickness);
      series[`dataPointsShape${k + 1}`] = mark.shape === "square" || mark.shape === "diamond" ? "rectangular" : mark.shape === "triangle" || mark.shape === "cross" ? "triangular" : "circular";
    }
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
