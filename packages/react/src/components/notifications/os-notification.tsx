import { useEffect, type CSSProperties, type ReactNode } from "react";
import { recipes, useControllable, useStrings, type ActionItem, type KitStrings } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { Icon, Spinner } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, glass, input, neg, pressable, row, text, truncate } from "../../lib/style";
import { Avatar, type AvatarIdentity } from "../display/avatar";

export type OsNotificationLeading = "avatar" | "tile";
export type OsNotificationReply = "none" | "typing" | "sending" | "failed";

/** A button of the banner, at most two. */
export interface OsNotificationAction extends ActionItem {
  /** Opens the inline reply instead of reporting; the text typed comes back with the press. */
  reply?: boolean;
  /** Shown before the banner is expanded, where the OS shows actions at rest (Windows always, the browser once expanded). */
  rest?: boolean;
}

export interface OsNotificationProps extends RootProps<HTMLDivElement> {
  /** The app's name, which the OS draws in its header; its first letter is the small mark. */
  appName: string;
  /** The web origin a browser names beside the app: "app.example.com". "" names none. */
  origin?: string;
  /** The bold line: the sender for chat, the event for a meeting or an agent ("Design crit starts in 5 min"). */
  title: string;
  /** The server's bounded preview (140 characters, never the whole message). */
  body?: string;
  /** Whose face goes on the banner. */
  sender?: string;
  /** The sender's photo. */
  avatarSrc?: string;
  /** The colour of the sender's initials when there is no `avatarSrc`. */
  identity?: AvatarIdentity;
  /** macOS subtitle, Windows attribution, the browser's second line. Empty for a DM. */
  context?: string;
  time?: string;
  /** avatar is the sender's face. tile is the app's own icon, for an event that has no sender. */
  leading?: OsNotificationLeading;
  /** The sender is an agent: its face, and no badge. */
  agent?: boolean;
  /** Words before the body: "Mentioned you". */
  lead?: string;
  /** The banner's buttons. The one that `reply`s opens the inline reply (Windows always shows its field). */
  actions?: OsNotificationAction[];
  /** false is "Hide message previews": "New message", and no body, sender or context. */
  preview?: boolean;
  /** How many more are stacked under this one from the same conversation. */
  grouped?: number;
  /** The state the OS reveals the actions in. Pressing the banner toggles it. */
  expanded?: boolean;
  /** An inline reply typed into the notification itself. Reply opens it. */
  reply?: OsNotificationReply;
  replyText?: string;
  onOpen?: () => void;
  /** Web and desktop: the banner's close button (the Mac's, shown once expanded, and the other OSes' ×). */
  onClose?: () => void;
  /** Windows: the ⋯ button's notification settings. */
  onSettings?: () => void;
  /** An action was pressed: the item, and for a reply the text sent with it. */
  onAction?: (action: OsNotificationAction, text?: string) => void;
  /** This banner's built-in text (the reply field, the status, the header lines) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["os-notification"]>;
  /** Per-part styles over the theme: `{ card: {…}, title: {…} }`. */
  styles?: PartStyles<"os-notification">;
  style?: CSSProperties;
}

type Desk = "mac" | "windows" | "linux" | "browser";

const SF = "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", sans-serif";

const blur = (px: number): CSSProperties => ({ backdropFilter: `blur(${px}px)`, WebkitBackdropFilter: `blur(${px}px)` });

const WIDTH: Record<Desk, number> = { mac: 344, windows: 364, linux: 380, browser: 360 };

/** What no token decides in each OS's banner: its font stack and the Mac's padding and blur. The colours, radii, shadow and edge are the recipe's (`osNotification`, under each OS). */
const CARD: Record<Desk, CSSProperties> = {
  mac: { ...box, zIndex: 1, ...blur(30), padding: "10px 12px", fontFamily: SF },
  windows: { ...box, zIndex: 1, fontFamily: "\"Segoe UI Variable Text\", \"Segoe UI\", system-ui, sans-serif" },
  linux: { ...box, zIndex: 1, fontFamily: "\"Adwaita Sans\", Cantarell, \"Noto Sans\", Ubuntu, sans-serif" },
  browser: { ...box, zIndex: 1, fontFamily: "system-ui, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif" },
};

