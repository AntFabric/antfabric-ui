import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, KeyboardAvoidingView, Modal, Platform, Pressable, Text, View, findNodeHandle, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { announce, useBackHandler } from "../../lib/a11y";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

export type DialogKind = "confirm" | "form";
export type DialogTone = "danger" | "primary";

export interface DialogProps extends RootProps {
  /** confirm: a decision about something already chosen. form: fields to fill. Both are a bottom sheet on the phone. */
  kind?: DialogKind;
  title: string;
  /** A line under a form dialog's title (web and desktop draw it; the phone's sheet title stands alone). */
  subtitle?: string;
  /** Names what will be lost, in specific words. */
  body?: string;
  /** The glyph tile of web and desktop. The phone has none: the title carries the question. */
  icon?: IconName;
  /** danger is the destructive button; primary for an approval, which must not look like a hazard. */
  tone?: DialogTone;
  /** A verb plus the object, never OK or Yes. */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Fields or anything else between the body and the buttons. */
  children?: ReactNode;
  /** The confirm is in flight: it spins, and Cancel and Close go quiet until it settles. Pressing the CTA sets it. */
  loading?: boolean;
  /** Why the last attempt failed. The sheet stays open; pressing the CTA again retries. */
  error?: string;
  /** The on-screen keyboard is up; the sheet sits on it. */
  keyboard?: boolean;
  /** Drawn in a Modal over the whole screen, above the app; off, it is drawn where it is mounted. */
  modal?: boolean;
  /** The handle, a press on the scrim and Android's back cancel it. Off for a step that must be answered with a button. */
  dismissible?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Per-part styles over the theme: `{ sheet: {…}, title: {…}, body: {…} }`. */
  styles?: PartStyles<"dialog">;
  /** This dialog's built-in text (the button words, the handle's and close button's names, the keyboard stand-in) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["dialog"]>;
  style?: ViewStyle;
}

/** An icon's size is its width and height (`size`); what else a part's style sets goes on the glyph. */
const glyphBox = (view: ViewStyle) => {
  const { width, height: _h, ...rest } = view;
  return { size: width as number, rest: Object.keys(rest).length ? rest : undefined };
};

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  scrim: { alignSelf: "flex-start", width: 375, maxWidth: "100%", justifyContent: "flex-end", paddingTop: 160 }, /* structural: stage: a 375pt phone frame and room above the dialog */
  screen: { alignSelf: "stretch", width: "100%", flex: 1, paddingTop: 0 },
  backdrop: { flex: 1 },
  sheet: { paddingTop: t.space.md, paddingBottom: t.space.xl },
  handle: { alignSelf: "center", marginBottom: t.space.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.space.sm, marginBottom: t.space.lg },
  title: { flexShrink: 1 },
  content: { gap: t.space.md },
  error: { flexDirection: "row", alignItems: "flex-start", gap: t.space.xs, marginBottom: t.space.md, padding: t.space.sm },
  errorText: { flex: 1 },
  actions: { gap: t.space.sm },
  keyboard: { height: 291, alignItems: "center", justifyContent: "center" }, /* structural: stage: the height of the iPhone keyboard the demo stands in for */
}));

