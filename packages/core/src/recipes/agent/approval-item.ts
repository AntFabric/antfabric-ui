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
  reads: ["$control.hit"],
  styles: {
    root: { base: { gap: "$space.sm", padding: "$space.md", radius: "$radius.card", bg: "$surface.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", font: "$font.sans" } },
    head: { base: { gap: "$space.xs" } },
    reference: { base: { font: "$font.mono", size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
    time: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.faint", weight: "$font.weightNormal" } },
    dot: { base: { square: "$dot.size", radius: "$radius.circle", bg: "$brand.default" } },
    subject: { base: { size: "$text.body", line: "$text.bodyLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    context: { base: { size: "$text.bodySm", line: "$text.bodySmLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
    meta: { base: { gap: "$space.xs" } },
    amount: { base: { size: "$text.bodySm", line: "$text.bodySmLine", weight: "$font.weightSemibold", fg: "$fg.strong" } },
    from: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.subtle", weight: "$font.weightNormal" } },
    note: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
    actions: { base: { gap: "$space.sm", paddingTop: "$space.2xs" } },
    more: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
    outcome: { base: { size: "$text.caption", line: "$text.captionLine", fg: "$fg.muted", weight: "$font.weightNormal" } },
  },
});
