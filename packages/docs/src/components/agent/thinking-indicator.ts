import type { ComponentDocs } from "../../types";

/** AntFabric's rotating words: the catalogue's `words` sample. */
const MOODS = ["Thinking", "Reasoning", "Working it out", "Joining the dots", "Piecing it together", "Mulling it over", "Making sense of it"];

const steps = [
  { key: "c1", label: "Recent messages", source: "Channels & messages", state: "done" },
  { key: "c2", label: "Search people", source: "Directory", state: "done" },
  { key: "c3", label: "Draft email", state: "running" },
];

const docs: ComponentDocs = {
  id: "thinking-indicator",
  name: "Thinking indicator",
  category: "agent",
  level: "molecule",
  status: "draft",
  description:
    "An agent's turn in flight, where its answer will appear: a coral lattice rippling in the avatar's column, a word that changes every few seconds, how long it has been, and once it runs a tool, the steps folded underneath. It goes the moment the agent writes or asks.",
  props: {
    steps: { type: "array", default: [], description: "Every tool call this turn, oldest first, as AgentSteps draws them. Empty while the agent is only thinking: no caret, no fold." },
    agentName: { type: "string", default: "", sample: "Fabric", description: "The agent's display name, for what a screen reader hears (\"Fabric is running Draft email\"). Empty names none: \"Thinking\", \"Running Draft email\"." },
    words: { type: "array", default: [], sample: MOODS, description: "The word beside the lattice, rotating through these every few seconds. Empty shows the strings' word (\"Thinking\") and keeps it still." },
    since: { type: "number", default: 0, description: "When this stretch began (epoch ms), from the app's state, so leaving the screen and coming back does not restart the clock. 0 counts from when it mounts." },
    expanded: { type: "boolean", default: true, description: "The steps are unfolded. The caret folds them; only drawn once there is a step." },
    onExpandedChange: { type: "event", args: "expanded: boolean", changes: "expanded" },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=status row drawn from its recipe: the lattice on the kit's af-lattice (648 ms, each ring 135 ms later), the word clipped to an af-shimmer gradient, a clock painted every 100 ms without re-rendering; the fold is a grid-rows transition",
      import: 'import { ThinkingIndicator } from "@antfabric/ui-react"',
    },
    desktop: {
      status: "ready",
      base: "The same row, where Fabric's next message will start",
      import: 'import { ThinkingIndicator } from "@antfabric/ui-react"',
      notes: [
        "Today's desktop gives each lit cell a soft coral glow; this kit leaves it out, as no shadow token says it yet.",
        "It shows while a turn is in flight and nothing is written yet, comes back when Fabric goes to a tool after writing, and goes when Fabric asks a question (assistant-core's showsThinking).",
      ],
    },
    mobile: {
      status: "partial",
      base: "Views on Animated's native driver: each cell's ripple, the word breathing between 45% and full, the clock re-rendered every 100 ms; the steps unfold without an animation",
      import: 'import { ThinkingIndicator } from "@antfabric/ui-react-native"',
      notes: [
        "Today's phone sweeps a gradient band across the word through an SVG mask (react-native-svg and Reanimated). This kit breathes the word instead, as it uses neither; the owner may want the sweep.",
        "Today's phone restarts the clock when the screen remounts; since keeps it running.",
        "The phone's word is 14pt against the desktop's 13, its mark column 30pt against 32, and it shows three steps, not five.",
      ],
    },
  },
  a11y: {
    notes: [
      "What the agent is doing now (\"Fabric is running Draft email via …\") is announced through the page's live region as it changes, not the rotating word, which is hidden with the mark and the clock.",
      "Once there are steps, the head is a button named from its word and what it does (\"Thinking… Show steps\") with aria-expanded.",
      "Reduced motion follows the setting live (on the web after mount, so server and first client render agree; on the phone as it changes): the lattice holds at 60%, the word stops changing and shimmering. The phone's clock ticks in a child of its own, so the indicator does not re-render ten times a second.",
    ],
  },
  examples: [
    { name: "Only thinking", props: {}, width: 420 },
    { name: "Running a tool", props: { steps }, width: 420 },
    { name: "Steps folded", props: { steps, expanded: false }, width: 420 },
    {
      name: "A tool failed",
      props: {
        steps: [
          { key: "c1", label: "Create Jira issue", source: "Jira", state: "failed" },
          { key: "c2", label: "Create Jira issue", source: "Jira", state: "running" },
        ],
      },
      width: 420,
    },
  ],
  edgeCases: [
    {
      title: "A long turn",
      platforms: ["web", "desktop", "mobile"],
      handling: "The clock reads seconds to a tenth under a minute, then minutes and seconds (1m 05s). Past five steps (three on the phone) the oldest are counted as \"+N earlier\".",
    },
    {
      title: "Switching screens mid-turn",
      platforms: ["desktop", "mobile"],
      handling: "Pass since from the app's state: the clock carries on from when the turn began instead of starting again at 0.0s.",
    },
    {
      title: "Fabric writes, then runs a tool",
      platforms: ["web", "desktop", "mobile"],
      handling: "The app hides the indicator at the first word and shows it again under the text when a tool starts. The panel's question turns it off: Fabric is waiting, not working.",
    },
  ],
  related: ["agent-steps", "question-panel", "typing-indicator"],
  flows: [
    {
      id: "turn-in-flight",
      title: "A turn in flight",
      description: "The person asks; Fabric thinks, runs two tools and starts to answer.",
      platforms: ["web", "desktop", "mobile"],
      width: 420,
      steps: [
        { kind: "trigger", title: "Sends a question" },
        {
          kind: "state",
          title: "The turn is in flight with nothing written",
          code: "showsThinking(status, last)",
        },
        { kind: "result", title: "The lattice ripples and the clock runs" },
        { kind: "data", title: "Fabric starts a tool", code: "steps = [...steps, step]", lane: "system" },
        { kind: "result", title: "The head becomes a button; the step shows under it" },
        { kind: "data", title: "The first word arrives", lane: "system" },
        { kind: "result", title: "The indicator goes; the answer starts in its place" },
      ],
      replay: [
        { step: 2, props: {}, hold: 1800 },
        { step: 3, props: { steps: steps.slice(2) }, hold: 1600 },
        { step: 4, props: { steps }, hold: 1800 },
      ],
    },
    {
      id: "fold-steps",
      title: "Fold the steps away",
      platforms: ["web", "desktop", "mobile"],
      width: 420,
      steps: [
        { kind: "trigger", title: "Presses the head" },
        { kind: "event", title: "Folded", code: "onExpandedChange(false)" },
        { kind: "motion", title: "The steps fold up", detail: "350 ms on web and desktop; at once on the phone." },
      ],
      replay: [
        { step: 0, props: { steps }, press: 0, hold: 900 },
        { step: 2, props: { steps, expanded: false }, hold: 1400 },
      ],
    },
  ],
};

export default docs;
