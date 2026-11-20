import type { ComponentDocs } from "../../types";
import { QUALITY, commonProps, headingLevelProp } from "./chart-samples";

/** The props every ready-made chart takes alike, less the ones that mean a date. */
const { title, subtitle, headline, format, labels, height, empty, emptyLine, loading, hidden, onHiddenChange } = commonProps({ title: "Fabric's answer quality", subtitle: "Reviewer scores out of 100, by quarter", labels: { q4: "Q4 2026", q3: "Q3 2026" }, height: 280 });

/** Fabric's answers, scored by reviewers each quarter: Q4 against Q3 on six areas. */
const quality = { data: QUALITY, x: "area", y: ["q4", "q3"], labels: { q4: "Q4 2026", q3: "Q3 2026" }, title: "Fabric's answer quality", subtitle: "Reviewer scores out of 100, by quarter" };

const docs: ComponentDocs = {
  id: "radar-chart",
  name: "RadarChart",
  category: "data",
  level: "organism",
  group: "chart",
  status: "draft",
  description:
    "Several scores on shared axes, one polygon per series: how one thing does on six measures, and how it did last quarter. The grid is the scale (the outer ring is `max`), each polygon is a flat fill and a line in its series colour, the legend turns series off, and the tooltip lists every series on the axis it is on. For a few categories and one measure, a BarChart reads more exactly; \"View as table\" has the numbers.",
  props: {
    headingLevel: headingLevelProp,
    data: {
      type: "array",
      sample: QUALITY,
      required: true,
      description: "Rows, one per axis: [{ area: \"Accuracy\", q4: 86, q3: 78 }, …]. The same rows can feed a table and a bar chart. Three axes or more make a shape; two make a line.",
    },
    x: { type: "string", sample: "area", required: true, description: "The field of each row that names its axis." },
    y: {
      type: "array",
      sample: ["q4", "q3"],
      required: true,
      description: "The field, or fields, that are the scores: \"q4\" or [\"q4\", \"q3\"]. One to five, one polygon each; a sixth and after are not drawn. A value that is not a number is 0.",
    },
    title,
    subtitle,
    headline,
    max: { type: "number", default: 100, description: "What a score at the outer ring is. A score past it is drawn on the ring and a score under zero at the centre; the tooltip and the table still say the real number." },
    format,
    labels,
    height,
    empty,
    emptyLine,
    loading,
    hidden,
    onHiddenChange,
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title, an optional headline, \"View as table\" (Button); a ChartFrame holding recharts' RadarChart (PolarGrid, PolarAngleAxis, a hidden PolarRadiusAxis, a Radar per series); the Legend (toggle buttons) in the header beside the Button, as the reference dashboard has it",
      import: "import { RadarChart } from \"@antfabric-ui/react/data\"",
      notes: [
        "Shipped from the data subpath: recharts is reached only from there. The chart is handed an explicit width and height.",
        "The grid's rings and spokes, the axes' names in the chart's quiet text, the tooltip and the series colours are the same chart tokens every chart reads (`rechartsTheme()`), and no colour of the brand is.",
        "A polygon is its colour at one opacity (`FLAT_FILL`) and a line, never a gradient. Where two polygons overlap the fills add, which is how you can see Q3 sits inside Q4.",
        "The polygons draw in once over 600ms on the kit's ease-out and tween to new values (a series turned off, new rows); the tooltip glides between axes. Reduced motion turns it off.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves into the plot, then on to the legend's entries and \"View as table\"" },
        { keys: "Enter", action: "On a legend entry: turns the series off or back on" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card, recharts' RadarChart and Legend as web, at desktop density",
      import: "import { RadarChart } from \"@antfabric-ui/react/data\"",
      notes: ["The same `rechartsTheme()` as web. Hover is the pointer's, so the tooltip follows it; there is no press-and-hold."],
      keyboard: [
        { keys: "Tab", action: "Moves into the plot, then on to the legend's entries and \"View as table\"" },
        { keys: "Enter", action: "On a legend entry: turns the series off or back on" },
      ],
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header and Button, a ChartFrame holding react-native-gifted-charts' RadarChart with `dataSet` and a `polygonConfigArray`; the Legend's toggles above the plot",
      import: "import { RadarChart } from \"@antfabric-ui/react-native/data\"",
      notes: [
        "Shipped from the data subpath: gifted-charts and react-native-svg are reached only from there.",
        "gifted-charts' radar applies one opacity to a polygon's fill and line alike, so each series is two polygons in `dataSet`: its fill at `FLAT_FILL`, then its line over it. Its grid and polygon gradients default on and share ids across charts, which draws the wrong colours, so `showGradient` is off on every one and the fills are the tokens'.",
        "gifted-charts' radar has no pointer of its own: the kit finds the axis under a finger from where it lands (core's `nearestAxis`) and draws the tooltip card, so a finger can read each axis as the web's pointer does.",
        "The polygons draw in unless the person reduces motion. Under react-native-web (the catalogue, `pnpm check`) gifted-charts' animation is off, because the values it animates with reach the DOM as text.",
      ],
      gestures: [
        { gesture: "Press and drag over the plot", action: "The nearest axis's name goes bold and the tooltip card lists every series on it; lifting the finger hides it" },
        { gesture: "Tap a legend entry", action: "Turns the series off or back on" },
      ],
    },
  },
  a11y: {
    role: "figure (web), one image (phone)",
    label: "The summary: \"Fabric's answer quality: Q4 2026: highest Speed (94), lowest Follow-up (68); Q3 2026: highest Speed (90), lowest Follow-up (63).\"",
    notes: [
      "The figure is named by the sentence core's `summarize` writes from the rows, categories read as highest and lowest; it is heard, not printed: in the light theme most series colours sit under 3:1 against the card, so the tooltip and \"View as table\" give the scores without colour.",
      "\"View as table\" is the other way in, and the better one for exact numbers: one row per axis, one column per series, with real headers.",
      "The legend says what it toggles: each entry is a button that is pressed while the series is on, struck through when it is off. The last series showing cannot be turned off.",
      "A radar is not read polygon by polygon: the summary and the table carry the scores, and the tooltip is never the only place a value is.",
    ],
  },
  examples: [
    { name: "Fabric's answer quality", description: "Q4 against Q3 on six areas: Q4 is out on every one, and most on Citations.", props: { ...quality }, width: 520 },
    {
      name: "With a headline",
      description: "The card leads with a number, its change and what it is against.",
      props: { ...quality, headline: { value: 81.8, format: { type: "decimal", digits: 1 }, delta: 0.081, period: "average score, vs Q3" } },
      width: 520,
    },
    { name: "One series", description: "One polygon needs no key, so there is no legend.", props: { ...quality, y: "q4", labels: { q4: "Q4 2026" }, subtitle: "Reviewer scores out of 100, Q4 2026" }, width: 520 },
    { name: "A series turned off", description: "`hidden` is the legend's state: Q3 is off, so only Q4 is drawn and its entry is struck through.", props: { ...quality, hidden: ["q3"] }, width: 520 },
    { name: "Loading", props: { ...quality, loading: true }, width: 520 },
  ],
  edgeCases: [
    {
      title: "No rows",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `data` draws the kit's EmptyState in the plot's place and says why (the title and line are props); the card keeps its header and has no \"View as table\" and no legend, since there is nothing to show or toggle.",
      example: { name: "Empty", props: { data: [], x: "area", y: ["q4", "q3"], title: "Fabric's answer quality", subtitle: "Empty", empty: "No reviews yet this quarter", emptyLine: "Scores appear once a reviewer has scored a sample.", height: 220 }, width: 480 },
    },
    {
      title: "A score over the scale",
      platforms: ["web", "desktop", "mobile"],
      handling: "A score past `max` is drawn on the outer ring, not out past it where it would run into the axes' names; the tooltip and the table still say the real number (112). A score under zero is drawn at the centre.",
      example: { name: "Over", props: { ...quality, data: QUALITY.map((r) => (r.area === "Citations" ? { ...r, q4: 112 } : r)), subtitle: "Citations is scored out of 100 and got 112", y: ["q4"], labels: { q4: "Q4 2026" } }, width: 520 },
    },
    {
      title: "All zero",
      platforms: ["web", "desktop", "mobile"],
      handling: "A series that scored nothing everywhere is a polygon of no area at the centre: the grid is there, the legend still names it and the summary says its highest and lowest are 0.",
      example: { name: "All zero", props: { ...quality, data: QUALITY.map((r) => ({ area: r.area, q4: 0 })), y: ["q4"], labels: { q4: "Q4 2026" }, subtitle: "Nothing scored yet", height: 240 }, width: 480 },
    },
    {
      title: "More than five series",
      platforms: ["web", "desktop", "mobile"],
      handling: "A radar draws the first five, on both kits: more are a tangle that no legend untangles. The legend and the table hold the same five. A sixth is a different chart: a table, or a BarChart.",
      example: {
        name: "Six fields",
        props: { ...quality, data: QUALITY.map((r) => ({ ...r, q2: r.q3 - 4, q1: r.q3 - 9, q0: r.q3 - 14, q9: r.q3 - 19 })), y: ["q4", "q3", "q2", "q1", "q0", "q9"], labels: { q4: "Q4 2026", q3: "Q3 2026", q2: "Q2 2026", q1: "Q1 2026", q0: "Q4 2025", q9: "Q3 2025" }, subtitle: "The sixth is not drawn", height: 300 },
        width: 520,
      },
    },
    {
      title: "A long axis name",
      platforms: ["web", "desktop", "mobile"],
      handling: "Axis names sit outside the outer ring in the room the plot keeps for them, and a long one is the app's to shorten: the tooltip and the table carry the full row.",
      example: { name: "Long names", props: { ...quality, data: QUALITY.map((r) => (r.area === "Escalation" ? { ...r, area: "Escalation to a person" } : r)), y: ["q4"], labels: { q4: "Q4 2026" } }, width: 520 },
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Grey bars of uneven heights fill the plot and the card keeps its header. There is no legend, no table button and no summary yet. A screen reader hears \"Loading chart\" once.",
      example: { name: "Loading", props: { ...quality, loading: true, height: 220 }, width: 480 },
    },
  ],
  related: ["bar-chart", "line-chart", "donut-chart", "gauge-chart", "table", "metric-value", "delta", "card", "button", "skeleton", "empty-state"],
  flows: [
    {
      id: "read-an-axis",
      title: "Read Citations",
      description: "The tooltip follows the pointer on the web and the desktop, and a finger pressed on the plot on the phone: one card, listing every series on the nearest axis.",
      platforms: ["web", "desktop", "mobile"],
      width: 520,
      steps: [
        {
          kind: "data",
          title: "The app holds one row per area",
          detail: "A row is an axis and a score per series. The same rows feed this chart, a table and a bar chart, so a dashboard fetches once.",
          code: "const rows = [{ area: \"Citations\", q4: 72, q3: 61 }, …]",
        },
        {
          kind: "trigger",
          title: "The pointer moves over the Citations axis",
          detail: "recharts finds the nearest axis as the pointer moves over the plot; there is no press.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "A finger is pressed on the plot and dragged",
          detail: "There is no hover on a phone, so a press is the pointer: it picks up at once and follows the finger round the chart, and lifting it puts the card away.",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The active axis is Citations",
          detail: "The chart's own state, not the app's: nothing is reported and nothing needs saving. Every series on that axis is active together.",
          code: "activeIndex: 3",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The finger is nearest Citations",
          detail: "gifted-charts' radar reports no touch, so the kit works the axis out from where the finger is and its angle from the centre.",
          code: "nearestAxis(x, y, size, rows.length)",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The card glides to the axis",
          detail: "The card eases from the last axis to this one over 150ms on the kit's ease-out and each polygon's corner on it grows a ring in the card's colour; reduced motion makes it a jump.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The axis name goes bold and the card follows the finger",
          detail: "The nearest axis's name takes the strong ink and a heavier weight and the card sits above the finger, kept inside the plot. It tracks the finger with no easing: a finger is already smooth.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "One card: Citations, and each series' score",
          detail: "The title is the axis, each row is a swatch, the series' name and its score in the chart's format. Moving off the plot puts the card away.",
        },
      ],
      replay: [{ step: 0, hold: 2600, props: { ...quality } }],
    },
    {
      id: "turn-off-q3",
      title: "Turn Q3 off",
      description: "The legend is the series' switch. Pressing an entry takes the polygon out; pressing it again brings it back. The last series showing stays on.",
      platforms: ["web", "desktop", "mobile"],
      width: 520,
      steps: [
        {
          kind: "data",
          title: "The legend's state is the chart's, or the app's",
          detail: "Left alone, the chart keeps which series are off. An app that wants to remember it (per user, per saved view) passes `hidden` with `onHiddenChange`.",
          code: "const [hidden, setHidden] = useState<string[]>([])",
        },
        {
          kind: "trigger",
          title: "The Q3 2026 entry is pressed",
          detail: "Each entry is a toggle button, named for the series. A series that is off is struck through and faint.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "The Q3 2026 entry is tapped",
          detail: "A toggle at least 44pt tall, named for the series, that is selected while the series is on.",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onHiddenChange fires with every series that is off",
          detail: "The whole list, not the one that moved, so the app never has to merge. Pressing the last series showing calls nothing.",
          code: "onHiddenChange?.([\"q3\"])",
        },
        {
          kind: "state",
          title: "The series is off",
          detail: "The sentence a screen reader hears, the tooltip's rows and the table's columns all follow it. The grid does not change: the scale is `max`, not the data.",
          code: "setHidden([\"q3\"])",
        },
        {
          kind: "motion",
          title: "The polygon is taken out",
          detail: "The remaining polygon stays where it is; the one that was turned off is taken out of the chart. Reduced motion makes no difference: nothing moves.",
        },
        {
          kind: "result",
          title: "Only Q4 is drawn",
          detail: "The figure's sentence is about Q4 alone and the Q3 2026 entry reads struck through. Press it again to bring the polygon back.",
        },
      ],
      replay: [
        { step: 0, hold: 1600, props: { ...quality, hidden: [] } },
        { step: 1, press: "Q3 2026", hold: 1100, platforms: ["web", "desktop"], props: { ...quality, hidden: [] } },
        { step: 2, press: "Q3 2026", hold: 1100, platforms: ["mobile"], props: { ...quality, hidden: [] } },
        { step: 6, hold: 2400, props: { ...quality, hidden: ["q3"] } },
      ],
    },
  ],
};

export default docs;
