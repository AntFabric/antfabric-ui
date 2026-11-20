import { type CSSProperties, type Ref } from "react";
import { recipes } from "@antfabric-ui/core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useCoarsePointer, useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe } from "../../lib/recipe";
import { css, pressable } from "../../lib/style";

/**
 * The ⋯ and ☰ buttons of the app frame: an `IconButton` that is a menu button (WAI-ARIA APG), so it says it opens a menu
 * (`aria-haspopup`) and whether that menu is open (`aria-expanded`, `aria-controls`), where an `IconButton` says `aria-pressed`. It reads
 * the icon button's recipe, so it draws what an `IconButton` does. Internal to the shell: it is not exported.
 */
export interface MenuButtonProps {
  icon: IconName;
  /** The accessible name and the tooltip. */
  label: string;
  /** The menu it opens is open. */
  open: boolean;
  /** The id of the element that holds the menu while it is open. */
  controls?: string;
  shape?: "circle" | "square";
  size?: "sm" | "md";
  onPress: () => void;
  /** The button element, for returning focus to it when the menu closes. */
  ref?: Ref<HTMLButtonElement>;
  style?: CSSProperties;
}

const root: CSSProperties = {
  ...pressable,
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: `background ${t.duration.fast}, color ${t.duration.fast}, transform ${t.duration.fast} ${t.ease.out}`,
};

export function MenuButton({ icon, label, open, controls, shape = "circle", size = "md", onPress, ref, style }: MenuButtonProps) {
  const ui = useInteraction();
  const coarse = useCoarsePointer();
  const r = useRecipe(recipes["icon-button"], {
    variants: { variant: "ghost", shape, size, active: open, tone: "neutral" },
    state: { hover: ui.hovered, focus: ui.focused, pressed: ui.pressed },
  });
  const side = size === "sm" ? 32 : 40;
  return (
    <button
      ref={ref}
      type="button"
      data-af-part="root"
      data-af-press
      title={label}
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? controls : undefined}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(root, partStyle(r, "root", coarse && { width: side, height: side }), style)}
    >
      <Icon part="icon" name={icon} size={r.icon.width} style={r.icon} />
    </button>
  );
}
