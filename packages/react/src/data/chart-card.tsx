import { useState, type CSSProperties, type ReactNode } from "react";
import type { ChartTableInput, FormatSpec, Row } from "@antfabric/ui-core/chart";
import { chartTable } from "@antfabric/ui-core/chart";
import { t } from "../tokens";
import { box, css, row, text } from "../lib/style";
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
export type ChartCardStyles = Record<"root" | "head" | "title" | "subtitle", CSSProperties> & Partial<Record<"headline" | "period", CSSProperties>>;

export interface ChartCardProps {
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
  /** The title's heading level, 1 to 6: a card under an h2 is an h3 (the default), under an h1 an h2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The chart's pass-through attributes (`rootProps(rest)`: id, className, data-*, aria-*, ref), put on the card's content element. */
  root?: Record<string, unknown>;
  style?: CSSProperties;
}

/**
 * What every ready-made chart sits in: the kit's Card (`pad="none"`, the card's own padding inside), a header with the title and the line under it,
 * an optional headline value with its Delta, and a button that swaps the plot for the same rows in Table. The plot, its frame and the legend are the
 * chart's. The recipe parts are the chart's own, so the three charts share one header (`chart-card.ts` in core's recipes).
 */
export function ChartCard({ r, title, subtitle = "", headline, table, legend, children, viewAsTable, viewAsChart, headingLevel = 3, root, style }: ChartCardProps) {
  const Title = `h${headingLevel}` as "h3";
  const [asTable, setAsTable] = useState(false);
  const rows = table ? chartTable(table) : null;
  const showing = asTable && rows !== null;
  return (
    <Card
      pad="none"
      elevate="card"
      style={css({ overflow: "hidden", minWidth: 0 }, style)}
      children={
        // A plain element, not a landmark: a page of charts would otherwise add one region each. The figure inside is named by the summary.
        <div data-af-part="root" {...root} style={css(box, r.root)}>
          <div data-af-part="head" style={css(row, { alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }, r.head)}>
            <div style={css(box, { flex: "1 1 auto" })}>
              <Title data-af-part="title" style={css(text, r.title)}>{title}</Title>
              {subtitle ? <p data-af-part="subtitle" style={css(text, r.subtitle)}>{subtitle}</p> : null}
            </div>
            {/* The legend and the button keep to the right; on a card too narrow for them beside the title they drop under it, still to the right. */}
            <div style={css(row, { marginLeft: "auto", gap: t.space.smMd })}>
              {showing ? null : legend}
              {rows ? <Button label={showing ? viewAsChart : viewAsTable} variant="secondary" size="sm" iconLeading={showing ? "chart-column" : "table-2"} onPress={() => setAsTable((v) => !v)} /> : null}
            </div>
          </div>
          {headline ? (
            // The value leads, on a line of its own and the largest text on the card; what it changed by, and against what, sits under it.
            <div data-af-part="headline" style={css(box, { alignItems: "flex-start" }, r.headline)}>
              <MetricValue value={headline.value} format={headline.format} size="lg" />
              {headline.delta !== undefined || headline.period ? (
                <div style={css(row, { flexWrap: "wrap", gap: t.space.sm })}>
                  {headline.delta !== undefined ? <Delta value={headline.delta} inverse={headline.inverse} format={headline.deltaFormat} variant="badge" /> : null}
                  {headline.period ? <span data-af-part="period" style={css(text, r.period)}>{headline.period}</span> : null}
                </div>
              ) : null}
            </div>
          ) : null}
          {showing ? <Table columns={rows.columns} rows={rows.rows as Row[]} rowKey={rows.rowKey} dense label={title} /> : children}
        </div>
      }
    />
  );
}
