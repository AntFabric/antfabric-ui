import { useEffect, useRef, useState, type CSSProperties } from "react";
import { recipes, useControllable, useDirection, useStrings, type KitStrings } from "@antfabric-ui/core";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, neg, pressable, row, rtl, text, truncate } from "../../lib/style";
import { Button } from "../actions/button";
import { Avatar, type AvatarIdentity } from "../display/avatar";

export type NotificationItemLeading = "avatar" | "tile";
export type NotificationItemApproval = "pending" | "approving" | "approved" | "declined" | "expired";

export interface NotificationItemProps extends RootProps<HTMLDivElement> {
  /** "Who · #channel", or just "Who" for a DM. */
  title: string;
  /** Who did it — the face on the row. */
  sender?: string;
  /** The sender's photo. */
  avatarSrc?: string;
  /** The colour of the sender's initials when there is no `avatarSrc`. */
  identity?: AvatarIdentity;
  /** The server's bounded snippet. Two lines at most. */
  body?: string;
  /** "just now", "4m ago", "3h ago", "2d ago". */
  time?: string;
  read?: boolean;
  /** avatar: the sender's face with a small badge. tile: a 32px glyph squircle, for an event that has no sender. */
  leading?: NotificationItemLeading;
  /** The badge on the face, or the tile's glyph. Left out, the face has no badge. */
  icon?: IconName;
  /** The sender is an agent: its face, and no badge. */
  agent?: boolean;
  /** Words before the body: "Replied in a thread". */
  lead?: string;
  /** The row's own actions are showing. They also show while the pointer is on the row or focus is inside it. */
  revealed?: boolean;
  /** "" is not a request. pending shows Approve / Decline in the row. */
  approval?: "" | NotificationItemApproval;
  /** Set when the approval was answered on another device, e.g. "your phone". */
  decidedOn?: string;
  onOpen?: () => void;
  onMarkRead?: () => void;
  onClear?: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
  /** This row's built-in text (its accessible name, Approve and Decline, the outcome line, the row actions) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["notification-item"]>;
  /** Per-part styles over the theme: `{ root: {…}, title: {…} }`. */
  styles?: PartStyles<"notification-item">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; the colours, sizes and type are the recipe's (`notificationItem`). */
const hit: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  padding: `14px ${t.space.lg}`,
  textAlign: "left",
  width: "100%",
  transition: `background ${t.duration.fast}`,
};

const kindBadge: CSSProperties = { ...box, position: "absolute", right: neg(t.space["2xs"]), bottom: neg(t.space["2xs"]), alignItems: "center", justifyContent: "center" };

const tile: CSSProperties = { ...box, flexShrink: 0, alignSelf: "flex-start", marginTop: t.space["3xs"], alignItems: "center", justifyContent: "center" };

// Under the text column: past the padding, the face and the gap.
const indent: CSSProperties = { paddingLeft: `calc(${t.space.lg} + ${t.avatar.md} + ${t.space.md})`, paddingRight: t.space.lg, paddingBottom: t.space.mdLg };

const DECIDED: Record<"approved" | "declined" | "expired", string> = { approved: "circle-check", declined: "circle-x", expired: "clock" };

const hoverActions: CSSProperties = {
  ...row,
  position: "absolute",
  right: t.space.sm,
  top: "50%",
  transform: "translateY(-50%)",
  gap: t.space["2xs"],
  padding: t.space["3xs"],
  ...enter("fade"),
};

