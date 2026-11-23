import { Text, View, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { useAnnounce } from "../../lib/a11y";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";

export type ConnectionBannerState = "offline" | "reconnecting" | "back-online" | "syncing" | "degraded";
export type ConnectionBannerSurface = "banner" | "pill";

export interface ConnectionBannerProps extends RootProps {
  /** offline: this device has no network. reconnecting: the network is there but the service is not answering. degraded: one service (the directory) is failing. */
  state?: ConnectionBannerState;
  /** pill is the header's read-only Online / Offline indicator. */
  surface?: ConnectionBannerSurface;
  /** Reconnect attempt number. Shown from the second attempt. */
  attempt?: number;
  /** Things waiting to sync: changes what offline and back-online say. */
  pending?: number;
  /** Per-part styles over the theme: `{ card: {…}, cardTitle: {…}, pill: {…} }`. */
  styles?: PartStyles<"connection-banner">;
  /** This banner's built-in text (the card's titles and messages, the pill's words and names) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["connection-banner"]>;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (fill, ink, type, insets, the dot) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { width: "100%" },
  card: { flexDirection: "row", alignItems: "flex-start" },
  body: { flex: 1, minWidth: 0 },
  pill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start" },
  icon: { marginTop: t.border.wHairline },
}));

/** An icon's size is its width and height (`size`); what else a part's style sets goes on the glyph. */
const glyphBox = (view: ViewStyle) => {
  const { width, height: _h, ...rest } = view;
  return { size: width as number, rest: Object.keys(rest).length ? rest : undefined };
};

export function ConnectionBanner({ state = "offline", surface = "banner", attempt = 1, pending = 0, styles, strings, style, testID, ...rest }: ConnectionBannerProps) {
  const s = useStyles();
  const str = useStrings("connection-banner", strings);
  const r = useRecipe(recipes["connection-banner"], { variants: { state }, styles });
  // What each state says; how it looks is the recipe's. Offline is a normal mode for a capture app: a neutral card that reassures, never an alarm.
  const c =
    state === "offline"
      ? { icon: "cloud-off", title: str("offlineTitle"), message: pending > 0 ? str("offlinePending", { count: pending }) : str("offlineBody") }
      : state === "back-online"
        ? { icon: "circle-check", title: str("backOnline"), message: pending > 0 ? str("backOnlinePending", { count: pending }) : str("upToDate") }
        : state === "syncing"
          ? { icon: "refresh-cw", title: str("syncingTitle"), message: str("syncingBody") }
          : state === "reconnecting"
            ? { icon: "wifi-off", title: str("reconnectingTitle"), message: attempt >= 2 ? str("reconnectingAttempt", { count: attempt }) : str("reconnectingBody") }
            : { icon: "user-x", title: str("degradedTitle"), message: str("degradedBody") };
  const off = state === "offline";
  const trying = state === "reconnecting";
  const pillWords = off ? str("offLabel") : trying ? str("tryingLabel") : str("onLabel");
  // iOS has no live regions: a change of state is spoken, the card's title and message or the pill's name. Not on first draw of the pill.
  const spoken = surface === "pill" ? pillWords : `${c.title}. ${c.message}`;
  useAnnounce(spoken, { initial: surface !== "pill" });
  if (surface === "pill") {
    const pillText = partStyle(r, "pillText", { text: { color: r.pill.text.color } });
    return (
      <View {...rootProps(rest)} testID={partId(testID, "connection-banner", "root")} style={[s.root, r.root.view, style]}>
        <View
          testID={partId(testID, "connection-banner", "pill")}
          accessible
          accessibilityLabel={pillWords}
          style={[s.pill, r.pill.view]}
        >
          <View testID={partId(testID, "connection-banner", "dot")} style={r.dot.view} />
          <Text testID={partId(testID, "connection-banner", "pillText")} maxFontSizeMultiplier={fontScale.chrome} style={[pillText.view, pillText.text]}>
            {off ? str("offline") : trying ? str("reconnecting") : str("online")}
          </Text>
        </View>
      </View>
    );
  }
  const cardIcon = glyphBox(partStyle(r, "cardIcon", { view: s.icon }).view as ViewStyle);
  const cardTitle = partStyle(r, "cardTitle", { text: { color: r.card.text.color } });
  return (
    <View {...rootProps(rest)} testID={partId(testID, "connection-banner", "root")} style={[s.root, r.root.view, style]}>
      <Enter testID={partId(testID, "connection-banner", "card")} motion="slide-down" accessible style={[s.card, r.card.view]}>
        <Icon testID={partId(testID, "connection-banner", "cardIcon")} name={c.icon} size={cardIcon.size} color={r.cardIcon.text.color ?? r.card.text.color} style={cardIcon.rest} />
        <View style={s.body}>
          <Text testID={partId(testID, "connection-banner", "cardTitle")} maxFontSizeMultiplier={fontScale.content} style={[cardTitle.view, cardTitle.text]}>
            {c.title}
          </Text>
          <Text testID={partId(testID, "connection-banner", "cardMessage")} maxFontSizeMultiplier={fontScale.content} style={[r.cardMessage.view, r.cardMessage.text]}>
            {c.message}
          </Text>
        </View>
      </Enter>
    </View>
  );
}
