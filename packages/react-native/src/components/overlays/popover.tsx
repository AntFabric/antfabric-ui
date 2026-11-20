import { useRef, useState, type ReactNode } from "react";
import { Modal, Pressable, View, type LayoutRectangle, type ViewStyle } from "react-native";
import { recipes, useControllable } from "@antfabric-ui/core";
import { createStyles, useTheme } from "../../theme";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";

export type PopoverSide = "top" | "bottom" | "left" | "right";
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverProps extends RootProps {
  /** What the panel holds: a list, a form, a Menu (with `bare`), a card of anything. */
  content?: ReactNode;
  /** The panel is showing. A press on the trigger toggles it; the backdrop and Android's back close it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which side of the trigger the panel hangs on. Where there is no room, it flips to the other side. */
  side?: PopoverSide;
  align?: PopoverAlign;
  /** The panel's width in points; 0 lets it take its content's width. */
  width?: number;
  /** The panel is exactly as wide as its trigger. */
  matchTrigger?: boolean;
  /** The panel's accessibility label, when its content does not name itself. */
  label?: string;
  /** No card: the content is already one (a Menu). */
  bare?: boolean;
  /** The screen behind is out of reach for a screen reader until it closes. */
  modal?: boolean;
  /** With no `children`: draws a button the panel belongs to, and the panel beside it, as the catalogue does. */
  showTrigger?: boolean;
  triggerLabel?: string;
  /** The control the panel belongs to. A press on it toggles the panel, drawn in a transparent Modal over the screen. */
  children?: ReactNode;
  /** Per-part styles over the theme: `{ root: {…}, panel: {…} }`. */
  styles?: PartStyles<"popover">;
  style?: ViewStyle;
}

const DIRECTION: Record<PopoverSide, ViewStyle["flexDirection"]> = { top: "column-reverse", bottom: "column", left: "row-reverse", right: "row" };

/** The layout no token decides; what the tokens decide is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { alignSelf: "flex-start", alignItems: "flex-start", gap: t.space.xs },
  backdrop: { flex: 1 },
  floating: { position: "absolute" },
}));

/**
 * A panel that hangs from the control that opened it. On the phone it is drawn in a transparent `Modal` over the screen, placed from the
 * trigger's position in the window (`measureInWindow`), flipped to the other side where there is no room; a press on the backdrop and
 * Android's back close it. With no `children` it draws its own button and the panel in flow beside it, as the catalogue shows it.
 */
export function Popover({
  content = null,
  open = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  width = 0,
  matchTrigger = false,
  label = "",
  bare = false,
  modal = false,
  showTrigger = true,
  triggerLabel = "Open",
  children,
  styles,
  style,
  testID,
  ...rest
}: PopoverProps) {
  const s = useStyles();
  const { t } = useTheme();
  const r = useRecipe(recipes.popover, { variants: { bare }, styles });
  const [shown, setShown] = useControllable(open, onOpenChange);
  const trigger = useRef<View | null>(null);
  const [at, setAt] = useState<LayoutRectangle | null>(null);
  const [screen, setScreen] = useState<{ width: number; height: number } | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const floating = children !== undefined && children !== null && children !== false;
  const gap = t.space.xs;

  const toggle = () => {
    if (!shown) trigger.current?.measureInWindow((x, y, w, h) => setAt({ x, y, width: w, height: h }));
    setShown(!shown);
  };

  const panel = (place?: ViewStyle) => (
    <Enter
      testID={partId(testID, "popover", "panel")}
      motion={bare ? null : "pop"}
      accessibilityViewIsModal={modal || undefined}
      accessibilityLabel={!bare && label ? label : undefined}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      style={[matchTrigger && at ? { width: at.width } : width ? { width } : null, partStyle(r, "panel").view, place]}
    >
      {content}
    </Enter>
  );

  let place: ViewStyle | undefined;
  if (at && screen && size) {
    const vertical = side === "top" || side === "bottom";
    const below = screen.height - (at.y + at.height) - gap * 2;
    const above = at.y - gap * 2;
    const flip = vertical && (side === "bottom" ? below < size.height && above > below : above < size.height && below > above);
    const s0 = flip ? (side === "bottom" ? "top" : "bottom") : side;
    let top = s0 === "bottom" ? at.y + at.height + gap : s0 === "top" ? at.y - gap - size.height : align === "start" ? at.y : align === "end" ? at.y + at.height - size.height : at.y + (at.height - size.height) / 2;
    let left = s0 === "right" ? at.x + at.width + gap : s0 === "left" ? at.x - gap - size.width : align === "start" ? at.x : align === "end" ? at.x + at.width - size.width : at.x + (at.width - size.width) / 2;
    left = Math.max(gap, Math.min(left, screen.width - size.width - gap));
    top = Math.max(gap, Math.min(top, screen.height - size.height - gap));
    place = { top, left };
  }

  return (
    <View testID={partId(testID, "popover", "root")} {...rootProps(rest)} style={[s.root, !floating && { flexDirection: DIRECTION[side] }, r.root.view, style]}>
      {floating ? (
        <Pressable ref={trigger} onPress={toggle} accessibilityState={{ expanded: shown }}>
          {children}
        </Pressable>
      ) : (
        showTrigger && <Button label={triggerLabel} variant="secondary" size="sm" onPress={() => setShown(!shown)} />
      )}
      {floating ? (
        <Modal transparent visible={shown} animationType="none" onRequestClose={() => setShown(false)} supportedOrientations={["portrait", "landscape"]}>
          <Pressable
            style={s.backdrop}
            accessibilityRole="button"
            accessibilityLabel={label || triggerLabel}
            onPress={() => setShown(false)}
            onLayout={(e) => setScreen({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
          />
          <View style={[s.floating, place ?? { opacity: 0 }]} pointerEvents="box-none">
            {panel()}
          </View>
        </Modal>
      ) : (
        shown && panel()
      )}
    </View>
  );
}
