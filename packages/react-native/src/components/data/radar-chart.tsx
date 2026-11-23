import { useState } from "react";
import { type RootProps, rootProps } from "../../lib/root-props";
import { View, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { RadarChart as GiftedRadarChart } from "react-native-gifted-charts";
import { recipes, useLocale, useStrings, type KitStrings } from "@antfabric/ui-core";
import { FLAT_FILL, clampScore, markPath, nearestAxis, radarPoint, seriesMark, prepare, summarize, tipRows, useSeries, type FormatSpec, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { createStyles } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { ChartCard, type ChartHeadline } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { Legend } from "../../data/legend";
import { chartFont, giftedAnimated, giftedTheme, useChartTokens, useReducedMotion } from "../../data/theme";
import { ChartTooltip } from "../../data/tooltip";

export interface RadarChartProps extends RootProps {
  /** Rows, one per axis: `[{ area: "Accuracy", q4: 86, q3: 78 }, …]`. The same rows can feed a table and a bar chart. */
  data: Row[];
  /** The field of each row that names its axis. */
  x: string;
  /** The field, or fields (one to five), that are the scores: one polygon each. */
  y: string | string[];
  /** The card's title. It names the plot too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A number to lead with: a value, its change and what it is against. */
  headline?: ChartHeadline;
  /** What a score at the outer ring is. A score past it is drawn on the ring; the tooltip and the table still say the real number. */
  max?: number;
  /** A format name, its options, or a function: what core's `fmt` takes. The tooltip, the summary and the table print through it. */
  format?: FormatSpec;
  /** A field's name for people, for the legend and the tooltip: `{ q4: "Q4 2026" }`. */
  labels?: Record<string, string>;
  /** Each series gets its own dash and marker shape besides its colour, in the plot and in the legend, so two series are never told apart by hue alone. Left out, on for two or more series. */
  marks?: boolean;
  /** The plot's height, in points. */
  height?: number;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey bars in place of the plot, and no "View as table". */
  loading?: boolean;
  /** The series the legend has turned off, by field. Left out, the chart keeps its own and starts with every series on. */
  hidden?: string[];
  /** Called with every series that is off after a legend press. The last one showing cannot be turned off, so that press calls nothing. */
  onHiddenChange?: (hidden: string[]) => void;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"radar-chart">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["radar-chart"]>;
  /** The card title's heading level. The phone has one kind of header, so it is read for the web's sake and has no effect here. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: ViewStyle;
}

/** The most polygons a radar draws: past five they are a tangle, and the web's library draws the same five. */
const MOST = 5;
/** Rings across the grid, not counting the centre. */
const RINGS = 4;
/** How far past the outer ring the axes' names sit, as a share of `max` (gifted-charts takes it in the scale's own units). */
const LABEL_OFFSET = 0.1;

const useStyles = createStyles(() => ({
  plot: { alignItems: "center", justifyContent: "center" },
  overlay: { position: "absolute" },
  markers: { position: "absolute", top: 0, left: 0 },
}));

export function RadarChart({ data, x, y, title, subtitle = "", headline, max = 100, format = "integer", labels = {}, marks: marksProp, height = 280, empty, emptyLine, loading = false, hidden, onHiddenChange, styles, strings, headingLevel: _headingLevel, testID, style, ...rest }: RadarChartProps) {
  const str = useStrings("radar-chart", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const s = useStyles();
  const tk = useChartTokens();
  const reduced = useReducedMotion();
  const theme = giftedTheme(tk, reduced);
  const r = useRecipe(recipes["radar-chart"], { styles });
  const fields = [y].flat().slice(0, MOST);
  const marks = marksProp ?? fields.length > 1;
  const series = useSeries(fields, theme.series, { hidden, onHiddenChange });
  const { rows, keys } = prepare(data, x, formatWords, undefined, locale);
  const summary = summarize({ label: title, data, keys, fields: series.visible, labels, format, formatWords, locale, ordered: false }, {
    noData: (v) => str("noData", v),
    noValues: (v) => str("summaryNoValues", v),
    extremes: (v) => str("summaryExtremes", v),
    single: (v) => str("summarySingle", v),
    held: (v) => str("summaryHeld", v),
    rose: (v) => str("summaryRose", v),
    fell: (v) => str("summaryFell", v),
    peak: (v) => str("summaryPeak", v),
    range: (v) => str("summaryRange", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  });
  // Another channel than hue: each polygon's outline is dashed (`seriesMark`) and its points carry a marker, as the line chart's.
  const dashOf = (f: string) => {
    const dash = marks ? seriesMark(series.fields.indexOf(f)).dash : [];
    return dash.length ? dash.map((n) => n * theme.line.thickness) : undefined;
  };
  const markSize = theme.line.dataPointsRadius * 2;
  // The axis a finger is on, and where: gifted-charts' radar has no pointer of its own, so the kit finds the axis from the touch.
  const [touch, setTouch] = useState<{ axis: number; x: number; y: number } | null>(null);
  const animated = giftedAnimated(true, reduced);
  // gifted-charts takes the label's weight as a string; on a device the family (the weight's file) says it and the weight is left out.
  const label = (weight: "regular" | "semibold", color: string) => {
    const f = chartFont(tk, weight);
    return { stroke: color, fontSize: tk.chart.labelSize, fontFamily: f.fontFamily, fontWeight: f.fontWeight === undefined ? undefined : String(f.fontWeight) };
  };
  return (
    <ChartCard
      legend={!loading && data.length > 0 ? <Legend series={series} labels={labels} label={str("legend")} marks={marks} /> : null}
      id="radar-chart"
      testID={testID}
      root={rootProps(rest)}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      headline={headline && { format, ...headline }}
      table={!loading && data.length ? { data, x, y: fields, format, labels } : null}
      style={style}
    >
      <ChartFrame height={height} label={loading ? str("loading", { title }) : summary} loading={loading} empty={data.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {(width) => {
          const size = Math.max(tk.chart.plotMinW, Math.min(width - tk.space["2xl"] * 2, height));
          const offX = (width - size) / 2;
          const offY = (height - size) / 2;
          // A score is held to the scale for drawing, so no polygon leaves the outer ring; the tooltip reads the row as it was.
          const sets = series.visible.map((f) => rows.map((row) => clampScore(row[f], max)));
          const tipHeight = theme.tooltip.heightFor(series.visible.length);
          const pick = (e: { nativeEvent: { locationX: number; locationY: number } }) => {
            const { locationX: px, locationY: py } = e.nativeEvent;
            setTouch({ axis: nearestAxis(px, py, size, rows.length), x: px, y: py });
          };
          const left = touch ? Math.min(Math.max(0, offX + touch.x - theme.tooltip.width / 2), Math.max(0, width - theme.tooltip.width)) : 0;
          const top = touch ? Math.max(0, offY + touch.y - tipHeight - tk.space.md) : 0;
          const plot = partStyle(r, "plot", { view: { width, height } });
          return (
            <View testID="radar-chart.plot" style={[s.plot, plot.view]}>
              <View
                style={{ width: size, height: size }}
                onStartShouldSetResponder={() => true}
                onResponderGrant={pick}
                onResponderMove={pick}
                onResponderRelease={() => setTouch(null)}
                onResponderTerminate={() => setTouch(null)}
              >
                {/* Each polygon is two: its flat fill, then its line over it. gifted-charts applies one opacity to a polygon's fill and line alike, and its gradients default on and share ids, so they are off. */}
                <GiftedRadarChart
                  chartSize={size}
                  maxValue={max}
                  noOfSections={RINGS}
                  labels={keys}
                  dataSet={[...sets, ...sets]}
                  startAngle={90}
                  isClockWise
                  isAnimated={animated}
                  animationDuration={theme.motion.animationDuration}
                  polygonConfigArray={[
                    ...series.visible.map((f) => ({ stroke: "transparent", strokeWidth: 0, fill: series.colorOf(f), opacity: FLAT_FILL, showGradient: false, isAnimated: animated })),
                    ...series.visible.map((f) => ({ stroke: series.colorOf(f), strokeWidth: theme.line.thickness, strokeDashArray: dashOf(f), fill: "transparent", opacity: 1, showGradient: false, isAnimated: animated })),
                  ]}
                  gridConfig={{ stroke: tk.chart.grid, strokeWidth: tk.border.wHairline, fill: tk.surface.card, opacity: 1, showGradient: false }}
                  asterLinesConfig={{ stroke: tk.chart.grid, strokeWidth: tk.border.wHairline }}
                  labelConfig={label("regular", tk.fg.body)}
                  labelConfigArray={keys.map((_, i) => (touch?.axis === i ? label("semibold", tk.fg.strong) : label("regular", tk.fg.body)))}
                  labelsPositionOffset={max * LABEL_OFFSET}
                />
                {/* gifted-charts' radar draws no markers: the kit draws each series' (`seriesMark`) at its points, where the library puts them (`radarPoint`). */}
                {marks ? (
                  <Svg width={size} height={size} style={s.markers} pointerEvents="none">
                    {series.visible.map((f, k) => {
                      const shape = seriesMark(series.fields.indexOf(f)).shape;
                      return sets[k]!.map((v, i) => {
                        const p = radarPoint(i, rows.length, v, max, size);
                        return <Path key={`${f}-${i}`} d={markPath(shape, p.x, p.y, markSize)} fill={shape === "cross" ? "none" : series.colorOf(f)} stroke={series.colorOf(f)} strokeWidth={tk.border.wThick} />;
                      });
                    })}
                  </Svg>
                ) : null}
              </View>
              {touch ? (
                <View pointerEvents="none" style={[s.overlay, { left, top, width: theme.tooltip.width }]}>
                  <ChartTooltip tip={tipRows(rows[touch.axis]!, { fields: series.visible, labels, colorOf: series.colorOf, format, formatWords, locale })} />
                </View>
              ) : null}
            </View>
          );
        }}
      </ChartFrame>
    </ChartCard>
  );
}
