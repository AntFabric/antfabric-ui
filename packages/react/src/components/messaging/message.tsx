import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import { recipes, useControllable, useDirection, useStrings, type IconActionItem, type Attachment, type KitStrings, type Person, type Reaction } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { useInteraction } from "../../lib/interaction";
import { box, css, pressable, row, rtl, text, truncate } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Avatar, type AvatarIdentity } from "../display/avatar";
import { AttachmentCard } from "./attachment-card";
import { MessageActions } from "./message-actions";
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

export interface MessageProps extends RootProps<HTMLDivElement> {
  /** Display name. For an agent, the agent's name. */
  author: string;
  /** The author's fallback avatar colour. */
  identity?: MessageIdentity;
  avatarSrc?: string;
  /** The sent time in the reader's locale and clock (10:42 AM, 10:42). */
  time?: string;
  /** The compact row's hover time, without AM/PM, so it fits the gutter. The full time is its title. */
  gutterTime?: string;
  /** The message text. */
  body?: string;
  /** Draws "(edited)" after the words. */
  edited?: boolean;
  /** sending: dimmed with a clock. failed: Couldn't send · Retry · Delete. queued: held offline (desktop). deleted: the tombstone. */
  status?: MessageStatus;
  /** Sent by an AI agent: the agent avatar, the name in brand ink and an AI tag. */
  agent?: boolean;
  /** A continuation: no avatar and no name; the time shows in the gutter on hover. */
  compact?: boolean;
  /** Past your read mark: the soft coral unread wash. */
  unread?: boolean;
  /** Mentions you: a soft coral wash with a coral edge on the leading side. */
  mentionsYou?: boolean;
  pinned?: boolean;
  /** The message cursor, or the row you were brought to: coral bar and wash. */
  highlighted?: boolean;
  /** Draws the hover state: wash, the gutter time on a compact row, and the actions bar. */
  hovered?: boolean;
  /** In first-reacted order. */
  reactions?: Reaction[];
  thread?: MessageThread;
  attachments?: Attachment[];
  /** The add pill after the reactions and the bar's smile-plus. */
  addReaction?: boolean;
  /** The bar's one-press reactions, as emoji. */
  quickReactions?: string[];
  /** The bar's Reply in thread (it calls `onOpenThread`). */
  replyInThread?: boolean;
  /** The bar's Forward. */
  forward?: boolean;
  /** The product's own actions on the bar: icon buttons after Forward. */
  actions?: IconActionItem[];
  /** The bar's ⋯. */
  more?: boolean;
  /** The ⋯ menu is open: the bar's button stays pressed. */
  menuOpen?: boolean;
  /** Called with `status` as Retry leaves it (sending). */
  onStatusChange?: (status: MessageStatus) => void;
  /** Retry was pressed on a failed message: the app posts it again. */
  onRetry?: () => void;
  onDelete?: () => void;
  /** The thread summary, or Reply in thread on the actions bar. */
  onOpenThread?: () => void;
  /** A quick reaction or a reaction pill was pressed: toggle yours with this emoji. The server owns the counts. */
  onReact?: (emoji: string) => void;
  /** The add pill or the bar's smile-plus was pressed: open the emoji picker. */
  onAddReaction?: () => void;
  onForward?: () => void;
  /** A product action on the bar was pressed. */
  onAction?: (action: IconActionItem) => void;
  /** Called with `menuOpen` as the press on ⋯ leaves it. */
  onMenuOpenChange?: (menuOpen: boolean) => void;
  /** An attachment's card was pressed (the preview). */
  onAttachmentOpen?: (attachment: Attachment) => void;
  /** An attachment's download was pressed. */
  onAttachmentDownload?: (attachment: Attachment) => void;
  /** An attachment's cancel was pressed: an upload in progress, or a link's preview to remove. */
  onAttachmentCancel?: (attachment: Attachment) => void;
  /** A failed attachment's Retry was pressed: start its upload again. */
  onAttachmentRetry?: (attachment: Attachment) => void;
  /** This message's built-in text (its accessible name, the status lines, the tombstone) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["message"]>;
  /** Per-part styles over the theme: `{ root: {…}, author: {…}, body: {…}, statusLine: {…} }`. */
  styles?: PartStyles<"message">;
  style?: CSSProperties;
}