const TITLE: Record<Desk, CSSProperties> = { mac: { lineHeight: "17px" }, windows: { lineHeight: "20px" }, linux: { lineHeight: "18px" }, browser: { lineHeight: "18px" } };

const BODY: Record<Desk, CSSProperties> = { mac: { lineHeight: "17px" }, windows: { lineHeight: "20px" }, linux: { lineHeight: "17px" }, browser: { lineHeight: "17px" } };

const HIT: Record<Desk, CSSProperties> = { mac: {}, windows: { padding: "0 16px 12px" }, linux: {}, browser: { padding: "4px 12px 12px" } };

const ACTIONS: Record<Desk, CSSProperties> = { mac: {}, windows: { padding: "0 16px 16px" }, linux: {}, browser: {} };

const center: CSSProperties = { alignItems: "center", justifyContent: "center" };
const mark: CSSProperties = { ...text, fontWeight: 800, lineHeight: 1 };
const content: CSSProperties = { ...box, flex: 1, minWidth: 0, gap: 1 }; /* structural: 1px optical gap between title and body */
const small: CSSProperties = { ...text };
/** The 1.5px edge of the kind badge: the recipe's colour, the kit's width. */
const badgeEdge: CSSProperties = { borderWidth: "1.5px", borderStyle: "solid" };
/** The first letter of the app's name: its mark. */
const initial = (name: string) => Array.from(name)[0] ?? "";

/** The app's mark, as the OS draws it beside its name. */
function SmallIcon({ appName, styles }: { appName: string; styles?: PartStyles<"os-notification"> }) {
  const r = useRecipe(recipes["os-notification"], { styles });
  return (
    <span aria-hidden data-af-part="smallIcon" style={css(box, center, { flexShrink: 0 }, r.smallIcon)}>
      <span data-af-part="mark" style={css(mark, r.mark)}>
        {initial(appName)}
      </span>
    </span>
  );
}

function CloseButton({ os, label, icon = "x", styles, onPress }: { os: Desk; label: string; icon?: string; styles?: PartStyles<"os-notification">; onPress: () => void }) {
  const { glass: liquid } = usePlatform();
  const ui = useInteraction();
  const r = useRecipe(recipes["os-notification"], { state: { hover: ui.hovered, focus: ui.focused }, styles });
  const mac = os === "mac";
  const { borderColor: _edge, ...material } = glass();
  const side = mac ? 20 : os === "windows" ? 28 : 24;
  return (
    <button
      type="button"
      data-af-part="closeButton"
      data-af-press
      aria-label={label}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(
        pressable,
        center,
        partStyle(
          r,
          "closeButton",
          { width: side, height: side, flexShrink: 0 },
          // macOS floats it over the banner's top-left corner, and only on hover; its edge is 0.5px, in the recipe's colour.
          mac && {
            position: "absolute",
            zIndex: 2,
            borderRadius: "50%",
            ...blur(20),
            borderWidth: "0.5px",
            borderStyle: "solid",
            ...enter("fade"),
          },
          // Liquid Glass's material, but not its transparent edge: the Mac's button keeps its hairline.
          mac && liquid && material,
        ),
      )}
    >
      <Icon name={icon} size={mac ? 11 : 14} />
    </button>
  );
}

function ActionButton({ os, label, styles, onPress }: { os: Desk; label: string; styles?: PartStyles<"os-notification">; onPress: () => void }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["os-notification"], { state: { hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="action"
      data-af-press
      aria-label={label}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, center, { flex: 1 }, os === "browser" && { borderRadius: 0 }, r.action)}
    >
      <span style={css(text, truncate(1))}>{label}</span>
    </button>
  );
}

interface ReplyProps {
  os: Desk;
  sender: string;
  placeholder: string;
  value: string;
  sending: boolean;
  strings?: Partial<KitStrings["os-notification"]>;
  styles?: PartStyles<"os-notification">;
  onChange: (text: string) => void;
  onSend: () => void;
}

