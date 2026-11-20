import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "divider",
  name: "Divider",
  category: "display",
  level: "atom",
  status: "draft",
  description: "A hairline rule that separates content, horizontal or vertical, with an optional centred label. It is not a section heading, and it is not the day line in a message timeline (that is MessageDivider).",
  props: {
    orientation: { type: "enum", options: ["horizontal", "vertical"], default: "horizontal", description: "horizontal runs across its container. vertical takes the height of its row, at least an icon tall; it draws no label." },
    label: { type: "string", default: "", description: "Words centred on a horizontal rule, such as \"Today\". Empty draws the rule alone." },
    inset: { type: "enum", options: ["none", "sm", "md"], default: "none", description: "Space left around the rule so it stops short of its neighbours. none runs edge to edge." },
  },
  platforms: {
    web: { status: "ready", base: "A <div role=separator> with its rule and label drawn from the recipe", import: 'import { Divider } from "@antfabric-ui/react"' },
    desktop: { status: "ready", base: "The same <div> at desktop density", import: 'import { Divider } from "@antfabric-ui/react"' },
    mobile: { status: "ready", base: "A View with a rule View and a Text drawn from the same recipe", import: 'import { Divider } from "@antfabric-ui/react-native"' },
  },
  a11y: { role: "separator", label: "{label}", notes: ["A vertical divider sets aria-orientation. A labelled one is named by its label."] },
  examples: [
    { name: "Plain", props: {}, width: 320 },
    { name: "Day label", props: { label: "Today" }, width: 320 },
    { name: "Inset", props: { label: "Earlier in #platform-eng", inset: "md" }, width: 320 },
    { name: "Vertical", props: { orientation: "vertical" } },
  ],
  matrix: [{ prop: "inset", width: 200 }],
  edgeCases: [
    {
      title: "A long label",
      platforms: ["web", "desktop", "mobile"],
      handling: "The label wraps onto more lines, centred, and each rule keeps at least space.xl, so the break still reads as a rule.",
      example: { name: "Long label", props: { label: "Fabric summarised 148 unread messages from #design-crit" }, width: 240 },
    },
  ],
  related: ["message-divider", "list-item"],
};

export default docs;
