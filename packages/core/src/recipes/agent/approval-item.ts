import { defineRecipe } from "../../recipe";

/**
 * ApprovalItem. One decision routed to a person, from an agent, a plugin or an external ticket: where it came from and its reference, when,
 * what is asked (subject, context, the amount at stake), who asked, then Reject and Approve, or Answer for an agent's question.
 * A pending one carries the coral dot (coral means it needs you); a decided one says who decided, when, and whether it was
 * verified, in place of the actions. A white card on both; the phone's actions share the row equally.
 */
export const approvalItem = defineRecipe({
  parts: ["root", "head", "reference", "time", "dot", "subject", "context", "meta", "amount", "from", "note", "actions", "outcome", "more"],
  /** The phone's 44pt touch target for Show more: layout the kit reads. */
  reads: ["$size.target.min"],
  styles: {
    root: { base: { gap: "$space.sm", padding: "$space.md", radius: "$radius.card", bg: "$color.background.card", borderWidth: "$border.width.hairline", borderColor: "$color.border.subtle", font: "$font.family.sans" } },
    head: { base: { gap: "$space.xs" } },
    reference: { base: { font: "$font.family.mono", size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted", weight: "$font.weight.normal" } },
    time: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.faint", weight: "$font.weight.normal" } },
    dot: { base: { square: "$size.dot.default", radius: "$radius.circle", bg: "$color.background.brand.default" } },
    subject: { base: { size: "$font.size.body", line: "$font.lineHeight.body", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    context: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", fg: "$color.text.muted", weight: "$font.weight.normal" } },
    meta: { base: { gap: "$space.xs" } },
    amount: { base: { size: "$font.size.bodySm", line: "$font.lineHeight.bodySm", weight: "$font.weight.semibold", fg: "$color.text.strong" } },
    from: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.subtle", weight: "$font.weight.normal" } },
    note: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted", weight: "$font.weight.normal" } },
    actions: { base: { gap: "$space.sm", paddingTop: "$space.2xs" } },
    more: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted", weight: "$font.weight.normal" } },
    outcome: { base: { size: "$font.size.caption", line: "$font.lineHeight.caption", fg: "$color.text.muted", weight: "$font.weight.normal" } },
  },
});
