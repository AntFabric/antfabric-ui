import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { announce } from "../../lib/a11y";
import { GlassSurface } from "../../lib/glass";
import { Icon, type IconName } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Avatar, type AvatarIdentity } from "../display/avatar";

export type InAppBannerLeading = "avatar" | "tile";
export type InAppBannerDismissReason = "close" | "action" | "swipe";

export interface InAppBannerProps extends RootProps {
  /** The sender for chat; the event for a meeting or an agent. */
  title: string;
  /** Drawn after the title: the channel, the room. Empty for a direct message. */
  context?: string;
  /** Two lines at most; the server's bounded preview. */
  body?: string;
  sender?: string;
  /** The sender's photo. */
  avatarSrc?: string;
  /** The colour of the sender's initials when there is no `avatarSrc`. */
  identity?: AvatarIdentity;
  /** avatar is the sender's face. tile is a glyph on a tile, for an event that has no sender. */
  leading?: InAppBannerLeading;
  /** The tile's glyph. */
  icon?: IconName;
  /** The sender is an agent: its face, and no name colour. */
  agent?: boolean;
  /** Words before the body: "Mentioned you". */
  lead?: string;
  time?: string;
  /** How many more are waiting behind this one. They show one at a time; this says so. */
  queued?: number;
  /** Swiped up (or the grabber tapped). The banner leaves and nothing is drawn. */
  dismissed?: boolean;
  /** A tap opens the conversation with the composer focused: on a phone that is the reply. */
  onOpen?: () => void;
  onDismiss?: (reason: InAppBannerDismissReason) => void;
  /** This banner's built-in text (its accessible name, the dismiss action) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["in-app-banner"]>;
  /** Per-part styles over the theme: `{ root: {…}, card: {…}, title: {…} }`. */
  styles?: PartStyles<"in-app-banner">;
  style?: ViewStyle;
}

const NATIVE = Platform.OS !== "web";

/** Layout no token decides; the colours, sizes and type are the recipe's (`inAppBanner`). */
const useStyles = createStyles((t) => ({
  card: { paddingTop: t.space.md, paddingHorizontal: t.space.md, paddingBottom: t.space.xs },
  hit: { flexDirection: "row", alignItems: "flex-start" },
  tile: { alignItems: "center", justifyContent: "center" },
  content: { flex: 1, minWidth: 0, gap: t.space["3xs"] },
  headRow: { flexDirection: "row", alignItems: "baseline", gap: t.space.sm },
  title: { flex: 1 },
  time: { flexShrink: 0 },
  more: { marginTop: t.space["3xs"] },
  grabber: { alignSelf: "center", marginTop: t.space["2xs"] },
}));

