import { useState, type ReactNode } from "react";
import { Platform, Pressable, Text, TextInput, View, type TextStyle, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type ActionItem, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { useAnnounce } from "../../lib/a11y";
import { GlassSurface } from "../../lib/glass";
import { Icon, Spinner, type IconName } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { Avatar, type AvatarIdentity } from "../display/avatar";

export type OsNotificationLeading = "avatar" | "tile";
export type OsNotificationReply = "none" | "typing" | "sending" | "failed";

/** A button of the banner, at most two. */
export interface OsNotificationAction extends ActionItem {
  /** Opens the inline reply instead of reporting; the text typed comes back with the press. */
  reply?: boolean;
  /** Shown before the banner is expanded, where the OS shows actions at rest. */
  rest?: boolean;
}

export interface OsNotificationProps extends RootProps {
  /** The app's name, which the OS draws in its header; its first letter is the small mark. */
  appName: string;
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
  /** iOS subtitle, Android sub-text. Empty for a DM. */
  context?: string;
  time?: string;
  /** avatar is the sender's face. tile is the app's own icon, for an event that has no sender. */
  leading?: OsNotificationLeading;
  /** The sender is an agent: its face, and no badge. */
  agent?: boolean;
  /** Words before the body: "Mentioned you". */
  lead?: string;
  /** The banner's buttons: the action sheet on iOS (each with its `icon`), the labels under the body on Android. The one that `reply`s opens the inline reply. */
  actions?: OsNotificationAction[];
  /** false is "Hide message previews": "New message", and no body, sender or context. */
  preview?: boolean;
  /** How many more are stacked under this one from the same conversation. */
  grouped?: number;
  /** Long-pressed on iOS (the menu under the banner), the chevron opened on Android. Pressing the banner toggles it. */
  expanded?: boolean;
  /** An inline reply typed into the notification itself. Reply opens it. */
  reply?: OsNotificationReply;
  replyText?: string;
  onOpen?: () => void;
  /** An action was pressed: the item, and for a reply the text sent with it. */
  onAction?: (action: OsNotificationAction, text?: string) => void;
  /** This banner's built-in text (the reply field, the status, the header line) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["os-notification"]>;
  /** Per-part styles over the theme: `{ card: {…}, title: {…} }`. */
  styles?: PartStyles<"os-notification">;
  style?: ViewStyle;
}

type Phone = "ios" | "android";

const FACE: Record<Phone, string> = {
  ios: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", sans-serif",
  android: "\"Google Sans Text\", Roboto, system-ui, sans-serif",
};

/**
 * The OS draws the banner in its own face, not Figtree. On a device that is the system font, which
 * has every weight (unlike the app's one-file-per-weight fonts), so it takes fontWeight.
 */
const face = (os: Phone, weight: TextStyle["fontWeight"] = "400"): TextStyle => (Platform.OS === "web" ? { fontFamily: FACE[os], fontWeight: weight } : { fontWeight: weight });

/** The OS blurs what is under its banners; through React Native Web the catalogue can too. */
const blur: ViewStyle | null = Platform.OS === "web" ? ({ backdropFilter: "blur(30px)" } as ViewStyle) : null;

/** The first letter of the app's name: its mark. */
const initial = (name: string) => Array.from(name)[0] ?? "";

/** Layout and the OS's own faces and blur; the colours, sizes and radii are the recipe's (`osNotification`, under `ios` and `android`). */
const useStyles = createStyles((t) => ({
  front: { zIndex: 1 },
  ios: { ...blur },
  android: { padding: t.space.lg },
  hit: { flexDirection: "row", alignItems: "flex-start" },
  hitAndroid: { flexDirection: "column", alignItems: "stretch" },
  content: { flex: 1, minWidth: 0, gap: 1 }, /* structural: 1px optical gap between title and body */
  headRow: { flexDirection: "row", alignItems: "baseline", gap: t.space.sm },
  title: { flex: 1 },
  avatarSlot: { flexShrink: 0, marginTop: t.border.width.hairline },
  largeIcon: { flexShrink: 0 },
  appIcon: { marginTop: t.border.width.hairline, alignItems: "center", justifyContent: "center" },
  appBadge: { position: "absolute", right: -t.space["2xs"], bottom: -t.space["2xs"], alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: t.space.sm },
  smallIcon: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: t.space.md },
  replyRow: { flexDirection: "row", alignItems: "center", gap: t.space.xs },
  field: { flex: 1 },
  send: { alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", gap: t.space["2xl"], paddingTop: t.space["2xs"] },
  action: { alignItems: "center", justifyContent: "center" },
  status: { flexDirection: "row", alignItems: "center", gap: t.space.xs },
  menu: { alignSelf: "flex-end", marginTop: t.space.sm },
  menuSheet: { overflow: "hidden", ...blur },
  menuRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stack: { alignItems: "center", marginTop: -t.border.width.hairline },
  sliver: { borderTopWidth: 0, ...blur },
}));

function MenuRow({ label, icon, last, styles, testID, onPress }: { label: string; icon?: IconName; last: boolean; styles?: PartStyles<"os-notification">; testID?: string; onPress: () => void }) {
  const s = useStyles();
  const press = usePress();
  const r = useRecipe(recipes["os-notification"], { state: { pressed: press.pressed, focus: press.focused }, styles });
  // The row's rule is its bottom edge alone: the recipe's width and colour, on that side; the last row has none.
  const row = partStyle(r, "menuRow", { view: last ? { borderBottomWidth: 0 } : undefined });
  return (
    <Pressable testID={partId(testID, "os-notification", "menuRow")} accessibilityRole="menuitem" accessibilityLabel={label} onPress={() => onPress()} {...press.handlers} style={[s.menuRow, row.view]}>
      <Text testID={partId(testID, "os-notification", "menuText")} numberOfLines={1} style={[face("ios"), { flexShrink: 1 }, r.menuText.view, r.menuText.text]}>
        {label}
      </Text>
      {icon ? <Icon name={icon} size={18} color={r.menuText.text.color} /> : null}
    </Pressable>
  );
}

function ActionButton({ label, disabled = false, styles, testID, onPress }: { label: string; disabled?: boolean; styles?: PartStyles<"os-notification">; testID?: string; onPress: () => void }) {
  const s = useStyles();
  const press = usePress({ disabled });
  const r = useRecipe(recipes["os-notification"], { state: { focus: press.focused, disabled: press.disabled }, styles });
  return (
    <Pressable testID={partId(testID, "os-notification", "action")} accessibilityRole="button" accessibilityLabel={label} accessibilityState={press.disabled ? { disabled: true } : undefined} disabled={press.disabled} onPress={() => onPress()} {...press.handlers} style={[s.action, r.action.view]}>
      <Text testID={partId(testID, "os-notification", "actionText")} numberOfLines={1} style={[face("android", "600"), r.actionText.view, r.actionText.text]}>
        {label}
      </Text>
    </Pressable>
  );
}

interface ReplyProps {
  os: Phone;
  sender: string;
  value: string;
  sending: boolean;
  strings?: Partial<KitStrings["os-notification"]>;
  styles?: PartStyles<"os-notification">;
  testID?: string;
  onChange: (text: string) => void;
  onSend: () => void;
}

function ReplyRow({ os, sender, value, sending, strings, styles, testID, onChange, onSend }: ReplyProps) {
  const s = useStyles();
  const str = useStrings("os-notification", strings);
  const [focused, setFocused] = useState(false);
  const press = usePress({ disabled: !value || sending });
  const r = useRecipe(recipes["os-notification"], { state: { focus: focused, disabled: sending }, styles });
  const rSend = useRecipe(recipes["os-notification"], { state: { focus: press.focused, disabled: press.disabled }, styles });
  const ios = os === "ios";
  const side = ios ? 36 : 40;
  const field = partStyle(r, "replyField", { view: ios ? undefined : { borderWidth: 0 }, text: face(os) });
  const send = partStyle(rSend, "sendButton", { view: { width: side, height: side } });
  // `placeholderTextColor` is the TextInput's prop, not a style.
  const { placeholderTextColor, ...fieldText } = field.text;
  const ink = rSend.sendButton.text.color;
  return (
    <View style={s.replyRow}>
      <TextInput
        testID={partId(testID, "os-notification", "replyField")}
        value={value}
        placeholder={str("replyPlaceholder")}
        placeholderTextColor={placeholderTextColor}
        accessibilityLabel={str("replyTo", { name: sender })}
        editable={!sending}
        onChangeText={onChange}
        onSubmitEditing={() => onSend()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[s.field, field.view, fieldText]}
      />
      <Pressable
        testID={partId(testID, "os-notification", "sendButton")}
        accessibilityRole="button"
        accessibilityLabel={str("send")}
        accessibilityState={{ disabled: press.disabled, busy: sending }}
        disabled={press.disabled}
        onPress={() => onSend()}
        {...press.handlers}
        style={[s.send, send.view]}
      >
        {sending ? <Spinner size={14} color={ink} label={str("sending")} /> : <Icon name="send" size={ios ? 15 : 20} color={ink} />}
      </Pressable>
    </View>
  );
}

function Status({ os, failed, appName, strings, styles, testID }: { os: Phone; failed: boolean; appName: string; strings?: Partial<KitStrings["os-notification"]>; styles?: PartStyles<"os-notification">; testID?: string }) {
  const s = useStyles();
  const str = useStrings("os-notification", strings);
  const r = useRecipe(recipes["os-notification"], { state: { invalid: failed }, styles });
  // The line is said when it arrives and when sending turns to failed (iOS has no live regions).
  useAnnounce(failed ? str("replyFailed", { app: appName }) : str("sendingText"), { initial: true });
  return (
    <View style={s.status}>
      {failed ? <Icon testID={partId(testID, "os-notification", "statusIcon")} name="circle-alert" size={14} color={r.statusIcon.text.color} style={Object.keys(r.statusIcon.view).length ? r.statusIcon.view : undefined} /> : null}
      <Text testID={partId(testID, "os-notification", "statusText")} style={[face(os), { flexShrink: 1 }, r.statusText.view, r.statusText.text]}>
        {failed ? str("replyFailed", { app: appName }) : str("sendingText")}
      </Text>
    </View>
  );
}

export function OsNotification({
  appName,
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
  onAction,
  strings,
  styles,
  style,
  testID,
  ...rest
}: OsNotificationProps) {
  const { t, os } = useTheme();
  const s = useStyles();
  const str = useStrings("os-notification", strings);
  const r = useRecipe(recipes["os-notification"], { state: { focus: false }, styles });
  // The OS owns these: pressing the banner reveals the actions, Reply opens the field, and nothing reports them back.
  const [open, setOpen] = useControllable(expanded);
  const [replying, setReplying] = useControllable(reply);
  const [draft, setDraft] = useControllable(replyText);
  const hit = usePress();
  const rHit = useRecipe(recipes["os-notification"], { state: { focus: hit.focused }, styles });
  const ios = os === "ios";

  const replyAction = actions.find((a) => a.reply);
  const showFace = preview && leading === "avatar";
  const heading = preview ? title : str("newMessage");
  const withContext = preview && context ? str("withContext", { label: heading, context }) : heading;
  const said = preview && body ? str("withBody", { label: withContext, body }) : withContext;
  const typing = !!replyAction && (replying === "typing" || replying === "sending");
  const status = !!replyAction && (replying === "sending" || replying === "failed");

  const press = (a: OsNotificationAction) => (a.reply ? setReplying("typing") : onAction?.(a));
  const send = () => {
    if (replyAction && draft && replying !== "sending") onAction?.(replyAction, draft);
  };

  const avatar = <Avatar name={sender} src={avatarSrc} size="md" identity={agent ? "agent" : identity} agent={agent} />;
  const mark = (size: number) => {
    const m = partStyle(r, "mark", { text: { fontSize: size, lineHeight: size } });
    return (
      <Text testID={partId(testID, "os-notification", "mark")} style={[m.view, m.text]}>
        {initial(appName)}
      </Text>
    );
  };
  const titleText = (
    <Text testID={partId(testID, "os-notification", "title")} numberOfLines={1} style={[s.title, face(os, ios ? "600" : "500"), r.title.view, r.title.text]}>
      {heading}
    </Text>
  );
  const bodyText =
    preview && body ? (
      <Text testID={partId(testID, "os-notification", "body")} numberOfLines={open ? 8 : 3} style={[face(os), { fontSize: ios ? 15 : 14 }, r.body.view, r.body.text]}>
        {lead ? (
          <Text testID={partId(testID, "os-notification", "lead")} style={[face(os, "500"), r.lead.view, r.lead.text]}>{str("leadSuffix", { lead })}</Text>
        ) : null}
        {body}
      </Text>
    ) : null;
  const more =
    grouped > 0 ? (
      <Text testID={partId(testID, "os-notification", "small")} style={[face(os), { marginTop: t.space["3xs"], fontSize: ios ? 13 : 12 }, r.small.view, r.small.text]}>
        {preview && context ? str("moreFrom", { count: grouped, context }) : str("more", { count: grouped })}
      </Text>
    ) : null;
  const replyRow = typing ? <ReplyRow os={os} sender={sender} value={draft} sending={replying === "sending"} strings={strings} styles={styles} testID={testID} onChange={setDraft} onSend={send} /> : null;
  const statusRow = status ? <Status os={os} failed={replying === "failed"} appName={appName} strings={strings} styles={styles} testID={testID} /> : null;
  const banner = (children: ReactNode) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={said}
      onPress={() => {
        setOpen(!open);
        onOpen?.();
      }}
      {...hit.handlers}
      testID={partId(testID, "os-notification", "hit")}
      style={[ios ? s.hit : s.hitAndroid, rHit.hit.view]}
    >
      {children}
    </Pressable>
  );

  if (!ios) {
    return (
      <View {...rootProps(rest)} testID={partId(testID, "os-notification", "root")} style={[r.root.view, style]}>
        <Enter motion="drop" style={s.front}>
          <View testID={partId(testID, "os-notification", "card")} style={[s.android, r.card.view]}>
            {banner(
              <>
                <View style={s.header}>
                  <View testID={partId(testID, "os-notification", "smallIcon")} aria-hidden style={[s.smallIcon, r.smallIcon.view]}>
                    {mark(10)}
                  </View>
                  <Text testID={partId(testID, "os-notification", "source")} numberOfLines={1} style={[face(os), { flex: 1 }, r.source.view, r.source.text]}>
                    {preview && context ? str("sourcePhoneIn", { app: appName, context, time }) : str("sourcePhone", { app: appName, time })}
                  </Text>
                  <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color={t.color.text.muted} />
                </View>
                <View style={s.row}>
                  <View style={s.content}>
                    {titleText}
                    {bodyText}
                    {more}
                  </View>
                  {showFace ? <View style={s.largeIcon}>{avatar}</View> : null}
                </View>
              </>,
            )}
            {replyRow}
            {/* Android 12+ draws action labels as written; there is no menu, they sit under the body. */}
            {(replying === "none" || replying === "failed") && actions.length > 0 ? (
              <View style={s.actions}>
                {actions.map((a) => (
                  <ActionButton key={a.key} label={a.label} disabled={a.disabled} styles={styles} testID={testID} onPress={() => press(a)} />
                ))}
              </View>
            ) : null}
            {statusRow}
          </View>
        </Enter>
      </View>
    );
  }

  const sliver = partStyle(r, "sliver", { view: { width: "93%" } });
  const sliverFar = partStyle(r, "sliverFar", { view: { width: "86%", opacity: 0.8 } });
  return (
    <View {...rootProps(rest)} testID={partId(testID, "os-notification", "root")} style={[r.root.view, style]}>
      <Enter motion="drop" style={s.front}>
        <GlassSurface testID={partId(testID, "os-notification", "card")} style={[s.ios, r.card.view]} glassStyle={styles?.card}>
          {banner(
            <>
              {showFace ? (
                <View style={s.avatarSlot}>
                  {avatar}
                  {!agent ? (
                    <View testID={partId(testID, "os-notification", "badge")} aria-hidden style={[s.appBadge, r.badge.view]}>
                      {mark(9)}
                    </View>
                  ) : null}
                </View>
              ) : (
                <View testID={partId(testID, "os-notification", "appIcon")} aria-hidden style={[s.appIcon, r.appIcon.view]}>
                  {mark(18)}
                </View>
              )}
              <View style={s.content}>
                <View style={s.headRow}>
                  {titleText}
                  <Text testID={partId(testID, "os-notification", "time")} style={[face(os), { flexShrink: 0, fontVariant: ["tabular-nums"] }, r.time.view, r.time.text]}>
                    {time}
                  </Text>
                </View>
                {preview && context ? (
                  <Text testID={partId(testID, "os-notification", "subtitle")} numberOfLines={1} style={[face(os, "600"), r.subtitle.view, r.subtitle.text]}>
                    {context}
                  </Text>
                ) : null}
                {bodyText}
                {more}
              </View>
            </>,
          )}
          {replyRow}
          {statusRow}
        </GlassSurface>
      </Enter>
      {/* Long-press: iOS pops a menu of the banner's actions under it. */}
      {open && replying === "none" && actions.length > 0 ? (
        <Enter motion="pop" testID={partId(testID, "os-notification", "menu")} accessibilityRole="menu" style={[s.menu, r.menu.view]}>
          <GlassSurface testID={partId(testID, "os-notification", "menuSheet")} style={[s.menuSheet, r.menuSheet.view]} glassStyle={styles?.menuSheet}>
            {actions.map((a, i) => (
              <MenuRow key={a.key} label={a.label} icon={a.icon} last={i === actions.length - 1} styles={styles} testID={testID} onPress={() => press(a)} />
            ))}
          </GlassSurface>
        </Enter>
      ) : null}
      {grouped > 0 ? (
        <View aria-hidden style={s.stack}>
          <GlassSurface testID={partId(testID, "os-notification", "sliver")} style={[s.sliver, sliver.view]} glassStyle={styles?.sliver} />
          {grouped > 1 ? <GlassSurface testID={partId(testID, "os-notification", "sliverFar")} style={[s.sliver, sliverFar.view]} glassStyle={styles?.sliverFar} /> : null}
        </View>
      ) : null}
    </View>
  );
}
