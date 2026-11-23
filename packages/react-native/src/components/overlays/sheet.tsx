import type { ReactNode } from "react";
import { Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { BottomSheet } from "./bottom-sheet";

export type SheetSide = "start" | "end";

export interface SheetProps extends RootProps {
  /** The sheet is showing. ✕, the handle, a drag down and Android's back close it (unless `dismissible` is off). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The web's side; the phone always rises from the bottom. */
  side?: SheetSide;
  /** The web's width; the phone's sheet is the screen's width. */
  width?: number;
  title?: string;
  /** A line under the title (the phone draws it at the top of the body). */
  subtitle?: string;
  children?: ReactNode;
  /** The actions under the body. */
  footer?: ReactNode;
  showClose?: boolean;
  /** The sheet's accessibility label when it has no title. */
  label?: string;
  dismissible?: boolean;
  /** Per-part styles over the theme: `{ root: {…} }` (the sheet itself is the BottomSheet's). */
  styles?: PartStyles<"sheet">;
  strings?: Partial<KitStrings["sheet"]>;
  style?: ViewStyle;
}

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  body: { gap: t.space.md },
  footer: { gap: t.space.sm, paddingTop: t.space.md },
}));

/**
 * The phone's Sheet is the BottomSheet: the same job (a record's details, a short form) in the phone's idiom, rising from the bottom.
 * Like the BottomSheet it is drawn where it is mounted; the app presents it (a Modal or its navigator's sheet).
 */
export function Sheet({ open, onOpenChange, side: _side = "end", width: _width = 0, title = "", subtitle = "", children, footer, showClose = true, label = "", dismissible = true, styles, strings, style, testID, ...rest }: SheetProps) {
  const s = useStyles();
  const str = useStrings("sheet", strings);
  const r = useRecipe(recipes.sheet, { styles });
  const [shown = false, setShown] = useControllable(open, onOpenChange);
  if (!shown) return null;
  return (
    <View testID={partId(testID, "sheet", "root")} accessibilityLabel={title ? undefined : label || str("label")} {...rootProps(rest)} style={[r.root.view, style]}>
      <BottomSheet title={title} showClose={showClose && dismissible} onClose={() => dismissible && setShown(false)}>
        <View style={s.body}>
          {subtitle ? <Text testID={partId(testID, "sheet", "subtitle")} style={[r.subtitle.view, r.subtitle.text]}>{subtitle}</Text> : null}
          {children}
          {footer ? <View style={s.footer}>{footer}</View> : null}
        </View>
      </BottomSheet>
    </View>
  );
}