export function NotificationItem({
  title,
  sender = "",
  avatarSrc = "",
  identity = "indigo",
  body = "",
  time = "",
  read = false,
  leading = "avatar",
  icon = "",
  agent = false,
  lead = "",
  revealed = false,
  approval = "",
  decidedOn = "",
  onOpen,
  onMarkRead,
  onClear,
  onApprove,
  onDecline,
  strings,
  styles,
  style,
  ...rest
}: NotificationItemProps) {
  const s = useStrings("notification-item", strings);
  const ui = useInteraction();
  // What a press changes shows at once; the app's next props (from the server) take over when they come.
  const [isRead, setRead] = useControllable(read);
  const [open, setOpen] = useControllable(revealed);
  const [decision, setDecision] = useControllable(approval);
  const [pointer, setPointer] = useState(false);
  const [within, setWithin] = useState(false);
  const face = leading === "avatar";
  // Mounted only while wanted, so they are in the tab order only for the row being used.
  const actions = open || pointer || within || ui.hovered || ui.focused;
  const outcome = decision === "approved" || decision === "declined" || decision === "expired" ? decision : null;
  const where = decidedOn ? s("on", { device: decidedOn }) : "";
  const r = useRecipe(recipes["notification-item"], { variants: { read: isRead, approval: outcome }, state: { hover: ui.hovered }, styles });
  const dir = useDirection();
  // Approve and Decline go when the request is answered: the outcome is said through the page's announcer (a status that mounts holding
  // its text is not read), and focus, which was on the button that went, moves to the outcome line.
  const decidedRef = useRef<HTMLDivElement | null>(null);
  const was = useRef(outcome);
  useEffect(() => {
    if (was.current === outcome) return;
    const before = was.current;
    was.current = outcome;
    if (!outcome) return;
    announce(outcome === "approved" ? s("approved", { where }) : outcome === "declined" ? s("declined", { where }) : s("expired"));
    if (!before && (!document.activeElement || document.activeElement === document.body)) decidedRef.current?.focus({ preventScroll: true });
  }, [outcome]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      role="listitem"
      data-af-part="root"
      {...rootProps(rest)}
      onPointerEnter={() => setPointer(true)}
      onPointerLeave={() => setPointer(false)}
      onFocus={() => setWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setWithin(false);
      }}
      style={css(box, { overflow: "hidden" }, r.root, style)}
    >
      <button
        type="button"
        data-af-part="hit"
        data-af-press
        aria-label={[isRead ? "" : s("unread"), s("sentence", { text: title }), body ? s("sentence", { text: body }) : "", time].filter(Boolean).reduce((first, second) => s("followedBy", { first, second }))}
        onClick={() => {
          setRead(true);
          setOpen(!open);
          onOpen?.();
        }}
        {...ui.handlers}
        style={css(rtl(hit, dir), partStyle(r, "hit", ui.focused && { boxShadow: `inset 0 0 0 2px ${t.focus.ring}` }))}
      >
        {face ? (
          <div style={css(box, { flexShrink: 0, alignSelf: "flex-start", marginTop: t.space["3xs"] })}>
            <Avatar name={sender} src={avatarSrc} size="md" identity={agent ? "agent" : identity} agent={agent} />
            {!agent && icon && (
              <div aria-hidden data-af-part="kindBadge" style={css(rtl(kindBadge, dir), r.kindBadge)}>
                <Icon name={icon} size={10} style={{ strokeWidth: t.icon.strokeBold }} />
              </div>
            )}
          </div>
        ) : (
          <div aria-hidden data-af-part="tile" style={css(tile, r.tile)}>
            {icon && <Icon part="tileIcon" name={icon} size={r.tileIcon.width} style={r.tileIcon} />}
          </div>
        )}
        <div data-af-part="text" style={css(box, { flex: 1 }, r.text)}>
          <span data-af-part="title" style={css(text, truncate(1), r.title)}>
            {title}
          </span>
          {body ? (
            <span data-af-part="body" style={css(text, truncate(2), r.body)}>
              {lead && <span data-af-part="lead" style={r.lead}>{s("leadSuffix", { lead })}</span>}
              {body}
            </span>
          ) : null}
        </div>
        <div data-af-part="meta" style={css(box, { flexShrink: 0, alignSelf: "flex-start", alignItems: "flex-end", paddingTop: t.space["3xs"] }, r.meta)}>
          <span data-af-part="time" style={css(text, { lineHeight: "16px", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }, r.time)}>
            {time}
          </span>
          {!isRead && <span aria-hidden data-af-part="dot" style={r.dot} />}
        </div>
      </button>
      {approval !== "" && !outcome && (
        <div style={css(row, rtl(indent, dir), { gap: t.space.xs, marginTop: neg(t.space.xs) })}>
          <Button
            label={s("approve")}
            variant="ink"
            size="sm"
            iconLeading="check"
            loading={decision === "approving"}
            onPress={() => {
              setDecision("approved");
              onApprove?.();
            }}
          />
          <Button
            label={s("decline")}
            variant="secondary"
            size="sm"
            disabled={decision === "approving"}
            onPress={() => {
              setDecision("declined");
              onDecline?.();
            }}
          />
        </div>
      )}
      {approval !== "" && outcome && (
        <div ref={decidedRef} tabIndex={-1} data-af-part="decided" style={css(row, rtl(indent, dir), { marginTop: neg(t.space.sm), outline: "none" }, partStyle(r, "decided", enter("fade")))}>
          <Icon part="decidedIcon" name={DECIDED[outcome]} size={r.decidedIcon.width} style={r.decidedIcon} />
          <span data-af-part="decidedText" style={css(text, r.decidedText)}>
            {outcome === "approved" ? s("approved", { where }) : outcome === "declined" ? s("declined", { where }) : s("expired")}
          </span>
        </div>
      )}
      {actions && (
        <div data-af-part="actions" style={css(rtl(hoverActions, dir), r.actions)}>
          {!isRead && (
            <RowAction
              label={s("markReadLabel", { title })}
              text={s("markAsRead")}
              styles={styles}
              onPress={() => {
                setRead(true);
                onMarkRead?.();
              }}
            />
          )}
          <RowAction label={s("clearLabel", { title })} text={s("clear")} styles={styles} onPress={() => onClear?.()} />
        </div>
      )}
    </div>
  );
}

function RowAction({ label, text: shown, styles, onPress }: { label: string; text: string; styles?: PartStyles<"notification-item">; onPress: () => void }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["notification-item"], { state: { hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="rowAction"
      data-af-press
      aria-label={label}
      title={shown}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, { padding: "3px 7px", whiteSpace: "nowrap" }, r.rowAction)}
    >
      {shown}
    </button>
  );
}
