import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, PixelRatio, Platform, Pressable, StyleSheet, Text, TextInput, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type IconActionItem, type Attachment, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { announce } from "../../lib/a11y";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { IconButton } from "../actions/icon-button";
import { AttachmentCard } from "./attachment-card";


export type ComposerMode = "default" | "editing" | "thread" | "offline" | "readonly" | "archived";

export interface ComposerProps extends RootProps {
  /** "Message #<channel>", "Message <person>", "Reply…" in a thread. Empty reads strings `placeholder`. */
  placeholder?: string;
  /** The draft. */
  value?: string;
  /** editing: one of your messages. thread: the reply box. offline: sends refused, draft kept. readonly / archived: a notice, no box. */
  mode?: ComposerMode;
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
  /** The Formatting button beside Attach. */
  formatting?: boolean;
  /** Attach. Disabled offline. */
  attach?: boolean;
  /** Emoji. */
  emoji?: boolean;
  /** Mention someone. */
  mention?: boolean;
  /** The commands button. Hidden while editing. */
  commands?: boolean;
  /** The mic beside Send. Hidden while editing, disabled offline. */
  record?: boolean;
  /** The product's own tools, drawn as icon buttons after the built-in ones. */
  tools?: IconActionItem[];
  /** The composer takes no input: the field and every tool are disabled. */
  disabled?: boolean;
  /** The most characters the field takes, enforced by the platform. Pair it with `lengthHint` to show how many are left. */
  maxLength?: number;
  /** Focuses the field when the composer mounts (after Reply or Edit opens it). */
  autoFocus?: boolean;
  /**
   * The composer lifts itself above the keyboard (a `KeyboardAvoidingView`, padding on iOS). Off by default: a screen that already
   * resizes for the keyboard (Android's `adjustResize`, a navigator, a sheet) must not do it twice. Home-indicator spacing is the
   * screen's (`SafeAreaView` or `useSafeAreaInsets` around the composer); the composer adds none of its own.
   */
  avoidKeyboard?: boolean;
  /** Draws the focused edge, as focusing the box does. */
  focused?: boolean;
  /** Called with the draft as it is typed, and with "" when Send clears it. */
  onValueChange?: (value: string) => void;
  /** Called with `alsoSend` as a tap on "Also send to" leaves it. */
  onAlsoSendChange?: (alsoSend: boolean) => void;
  onSend?: (text: string) => void;
  onCancelEdit?: () => void;
  /** The "Add to your message" sheet: Upload File, Upload Image, Take Photo. */
  onAttach?: () => void;
  /** The mic: the app's recorder takes it from here. */
  onRecord?: () => void;
  onEmoji?: () => void;
  onMention?: () => void;
  onCommands?: () => void;
  /** The Formatting button was pressed. */
  onFormatting?: () => void;
  /** A product tool was pressed. */
  onAction?: (action: IconActionItem) => void;
  /** A staged attachment's card was pressed (the preview). */
  onAttachmentOpen?: (attachment: Attachment) => void;
  /** A staged attachment's remove or cancel was pressed: take it out of `attachments`. */
  onAttachmentCancel?: (attachment: Attachment) => void;
  /** A failed attachment's Retry was pressed: start its upload again. */
  onAttachmentRetry?: (attachment: Attachment) => void;
  /** This composer's built-in text (its field, tools, notices and hints) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["composer"]>;
  /** Per-part styles over the theme: `{ root: {…}, card: {…}, input: {…}, counter: {…} }`. */
  styles?: PartStyles<"composer">;
  style?: ViewStyle;
}

