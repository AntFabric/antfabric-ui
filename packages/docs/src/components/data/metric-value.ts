import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "metric-value",
  name: "MetricValue",
  category: "data",
  level: "atom",
  group: "kpi",
  status: "draft",
  description: "A number as a headline: the digits large and strong, the symbol and unit around them ($, K, %, m) smaller and fainter, so $184,200 reads as 184,200 first. It prints through the same formats as an axis and a table cell, and eases to a new value when it changes.",
  props: {
    value: {
      type: "number",
      sample: 184200,
      required: true,
      description: "The number. When it changes the digits ease to the new one over 300ms; the first value, and any value under reduced motion, appears at once.",
    },
    format: {
      type: "object",
      default: { type: "currency" },
      description: "A format name (\"percent\"), its options ({ type: \"currency\", compact: true }) or a function: what core's `fmt` takes, so a headline, an axis and a table cell print one value the same way. Whatever surrounds the digits in the printed text is drawn as the symbol or unit.",
    },
    size: {
      type: "enum",
      options: ["sm", "md", "lg", "xl"],
      default: "md",
      description: "The kit's type scale: sm is the lead size, md is h2, lg is h1, xl is display. md, lg and xl are one step smaller on the phone, where a 38px figure does not fit.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <span> drawn from its recipe: the digits and, for each symbol or unit, a smaller span in the faint ink; proportional figures. A visually hidden copy carries the plain value for screen readers. No chart library",
      import: "import { MetricValue } from \"@antfabric/ui-react/data\"",
      notes: ["Shipped from the data subpath with the rest of the KPI pieces, though it draws no chart."],
    },
    desktop: {
      status: "ready",
      base: "The same <span> as web, at desktop density",
      import: "import { MetricValue } from \"@antfabric/ui-react/data\"",
    },
    mobile: {
      status: "ready",
      base: "One Text (accessibilityLabel the plain value) with a nested Text for each symbol or unit, which inherits the digits' baseline and overrides the size, ink and weight",
      import: "import { MetricValue } from \"@antfabric/ui-react-native/data\"",
      notes: ["md, lg and xl are one type step smaller than on the web and desktop; sm is the same."],
    },
  },
  a11y: {
    role: "text",
    label: "The plain formatted value, \"$184,200\", once",
    notes: [
      "The split into digits and units is drawing, not meaning: a screen reader gets the whole value from one place (a hidden copy on the web, the label on the phone) and the drawn pieces are hidden from it, so it never hears \"$\", \"184,200\" as separate things.",
      "While the digits ease to a new value a screen reader already has the new one; it does not hear the numbers in between.",
      "Reduced motion turns the easing off: the value changes at once.",
    ],
  },
  examples: [
    { name: "MRR", description: "Monthly recurring revenue: the dollar sign is the unit.", props: { value: 184200, format: { type: "currency" } } },
    { name: "Compact", description: "K and M are units too.", props: { value: 184200, format: { type: "currency", compact: true }, size: "lg" } },
    { name: "Resolved by Fabric", props: { value: 0.583, format: "percent", size: "lg" } },
    { name: "Median first reply", description: "A duration has two units, m and s.", props: { value: 134, format: "duration", size: "lg" } },
    { name: "Fabric runs in 24h", props: { value: 12480, format: "integer", size: "xl" } },
    { name: "Open tickets", props: { value: 142, format: "integer", size: "sm" } },
    { name: "Approvals waiting on Fabric", props: { value: 38, format: "integer" } },
  ],
  matrix: [{ prop: "size" }],
  edgeCases: [
    {
      title: "No value",
      platforms: ["web", "desktop", "mobile"],
      handling: "NaN (a number that has not loaded) draws an en dash at the digits' size, never a unit-sized dash and never 0. A screen reader hears \"–\".",
      example: { name: "Not a number", props: { value: NaN } },
    },
    {
      title: "Negative",
      platforms: ["web", "desktop", "mobile"],
      handling: "The sign stays with the digits and the currency symbol is the unit: −$4,200 draws a full-size minus, a small $, and 4,200.",
      example: { name: "Net revenue", props: { value: -4200, format: { type: "currency" }, size: "lg" } },
    },
    {
      title: "A function format",
      platforms: ["web", "desktop", "mobile"],
      handling: "Whatever the function returns is split the same way: the digits are strong and the text around them is the unit. A result with no digit in it is drawn whole at the digits' size.",
      example: { name: "Seats", props: { value: 42, format: "integer", size: "lg" } },
    },
    {
      title: "A long value",
      platforms: ["web", "desktop", "mobile"],
      handling: "It never wraps: the figure keeps one line, and the parent decides what to do with the width (compact the format before a card clips it).",
      example: { name: "A year of revenue", props: { value: 2210400, format: { type: "currency" }, size: "xl" } },
    },
  ],
  related: ["delta", "stat-tile", "kpi-card"],
};

export default docs;
