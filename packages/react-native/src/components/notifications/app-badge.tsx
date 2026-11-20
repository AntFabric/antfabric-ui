import { Platform, Text, View, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { recipes, useStrings, type AppMark, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { font, fontScale } from "../../lib/type";

export interface AppBadgeProps extends RootProps {
  /** The app's name: the label under the icon. Its first letter is the icon's mark when no `mark` is given. */
  appName: string;
  /** The app icon's vector mark, drawn white on the tile. Left out, the first letter of `appName`. */
  mark?: AppMark;
  /** Unread mentions and DMs — the person's whole total, never one window's. 0 clears the badge. */
  count?: number;
  /** Activity without a mention. Android launchers draw it as a dot; iOS has numbers only. */
  dot?: boolean;
  /** Notifications are paused: counts still show, the activity dot is dropped. */
  mutedAll?: boolean;
  /** This badge's built-in text (what the icon is read as) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["app-badge"]>;
  /** Per-part styles over the theme: `{ root: {…}, badge: {…} }`. */
  styles?: PartStyles<"app-badge">;
  style?: ViewStyle;
}

/** A CSS gradient as a background: React Native's own on a device, the CSS property through React Native Web. */
const gradient = (css: string): ViewStyle => (Platform.OS === "web" ? { backgroundImage: css } : { experimental_backgroundImage: css }) as ViewStyle;

/** Layout no token decides; the OS's colours, sizes and type are the recipe's (`appBadge`, under `ios` and `android`). */
const useStyles = createStyles((t) => ({
  root: { alignSelf: "flex-start" },
  home: { alignItems: "center", ...gradient(`linear-gradient(160deg, ${t.identity.indigo}, ${t.identity.ink})`) },
  iconWrap: { alignItems: "center", justifyContent: "center" },
  appIcon: { alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", alignItems: "center", justifyContent: "center" },
  digits: { fontVariant: ["tabular-nums"] },
  label: { textShadowColor: t.os.iosLabelShadow, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }, /* structural: 1px offset of the home-screen label shadow */
}));

/** The share of the tile the mark fills on the phone app's icon. */
const MARK_FILL = 0.58;

export function AppBadge({ appName, mark, count: n = 0, dot = false, mutedAll = false, strings, styles, style, testID, ...rest }: AppBadgeProps) {
  const { os, t } = useTheme();
  const s = useStyles();
  const str = useStrings("app-badge", strings);
  const r = useRecipe(recipes["app-badge"], { variants: { mutedAll }, styles });
  const ios = os === "ios";
  const side = ios ? 60 : 56;
  const markSize = Math.round(side * MARK_FILL);
  const what = n > 0 ? str("unread", { count: n }) : dot && !mutedAll ? str("newActivity") : str("noUnread");
  const appIcon = partStyle(r, "appIcon", { view: { width: side, height: side, borderRadius: ios ? 14 : side / 2 } });
  const label = partStyle(r, "label", { text: { fontSize: ios ? 12 : 13 } });
  return (
    <View {...rootProps(rest)} testID={partId(testID, "app-badge", "root")} accessible accessibilityRole="image" accessibilityLabel={mutedAll ? str("paused", { what }) : what} style={[s.root, r.root.view, style]}>
      <View testID={partId(testID, "app-badge", "container")} style={[s.home, r.container.view]}>
        <View style={s.iconWrap}>
          <View testID={partId(testID, "app-badge", "appIcon")} style={[s.appIcon, appIcon.view]}>
            {/* The phone app's icon: the mark, white, at the share of the tile it fills there. */}
            {mark ? (
              <Svg testID={partId(testID, "app-badge", "mark")} width={markSize} height={markSize} viewBox={mark.viewBox} style={r.mark.view}>
                {mark.paths.map((p) => (
                  <Path key={p.d.slice(0, 12)} d={p.d} fill={r.mark.text.color} fillRule={p.evenOdd ? "evenodd" : "nonzero"} clipRule={p.evenOdd ? "evenodd" : "nonzero"} />
                ))}
              </Svg>
            ) : (
              <Text testID={partId(testID, "app-badge", "mark")} maxFontSizeMultiplier={fontScale.chrome} style={[font("bold", "sans", t), r.mark.text, r.mark.view, { fontSize: markSize }]}>
                {Array.from(appName)[0] ?? ""}
              </Text>
            )}
          </View>
          {/* iOS draws the real number, uncapped and always red; Android launchers draw a dot from the tray. */}
          {ios && n > 0 ? (
            <Enter motion="pop" testID={partId(testID, "app-badge", "badge")} style={[s.badge, r.badge.view]}>
              <Text testID={partId(testID, "app-badge", "digits")} maxFontSizeMultiplier={fontScale.chrome} style={[r.digits.text, s.digits]}>
                {n}
              </Text>
            </Enter>
          ) : null}
          {!ios && (n > 0 || (dot && !mutedAll)) ? (
            <Enter motion="pop" testID={partId(testID, "app-badge", "badge")} style={[{ position: "absolute", top: 0 }, r.badge.view]} />
          ) : null}
        </View>
        <Text testID={partId(testID, "app-badge", "label")} maxFontSizeMultiplier={fontScale.chrome} style={[r.label.text, s.label, label.text]}>
          {appName}
        </Text>
      </View>
    </View>
  );
}
