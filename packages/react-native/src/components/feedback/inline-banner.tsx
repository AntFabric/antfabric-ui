import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { announce } from "../../lib/a11y";
import { Icon, type IconName } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

export type InlineBannerTone = "neutral" | "brand" | "warning" | "danger";

/** The glyph a banner draws when it is given none: one per tone, so a warning reads as one without the product picking a glyph. */
const TONE_ICON: Record<InlineBannerTone, IconName> = { neutral: "info", brand: "info", warning: "triangle-alert", danger: "circle-alert" };
export type InlineBannerActionVariant = "secondary" | "primary";

export interface InlineBannerProps extends RootProps {
  /** neutral: the state you are in. brand: the product's assistant did this, never an outage. danger is announced as an alert. warning: something will go wrong if left. danger: it already failed. */
  tone?: InlineBannerTone;
  /** The glyph before the message. Left out, the tone's own: `info` for neutral and brand, `triangle-alert` for warning, `circle-alert` for danger; `""` draws none. */
  icon?: IconName;
  /** Optional bold first line. Footnote banners leave it out. */
  title?: string;
  message: string;
  /** At most one action, under the message: a phone is too narrow for text and a button side by side. */
  actionLabel?: string;
  /** primary only when the banner holds the view's one primary action. */
  actionVariant?: InlineBannerActionVariant;
  /** Tips and announcements can be dismissed; a banner that states a fact cannot. */
  dismissible?: boolean;
  /** Dismissed: the banner fades out. The × sets it; the app unmounts the banner on onDismiss. */
  dismissed?: boolean;
  onAction?: () => void;
  onDismiss?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, message: {…} }`. */
  styles?: PartStyles<"inline-banner">;
  /** This banner's built-in text (the × label) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["inline-banner"]>;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (fill, ink, type, insets) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { flexDirection: "row", alignItems: "flex-start", alignSelf: "stretch", borderRadius: 8 },
  // 2pt down, against the first line of text.
  icon: { marginTop: t.space["3xs"] },
  body: { flex: 1, minWidth: 0, gap: t.space["3xs"] },
  action: { marginTop: t.space.xs },
  dismiss: { flexShrink: 0, marginEnd: -4 },
}));

export function InlineBanner({
  tone = "neutral",
  icon: given,
  title = "",
  message,
  actionLabel = "",
  actionVariant = "secondary",
  dismissible = false,
  dismissed = false,
  onAction,
  onDismiss,
  styles,
  strings,
  style,
  testID,
  ...rest
}: InlineBannerProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("inline-banner", strings);
  // The banner fades itself out when dismissed; the app hears about it and unmounts it.
  const [gone, setGone] = useControllable(dismissed);
  const r = useRecipe(recipes["inline-banner"], { variants: { tone }, styles });
  const icon = given ?? TONE_ICON[tone];
  // The icon's size is its width and height (`size`); what else `styles.icon` sets goes on the glyph.
  const { width: iconSize, height: _h, ...iconRest } = r.icon.view;
  const iconStyle = Object.keys(iconRest).length ? StyleSheet.flatten([s.icon, iconRest]) : s.icon;
  const alert = tone === "danger";
  const fade = useRef(new Animated.Value(gone ? 0 : 1)).current;
  // iOS has no live regions: the banner is spoken when it appears (a failure cuts in).
  useEffect(() => {
    if (!gone) announce([title, message].filter(Boolean).join(". "));
  }, [tone, title, message]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const run = Animated.timing(fade, { toValue: gone ? 0 : 1, duration: t.motion.duration.base, useNativeDriver: Platform.OS !== "web" });
    run.start();
    return () => run.stop();
  }, [gone, fade, t.motion.duration.base]);
  return (
    <Enter motion="fade" style={{ alignSelf: "stretch" }}>
      <Animated.View
        {...rootProps(rest)}
        testID={partId(testID, "inline-banner", "root")}
        accessibilityElementsHidden={gone}
        importantForAccessibility={gone ? "no-hide-descendants" : "auto"}
        style={[s.root, r.root.view, { opacity: fade }, gone && { pointerEvents: "none" }, style]}
      >
        {icon ? <Icon testID={partId(testID, "inline-banner", "icon")} name={icon} size={iconSize as number} color={r.icon.text.color} style={iconStyle} /> : null}
        <View style={s.body}>
          {title ? (
            <Text testID={partId(testID, "inline-banner", "title")} maxFontSizeMultiplier={fontScale.content} style={[r.title.view, r.title.text]}>
              {title}
            </Text>
          ) : null}
          <Text testID={partId(testID, "inline-banner", "message")} maxFontSizeMultiplier={fontScale.content} style={[r.message.view, r.message.text]}>
            {message}
          </Text>
          {actionLabel ? <Button label={actionLabel} variant={actionVariant} size="sm" onPress={() => onAction?.()} style={s.action} /> : null}
        </View>
        {dismissible ? (
          <IconButton
            icon="x"
            label={str("dismiss")}
            size="sm"
            onPress={() => {
              setGone(true);
              onDismiss?.();
            }}
            style={s.dismiss}
          />
        ) : null}
      </Animated.View>
    </Enter>
  );
}
