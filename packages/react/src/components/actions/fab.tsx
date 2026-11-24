import type { CSSProperties } from "react";
import { recipes } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { css, glass, pressable } from "../../lib/style";

export type FabVariant = "ink" | "tint" | "raised";

export interface FabProps extends RootProps<HTMLButtonElement> {
  /** ink is the inverse-surface disc, a product's primary action. tint is the brand-tint disc, the one prominent action. raised is the card-filled disc with a hairline and the float shadow. */
  variant?: FabVariant;
  icon: IconName;
  /** The accessible name, and the tooltip. Never optional — the disc has no text. */
  label: string;
  /** An image drawn instead of the icon — a brand mark (32px) on the tint disc. */
  src?: string;
  disabled?: boolean;
  onPress?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, icon: {…} }`. */
  styles?: PartStyles<"fab">;
  style?: CSSProperties;
}

/** The layout and the motion no token decides; what the tokens decide (size, fill, edge, shadow) is the recipe's. */
const root: CSSProperties = {
  ...pressable,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderStyle: "solid",
  borderWidth: 0,
  borderColor: "transparent",
  transition: `background ${t.motion.duration.base} ${t.motion.easing.standard}, color ${t.motion.duration.base}, transform ${t.motion.duration.fast} ${t.motion.easing.out}`,
};

export function Fab({ variant = "ink", icon, label, src = "", disabled = false, onPress, styles, style, ...rest }: FabProps) {
  const { glass: glassOn } = usePlatform();
  const ui = useInteraction({ disabled });
  // macOS 26: ink and raised become glass discs with ink glyphs; the tint disc stays tinted, the one prominent action.
  const isGlass = glassOn && variant !== "tint";
  // Glass keeps its material under the pointer, and swells under a press instead of changing fill.
  const r = useRecipe(recipes.fab, {
    variants: { variant },
    state: { hover: ui.hovered && !isGlass, pressed: ui.pressed && !isGlass, focus: ui.focused, disabled: ui.disabled },
    styles,
  });
  return (
    <button
      type="button"
      data-af-part="root"
      data-af-press
      aria-label={label}
      title={label}
      disabled={ui.disabled}
      onClick={() => onPress?.()}
      {...ui.handlers}
      {...rootProps(rest)}
      style={css(
        root,
        partStyle(
          r,
          "root",
          isGlass && css(glass("glass"), { color: t.color.text.strong }),
          ui.pressed && isGlass && { transform: "scale(1.06)" },
          ui.focused && isGlass && { boxShadow: `${t.elevation.shadow.glass}, ${t.elevation.shadow.focus}` },
          ui.disabled && { cursor: "not-allowed" },
        ),
        style,
      )}
    >
      {src ? <img src={src} alt="" style={{ width: t.fab.markSize, height: t.fab.markSize, display: "block", flexShrink: 0 }} /> : <Icon part="icon" name={icon} size={r.icon.width} style={r.icon} />}
    </button>
  );
}
