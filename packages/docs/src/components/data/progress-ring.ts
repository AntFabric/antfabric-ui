import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "progress-ring",
  name: "ProgressRing",
  category: "data",
  level: "atom",
  group: "kpi",
  status: "draft",
  description: "A value against its goal as a ring, with a label in the middle. It is a share, not a state: it has no thresholds and no colour change of its own. Use a Meter where the value running out or running low matters.",
  props: {
    value: {
      type: "number",
      sample: 0.583,
      required: true,
      description: "What is done, in the same unit as `max`. A value past `max` is a full ring.",
    },
    max: { type: "number", default: 1, description: "The goal: 1 when the value is already a share (0.583 is 58.3%)." },
    size: { type: "number", sample: 56, description: "Px (points on the phone). Default 56 on the web and desktop, 48 on the phone (`kpi.ringSize`); the catalogue draws 56 on both." },
    thickness: {
      type: "number",
      default: 0,
      description: "The stroke's width. 0 is 12% of the size, and never less than 5.",
    },
    tone: {
      type: "enum",
      options: ["default", "positive", "negative", "warning"],
      default: "default",
      description: "default is the first series colour; positive, negative and warning are the data palette's gain, loss and caution.",
    },
    center: {
      type: "string",
      default: "",
      description: "The text in the middle, in the chart font. Empty is the share, \"58%\"; pass what the ring measures (\"455\") when that is clearer.",
    },
    animate: {
      type: "boolean",
      default: false,
      description: "Draws in once when it mounts, unless the person reduces motion. Off by default.",
    },
    label: {
      type: "string",
      default: "",
      description: "The ring's name for a screen reader. Empty says the text in the middle if there is one and the share (\"58.3% of the goal\"); say what the goal is where the label beside it does not (\"Tickets resolved by Fabric, 455 of 600\").",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "recharts' PieChart at an explicit size: a whole-ring Pie in the track colour under the value's Pie, whose ends are rounded (cornerRadius); the middle is a <span> in the chart font",
      import: "import { ProgressRing } from \"@antfabric/ui-react/data\"",
      notes: ["Shipped from the data subpath: recharts is a dependency of the React kit and is reached only from there."],
    },
    desktop: {
      status: "ready",
      base: "The same recharts PieChart as web, at desktop density",
      import: "import { ProgressRing } from \"@antfabric/ui-react/data\"",
    },
    mobile: {
      status: "ready",
      base: "react-native-gifted-charts' PieChart as a donut with two slices (the value, then the track), starting at 12 o'clock and running clockwise, with a Text over its hole",
      import: "import { ProgressRing } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "gifted-charts' slices have no round ends, so the phone's ring ends square where the web's is round.",
        "The hole is the card's colour: a ring on a tinted surface shows its edge.",
      ],
    },
  },
  a11y: {
    role: "progressbar",
    label: "The `label` prop, or the text in the middle and the share (\"455, 76% of the goal\"); the spoken value is the share",
    notes: [
      "The ring is a progressbar with a value: min 0, max the `max`, now the value held to that range, and the share as its text. The middle text is part of it (a progressbar's children are presentational), so it is read once, in the default name.",
      "The chart's pieces are not focus stops: the ring is not in the Tab order at all.",
      "A value that is not a number reads \"Progress unavailable\" and draws an empty track with an en dash.",
    ],
  },
  examples: [
    { name: "Resolved by Fabric", props: { value: 0.583, label: "Resolved by Fabric, 58.3% of tickets" } },
    { name: "Q4 goal", description: "The middle says what is counted, not the share.", props: { value: 455, max: 600, center: "455", label: "Tickets resolved by Fabric, 455 of 600" } },
    { name: "Approvals cleared in a day", props: { value: 128, max: 150, tone: "positive", label: "Approvals cleared within a day, 128 of 150" } },
    { name: "Behind", props: { value: 0.31, tone: "warning", label: "Docs questions answered, 31% of the target" } },
    { name: "Small", props: { value: 0.42, size: 40 } },
    { name: "Large and thick", props: { value: 0.91, size: 72, thickness: 8, tone: "positive" } },
    { name: "Drawn in", props: { value: 0.76, animate: true } },
  ],
  matrix: [{ prop: "tone" }],
  edgeCases: [
    {
      title: "Not started",
      platforms: ["web", "desktop", "mobile"],
      handling: "Zero draws the whole track and no value slice: no round-ended stub at 12 o'clock. The middle says 0%.",
      example: { name: "Zero", props: { value: 0 } },
    },
    {
      title: "Past the goal",
      platforms: ["web", "desktop", "mobile"],
      handling: "A value past the max is a full ring, clamped. The middle says 100%: if the real number matters, pass it as `center` (\"112%\").",
      example: { name: "Over", props: { value: 1.12, center: "112%" } },
    },
    {
      title: "No goal",
      platforms: ["web", "desktop", "mobile"],
      handling: "A max of zero, or a value or max that is not a number, draws the empty track and an en dash. It never draws a full ring.",
      example: { name: "No max", props: { value: 12, max: 0 } },
    },
    {
      title: "A small ring",
      platforms: ["web", "desktop", "mobile"],
      handling: "The middle text is one line at caption size whatever the ring's size, so a short share fits a ring of about 40px or more. Below that, or with a longer text, it overflows the hole: keep `center` to the share or a few digits, and put anything longer beside the ring.",
      example: { name: "Tight", props: { value: 0.58, size: 40, center: "58%" } },
    },
  ],
  related: ["meter", "progress-bar", "stat-tile"],
};

export default docs;
