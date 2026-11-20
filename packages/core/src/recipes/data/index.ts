// Recipes for the data components: one file per component, listed here.
import { barChart } from "./bar-chart";
import { breakdown } from "./breakdown";
import { comboChart } from "./combo-chart";
import { delta } from "./delta";
import { donutChart } from "./donut-chart";
import { gaugeChart } from "./gauge-chart";
import { goalRings } from "./goal-rings";
import { kpiCard } from "./kpi-card";
import { lineChart } from "./line-chart";
import { meter } from "./meter";
import { metricTabs } from "./metric-tabs";
import { metricValue } from "./metric-value";
import { pagination } from "./pagination";
import { periodCompare } from "./period-compare";
import { progressRing } from "./progress-ring";
import { radarChart } from "./radar-chart";
import { sparkBars } from "./spark-bars";
import { sparkline } from "./sparkline";
import { statTile } from "./stat-tile";
import { table } from "./table";

export const data = { "bar-chart": barChart, breakdown, "combo-chart": comboChart, delta, "donut-chart": donutChart, "gauge-chart": gaugeChart, "goal-rings": goalRings, "kpi-card": kpiCard, "line-chart": lineChart, meter, "metric-tabs": metricTabs, "metric-value": metricValue, pagination, "period-compare": periodCompare, "progress-ring": progressRing, "radar-chart": radarChart, "spark-bars": sparkBars, sparkline, "stat-tile": statTile, table } as const;
