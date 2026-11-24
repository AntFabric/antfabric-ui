import type { ComponentDocs } from "../../types";
import { GOALS, commonProps, headingLevelProp } from "./chart-samples";

/** The props every ready-made chart takes alike, less the ones that mean a plot's axes or a legend. */
const { title, subtitle, format, empty, emptyLine } = commonProps({ title: "Fabric's Q4 goals", subtitle: "As of October 31", labels: {}, height: 0 });

/** Fabric's Q4 goals: the same rows a table can be fed. */
const goals = { data: GOALS, name: "goal", value: "done", goal: "target", title: "Fabric's Q4 goals", subtitle: "As of October 31" };

const docs: ComponentDocs = {
  id: "goal-rings",
  name: "GoalRings",
  category: "data",
  level: "organism",
  group: "panel",
  status: "draft",
  description:
    "Up to three goals as nested rings, each filled as far as it has got, with the overall share in the middle and every goal listed beside the rings (below them on the phone) with what is done of its target and what is left, or \"Goal met\". Pointing at a goal (or its ring) lights it and pressing it picks it: the others step back and the middle eases to that goal's own share. \"View as table\" shows each goal's done and target in Table.",
  props: {
    headingLevel: headingLevelProp,
    data: {
      type: "array",
      sample: GOALS,
      required: true,
      description: "Rows, one per goal, in order: [{ goal: \"Tickets resolved by Fabric\", done: 455, target: 600 }, …]. The first three are drawn, outermost first, each in the next colour of the palette. The same rows can feed a table.",
    },
    name: { type: "string", sample: "goal", required: true, description: "The field of each row that names its goal." },
    value: { type: "string", sample: "done", required: true, description: "The field of each row that is what is done. A value that is not a number counts as 0." },
    goal: { type: "string", sample: "target", required: true, description: "The field of each row that is its target. A target of 0, or one that is not a number, is no goal: the ring is its empty track and the list says \"No goal set\"." },
    title,
    subtitle,
    format: { ...format, description: "A format name, its options or a function: what core's `fmt` takes. What is done, the target, what is left, the summary and \"View as table\" print through it. The shares are always whole percents." },
    valueLabel: { type: "string", default: "Done", description: "The done column's name in \"View as table\"." },
    goalLabel: { type: "string", default: "Target", description: "The target column's name in \"View as table\"." },
    centerLabel: { type: "string", default: "Completed", description: "What the middle says above the overall share. It says \"This goal\" while a goal is lit." },
    selected: {
      type: "string",
      description: "The goal that is picked, by its name (`name#2` for the second of two rows with one name): the middle shows its share and the other rings and goals step back until it is picked again. Pointing at a goal or tabbing to it lights it too, for as long as the pointer or the keyboard is there. Left out, the chart keeps its own, starting with none. Controlled when the app passes it with `onSelectedChange`.",
    },
    onSelectedChange: {
      type: "event",
      args: "selected: string | null",
      changes: "selected",
      description: "A ring or a goal was pressed. Called with the goal's name, or with null when it was already the one picked.",
    },
    empty: { ...empty, default: "No goals yet" },
    emptyLine: { ...emptyLine, default: "Add a goal to see how far along it is." },
    loading: { type: "boolean", default: false, description: "Grey bars in place of the rings and the list, from the kit's Skeleton, and no \"View as table\". The header stays, so the card does not jump when the data arrives. Screen readers hear it once." },
  },
  platforms: {
    web: {
      status: "ready",
      base: "The kit's Card (pad none) around a <section>: the title and \"View as table\" (Button); a ChartFrame holding one recharts PieChart with a track Pie and a value Pie per ring (round ends, 90 degrees round to -270), MetricValue in the middle, and a list of goals (<button> rows, aria-pressed) beside it",
      import: "import { GoalRings } from \"@antfabric/ui-react/data\"",
      notes: [
        "Shipped from the data subpath: recharts is reached only from there. The rings are handed an explicit size, never a responsive container.",
        "Each band is `chart.ringWidth` thick with `chart.ringGap` between it and the next ring in; the outermost is the first goal. A ring is its value Pie over a whole track Pie, so the round end of a value sits on the track.",
        "The overall share is the mean of the rings' fill: a goal that is passed counts as whole and cannot make up for one that is not. Pointing at a ring or at its goal (or tabbing to it) lights it: the other rings and goals fade to 38% over 150ms on the kit's ease-out, and the middle's number eases to that goal's own share (MetricValue) under \"This goal\", past 100% when it is passed (a full ring, 116%).",
        "The rings draw in once over 600ms on the kit's ease-out. Reduced motion turns it off.",
        "The list sits beside the rings and drops under them when the card is narrower than the rings, the gap and `chart.listMinWidth`.",
      ],
      keyboard: [
        { keys: "Tab", action: "Moves through the goals in the list, then to \"View as table\". A goal that has focus is lit, and so is its ring" },
        { keys: "Enter", action: "On a goal: picks it, or puts it back when it was picked" },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same Card, recharts' PieChart and list as web, at desktop density",
      import: "import { GoalRings } from \"@antfabric/ui-react/data\"",
      notes: ["The same chart as the web's. The pointer's hover lights a ring or a goal, and a click picks it."],
      keyboard: [
        { keys: "Tab", action: "Moves through the goals in the list, then to \"View as table\". A goal that has focus is lit, and so is its ring" },
        { keys: "Enter", action: "On a goal: picks it, or puts it back when it was picked" },
      ],
    },
    mobile: {
      status: "ready",
      base: "The kit's Card (pad none) around a View: the same header and Button, a ChartFrame holding one react-native-gifted-charts PieChart `donut` per ring, stacked in views as wide as each ring's outer edge (each starts at 12 o'clock), MetricValue in the middle, and the goals below as Pressable rows",
      import: "import { GoalRings } from \"@antfabric/ui-react-native/data\"",
      notes: [
        "Shipped from the data subpath: gifted-charts and react-native-svg are reached only from there. The rings are a little larger than the web's (`chart.ringSize` is 200pt, `chart.ringWidth` 15pt).",
        "gifted-charts' slices have square ends, so the rings have none of the web's round ones. The list is below the rings, full width, each goal at least 44pt tall.",
        "A phone has no hover, so a tap on a ring or on a goal picks it (the others step back to 38% and the middle shows its share, and `onSelectedChange` is called) and a tap on it again puts it back. gifted-charts' own press reads page coordinates on the web, which are wrong wherever the chart is not at the page's corner, so the kit finds the ring from where the touch landed in the square (`ringAt`).",
        "The rings pop in over 220ms unless the person reduces motion: gifted-charts' pie draws no sweep of its own.",
      ],
      gestures: [
        { gesture: "Tap a ring", action: "Picks its goal: the middle shows its share and the other rings step back. Tap it again to put it back" },
        { gesture: "Tap a goal in the list", action: "The same as tapping its ring" },
      ],
    },
  },
  a11y: {
    role: "figure (web), one image and a list (phone)",
    label: "The summary: \"Fabric's Q4 goals: Tickets resolved by Fabric 455 of 600 (76%); Approvals cleared within a day 128 of 150 (85%); Docs questions answered 1,940 of 2,500 (78%); 80% done overall.\"",
    notes: [
      "The figure (the rings on the phone) is named by the sentence core's `summarizeGoals` writes from the rows: each goal, what is done of its target and its share, and the overall share. It is heard, not printed: the list beside the rings prints each goal's name, what is done, the target and what is left, so colour is never the only way in.",
      "Each goal in the list is a button that says its own sentence (\"Approvals cleared within a day, 128 of 150, 22 to go\"), pressed while it is the one picked, and is a stop in the Tab order, so a keyboard can light and pick a goal as a pointer does. On the phone it is selected while it is the one picked.",
      "\"Goal met\" is words, not only a full ring; the ring's colour is the goal's key, and the list names every goal beside its swatch.",
      "The middle is drawn for the eye and hidden from a screen reader (it repeats the summary).",
      "\"View as table\" is the other way in: each goal with what is done and its target, with real headers.",
    ],
  },
  examples: [
    { name: "Fabric's Q4 goals", description: "Three goals as nested rings, the overall share in the middle and each goal listed with what is left.", props: { ...goals }, width: 640 },
    { name: "A goal picked", description: "`selected` is the second goal: the middle shows its own share under \"This goal\", and the other rings and goals step back.", props: { ...goals, selected: "Approvals cleared within a day" }, width: 640 },
    { name: "Two goals", description: "Two rings: the first is outermost, each still in its own colour.", props: { ...goals, data: GOALS.slice(0, 2), subtitle: "Two of three" }, width: 640 },
    { name: "Loading", props: { ...goals, loading: true }, width: 640 },
  ],
  edgeCases: [
    {
      title: "No goals",
      platforms: ["web", "desktop", "mobile"],
      handling: "An empty `data` draws the kit's EmptyState in the plot's place and says why (the title and line are props); the card keeps its header, and has no \"View as table\", since there is nothing to show. The figure's label says there are no goals.",
      example: { name: "Empty", props: { data: [], name: "goal", value: "done", goal: "target", title: "Fabric's Q4 goals", subtitle: "None set yet", empty: "No goals for Q4 yet", emptyLine: "Set one on the Planning page." }, width: 560 },
    },
    {
      title: "One goal",
      platforms: ["web", "desktop", "mobile"],
      handling: "One goal is one ring, the outermost, in the first colour of the palette; the middle's share is that goal's own.",
      example: { name: "One goal", props: { ...goals, data: [GOALS[0]], subtitle: "One goal" }, width: 560 },
    },
    {
      title: "A goal over 100%",
      platforms: ["web", "desktop", "mobile"],
      handling: "A ring never runs past full, so a goal that has been passed is a full ring and the list says \"Goal met\" with the numbers as they are (2,900 / 2,500). It counts as whole in the overall share, so it cannot make up for a goal that is behind. The summary says the real percent (116%).",
      example: { name: "Over the goal", props: { ...goals, data: [GOALS[0], GOALS[1], { goal: "Docs questions answered", done: 2900, target: 2500 }], subtitle: "Docs went past its goal" }, width: 560 },
    },
    {
      title: "A goal with no target",
      platforms: ["web", "desktop", "mobile"],
      handling: "A target of 0, or one that is not a number, is no goal to be a share of: the ring is its empty track, the list says \"No goal set\" with no numbers, the summary says it has no goal, and it counts as 0 in the overall share.",
      example: { name: "No target", props: { ...goals, data: [GOALS[0], { goal: "Customer interviews", done: 4, target: 0 }], subtitle: "One goal has no target" }, width: 560 },
    },
    {
      title: "More than three goals",
      platforms: ["web", "desktop", "mobile"],
      handling: "A fourth band would be too thin to read, so the first three rows are the rings and the rest are left out of the rings, the list and the summary. \"View as table\" has every row.",
      example: { name: "Four goals", props: { ...goals, data: [...GOALS, { goal: "Customers onboarded", done: 31, target: 40 }], subtitle: "Four goals, three drawn" }, width: 560 },
    },
    {
      title: "A long name",
      platforms: ["web", "desktop", "mobile"],
      handling: "A goal's name wraps on the web and the desktop and is cut with an ellipsis on the phone, where the numbers stay on its line; the summary and the table have the whole name.",
      example: { name: "A long name", props: { ...goals, data: [{ goal: "Customer success escalations answered within the hour", done: 38, target: 50 }, ...GOALS.slice(1)], subtitle: "A long goal name" }, width: 560 },
    },
    {
      title: "Loading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Grey bars of uneven heights fill the plot and the card keeps its header. There is no list, no table button and no summary yet. A screen reader hears \"Loading chart\" once.",
      example: { name: "Loading", props: { ...goals, loading: true }, width: 560 },
    },
  ],
  related: ["donut-chart", "gauge-chart", "progress-ring", "meter", "metric-value", "table", "card", "button", "skeleton", "empty-state"],
  flows: [
    {
      id: "look-at-a-goal",
      title: "Look at the approvals goal",
      description: "On the web and the desktop, pointing at a goal (or at its ring) lights it, and a click picks it; on the phone, a finger on the ring or the row picks it. The middle says that goal's share and the other rings step back.",
      platforms: ["web", "desktop", "mobile"],
      width: 640,
      steps: [
        {
          kind: "data",
          title: "The app holds one row per goal",
          detail: "A row is a name, what is done and the target. The same rows feed these rings and a table; the shares, what is left and the overall share are worked out from them, so none is passed in that could disagree.",
          code: "const rows = [{ goal: \"Approvals cleared within a day\", done: 128, target: 150 }, …]",
        },
        {
          kind: "trigger",
          title: "The pointer moves onto the second ring, or onto its goal",
          detail: "recharts reports which ring the pointer entered; a goal reports the same through the interaction hook (hover, or keyboard focus). Lighting a goal reports nothing: it is the pointer's, and not worth saving. A click picks it.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "A finger taps the second ring, or its goal",
          detail: "There is no hover on a phone, so a tap picks the goal, and the tap that picks it again puts it back. The kit finds the ring from where the finger landed in the square.",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onSelectedChange fires with the goal's name",
          detail: "A tap on the phone and a click on the web pick a goal, so the app can keep it (a filter that follows it, a saved view). Pressing it again calls it with null.",
          code: "onSelectedChange?.(\"Approvals cleared within a day\")",
        },
        {
          kind: "state",
          title: "The approvals goal is the one the rings show",
          detail: "The chart's own state, or the app's when it passes `selected`. It is the goal under the pointer or the keyboard, else the one that was picked: pointing at another goal moves the middle to it, and leaving puts the picked one back.",
          code: "setPicked(\"Approvals cleared within a day\")",
        },
        {
          kind: "motion",
          title: "The other rings step back and the number eases",
          detail: "The other rings and goals go to 38% over 150ms on the kit's ease-out; the middle's number counts from the overall share to this goal's 85% (MetricValue) and its label swaps to \"This goal\". Reduced motion makes both a jump.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The other rings step back and the number eases",
          detail: "The other rings and goals take 38% of their colour, and the middle's number counts to 85% (MetricValue) unless the person reduces motion.",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The middle says This goal, 85%",
          detail: "The goal's row says 128 / 150 and 22 to go. Press it again and the middle goes back to the overall share, 80%.",
        },
      ],
      replay: [
        { step: 0, hold: 2000, props: { ...goals } },
        { step: 1, press: "Approvals cleared within a day, 128 of 150, 22 to go", hold: 1200, platforms: ["web", "desktop"], props: { ...goals } },
        { step: 2, press: "Approvals cleared within a day, 128 of 150, 22 to go", hold: 1200, platforms: ["mobile"], props: { ...goals } },
        { step: 5, hold: 2800, platforms: ["web", "desktop"], props: { ...goals, selected: "Approvals cleared within a day" } },
        { step: 6, hold: 2800, platforms: ["mobile"], props: { ...goals, selected: "Approvals cleared within a day" } },
      ],
    },
  ],
};

export default docs;
