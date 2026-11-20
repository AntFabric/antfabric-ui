import { useEffect, useRef, type ReactNode } from "react";
import { AccessibilityInfo, findNodeHandle, Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type Approval, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { announce } from "../../lib/a11y";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Button } from "../actions/button";
import { Tag } from "../display/tag";

/** `expired` is a request nobody decided in time; `failed` is a decision that could not be committed (a retry is offered). */
export type ApprovalItemStatus = NonNullable<Approval["status"]> | "expired" | "failed";

export interface ApprovalItemProps extends Omit<Approval, "key" | "status">, RootProps {
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
  /** A decision is on its way: the actions lock and Approve spins, and they report themselves busy. */
  deciding?: boolean;
  /** The context is shown in full instead of clamped to two lines. A button under a long context flips it. */
  expanded?: boolean;
  /** Called with `expanded` as the tap on Show more / Show less leaves it. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Retry was tapped on a failed decision: the app commits it again. */
  onRetry?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onAnswer?: () => void;
  /** This item's built-in text (the outcome words, "Needs you", Approve, Reject and Answer) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["approval-item"]>;
  /** Per-part styles over the theme: `{ root: {…}, subject: {…} }`. */
  styles?: PartStyles<"approval-item">;
  style?: ViewStyle;
}

const useStyles = createStyles((t) => ({
  root: { alignSelf: "stretch" },
  head: { flexDirection: "row", alignItems: "center" },
  spacer: { flex: 1 },
  meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline" },
  actions: { flexDirection: "row" },
  action: { flex: 1 },
  more: { alignSelf: "flex-start", justifyContent: "center", minHeight: t.control.hit },
  moreText: { textDecorationLine: "underline" },
}));

/** About two lines of context at the card's width: past it, the context may be hiding something and offers Show more. */
const LONG_CONTEXT = 120;

/**
 * One stop for a screen reader named "Approve: Send renewal proposal", so a list of buttons says which is which (the name starts with the
 * visible word). The button inside is hidden from the reader and still takes a touch; the stop runs the same press by its own action.
 */
