import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "meter",
  name: "Meter",
  category: "data",
  level: "atom",
  group: "kpi",
  status: "draft",
  description: "One value against a capacity or a target, as a bar that changes colour at its thresholds. `usage` is for what runs out (seats, storage, a quota) and turns to the caution colour and then the loss colour as it fills; `score` is for what you want high (a goal, a rating) and turns as it falls.",
  props: {
    value: {
      type: "number",
      sample: 0.42,
      required: true,
      description: "What there is, in the same unit as `max`. A value past `max` fills the bar and says the real share (112%).",
    },
    max: {
      type: "number",
      default: 1,
      description: "The capacity or target the value is measured against: 1 when the value is already a share (0.42 is 42%).",
    },
    label: {
      type: "string",
      sample: "Fabric runs used this month",
      required: true,
      description: "What is measured, and the meter's accessible name.",
    },
    kind: {
      type: "enum",
      options: ["usage", "score"],
      default: "usage",
      description: "usage is fine while low and worse as it fills; its fill is the data accent while it is fine. score is fine while high; its fill is the data gain colour while it is fine. Both turn to the caution colour and then the loss colour at the thresholds.",
    },
    format: {
      type: "object",
      default: "percent",
      description: "A format name, its options or a function, as core's `fmt` takes. \"percent\" prints the share (42%); any other prints the value of the max in it (9.4 GB of 10 GB, 455 of 600).",
    },
    thresholds: {
      type: "object",
      description: "{ warning, danger }: the shares of `max` where the fill turns to the caution colour and then the loss colour. Usage turns at or above them (default 0.75 and 0.9); a score turns at or below them (default 0.6 and 0.4).",
    },
    showState: {
      type: "boolean",
      default: true,
      description: "An icon beside the value in the caution (triangle) and critical (circle) states, so the state is not the fill's colour alone (WCAG 1.4.1). On by default; `false` leaves the colour and the spoken value to say it (\"78%, caution\"), for a product that prints the state beside the meter itself.",
    },
    compact: {
      type: "boolean",
      default: false,
      description: "Just a short track with the value beside it, for a table row or a list item that already names what it is. The label stays the track's accessible name.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <div role=\"meter\"> track over a fill, drawn from its recipe; the fill slides to a new value on a transform (never its width). The fill is picked from the data tokens by the value against its thresholds. No chart library",
      import: "import { Meter } from \"@antfabric/ui-react/data\"",
      notes: ["Shipped from the data subpath, not the root entry: an app that never imports it carries none of the chart code."],
    },
    desktop: {
      status: "ready",
      base: "The same <div role=\"meter\"> as web, at desktop density",
      import: "import { Meter } from \"@antfabric/ui-react/data\"",
    },
    mobile: {
      status: "ready",
      base: "A View (accessibilityRole progressbar, with accessibilityValue min, max, now and the printed text) over a track View and a fill View, drawn from the same recipe",
      import: "import { Meter } from \"@antfabric/ui-react-native/data\"",
      notes: ["React Native has no meter role: progressbar is the closest a screen reader announces as a value out of a range."],
    },
  },
  a11y: {
    role: "meter (web); img while the value is not a number. progressbar with a value on the phone, where there is no meter role",
    label: "The `label` prop, with the printed value as its text (\"42%\", \"9.4 GB of 10 GB\")",
    notes: [
      "The colour is never the only signal: the value is printed beside the label (or beside the track, compact) and is the meter's text, so a person who cannot tell the hues apart still has the number.",
      "aria-valuemin is 0, aria-valuemax the max and aria-valuenow the value held to 0 to max; the spoken value is the printed one, and in the caution and critical states it says so (\"78%, caution\", \"93%, critical\"), so the state is not the fill's colour alone. `showState` also draws an icon for it.",
      "A value that is not a number is not a meter: the track is a named image reading the label and an en dash, with no value attributes.",
    ],
  },
  examples: [
    { name: "Fabric runs used this month", props: { value: 0.42, label: "Fabric runs used this month" } },
    { name: "Seats used, near the limit", description: "78% of seats is over the 75% caution line.", props: { value: 0.78, label: "Seats used, Northwind Logistics" } },
    { name: "Storage, nearly full", description: "Over 90%: the loss colour.", props: { value: 9.4, max: 10, label: "Storage used", format: { type: "decimal", unit: " GB" } } },
    { name: "Q4 goal, a score", description: "455 of 600 tickets resolved by Fabric: high is good.", props: { value: 455, max: 600, kind: "score", format: "integer", label: "Q4 goal: tickets resolved by Fabric" } },
    { name: "A score that fell", description: "A score turns as it falls: 34% is under the 40% line.", props: { value: 0.34, kind: "score", label: "Questions Fabric answered without a handoff" } },
    { name: "Your own thresholds", props: { value: 142, max: 200, format: "integer", thresholds: { warning: 0.6, danger: 0.8 }, label: "Open tickets against the team's limit of 200" } },
    { name: "Compact", props: { value: 0.78, compact: true, label: "Seats used, Northwind Logistics" } },
  ],
  matrix: [{ prop: "kind" }, { prop: "compact" }],
  edgeCases: [
    {
      title: "Empty",
      platforms: ["web", "desktop", "mobile"],
      handling: "Zero draws the empty track and no fill. A usage meter at zero is fine; a score at zero is in the loss colour, because a score of nothing is bad.",
      example: { name: "Zero", props: { value: 0, label: "Storage used" } },
    },
    {
      title: "Over capacity",
      platforms: ["web", "desktop", "mobile"],
      handling: "A value past the max fills the track and stops there, and the text says the real share (112%). The fill is the loss colour for usage.",
      example: { name: "Over", props: { value: 1.12, label: "Fabric runs used this month" } },
    },
    {
      title: "No capacity",
      platforms: ["web", "desktop", "mobile"],
      handling: "A max of zero, or a value or max that is not a number, draws the empty track and an en dash. It never divides by zero or draws a full bar.",
      example: { name: "No max", props: { value: 12, max: 0, label: "Storage used" } },
    },
    {
      title: "A long label",
      platforms: ["web", "desktop", "mobile"],
      handling: "The label wraps and the value stays on its line at the end; it is never cut, since it is the meter's name.",
      example: { name: "Long", props: { value: 0.64, label: "Knowledge-base articles Fabric cited, across every channel the workspace has connected" } },
    },
  ],
  related: ["progress-ring", "progress-bar", "stat-tile"],
};

export default docs;
