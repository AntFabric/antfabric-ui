import { Dimensions, Pressable, ScrollView, Text, View, type ViewStyle } from "react-native";
import { recipes, type NativeTokens, useControllable, useStrings, type KitStrings } from "@antfabric-ui/core";
import { createStyles, useTheme } from "../../theme";
import { useBackHandler } from "../../lib/a11y";
import { Icon, type IconName } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Avatar, type AvatarIdentity } from "../display/avatar";
import { IconButton } from "../actions/icon-button";
import { useFormField } from "./form-field";
import { SearchField } from "./search-field";

export interface SelectItem {
  key: string;
  label: string;
  /** A second line under the label in the sheet. */
  supportingText?: string;
  icon?: IconName;
  /** The icon's tint, as a token: `$info.default`. */
  color?: string;
  /** A photo URL; "" draws initials. Leave it out for no avatar. */
  avatar?: string;
  identity?: AvatarIdentity;
  agent?: boolean;
  disabled?: boolean;
}

export interface SelectProps extends RootProps {
  items: SelectItem[];
  /** The chosen item's key. */
  value?: string;
  /** Visible label above the trigger, the sheet's title, and the accessibility label. */
  label?: string;
  /** Shown while nothing is chosen. */
  placeholder?: string;
  /** The sheet is open, under the trigger. */
  open?: boolean;
  /** The row under the cursor. Empty means the chosen row. */
  activeKey?: string;
  /** A filter box at the top of the sheet. */
  searchable?: boolean;
  /** What is in the filter box. items should already be the filtered list. */
  query?: string;
  searchPlaceholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** Why a disabled select is disabled, read as its accessibility hint. */
  title?: string;
  onValueChange?: (key: string) => void;
  /** The sheet opened or closed: by the trigger, a choice, its close button, the screen reader's escape gesture or Android's back button. */
  onOpenChange?: (open: boolean) => void;
  /** The filter box's text changed; filter `items` to match. */
  onQueryChange?: (query: string) => void;
  /** This select's built-in text ("Search", the empty messages) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["select"]>;
  /** Per-part styles over the theme: `{ trigger: {…}, sheet: {…} }`. */
  styles?: PartStyles<"select">;
  style?: ViewStyle;
}

/** `$info.default` → the resolved colour; a literal passes through. */
function tint(t: NativeTokens, color?: string): string {
  if (!color) return t.fg.subtle;
  if (!color.startsWith("$")) return color;
  let at: unknown = t;
  for (const k of color.slice(1).split(".")) at = (at as Record<string, unknown> | undefined)?.[k];
  return typeof at === "string" ? at : t.fg.subtle;
}

