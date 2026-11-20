# Data components and core chart helpers

- Shared chart pieces exported from `./data` take their text from the chart: `ChartFrame` requires `emptyTitle`, `emptyLine`, `loadingLabel`; `Legend` requires `label`; `ChartCard` requires `viewAsTable`, `viewAsChart`; `ChartTooltip` and bars take an optional `totalLabel`.
- Core chart helpers return parts, not English: `summarize`, `summarizeSegments`, `summarizeGauge`, `summarizeCompare`, `summarizeGoals` take a words object; `moved` returns `{ direction, known, value }`; `meterText` → `meterReading`; `goalLeft` removed (`Goal` carries `known`, `met`, `left`); `OTHER` removed (`segmentsOf` takes the folded segment's name); `cellText` takes the blank dash.
- KpiCard: the recipe's `trend` part now reaches the web.
