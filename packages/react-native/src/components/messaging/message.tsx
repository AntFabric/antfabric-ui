import { I18nManager, Pressable, Text, View, type AccessibilityActionEvent, type ViewStyle } from "react-native";
import { recipes, usePending, useStrings, type Attachment, type KitStrings, type Person, type Reaction } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { Avatar, type AvatarIdentity } from "../display/avatar";
import { AttachmentCard } from "./attachment-card";
import { ReactionPill } from "./reaction-pill";
import { ThreadSummary } from "./thread-summary";

export type MessageIdentity = Exclude<AvatarIdentity, "agent">;
export type MessageStatus = "sent" | "sending" | "failed" | "queued" | "deleted";

/** Drawn as a thread summary when count > 0. */
export interface MessageThread {
  count: number;
  lastReply?: string;
  participants?: Person[];
  unread?: number;
  following?: boolean;
}

export interface MessageProps extends RootProps {
  /** Display name. For an agent, the agent's name. */
  author: string;
  /** The author's fallback avatar colour. */
  identity?: MessageIdentity;
  avatarSrc?: string;
  /** The sent time in the reader's locale and clock (10:42 AM, 10:42). */
  time?: string;
  /** The message text. */
  body?: string;
  /** Draws "(edited)" after the words. */
  edited?: boolean;
  /** sending: dimmed with a clock. failed: Couldn't send · Retry · Delete. queued: held offline (desktop). deleted: the tombstone. */
  status?: MessageStatus;
  /** Sent by an AI agent: the agent avatar, the name in brand ink and an AI tag. */
  agent?: boolean;
  /** A continuation: no avatar, no name and, with no hover on a phone, no time. */
  compact?: boolean;
  /** Past your read mark: the soft coral unread wash. */
  unread?: boolean;
  /** Mentions you: a soft coral wash with a coral edge on the leading side. */
  mentionsYou?: boolean;
  pinned?: boolean;
  /** The row you were brought to: coral bar and wash. */
  highlighted?: boolean;
  /** In first-reacted order. */
  reactions?: Reaction[];
  thread?: MessageThread;
  attachments?: Attachment[];
  /** The add pill after the reactions. */
  addReaction?: boolean;
  /** Reports the request Retry makes (sending). The row waits for the app to pass the new `status`; it never moves it. */
  onStatusChange?: (status: MessageStatus) => void;
  /** Retry was tapped on a failed message: the app posts it again. Retry spins until the app answers with `status`, or the promise settles. */
  onRetry?: () => void | Promise<unknown>;
  onDelete?: () => void;
  onOpenThread?: () => void;
  /** A reaction pill was pressed: toggle yours with this emoji. The server owns the counts: the pill is busy until the app passes the new `reactions`, or the promise settles. */
  onReact?: (emoji: string) => void | Promise<unknown>;
  /** The add pill was pressed: open the emoji picker. */
  onAddReaction?: () => void;
  /** Opens the message actions sheet. A message still sending ignores it. */
  onLongPress?: () => void;
  /** An attachment's card was pressed (the preview). */
  onAttachmentOpen?: (attachment: Attachment) => void;
  /** An attachment's cancel was pressed: an upload in progress. */
  onAttachmentCancel?: (attachment: Attachment) => void;
  /** A failed attachment's Retry was pressed: start its upload again. */
  onAttachmentRetry?: (attachment: Attachment) => void;
  /** This message's built-in text (its accessible name, the status lines, the tombstone) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["message"]>;
  /** Per-part styles over the theme: `{ root: {…}, author: {…}, body: {…}, statusLine: {…} }`. */
  styles?: PartStyles<"message">;
  style?: ViewStyle;
}

