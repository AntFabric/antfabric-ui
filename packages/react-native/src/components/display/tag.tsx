import { Text, View, type ViewStyle } from "react-native";
import { recipes } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

export type TagTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
export type TagSize = "sm" | "md";

export interface TagProps extends RootProps {
  label: string;
  /** One colour family per tone in every theme. brand is blue, not coral: a status tag never says "needs you". */
  tone?: TagTone;
  /** Optional leading glyph, for when the word alone is ambiguous at a glance (lock for Private). */
  icon?: IconName;
  /** md is 4 × 8, to sit in a 44pt row; sm is 2 × 8, for the densest rows. */
  size?: TagSize;
  /** Per-part styles over the theme: `{ root: {…}, icon: {…} }`. */
  styles?: PartStyles<"tag">;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (fill, ink, type, padding, radius, gap) is the recipe's. */
const useStyles = createStyles(() => ({
  root: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", maxWidth: "100%" },
  label: { flexShrink: 1 },
}));

/** A fact about its row, never a control: no press, and read as part of the row's text. */
export function Tag({ label, tone = "neutral", icon = "", size = "md", styles, style, testID, ...rest }: TagProps) {
  const s = useStyles();
  const r = useRecipe(recipes.tag, { variants: { tone, size }, styles });
  // The icon's size is its width and height; what else `styles.icon` sets goes on the glyph.
  const { width: iconSize, height: _h, ...iconRest } = r.icon.view;
  return (
    <View testID={partId(testID, "tag", "root")} {...rootProps(rest)} style={[s.root, r.root.view, style]}>
      {icon ? <Icon testID={partId(testID, "tag", "icon")} name={icon} size={iconSize as number} color={r.icon.text.color ?? r.root.text.color} style={Object.keys(iconRest).length ? iconRest : undefined} /> : null}
      <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={[s.label, r.root.text]}>
        {label}
      </Text>
    </View>
  );
}
