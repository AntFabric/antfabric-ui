import { useEffect, type CSSProperties } from "react";
import { formatShortcut, recipes, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { Icon, Spinner, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { css, pressable, rtl, text, truncate } from "../../lib/style";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "ink" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonType = "button" | "submit" | "reset";

export interface ButtonProps extends RootProps<HTMLButtonElement> {
  label: string;
  /** primary is the brand fill — one per view. danger is for an action that cannot be undone. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeading?: IconName;
  iconTrailing?: IconName;
  /** Shows a spinner in place of the leading icon and blocks presses. The label stays, so the width does not change. */
  loading?: boolean;
  disabled?: boolean;
  /** What the button does inside a form: `submit` sends it, `reset` clears it, `button` (the default) does neither. */
  type?: ButtonType;
  /** Stretches to its container. */
  full?: boolean;
  /** A keyboard hint drawn after the label, written once as `Mod+Enter`; each OS gets its own glyphs. */
  shortcut?: string;
  onPress?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, icon: {…} }`. */
  styles?: PartStyles<"button">;
  /** Overrides the built-in text for this instance. */
  strings?: Partial<KitStrings["button"]>;
  style?: CSSProperties;
}

/** The layout and the motion no token decides; what the tokens decide is the recipe's. */
const root: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "flex-start",
  transition: `background ${t.duration.fast} ${t.ease.standard}, color ${t.duration.fast}, transform ${t.duration.fast}`,
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  iconLeading,
  iconTrailing,
  loading = false,
  disabled = false,
  type = "button",
  full = false,
  shortcut,
  onPress,
  styles,
  strings,
  style,
  ...rest
}: ButtonProps) {
  const s = useStrings("button", strings);
  const { os } = usePlatform();
  const dir = useDirection();
  const ui = useInteraction({ disabled: disabled || loading });
  // A loading button is blocked but not greyed: the spinner already says why.
  const r = useRecipe(recipes.button, { variants: { variant, size }, state: { hover: ui.hovered, pressed: ui.pressed, focus: ui.focused, disabled: ui.disabled && !loading }, styles });
  // The wait is said once, when it starts; the spinner is hidden, as the button's own name and `aria-busy` carry the state.
  const loadingSaid = s("loading");
  useEffect(() => {
    if (loading) announce(loadingSaid);
  }, [loading, loadingSaid]);
  return (
    <button
      type={type}
      data-af-part="root"
      data-af-press
      // Loading keeps focus: only a real `disabled` takes the button out of the tab order.
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (loading) {
          e.preventDefault();
          return;
        }
        onPress?.();
      }}
      {...ui.handlers}
      {...rootProps(rest)}
      style={css(root, partStyle(r, "root", full && { alignSelf: "stretch", width: "100%" }, ui.disabled && { cursor: loading ? "progress" : "not-allowed" }), style)}
    >
      {loading && <Spinner part="spinner" decorative style={r.spinner} />}
      {iconLeading && !loading && <Icon part="icon" name={iconLeading} style={r.icon} />}
      <span style={css(text, truncate(1), { lineHeight: 1.2 })}>{label}</span>
      {iconTrailing && <Icon part="icon" name={iconTrailing} style={r.icon} />}
      {shortcut && (
        <span data-af-part="shortcut" style={css(text, partStyle(r, "shortcut", rtl({ marginLeft: t.space["3xs"], letterSpacing: "0.02em" }, dir)))}>
          {formatShortcut(shortcut, os)}
        </span>
      )}
    </button>
  );
}