/** Layout no token decides; the sizes, fills, edges, spacing and type are the recipe's. */
const useStyles = createStyles((t) => ({
  root: { width: "100%" },
  anchor: { gap: t.space.md },
  // The text field's box: no dropdown on a phone, the trigger opens a sheet.
  trigger: { flexDirection: "row", alignItems: "center", width: "100%" },
  value: { flexGrow: 1, flexShrink: 1 },
  sheet: { width: "100%" },
  grabber: { alignSelf: "center" },
  title: { textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  rowText: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
}));

function Row({ item, chosen, active, pick, styles, testID }: { item: SelectItem; chosen: boolean; active: boolean; pick: () => void; styles?: PartStyles<"select">; testID?: string }) {
  const { t } = useTheme();
  const s = useStyles();
  const press = usePress({ disabled: !!item.disabled });
  // The wash is the cursor's (`on`) and the finger's (`pressed`); a disabled row only fades.
  const r = useRecipe(recipes.select, { state: { on: active, pressed: press.pressed, disabled: press.disabled }, styles });
  // An icon's size is its width and height (`size`); what else `styles` sets on it goes on the glyph.
  const optionIcon = partStyle(r, "optionIcon", { text: { color: tint(t, item.color) } });
  const { width: iconSize, height: _h, ...iconRest } = optionIcon.view;
  return (
    <Pressable
      testID={partId(testID, "select", "option")}
      accessibilityRole="radio"
      accessibilityLabel={item.label}
      accessibilityState={{ checked: chosen, disabled: press.disabled }}
      disabled={press.disabled}
      onPress={pick}
      {...press.handlers}
      style={[s.row, r.option.view]}
    >
      {item.avatar !== undefined ? (
        <Avatar name={item.label} src={item.avatar} size="sm" identity={item.identity ?? "indigo"} agent={!!item.agent} />
      ) : item.icon ? (
        <Icon testID={partId(testID, "select", "optionIcon")} name={item.icon} size={iconSize as number} color={optionIcon.text.color} style={Object.keys(iconRest).length ? iconRest : undefined} />
      ) : null}
      <View style={s.rowText}>
        <Text testID={partId(testID, "select", "optionLabel")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[r.optionLabel.view, r.optionLabel.text]}>
          {item.label}
        </Text>
        {item.supportingText ? (
          <Text testID={partId(testID, "select", "supporting")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[r.supporting.view, r.supporting.text]}>
            {item.supportingText}
          </Text>
        ) : null}
      </View>
      {chosen ? <View testID={partId(testID, "select", "dot")} style={r.dot.view} /> : null}
    </Pressable>
  );
}

export function Select({
  items,
  value = "",
  label = "",
  placeholder = "",
  open = false,
  activeKey = "",
  searchable = false,
  query = "",
  searchPlaceholder,
  invalid = false,
  disabled = false,
  title = "",
  onValueChange,
  onOpenChange,
  onQueryChange,
  strings,
  styles,
  style,
  testID,
  ...rest
}: SelectProps) {
  const form = useFormField();
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("select", strings);
  const press = usePress({ disabled });
  const [current, setCurrent] = useControllable(value, onValueChange);
  const [isOpen, setOpen] = useControllable(open, onOpenChange);
  // Android's back button closes the sheet.
  useBackHandler(() => setOpen(false), isOpen);
  const [filter, setFilter] = useControllable(query, onQueryChange);
  // A phone has no hover; the trigger takes the wash while pressed (the recipe's `pressed`).
  const r = useRecipe(recipes.select, { state: { pressed: press.pressed, focus: press.focused, invalid: invalid || !!form?.invalid, disabled: press.disabled }, styles });
  const chosen = items.find((i) => i.key === current);
  // An icon's size is its width and height (`size`); what else `styles` sets on it goes on the glyph.
  const icon = partStyle(r, "icon", { text: { color: tint(t, chosen?.color) } });
  const { width: iconSize, height: _ih, ...iconRest } = icon.view;
  const { width: caretSize, height: _ch, ...caretRest } = r.caret.view;
  const name = label || placeholder || form?.label || "";
  return (
    <View testID={partId(testID, "select", "root")} {...rootProps(rest)} style={[s.root, r.root.view, style]}>
      {label ? (
        <Text testID={partId(testID, "select", "label")} maxFontSizeMultiplier={fontScale.content} style={[r.label.view, r.label.text]}>
          {label}
        </Text>
      ) : null}
      <View style={s.anchor}>
        <Pressable
          testID={partId(testID, "select", "trigger")}
          accessibilityRole="button"
          accessibilityLabel={chosen ? `${name}, ${chosen.label}` : name}
          accessibilityHint={[title, form?.hint].filter(Boolean).join(". ") || undefined}
          accessibilityState={{ disabled: press.disabled, expanded: isOpen }}
          disabled={press.disabled}
          onPress={() => setOpen(!isOpen)}
          {...press.handlers}
          style={[s.trigger, r.trigger.view]}
        >
          {chosen?.icon ? <Icon testID={partId(testID, "select", "icon")} name={chosen.icon} size={iconSize as number} color={icon.text.color} style={Object.keys(iconRest).length ? iconRest : undefined} /> : null}
          <Text testID={chosen ? undefined : "select.placeholder"} numberOfLines={1} maxFontSizeMultiplier={fontScale.control} style={[s.value, r.trigger.text, !chosen && r.placeholder.view, !chosen && r.placeholder.text]}>
            {chosen ? chosen.label : placeholder}
          </Text>
          <Icon testID={partId(testID, "select", "caret")} name="chevron-down" size={caretSize as number} color={r.caret.text.color} style={Object.keys(caretRest).length ? caretRest : undefined} />
        </Pressable>
        {isOpen ? (
          <Enter testID={partId(testID, "select", "sheet")} motion="slide-up" accessibilityViewIsModal accessibilityLabel={name} onAccessibilityEscape={() => setOpen(false)} style={[s.sheet, r.sheet.view]}>
            <View testID={partId(testID, "select", "grabber")} style={[s.grabber, r.grabber.view]} />
            {/* The way out that is not a choice: a screen reader that opened the sheet by mistake can close it. */}
            <IconButton testID={partId(testID, "select", "close")} icon="x" label={str("close")} size="sm" onPress={() => setOpen(false)} style={{ position: "absolute", top: t.space.sm, end: t.space.sm, zIndex: 1 }} />
            <Text testID={partId(testID, "select", "title")} maxFontSizeMultiplier={fontScale.content} style={[s.title, r.title.text, r.title.view]}>
              {name}
            </Text>
            {searchable ? (
              <View testID={partId(testID, "select", "search")} style={r.search.view}>
                <SearchField placeholder={searchPlaceholder ?? str("searchPlaceholder")} value={filter} onValueChange={(next) => setFilter(next)} />
              </View>
            ) : null}
            {items.length ? null : (
              <Text testID={partId(testID, "select", "empty")} maxFontSizeMultiplier={fontScale.content} style={[r.empty.view, r.empty.text]}>
                {filter ? str("emptyFiltered", { filter }) : str("empty")}
              </Text>
            )}
            {/* As tall as its rows, up to 90% of the screen, then it scrolls. */}
            <ScrollView style={{ maxHeight: Dimensions.get("window").height * 0.9 }} keyboardShouldPersistTaps="handled">
              {items.map((item) => (
                <Row
                  key={item.key}
                  testID={testID}
                  item={item}
                  chosen={item.key === current}
                  active={!!activeKey && item.key === activeKey && !item.disabled}
                  styles={styles}
                  // A single choice is its own confirmation: the sheet closes at once, with no Done button.
                  pick={() => {
                    setCurrent(item.key);
                    setOpen(false);
                  }}
                />
              ))}
            </ScrollView>
          </Enter>
        ) : null}
      </View>
    </View>
  );
}