/** Layout no token decides; the colours, sizes and type are the recipe's (`composer`). */
const useStyles = createStyles((t) => ({
  root: { width: "100%", maxWidth: "100%", paddingHorizontal: t.space.sm, paddingTop: t.space.xs, paddingBottom: t.space.sm },
  editBanner: { flexDirection: "row", alignItems: "center" },
  editText: { flex: 1 },
  editCancel: { justifyContent: "center" },
  offline: { flexDirection: "row", alignItems: "center" },
  offlineText: { flex: 1, minWidth: 0 },
  locked: { flexDirection: "row", alignItems: "center", paddingHorizontal: t.space.lg, paddingVertical: t.space.md },
  lockedBody: { flex: 1, minWidth: 0, gap: t.space["3xs"] },
  staged: { flexDirection: "row", flexWrap: "wrap", gap: t.space.xs, paddingTop: t.space.sm, paddingHorizontal: t.space.sm },
  input: { width: "100%", minHeight: 34, maxHeight: 112, paddingVertical: 7, paddingHorizontal: t.space.md, lineHeight: 20, textAlignVertical: "top" },
  footer: { flexDirection: "row", alignItems: "center", paddingBottom: t.space["2xs"], paddingHorizontal: t.space["2xs"] },
  bar: { width: 36, height: 36 },
  spacer: { flex: 1, minWidth: 0 },
  counter: { alignSelf: "flex-end", paddingRight: t.space.xs, paddingBottom: t.space.sm, fontVariant: ["tabular-nums"] },
  below: { flexDirection: "row", alignItems: "center", gap: t.space.md, minHeight: 20, paddingHorizontal: t.space.sm },
  checkRow: { flexDirection: "row", alignItems: "center" },
  checkBox: { alignItems: "center", justifyContent: "center" },
}));

/** An icon part's size is its width and height; what else `styles` sets on it goes on the glyph. */
const iconOf = (view: ViewStyle) => {
  const { width, height: _height, ...rest } = view;
  return { size: width as number, style: Object.keys(rest).length ? rest : undefined };
};

function CancelEdit({ onPress, strings, styles }: Pick<ComposerProps, "strings" | "styles"> & { onPress: () => void }) {
  const s = useStyles();
  const str = useStrings("composer", strings);
  const r = useRecipe(recipes.composer, { styles });
  const press = usePress();
  const cancel = partStyle(r, "cancel", { view: press.pressed ? { opacity: 0.6 } : undefined });
  return (
    <Pressable
      testID="composer.cancel"
      accessibilityRole="button"
      accessibilityLabel={str("cancelEdit")}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.editCancel, cancel.view]}
    >
      <Text testID="composer.cancelText" style={[r.cancelText.view, r.cancelText.text]}>
        {str("cancel")}
      </Text>
    </Pressable>
  );
}

function AlsoSend({ on, to, onToggle, strings, styles }: Pick<ComposerProps, "strings" | "styles"> & { on: boolean; to: string; onToggle: () => void }) {
  const s = useStyles();
  const str = useStrings("composer", strings);
  const press = usePress();
  const r = useRecipe(recipes.composer, { state: { on, focus: press.focused }, styles });
  return (
    <Pressable
      testID="composer.alsoSend"
      accessibilityRole="checkbox"
      accessibilityLabel={str("alsoSendTo", { to })}
      accessibilityState={{ checked: on }}
      onPress={() => onToggle()}
      {...press.handlers}
      style={[s.checkRow, r.alsoSend.view]}
    >
      <View testID="composer.alsoBox" style={[s.checkBox, r.alsoBox.view]}>
        {on ? (
          <Enter motion="pop">
            <Icon testID="composer.alsoTick" name="check" {...iconOf(r.alsoTick.view)} color={r.alsoBox.text.color} />
          </Enter>
        ) : null}
      </View>
      <Text numberOfLines={1} style={r.alsoSend.text}>
        {str.parts("alsoSendTo", { to })}
      </Text>
    </Pressable>
  );
}