/** How long a finger rests on a row before the actions bar opens: the platform's long press. */
const LONG_PRESS = 450;

/** Layout no token decides; the colours, sizes and type are the recipe's (`message`). */
const statusLine: CSSProperties = { ...row, flexWrap: "wrap", gap: t.space["2xs"] };

function StatusAction({ label, children, onPress, styles }: Pick<MessageProps, "styles"> & { label: string; children: string; onPress: () => void }) {
  const ui = useInteraction();
  const r = useRecipe(recipes.message, { state: { hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="action"
      data-af-press
      aria-label={label}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, { textDecoration: "underline", textUnderlineOffset: "2px" }, r.action)}
    >
      {children}
    </button>
  );
}

export function Message({
  author,
  identity = "indigo",
  avatarSrc = "",
  time = "",
  gutterTime = "",
  body = "",
  edited = false,
  status,
  agent = false,
  compact = false,
  unread = false,
  mentionsYou = false,
  pinned = false,
  highlighted = false,
  hovered = false,
  reactions = [],
  thread = { count: 0 },
  attachments = [],
  addReaction = false,
  quickReactions = [],
  replyInThread = false,
  forward = false,
  actions = [],
  more = false,
  menuOpen = false,
  onStatusChange,
  onRetry,
  onDelete,
  onOpenThread,
  onReact,
  onAddReaction,
  onForward,
  onAction,
  onMenuOpenChange,
  onAttachmentOpen,
  onAttachmentDownload,
  onAttachmentCancel,
  onAttachmentRetry,
  strings,
  styles,
  style,
  ...rest
}: MessageProps) {
  const s = useStrings("message", strings);
  const ui = useInteraction();
  const [state = "sent", setState] = useControllable(status, onStatusChange);
  const retry = () => {
    setState("sending");
    onRetry?.();
  };
  // The bar shows on hover, on focus anywhere in the row (the row is a tab stop itself, so a text-only message has one), and
  // after a long press or the context-menu key (`opened`), which is how touch and Shift+F10 reach it.
  const [within, setWithin] = useState(false);
  const [opened, setOpened] = useState(false);
  const dir = useDirection();
  const press = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(press.current), []);
  const hot = hovered || ui.hovered || within || opened;
  const deleted = state === "deleted";
  const sent = state === "sent";
  // A bar with nothing on it is not drawn.
  const hasBar = quickReactions.length > 0 || addReaction || replyInThread || forward || actions.length > 0 || more;

  const r = useRecipe(recipes.message, { variants: { hovered: hot, unread, mentionsYou, highlighted, status: state, agent }, state: { hover: hot }, styles });
  // The coral bar down the leading edge: an inset 3px (the row you were brought to) or 2px (it mentions you) shadow.
  const end = dir === "rtl" ? "-" : "";
  const bar = highlighted ? { boxShadow: `inset ${end}3px 0 0 0 ${t.brand.default}` } : mentionsYou ? { boxShadow: `inset ${end}2px 0 0 0 ${t.border.brand}` } : null;
  // What a screen reader hears of the row's state, after who and when.
  const said = state === "sending" ? s("saidSending") : state === "failed" ? s("saidFailed") : state === "queued" ? s("saidQueued") : "";

  // The hover state flips on every pointer move; the cards and pills below only depend on their data, so they are built once per
  // change of it, through handlers that read the latest props (a stable identity, which lets the memoised children skip the render).
  const on = useRef({ onReact, onAttachmentOpen, onAttachmentDownload, onAttachmentCancel, onAttachmentRetry, onAddReaction });
  on.current = { onReact, onAttachmentOpen, onAttachmentDownload, onAttachmentCancel, onAttachmentRetry, onAddReaction };
  const canRetryAttachment = !!onAttachmentRetry;
  const canReact = !!onReact;
  const react = useCallback((emoji: string) => on.current.onReact?.(emoji), []);
  const attachmentCards = useMemo(
    () =>
      attachments.map((a, i) => (
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
          onOpen={() => on.current.onAttachmentOpen?.(a)}
          onDownload={() => on.current.onAttachmentDownload?.(a)}
          onCancel={() => on.current.onAttachmentCancel?.(a)}
          onRetry={canRetryAttachment ? () => on.current.onAttachmentRetry?.(a) : undefined}
          // The attachment's own `status` is the truth: the card does not move to uploading before the app says so.
          onStatusChange={canRetryAttachment ? () => {} : undefined}
        />
      )),
    [attachments, canRetryAttachment],
  );
  const reactionPills = useMemo(
    () => reactions.map((x) => <ReactionPill key={x.emoji} emoji={x.emoji} count={x.count} mine={x.mine ?? false} reactors={x.reactors ?? ""} disabled={!sent} onPress={canReact ? () => react(x.emoji) : undefined} />),
    [reactions, sent, canReact, react],
  );

  return (
    <div
      role="article"
      data-af-part="root"
      tabIndex={0}
      {...rootProps(rest)}
      aria-label={s("label", { author, ai: agent ? s("ai") : "", time, state: said, mention: mentionsYou ? s("mentionsYou") : "", unread: unread ? s("unread") : "", pinned: pinned ? s("pinned") : "" })}
      // A finger "enters" on every tap, which would flash the bar: touch gets it by long press instead.
      onPointerEnter={(e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== "touch") ui.handlers.onPointerEnter();
      }}
      onPointerLeave={ui.handlers.onPointerLeave}
      onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== "touch" || !sent) return;
        clearTimeout(press.current);
        press.current = setTimeout(() => setOpened(true), LONG_PRESS);
      }}
      onPointerUp={() => clearTimeout(press.current)}
      onPointerCancel={() => clearTimeout(press.current)}
      onContextMenu={(e) => {
        if (!sent || !hasBar) return;
        e.preventDefault();
        setOpened(true);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape" && opened) {
          e.stopPropagation();
          setOpened(false);
          e.currentTarget.focus();
        } else if (e.key === "F10" && e.shiftKey && sent && hasBar) {
          e.preventDefault();
          setOpened(true);
        }
      }}
      onFocus={() => setWithin(true)}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        const inside = e.currentTarget.contains(e.relatedTarget as Node | null);
        setWithin(inside);
        if (!inside) setOpened(false);
      }}
      style={css(
        row,
        // The 18px gutter is `space.lgXl` on both sides, so it needs no mirroring; the compact row's 1px is an optical nudge.
        { alignItems: "flex-start", width: "100%", paddingTop: compact ? 1 /* structural: the compact row's optical nudge */ : t.space.sm, paddingRight: t.space.lgXl, paddingBottom: t.space["3xs"], paddingLeft: t.space.lgXl, transition: `background ${t.duration.base} ${t.ease.standard}` },
        partStyle(r, "root", bar),
        style,
      )}
    >
      <div data-af-part="gutter" style={css(box, { flexShrink: 0, alignItems: "flex-end" }, r.gutter)}>
        {!compact && <Avatar name={author} identity={agent ? "agent" : identity} src={avatarSrc} agent={agent} shape={agent ? "square" : "circle"} size="md" decorative />}
        {compact && hot && (
          <span
            aria-hidden
            title={time}
            data-af-part="gutterTime"
            style={css(text, rtl({ paddingRight: t.space["2xs"] }, dir), { whiteSpace: "nowrap", userSelect: "none" }, r.gutterTime)}
          >
            {gutterTime}
          </span>
        )}
      </div>
      <div style={css(box, { flex: 1, gap: t.space["3xs"] })}>
        {!compact && (
          <div style={css(row, { alignItems: "baseline", gap: t.space.sm })}>
            <span data-af-part="author" style={css(text, truncate(1), { flexShrink: 1 }, r.author)}>
              {author}
            </span>
            {agent && (
              <span
                role="img"
                aria-label={s("aiTagLabel")}
                data-af-part="aiTag"
                style={css(box, { alignSelf: "center", height: 16, paddingInline: 5, justifyContent: "center", flexShrink: 0 }, r.aiTag)}
              >
                <span aria-hidden data-af-part="aiText" style={css(text, { fontSize: 10, lineHeight: 1, letterSpacing: "0.06em" }, r.aiText)}>
                  {s("aiTag")}
                </span>
              </span>
            )}
            <span data-af-part="time" style={css(text, { whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }, r.time)}>
              {time}
            </span>
            {pinned && (
              <span title={s("pinnedTitle")} data-af-part="pinned" style={css(row, { alignSelf: "center", gap: 3, flexShrink: 0 }, r.pinned)}>
                <Icon part="pinIcon" name="pin" size={r.pinIcon.width} style={r.pinIcon} />
                <span style={css(text, { whiteSpace: "nowrap" })}>{s("pinnedTag")}</span>
              </span>
            )}
          </div>
        )}
        {!deleted && body && (
          <p dir="auto" data-af-part="body" style={css(text, { maxWidth: "100%", whiteSpace: "pre-wrap" }, r.body)}>
            {body}
            {edited && (
              <span data-af-part="edited" style={{ ...rtl({ marginLeft: 5 }, dir), whiteSpace: "nowrap", ...r.edited }}>
                {s("edited")}
              </span>
            )}
          </p>
        )}
        {deleted && (
          <p data-af-part="tombstone" style={css(text, { fontStyle: "italic" }, r.tombstone)}>
            {s("deleted")}
          </p>
        )}
        {attachments.length > 0 && !deleted && <div style={css(box, { gap: t.space.xs, marginTop: t.space["2xs"], alignItems: "flex-start", maxWidth: "100%" })}>{attachmentCards}</div>}
        {reactions.length > 0 && !deleted && (
          <div style={css(row, { flexWrap: "wrap", gap: t.space["2xs"], marginTop: t.space["2xs"], alignItems: "flex-end" })}>
            {reactionPills}
            {addReaction && sent && hot && <ReactionPill emoji="" variant="add" onPress={() => on.current.onAddReaction?.()} />}
          </div>
        )}
        {thread.count > 0 && (
          <ThreadSummary
            replyCount={thread.count}
            lastReply={thread.lastReply ?? ""}
            participants={thread.participants ?? []}
            unreadCount={thread.unread ?? 0}
            following={thread.following ?? false}
            onPress={() => onOpenThread?.()}
            style={{ marginTop: t.space["3xs"], ...rtl({ marginLeft: -7 }, dir) }}
          />
        )}
        {state === "sending" && (
          <div aria-live="polite" data-af-part="statusLine" style={css(statusLine, r.statusLine)}>
            <Icon part="statusIcon" name="clock" size={r.statusIcon.width} style={r.statusIcon} />
            <span style={text}>{s("sending")}</span>
          </div>
        )}
        {state === "failed" && (
          <div role="alert" data-af-part="statusLine" style={css(statusLine, r.statusLine)}>
            <Icon part="statusIcon" name="circle-alert" size={r.statusIcon.width} style={r.statusIcon} />
            <span style={text}>{s("failed")}</span>
            <span aria-hidden data-af-part="statusSep" style={css(text, r.statusSep)}>
              ·
            </span>
            <StatusAction label={s("retryLabel")} onPress={retry} styles={styles}>
              {s("retry")}
            </StatusAction>
            <span aria-hidden data-af-part="statusSep" style={css(text, r.statusSep)}>
              ·
            </span>
            <StatusAction label={s("deleteLabel")} onPress={() => onDelete?.()} styles={styles}>
              {s("delete")}
            </StatusAction>
          </div>
        )}
        {state === "queued" && (
          <div aria-live="polite" data-af-part="statusLine" style={css(statusLine, r.statusLine)}>
            <Icon part="statusIcon" name="cloud-off" size={r.statusIcon.width} style={r.statusIcon} />
            <span style={text}>{s("queued")}</span>
            <span aria-hidden data-af-part="statusSep" style={css(text, r.statusSep)}>
              ·
            </span>
            <StatusAction label={s("deleteLabel")} onPress={() => onDelete?.()} styles={styles}>
              {s("delete")}
            </StatusAction>
          </div>
        )}
      </div>
      {hot && sent && hasBar && (
        <MessageActions
          quickReactions={quickReactions}
          addReaction={addReaction}
          replyInThread={replyInThread}
          forward={forward}
          actions={actions}
          more={more}
          menuOpen={menuOpen}
          onReact={(emoji) => onReact?.(emoji)}
          onAddReaction={() => onAddReaction?.()}
          onReplyInThread={() => onOpenThread?.()}
          onForward={() => onForward?.()}
          onAction={(action) => onAction?.(action)}
          onMenuOpenChange={onMenuOpenChange}
          style={{ position: "absolute", top: t.space["3xs"], ...rtl({ right: t.space.mdLg }, dir) }}
        />
      )}
    </div>
  );
}
