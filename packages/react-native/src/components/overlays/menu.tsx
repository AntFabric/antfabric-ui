import { useState } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { menuItemKey, recipes, useStrings, type KitStrings, type MenuItem } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { IconButton } from "../actions/icon-button";

export type MenuPlacement = "below" | "above";

/** A row of the menu: the shape is core's, shared with ContextMenu, AppMenuBar and TrayMenu. */
export type { MenuItem };

export interface MenuProps extends RootProps {
  /** The menu's accessibility label. */
  label?: string;
  items?: MenuItem[];
  /** Draws the ⋮ that opened the menu, so the panel is seen hanging from it. */
  showTrigger?: boolean;
  triggerIcon?: IconName;
  triggerLabel?: string;
  /** above is what the app picks when the ⋮ is too near the bottom of the screen. */
  placement?: MenuPlacement;
  /** Rows only, no card: the long-press sheet lists the menu's own rows this way. */
  bare?: boolean;
  /** The key (else the label) of the checkable row just pressed: its check is drawn flipped from what `items` says until the caller's `checked` catches up. */
  toggled?: string;
  /** A row was chosen. For a toggle row the caller flips its `checked`. */
  onSelect?: (item: MenuItem) => void;
  onClose?: () => void;
  /** Per-part styles over the theme: `{ panel: {…}, row: {…}, icon: {…} }`. */
  styles?: PartStyles<"menu">;
  /** This menu's built-in text (the trigger's name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["menu"]>;
  style?: ViewStyle;
}

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { alignItems: "flex-end", gap: t.space["2xs"] },
  panel: { maxWidth: "100%", padding: t.space.xs },
  bare: { width: "100%", padding: 0, borderWidth: 0, borderRadius: 0, boxShadow: "none" },
  separator: { marginVertical: t.space["2xs"] },
  section: { paddingHorizontal: t.space.md, paddingTop: t.space.xs, paddingBottom: t.space["2xs"] },
  row: { flexDirection: "row", gap: t.space.md, paddingHorizontal: t.space.md, paddingVertical: t.space.smMd },
  rowText: { flex: 1, minWidth: 0 },
  count: { fontVariant: ["tabular-nums"] },
  tickBox: { alignItems: "center", justifyContent: "center" },
}));

/**
 * `toggled` flips one checkable row from what `items` says. A press flips the row it lands on (or
 * back), and the flip lapses once the caller's own `checked` changes, so a caller that owns the
 * value is never drawn double-flipped.
 */
function useFlip(toggled: string) {
  const [flip, setFlip] = useState<{ key: string; was?: boolean }>({ key: toggled });
  const [seed, setSeed] = useState(toggled);
  if (seed !== toggled) {
    setSeed(toggled);
    setFlip({ key: toggled });
  }
  const on = (item: MenuItem) => {
    const flipped = flip.key !== "" && menuItemKey(item) === flip.key && (flip.was === undefined || flip.was === item.checked);
    return flipped ? !item.checked : !!item.checked;
  };
  const press = (item: MenuItem) => setFlip(flip.key === menuItemKey(item) ? { key: "" } : { key: menuItemKey(item), was: item.checked });
  return { on, press };
}

/** An icon's size is its width and height (`size`); what else a part's style sets goes on the glyph. */
const glyphBox = (view: ViewStyle) => {
  const { width, height: _h, ...rest } = view;
  return { size: width as number, rest: Object.keys(rest).length ? rest : undefined };
};

/** "Files, None" · "Mute channel, No badges unless someone @mentions you" */
const spoken = (item: MenuItem) => `${item.label ?? ""}${item.count != null ? `, ${item.count}` : ""}${item.sublabel ? `, ${item.sublabel}` : ""}`;

function MenuRow({ item, checked, testID, styles, onPress }: { item: MenuItem; checked: boolean; testID?: string; styles?: PartStyles<"menu">; onPress: () => void }) {
  const { t } = useTheme();
  const s = useStyles();
  const press = usePress({ disabled: item.disabled });
  const toggle = typeof item.checked === "boolean";
  const part = item.tone === "danger" ? "rowDanger" : "row";
  // A phone has no hover, so there is none here.
  const r = useRecipe(recipes.menu, { state: { pressed: press.pressed, focus: press.focused, disabled: press.disabled, on: checked }, styles });
  const fg = r[part].text.color;
  const icon = partStyle(r, "icon", { view: { marginTop: item.sublabel ? 1 : 0 }, text: { color: fg } });
  const iconGlyph = glyphBox(icon.view);
  const label = partStyle(r, "label", { text: { color: fg } });
  const tickIcon = glyphBox(r.tickIcon.view);
  return (
    <Pressable
      testID={partId(testID, "menu", part)}
      accessibilityRole={toggle ? "checkbox" : "menuitem"}
      accessibilityLabel={spoken(item)}
      accessibilityState={{ disabled: press.disabled, checked: toggle ? checked : undefined }}
      disabled={press.disabled}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.row, partStyle(r, part, { view: { alignItems: item.sublabel ? "flex-start" : "center" } }).view]}
    >
      {item.icon ? <Icon testID={partId(testID, "menu", "icon")} name={item.icon} size={iconGlyph.size} color={icon.text.color} style={iconGlyph.rest} /> : null}
      <View testID={partId(testID, "menu", "text")} style={[s.rowText, r.text.view]}>
        <Text testID={partId(testID, "menu", "label")} numberOfLines={1} style={[label.view, label.text]}>
          {item.label}
        </Text>
        {item.sublabel ? (
          <Text testID={partId(testID, "menu", "sublabel")} numberOfLines={1} style={[r.sublabel.view, r.sublabel.text]}>
            {item.sublabel}
          </Text>
        ) : null}
      </View>
      {item.count != null ? (
        <Text testID={partId(testID, "menu", "count")} numberOfLines={1} accessibilityElementsHidden importantForAccessibility="no" style={[s.count, r.count.view, r.count.text]}>
          {item.count}
        </Text>
      ) : null}
      {toggle ? (
        <View testID={partId(testID, "menu", "tick")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.tickBox, r.tick.view]}>
          {checked ? (
            <Enter motion="pop">
              <Icon testID={partId(testID, "menu", "tickIcon")} name="check" size={tickIcon.size} strokeWidth={t.icon.strokeTick} color={r.tickIcon.text.color ?? r.tick.text.color} style={tickIcon.rest} />
            </Enter>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export function Menu({
  label,
  items = [],
  showTrigger = false,
  triggerIcon = "ellipsis-vertical",
  triggerLabel,
  placement = "below",
  bare = false,
  toggled = "",
  onSelect,
  onClose,
  styles,
  strings,
  style,
  testID,
  ...rest
}: MenuProps) {
  const s = useStyles();
  const str = useStrings("menu", strings);
  const r = useRecipe(recipes.menu, { variants: { bare }, styles });
  const flip = useFlip(toggled);
  const trigger = showTrigger && !bare ? <IconButton icon={triggerIcon} label={triggerLabel ?? str("moreActions")} active onPress={() => onClose?.()} style={{ alignSelf: "flex-end" }} /> : null;
  return (
    <View style={[s.root, { alignSelf: bare ? "stretch" : "flex-start" }, style]}>
      {placement === "below" ? trigger : null}
      {/* The rows inside a sheet arrive with the sheet. */}
      <Enter testID={partId(testID, "menu", "panel")} motion={bare ? null : "pop"} accessibilityRole="menu" accessibilityLabel={label} {...rootProps(rest)} style={[s.panel, partStyle(r, "panel", { view: bare && s.bare }).view]}>
        {items.map((item, i) => {
          if (item.type === "separator") return <View key={i} testID={partId(testID, "menu", "separator")} style={[s.separator, r.separator.view]} />;
          if (item.type === "label")
            return (
              <Text key={i} testID={partId(testID, "menu", "section")} numberOfLines={1} style={[s.section, r.section.view, r.section.text]}>
                {item.label}
              </Text>
            );
          return (
            <MenuRow
              key={i}
              item={item}
              checked={flip.on(item)}
              testID={testID}
              styles={styles}
              onPress={() => {
                if (typeof item.checked === "boolean") flip.press(item);
                onSelect?.(item);
              }}
            />
          );
        })}
      </Enter>
      {placement === "above" ? trigger : null}
    </View>
  );
}
