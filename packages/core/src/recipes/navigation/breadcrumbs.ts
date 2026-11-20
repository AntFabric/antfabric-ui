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
      base: { gap: "$space.md", height: "$breadcrumb.h", paddingX: "$space.lg", bg: "$surface.chrome", borderBottomWidth: "$border.wHairline", borderBottomColor: "$border.subtle", font: "$font.sans" },
    },
    lights: { on: ["desktop"], base: { gap: "$space.sm", width: "$osWindow.macLightsInset" } },
    light: { on: ["desktop"], base: { square: "$osWindow.macLight", radius: "$radius.circle", borderColor: "$os.macLightEdge" } },
    separator: { base: { size: "$text.bodySm", fg: "$fg.faint" } },
    crumb: {
      base: { paddingX: "$space.xs", radius: "$radius.control", size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal", fg: "$fg.muted" },
      states: { hover: { bg: "$hover.surface", fg: "$fg.body" }, focus: { shadow: "$shadow.focus" } },
    },
    icon: { base: { square: "$icon.sizeSm" } },
    label: { base: { maxWidth: "$breadcrumbs.crumbMaxW" } },
    step: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightNormal", fg: "$fg.muted" } },
    current: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    pill: {
      on: ["desktop"],
      base: { gap: "$breadcrumbs.recordingGap", height: "$control.hXs", paddingX: "$space.smMd", radius: "$radius.pill", size: "$text.caption" },
      variants: { status: { live: { bg: "$danger.soft" }, paused: { bg: "$warning.soft" }, busy: { bg: "$danger.soft" } } },
      states: { focus: { shadow: "$shadow.focus" } },
    },
    pillDot: {
      on: ["desktop"],
      base: { square: "$breadcrumbs.recordingDot", radius: "$radius.circle" },
      variants: { status: { live: { bg: "$danger.default" }, paused: { bg: "$warning.default" }, busy: { bg: "$fg.muted" } } },
    },
    pillWord: { on: ["desktop"], base: { weight: "$font.weightMedium", fg: "$fg.body" } },
    pillTime: { on: ["desktop"], base: { weight: "$font.weightSemibold", fg: "$fg.strong" } },
  },
  reads: ["$os.macClose", "$os.macMin", "$os.macMax"],
});
