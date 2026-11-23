import { useEffect, useRef } from "react";
import { Text, View, type ViewStyle } from "react-native";
import { recipes, usePending, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { announce } from "../../lib/a11y";
import { GlassSurface } from "../../lib/glass";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Button } from "../actions/button";

export type PermissionPromptPermission = "default" | "granted" | "denied" | "unsupported";
export type PermissionPromptPresentation = "card" | "sheet";

export interface PermissionPromptProps extends RootProps {
  /** The OS's answer. default = never asked. */
  permission?: PermissionPromptPermission;
  /** card is the prompt on its own. sheet: the prompt IS the bottom sheet — full width, top corners rounded, a grab handle. */
  presentation?: PermissionPromptPresentation;
  /** Runs the OS request, from this tap, never on load. Turn on spins until the app passes the answer as `permission`, or the returned promise settles. */
  onAllow?: () => void | Promise<unknown>;
  onLater?: () => void;
  /** iOS provisional authorisation: deliver quietly to Notification Center without asking. */
  onQuiet?: () => void;
  onOpenSettings?: () => void;
  onTest?: () => void;
  /** This prompt's built-in text (titles, explanations, buttons) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["permission-prompt"]>;
  /** Per-part styles over the theme: `{ root: {…}, title: {…} }`. */
  styles?: PartStyles<"permission-prompt">;
  style?: ViewStyle;
}

/** Layout no token decides; the colours, sizes and type are the recipe's (`permissionPrompt`). */
const useStyles = createStyles((t) => ({
  sheetBox: { alignSelf: "stretch", width: "100%" },
  // Under Liquid Glass the sheet floats: inset from the edges, every corner rounded.
  sheetGlass: { alignSelf: "stretch", marginHorizontal: t.space.sm, marginBottom: t.space.sm },
  root: { gap: t.space.md, padding: t.space.xl },
  sheet: {
    borderWidth: 0,
    borderTopWidth: t.border.wHairline,
    borderTopLeftRadius: t.radius.sheet,
    borderTopRightRadius: t.radius.sheet,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: t.space.md,
  },
  glass: { borderTopLeftRadius: t.sheet.glassRadius, borderTopRightRadius: t.sheet.glassRadius, borderBottomLeftRadius: t.sheet.glassRadius, borderBottomRightRadius: t.sheet.glassRadius, borderTopWidth: 0 },
  handle: { alignSelf: "center", marginBottom: t.space["2xs"] },
  head: { flexDirection: "row", alignItems: "center", gap: t.space.md },
  tile: { alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
  actions: { gap: t.space.sm, marginTop: t.space["2xs"] },
}));

export function PermissionPrompt({ permission = "default", presentation = "card", onAllow, onLater, onQuiet, onOpenSettings, onTest, strings, styles, style, testID, ...rest }: PermissionPromptProps) {
  const { os, glass } = useTheme();
  const s = useStyles();
  const str = useStrings("permission-prompt", strings);
  // Turn on reports the request and spins until the app passes the OS's answer as `permission` (or the promise settles): a dismissed
  // prompt leaves it as it was, and the prompt never says on before the OS does.
  const state = permission;
  const { pending, run } = usePending([permission]);
  const sheet = presentation === "sheet";
  const ios = os === "ios";
  const titleKey = state === "unsupported" ? "titleUnsupportedBuild" : state === "denied" ? "titleOff" : state === "granted" ? "titleOn" : "titleAsk";
  const bodyKey =
    state === "unsupported"
      ? "bodyUnsupportedPhone"
      : state === "denied"
        ? ios
          ? "bodyBlockedIos"
          : "bodyBlockedAndroid"
        : state === "granted"
          ? ios
            ? "bodyOnIos"
            : "bodyOnAndroid"
          : ios
            ? "bodyAskIos"
            : "bodyAskAndroid";
  const r = useRecipe(recipes["permission-prompt"], { variants: { permission: state, presentation }, styles });
  // iOS has no live regions: the new answer's title is spoken when it changes.
  const was = useRef(state);
  useEffect(() => {
    if (was.current === state) return;
    was.current = state;
    announce(str(titleKey));
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const root = partStyle(r, "root", { view: sheet ? s.sheet : undefined });
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: tileIconSize, height: _tileIconHeight, ...tileIconRest } = r.tileIcon.view;
  const content = (
    <>
      {sheet ? <View testID={partId(testID, "permission-prompt", "handle")} accessibilityElementsHidden importantForAccessibility="no" style={[s.handle, r.handle.view]} /> : null}
      <View style={s.head}>
        <View testID={partId(testID, "permission-prompt", "tile")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.tile, r.tile.view]}>
          <Icon
            testID={partId(testID, "permission-prompt", "tileIcon")}
            name={state === "granted" ? "bell-ring" : state === "default" ? "bell" : "bell-off"}
            size={tileIconSize as number}
            color={r.tile.text.color}
            style={Object.keys(tileIconRest).length ? tileIconRest : undefined}
          />
        </View>
        <Text testID={partId(testID, "permission-prompt", "title")} accessibilityRole="header" maxFontSizeMultiplier={fontScale.content} style={[s.title, r.title.text]}>
          {str(titleKey)}
        </Text>
      </View>
      <Text testID={partId(testID, "permission-prompt", "body")} maxFontSizeMultiplier={fontScale.content} style={r.body.text}>
        {str(bodyKey)}
      </Text>
      {state !== "unsupported" ? (
        <View style={s.actions}>
          {state === "default" ? (
            <Button
              label={str("turnOn")}
              iconLeading="bell"
              full
              loading={pending}
              onPress={() => run(onAllow)}
            />
          ) : null}
          {state === "default" && ios ? <Button label={str("quiet")} variant="ghost" full onPress={() => onQuiet?.()} /> : null}
          {state === "default" ? <Button label={str("notNow")} variant="ghost" full onPress={() => onLater?.()} /> : null}
          {state === "granted" ? <Button label={str("test")} variant="secondary" full onPress={() => onTest?.()} /> : null}
          {state === "denied" ? <Button label={str("openSettings")} iconTrailing="external-link" full onPress={() => onOpenSettings?.()} /> : null}
        </View>
      ) : null}
      {state === "default" ? (
        <Text testID={partId(testID, "permission-prompt", "foot")} maxFontSizeMultiplier={fontScale.content} style={r.foot.text}>
          {str("footPhone")}
        </Text>
      ) : null}
    </>
  );
  return (
    <Enter
      motion={sheet ? "slide-up" : "pop"}
      {...rootProps(rest)}
      testID={sheet ? undefined : partId(testID, "permission-prompt", "card")}
      role="region"
      accessibilityLabel={str("notifications")}
      style={[sheet ? (glass ? s.sheetGlass : s.sheetBox) : r.card.view, style]}
    >
      {/* Only the sheet takes glass; the card stays opaque so the explanation reads cleanly wherever it sits. */}
      {sheet ? (
        <GlassSurface testID={partId(testID, "permission-prompt", "root")} style={[s.root, root.view]} glassStyle={[s.glass, styles?.root]}>
          {content}
        </GlassSurface>
      ) : (
        <View testID={partId(testID, "permission-prompt", "root")} style={[s.root, root.view]}>
          {content}
        </View>
      )}
    </Enter>
  );
}
