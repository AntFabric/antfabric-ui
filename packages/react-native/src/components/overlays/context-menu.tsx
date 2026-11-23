import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View, findNodeHandle, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { hitSlopTo, useBackHandler } from "../../lib/a11y";
import { GlassSurface } from "../../lib/glass";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { IconButton } from "../actions/icon-button";
import type { AvatarIdentity } from "../display/avatar";
import { Menu, type MenuItem } from "./menu";

/** A row of the sheet under the reactions, in Menu's own shape. */
export type ContextMenuItem = MenuItem;

/** `nativeID`, the accessibility label and hint, and `ref` name the dialog; `testID` and `style` stay on the root. */
export interface ContextMenuProps extends RootProps {
  /** The quick set, as emoji, in order. Empty draws no reaction row at all (and no +). */
  quickReactions?: string[];
  /** Which of `quickReactions` are the person's own: pressing one takes its emoji out, pressing another puts it in. */
  picked?: string[];
  items?: ContextMenuItem[];
  /** The rows' accessible name. Default: the `actions` string. */
  label?: string;
  /** The sheet's title; also its accessible name. Empty draws none and the sheet is named by `label`. */
  title?: string;
  /** The full emoji panel is open under the quick set (the + was pressed). */
  picking?: boolean;
  /** The message pressed. Drawn on web and desktop; on the phone it stays in view above the sheet. */
  author?: string;
  /** The author's fallback avatar colour. */
  identity?: AvatarIdentity;
  time?: string;
  /** The message text. */
  body?: string;
  onReact?: (emoji: string) => void;
  onSelect?: (item: ContextMenuItem) => void;
  onClose?: () => void;
  /** Per-part styles over the theme: `{ sheet: {…}, reaction: {…}, emoji: {…}, picker: {…} }`. */
  styles?: PartStyles<"context-menu">;
  /** This sheet's built-in text (the reaction row's and buttons' names, the emoji panel's headings and search) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["context-menu"]>;
  style?: ViewStyle;
}

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { alignSelf: "stretch", width: 375, maxWidth: "100%", paddingTop: 120, justifyContent: "flex-end" }, /* structural: stage: a 375pt phone frame and room above the sheet */
  sheet: { paddingTop: t.space.md, gap: t.space.xs },
  glass: { marginHorizontal: t.space.sm, marginBottom: t.space.sm, borderRadius: t.sheet.glassRadius },
  handle: { alignSelf: "center", marginBottom: t.space.sm },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.space.sm },
  title: { flexShrink: 1 },
  reactions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.space["3xs"], paddingHorizontal: t.space.xs, paddingVertical: t.space.sm },
  reaction: { alignItems: "center", justifyContent: "center" },
  picker: { height: 260, gap: t.space.sm, padding: t.space.md, overflow: "hidden" }, /* structural: stage: the height of the emoji picker the demo stands in for */
  search: { flexDirection: "row", alignItems: "center", gap: t.space.sm, paddingHorizontal: t.space.md },
  input: { flex: 1, padding: 0 },
  grid: { letterSpacing: 26 * 0.22, lineHeight: 26 * 1.2 },
  rows: { marginHorizontal: -t.gutter.pane, width: "auto" },
}));

/** An icon's size is its width and height (`size`); what else a part's style sets goes on the glyph. */
const glyphBox = (view: ViewStyle) => {
  const { width, height: _h, ...rest } = view;
  return { size: width as number, rest: Object.keys(rest).length ? rest : undefined };
};

function Reaction({ label, mine, expanded, testID, styles, onPress, children }: { label: string; mine?: boolean; expanded?: boolean; testID?: string; styles?: PartStyles<"context-menu">; onPress: () => void; children: ReactNode }) {
  const s = useStyles();
  const press = usePress();
  const part = expanded === undefined ? "reaction" : "more";
  // A phone has no hover, so there is none here. The + is `on` while the emoji panel is open; a reaction is `on` when it is yours.
  const r = useRecipe(recipes["context-menu"], { state: { pressed: press.pressed, focus: press.focused, on: part === "more" ? expanded : mine }, styles });
  const look = partStyle(r, part, { view: press.pressed && { transform: [{ scale: 0.92 }] } });
  return (
    <Pressable
      testID={partId(testID, "context-menu", part)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: mine, expanded }}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.reaction, look.view]}
    >
      {children}
    </Pressable>
  );
}

/** The emoji the panel lists under its two headings, each with its Unicode name, which the search field matches. The cells are pressable: one reacts. */
const FREQUENT: [emoji: string, name: string][] = [
  ["👍", "thumbs up"],
  ["❤️", "red heart"],
  ["😂", "face with tears of joy"],
  ["🎉", "party popper"],
  ["👀", "eyes"],
  ["✅", "check mark button"],
  ["🙏", "folded hands"],
  ["🔥", "fire"],
];
const SMILEYS: [emoji: string, name: string][] = [
  ["😀", "grinning face"],
  ["😃", "grinning face with big eyes"],
  ["😄", "grinning face with smiling eyes"],
  ["😁", "beaming face with smiling eyes"],
  ["😆", "grinning squinting face"],
  ["🥹", "face holding back tears"],
  ["😅", "grinning face with sweat"],
  ["🤣", "rolling on the floor laughing"],
];

