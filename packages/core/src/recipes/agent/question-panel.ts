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
  reads: ["$focus.ring"],
  styles: {
    root: {
      base: {
        maxWidth: "$questionPanel.maxW",
        gap: "$space.md",
        padding: "$space.lg",
        bg: "$surface.card",
        borderWidth: "$border.wHairline",
        borderColor: "$border.subtle",
        radius: "$radius.card",
        shadow: "$shadow.raise",
        font: "$font.sans",
      },
      // Folded: the same card as a bar, its caret close to the right edge.
      variants: { expanded: { false: { gap: "$space.sm", padding: "none", paddingY: "$space.smMd", paddingRight: "$space.smMd", paddingLeft: "$space.lg" } } },
    },
    barLabel: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    header: { base: { gap: "$space.2xs" } },
    title: { base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    // The tool's own name, printed as it is (`send_mail`), in the mono face.
    tool: {
      base: { paddingX: "$space.xs", paddingY: "$space.3xs", radius: "$radius.tag", bg: "$surface.muted", font: "$font.mono", size: "$text.caption", line: "$text.captionLine", fg: "$fg.body", weight: "$font.weightNormal" },
    },
    details: { base: { maxHeight: "$questionPanel.detailsMaxH", size: "$text.caption", line: "$text.captionLine", fg: "$fg.body", weight: "$font.weightNormal" } },
    // Its two gaps (between names and values, between rows) are the kits' layout, over `space`.
    args: { base: { maxHeight: "$questionPanel.argsMaxH" } },
    argName: { base: { minWidth: "$questionPanel.argKeyMinW", size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
    argValue: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.body", weight: "$font.weightNormal" } },
    rows: { base: { gap: "$space.xs" } },
    row: {
      base: {
        gap: "$space.md",
        paddingX: "$space.md",
        paddingY: "$space.sm",
        radius: "$radius.control",
        bg: "$surface.muted",
        borderWidth: "$border.wHairline",
        borderColor: "transparent",
      },
      states: {
        on: { bg: "$brand.soft", borderColor: "$border.brand" },
        focus: { shadow: "$shadow.focus" },
      },
      platforms: { mobile: { base: { minHeight: "$control.hMd" } } },
    },
    rowLabel: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightMedium", fg: "$fg.strong" } },
    rowDetail: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
    key: {
      on: ["web", "desktop"],
      base: {
        minWidth: "$questionPanel.keySize",
        height: "$questionPanel.keySize",
        paddingX: "$space.2xs",
        radius: "$radius.tag",
        borderWidth: "$border.wHairline",
        borderColor: "$border.default",
        size: "$text.caption",
        weight: "$font.weightMedium",
        fg: "$fg.muted",
      },
      states: { on: { borderColor: "$border.brand", fg: "$fg.onBrandSoft" } },
    },
    field: {
      base: {
        height: "$control.hMd",
        paddingX: "$space.md",
        radius: "$radius.input",
        bg: "$surface.card",
        borderWidth: "$border.wHairline",
        borderColor: "$border.muted",
        size: "$text.bodySm",
        fg: "$fg.strong",
        placeholder: "$fg.faint",
        weight: "$font.weightNormal",
      },
      states: { focus: { shadow: "$shadow.focus" }, disabled: { bg: "$surface.muted" } },
      platforms: { mobile: { base: { height: "$control.hInput", size: "$text.body" } } },
    },
    confirm: { base: { gap: "$space.sm", paddingLeft: "$questionPanel.confirmInset" } },
    elbow: {
      base: {
        width: "$questionPanel.elbowW",
        height: "$questionPanel.elbowH",
        borderLeftWidth: "$border.wHairline",
        borderLeftColor: "$border.brand",
        borderBottomWidth: "$border.wHairline",
        borderBottomColor: "$border.brand",
        radiusBottomLeft: "$questionPanel.elbowRadius",
      },
    },
    confirmCaption: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
    // The name is typed exactly, so it is set in the face the chip shows it in.
    confirmField: {
      base: {
        height: "$control.hSm",
        paddingX: "$space.smMd",
        radius: "$radius.input",
        bg: "$surface.card",
        borderWidth: "$border.wHairline",
        borderColor: "$border.muted",
        font: "$font.mono",
        size: "$text.caption",
        fg: "$fg.strong",
        placeholder: "$fg.faint",
        weight: "$font.weightNormal",
      },
      states: { focus: { shadow: "$shadow.focus" }, disabled: { bg: "$surface.muted" } },
      platforms: { mobile: { base: { height: "$control.hMd", size: "$text.bodySm" } } },
    },
    hint: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.subtle", weight: "$font.weightNormal" } },
    footer: { base: { gap: "$space.sm" } },
    status: {
      base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint", weight: "$font.weightNormal" },
      states: { on: { fg: "$fg.muted" } },
    },
  },
});
