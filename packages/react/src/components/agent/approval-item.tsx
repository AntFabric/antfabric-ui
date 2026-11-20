import { useEffect, useId, useRef, type CSSProperties, type MutableRefObject, type ReactNode } from "react";
import { recipes, useControllable, useStrings, type Approval, type KitStrings } from "@antfabric/ui-core";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, pressable, row, text, truncate } from "../../lib/style";
import { announce } from "../../lib/announce";
import { useFocusHandoff } from "../../lib/focus";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";
import { Tag } from "../display/tag";

/** `expired` is a request nobody decided in time; `failed` is a decision that could not be committed (a retry is offered). */
export type ApprovalItemStatus = NonNullable<Approval["status"]> | "expired" | "failed";

export interface ApprovalItemProps extends Omit<Approval, "key" | "status">, Omit<RootProps<HTMLElement>, "ref"> {
  ref?: RootProps<HTMLElement>["ref"];
  /** The tag's words: "Agent", "Purchase orders", "Jira". Empty draws no tag. */
  source?: string;
  /** An agent proposed it: the tag takes the brand tone. */
  agent?: boolean;
  /** The source's own id, drawn beside the tag: "PO-4821", "PROJ-217". */
  reference?: string;
  /** What is being asked, in a line. */
  subject: string;
  /** Why it is asked: what the agent drafted, what the ticket says. */
  context?: string;
  /** The amount at stake, written as the source writes it. */
  amount?: string;
  /** Who asked: the agent's or the person's name. */
  requestedBy?: string;
  /** When it was asked, already formatted. */
  time?: string;
  /** pending: waiting on this person. question: an agent asked something instead. approved and rejected: decided. expired: nobody decided in time. failed: the decision could not be committed: Retry. */
  status?: ApprovalItemStatus;
  /** Who decided, when it is decided. */
  decidedBy?: string;
  /** Pending: deciding asks the person to confirm it is them. Decided: the decision was confirmed that way. */
  verify?: boolean;
  /** A decision is on its way: the actions lock and Approve spins. The card is `aria-busy`. */
  deciding?: boolean;
  /** The context is shown in full instead of clamped to two lines. A button under a long context flips it. */
  expanded?: boolean;
  /** Called with `expanded` as the press on Show more / Show less leaves it. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Retry was pressed on a failed decision: the app commits it again. */
  onRetry?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onAnswer?: () => void;
  /** This item's built-in text (the outcome words, "Needs you", Approve, Reject and Answer) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["approval-item"]>;
  /** Per-part styles over the theme: `{ root: {…}, subject: {…} }`. */
  styles?: PartStyles<"approval-item">;
  style?: CSSProperties;
}

/**
 * Names the button inside it "Approve: Send renewal proposal", so a list of buttons says which one is which: the name starts with the
 * visible word, as WCAG 2.5.3 asks. Button names itself from its label, so the longer name is set on the button it draws.
 */
function Named({ name, children }: { name: string; children: ReactNode }) {
  const holder = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    holder.current?.querySelector("button")?.setAttribute("aria-label", name);
  });
  return (
    <span ref={holder} style={{ display: "contents" }}>
      {children}
    </span>
  );
}

/** About two lines of context at the card's width: past it, the context may be hiding something and offers Show more. */
const LONG_CONTEXT = 120;

