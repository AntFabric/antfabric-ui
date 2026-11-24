import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { formatShortcut, recipes, useControllable, useDirection, useStrings, type IconActionItem, type Attachment, type KitStrings } from "@antfabric/ui-core";
import { useAutoFocus, usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { isComposing } from "../../lib/keys";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { useInteraction } from "../../lib/interaction";
import { box, css, enter, input, pressable, row, rtl, text } from "../../lib/style";
import { announce, useAnnounce } from "../../lib/announce";
import { useRovingKeys } from "../../lib/roving";
import { rootProps, type RootProps } from "../../lib/root-props";
import { IconButton } from "../actions/icon-button";
import { AttachmentCard } from "./attachment-card";


export type ComposerMode = "default" | "editing" | "thread" | "offline" | "readonly" | "archived";
export type ComposerSendKey = "enter" | "mod-enter";
/** One button of the formatting toolbar, in the toolbar's order. */
export type ComposerFormat = "bold" | "italic" | "underline" | "strikethrough" | "link" | "ordered-list" | "bulleted-list" | "code" | "code-block";

export interface ComposerProps extends RootProps<HTMLDivElement> {
  /** "Message #<channel>", "Message <person>", "Reply…" in a thread. Empty reads strings `placeholder`. */
  placeholder?: string;
  /** The draft. */
  value?: string;
  /** editing: one of your messages. thread: the reply box. offline: sends refused, draft kept. readonly / archived: a notice, no box. */
  mode?: ComposerMode;
  /** enter: Enter sends, Shift+Enter is a new line. mod-enter: Mod+Enter sends, Enter is a new line. Mod+Enter always sends. */
  sendKey?: ComposerSendKey;
  /** A staged file is still uploading. Send waits for it. */
  uploading?: boolean;
  /** Staged files, drawn as compact attachment cards above the text. */
  attachments?: Attachment[];
  /** Silent until the draft is near the limit: "1,000 left", then "240 over". */
  lengthHint?: string;
  /** Past the limit: the hint turns red and Send is disabled. */
  tooLong?: boolean;
  /** Thread only: also post this reply to the channel. */
  alsoSend?: boolean;
  /** The conversation the reply would also go to. Empty reads strings `conversation`. */
  alsoSendTo?: string;
  /** The formatting toolbar above the text. The shortcuts work either way. */
  formatting?: boolean;
  /** Attach: the file picker. Disabled offline. */
  attach?: boolean;
  /** Insert emoji. */
  emoji?: boolean;
  /** Mention someone. */
  mention?: boolean;
  /** The slash-command button. Hidden while editing. */
  commands?: boolean;
  /** The product's own tools, drawn as icon buttons after the built-in ones. */
  tools?: IconActionItem[];
  /** The composer takes no input: the field, every tool and Send are disabled (a conversation that is closing, a permission still loading). */
  disabled?: boolean;
  /** The most characters the field takes, enforced by the browser. Pair it with `lengthHint` to show how many are left. */
  maxLength?: number;
  /** Focuses the field when the composer mounts (after Reply or Edit opens it). Not under a host that draws overlays as pictures. */
  autoFocus?: boolean;
  /** Draws the focused edge, as focusing the box does. */
  focused?: boolean;
  /** Called with the draft as it is typed, and with "" when Send clears it. */
  onValueChange?: (value: string) => void;
  /** Called with `alsoSend` as a press on "Also send to" leaves it. */
  onAlsoSendChange?: (alsoSend: boolean) => void;
  onSend?: (text: string) => void;
  onCancelEdit?: () => void;
  /** The file picker (multiple). */
  onAttach?: () => void;
  onEmoji?: () => void;
  onMention?: () => void;
  onCommands?: () => void;
  /** A formatting button was pressed. */
  onFormat?: (format: ComposerFormat) => void;
  /** A product tool was pressed. */
  onAction?: (action: IconActionItem) => void;
  /** A staged attachment's card was pressed (the preview). */
  onAttachmentOpen?: (attachment: Attachment) => void;
  /**
   * Never called: a staged file is the sender's own, so its chip has no download (a ready chip's body calls `onAttachmentOpen`).
   * @deprecated Kept so 1.x code compiles; removed in 2.0.
   */
  onAttachmentDownload?: (attachment: Attachment) => void;
  /** A staged attachment's remove or cancel was pressed: take it out of `attachments`. */
  onAttachmentCancel?: (attachment: Attachment) => void;
  /** A failed attachment's Retry was pressed: start its upload again. */
  onAttachmentRetry?: (attachment: Attachment) => void;
  /** This composer's built-in text (its field, tools, notices and hints) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["composer"]>;
  /** Per-part styles over the theme: `{ root: {…}, card: {…}, input: {…}, toolbar: {…}, counter: {…} }`. */
  styles?: PartStyles<"composer">;
  style?: CSSProperties;
}

/** The chat range: one line, growing to 220px before it scrolls inside. */
const MAX_HEIGHT = 220;

/** Layout no token decides; the colours, sizes and type are the recipe's (`composer`). */
const hint: CSSProperties = { ...text, whiteSpace: "nowrap" };
const spacer: CSSProperties = { flex: 1, minWidth: 0 };

function AlsoSend({ on, to, onToggle, strings, styles }: Pick<ComposerProps, "strings" | "styles"> & { on: boolean; to: string; onToggle: () => void }) {
  const s = useStrings("composer", strings);
  const ui = useInteraction();
  const r = useRecipe(recipes.composer, { state: { on, hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="alsoSend"
      data-af-press
      role="checkbox"
      aria-checked={on}
      aria-label={s("alsoSendTo", { to })}
      onClick={() => onToggle()}
      {...ui.handlers}
      style={css(pressable, text, { flexDirection: "row", alignItems: "center" }, r.alsoSend)}
    >
      <span data-af-part="alsoBox" style={css(box, { flexShrink: 0, alignItems: "center", justifyContent: "center" }, r.alsoBox)}>
        {on && <Icon part="alsoTick" name="check" size={r.alsoTick.width} style={css(r.alsoTick, enter("pop"))} />}
      </span>
      <span style={css(text, { whiteSpace: "nowrap" })}>{s.parts("alsoSendTo", { to })}</span>
    </button>
  );
}

export function Composer({
  placeholder = "",
  value,
  mode = "default",
  sendKey = "enter",
  uploading = false,
  attachments = [],
  lengthHint = "",
  tooLong = false,
  alsoSend,
  alsoSendTo = "",
  formatting = false,
  attach = false,
  emoji = false,
  mention = false,
  commands = false,
  tools = [],
  focused = false,
  disabled = false,
  maxLength,
  autoFocus = false,
  onValueChange,
  onAlsoSendChange,
  onSend,
  onCancelEdit,
  onAttach,
  onEmoji,
  onMention,
  onCommands,
  onFormat,
  onAction,
  onAttachmentOpen,
  onAttachmentDownload,
  onAttachmentCancel,
  onAttachmentRetry,
  strings,
  styles,
  style,
  ref: rootRef,
  ...rest
}: ComposerProps) {
  const s = useStrings("composer", strings);
  const { shortcutOs } = usePlatform();
  const [draft = "", setDraft] = useControllable(value, onValueChange);
  const [also = false, setAlso] = useControllable(alsoSend, onAlsoSendChange);
  const [inside, setInside] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const dir = useDirection();
  const allowFocus = useAutoFocus();
  useEffect(() => {
    if (autoFocus && allowFocus) field.current?.focus({ preventScroll: true });
    // Once, as the composer opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // The formatting toolbar is one tab stop; the arrows move inside it.
  const toolbar = useRovingKeys<HTMLDivElement>({ items: "button:not(:disabled)", orientation: "horizontal", roving: true });

  // Grows with the text: one line to 220px, then it scrolls inside.
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [draft, mode]);

  const locked = mode === "readonly" || mode === "archived";
  const editing = mode === "editing";
  const offline = mode === "offline";
  const typed = draft.trim() !== "";
  const sendable = typed && !uploading && !tooLong && !offline && !disabled;
  // Only the upload stands in the way: Send stays pressable (aria-disabled), so a press says why it waits.
  const waiting = typed && uploading && !tooLong && !offline && !disabled;
  // The counter is read at a few thresholds (100, 50, 10 left, then over), not on every keystroke.
  const left = /\d/.test(lengthHint) ? Number(lengthHint.replace(/[^\d]/g, "")) : null;
  const bucket = tooLong ? "over" : left === null ? "none" : left <= 10 ? "10" : left <= 50 ? "50" : left <= 100 ? "100" : "none";
  const lastBucket = useRef(bucket);
  useEffect(() => {
    if (lastBucket.current === bucket) return;
    lastBucket.current = bucket;
    if (bucket !== "none" && lengthHint) announce(lengthHint, bucket === "over" ? "assertive" : "polite");
  }, [bucket, lengthHint]);
  // Going offline, or the channel locking, while the composer is on screen is said; the line itself is plain text.
  useAnnounce(offline && s("offline"));
  useAnnounce(locked && (mode === "archived" ? s("archivedTitle") : s("readonlyTitle")));
  const send = () => {
    // Send waits while a file uploads; a press or Enter in that window says why.
    if (waiting) announce(s("uploadWaiting"));
    if (!sendable) return;
    const words = draft;
    // Cleared in the same tick as the press, so a double press cannot send twice.
    setDraft("");
    onSend?.(words);
  };
  const keys = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter that commits an IME composition never sends.
    if (isComposing(e)) return;
    if (e.key === "Escape" && editing) {
      e.preventDefault();
      onCancelEdit?.();
      return;
    }
    if (e.key !== "Enter") return;
    // Mod+Enter always sends; plain Enter only with the Enter-sends setting.
    if (!(e.metaKey || e.ctrlKey) && (sendKey !== "enter" || e.shiftKey)) return;
    e.preventDefault();
    send();
  };
  const showBelow = mode === "thread" || (typed && !offline && !locked) || uploading;
  const keyHint = typed && !uploading && !offline && !editing;
  // Focus draws the active edge; editing's coral edge outranks the `focused` drawing but not real focus.
  const r = useRecipe(recipes.composer, { variants: { mode }, state: { focus: inside || (focused && !editing), invalid: tooLong }, styles });
  // The toolbar's buttons, in its order; "rule" is a divider between groups.
  const formats: (readonly [format: ComposerFormat, icon: string, label: string] | "rule")[] = [
    ["bold", "bold", s("bold")],
    ["italic", "italic", s("italic")],
    ["underline", "underline", s("underline")],
    ["strikethrough", "strikethrough", s("strikethrough")],
    "rule",
    ["link", "link", s("link")],
    "rule",
    ["ordered-list", "list-ordered", s("orderedList")],
    ["bulleted-list", "list", s("bulletedList")],
    "rule",
    ["code", "code", s("code")],
    ["code-block", "square-code", s("codeBlock")],
  ];

  return (
    <div
      ref={rootRef}
      data-af-part="root"
      {...rootProps(rest)}
      style={css(box, { width: "100%", maxWidth: "clamp(680px, 34vw, 880px)", paddingTop: 0, paddingRight: t.space.lgXl, paddingBottom: t.space.lg, paddingLeft: t.space.lgXl }, r.root, style)}
    >
      {editing && (
        <div data-af-part="editBanner" style={css(row, r.editBanner, enter("rise"))}>
          <Icon part="editIcon" name="pencil" size={r.editIcon.width} style={r.editIcon} />
          <span data-af-part="editLabel" style={css(text, r.editLabel)}>
            {s("editing")}
          </span>
          <span data-af-part="editHint" style={css(text, r.editHint)}>
            {s.parts("editHint", { save: formatShortcut(sendKey === "mod-enter" ? "Mod+Enter" : "Enter", shortcutOs) })}
          </span>
        </div>
      )}
      {offline && (
        <div data-af-part="offline" style={css(row, text, r.offline, enter("rise"))}>
          <Icon part="offlineIcon" name="wifi-off" size={r.offlineIcon.width} color={r.offlineIcon.color} style={r.offlineIcon} />
          <span style={css(text, { flex: 1 })}>{s("offline")}</span>
        </div>
      )}
      {locked && (
        <div data-af-part="locked" style={css(row, { padding: "13px 15px" }, r.locked)}>
          <Icon part="lockedIcon" name={mode === "archived" ? "archive" : "lock"} size={r.lockedIcon.width} color={r.lockedIcon.color} style={r.lockedIcon} />
          <div style={css(box, { flex: 1, gap: t.space["3xs"] })}>
            <span data-af-part="lockedTitle" style={css(text, r.lockedTitle)}>
              {mode === "archived" ? s("archivedTitle") : s("readonlyTitle")}
            </span>
            <span data-af-part="lockedDetail" style={css(text, r.lockedDetail)}>
              {mode === "archived" ? s("archivedDetail") : s("readonlyDetail")}
            </span>
          </div>
        </div>
      )}
      {!locked && (
        <div data-af-part="card" style={css(box, { transition: `border-color ${t.motion.duration.quick}` }, r.card)}>
          {formatting && (
            <div ref={toolbar.ref} role="toolbar" aria-label={s("formatting")} data-af-part="toolbar" onKeyDown={toolbar.onKeyDown} style={css(row, { gap: t.space["3xs"], padding: `${t.space.xs} ${t.space.sm} 0` }, r.toolbar)}>
              {formats.map((tool, i) =>
                tool === "rule" ? (
                  <span key={i} data-af-part="toolbarRule" style={partStyle(r, "toolbarRule", { height: 14, flexShrink: 0, marginInline: t.space["2xs"] })} />
                ) : (
                  <IconButton key={tool[0]} icon={tool[1]} label={tool[2]} size="sm" shape="square" disabled={disabled} onPress={() => onFormat?.(tool[0])} style={{ borderRadius: t.radius.tag }} />
                ),
              )}
            </div>
          )}
          {attachments.length > 0 && (
            <div role="group" aria-label={s("attachedFiles")} style={css(row, { flexWrap: "wrap", gap: t.space.xs, padding: `${t.space.sm} ${t.space.sm} 0` })}>
              {attachments.map((a, i) => (
                <AttachmentCard
                  key={a.key ?? `${a.name ?? a.url ?? ""}-${i}`}
                  compact
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
                  onDownload={() => onAttachmentDownload?.(a)}
                  onCancel={() => onAttachmentCancel?.(a)}
                  onRetry={onAttachmentRetry ? () => onAttachmentRetry(a) : undefined}
                  // The attachment's own `status` is the truth: the card does not move to uploading before the app says so.
                  onStatusChange={onAttachmentRetry ? () => {} : undefined}
                />
              ))}
            </div>
          )}
          <textarea
            ref={field}
            data-af-input
            rows={1}
            value={draft}
            placeholder={placeholder || s("placeholder")}
            aria-label={editing ? s("inputEdit") : mode === "thread" ? s("inputThread") : s("input")}
            disabled={disabled}
            maxLength={maxLength}
            dir="auto"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={keys}
            onFocus={() => setInside(true)}
            onBlur={() => setInside(false)}
            data-af-part="input"
            style={css(
              input,
              {
                display: "block",
                width: "100%",
                minHeight: 22,
                maxHeight: MAX_HEIGHT,
                padding: `${t.space.sm} ${t.space.mdLg} ${t.space["2xs"]}`,
                overflow: "auto",
                fieldSizing: "content",
              } as CSSProperties,
              r.input,
            )}
          />
          <div style={css(row, { gap: 1, padding: `5px ${t.space.sm} 7px` })}>
            {attach && <IconButton icon="plus" label={s("attach")} disabled={offline || disabled} onPress={() => onAttach?.()} style={{ flexShrink: 0 }} />}
            {emoji && <IconButton icon="smile" label={s("emoji")} disabled={disabled} onPress={() => onEmoji?.()} style={{ flexShrink: 0 }} />}
            {mention && <IconButton icon="at-sign" label={s("mention")} disabled={disabled} onPress={() => onMention?.()} style={{ flexShrink: 0 }} />}
            {commands && !editing && <IconButton icon="slash" label={s("commands")} disabled={disabled} onPress={() => onCommands?.()} style={{ flexShrink: 0 }} />}
            {tools.map((a) => (
              <IconButton key={a.key} icon={a.icon} label={a.label} badge={a.badge} disabled={a.disabled || disabled} onPress={() => onAction?.(a)} style={{ flexShrink: 0 }} />
            ))}
            <span style={spacer} />
            {lengthHint && (
              <span aria-hidden data-af-part="counter" style={css(text, rtl({ paddingRight: t.space.xs }, dir), { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }, r.counter)}>
                {lengthHint}
              </span>
            )}
            <IconButton
              icon={editing ? "check" : "send"}
              label={editing ? s("save") : s("sendMessage")}
              variant={sendable ? "solid" : "ghost"}
              disabled={!sendable && !waiting}
              aria-disabled={waiting || undefined}
              onPress={send}
              style={{ flexShrink: 0, ...rtl({ marginLeft: t.space["2xs"] }, dir) }}
            />
          </div>
        </div>
      )}
      {showBelow && (
        <div style={css(row, { gap: t.space.md, minHeight: 20, paddingInline: t.space["2xs"] })}>
          {mode === "thread" && <AlsoSend on={also} to={alsoSendTo || s("conversation")} onToggle={() => setAlso(!also)} strings={strings} styles={styles} />}
          {uploading && (
            <span data-af-part="hint" style={css(hint, r.hint)}>
              {s("uploadWaiting")}
            </span>
          )}
          <span style={spacer} />
          {keyHint && sendKey === "enter" && (
            <span data-af-part="hint" style={css(hint, r.hint)}>
              {s.parts("newLine", { keys: formatShortcut("Shift+Enter", shortcutOs) })}
            </span>
          )}
          {keyHint && sendKey === "mod-enter" && (
            <span data-af-part="hint" style={css(hint, r.hint)}>
              {s.parts("modSend", { send: formatShortcut("Mod+Enter", shortcutOs), newline: formatShortcut("Enter", shortcutOs) })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
