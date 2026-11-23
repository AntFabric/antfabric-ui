import type { CSSProperties } from "react";
import { recipes, useControllable, useDirection, useLocale, useStrings, type KitStrings, type Person } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, enter, pressable, row, rtl, text, truncate } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Avatar } from "../display/avatar";

export interface ThreadSummaryProps extends RootProps<HTMLButtonElement> {
  /** Replies in the thread. 0 draws nothing. */
  replyCount: number;
  /** Relative time of the newest reply, formatted by the caller ("12m ago", "Yesterday"). */
  lastReply?: string;
  /** Up to three repliers, most recent first. The caller trims the list. */
  participants?: Person[];
  /** Replies you have not read, counted by the server. */
  unreadCount?: number;
  /** You follow this thread: the bell and "Following". */
  following?: boolean;
  /**
   * Called with `following` as the press leaves it. Given `following` as well, the line is
   * controlled and the press changes nothing here; on its own (the catalogue, where opening is
   * navigation) it flips Following, as Follow in the thread's ⋯ does.
   */
  onFollowingChange?: (following: boolean) => void;
  /** Opens the thread. */
  onPress?: () => void;
  /** This line's built-in text (its accessible name, "replies", "Following") over the tree's and the English defaults. */
  strings?: Partial<KitStrings["thread-summary"]>;
  /** Per-part styles over the theme: `{ root: {…}, replies: {…}, lastReply: {…}, following: {…} }`. */
  styles?: PartStyles<"thread-summary">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; the colours, sizes and type are the recipe's (`threadSummary`). */
const root: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
  maxWidth: "100%",
  paddingTop: 3 /* structural: optical nudge */,
  paddingBottom: 3 /* structural: optical nudge */,
  paddingRight: t.space.sm,
  paddingLeft: t.space.xs,
  transition: `background ${t.duration.fast}, border-color ${t.duration.fast}`,
};

const nowrap: CSSProperties = { ...text, whiteSpace: "nowrap", flexShrink: 0 };

export function ThreadSummary({ replyCount, lastReply = "", participants = [], unreadCount = 0, following, onFollowingChange, onPress, strings, styles, style, ...rest }: ThreadSummaryProps) {
  const s = useStrings("thread-summary", strings);
  const ui = useInteraction();
  const dir = useDirection();
  const locale = useLocale();
  const [follow = false, setFollow] = useControllable(following, onFollowingChange);
  const r = useRecipe(recipes["thread-summary"], { state: { hover: ui.hovered, pressed: ui.pressed, focus: ui.focused }, styles });
  if (!(replyCount > 0)) return null;
  // Grouping and digits follow the reader's locale, so "1,204" is "1.204" for a German reader.
  const num = new Intl.NumberFormat(locale);
  const replies = s("replies", { count: num.format(replyCount) });
  const unread = num.format(unreadCount);
  const label = s("open", {
    replies,
    unread: unreadCount > 0 ? s("openUnread", { count: unread }) : "",
    last: lastReply ? s("openLast", { time: lastReply }) : "",
    following: follow ? s("openFollowing") : "",
  });
  return (
    <button
      type="button"
      data-af-part="root"
      data-af-press
      {...rootProps(rest)}
      aria-label={label}
      onClick={() => {
        setFollow(!follow);
        onPress?.();
      }}
      {...ui.handlers}
      style={css(rtl(root, dir), r.root, style)}
    >
      {participants.length > 0 && (
        <span aria-hidden data-af-part="participants" style={css(row, partStyle(r, "participants", { gap: t.space["3xs"], flexShrink: 0 }))}>
          {participants.map((p, i) => (
            <Avatar key={`${p.name}-${i}`} name={p.name} identity={p.identity ?? "indigo"} src={p.src ?? ""} agent={p.agent ?? false} size="xs" style={{ flexShrink: 0 }} />
          ))}
        </span>
      )}
      {unreadCount > 0 && (
        <span style={css(row, { gap: t.space["2xs"], flexShrink: 0 })}>
          <span data-af-part="unreadDot" style={partStyle(r, "unreadDot", { flexShrink: 0 })} />
          <span data-af-part="unreadText" style={css(nowrap, r.unreadText)}>{s.parts("unread", { count: unread })}</span>
        </span>
      )}
      <span data-af-part="replies" style={css(nowrap, r.replies)}>{replies}</span>
      {lastReply && <span data-af-part="lastReply" style={css(text, truncate(1), partStyle(r, "lastReply", { flexShrink: 1 }))}>{s.parts("lastReply", { time: lastReply })}</span>}
      {follow && (
        <span data-af-part="following" style={css(row, partStyle(r, "following", { gap: t.space["3xs"], flexShrink: 0 }), enter("fade"))}>
          <Icon part="icon" name="bell" size={r.icon.width} style={r.icon} />
          <span style={css(nowrap)}>{s("following")}</span>
        </span>
      )}
    </button>
  );
}
