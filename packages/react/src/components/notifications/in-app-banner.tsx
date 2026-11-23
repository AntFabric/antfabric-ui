import { useEffect, useRef, useState, type CSSProperties } from "react";
import { recipes, useControllable, useDirection, useStrings, type ActionItem, type KitStrings } from "@antfabric/ui-core";
import { useAutoFocus } from "../../platform";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { isComposing } from "../../lib/keys";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, input, neg, pressable, row, rtl, text, truncate } from "../../lib/style";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";
import { Avatar, type AvatarIdentity } from "../display/avatar";

export type InAppBannerLeading = "avatar" | "tile";
export type InAppBannerDismissReason = "close" | "action" | "swipe";

/** A button under the text. `dismiss` puts the banner away when it is pressed. */
export interface InAppBannerAction extends ActionItem {
  /** ghost (the default) for the quiet ones, soft for the one that does the thing. */
  variant?: "ghost" | "soft";
  dismiss?: boolean;
}

export interface InAppBannerProps extends RootProps<HTMLDivElement> {
  /** The sender for chat; the event for a meeting or an agent. */
  title: string;
  /** Drawn after the title: the channel, the room. Empty for a direct message. */
  context?: string;
  /** Two lines at most; the server's bounded preview. */
  body?: string;
  sender?: string;
  /** The sender's photo. */
  avatarSrc?: string;
  /** The colour of the sender's initials when there is no `avatarSrc`. */
  identity?: AvatarIdentity;
  /** avatar is the sender's face. tile is a glyph on a tile, for an event that has no sender. */
  leading?: InAppBannerLeading;
  /** The tile's glyph. */
  icon?: IconName;
  /** The sender is an agent: its face, and no name colour. */
  agent?: boolean;
  /** Words before the body: "Mentioned you". */
  lead?: string;
  time?: string;
  /** How many more are waiting behind this one. They show one at a time; this says so. */
  queued?: number;
  /** A Reply button comes first, and opens the inline reply. */
  replyable?: boolean;
  /** The buttons under the text, after Reply. */
  actions?: InAppBannerAction[];
  /** The inline reply is open. */
  replying?: boolean;
  replyText?: string;
  /** Why the inline reply did not send. The draft stays in the box. */
  error?: string;
  /** × or an action that dismisses. The banner leaves and nothing is drawn. */
  dismissed?: boolean;
  onOpen?: () => void;
  onDismiss?: (reason: InAppBannerDismissReason) => void;
  onReply?: (text: string) => void;
  /** An action was pressed. */
  onAction?: (action: InAppBannerAction) => void;
  /** This banner's built-in text (its accessible name, Reply, the reply field) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["in-app-banner"]>;
  /** Per-part styles over the theme: `{ root: {…}, card: {…}, title: {…} }`. */
  styles?: PartStyles<"in-app-banner">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; the colours, sizes and type are the recipe's (`inAppBanner`). The slide comes from the trailing edge: `slide-right` in a right-to-left tree. */
const card: CSSProperties = { ...box };

const hit: CSSProperties = { ...pressable, flexDirection: "row", alignItems: "flex-start", textAlign: "left" };

const tile: CSSProperties = { ...box, flexShrink: 0, alignItems: "center", justifyContent: "center" };

const bodyText: CSSProperties = { ...text, ...truncate(2) };
const field: CSSProperties = { ...input, flex: 1 };
// Under the text column: past the face and the gap.
const indent = `calc(${t.avatar.md} + ${t.space.md})`;

export function InAppBanner({
  title,
  context = "",
  body = "",
  sender = "",
  avatarSrc = "",
  identity = "indigo",
  leading = "avatar",
  icon = "",
  agent = false,
  lead = "",
  time = "",
  queued = 0,
  replyable = false,
  actions = [],
  replying = false,
  replyText = "",
  error = "",
  dismissed = false,
  onOpen,
  onDismiss,
  onReply,
  onAction,
  strings,
  styles,
  style,
  ...rest
}: InAppBannerProps) {
  const s = useStrings("in-app-banner", strings);
  const ui = useInteraction();
  const typing = useInteraction();
  const r = useRecipe(recipes["in-app-banner"], { state: { focus: ui.focused }, styles });
  const rField = useRecipe(recipes["in-app-banner"], { state: { focus: typing.focused }, styles });
  const [gone, setGone] = useControllable(dismissed);
  // Dismissing puts this notification away, not the banner: a new one (another title, context, body or time) shows again, back at
  // `dismissed`. Body is part of it because two messages from one sender in one minute share a title and a time.
  const notification = [title, context, body, time].join("\n");
  const [shown, setShown] = useState(notification);
  if (shown !== notification) {
    setShown(notification);
    setGone(dismissed);
  }
  const [open, setOpen] = useControllable(replying);
  const [draft, setDraft] = useControllable(replyText);
  const dismiss = (reason: InAppBannerDismissReason) => {
    setGone(true);
    onDismiss?.(reason);
  };
  const send = () => {
    if (!draft) return;
    setOpen(false);
    setDraft("");
    onReply?.(draft);
  };
  const dir = useDirection();
  const allowed = useAutoFocus();
  // Reply swaps its button for the field: focus follows into the field, and back to Reply when the reply closes (never on first draw, so
  // a banner that mounts open does not take focus from the page).
  const fieldRef = useRef<HTMLInputElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current === open) return;
    wasOpen.current = open;
    if (!allowed) return;
    if (open) fieldRef.current?.focus({ preventScroll: true });
    else if (document.activeElement === document.body || !document.activeElement) actionsRef.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div role="status" aria-live="polite" aria-label={s("newNotification")} data-af-part="root" {...rootProps(rest)} style={css(box, r.root, style)}>
      {!gone && (
        <div
          onKeyDown={(e) => {
            // Escape in the reply field closes the reply and keeps the draft; anywhere else in the card it puts the banner away.
            if (e.key !== "Escape" || e.target instanceof HTMLInputElement || e.defaultPrevented || isComposing(e)) return;
            e.preventDefault();
            dismiss("close");
          }}
          data-af-part="card"
          style={css(card, enter(dir === "rtl" ? "slide-right" : "slide-left"), r.card)}
        >
          <button
            type="button"
            data-af-part="hit"
            data-af-press
            aria-label={context ? s("openIn", { title, context, body }) : s("open", { title, body })}
            onClick={() => onOpen?.()}
            {...ui.handlers}
            style={css(rtl(hit, dir), r.hit)}
          >
            {leading === "tile" ? (
              <div data-af-part="tile" style={css(tile, r.tile)}>
                {icon && <Icon part="tileIcon" name={icon} size={r.tileIcon.width} style={r.tileIcon} />}
              </div>
            ) : (
              <Avatar name={sender} src={avatarSrc} size="md" identity={agent ? "agent" : identity} agent={agent} />
            )}
            <div style={css(box, { flex: 1, gap: t.space["3xs"] })}>
              <div style={css(row, { alignItems: "baseline", gap: t.space.sm })}>
                <span data-af-part="title" style={css(text, truncate(1), { flex: 1 }, r.title)}>
                  {title}
                  {context ? (
                    <span data-af-part="context" style={r.context}> · {context}</span>
                  ) : null}
                </span>
                <span data-af-part="time" style={css(text, { flexShrink: 0 }, r.time)}>
                  {time}
                </span>
              </div>
              {body ? (
                <span data-af-part="body" style={css(bodyText, r.body)}>
                  {lead && <span data-af-part="lead" style={r.lead}>{s("leadSuffix", { lead })}</span>}
                  {body}
                </span>
              ) : null}
              {queued > 0 && (
                <span data-af-part="more" style={css(text, { marginTop: t.space["3xs"] }, r.more)}>
                  {s.parts("more", { count: queued })}
                </span>
              )}
            </div>
          </button>
          <IconButton icon="x" label={s("dismiss")} size="sm" onPress={() => dismiss("close")} style={rtl({ position: "absolute", top: t.space.sm, right: t.space.sm }, dir)} />
          {!open && (replyable || actions.length > 0) && (
            <div ref={actionsRef} style={css(row, rtl({ gap: t.space["2xs"], paddingLeft: t.avatar.md, marginTop: neg(t.space["3xs"]), flexWrap: "wrap" }, dir), enter("fade"))}>
              {replyable && <Button label={s("reply")} variant="ghost" size="sm" iconLeading="reply" onPress={() => setOpen(true)} />}
              {actions.map((a) => (
                <Button
                  key={a.key}
                  label={a.label}
                  variant={a.variant ?? "ghost"}
                  size="sm"
                  iconLeading={a.icon}
                  disabled={a.disabled}
                  onPress={() => {
                    if (a.dismiss) dismiss("action");
                    onAction?.(a);
                  }}
                />
              ))}
            </div>
          )}
          {open && replyable && (
            <div style={css(row, rtl({ gap: t.space.xs, paddingLeft: indent }, dir), enter("fade"))}>
              <input
                ref={fieldRef}
                data-af-input
                aria-label={s("replyTo", { name: sender })}
                placeholder={s("replyPlaceholder", { name: sender })}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  // An IME's Enter commits its candidate and its Escape cancels it: neither sends nor closes the reply.
                  if (isComposing(e)) return;
                  if (e.key === "Enter") send();
                  else if (e.key === "Escape") {
                    // The reply is closed and the draft kept; the banner stays.
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(false);
                  }
                }}
                {...typing.handlers}
                data-af-part="field"
                style={css(field, rField.field)}
              />
              <Button label={s("send")} size="sm" disabled={!draft} onPress={send} />
            </div>
          )}
          {open && error ? (
            <span role="alert" data-af-part="error" style={css(text, rtl({ paddingLeft: indent }, dir), r.error)}>
              {error}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
