import { useState, type ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { chartTable, type ChartTableInput, type FormatSpec, type Row } from "@antfabric/ui-core/chart";
import { createStyles } from "../theme";
import { partId } from "../lib/root-props";
import type { PartStyle } from "../lib/recipe";
import { Button } from "../components/actions/button";
import { Card } from "../components/display/card";
import { Delta } from "../components/data/delta";
import { MetricValue } from "../components/data/metric-value";
import { Table } from "../components/data/table";

/** The number a chart's card leads with: a MetricValue, a Delta badge and what the change is against. */
export interface ChartHeadline {
  value: number;
  /** A format name, its options, or a function: what core's `fmt` takes. Default currency, as MetricValue's. */
  format?: FormatSpec;
  /** The change, as a number the delta format prints: `0.015` is `+1.5%`. Left out, there is no badge. */
  delta?: number;
  deltaFormat?: FormatSpec;
  /** Down is good: the badge's colours swap. */
  inverse?: boolean;
  /** What the change is against, after the badge: "resolved in October". */
  period?: string;
}

/** The parts of a chart's recipe the card draws (`chartCardParts`): the chart passes its own `useRecipe` result. */
export type ChartCardStyles = Record<"root" | "head" | "title" | "subtitle", PartStyle> & Partial<Record<"headline" | "period", PartStyle>>;

export interface ChartCardProps {
  /** The chart's docs id: the card's parts are `<id>.root`, `<id>.title` and so on. */
  id: string;
  r: ChartCardStyles;
  title: string;
  subtitle?: string;
  headline?: ChartHeadline;
  /** What "View as table" shows: the chart's rows as columns and rows (`chartTable`'s input). Left out (loading, nothing to show), there is no button. */
  table?: ChartTableInput | null;
  /** The series legend, in the header: beside "View as table" on the web and the desktop, as the reference dashboard draws it; above the plot on the phone. Not shown while the table is. */
  legend?: ReactNode;
  /** The plot, in a ChartFrame. Not shown while the table is. */
  children: ReactNode;
  /** The button's labels, from the chart's strings: the card has none of its own. */
  viewAsTable: string;
  viewAsChart: string;
  /** The product's `testID` for this chart: the root takes it and the parts are `<testID>.<part>`. Without one the parts keep `<id>.<part>`. */
  testID?: string;
  /** The chart's pass-through props (`rootProps(rest)`: nativeID, accessibilityLabel, accessibilityHint, ref), put on the card's content view. */
  root?: Record<string, unknown>;
  style?: ViewStyle;
}

const useStyles = createStyles((t) => ({
  card: { minWidth: 0 },
  head: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  titles: { flex: 1, minWidth: 0 },
  headline: { alignItems: "flex-start" },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: t.space.sm },
}));

/**
 * What every ready-made chart sits in: the kit's Card (`pad="none"`, the card's own padding inside), a header with the title and the line under it,
 * an optional headline value with its Delta, and a button that swaps the plot for the same rows in Table (a card per row). The plot, its frame and
 * the legend are the chart's. The recipe parts are the chart's own, so the three charts share one header (`chart-card.ts` in core's recipes).
 */
export function ChartCard({ id, r, title, subtitle = "", headline, table, legend, children, viewAsTable, viewAsChart, testID, root, style }: ChartCardProps) {
  const s = useStyles();
  const [asTable, setAsTable] = useState(false);
  const rows = table ? chartTable(table) : null;
  const showing = asTable && rows !== null;
  return (
    <Card
      pad="none"
      elevate="card"
      style={StyleSheet.flatten([s.card, style])}
      children={
        <View testID={partId(testID, id, "root")} {...root} style={r.root.view}>
          <View testID={partId(testID, id, "head")} style={[s.head, r.head.view]}>
            <View style={s.titles}>
              <Text testID={partId(testID, id, "title")} accessibilityRole="header" style={[r.title.view, r.title.text]}>{title}</Text>
              {subtitle ? <Text testID={partId(testID, id, "subtitle")} style={[r.subtitle.view, r.subtitle.text]}>{subtitle}</Text> : null}
            </View>
            {rows ? <Button label={showing ? viewAsChart : viewAsTable} variant="secondary" size="sm" iconLeading={showing ? "chart-column" : "table-2"} onPress={() => setAsTable((v) => !v)} /> : null}
          </View>
          {headline ? (
            // The value leads, on a line of its own and the largest text on the card; what it changed by, and against what, sits under it.
            <View testID={partId(testID, id, "headline")} style={[s.headline, r.headline?.view]}>
              <MetricValue value={headline.value} format={headline.format} size="lg" />
              {headline.delta !== undefined || headline.period ? (
                <View style={s.meta}>
                  {headline.delta !== undefined ? <Delta value={headline.delta} inverse={headline.inverse} format={headline.deltaFormat} variant="badge" /> : null}
                  {headline.period ? <Text testID={partId(testID, id, "period")} style={[r.period?.view, r.period?.text]}>{headline.period}</Text> : null}
                </View>
              ) : null}
            </View>
          ) : null}
          {showing ? <Table columns={rows.columns} rows={rows.rows as Row[]} label={title} /> : <>{legend}{children}</>}
        </View>
      }
    />
  );
}
