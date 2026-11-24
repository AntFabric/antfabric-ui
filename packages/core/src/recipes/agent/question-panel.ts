import { defineRecipe } from "../../recipe";

/**
 * QuestionPanel. The one panel every question an agent asks is answered in, docked above the composer: a card with a title,
 * an optional tool chip, what will happen (or the tool call's arguments), then answer rows or a typed field, and a footer
 * that says the agent is paused, beside Submit. Folded (`expanded` false) the root is the bar, with `barLabel` and nothing else.
 * A row's `on` is chosen; the number key beside it (`key`) is the web's and desktop's keyboard hint, which the phone does
 * not draw. The status line's `on` is offline. The type-to-confirm block hangs off the row it guards by a hairline elbow.
 */
export const questionPanel = defineRecipe({
  parts: [
    "root",
    "barLabel",
    "header",
    "title",
    "tool",
    "details",
    "args",
    "argName",
    "argValue",
    "rows",
    "row",
    "rowLabel",
    "rowDetail",
    "key",
    "field",
    "confirm",
    "elbow",
    "confirmCaption",
    "confirmField",
    "hint",
    "footer",
    "status",
  ],
  /** The touch target the phone grows to and the size it draws (`hitSlop`), and the ring a scroll area shows on focus: layout the kit reads. */
  reads: ["$color.border.focus"],
  styles: {
    root: {
      base: {
        maxWidth: "$questionPanel.maxWidth",
        gap: "$space.md",
        padding: "$space.lg",
        bg: "$color.background.card",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.subtle",
        radius: "$radius.card",
        shadow: "$elevation.shadow.raise",
        font: "$font.family.sans",
      },
      // Folded: the same card as a bar, its caret close to the right edge.
      variants: { expanded: { false: { gap: "$space.sm", padding: "none", paddingY: "$space.smMd", paddingRight: "$space.smMd", paddingLeft: "$space.lg" } } },
    },
    barLabel: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    header: { base: { gap: "$space.2xs" } },
    title: { base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    // The tool's own name, printed as it is (`send_mail`), in the mono face.
    tool: {
      base: { paddingX: "$space.xs", paddingY: "$space.3xs", radius: "$radius.tag", bg: "$color.background.muted", font: "$font.family.mono", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.body", weight: "$font.weight.normal" },
    },
    details: { base: { maxHeight: "$questionPanel.detailsMaxHeight", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.body", weight: "$font.weight.normal" } },
    // Its two gaps (between names and values, between rows) are the kits' layout, over `space`.
    args: { base: { maxHeight: "$questionPanel.argsMaxHeight" } },
    argName: { base: { minWidth: "$questionPanel.argKeyMinWidth", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted", weight: "$font.weight.normal" } },
    argValue: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.body", weight: "$font.weight.normal" } },
    rows: { base: { gap: "$space.xs" } },
    row: {
      base: {
        gap: "$space.md",
        paddingX: "$space.md",
        paddingY: "$space.sm",
        radius: "$radius.control",
        bg: "$color.background.muted",
        borderWidth: "$border.width.hairline",
        borderColor: "transparent",
      },
      states: {
        on: { bg: "$color.background.brand.soft", borderColor: "$color.border.brand" },
        focus: { shadow: "$elevation.shadow.focus" },
      },
      platforms: { mobile: { base: { minHeight: "$size.control.md" } } },
    },
    rowLabel: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.medium", fg: "$color.text.strong" } },
    rowDetail: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted", weight: "$font.weight.normal" } },
    key: {
      on: ["web", "desktop"],
      base: {
        minWidth: "$questionPanel.keySize",
        height: "$questionPanel.keySize",
        paddingX: "$space.2xs",
        radius: "$radius.tag",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.default",
        size: "$font.size.caption",
        weight: "$font.weight.medium",
        fg: "$color.text.muted",
      },
      states: { on: { borderColor: "$color.border.brand", fg: "$color.text.onBrandSoft" } },
    },
    field: {
      base: {
        height: "$size.control.md",
        paddingX: "$space.md",
        radius: "$radius.input",
        bg: "$color.background.card",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.muted",
        size: "$font.size.bodySm",
        fg: "$color.text.strong",
        placeholder: "$color.text.faint",
        weight: "$font.weight.normal",
      },
      states: { focus: { shadow: "$elevation.shadow.focus" }, disabled: { bg: "$color.background.muted" } },
      platforms: { mobile: { base: { height: "$size.control.input", size: "$font.size.body" } } },
    },
    confirm: { base: { gap: "$space.sm", paddingLeft: "$questionPanel.confirmInset" } },
    elbow: {
      base: {
        width: "$questionPanel.elbowWidth",
        height: "$questionPanel.elbowHeight",
        borderLeftWidth: "$border.width.hairline",
        borderLeftColor: "$color.border.brand",
        borderBottomWidth: "$border.width.hairline",
        borderBottomColor: "$color.border.brand",
        radiusBottomLeft: "$questionPanel.elbowRadius",
      },
    },
    confirmCaption: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted", weight: "$font.weight.normal" } },
    // The name is typed exactly, so it is set in the face the chip shows it in.
    confirmField: {
      base: {
        height: "$size.control.sm",
        paddingX: "$space.smMd",
        radius: "$radius.input",
        bg: "$color.background.card",
        borderWidth: "$border.width.hairline",
        borderColor: "$color.border.muted",
        font: "$font.family.mono",
        size: "$font.size.caption",
        fg: "$color.text.strong",
        placeholder: "$color.text.faint",
        weight: "$font.weight.normal",
      },
      states: { focus: { shadow: "$elevation.shadow.focus" }, disabled: { bg: "$color.background.muted" } },
      platforms: { mobile: { base: { height: "$size.control.md", size: "$font.size.bodySm" } } },
    },
    hint: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.subtle", weight: "$font.weight.normal" } },
    footer: { base: { gap: "$space.sm" } },
    status: {
      base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint", weight: "$font.weight.normal" },
      states: { on: { fg: "$color.text.muted" } },
    },
  },
});
