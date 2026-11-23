import { useEffect, useRef } from "react";
import { Platform, Pressable, Text, View, type TextStyle, type ViewStyle } from "react-native";
import { recipes, useStrings, type IconActionItem, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon, Spinner, type IconName } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { announce } from "../../lib/a11y";
import { fontScale } from "../../lib/type";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyle, type PartStyles } from "../../lib/recipe";
import { IconButton } from "../actions/icon-button";
import { Avatar, type AvatarIdentity } from "../display/avatar";

export type MobileHeaderVariant = "main" | "pushed";
export type MobileHeaderTitleAlign = "platform" | "start" | "center";
export type MobileHeaderConnection = "online" | "connecting" | "offline";

export interface MobileHeaderProps extends RootProps {
  /** main: a tab's large title, its actions and a photo. pushed: back + title + actions, for anything opened on top of a tab. */
  variant?: MobileHeaderVariant;
  title: string;
  /** Pushed only: '7 members'. One line, faint. */
  subtitle?: string;
  /** Pushed only: an icon 4pt before the title. */
  titleGlyph?: IconName;
  /** Names the photo on a main header's right. Empty draws no photo. */
  userName?: string;
  avatarSrc?: string;
  /** The colour of the photo's initials when there is no `avatarSrc`. */
  identity?: AvatarIdentity;
  /** A 40pt control each, `icon` and `label` (its accessible name); `badge` is a coral count. Before the photo on a main header, after the title on a pushed one. Two at most on a pushed one; more go behind ⋮. */
  actions?: IconActionItem[];
  /** platform centres a pushed title on iOS and starts it on Android. */
  titleAlign?: MobileHeaderTitleAlign;
  /** Draws a picture of the OS status bar above, to show the safe area the header sits under. A real app has the system's own: leave it off, and pad the header by the device's top inset yourself. */
  statusBar?: boolean;
  /** The status bar's clock. */
  clock?: string;
  /** A one-line status under the header while the socket is not connected. */
  connection?: MobileHeaderConnection;
  onBack?: () => void;
  /** An action was pressed. */
  onAction?: (action: IconActionItem) => void;
  onProfile?: () => void;
  /** Per-part styles over the theme: `{ header: {…}, title: {…}, me: {…} }`. */
  styles?: PartStyles<"mobile-header">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["mobile-header"]>;
  style?: ViewStyle;
}

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { width: "100%" },
  statusBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: t.space["3xl"] },
  statusBarAndroid: { paddingHorizontal: t.space.lg },
  island: { position: "absolute", left: "50%", marginLeft: -t.osHeader.islandW / 2 },
  punchHole: { position: "absolute", left: "50%", marginLeft: -t.osHeader.punchSize / 2 },
  sysIcons: { flexDirection: "row", alignItems: "center", gap: t.space.xs },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.space.sm, paddingTop: t.space.md },
  pushed: { justifyContent: "flex-start", paddingLeft: t.space["2xs"] },
  largeTitle: { flexShrink: 1, minWidth: 0 },
  mainActions: { flexDirection: "row", alignItems: "center", gap: t.space.sm },
  titleBlock: { flex: 1, minWidth: 0 },
  titleCentre: { position: "absolute", top: t.space.md, bottom: 0, alignItems: "center", justifyContent: "center", pointerEvents: "none" },
  titleLine: { flexDirection: "row", alignItems: "center", gap: t.space["2xs"], minWidth: 0, maxWidth: "100%" },
  title: { flexShrink: 1, minWidth: 0 },
  subtitle: { maxWidth: "100%" },
  grow: { flex: 1 },
  connection: { flexDirection: "row", alignItems: "center", gap: t.space.xs, paddingTop: t.space["2xs"] },
}));

/** The status bar's clock is the system face (SF Pro, Roboto), not the app's: it belongs to the OS. */
function clockFont(os: "ios" | "android"): TextStyle {
  const weight = os === "android" ? "500" : "600";
  if (Platform.OS !== "web") return { fontWeight: weight };
  return { fontFamily: os === "android" ? "Roboto, system-ui, sans-serif" : '-apple-system, "SF Pro Text", system-ui, sans-serif', fontWeight: weight };
}

/** An icon part as the glyph draws it: its width is the size (else the kit's), its text colour the ink, the rest of its view style (what `styles` adds) the glyph's style. */
function glyphOf(p: PartStyle, size?: number) {
  const { width, height: _height, ...rest } = p.view as ViewStyle;
  return { size: (width as number | undefined) ?? size, color: p.text.color, style: Object.keys(rest).length ? (rest as ViewStyle) : undefined };
}

