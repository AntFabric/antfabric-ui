import { useId, type CSSProperties } from "react";
import { recipes, useControllable, useDirection } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, neg, pressable, text } from "../../lib/style";
import { joinIds, useFormField } from "./form-field";

export interface SwitchProps extends RootProps<HTMLButtonElement> {
  checked?: boolean;
  label: string;
  /** What on means, or why it cannot be turned on right now. */
  description?: string;
  /** A leading glyph saying what the setting is about. The switch says whether it is on. */
  icon?: IconName;
  /** Draw the switch alone, when the row it sits in shows the label. The label stays the accessible name. */
  hideLabel?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Per-part styles over the theme: `{ root: {…}, track: {…} }`. */
  styles?: PartStyles<"switch">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; what the tokens decide (sizes, colours, type) is the recipe's. */
const root: CSSProperties = { ...pressable, flexDirection: "row", alignItems: "center", textAlign: "start" };

const track: CSSProperties = {
  ...box,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  flexShrink: 0,
  transition: `background ${t.duration.quick} ${t.ease.standard}`,
};

const thumb: CSSProperties = { flexShrink: 0, transition: `transform ${t.duration.quick} ${t.ease.out}` };

export function Switch({ checked, label: name, description: detail = "", icon = "", hideLabel = false, disabled = false, onCheckedChange, styles, style, ...rest }: SwitchProps) {
  const ui = useInteraction({ disabled });
  const form = useFormField();
  const dir = useDirection();
  const descriptionId = `${useId()}-description`;
  const [on = false, setOn] = useControllable(checked, onCheckedChange);
  const r = useRecipe(recipes.switch, { state: { on, hover: ui.hovered, focus: ui.focused, disabled: ui.disabled }, styles });
  return (
    <button
      type="button"
      data-af-part="root"
      data-af-press
      id={form?.id}
      role="switch"
      aria-checked={on}
      aria-label={name}
      aria-describedby={joinIds(!!detail && !hideLabel && descriptionId, form?.describedBy)}
      disabled={ui.disabled}
      onClick={() => setOn(!on)}
      {...ui.handlers}
      {...rootProps(rest)}
      style={css(root, partStyle(r, "root", { alignSelf: hideLabel ? "flex-start" : "stretch" }, ui.disabled && { cursor: "not-allowed" }), style)}
    >
      {icon && !hideLabel && <Icon part="icon" name={icon} style={r.icon} />}
      {!hideLabel && (
        <span style={css(box, { flexGrow: 1, flexShrink: 1, gap: t.space["3xs"] })}>
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
      <span aria-hidden data-af-part="track" style={css(track, r.track)}>
        {/* Slides by switch.thumbTravel: track width, minus the padding on both sides, minus the thumb. It starts at the start edge, so it travels the other way in right-to-left. */}
        <span data-af-part="thumb" style={css(thumb, partStyle(r, "thumb", { transform: on ? `translateX(${dir === "rtl" ? neg(t.switch.thumbTravel) : t.switch.thumbTravel})` : "translateX(0)" }))} />
      </span>
    </button>
  );
}
