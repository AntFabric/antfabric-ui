import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "delta",
  name: "Delta",
  category: "data",
  level: "atom",
  group: "kpi",
  status: "draft",
  description: "How a number changed: an arrow, the change, and a colour that says whether that is good. Up is good unless `inverse`; the hues are the data palette's own, never the brand or a status colour.",
  props: {
    value: {
      type: "number",
      sample: 0.044,
      required: true,
      description: "The change, as the number the format prints: 0.044 is +4.4% under the default format. Zero has no direction and draws a dash.",
    },
    inverse: {
      type: "boolean",
      default: false,
      description: "Down is good (open tickets, response time, cost): the green and the red swap. The arrow still points the way the number went.",
    },
    format: {
      type: "object",
      default: { type: "percent", sign: true },
      description: "A format name (\"points\"), its options ({ type: \"percent\", digits: 2 }) or a function: what core's `fmt` takes, so a Delta, an axis and a table cell print one value the same way.",
    },
    size: {
      type: "enum",
      options: ["sm", "md", "lg"],
      default: "md",
      description: "sm is 11px type beside a stat's period; md is 12px, a KPI tile's; lg is body size, a headline's.",
    },
    variant: {
      type: "enum",
      options: ["text", "badge"],
      default: "text",
      description: "text is the arrow and the number in the data ink, for running beside a value. badge sits them on the soft fill of the same hue, for a KPI card's corner or a table cell.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <span role=\"img\"> named by the change (\"Up 4.4%, good\"): the kit's Icon and a text span drawn from its recipe; the tone's ink and fill are picked from the data tokens. No chart library",
      import: "import { Delta } from \"@antfabric/ui-react/data\"",
      notes: ["Shipped from the data subpath, not the root entry: an app that never imports it carries none of the chart code."],
    },
    desktop: {
      status: "ready",
      base: "The same <span role=\"img\"> as web, at desktop density",
      import: "import { Delta } from \"@antfabric/ui-react/data\"",
    },
    mobile: {
      status: "ready",
      base: "A View (accessibilityRole image, labelled with the change) over the kit's Icon and a Text, drawn from the same recipe",
      import: "import { Delta } from \"@antfabric/ui-react-native/data\"",
      notes: ["The type is one step up on the phone, as every text token is; the arrow follows the icon tokens."],
    },
  },
  a11y: {
    role: "img",
    label: "\"Up 4.4%, good\", \"Down 10.1%, good\" for an inverse Delta, \"No change\"",
    notes: [
      "The arrow and the number are drawn, not read: the label says the direction, the size and whether it is good or bad, so the colour is never the only signal.",
      "The label leaves the sign out of the number (\"Down 10.1%\", not \"Down -10.1%\") because the word carries it.",
      "A value that is not a number reads \"Change unavailable\" and draws an en dash.",
    ],
  },
  examples: [
    { name: "MRR, up", description: "Monthly recurring revenue, this month against last.", props: { value: 0.044 } },
    { name: "Open tickets, down is good", description: "#platform-eng closed more than it opened: the arrow points down and the Delta is green.", props: { value: -0.101, inverse: true } },
    { name: "Response time, up is bad", description: "Fabric's median first reply got slower.", props: { value: 0.062, inverse: true } },
    { name: "Win rate in points", description: "A change in a share is a difference of points, not a percent of a percent.", props: { value: 0.038, format: "points" } },
    { name: "Badge", props: { value: 0.044, variant: "badge" } },
    { name: "Badge, down is good", props: { value: -0.101, inverse: true, variant: "badge" } },
    { name: "Headline size", props: { value: 0.128, size: "lg" } },
  ],
  matrix: [{ prop: "size" }, { prop: "variant" }],
  edgeCases: [
    {
      title: "No change",
      platforms: ["web", "desktop", "mobile"],
      handling: "Zero draws a dash in the muted text colour and reads \"No change\". It is neither good nor bad, so it takes neither hue.",
      example: { name: "Zero", props: { value: 0 } },
    },
    {
      title: "No value yet",
      platforms: ["web", "desktop", "mobile"],
      handling: "NaN (a first period with nothing to compare to) draws an en dash and reads \"Change unavailable\". It is never drawn as 0%: a missing comparison is not no change.",
    },
    {
      title: "A large swing",
      platforms: ["web", "desktop", "mobile"],
      handling: "A tenfold rise reads +1,240% with the thousands separator; the badge grows to fit. Past a few digits, change the format (a multiple, \"12.4×\") rather than print a long percent.",
      example: { name: "Large", props: { value: 12.4, variant: "badge" } },
    },
    {
      title: "Down and bad",
      platforms: ["web", "desktop", "mobile"],
      handling: "A fall in revenue is red and reads \"Down 6.2%, bad\". The colour follows good or bad, the arrow follows the number.",
      example: { name: "Down", props: { value: -0.062, variant: "badge" } },
    },
  ],
  related: ["sparkline", "tag", "badge"],
};

export default docs;
