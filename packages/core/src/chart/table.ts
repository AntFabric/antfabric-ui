/** A chart's rows as the columns and rows of a Table: what "View as table" shows. */

import type { FormatSpec } from "./format";
import type { TableColumn } from "./grid";
import type { Row } from "./types";

/** A column of a Table (`TableColumn`) with the fields a chart's rows always have: feed `columns` and `rows` straight to a Table. */
export interface ChartTableColumn extends TableColumn {
  cell: "text" | "number";
  align?: "end";
  /** Which columns a narrow table (the phone's card per row) keeps first: 1 is its title. */
  priority: number;
}

export interface ChartTableInput {
  data: Row[];
  /** The category field. */
  x: string;
  /** The value field or fields. */
  y: string | string[];
  /** The values' format. */
  format?: FormatSpec;
  /** The category's format (a date). */
  xFormat?: FormatSpec;
  /** A field's own format, where it is not `format`: MetricTabs' metrics are a count, a rate and a sum. */
  formats?: Record<string, FormatSpec | undefined>;
  /** A field's name for people (default the field). */
  labels?: Record<string, string>;
  /** The category column's name (default the field, capitalised). */
  xLabel?: string;
}

/** The category first, then each value field: the same rows, each with a `key` (a Table's default `rowKey`). */
export function chartTable({ data, x, y, format, xFormat, formats = {}, labels = {}, xLabel }: ChartTableInput): { columns: ChartTableColumn[]; rows: (Row & { key: string })[] } {
  return {
    columns: [
      { key: x, label: xLabel ?? x[0]!.toUpperCase() + x.slice(1), cell: "text", format: xFormat, priority: 1 },
      ...[y].flat().map((f, i): ChartTableColumn => ({ key: f, label: labels[f] ?? f, cell: "number", format: formats[f] ?? format, align: "end", priority: i + 2 })),
    ],
    rows: data.map((r, i) => ({ ...r, key: `row-${i}` })),
  };
}
