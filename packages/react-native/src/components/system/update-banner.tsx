import { useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, Platform, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric-ui/core";
import { createStyles, useTheme } from "../../theme";
import { announce, useBackHandler } from "../../lib/a11y";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Button } from "../actions/button";

export type UpdateBannerStage = "available" | "downloading" | "installing" | "ready" | "failed" | "checking" | "latest" | "store-required";

export interface UpdateBannerProps extends RootProps {
  /** The phone: checking → downloading → ready, or latest, failed, or store-required for a native change. */
  stage?: UpdateBannerStage;
  version: string;
  /** The updater's own sentence, verbatim. Default: the `errorDefault` string. */
  error?: string;
  /** The running bundle's version (expoConfig.version). */
  appVersion: string;
  /** The Restart to apply? sheet is open. */
  confirm?: boolean;
  /** Called with `stage` as Check again leaves it (checking). */
  onStageChange?: (stage: UpdateBannerStage) => void;
  /** Open the store for a store-required version. */
  onApply?: () => void;
  /** Restart now: reload onto the downloaded update. */
  onRestart?: () => void;
  onCheck?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, card: {…}, versionRow: {…}, sheet: {…} }`. */
  styles?: PartStyles<"update-banner">;
  /** This card's built-in text (the version line, the notes, the buttons, the restart sheet) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["update-banner"]>;
  style?: ViewStyle;
}

/** A drag down past this far (or a flick) puts the sheet away, as Later does. */
const DISMISS = 80;

/** Layout no token decides; what the tokens decide (fills, edges, type, the tile, the grabber, insets) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { maxWidth: "100%" },
  versionRow: { flexDirection: "row", alignItems: "center" },
  versionTile: { alignItems: "center", justifyContent: "center" },
  versionText: { flex: 1 },
  sheet: { paddingTop: t.space.xs, paddingBottom: t.space["2xl"] },
  grabber: { alignSelf: "center", marginBottom: t.space.sm },
  sheetBody: { marginBottom: t.space.md },
}));

/** An icon's size is its width and height (`size`); what else a part's style sets goes on the glyph. */
const glyphBox = (view: ViewStyle) => {
  const { width, height: _h, ...rest } = view;
  return { size: width as number, rest: Object.keys(rest).length ? rest : undefined };
};

/** The sheet follows a downward drag and puts itself away past DISMISS, or springs back. */
function useSwipeDown(onDismiss: () => void) {
  const y = useRef(new Animated.Value(0)).current;
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  const pan = useMemo(() => {
    const native = Platform.OS !== "web";
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && g.dy > Math.abs(g.dx),
      onPanResponderMove: (_, g) => y.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS || g.vy > 0.8) dismiss.current();
        Animated.spring(y, { toValue: 0, useNativeDriver: native, bounciness: 0 }).start();
      },
      onPanResponderTerminate: () => Animated.spring(y, { toValue: 0, useNativeDriver: native, bounciness: 0 }).start(),
    });
  }, [y]);
  return { y, handlers: pan.panHandlers };
}

export function UpdateBanner({
  stage = "available",
  version,
  error,
  appVersion,
  confirm: confirmProp = false,
  onStageChange,
  onApply,
  onRestart,
  onCheck,
  styles,
  strings,
  style,
  testID,
  ...rest
}: UpdateBannerProps) {
  const { os } = useTheme();
  const s = useStyles();
  const str = useStrings("update-banner", strings);
  const r = useRecipe(recipes["update-banner"], { styles });
  // Check for updates moves the card to checking at once; Restart to apply opens the sheet and Later puts it away.
  const [current, setStage] = useControllable(stage, onStageChange);
  const [confirm, setConfirm] = useControllable(confirmProp);
  const swipe = useSwipeDown(() => setConfirm(false));
  const busy = current === "checking" || current === "downloading" || current === "available";
  const store = os === "ios" ? str("storeApple") : str("storeGoogle");
  const versionIcon = glyphBox(r.versionIcon.view);
  // iOS has no live regions: a failure, the latest-version note and the store notice are spoken when they appear (a failure cuts in).
  const said = current === "failed" ? error || str("errorDefault") : current === "latest" ? str("latest") : current === "store-required" ? str("storeRequired", { version, store }) : "";
  useEffect(() => {
    if (said) announce(said);
  }, [said]);
  // Android's back button puts the restart sheet away, as Later does.
  useBackHandler(() => setConfirm(false), confirm);
  return (
    <View {...rootProps(rest)} testID={partId(testID, "update-banner", "root")} style={[s.root, r.root.view, style]}>
      <View testID={partId(testID, "update-banner", "card")} style={r.card.view}>
        <View testID={partId(testID, "update-banner", "versionRow")} style={[s.versionRow, r.versionRow.view]}>
          <View testID={partId(testID, "update-banner", "versionTile")} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[s.versionTile, r.versionTile.view]}>
            <Icon testID={partId(testID, "update-banner", "versionIcon")} name="smartphone" size={versionIcon.size} color={r.versionIcon.text.color} style={versionIcon.rest} />
          </View>
          <Text testID={partId(testID, "update-banner", "versionText")} maxFontSizeMultiplier={fontScale.content} style={[s.versionText, r.versionText.view, r.versionText.text]}>{str.parts("appVersion", { version: appVersion })}</Text>
        </View>
        {current === "failed" ? (
          <Text testID={partId(testID, "update-banner", "error")} accessibilityRole="alert" maxFontSizeMultiplier={fontScale.content} style={[r.error.view, r.error.text]}>
            {error || str("errorDefault")}
          </Text>
        ) : null}
        {current === "latest" ? (
          <Text testID={partId(testID, "update-banner", "note")} maxFontSizeMultiplier={fontScale.content} style={[r.note.view, r.note.text]}>
            {str("latest")}
          </Text>
        ) : null}
        {current === "store-required" ? <Text testID={partId(testID, "update-banner", "note")} maxFontSizeMultiplier={fontScale.content} style={[r.note.view, r.note.text]}>{str("storeRequired", { version, store })}</Text> : null}
        {current === "ready" || current === "installing" ? (
          <Button label={str("restartToApply")} full size="lg" iconLeading="refresh-cw" loading={current === "installing"} onPress={() => setConfirm(true)} />
        ) : null}
        {busy || current === "latest" || current === "failed" ? (
          <Button
            label={str("check")}
            full
            size="lg"
            variant="secondary"
            iconLeading="cloud-download"
            loading={busy}
            onPress={() => {
              setStage("checking");
              onCheck?.();
            }}
          />
        ) : null}
        {current === "store-required" ? (
          <Button label={os === "ios" ? str("openAppStore") : str("openGooglePlay")} full size="lg" iconTrailing="external-link" onPress={() => onApply?.()} />
        ) : null}
      </View>
      {confirm ? (
        <Enter motion="slide-up" role="dialog" aria-modal accessibilityLabel={str("confirmTitle")} accessibilityViewIsModal>
          <Animated.View testID={partId(testID, "update-banner", "sheet")} {...swipe.handlers} style={[s.sheet, r.sheet.view, { transform: [{ translateY: swipe.y }] }]}>
            <View testID={partId(testID, "update-banner", "grabber")} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[s.grabber, r.grabber.view]} />
            <Text testID={partId(testID, "update-banner", "sheetTitle")} accessibilityRole="header" maxFontSizeMultiplier={fontScale.content} style={[r.sheetTitle.view, r.sheetTitle.text]}>
              {str("confirmTitle")}
            </Text>
            <Text testID={partId(testID, "update-banner", "sheetBody")} maxFontSizeMultiplier={fontScale.content} style={[s.sheetBody, r.sheetBody.view, r.sheetBody.text]}>
              {str("confirmBody")}
            </Text>
            <Button label={str("restartNow")} full size="lg" onPress={() => onRestart?.()} />
            <Button label={str("later")} full size="lg" variant="ghost" onPress={() => setConfirm(false)} />
          </Animated.View>
        </Enter>
      ) : null}
    </View>
  );
}
