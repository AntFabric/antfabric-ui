import { useId, type CSSProperties } from "react";
import { recipes, useControllable } from "@antfabric-ui/core";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, pressable, text } from "../../lib/style";
import { joinIds, useFormField } from "./form-field";

export interface CheckboxProps extends RootProps<HTMLButtonElement> {
  /** The accessible name, and the visible text unless hideLabel is set. */
  label: string;
  /** A second line under the label. Say what ticking it does, or why it cannot be changed. */
  description?: string;
  checked?: boolean;
  /** Some but not all of the items this box stands for are ticked. Drawn as a dash; aria-checked="mixed". Ticking it ticks them all. */
  indeterminate?: boolean;
  /** Draw the box alone — the task table's done toggle. The label is still the accessible name and the tooltip. */
  hideLabel?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Per-part styles over the theme: `{ root: {…}, box: {…} }`. */
  styles?: PartStyles<"checkbox">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; what the tokens decide (sizes, colours, type) is the recipe's. */
const root: CSSProperties = { ...pressable, flexDirection: "row", alignItems: "flex-start", alignSelf: "flex-start", textAlign: "start" };

// One size on purpose: 15px, a 2px ring, a 9px tick. A bigger target grows the row, never the box.
const square: CSSProperties = {
  ...box,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  transition: `background ${t.duration.base}, border-color ${t.duration.base}, transform ${t.duration.fast} ${t.ease.out}`,
};

export function Checkbox({ label: name, description: detail = "", checked = false, indeterminate = false, hideLabel = false, disabled = false, onCheckedChange, styles, style, ...rest }: CheckboxProps) {
  const ui = useInteraction({ disabled });
  const form = useFormField();
  const descriptionId = `${useId()}-description`;
  const [isChecked, setChecked] = useControllable(checked, onCheckedChange);
  const [innerMixed, setMixed] = useControllable(indeterminate);
  // While the app owns `checked` it owns the dash too: it clears it when it takes the change.
  const mixed = onCheckedChange ? indeterminate : innerMixed;
  const filled = isChecked || mixed;
  const r = useRecipe(recipes.checkbox, { state: { on: filled, hover: ui.hovered, focus: ui.focused, disabled: ui.disabled }, styles });
  return (
    <button
      type="button"
      data-af-part="root"
      data-af-press
      id={form?.id}
      role="checkbox"
      aria-checked={mixed ? "mixed" : isChecked}
      aria-label={name}
      aria-describedby={joinIds(!!detail && !hideLabel && descriptionId, form?.describedBy)}
      aria-invalid={form?.invalid || undefined}
      aria-required={form?.required || undefined}
      title={hideLabel ? name : undefined}
      disabled={ui.disabled}
      onClick={() => {
        setMixed(false);
        setChecked(mixed || !isChecked);
      }}
      {...ui.handlers}
      {...rootProps(rest)}
      // A box drawn alone is centred in whatever target the theme gives the root.
      style={css(root, partStyle(r, "root", hideLabel && { justifyContent: "center" }, ui.disabled && { cursor: "not-allowed" }), style)}
    >
      <span aria-hidden data-af-part="box" style={css(square, partStyle(r, "box", { marginTop: hideLabel ? 0 : 0.5 }))}>
        {filled && <Icon part="tick" key={mixed ? "minus" : "check"} name={mixed ? "minus" : "check"} style={partStyle(r, "tick", { strokeWidth: t.icon.strokeTick, ...enter("pop") })} />}
      </span>
      {!hideLabel && (
        <span style={css(box, { gap: t.space["3xs"], flexShrink: 1 })}>
          <span data-af-part="label" style={css(text, r.label)}>
            {name}
          </span>
          {detail && (
            <span id={descriptionId} data-af-part="description" style={css(text, r.description)}>
              {detail}
            </span>
          )}
        </span>
      )}
    </button>
  );
}
