import { Text, View, type ViewStyle } from "react-native";
import { recipes } from "@antfabric-ui/core";
import { createStyles } from "../../theme";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerInset = "none" | "sm" | "md";

export interface DividerProps extends RootProps {
  orientation?: DividerOrientation;
  label?: string;
  inset?: DividerInset;
  /** Per-part styles over the theme: `{ root: {…}, rule: {…}, label: {…} }`. */
  styles?: PartStyles<"divider">;
  style?: ViewStyle;
}

/** Layout no token decides. */
const useStyles = createStyles(() => ({
  horizontal: { flexDirection: "row", alignItems: "center", alignSelf: "stretch" },
  vertical: { flexDirection: "column", alignItems: "center", alignSelf: "stretch" },
  rule: { flex: 1 },
  label: { flexShrink: 1, textAlign: "center" },
}));

export function Divider({ orientation = "horizontal", label = "", inset = "none", styles, style, testID, ...rest }: DividerProps) {
  const s = useStyles();
  const vertical = orientation === "vertical";
  const r = useRecipe(recipes.divider, { variants: { orientation, inset }, styles });
  const labelled = !vertical && label !== "";
  return (
    <View testID={partId(testID, "divider", "root")} accessibilityRole="none" accessibilityLabel={labelled ? label : undefined} {...rootProps(rest)} style={[vertical ? s.vertical : s.horizontal, r.root.view, style]}>
      {labelled ? <View testID={partId(testID, "divider", "rule")} style={[s.rule, r.rule.view]} /> : null}
      {labelled ? (
        <Text testID={partId(testID, "divider", "label")} style={[s.label, r.label.view, r.label.text]}>
          {label}
        </Text>
      ) : null}
      {labelled ? <View testID={partId(testID, "divider", "rule")} style={[s.rule, r.rule.view]} /> : null}
      {!labelled ? <View testID={partId(testID, "divider", "rule")} style={[s.rule, r.rule.view]} /> : null}
    </View>
  );
}