export function MobileHeader({
  variant = "main",
  title,
  subtitle = "",
  titleGlyph = "",
  userName = "",
  avatarSrc = "",
  identity = "ink",
  actions = [],
  titleAlign = "platform",
  statusBar = false,
  clock = "9:41",
  connection = "online",
  onBack,
  onAction,
  onProfile,
  styles,
  strings,
  style,
  testID,
  ...rest
}: MobileHeaderProps) {
  const { t, os } = useTheme();
  const s = useStyles();
  const str = useStrings("mobile-header", strings);
  const me = usePress();
  // A phone has no hover, so there is none here.
  const r = useRecipe(recipes["mobile-header"], { state: { focus: me.focused }, styles });
  // iOS has no live regions: the connection line is said when it appears or changes, and the way back online when it goes.
  const was = useRef<MobileHeaderConnection | null>(null);
  useEffect(() => {
    const before = was.current;
    was.current = connection;
    if (before === connection) return;
    if (connection !== "online") announce(connection === "connecting" ? str("connecting") : str("offline"));
    else if (before !== null) announce(str("online"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);
  const android = os === "android";
  const pushed = variant === "pushed";
  const centred = titleAlign === "center" || (titleAlign === "platform" && !android);
  const header = partStyle(r, "header", { view: pushed && s.pushed });
  const photo = partStyle(r, "me", { view: me.pressed && { opacity: 0.7 } });

  const titleBlock = (
    <>
      <View style={s.titleLine}>
        {titleGlyph ? <Icon testID={partId(testID, "mobile-header", "titleGlyph")} name={titleGlyph} {...glyphOf(r.titleGlyph)} /> : null}
        <Text testID={partId(testID, "mobile-header", "title")} accessibilityRole="header" numberOfLines={1} maxFontSizeMultiplier={fontScale.chrome} style={[s.title, r.title.view, r.title.text]}>
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text testID={partId(testID, "mobile-header", "subtitle")} numberOfLines={1} maxFontSizeMultiplier={fontScale.chrome} style={[s.subtitle, r.subtitle.view, r.subtitle.text]}>
          {subtitle}
        </Text>
      ) : null}
    </>
  );

  const buttons = actions.map((a) => <IconButton key={a.key} icon={a.icon} label={a.label} badge={a.badge} disabled={a.disabled} onPress={() => onAction?.(a)} />);

  return (
    <View testID={partId(testID, "mobile-header", "root")} {...rootProps(rest)} style={[s.root, r.root.view, style]}>
      {statusBar ? (
        <View testID={partId(testID, "mobile-header", "statusBar")} aria-hidden style={[s.statusBar, android && s.statusBarAndroid, r.statusBar.view]}>
          <Text testID={partId(testID, "mobile-header", "clock")} style={[{ fontSize: android ? 14 : 17, letterSpacing: android ? 0 : -0.17 }, clockFont(os), r.clock.view, r.clock.text]}>{clock}</Text>
          {android ? <View testID={partId(testID, "mobile-header", "punchHole")} style={[s.punchHole, r.punchHole.view]} /> : <View testID={partId(testID, "mobile-header", "island")} style={[s.island, r.island.view]} />}
          <View style={[s.sysIcons, android && { gap: t.space["2xs"] }]}>
            <Icon testID={partId(testID, "mobile-header", "sysIcon")} name={android ? "wifi" : "signal"} strokeWidth={2.5} {...glyphOf(r.sysIcon, android ? 15 : 16)} />
            <Icon testID={partId(testID, "mobile-header", "sysIcon")} name={android ? "signal" : "wifi"} strokeWidth={2.5} {...glyphOf(r.sysIcon, android ? 15 : 16)} />
            <Icon testID={partId(testID, "mobile-header", "sysIcon")} name={android ? "battery" : "battery-full"} strokeWidth={2} {...glyphOf(r.sysIcon, android ? 16 : 22)} />
          </View>
        </View>
      ) : null}

      <View testID={partId(testID, "mobile-header", "header")} style={[s.header, header.view]}>
        {pushed ? (
          <>
            <IconButton icon={android ? "arrow-left" : "chevron-left"} label={str("back")} onPress={() => onBack?.()} />
            {centred ? (
              <>
                <View testID={partId(testID, "mobile-header", "titleCentre")} style={[s.titleCentre, r.titleCentre.view]}>{titleBlock}</View>
                <View style={s.grow} />
              </>
            ) : (
              <View style={s.titleBlock}>{titleBlock}</View>
            )}
            {buttons}
          </>
        ) : (
          <>
            <Text testID={partId(testID, "mobile-header", "largeTitle")} accessibilityRole="header" numberOfLines={1} maxFontSizeMultiplier={fontScale.chrome} style={[s.largeTitle, r.largeTitle.view, r.largeTitle.text]}>
              {title}
            </Text>
            <View style={s.mainActions}>
              {buttons}
              {userName ? (
                <Pressable
                  testID={partId(testID, "mobile-header", "me")}
                  accessibilityRole="button"
                  accessibilityLabel={str("profile")}
                  onPress={() => onProfile?.()}
                  {...me.handlers}
                  style={photo.view}
                >
                  <Avatar name={userName} src={avatarSrc} size="md" identity={identity} />
                </Pressable>
              ) : null}
            </View>
          </>
        )}
      </View>

      {connection !== "online" ? (
        <View testID={partId(testID, "mobile-header", "connection")} style={[s.connection, r.connection.view]}>
          {connection === "connecting" ? (
            <Spinner testID={partId(testID, "mobile-header", "connectionIcon")} {...glyphOf(r.connectionIcon)} />
          ) : (
            <Icon testID={partId(testID, "mobile-header", "connectionIcon")} name="cloud-off" {...glyphOf(r.connectionIcon)} />
          )}
          <Text testID={partId(testID, "mobile-header", "connectionText")} maxFontSizeMultiplier={fontScale.content} style={[r.connectionText.view, r.connectionText.text]}>{connection === "connecting" ? str("connecting") : str("offline")}</Text>
        </View>
      ) : null}
    </View>
  );
}
