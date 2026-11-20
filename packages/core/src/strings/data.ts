import type { StringGroups } from "./index";
import { dataCharts, dataChartsOnly } from "./data-charts";
import { dataKpi, dataKpiOnly } from "./data-kpi";

/** Built-in text of the `data` components, keyed by component id: KPIs and tables in `data-kpi.ts`, charts and panels in `data-charts.ts`. See `strings/index.ts`. */
export const data = { ...dataKpi, ...dataCharts } as const satisfies StringGroups;

/** The platform-only keys of the data components, from `data-kpi.ts` and `data-charts.ts` (`strings/index.ts` collects every export named `…Only`). */
export const dataOnly = { ...dataKpiOnly, ...dataChartsOnly } as const;
