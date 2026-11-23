import { Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { fontScale } from "../../lib/type";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyle, type PartStyles } from "../../lib/recipe";
import { Avatar, type AvatarIdentity } from "../display/avatar";
import { Badge } from "../display/badge";

export interface WorkspaceSwitcherWorkspace {
  /** What `current` matches and the list is keyed by. */
  key: string;
  name: string;
  host: string;
  identity?: AvatarIdentity;
  current?: boolean;
  /** Mentions waiting there: a coral count. */
  mentions?: number;
  /** New messages nobody asked you about: a quiet dot. */
  activity?: boolean;
  signedIn?: boolean;
  src?: string;
}

export interface WorkspaceSwitcherProps extends RootProps {
  /** Every workspace this device has signed into, in the person's own order. */
  workspaces?: WorkspaceSwitcherWorkspace[];
  /** The key of the workspace this app is in. Empty falls back to each workspace's own `current`. */
  current?: string;
  /** The add row's name. Default: the `add` string. */
  addLabel?: string;
  /** A workspace was picked: its key. A signed-out workspace fires it too, so the app can start its sign-in; `current` then stays where it is. */
  onCurrentChange?: (current: string) => void;
  onAdd?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, row: {…}, name: {…} }`. */
  styles?: PartStyles<"workspace-switcher">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["workspace-switcher"]>;
  style?: ViewStyle;
}

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  sheet: { width: "100%", gap: t.space["3xs"] },
  grabber: { alignSelf: "center", marginTop: t.space.xs, marginBottom: t.space.md },
  title: { marginBottom: t.space.sm },
  row: { flexDirection: "row", alignItems: "center", gap: t.space.md },
  text: { flex: 1, minWidth: 0 },
  plus: { alignItems: "center", justifyContent: "center", borderStyle: "dashed" },
}));

/** An icon part as the glyph draws it: its width is the size, its text colour the ink, the rest of its view style (what `styles` adds) the glyph's style. */
function glyphOf(p: PartStyle) {
  const { width, height: _height, ...rest } = p.view as ViewStyle;
  return { size: width as number, color: p.text.color, style: Object.keys(rest).length ? (rest as ViewStyle) : undefined };
}

interface Shared {
  styles?: PartStyles<"workspace-switcher">;
  strings?: Partial<KitStrings["workspace-switcher"]>;
}

function Row({ ws, on, onPress, styles, strings, testID }: Shared & { testID?: string; ws: WorkspaceSwitcherWorkspace; on: boolean; onPress: () => void }) {
  const s = useStyles();
  const str = useStrings("workspace-switcher", strings);
  const press = usePress();
  const r = useRecipe(recipes["workspace-switcher"], { state: { focus: press.focused }, styles });
  const live = !!ws.signedIn;
  const mentions = live && (ws.mentions ?? 0) > 0 ? ws.mentions! : 0;
  // The activity dot is said too, as on the desktop tile: it is not only a dot.
  const activity = live && !!ws.activity && !mentions && !on;
  const said = [on ? str("currentWorkspace") : "", mentions ? str("mentions", { count: mentions }) : "", activity ? str("newMessages") : "", live ? "" : str("signedOut")]
    .filter(Boolean)
    .reduce((label, detail) => str("withDetail", { label, detail }), ws.name);
  const row = partStyle(r, "row", { view: press.pressed ? { opacity: 0.6 } : undefined });
  return (
    <Pressable
      testID={partId(testID, "workspace-switcher", "row")}
      accessibilityRole="button"
      accessibilityLabel={said}
      accessibilityState={{ selected: on }}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.row, row.view]}
    >
      <Avatar name={ws.name} src={ws.src ?? ""} shape="square" size="md" identity={ws.identity ?? "ink"} />
      <View style={s.text}>
        <Text testID={partId(testID, "workspace-switcher", "name")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[r.name.view, r.name.text]}>
          {ws.name}
        </Text>
        <Text testID={partId(testID, "workspace-switcher", "host")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[r.host.view, r.host.text]}>
          {live ? ws.host : str("signedOutHost", { host: ws.host })}
        </Text>
      </View>
      {mentions && !on ? <Badge count={mentions} label={str("mentionsBadge")} style={{ alignSelf: "center" }} /> : null}
      {activity ? <Badge dot tone="neutral" style={{ alignSelf: "center" }} /> : null}
      {on ? (
        <Enter motion="pop">
          <Icon testID={partId(testID, "workspace-switcher", "check")} name="check" {...glyphOf(r.check)} />
        </Enter>
      ) : null}
    </Pressable>
  );
}

function AddRow({ label, onPress, styles, testID }: Shared & { testID?: string; label: string; onPress: () => void }) {
  const s = useStyles();
  const press = usePress();
  const r = useRecipe(recipes["workspace-switcher"], { state: { focus: press.focused }, styles });
  const row = partStyle(r, "row", { view: press.pressed ? { opacity: 0.6 } : undefined });
  return (
    <Pressable
      testID={partId(testID, "workspace-switcher", "row")}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.row, row.view]}
    >
      <View testID={partId(testID, "workspace-switcher", "plus")} style={[s.plus, r.plus.view]}>
        <Icon testID={partId(testID, "workspace-switcher", "plusIcon")} name="plus" {...glyphOf(r.plusIcon)} />
      </View>
      <Text testID={partId(testID, "workspace-switcher", "name")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[s.text, r.name.view, r.name.text]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** The sheet the header photo opens on a long-press: every workspace, the current one ticked. */
export function WorkspaceSwitcher({ workspaces = [], current, addLabel = "", onCurrentChange, onAdd, styles, strings, style, testID, ...rest }: WorkspaceSwitcherProps) {
  const s = useStyles();
  const str = useStrings("workspace-switcher", strings);
  const r = useRecipe(recipes["workspace-switcher"], { styles });
  // Controlled when the app passes both: it confirms the switch first, then moves `current` itself.
  const [active = "", setCurrent] = useControllable(current, onCurrentChange);
  const pick = (ws: WorkspaceSwitcherWorkspace) => {
    // A signed-out workspace starts sign-in instead: the app hears of it, and nothing changes here.
    if (ws.signedIn) setCurrent(ws.key);
    else onCurrentChange?.(ws.key);
  };
  return (
    <Enter testID={partId(testID, "workspace-switcher", "root")} motion="slide-up" accessibilityViewIsModal accessibilityLabel={str("workspaces")} {...rootProps(rest)} style={[s.sheet, r.root.view, style]}>
      <View testID={partId(testID, "workspace-switcher", "grabber")} style={[s.grabber, r.grabber.view]} />
      <Text testID={partId(testID, "workspace-switcher", "title")} accessibilityRole="header" maxFontSizeMultiplier={fontScale.content} style={[s.title, r.title.view, r.title.text]}>
        {str("workspaces")}
      </Text>
      {workspaces.map((ws) => (
        <Row key={ws.key} testID={testID} ws={ws} on={active ? ws.key === active : !!ws.current} onPress={() => pick(ws)} styles={styles} strings={strings} />
      ))}
      <AddRow testID={testID} label={addLabel || str("add")} onPress={() => onAdd?.()} styles={styles} />
    </Enter>
  );
}
