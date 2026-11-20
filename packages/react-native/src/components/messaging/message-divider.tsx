import { Platform, Text, View, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings } from "@antfabric-ui/core";
import { createStyles } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";

export type MessageDividerKind = "date" | "new";

export interface MessageDividerProps extends RootProps {
  /** date marks a day boundary; new marks the first message you have not read. */
  kind?: MessageDividerKind;
  /** "Today", "Yesterday", "Monday", "Monday, 27 October" — in the reader's locale and time zone. Ignored for new. Empty reads strings `today`. */
  label?: string;
  /** The translucent day pill shown over the list while it scrolls. Not a button on the phone. */
  sticky?: boolean;
  /** This divider's built-in text ("Today", "New messages", the pill's name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["message-divider"]>;
  /** Per-part styles over the theme: `{ root: {…}, rule: {…}, label: {…} }`. */
  styles?: PartStyles<"message-divider">;
  style?: ViewStyle;
}

/** Layout no token decides; the colours, sizes and type are the recipe's (`messageDivider`). */
const useStyles = createStyles(() => ({
  root: { flexDirection: "row", alignItems: "center", width: "100%" },
  rootSticky: { justifyContent: "center" },
  rule: { flex: 1 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
    // React Native has no backdrop blur of its own; the overlay colour is nearly opaque on a phone.
    ...(Platform.OS === "web" ? ({ backdropFilter: "blur(12px)" } as ViewStyle) : null),
  },
  label: { flexShrink: 0 },
}));

export function MessageDivider({ kind = "date", label = "", sticky = false, strings, styles, style, testID, ...rest }: MessageDividerProps) {
  const s = useStyles();
  const str = useStrings("message-divider", strings);
  const r = useRecipe(recipes["message-divider"], { variants: { kind, sticky }, styles });
  const date = kind === "date";
  const isNew = kind === "new";
  const shown = label || str("today");
  const root = partStyle(r, "root", { view: sticky ? s.rootSticky : undefined });
  const newLabel = partStyle(r, "newLabel", { text: { letterSpacing: (r.newLabel.text.fontSize as number) * 0.02 } });
  const rule = <View testID={partId(testID, "message-divider", "rule")} style={[s.rule, r.rule.view]} />;
  const text = (
    <Text testID={partId(testID, "message-divider", "label")} maxFontSizeMultiplier={fontScale.chrome} numberOfLines={1} style={[s.label, r.label.view, r.label.text]}>
      {shown}
    </Text>
  );
  return (
    <View
      accessible={!sticky || date}
      accessibilityRole={date && !sticky ? "header" : undefined}
      role={isNew ? "separator" : undefined}
      accessibilityLabel={isNew ? str("newMessages") : sticky ? str("showing", { label: shown }) : shown}
      {...rootProps(rest)}
      testID={partId(testID, "message-divider", "root")}
      style={[s.root, root.view, style]}
    >
      {!sticky ? rule : null}
      {date && !sticky ? text : null}
      {date && sticky ? <View testID={partId(testID, "message-divider", "stickyPill")} style={[s.pill, r.stickyPill.view]}>
          {text}
        </View> : null}
      {isNew ? (
        <Text testID={partId(testID, "message-divider", "newLabel")} maxFontSizeMultiplier={fontScale.chrome} numberOfLines={1} style={[s.label, newLabel.view, newLabel.text]}>
          {str("newMessages")}
        </Text>
      ) : null}
      {!sticky ? rule : null}
    </View>
  );
}