export function Composer({
  placeholder = "",
  value,
  mode = "default",
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
  record = false,
  tools = [],
  focused = false,
  disabled = false,
  maxLength,
  autoFocus = false,
  avoidKeyboard = false,
  onValueChange,
  onAlsoSendChange,
  onSend,
  onCancelEdit,
  onAttach,
  onRecord,
  onEmoji,
  onMention,
  onCommands,
  onFormatting,
  onAction,
  onAttachmentOpen,
  onAttachmentCancel,
  onAttachmentRetry,
  strings,
  styles,
  style,
  testID,
  ...rest
}: ComposerProps) {
  const s = useStyles();
  const str = useStrings("composer", strings);
  const [draft = "", setDraft] = useControllable(value, onValueChange);
  const [also = false, setAlso] = useControllable(alsoSend, onAlsoSendChange);
  const [inside, setInside] = useState(false);

  const locked = mode === "readonly" || mode === "archived";
  const editing = mode === "editing";
  const offline = mode === "offline";
  const typed = draft.trim() !== "";
  const sendable = typed && !uploading && !tooLong && !offline && !disabled;
  // The counter is read at a few thresholds (100, 50, 10 left, then over), not on every keystroke.
  const left = /\d/.test(lengthHint) ? Number(lengthHint.replace(/[^\d]/g, "")) : null;
  const bucket = tooLong ? "over" : left === null ? "none" : left <= 10 ? "10" : left <= 50 ? "50" : left <= 100 ? "100" : "none";
  const lastBucket = useRef(bucket);
  useEffect(() => {
    if (lastBucket.current === bucket) return;
    lastBucket.current = bucket;
    if (bucket !== "none" && lengthHint) announce(lengthHint);
  }, [bucket, lengthHint]);
  // The field grows with Dynamic Type, within the platform's own cap, so a large size is not clipped to two lines.
  const scale = Math.min(PixelRatio.getFontScale(), fontScale.content);
  const box = StyleSheet.flatten(s.input);
  const grown = { minHeight: (box.minHeight as number) * scale, maxHeight: (box.maxHeight as number) * scale, lineHeight: (box.lineHeight as number) * scale };
  const r = useRecipe(recipes.composer, { variants: { mode }, state: { focus: inside || focused, invalid: tooLong }, styles });
  // `placeholderTextColor` is the TextInput's prop, not a style.
  const { placeholderTextColor, ...inputText } = r.input.text;
  const send = () => {
    // Send is disabled while a file uploads; a tap in that window says why (iOS has no live region for the hint).
    if (typed && uploading && !tooLong && !offline) announce(str("uploadWaiting"));
    if (!sendable) return;
    const words = draft;
    // Cleared in the same tick as the tap, so a double tap cannot send twice.
    setDraft("");
    onSend?.(words);
  };

  const body = (
    <View {...rootProps(rest)} testID={partId(testID, "composer", "root")} style={[s.root, r.root.view, style]}>
      {editing ? (
        <Enter motion="rise" testID="composer.editBanner" style={[s.editBanner, r.editBanner.view]}>
          <Icon testID="composer.editIcon" name="pencil" {...iconOf(r.editIcon.view)} color={r.editBanner.text.color} />
          <Text testID="composer.editLabel" style={[s.editText, r.editLabel.view, r.editLabel.text]}>
            {str("editing")}
          </Text>
          <CancelEdit onPress={() => onCancelEdit?.()} strings={strings} styles={styles} />
        </Enter>
      ) : null}
      {offline ? (
        <Enter motion="rise" testID="composer.offline" accessibilityLiveRegion="polite" style={[s.offline, r.offline.view]}>
          <Icon testID="composer.offlineIcon" name="wifi-off" {...iconOf(r.offlineIcon.view)} color={r.offlineIcon.text.color} />
          <Text style={[r.offline.text, s.offlineText]}>{str("offline")}</Text>
        </Enter>
      ) : null}
      {locked ? (
        <View testID="composer.locked" accessible accessibilityRole="summary" style={[s.locked, r.locked.view]}>
          <Icon testID="composer.lockedIcon" name={mode === "archived" ? "archive" : "lock"} {...iconOf(r.lockedIcon.view)} color={r.lockedIcon.text.color} />
          <View style={s.lockedBody}>
            <Text testID="composer.lockedTitle" style={[r.lockedTitle.view, r.lockedTitle.text]}>
              {mode === "archived" ? str("archivedTitle") : str("readonlyTitle")}
            </Text>
            <Text testID="composer.lockedDetail" style={[r.lockedDetail.view, r.lockedDetail.text]}>
              {mode === "archived" ? str("archivedDetail") : str("readonlyDetail")}
            </Text>
          </View>
        </View>
      ) : null}
      {!locked ? (
        <View testID="composer.card" style={r.card.view}>
          {attachments.length > 0 ? (
            <View accessibilityLabel={str("attachedFiles")} style={s.staged}>
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
                  onCancel={() => onAttachmentCancel?.(a)}
                  onRetry={onAttachmentRetry ? () => onAttachmentRetry(a) : undefined}
                  // The attachment's own `status` is the truth: the card does not move to uploading before the app says so.
                  onStatusChange={onAttachmentRetry ? () => {} : undefined}
                />
              ))}
            </View>
          ) : null}
          <TextInput
            multiline
            value={draft}
            placeholder={placeholder || str("placeholder")}
            testID="composer.input"
            placeholderTextColor={placeholderTextColor}
            editable={!disabled}
            maxLength={maxLength}
            autoFocus={autoFocus}
            accessibilityLabel={editing ? str("inputEdit") : mode === "thread" ? str("inputThread") : str("input")}
            accessibilityHint={placeholder || str("placeholder")}
            onChangeText={(v) => setDraft(v)}
            onFocus={() => setInside(true)}
            onBlur={() => setInside(false)}
            style={[s.input, grown, r.input.view, inputText]}
          />
          <View style={s.footer}>
            {attach ? <IconButton icon="plus" label={str("attachPhone")} disabled={offline || disabled} onPress={() => onAttach?.()} style={s.bar} /> : null}
            {formatting ? <IconButton icon="type" label={str("formatting")} disabled={disabled} onPress={() => onFormatting?.()} style={s.bar} /> : null}
            {emoji ? <IconButton icon="smile" label={str("emojiPhone")} disabled={disabled} onPress={() => onEmoji?.()} style={s.bar} /> : null}
            {mention ? <IconButton icon="at-sign" label={str("mention")} disabled={disabled} onPress={() => onMention?.()} style={s.bar} /> : null}
            {commands && !editing ? <IconButton icon="slash" label={str("commandsPhone")} disabled={disabled} onPress={() => onCommands?.()} style={s.bar} /> : null}
            {tools.map((a) => (
              <IconButton key={a.key} icon={a.icon} label={a.label} badge={a.badge} disabled={a.disabled || disabled} onPress={() => onAction?.(a)} style={s.bar} />
            ))}
            <View style={s.spacer} />
            {lengthHint ? (
              <Text testID="composer.counter" accessibilityElementsHidden importantForAccessibility="no" style={[s.counter, r.counter.view, r.counter.text]}>
                {lengthHint}
              </Text>
            ) : null}
            {record && !editing ? <IconButton icon="mic" label={str("record")} disabled={offline || disabled} onPress={() => onRecord?.()} style={s.bar} /> : null}
            <IconButton icon={editing ? "check" : "send"} label={editing ? str("save") : str("sendMessage")} variant={sendable ? "solid" : "ghost"} disabled={!sendable} onPress={send} style={s.bar} />
          </View>
        </View>
      ) : null}
      {mode === "thread" || uploading ? (
        <View style={s.below}>
          {mode === "thread" ? <AlsoSend on={also} to={alsoSendTo || str("conversation")} onToggle={() => setAlso(!also)} strings={strings} styles={styles} /> : null}
          {uploading ? (
            <Text testID="composer.hint" accessibilityLiveRegion="polite" style={[r.hint.view, r.hint.text]}>
              {str("uploadWaiting")}
            </Text>
          ) : null}
          <View style={s.spacer} />
        </View>
      ) : null}
    </View>
  );
  return avoidKeyboard ? <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>{body}</KeyboardAvoidingView> : body;
}
