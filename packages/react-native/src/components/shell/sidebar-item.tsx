import { Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { fontScale } from "../../lib/type";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyle, type PartStyles } from "../../lib/recipe";
import { Avatar, type AvatarIdentity, type AvatarPresence } from "../display/avatar";
import { Badge } from "../display/badge";

export interface SidebarItemProps extends RootProps {
  /** The name. The row draws `glyph` before it. */
  name: string;
  /** A one-character text mark before the name, read with it ("#" for a channel). Empty draws none. */
  glyph?: string;
  /** A leading icon, not read ("lock", "users"). */
  icon?: IconName;
  /** The name's face: `avatarSrc`, `identity`, `presence` and `agent` draw it. */
  avatar?: boolean;
  /** Read after the name, not drawn ("private channel"). */
  description?: string;
  avatarSrc?: string;
  identity?: AvatarIdentity;
  presence?: AvatarPresence;
  /** A conversation with an AI agent. */
  agent?: boolean;
  /** Something new you have not read. Bold, unless muted. */
  unread?: boolean;
  /** Mentions, or every unread message in a DM. Shown even when muted. */
  mentions?: number;
  muted?: boolean;
  /** An unsent draft is waiting here. */
  draft?: boolean;
  /** This is the conversation on screen: a grey fill, never coral. */
  active?: boolean;
  /** The row a surrounding list has selected. When set, this row is active exactly when it is the named one. */
  selectedName?: string;
  typing?: boolean;
  /** What the second line says while someone types, and what is read. Default: the `typing` string. */
  typingText?: string;
  /** Shared with another organisation. */
  external?: boolean;
  onPress?: () => void;
  /** A long press, and the "Options" accessibility action a screen reader or Switch Control offers in its place. */
  onLongPress?: () => void;
  /** Per-part styles over the theme: `{ row: {…}, name: {…} }`. */
  styles?: PartStyles<"sidebar-item">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["sidebar-item"]>;
  style?: ViewStyle;
}

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { width: "100%" },
  row: { flexDirection: "row", alignItems: "center", width: "100%", paddingVertical: t.space.sm },
  hash: { textAlign: "center" },
  kindIcon: { marginHorizontal: t.space["3xs"] },
  body: { flex: 1, minWidth: 0, gap: t.space["3xs"] },
  line: { flexDirection: "row", alignItems: "center", gap: t.space.xs, minWidth: 0 },
  name: { flexShrink: 1, minWidth: 0 },
  grow: { flex: 1 },
  preview: { flex: 1, minWidth: 0 },
  badge: { alignSelf: "center" },
}));

/** An icon part as the glyph draws it: its width is the size, its text colour the ink, the rest of its view style (what `styles` adds) the glyph's style. */
function glyphOf(p: PartStyle) {
  const { width, height: _height, ...rest } = p.view as ViewStyle;
  return { size: width as number, color: p.text.color, style: Object.keys(rest).length ? (rest as ViewStyle) : undefined };
}