export function InAppBanner({
  title,
  context = "",
  body = "",
  sender = "",
  avatarSrc = "",
  identity = "indigo",
  leading = "avatar",
  icon = "",
  agent = false,
  lead = "",
  time = "",
  queued = 0,
  dismissed = false,
  onOpen,
  onDismiss,
  strings,
  styles,
  style,
  testID,
  ...rest
}: InAppBannerProps) {
  const s = useStyles();
  const str = useStrings("in-app-banner", strings);
  const press = usePress();
  const r = useRecipe(recipes["in-app-banner"], { state: { focus: press.focused }, styles });
  const hit = partStyle(r, "hit", { view: press.pressed ? { opacity: 0.7 } : undefined });
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: tileIconSize, height: _tileIconHeight, ...tileIconRest } = r.tileIcon.view;
  const [gone, setGone] = useControllable(dismissed);
  // Dismissing puts this notification away, not the banner: a new one (another title, context, body or time) shows again, back at
  // `dismissed`. Body is part of it because two messages from one sender in one minute share a title and a time.
  const notification = [title, context, body, time].join("\n");
  const [shown, setShown] = useState(notification);
  if (shown !== notification) {
    setShown(notification);
    setGone(dismissed);
  }
  const dismiss = (reason: InAppBannerDismissReason) => {
    setGone(true);
    onDismiss?.(reason);
  };

  // A swipe up follows the finger and dismisses past 30pt; short of that it settles back.
  const y = useRef(new Animated.Value(0)).current;
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy < -8 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => y.setValue(Math.min(0, g.dy)),
        onPanResponderRelease: (_, g) => {
          if (g.dy < -30) {
            setGone(true);
            onDismiss?.("swipe");
          }
          Animated.timing(y, { toValue: 0, duration: 180, useNativeDriver: NATIVE }).start();
        },
        onPanResponderTerminate: () => y.setValue(0),
      }),
    [y, setGone, onDismiss],
  );

  // iOS has no live regions: a banner is spoken when it appears, politely, as the sender and the preview.
  const said = [title, context, body].filter(Boolean).join(". ");
  useEffect(() => {
    if (!gone && said) announce(said);
  }, [gone, said]);

  return (
    <View {...rootProps(rest)} testID={partId(testID, "in-app-banner", "root")} role="status" accessibilityLabel={str("newNotification")} style={[r.root.view, style]}>
      {!gone ? (
        <Enter motion="drop" onAccessibilityEscape={() => dismiss("swipe")}>
          <Animated.View {...pan.panHandlers} style={{ transform: [{ translateY: y }] }}>
            <GlassSurface testID={partId(testID, "in-app-banner", "card")} style={[s.card, r.card.view]} glassStyle={[{ borderWidth: 0 }, styles?.card]}>
              <Pressable
                testID={partId(testID, "in-app-banner", "hit")}
                accessibilityRole="button"
                accessibilityLabel={context ? str("openIn", { title, context, body }) : str("open", { title, body })}
                accessibilityActions={[{ name: "dismiss", label: str("dismiss") }]}
                onAccessibilityAction={(e) => (e.nativeEvent.actionName === "dismiss" ? dismiss("swipe") : undefined)}
                onPress={() => onOpen?.()}
                {...press.handlers}
                style={[s.hit, hit.view]}
              >
                {leading === "tile" ? (
                  <View testID={partId(testID, "in-app-banner", "tile")} style={[s.tile, r.tile.view]}>
                    {icon ? <Icon testID={partId(testID, "in-app-banner", "tileIcon")} name={icon} size={tileIconSize as number} color={r.tile.text.color} style={Object.keys(tileIconRest).length ? tileIconRest : undefined} /> : null}
                  </View>
                ) : (
                  <Avatar name={sender} src={avatarSrc} size="md" identity={agent ? "agent" : identity} agent={agent} />
                )}
                <View style={s.content}>
                  <View style={s.headRow}>
                    <Text testID={partId(testID, "in-app-banner", "title")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[s.title, r.title.view, r.title.text]}>
                      {title}
                      {context ? (
                        <Text testID={partId(testID, "in-app-banner", "context")} maxFontSizeMultiplier={fontScale.content} style={[r.context.view, r.context.text]}> · {context}</Text>
                      ) : null}
                    </Text>
                    <Text testID={partId(testID, "in-app-banner", "time")} maxFontSizeMultiplier={fontScale.content} numberOfLines={1} style={[s.time, r.time.view, r.time.text]}>
                      {time}
                    </Text>
                  </View>
                  {body ? (
                    <Text testID={partId(testID, "in-app-banner", "body")} maxFontSizeMultiplier={fontScale.content} numberOfLines={2} style={[r.body.view, r.body.text]}>
                      {lead ? (
                        <Text testID={partId(testID, "in-app-banner", "lead")} maxFontSizeMultiplier={fontScale.content} style={[r.lead.view, r.lead.text]}>{str("leadSuffix", { lead })}</Text>
                      ) : null}
                      {body}
                    </Text>
                  ) : null}
                  {queued > 0 ? (
                    <Text testID={partId(testID, "in-app-banner", "more")} maxFontSizeMultiplier={fontScale.content} style={[s.more, r.more.view, r.more.text]}>
                      {str.parts("more", { count: queued })}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
              {/* Stands in for the swipe up where there is no finger (the catalogue). Hidden: the Dismiss action covers it. */}
              <Pressable testID={partId(testID, "in-app-banner", "grabber")} accessibilityElementsHidden importantForAccessibility="no" hitSlop={12} onPress={() => dismiss("swipe")} style={[s.grabber, r.grabber.view]} />
            </GlassSurface>
          </Animated.View>
        </Enter>
      ) : null}
    </View>
  );
}