function Named({ name, onPress, disabled = false, busy = false, style, children }: { name: string; onPress: () => void; disabled?: boolean; busy?: boolean; style: ViewStyle; children: ReactNode }) {
  return (
    <View
      accessible
      // On the web a role of button draws a <button>, which cannot hold the Button inside.
      accessibilityRole={Platform.OS === "web" ? undefined : "button"}
      accessibilityLabel={name}
      accessibilityState={{ disabled, busy }}
      accessibilityActions={[{ name: "activate" }]}
      onAccessibilityAction={() => !disabled && onPress()}
      style={style}
    >
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {children}
      </View>
    </View>
  );
}

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
  testID,
  ...rest
}: ApprovalItemProps) {
  const s = useStyles();
  const str = useStrings("approval-item", strings);
  const r = useRecipe(recipes["approval-item"], { styles });
  const [more, setMore] = useControllable(expanded, onExpandedChange);
  const open = status === "pending" || status === "question";
  const decided = status === "approved" || status === "rejected";
  const closed = decided || status === "expired" || status === "failed";
  const outcomeLabel = status === "approved" ? str("approved") : status === "rejected" ? str("rejected") : status === "expired" ? str("expired") : str("failed");
  const outcomeText = `${decided && decidedBy ? str("decidedBy", { outcome: outcomeLabel, name: decidedBy }) : outcomeLabel}${decided && verify ? str("verified") : ""}`;
  // Deciding takes the buttons away: the outcome is said (iOS has no live regions) and the screen reader's focus goes to it.
  const outcome = useRef<Text>(null);
  const was = useRef(status);
  useEffect(() => {
    if (was.current !== status && closed) {
      announce(str("announced", { subject, outcome: outcomeText }));
      const node = Platform.OS !== "web" && outcome.current ? findNodeHandle(outcome.current) : null;
      if (node) AccessibilityInfo.setAccessibilityFocus?.(node);
    }
    was.current = status;
    // Said when the status changes, not as its words are retyped.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  return (
    <View {...rootProps(rest)} testID={partId(testID, "approval-item", "root")} accessibilityState={{ busy: deciding }} style={[s.root, r.root.view, style]}>
      <View testID="approval-item.head" style={[s.head, r.head.view]}>
        {source ? <Tag label={source} size="sm" tone={agent ? "brand" : "neutral"} /> : null}
        {reference ? (
          <Text testID="approval-item.reference" style={[r.reference.view, r.reference.text]}>
            {reference}
          </Text>
        ) : null}
        {status === "question" ? <Tag label={str("question")} size="sm" tone="warning" /> : null}
        {closed ? <Tag label={outcomeLabel} size="sm" tone={status === "approved" ? "success" : status === "expired" ? "neutral" : "danger"} /> : null}
        <View style={s.spacer} />
        {time ? (
          <Text testID="approval-item.time" numberOfLines={1} style={[r.time.view, r.time.text]}>
            {time}
          </Text>
        ) : null}
        {open ? <View testID="approval-item.dot" accessible accessibilityRole="image" accessibilityLabel={str("needsYou")} style={r.dot.view} /> : null}
      </View>
      <Text testID="approval-item.subject" style={[r.subject.view, r.subject.text]}>
        {subject}
      </Text>
      {context ? (
        <Text testID="approval-item.context" numberOfLines={more ? undefined : 2} maxFontSizeMultiplier={fontScale.content} style={[r.context.view, r.context.text]}>
          {context}
        </Text>
      ) : null}
      {context.length > LONG_CONTEXT ? (
        <Pressable testID="approval-item.more" accessibilityRole="button" accessibilityState={{ expanded: more }} onPress={() => setMore(!more)} style={[s.more, r.more.view]}>
          <Text maxFontSizeMultiplier={fontScale.control} style={[r.more.text, s.moreText]}>
            {more ? str("showLess") : str("showMore")}
          </Text>
        </Pressable>
      ) : null}
      {amount || requestedBy ? (
        <View testID="approval-item.meta" style={[s.meta, r.meta.view]}>
          {amount ? (
            <Text testID="approval-item.amount" style={[r.amount.view, r.amount.text]}>
              {amount}
            </Text>
          ) : null}
          {requestedBy ? (
            <Text testID="approval-item.from" style={[r.from.view, r.from.text]}>
              {str.parts("from", { name: requestedBy })}
            </Text>
          ) : null}
        </View>
      ) : null}
      {status === "pending" && verify ? (
        <Text testID="approval-item.note" style={[r.note.view, r.note.text]}>
          {str("verifyNote")}
        </Text>
      ) : null}
      {open ? (
        <View testID="approval-item.actions" style={[s.actions, r.actions.view]}>
          {status === "question" ? (
            <Named name={str("answerSubject", { subject })} onPress={() => onAnswer?.()} style={s.action}>
              <Button label={str("answer")} variant="primary" size="md" full onPress={() => onAnswer?.()} />
            </Named>
          ) : (
            <>
              {/* Rejecting is a peer of approving, not a quiet link. */}
              <Named name={str("rejectSubject", { subject })} disabled={deciding} onPress={() => onReject?.()} style={s.action}>
                <Button label={str("reject")} variant="secondary" size="md" disabled={deciding} onPress={() => onReject?.()} />
              </Named>
              <Named name={str("approveSubject", { subject })} busy={deciding} disabled={deciding} onPress={() => onApprove?.()} style={s.action}>
                <Button label={str("approve")} variant="primary" size="md" iconLeading={verify ? "fingerprint" : undefined} loading={deciding} onPress={() => onApprove?.()} />
              </Named>
            </>
          )}
        </View>
      ) : null}
      {status === "failed" ? (
        <View testID="approval-item.actions" style={[s.actions, r.actions.view]}>
          <Named name={str("retrySubject", { subject })} onPress={() => onRetry?.()} style={s.action}>
            <Button label={str("retry")} variant="secondary" size="md" iconLeading="rotate-ccw" onPress={() => onRetry?.()} />
          </Named>
        </View>
      ) : null}
      {closed ? (
        <Text ref={outcome} testID="approval-item.outcome" maxFontSizeMultiplier={fontScale.content} style={[r.outcome.view, r.outcome.text]}>
          {outcomeText}
        </Text>
      ) : null}
    </View>
  );
}