export function SidebarItem({
  name,
  glyph = "",
  icon = "",
  avatar = false,
  description = "",
  avatarSrc = "",
  identity = "indigo",
  presence = "none",
  agent = false,
  unread = false,
  mentions = 0,
  muted = false,
  draft = false,
  active = false,
  selectedName = "",
  typing = false,
  typingText = "",
  external = false,
  onPress,
  onLongPress,
  styles,
  strings,
  style,
  testID,
  ...rest
}: SidebarItemProps) {
  const s = useStyles();
  const str = useStrings("sidebar-item", strings);
  const press = usePress();
  // Current is the app's (or the surrounding section's): a press reports itself and never makes the row current on its own.
  const open = selectedName ? selectedName === name : active;
  // The row is one line, as V2 draws it today: the last message and its time need the backend, so the second line is only for someone typing.
  const twoLines = typing;
  const loud = unread && !muted;
  // A phone has no hover, so there is none here.
  const r = useRecipe(recipes["sidebar-item"], { variants: { unread: loud, muted, typing }, state: { on: open, pressed: press.pressed, focus: press.focused }, styles });
  const row = partStyle(r, "row", { view: { minHeight: twoLines ? 64 : avatar ? 56 : 44 } });
  const hash = partStyle(r, "hash", { text: { lineHeight: (r.hash.text.fontSize as number) * 1.2 } });
  const preview = partStyle(r, "preview", { text: { fontStyle: "italic" } });
  const kindIcon = glyphOf(partStyle(r, "kindIcon", { view: s.kindIcon }));
  const meta = glyphOf(r.metaIcon);
  const typed = typingText || str("typing");
  // The face's sparkle and presence dot are said in words too: an agent, or someone away, is not only a colour.
  const face = !avatar ? "" : agent ? str("agent") : presence === "active" ? str("presenceActive") : presence === "away" ? str("presenceAway") : presence === "dnd" ? str("presenceDnd") : presence === "offline" ? str("presenceOffline") : "";
  const details = [
    face,
    description,
    mentions > 0 ? str("withMentions", { count: mentions }) : unread && !muted ? str("unread") : "",
    muted ? str("muted") : "",
    draft ? str("draft") : "",
    typing ? typed : "",
    external ? str("external") : "",
  ].filter(Boolean);
  const said = details.reduce((label, detail) => str("withDetail", { label, detail }), `${glyph}${name}`);
  const bellOff = <Icon testID={partId(testID, "sidebar-item", "metaIcon")} name="bell-off" {...meta} />;
  const count = <Badge count={mentions} label={str("mentions")} style={s.badge} />;
  return (
    <View testID={testID} {...rootProps(rest)} style={[s.root, style]}>
      <Pressable
        testID={partId(testID, "sidebar-item", "row")}
        accessibilityRole="button"
        accessibilityLabel={said}
        accessibilityState={{ selected: open }}
        onPress={() => onPress?.()}
        // Only with a handler: attached, a hold is taken by the long press and never becomes the press.
        onLongPress={onLongPress ? () => onLongPress() : undefined}
        // A long press has no touch-free route of its own: it is an action a screen reader, Voice Control or Switch Control can run.
        accessibilityActions={onLongPress ? [{ name: "longpress", label: str("options", { name }) }] : undefined}
        onAccessibilityAction={onLongPress ? (e) => e.nativeEvent.actionName === "longpress" && onLongPress() : undefined}
        {...press.handlers}
        style={[s.row, row.view]}
      >
        {glyph ? (
          <Text testID={partId(testID, "sidebar-item", "hash")} aria-hidden maxFontSizeMultiplier={fontScale.content} style={[s.hash, hash.view, hash.text]}>
            {glyph}
          </Text>
        ) : null}
        {icon ? <Icon testID={partId(testID, "sidebar-item", "kindIcon")} name={icon} {...kindIcon} /> : null}
        {avatar ? <Avatar name={name} src={avatarSrc} size="md" identity={identity} presence={presence} agent={agent} /> : null}
        <View style={s.body}>
          <View style={s.line}>
            <Text testID={partId(testID, "sidebar-item", "name")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[s.name, r.name.view, r.name.text]}>
              {name}
            </Text>
            {external ? <Icon testID={partId(testID, "sidebar-item", "metaIcon")} name="building-2" {...meta} /> : null}
            <View style={s.grow} />
            {/* A draft is the desktop's pencil; while someone types, the typing line says more. */}
            {draft && !typing ? <Icon testID={partId(testID, "sidebar-item", "metaIcon")} name="pencil" {...meta} /> : null}
            {muted && !twoLines ? bellOff : null}
            {mentions > 0 && !twoLines ? count : null}
          </View>
          {twoLines ? (
            <View style={s.line}>
              <Text testID={partId(testID, "sidebar-item", "preview")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[s.preview, preview.view, preview.text]}>
                {typed}
              </Text>
              {muted ? bellOff : null}
              {mentions > 0 ? count : null}
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}