export function ApprovalItem({
  source = "",
  agent = false,
  reference = "",
  subject,
  context = "",
  amount = "",
  requestedBy = "",
  time = "",
  status = "pending",
  decidedBy = "",
  verify = false,
  deciding = false,
  expanded = false,
  onExpandedChange,
  onRetry,
  onApprove,
  onReject,
  onAnswer,
  strings,
  styles,
  style,
  ref: rootRef,
  ...rest
}: ApprovalItemProps) {
  const s = useStrings("approval-item", strings);
  const r = useRecipe(recipes["approval-item"], { styles });
  const [more, setMore] = useControllable(expanded, onExpandedChange);
  const contextId = useId();
  const open = status === "pending" || status === "question";
  const decided = status === "approved" || status === "rejected";
  const closed = decided || status === "expired" || status === "failed";
  const outcomeLabel = status === "approved" ? s("approved") : status === "rejected" ? s("rejected") : status === "expired" ? s("expired") : s("failed");
  const outcomeText = `${decided && decidedBy ? s("decidedBy", { outcome: outcomeLabel, name: decidedBy }) : outcomeLabel}${decided && verify ? s("verified") : ""}`;
  // Deciding unmounts the button that was pressed: focus goes to the outcome, and the outcome is said, since nothing else changes for a reader.
  // Only for a decision made here: a card that arrives already decided does not take focus.
  const everOpen = useRef(open);
  if (open) everOpen.current = true;
  const outcome = useFocusHandoff<HTMLSpanElement>(closed && everOpen.current);
  const was = useRef(status);
  useEffect(() => {
    if (was.current !== status && closed) announce(s("announced", { subject, outcome: outcomeText }), status === "failed" ? "assertive" : "polite");
    was.current = status;
    // Said when the status changes, not as its words are retyped.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  const setRef = (el: HTMLElement | null) => {
    if (typeof rootRef === "function") rootRef(el);
    else if (rootRef) (rootRef as MutableRefObject<HTMLElement | null>).current = el;
  };
  return (
    <article ref={setRef} aria-label={subject} aria-busy={deciding || undefined} data-af-part="root" {...rootProps(rest)} style={css(box, { alignSelf: "stretch" }, r.root, style)}>
      <div data-af-part="head" style={css(row, r.head)}>
        {source && <Tag label={source} size="sm" tone={agent ? "brand" : "neutral"} />}
        {reference && (
          <span data-af-part="reference" style={css(text, r.reference)}>
            {reference}
          </span>
        )}
        {status === "question" && <Tag label={s("question")} size="sm" tone="warning" />}
        {closed && <Tag label={outcomeLabel} size="sm" tone={status === "approved" ? "success" : status === "expired" ? "neutral" : "danger"} />}
        <span style={{ flex: 1 }} />
        {time && (
          <span data-af-part="time" style={css(text, { whiteSpace: "nowrap" }, r.time)}>
            {time}
          </span>
        )}
        {open && <span aria-label={s("needsYou")} role="img" data-af-part="dot" style={css({ flex: "none" }, r.dot)} />}
      </div>
      <span data-af-part="subject" style={css(text, r.subject)}>
        {subject}
      </span>
      {context && (
        <span id={contextId} data-af-part="context" style={css(text, more ? {} : truncate(2), r.context)}>
          {context}
        </span>
      )}
      {context.length > LONG_CONTEXT && (
        <button type="button" data-af-part="more" aria-expanded={more} aria-controls={contextId} onClick={() => setMore(!more)} style={css(pressable, text, { alignSelf: "flex-start", textDecoration: "underline" }, r.more)}>
          {more ? s("showLess") : s("showMore")}
        </button>
      )}
      {(amount || requestedBy) && (
        <div data-af-part="meta" style={css(row, { flexWrap: "wrap" }, r.meta)}>
          {amount && (
            <span data-af-part="amount" style={css(text, r.amount)}>
              {amount}
            </span>
          )}
          {requestedBy && (
            <span data-af-part="from" style={css(text, r.from)}>
              {s.parts("from", { name: requestedBy })}
            </span>
          )}
        </div>
      )}
      {status === "pending" && verify && (
        <span data-af-part="note" style={css(text, r.note)}>
          {s("verifyNote")}
        </span>
      )}
      {open && (
        <div data-af-part="actions" style={css(row, { justifyContent: "flex-end" }, r.actions)}>
          {status === "question" ? (
            <Named name={s("answerSubject", { subject })}>
              <Button label={s("answer")} variant="primary" size="sm" onPress={() => onAnswer?.()} />
            </Named>
          ) : (
            <>
              <Named name={s("rejectSubject", { subject })}>
                <Button label={s("reject")} variant="secondary" size="sm" disabled={deciding} onPress={() => onReject?.()} />
              </Named>
              <Named name={s("approveSubject", { subject })}>
                <Button label={s("approve")} variant="primary" size="sm" iconLeading={verify ? "fingerprint" : undefined} loading={deciding} onPress={() => onApprove?.()} />
              </Named>
            </>
          )}
        </div>
      )}
      {status === "failed" && (
        <div data-af-part="actions" style={css(row, { justifyContent: "flex-end" }, r.actions)}>
          <Named name={s("retrySubject", { subject })}>
            <Button label={s("retry")} variant="secondary" size="sm" iconLeading="rotate-ccw" onPress={() => onRetry?.()} />
          </Named>
        </div>
      )}
      {closed && (
        <span ref={outcome} tabIndex={-1} data-af-part="outcome" style={css(text, { outline: "none" }, r.outcome)}>
          {outcomeText}
        </span>
      )}
    </article>
  );
}
