import { useEffect, useRef } from "react";
import { Text, View, type ViewStyle } from "react-native";
import { recipes, usePending, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { announce } from "../../lib/a11y";
import { Icon, Spinner } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Button } from "../actions/button";

export type SessionStateState = "expired" | "waiting" | "locked" | "suspended" | "signed-out";

export interface SessionStateProps extends RootProps {
  /** waiting = the sign-in sheet has them. locked = the phone's app lock. */
  state?: SessionStateState;
  /** "Face ID", "Touch ID", "Fingerprint" or "Face unlock": the OS's own name. */
  biometric?: string;
  biometricAvailable?: boolean;
  /** The lock was just passed: the tile turns to an open lock in success green and the buttons go. */
  unlocked?: boolean;
  /** Why the last attempt did not sign anyone in: the platform layer's sentence, verbatim. */
  error?: string;
  /** No backend answering: Sign in would do nothing, so the card says so. */
  offline?: boolean;
  /** Reports the request; Sign in spins until the app answers with `state` (waiting), `error` or `offline`, or the returned promise settles. */
  onSignIn?: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** Reports the request; Unlock spins until the app answers with `unlocked` (or `error`), or the returned promise settles. */
  onUnlock?: () => void | Promise<unknown>;
  onSignOut?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, tile: {…}, title: {…}, actions: {…} }`. */
  styles?: PartStyles<"session-state">;
  /** This card's built-in text (the titles, the prose, the buttons) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["session-state"]>;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (fill, ink, type, the card, the tile) is the recipe's. The prose's measure is `proseMaxW` (see the recipe). */
const useStyles = createStyles((t) => ({
  root: { maxWidth: "100%", alignItems: "center", paddingTop: t.space["2xl"], paddingBottom: t.space.xl },
  tile: { alignItems: "center", justifyContent: "center", marginBottom: t.space.xs },
  title: { textAlign: "center" },
  body: { textAlign: "center" },
  wait: { flexDirection: "row", alignItems: "center", marginTop: t.space["2xs"] },
  note: { textAlign: "center" },
  actions: { alignSelf: "stretch", marginTop: t.space.md },
}));

/** An icon's size is its width and height (`size`); what else a part's style sets goes on the glyph. */
const glyphBox = (view: ViewStyle) => {
  const { width, height: _h, ...rest } = view;
  return { size: width as number, rest: Object.keys(rest).length ? rest : undefined };
};

export function SessionState({
  state = "expired",
  biometric = "Face ID",
  biometricAvailable = true,
  unlocked = false,
  error = "",
  offline = false,
  onSignIn,
  onCancel,
  onUnlock,
  onSignOut,
  styles,
  strings,
  style,
  testID,
  ...rest
}: SessionStateProps) {
  const s = useStyles();
  const str = useStrings("session-state", strings);
  // Sign in and Unlock report the request and spin until the app answers with a new `state`, `unlocked`, `error` or `offline` (or the
  // promise settles): the card never shows waiting, or the open lock, before the app says so.
  const { pending, run } = usePending([state, unlocked, error, offline]);
  const open = state === "locked" && unlocked;
  const title = {
    expired: str("titleExpired"),
    waiting: str("titleWaitingPhone"),
    locked: unlocked ? str("titleUnlocked") : str("titleLocked"),
    suspended: str("titleSuspended"),
    "signed-out": str("titleSignedOut"),
  }[state];
  const body = {
    expired: str("bodyExpired"),
    waiting: str("bodyWaitingPhone"),
    locked: biometricAvailable ? str("bodyLockedBiometric", { biometric }) : str("bodyLockedPasscode"),
    suspended: str("bodySuspended"),
    "signed-out": str("bodySignedOutPhone"),
  }[state];
  const icon = {
    expired: "clock",
    waiting: "external-link",
    locked: unlocked ? "lock-open" : biometricAvailable ? "scan-face" : "lock",
    suspended: "user-x",
    "signed-out": "log-in",
  }[state];
  const r = useRecipe(recipes["session-state"], { variants: { state, unlocked: open }, styles });
  const titleStyle = partStyle(r, "title", { text: { letterSpacing: (r.title.text.fontSize as number) * -0.02 } });
  const waitText = partStyle(r, "waitText", { text: { color: r.wait.text.color } });
  const spinner = glyphBox(r.spinner.view);
  const signIn = () => run(onSignIn);
  // iOS has no live regions: a change of state is spoken (the new title), and the reason or error as it arrives.
  const was = useRef(state);
  useEffect(() => {
    if (was.current === state) return;
    was.current = state;
    announce(title);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const note = offline ? str("offline") : open ? "" : error;
  useEffect(() => {
    if (note) announce(note);
  }, [note]);
  return (
    <Enter {...rootProps(rest)} testID={partId(testID, "session-state", "root")} motion="pop" role="region" accessibilityLabel={title} style={[s.root, r.root.view, style]}>
      <View testID={partId(testID, "session-state", "tile")} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[s.tile, r.tile.view]}>
        <Icon name={icon} size={40} color={r.tile.text.color} />
      </View>
      <Text testID={partId(testID, "session-state", "title")} accessibilityRole="header" maxFontSizeMultiplier={fontScale.content} style={[s.title, titleStyle.view, titleStyle.text]}>
        {title}
      </Text>
      {open ? null : (
        <Text testID={partId(testID, "session-state", "body")} maxFontSizeMultiplier={fontScale.content} style={[s.body, r.body.view, r.body.text]}>
          {body}
        </Text>
      )}
      {state === "waiting" ? (
        <View testID={partId(testID, "session-state", "wait")} accessibilityState={{ busy: true }} style={[s.wait, r.wait.view]}>
          <Spinner testID={partId(testID, "session-state", "spinner")} decorative size={spinner.size} color={r.wait.text.color} style={spinner.rest} />
          <Text testID={partId(testID, "session-state", "waitText")} maxFontSizeMultiplier={fontScale.content} style={[waitText.view, waitText.text]}>
            {str("waitingBrowser")}
          </Text>
        </View>
      ) : null}
      {offline || (error && !open) ? (
        <Text testID={partId(testID, "session-state", "note")} maxFontSizeMultiplier={fontScale.content} style={[s.note, r.note.view, r.note.text]}>
          {offline ? str("offline") : error}
        </Text>
      ) : null}
      <View testID={partId(testID, "session-state", "actions")} style={[s.actions, r.actions.view]}>
        {state === "expired" || state === "signed-out" ? <Button label={str("signIn")} size="lg" full disabled={offline} loading={pending} onPress={signIn} /> : null}
        {state === "waiting" ? <Button label={str("cancel")} variant="ghost" size="lg" full onPress={() => onCancel?.()} /> : null}
        {state === "locked" && !unlocked ? (
          <Button
            label={biometricAvailable ? str("unlockWith", { biometric }) : str("usePasscode")}
            size="lg"
            full
            iconLeading={biometricAvailable ? "scan-face" : "keyboard"}
            loading={pending}
            onPress={() => run(onUnlock)}
          />
        ) : null}
        {state === "locked" && !unlocked ? <Button label={str("signOut")} variant="ghost" size="lg" full onPress={() => onSignOut?.()} /> : null}
        {state === "suspended" ? <Button label={str("useDifferentAccount")} variant="secondary" size="lg" full onPress={() => onSignOut?.()} /> : null}
      </View>
    </Enter>
  );
}
