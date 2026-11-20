import { Children, type ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

export type ToastRegionSide = "top" | "bottom";
export type ToastRegionAlign = "start" | "center" | "end";

export interface ToastRegionProps extends RootProps {
  /** Which edge of the screen the toasts stack on. */
  side?: ToastRegionSide;
  /** Where along that edge. */
  align?: ToastRegionAlign;
  /** The most toasts shown at once; the newest are kept. */
  max?: number;
  /** The toasts, oldest first. */
  children?: ReactNode;
  /** Per-part styles over the theme: `{ root: {…} }`. */
  styles?: PartStyles<"toast-region">;
  strings?: Partial<KitStrings["toast-region"]>;
  style?: ViewStyle;
}

const ALIGN: Record<ToastRegionAlign, ViewStyle["alignItems"]> = { start: "flex-start", center: "center", end: "flex-end" };

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { gap: t.space.sm, alignSelf: "stretch" },
}));

/**
 * Where the app's toasts appear on the phone: a stack at one edge, the newest nearest it. Drawn where it is mounted: the app lays it
 * over its screen (absolute, inside the safe area), so presses between the toasts reach the screen.
 */
export function ToastRegion({ side = "bottom", align = "center", max = 3, children, styles, strings, style, testID, ...rest }: ToastRegionProps) {
  const s = useStyles();
  const str = useStrings("toast-region", strings);
  const r = useRecipe(recipes["toast-region"], { styles });
  const shown = Children.toArray(children).slice(-Math.max(1, max));
  return (
    <View
      testID={partId(testID, "toast-region", "root")}
      accessibilityLabel={str("label")}
      pointerEvents="box-none"
      {...rootProps(rest)}
      style={[s.root, { flexDirection: side === "bottom" ? "column" : "column-reverse", alignItems: ALIGN[align] }, r.root.view, style]}
    >
      {shown}
    </View>
  );
}