/** Layout no token decides; the colours, sizes and type are the recipe's (`message`). */
const useStyles = createStyles((t) => ({
  root: { flexDirection: "row", alignItems: "flex-start", width: "100%", minWidth: 0, paddingBottom: t.space.sm },
  gutter: { flexShrink: 0, alignItems: "flex-end" },
  content: { flex: 1, minWidth: 0, gap: t.space["2xs"] },
  header: { flexDirection: "row", alignItems: "baseline", gap: t.space.sm, minWidth: 0 },
  author: { flexShrink: 1 },
  aiTag: { alignSelf: "center", height: 16, paddingHorizontal: 5, justifyContent: "center", flexShrink: 0 },
  aiText: { fontSize: 10, lineHeight: 10, letterSpacing: 0.6 },
  time: { flexShrink: 0, fontVariant: ["tabular-nums"] },
  pinned: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 3, flexShrink: 0 },
  body: { maxWidth: "100%" },
  tombstone: { fontStyle: "italic" },
  attachments: { gap: t.space.xs, marginTop: t.space["2xs"], alignItems: "flex-start", maxWidth: "100%" },
  reactions: { flexDirection: "row", flexWrap: "wrap", gap: t.space["2xs"], marginTop: t.space["2xs"], alignItems: "flex-end" },
  statusLine: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: t.space["2xs"] },
  words: { gap: t.space["2xs"], minWidth: 0 },
  action: { justifyContent: "center" },
  actionText: { textDecorationLine: "underline" },
}));

/** An icon part's size is its width and height; what else `styles` sets on it goes on the glyph. */
const iconOf = (view: ViewStyle) => {
  const { width, height: _height, ...rest } = view;
  return { size: width as number, style: Object.keys(rest).length ? rest : undefined };
};

function StatusAction({ label, children, color, busy = false, onPress, styles }: Pick<MessageProps, "styles"> & { label: string; children: string; color: string | undefined; busy?: boolean; onPress: () => void }) {
  const s = useStyles();
  const press = usePress();
  const r = useRecipe(recipes.message, { state: { focus: press.focused }, styles });
  const action = partStyle(r, "action", { view: press.pressed ? { opacity: 0.6 } : undefined });
  return (
    <Pressable testID="message.action" accessibilityRole="button" accessibilityLabel={label} accessibilityState={busy ? { busy, disabled: busy } : undefined} disabled={busy} onPress={() => onPress()} {...press.handlers} style={[s.action, action.view]}>
      <Text testID="message.actionText" style={[s.actionText, { color }, r.actionText.view, r.actionText.text]}>
        {children}
      </Text>
    </Pressable>
  );
}

