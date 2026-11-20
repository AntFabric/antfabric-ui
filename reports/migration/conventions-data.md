# Conventions pass: data components (`reports/api/conventions.md`)

- Breakdown, DonutChart, GoalRings: the field prop `label` → `name` (the field of each row that names its part, segment or goal). They read `name` and `value`; GoalRings keeps `goal`. `label` is only ever an accessible name, so these three no longer take one.
- Breakdown, DonutChart, GoalRings: `selection` → `selected`, `onSelectionChange(selection)` → `onSelectedChange(selected)`. Both still hold the part's name (the value of the `name` field), or `null`.
- Sparkline, SparkBars: `field` → `y` (the field of each row that is the value).
- KpiCard, StatTile: `trendField` → `trendY`.
- Table: `rowKey` defaults to `"key"` (was `"id"`). Rows that named themselves `id` pass `rowKey="id"` or rename the field to `key`. `selected` and `onSelectedChange` hold those keys.
- Core `chartTable` (what "View as table" shows): each row carries `key: "row-0"` (was `id: "row-0"`), the Table's new default `rowKey`. A chart row's own `key` field is overwritten in that table, as `id` was.
- Unchanged, checked: BarChart, LineChart, ComboChart, RadarChart, MetricTabs and PeriodCompare already read `x` and `y` (or `bars`, `line`, `metrics`, `current`, `previous`). MetricTabs `value` / `onValueChange` is declared `changes: "value"` and goes through `useControllable`; `value` holds a metric's `field`, and a metric's `field` is not renamed to `key`.
- Docs only, no kit change: a required prop has no `default` now; its catalogue value is its `sample`. That covers `data`, `x`, `y`, `bars`, `line`, `current`, `previous`, `metrics`, `value`, `name`, `goal`, `title`, `label`, `columns` and `rows` on the 20 components.