export function Dialog({
  kind = "confirm",
  title,
  body = "",
  tone = "danger",
  confirmLabel,
  cancelLabel,
  children,
  loading = false,
  error = "",
  keyboard = false,
  modal = false,
  dismissible = true,
  onConfirm,
  onCancel,
  styles,
  strings,
  style,
  testID,
  ...rest
}: DialogProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("dialog", strings);
  const r = useRecipe(recipes.dialog, { styles });
  const errorIcon = glyphBox(partStyle(r, "errorIcon", { view: { marginTop: t.space["3xs"] } }).view);
  const [busy, setBusy] = useControllable(loading);
  // A failure settles the request: the CTA is pressable again, to retry.
  const [failed, setFailed] = useState(error);
  if (failed !== error) {
    setFailed(error);
    if (error) setBusy(loading);
  }
  const cancel = () => !busy && onCancel?.();
  const confirm = () => {
    if (busy) return;
    setBusy(true);
    onConfirm?.();
  };
  // Android's back button cancels; a screen reader starts at the title when the dialog opens.
  useBackHandler(dismissible ? cancel : undefined);
  const heading = useRef<Text>(null);
  useEffect(() => {
    const node = Platform.OS === "web" || !heading.current ? null : findNodeHandle(heading.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  }, []);
  // An error that arrives is said: iOS has no live regions, so the alert role alone reads nothing.
  useEffect(() => {
    if (error) announce(error);
  }, [error]);
  // A form's fields are lifted above the keyboard; a confirm has none.
  const Lift = kind === "form" ? KeyboardAvoidingView : View;
  const drawn = (
    <Enter testID={partId(testID, "dialog", "root")} motion="fade" {...rootProps(rest)} style={[s.scrim, modal && s.screen, r.root.view, style]}>
      {modal ? <Pressable testID={partId(testID, "dialog", "backdrop")} accessible={false} style={s.backdrop} onPress={() => dismissible && cancel()} /> : null}
      <Lift {...(kind === "form" ? { behavior: Platform.OS === "ios" ? ("padding" as const) : undefined } : null)}>
      <Enter
        testID={partId(testID, "dialog", "sheet")}
        motion="slide-up"
        role={kind === "confirm" ? "alertdialog" : "dialog"}
        aria-modal
        accessibilityViewIsModal
        accessibilityLabel={title}
        onAccessibilityEscape={() => dismissible && cancel()}
        style={[s.sheet, r.sheet.view]}
      >
        <Pressable testID={partId(testID, "dialog", "handle")} accessibilityRole="button" accessibilityLabel={str("dismiss")} hitSlop={12} disabled={busy} onPress={() => dismissible && cancel()} style={[s.handle, r.handle.view]} />
        <View style={s.header}>
          <Text ref={heading} testID={partId(testID, "dialog", "title")} accessibilityRole="header" numberOfLines={2} style={[s.title, r.title.view, r.title.text]}>
            {title}
          </Text>
          <IconButton icon="x" label={str("close")} disabled={busy} onPress={() => cancel()} />
        </View>
        {body ? <Text testID={partId(testID, "dialog", "body")} style={[r.body.view, r.body.text]}>{body}</Text> : null}
        {children ? (
          <View style={s.content}>{typeof children === "string" || typeof children === "number" ? <Text testID={partId(testID, "dialog", "body")} style={[r.body.view, r.body.text]}>{children}</Text> : children}</View>
        ) : null}
        {error ? (
          <View testID={partId(testID, "dialog", "error")} accessibilityRole="alert" style={[s.error, r.error.view]}>
            <Icon testID={partId(testID, "dialog", "errorIcon")} name="circle-alert" size={errorIcon.size} color={r.errorIcon.text.color ?? r.error.text.color} style={errorIcon.rest} />
            <Text testID={partId(testID, "dialog", "errorText")} style={[s.errorText, r.errorText.view, r.errorText.text]}>{error}</Text>
          </View>
        ) : null}
        {/* The CTA first and Cancel under it, where the thumb rests after reading. */}
        <View style={s.actions}>
          <Button label={confirmLabel ?? str("confirm")} variant={tone === "danger" ? "danger" : "primary"} size="lg" full loading={busy} onPress={() => confirm()} />
          <Button label={cancelLabel ?? str("cancel")} variant="secondary" size="lg" full disabled={busy} onPress={() => cancel()} />
        </View>
        {keyboard ? null : <View testID={partId(testID, "dialog", "home")} style={r.home.view} />}
      </Enter>
      </Lift>
      {keyboard ? (
        <View testID={partId(testID, "dialog", "keyboard")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.keyboard, r.keyboard.view]}>
          <Text testID={partId(testID, "dialog", "keyboardLabel")} style={[r.keyboardLabel.view, r.keyboardLabel.text]}>{str("keyboard")}</Text>
        </View>
      ) : null}
    </Enter>
  );
  if (!modal) return drawn;
  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => dismissible && cancel()} supportedOrientations={["portrait", "landscape"]}>
      {drawn}
    </Modal>
  );
}
