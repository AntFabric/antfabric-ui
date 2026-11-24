import { defineRecipe } from "../../recipe";

/**
 * Breadcrumbs (web and desktop; the phone has the mobile header). Written from the React kit's table. A `crumb` is a link or a button drawn like one: the kit passes `hover`
 * and `focus` from its own interaction. The trail's last crumb is `current`, a step with no page of its own is a `step`, and the `separator` is the backslash between them.
 * On desktop macOS the bar can draw the traffic lights (`lights`) and, for a meeting, a status pill (`pill`, with its `pillDot`, `pillWord` and `pillTime`); the pill's fill and
 * dot follow `status` (`live`, `paused`, `busy`). The crumb's side margin (`-space.xs`, pulling the hover wash outward) and its 3px block padding are the kit's: no token or key says them, and the
 * light's half-pixel edge is a literal. The three light fills are read by position, not named by a prop.
 * Vocabulary gap: the traffic lights' fills (`os.macClose`, `os.macMin`, `os.macMax`) are chosen by position in the group, which no variant prop names, so the kit reads them.
 */
export const breadcrumbs = defineRecipe({
  parts: ["root", "lights", "light", "separator", "crumb", "icon", "label", "step", "current", "pill", "pillDot", "pillWord", "pillTime"],
  styles: {
    root: {
      base: { gap: "$space.md", height: "$size.layout.breadcrumbs", paddingX: "$space.lg", bg: "$color.background.chrome", borderBottomWidth: "$border.width.hairline", borderBottomColor: "$color.border.subtle", font: "$font.family.sans" },
    },
    lights: { on: ["desktop"], base: { gap: "$space.sm", width: "$osWindow.macLightsInset" } },
    light: { on: ["desktop"], base: { square: "$osWindow.macLight", radius: "$radius.circle", borderColor: "$os.macLightEdge" } },
    separator: { base: { size: "$font.size.bodySm", fg: "$color.text.faint" } },
    crumb: {
      base: { paddingX: "$space.xs", radius: "$radius.control", size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal", fg: "$color.text.muted" },
      states: { hover: { bg: "$color.background.hover", fg: "$color.text.body" }, focus: { shadow: "$elevation.shadow.focus" } },
    },
    icon: { base: { square: "$size.icon.sm" } },
    label: { base: { maxWidth: "$breadcrumbs.crumbMaxWidth" } },
    step: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.normal", fg: "$color.text.muted" } },
    current: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    pill: {
      on: ["desktop"],
      base: { gap: "$breadcrumbs.recordingGap", height: "$size.control.xs", paddingX: "$space.smMd", radius: "$radius.pill", size: "$font.size.caption" },
      variants: { status: { live: { bg: "$color.background.danger.soft" }, paused: { bg: "$color.background.warning.soft" }, busy: { bg: "$color.background.danger.soft" } } },
      states: { focus: { shadow: "$elevation.shadow.focus" } },
    },
    pillDot: {
      on: ["desktop"],
      base: { square: "$breadcrumbs.recordingDotSize", radius: "$radius.circle" },
      variants: { status: { live: { bg: "$color.text.danger" }, paused: { bg: "$color.text.warning" }, busy: { bg: "$color.text.muted" } } },
    },
    pillWord: { on: ["desktop"], base: { weight: "$font.weight.medium", fg: "$color.text.body" } },
    pillTime: { on: ["desktop"], base: { weight: "$font.weight.semibold", fg: "$color.text.strong" } },
  },
  reads: ["$os.macClose", "$os.macMin", "$os.macMax"],
});