export function ContextMenu({ quickReactions = [], picked = [], items = [], label, title = "", picking = false, onReact, onSelect, onClose, styles, strings, style, testID, ...rest }: ContextMenuProps) {
  const { t } = useTheme();
  const s = useStyles();
  const [search, setSearch] = useState("");
  const str = useStrings("context-menu", strings);
  // The person's own quick reactions (a new array of the same emoji is not a change).
  const [owned, setOwned] = useControllable(picked);
  const [open, setOpen] = useControllable(picking);
  const r = useRecipe(recipes["context-menu"], { styles });
  const { placeholderTextColor, ...inputText } = r.input.text;
  // The + turns coral while the emoji panel is open.
  const rOpen = useRecipe(recipes["context-menu"], { state: { on: open }, styles });
  const moreIcon = glyphBox(rOpen.moreIcon.view);
  const searchIcon = glyphBox(r.searchIcon.view);
  const mine = (emoji: string) => owned.includes(emoji);
  const react = (emoji: string) => {
    setOwned(mine(emoji) ? owned.filter((e) => e !== emoji) : [...owned, emoji]);
    onReact?.(emoji);
  };
  // What the search field has typed narrows each list to the emoji whose name holds it; a heading with none left is not drawn.
  const query = search.trim().toLowerCase();
  const matching = (list: [string, string][]) => list.filter(([emoji, name]) => !query || name.includes(query) || emoji === query).map(([emoji]) => emoji);
  const frequent = matching(FREQUENT);
  const smileys = matching(SMILEYS);
  // A cell of the panel: pressing it reacts, and a screen reader reads it as a button named by the emoji.
  const cells = (list: string[]) =>
    list.map((emoji, i) => (
      <Text key={emoji} accessibilityRole="button" accessibilityLabel={str(mine(emoji) ? "unreact" : "react", { emoji })} onPress={() => react(emoji)}>
        {emoji}
        {i < list.length - 1 ? " " : ""}
      </Text>
    ));
  // Android's back button closes the sheet; a screen reader starts at the title (else the handle) when it opens.
  useBackHandler(() => onClose?.());
  const heading = useRef<Text>(null);
  const grabber = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS === "web") return;
    const target = title ? heading.current : grabber.current;
    const node = target ? findNodeHandle(target) : null;
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View testID={partId(testID, "context-menu", "root")} style={[s.root, r.root.view, style]}>
      <Enter motion="slide-up" role="dialog" aria-modal accessibilityViewIsModal accessibilityLabel={title || (label ?? str("actions"))} {...rootProps(rest)}>
        {/* The emoji panel's search field is lifted above the keyboard. */}
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <GlassSurface testID={partId(testID, "context-menu", "sheet")} style={[s.sheet, r.sheet.view]} glassStyle={[s.glass, styles?.sheet]}>
          <Pressable testID={partId(testID, "context-menu", "handle")} accessibilityRole="button" accessibilityLabel={str("dismiss")} ref={grabber} hitSlop={hitSlopTo(t.control.hit, t.sheet.grabberH, t.sheet.grabberW)} onPress={() => onClose?.()} style={[s.handle, r.handle.view]} />
          <View style={s.header}>
            <Text ref={heading} testID={partId(testID, "context-menu", "title")} accessibilityRole="header" numberOfLines={1} style={[s.title, r.title.view, r.title.text]}>
              {title}
            </Text>
            <IconButton icon="x" label={str("close")} onPress={() => onClose?.()} />
          </View>
          {quickReactions.length > 0 ? (
            <View role="group" accessibilityLabel={str("quickReactions")} style={s.reactions}>
              {quickReactions.map((emoji) => (
                <Reaction
                  key={emoji}
                  label={str(mine(emoji) ? "unreact" : "react", { emoji })}
                  mine={mine(emoji)}
                  styles={styles}
                  testID={testID}
                  onPress={() => react(emoji)}
                >
                  <Text testID={partId(testID, "context-menu", "emoji")} style={[r.emoji.view, r.emoji.text]}>{emoji}</Text>
                </Reaction>
              ))}
              <Reaction label={str("more")} expanded={open} testID={testID} styles={styles} onPress={() => setOpen(!open)}>
                <Icon testID={partId(testID, "context-menu", "moreIcon")} name={open ? "x" : "plus"} size={moreIcon.size} color={rOpen.moreIcon.text.color} style={moreIcon.rest} />
              </Reaction>
            </View>
          ) : null}
          {open ? (
            <Enter testID={partId(testID, "context-menu", "picker")} motion="fade" style={[s.picker, r.picker.view]}>
              <View testID={partId(testID, "context-menu", "search")} style={[s.search, r.search.view]}>
                <Icon testID={partId(testID, "context-menu", "searchIcon")} name="search" size={searchIcon.size} color={r.searchIcon.text.color} style={searchIcon.rest} />
                <TextInput testID={partId(testID, "context-menu", "input")} value={search} onChangeText={setSearch} placeholder={str("searchEmoji")} accessibilityLabel={str("searchEmoji")} placeholderTextColor={placeholderTextColor} style={[s.input, r.input.view, inputText]} />
              </View>
              {frequent.length ? <Text testID={partId(testID, "context-menu", "heading")} style={[r.heading.view, r.heading.text]}>{str("frequent")}</Text> : null}
              {frequent.length ? <Text testID={partId(testID, "context-menu", "grid")} style={[s.grid, r.grid.view, r.grid.text]}>{cells(frequent)}</Text> : null}
              {smileys.length ? <Text testID={partId(testID, "context-menu", "heading")} style={[r.heading.view, r.heading.text]}>{str("smileys")}</Text> : null}
              {smileys.length ? <Text testID={partId(testID, "context-menu", "grid")} style={[s.grid, r.grid.view, r.grid.text]}>{cells(smileys)}</Text> : null}
            </Enter>
          ) : (
            <Menu items={items} label={label ?? str("actions")} bare onSelect={(item) => onSelect?.(item)} onClose={() => onClose?.()} style={s.rows} />
          )}
          <View testID={partId(testID, "context-menu", "home")} style={r.home.view} />
        </GlassSurface>
        </KeyboardAvoidingView>
      </Enter>
    </View>
  );
}
