import { Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useLocale, useStrings, type KitStrings, type Person } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { hitSlopTo } from "../../lib/a11y";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { Avatar } from "../display/avatar";

export interface ThreadSummaryProps extends RootProps {
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
   * @deprecated Never called: opening a thread is not following it, and nothing on this line changes `following`. It stays
   * accepted through 1.x so no product breaks, and goes at 2.0.
   */
  onFollowingChange?: (following: boolean) => void;
  /** Pushes the thread screen. */
  onPress?: () => void;
  /** This line's built-in text (its accessible name, "replies", "Following") over the tree's and the English defaults. */
  strings?: Partial<KitStrings["thread-summary"]>;
  /** Per-part styles over the theme: `{ root: {…}, replies: {…}, lastReply: {…}, following: {…} }`. */
  styles?: PartStyles<"thread-summary">;
  style?: ViewStyle;
}

/** Layout no token decides; the colours, sizes and type are the recipe's (`threadSummary`). */
const useStyles = createStyles((t) => ({
  // The whole line is one 44pt target even though the text is 20pt.
  root: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", alignSelf: "flex-start", rowGap: t.space["2xs"], maxWidth: "100%", paddingVertical: 3 },
  group: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  count: { flexShrink: 0 },
  meta: { flexShrink: 1 },
}));

export function ThreadSummary({ replyCount, lastReply = "", participants = [], unreadCount = 0, following: follow = false, onFollowingChange: _onFollowingChange, onPress, strings, styles, style, testID, ...rest }: ThreadSummaryProps) {
  const locale = useLocale();
  const { t } = useTheme();
  const str = useStrings("thread-summary", strings);
  const s = useStyles();
  const press = usePress();
  const r = useRecipe(recipes["thread-summary"], { state: { pressed: press.pressed, focus: press.focused }, styles });
  const root = partStyle(r, "root", { view: press.pressed ? { opacity: 0.7 } : undefined });
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: iconSize, height: _iconHeight, ...iconRest } = r.icon.view;
  if (!(replyCount > 0)) return null;
  // Grouping and digits follow the reader's locale.
  const num = new Intl.NumberFormat(locale);
  const replies = str("replies", { count: num.format(replyCount) });
  const unread = num.format(unreadCount);
  const label = str("open", {
    replies,
    unread: unreadCount > 0 ? str("openUnread", { count: unread }) : "",
    last: lastReply ? str("openLast", { time: lastReply }) : "",
    following: follow ? str("openFollowing") : "",
  });
  return (
    <Pressable
      testID={partId(testID, "thread-summary", "root")}
      hitSlop={hitSlopTo(t.control.hit, t.control.hIconSm)}
      {...rootProps(rest)}
      accessibilityRole="button"
      accessibilityLabel={rest.accessibilityLabel ?? label}
      onPress={() => onPress?.()}
      {...press.handlers}
      style={[s.root, root.view, style]}
    >
      {participants.length > 0 ? (
        <View testID={partId(testID, "thread-summary", "participants")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.group, { gap: t.space["3xs"] }, r.participants.view]}>
          {participants.map((p, i) => (
            <Avatar key={`${p.name}-${i}`} name={p.name} identity={p.identity ?? "indigo"} src={p.src ?? ""} agent={p.agent ?? false} size="xs" />
          ))}
        </View>
      ) : null}
      {unreadCount > 0 ? (
        <View style={[s.group, { gap: t.space["2xs"] }]}>
          <View testID={partId(testID, "thread-summary", "unreadDot")} style={r.unreadDot.view} />
          <Text testID={partId(testID, "thread-summary", "unreadText")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[r.root.text, r.unreadText.view, r.unreadText.text]}>
            {str.parts("unread", { count: unread })}
          </Text>
        </View>
      ) : null}
      <Text testID={partId(testID, "thread-summary", "replies")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[r.root.text, r.replies.text, s.count, r.replies.view]}>
        {replies}
      </Text>
      {lastReply ? (
        <Text testID={partId(testID, "thread-summary", "lastReply")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[r.root.text, r.lastReply.text, s.meta, r.lastReply.view]}>
          {str.parts("lastReply", { time: lastReply })}
        </Text>
      ) : null}
      {follow ? (
        <Enter motion="fade" style={[s.group, { gap: t.space["3xs"] }]}>
          <Icon testID={partId(testID, "thread-summary", "icon")} name="bell" size={iconSize as number} color={r.following.text.color} style={Object.keys(iconRest).length ? iconRest : undefined} />
          <Text testID={partId(testID, "thread-summary", "following")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[r.root.text, r.following.view, r.following.text]}>
            {str("following")}
          </Text>
        </Enter>
      ) : null}
    </Pressable>
  );
}