export function Message({
  author,
  identity = "indigo",
  avatarSrc = "",
  time = "",
  body = "",
  edited = false,
  status: state = "sent",
  agent = false,
  compact = false,
  unread = false,
  mentionsYou = false,
  pinned = false,
  highlighted = false,
  reactions = [],
  thread = { count: 0 },
  attachments = [],
  addReaction = false,
  onStatusChange,
  onRetry,
  onDelete,
  onOpenThread,
  onReact,
  onAddReaction,
  onLongPress,
  onAttachmentOpen,
  onAttachmentCancel,
  onAttachmentRetry,
  strings,
  styles,
  style,
  testID,
  ...rest
}: MessageProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("message", strings);
  // Retry reports the request and goes busy until the app answers: the status is the app's, never moved here.
  const { pending: retrying, run } = usePending([state]);
  const retry = () =>
    run(
      onStatusChange || onRetry
        ? () => {
            onStatusChange?.("sending");
            return onRetry?.();
          }
        : undefined,
    );
  const deleted = state === "deleted";
  const sent = state === "sent";
  const r = useRecipe(recipes.message, { variants: { unread, mentionsYou, highlighted, status: state, agent }, styles });
  // The status line's ink is its colour in each state: faint, or the danger / warning colour once it failed or was held offline.
  const ink = r.statusLine.text.color;
  // The coral bar down the leading edge: an inset 3px (the row you were brought to) or 2px (it mentions you) shadow.
  // The leading edge is the right one in a right-to-left layout.
  const end = I18nManager.isRTL ? "-" : "";
  const bar: ViewStyle | null = highlighted ? { boxShadow: `inset ${end}3px 0 0 0 ${t.brand.default}` } : mentionsYou ? { boxShadow: `inset ${end}2px 0 0 0 ${t.border.brand}` } : null;
  const root = partStyle(r, "root", { view: [{ paddingTop: compact ? 0 : 8 }, bar] });
  const authorStyle = partStyle(r, "author", { view: s.author, text: { lineHeight: Math.round((r.author.text.fontSize as number) * 1.25) } });
  const aiText = partStyle(r, "aiText", { text: s.aiText });
  const timeStyle = partStyle(r, "time", { text: s.time });
  const bodyStyle = partStyle(r, "body", { view: s.body });
  const tombstone = partStyle(r, "tombstone", { text: s.tombstone });
  const pinIcon = iconOf(r.pinIcon.view);
  const statusIcon = iconOf(r.statusIcon.view);

  // What a screen reader hears of the row's state, after who and when.
  const said = state === "sending" ? str("saidSending") : state === "failed" ? str("saidFailed") : state === "queued" ? str("saidQueued") : "";
  // The message's own words are one stop for a screen reader: who, when, what state, the words, edited, and a summary of what hangs off
  // it. Its reactions, attachments and thread are stops of their own after it, so each can be reached and used.
  const named = attachments.map((a) => a.name || a.title || a.domain || "").filter(Boolean).join(", ");
  const label = [
    str("label", { author, ai: agent ? str("ai") : "", time, state: said, mention: mentionsYou ? str("mentionsYou") : "", unread: unread ? str("unread") : "", pinned: pinned ? str("pinned") : "" }),
    deleted ? str("deleted") : `${body}${edited && body ? str("saidEdited") : ""}`,
    !deleted && attachments.length > 0 ? str("attachments", { count: attachments.length, names: named }) : "",
    !deleted && reactions.length > 0 ? str("reactions", { count: reactions.length }) : "",
    thread.count > 0 ? str("replies", { count: thread.count }) : "",
  ]
    .filter(Boolean)
    .join(", ");
  const actions = [
    ...(state !== "sending" ? [{ name: "longpress", label: str("actionsLabel") }] : []),
    ...(state === "failed" ? [{ name: "retry", label: str("retry") }] : []),
    ...(state === "failed" || state === "queued" ? [{ name: "delete", label: str("delete") }] : []),
    ...(thread.count > 0 ? [{ name: "thread", label: str("openThread") }] : []),
  ];
  const { accessibilityLabel: given, accessibilityHint: givenHint, ...onRoot } = rootProps(rest) as { accessibilityLabel?: string; accessibilityHint?: string } & Record<string, unknown>;
  const act = (e: AccessibilityActionEvent) => {
    const name = e.nativeEvent.actionName;
    if (name === "longpress") onLongPress?.();
    else if (name === "retry") retry();
    else if (name === "delete") onDelete?.();
    else if (name === "thread") onOpenThread?.();
  };

  return (
    <Pressable
      // The row itself is not a stop: its parts are (the words, then each reaction, attachment and the thread).
      accessible={false}
      {...onRoot}
      // A local echo has no server id yet, so it has no actions.
      onLongPress={state === "sending" ? undefined : () => onLongPress?.()}
      delayLongPress={300}
      testID={partId(testID, "message", "root")}
      style={[s.root, root.view, style]}
    >
      <View testID={partId(testID, "message", "gutter")} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[s.gutter, r.gutter.view]}>
        {!compact ? <Avatar name={author} identity={agent ? "agent" : identity} src={avatarSrc} agent={agent} shape={agent ? "square" : "circle"} size="md" decorative /> : null}
      </View>
      <View style={s.content}>
        <View accessible accessibilityLabel={given ?? label} accessibilityHint={givenHint} accessibilityActions={actions} onAccessibilityAction={act} style={s.words}>
        {!compact ? (
          <View style={s.header}>
            <Text testID={partId(testID, "message", "author")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[authorStyle.view, authorStyle.text]}>
              {author}
            </Text>
            {agent ? (
              <View testID={partId(testID, "message", "aiTag")} accessibilityLabel={str("aiTagLabel")} style={[s.aiTag, r.aiTag.view]}>
                <Text testID={partId(testID, "message", "aiText")} style={[aiText.view, aiText.text]}>
                  {str("aiTag")}
                </Text>
              </View>
            ) : null}
            <Text testID={partId(testID, "message", "time")} maxFontSizeMultiplier={fontScale.content} style={[timeStyle.view, timeStyle.text]}>
              {time}
            </Text>
            {pinned ? (
              <View testID={partId(testID, "message", "pinned")} style={[s.pinned, r.pinned.view]}>
                <Icon testID={partId(testID, "message", "pinIcon")} name="pin" {...pinIcon} color={r.pinned.text.color} />
              </View>
            ) : null}
          </View>
        ) : null}
        {!deleted && body ? (
          <Text testID={partId(testID, "message", "body")} maxFontSizeMultiplier={fontScale.content} style={[bodyStyle.view, bodyStyle.text]}>
            {body}
            {edited ? (
              <Text testID={partId(testID, "message", "edited")} style={[r.edited.view, r.edited.text]}>
                {"  "}
                {str("edited")}
              </Text>
            ) : null}
          </Text>
        ) : null}
        {deleted ? (
          <Text testID={partId(testID, "message", "tombstone")} maxFontSizeMultiplier={fontScale.content} style={[tombstone.view, tombstone.text]}>
            {str("deleted")}
          </Text>
        ) : null}
        </View>
        {attachments.length > 0 && !deleted ? (
          <View style={s.attachments}>
            {attachments.map((a, i) => (
              <AttachmentCard
                key={a.key ?? `${a.name ?? a.url ?? ""}-${i}`}
                kind={a.kind}
                name={a.name}
                fileType={a.fileType}
                badge={a.badge}
                typeLabel={a.typeLabel}
                size={a.size}
                status={a.status}
                progress={a.progress}
                src={a.src}
                title={a.title}
                domain={a.domain}
                description={a.description}
                url={a.url}
                duration={a.duration}
                onOpen={() => onAttachmentOpen?.(a)}
                onCancel={() => onAttachmentCancel?.(a)}
                onRetry={onAttachmentRetry ? () => onAttachmentRetry(a) : undefined}
              />
            ))}
          </View>
        ) : null}
        {reactions.length > 0 && !deleted ? (
          <View style={s.reactions}>
            {reactions.map((x) => (
              <ReactionPill key={x.emoji} emoji={x.emoji} count={x.count} mine={x.mine ?? false} reactors={x.reactors ?? ""} disabled={!sent} onMineChange={onReact ? () => onReact(x.emoji) : undefined} />
            ))}
            {addReaction && sent ? <ReactionPill emoji="" variant="add" onPress={() => onAddReaction?.()} /> : null}
          </View>
        ) : null}
        {thread.count > 0 ? (
          <ThreadSummary
            replyCount={thread.count}
            lastReply={thread.lastReply ?? ""}
            participants={thread.participants ?? []}
            unreadCount={thread.unread ?? 0}
            following={thread.following ?? false}
            onPress={() => onOpenThread?.()}
          />
        ) : null}
        {state === "sending" ? (
          <View testID={partId(testID, "message", "statusLine")} accessibilityLiveRegion="polite" style={[s.statusLine, r.statusLine.view]}>
            <Icon testID={partId(testID, "message", "statusIcon")} name="clock" {...statusIcon} color={ink} />
            <Text maxFontSizeMultiplier={fontScale.content} style={r.statusLine.text}>{str("sending")}</Text>
          </View>
        ) : null}
        {state === "failed" ? (
          <View testID={partId(testID, "message", "statusLine")} accessibilityRole="alert" style={[s.statusLine, r.statusLine.view]}>
            <Icon testID={partId(testID, "message", "statusIcon")} name="circle-alert" {...statusIcon} color={ink} />
            <Text maxFontSizeMultiplier={fontScale.content} style={r.statusLine.text}>{str("failed")}</Text>
            <Text testID={partId(testID, "message", "statusSep")} style={[r.statusLine.text, r.statusSep.view, r.statusSep.text]}>
              ·
            </Text>
            <StatusAction label={str("retryLabel")} color={ink} busy={retrying} onPress={retry} styles={styles}>
              {str("retry")}
            </StatusAction>
            <Text testID={partId(testID, "message", "statusSep")} style={[r.statusLine.text, r.statusSep.view, r.statusSep.text]}>
              ·
            </Text>
            <StatusAction label={str("deleteLabel")} color={ink} onPress={() => onDelete?.()} styles={styles}>
              {str("delete")}
            </StatusAction>
          </View>
        ) : null}
        {state === "queued" ? (
          <View testID={partId(testID, "message", "statusLine")} accessibilityLiveRegion="polite" style={[s.statusLine, r.statusLine.view]}>
            <Icon testID={partId(testID, "message", "statusIcon")} name="cloud-off" {...statusIcon} color={ink} />
            <Text maxFontSizeMultiplier={fontScale.content} style={r.statusLine.text}>{str("queued")}</Text>
            <Text testID={partId(testID, "message", "statusSep")} style={[r.statusLine.text, r.statusSep.view, r.statusSep.text]}>
              ·
            </Text>
            <StatusAction label={str("deleteLabel")} color={ink} onPress={() => onDelete?.()} styles={styles}>
              {str("delete")}
            </StatusAction>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