function ReplyRow({ os, sender, placeholder, value, sending, strings, styles, onChange, onSend }: ReplyProps) {
  const s = useStrings("os-notification", strings);
  const field = useInteraction({ disabled: sending });
  const send = useInteraction({ disabled: !value || sending });
  const r = useRecipe(recipes["os-notification"], { state: { focus: field.focused, disabled: field.disabled }, styles });
  const rSend = useRecipe(recipes["os-notification"], { state: { hover: send.hovered, focus: send.focused, disabled: send.disabled }, styles });
  const win = os === "windows";
  return (
    <div style={css(row, { gap: t.space.xs }, win && { padding: "0 16px 8px" })}>
      <input
        data-af-input
        value={value}
        placeholder={placeholder}
        aria-label={s("replyTo", { name: sender })}
        disabled={field.disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        {...field.handlers}
        data-af-part="replyField"
        style={css(
          input,
          { flex: 1 },
          // Windows' underline: a 2px bottom edge, in the brand colour while focused.
          partStyle(r, "replyField", win && { borderBottomWidth: "2px", borderBottomStyle: "solid", borderBottomColor: field.focused ? t.brand.default : t.border.default }),
        )}
      />
      <button
        type="button"
        data-af-part="sendButton"
        data-af-press
        aria-label={s("send")}
        aria-busy={sending || undefined}
        disabled={send.disabled}
        onClick={() => onSend()}
        {...send.handlers}
        style={css(pressable, center, { flexShrink: 0, borderRadius: "50%" }, partStyle(rSend, "sendButton", send.disabled && { cursor: sending ? "progress" : "not-allowed" }))}
      >
        {sending ? <Spinner size={14} decorative /> : <Icon name="send" size={win ? 16 : 15} />}
      </button>
    </div>
  );
}

function Status({ os, failed, appName, strings, styles }: { os: Desk; failed: boolean; appName: string; strings?: Partial<KitStrings["os-notification"]>; styles?: PartStyles<"os-notification"> }) {
  const s = useStrings("os-notification", strings);
  const r = useRecipe(recipes["os-notification"], { state: { invalid: failed }, styles });
  const said = failed ? s("replyFailed", { app: appName }) : s("sendingText");
  // The line arrives holding its text, which is not read: it goes through the page's announcer (a failure at once).
  useEffect(() => {
    announce(said, failed ? "assertive" : "polite");
  }, [said, failed]);
  return (
    <div style={css(row, { gap: t.space.xs }, os === "windows" && { padding: "0 16px 12px" })}>
      {failed && <Icon part="statusIcon" name="circle-alert" size={14} style={r.statusIcon} />}
      <span data-af-part="statusText" style={css(small, r.statusText)}>
        {failed ? s("replyFailed", { app: appName }) : s("sendingText")}
      </span>
    </div>
  );
}

export function OsNotification({
  appName,
  origin = "",
  title,
  body = "",
  sender = "",
  avatarSrc = "",
  identity = "indigo",
  context = "",
  time = "",
  leading = "avatar",
  agent = false,
  lead = "",
  actions = [],
  preview = true,
  grouped = 0,
  expanded = false,
  reply = "none",
  replyText = "",
  onOpen,
  onClose,
  onSettings,
  onAction,
  strings,
  styles,
  style,
  ...rest
}: OsNotificationProps) {
  const { os: platformOS, glass: liquid } = usePlatform();
  const s = useStrings("os-notification", strings);
  // The OS owns these: pressing the banner reveals the actions, Reply opens the field, and nothing reports them back.
  const [open, setOpen] = useControllable(expanded);
  const [replying, setReplying] = useControllable(reply);
  const [draft, setDraft] = useControllable(replyText);
  const hit = useInteraction();
  const r = useRecipe(recipes["os-notification"], { state: { focus: hit.focused }, styles });
  const os: Desk = platformOS === "mac" || platformOS === "windows" || platformOS === "linux" ? platformOS : "browser";
  const mac = os === "mac";

  const replyAction = actions.find((a) => a.reply);
  const face = preview && leading === "avatar";
  const heading = preview ? title : s("newMessage");
  const withContext = preview && context ? s("withContext", { label: heading, context }) : heading;
  const said = preview && body ? s("withBody", { label: withContext, body }) : withContext;
  const typing = !!replyAction && (replying === "typing" || replying === "sending");
  const status = !!replyAction && (replying === "sending" || replying === "failed");

  const press = (a: OsNotificationAction) => (a.reply ? setReplying("typing") : onAction?.(a));
  const send = () => {
    if (replyAction && draft && replying !== "sending") onAction?.(replyAction, draft);
  };

  const avatar = <Avatar name={sender} src={avatarSrc} size="md" identity={agent ? "agent" : identity} agent={agent} />;
  const titleText = (
    <span data-af-part="title" style={css(text, truncate(1), { flex: 1 }, TITLE[os], r.title)}>
      {heading}
    </span>
  );
  const subtitle =
    preview && context ? (
      <span data-af-part="subtitle" style={css(text, truncate(1), { lineHeight: "17px" }, r.subtitle)}>
        {context}
      </span>
    ) : null;
  const bodyText =
    preview && body ? (
      <span data-af-part="body" style={css(text, truncate(open ? 8 : 3), BODY[os], r.body)}>
        {lead && <span data-af-part="lead" style={r.lead}>{s("leadSuffix", { lead })}</span>}
        {body}
      </span>
    ) : null;
  const more =
    grouped > 0 ? (
      <span data-af-part="small" style={css(small, { marginTop: t.space["3xs"] }, r.small)}>
        {preview && context ? s("moreFrom", { count: grouped, context }) : s("more", { count: grouped })}
      </span>
    ) : null;
  // Windows draws what is at rest and the browser (expanded) the same; the Mac and Linux, expanded, draw them all.
  const buttons = (shown: OsNotificationAction[], motion: boolean) =>
    shown.length > 0 && (
      <div data-af-part="actions" style={css(row, { alignItems: "stretch" }, ACTIONS[os], partStyle(r, "actions", motion && enter("fade")))}>
        {shown.map((a) => (
          <ActionButton key={a.key} os={os} label={a.label} styles={styles} onPress={() => press(a)} />
        ))}
      </div>
    );
  const replyRow = (placeholder: string) => (
    <ReplyRow os={os} sender={sender} placeholder={placeholder} value={draft} sending={replying === "sending"} strings={strings} styles={styles} onChange={setDraft} onSend={send} />
  );

  return (
    <div data-af-part="root" {...rootProps(rest)} style={css(box, { width: WIDTH[os] }, r.root, style)}>
      <div data-af-part="card" style={css(CARD[os], partStyle(r, "card", mac && liquid && glass(), enter(os === "browser" ? "rise" : "slide-left")))}>
        {mac && open && <CloseButton os={os} label={s("closeNotification")} styles={styles} onPress={() => onClose?.()} />}
        {os !== "mac" && (
          <div style={css(row, { gap: t.space.sm }, os === "windows" && { padding: "10px 12px" }, os === "browser" && { padding: "10px 12px 4px" })}>
            <SmallIcon appName={appName} styles={styles} />
            {os === "browser" ? (
              <span data-af-part="source" style={css(small, truncate(1), { flex: 1 }, r.source)}>
                {origin ? s("sourceWeb", { app: appName, origin, time }) : s("sourceLinux", { app: appName, time })}
              </span>
            ) : (
              <>
                <span data-af-part="source" style={css(small, truncate(1), os === "linux" && { flex: 1 }, r.source)}>
                  {os === "linux" ? s("sourceLinux", { app: appName, time }) : appName}
                </span>
                <span style={{ flex: 1 }} />
              </>
            )}
            {os === "windows" && <CloseButton os={os} label={s("settings")} icon="ellipsis" styles={styles} onPress={() => onSettings?.()} />}
            <CloseButton os={os} label={s("closeNotification")} styles={styles} onPress={() => onClose?.()} />
          </div>
        )}
        <button
          type="button"
          data-af-press
          aria-label={said}
          onClick={() => {
            setOpen(!open);
            onOpen?.();
          }}
          {...hit.handlers}
          data-af-part="hit"
          style={css(pressable, { flexDirection: "row", alignItems: "flex-start", width: "100%", textAlign: "left" }, HIT[os], r.hit)}
        >
          {mac && face && (
            <span style={css(box, { flexShrink: 0, marginTop: t.border.wHairline })}>
              {avatar}
              {!agent && (
                <span aria-hidden data-af-part="badge" style={css(box, center, { position: "absolute", right: neg(t.space["2xs"]), bottom: neg(t.space["2xs"]) }, partStyle(r, "badge", badgeEdge))}>
                  <span data-af-part="mark" style={css(mark, r.mark)}>
                    {initial(appName)}
                  </span>
                </span>
              )}
            </span>
          )}
          {mac && !face && (
            <span aria-hidden data-af-part="appIcon" style={css(box, center, { flexShrink: 0, marginTop: t.border.wHairline }, r.appIcon)}>
              <span data-af-part="macMark" style={css(mark, r.macMark)}>
                {initial(appName)}
              </span>
            </span>
          )}
          {(os === "windows" || os === "linux") && face && <span style={css(box, { flexShrink: 0 })}>{avatar}</span>}
          <span style={content}>
            {mac ? (
              <span style={css(row, { alignItems: "baseline", gap: t.space.sm })}>
                {titleText}
                <span data-af-part="time" style={css(small, { flexShrink: 0, fontVariantNumeric: "tabular-nums" }, r.time)}>
                  {time}
                </span>
              </span>
            ) : (
              titleText
            )}
            {os !== "windows" && subtitle}
            {bodyText}
            {more}
            {os === "windows" && preview && context !== "" && (
              <span data-af-part="context" style={css(small, { marginTop: t.space["2xs"] }, r.context)}>
                {context}
              </span>
            )}
          </span>
          {os === "browser" && face && <span style={css(box, { flexShrink: 0 })}>{avatar}</span>}
        </button>
        {os === "windows" ? (
          <>
            {/* A Windows toast always shows its reply box and the buttons at rest. */}
            {replyAction && replying !== "failed" && replyRow(s("typeReply"))}
            {(replying === "none" || replying === "typing" || !replyAction) && buttons(actions.filter((a) => a.rest), false)}
          </>
        ) : os === "browser" ? (
          // Browsers have no inline reply: a click that opens the conversation is the whole contract.
          open && buttons(actions.filter((a) => a.rest), true)
        ) : (
          <>
            {typing && replyRow(mac ? s("replyTo", { name: sender }) : s("replyPlaceholder"))}
            {open && replying === "none" && buttons(actions, true)}
          </>
        )}
        {os !== "browser" && status && <Status os={os} failed={replying === "failed"} appName={appName} strings={strings} styles={styles} />}
      </div>
      {mac && grouped > 0 && <Stack more={grouped > 1} liquid={liquid} styles={styles} />}
    </div>
  );
}

/** The slivers of the banners stacked under this one. */
function Stack({ more, liquid, styles }: { more: boolean; liquid: boolean; styles?: PartStyles<"os-notification"> }): ReactNode {
  const r = useRecipe(recipes["os-notification"], { styles });
  const sliver = (part: "sliver" | "sliverFar", width: string, height: number, radius: number, opacity = 1) => (
    <span
      data-af-part={part}
      style={css(
        { display: "block", width, height, opacity, ...blur(30) },
        // The open top and the rounded bottom corners come after the recipe's edge.
        partStyle(r, part, { borderTopWidth: 0, borderBottomLeftRadius: radius, borderBottomRightRadius: radius }, liquid && glass()),
      )}
    />
  );
  return (
    <div aria-hidden style={css(box, { alignItems: "center", marginTop: neg(t.border.wHairline) })}>
      {sliver("sliver", "93%", 9, 12)}
      {more && sliver("sliverFar", "86%", 7, 10, 0.8)}
    </div>
  );
}
