import { Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { hitSlopTo } from "../../lib/a11y";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { useFormField } from "./form-field";

export interface CheckboxProps extends RootProps {
  /** The accessible name, and the visible text unless hideLabel is set. */
  label: string;
  /** A second line under the label. Say what ticking it does, or why it cannot be changed. */
  description?: string;
  checked?: boolean;
  /** Some but not all of the items this box stands for are ticked. Drawn as a dash; accessibilityState.checked "mixed". Ticking it ticks them all. */
  indeterminate?: boolean;
  /** Draw the box alone. The label is still the accessible name. */
  hideLabel?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Per-part styles over the theme: `{ root: {…}, box: {…} }`. */
  styles?: PartStyles<"checkbox">;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (sizes, colours, type) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { flexDirection: "row", alignItems: "flex-start", alignSelf: "flex-start" },
  box: { alignItems: "center", justifyContent: "center" },
  text: { gap: t.space["3xs"], flexShrink: 1, minWidth: 0 },
}));

export function Checkbox({ label, description = "", checked, indeterminate = false, hideLabel = false, disabled = false, onCheckedChange, styles, style, testID, ...rest }: CheckboxProps) {
  const { t } = useTheme();
  const form = useFormField();
  const s = useStyles();
  const press = usePress({ disabled });
  const [isChecked = false, setChecked] = useControllable(checked, onCheckedChange);
  const [innerMixed, setMixed] = useControllable(indeterminate);
  // While the app owns `checked` (the value and its handler) it owns the dash too: it clears it when it takes the change.
  const mixed = checked !== undefined && onCheckedChange ? indeterminate : innerMixed;
  const filled = isChecked || mixed;
  const r = useRecipe(recipes.checkbox, { state: { on: filled, focus: press.focused, disabled: press.disabled }, styles });
  // The tick's size is its width and height (`size`); what else `styles.tick` sets goes on the glyph.
  const { width: tickSize, height: _h, ...tickRest } = r.tick.view;
  return (
    <Pressable
      testID={partId(testID, "checkbox", "root")}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={[description, form?.hint].filter(Boolean).join(". ") || undefined}
      hitSlop={hitSlopTo(t.size.target.min, t.checkbox.size + 2 * t.choice.paddingY, hideLabel ? t.checkbox.size : t.size.target.min)}
      accessibilityState={{ checked: mixed ? "mixed" : isChecked, disabled: press.disabled }}
      disabled={press.disabled}
      onPress={() => {
        setMixed(false);
        setChecked(mixed || !isChecked);
      }}
      {...press.handlers}
      {...rootProps(rest)}
      style={[s.root, r.root.view, style]}
    >
      <View testID={partId(testID, "checkbox", "box")} style={[s.box, partStyle(r, "box", { view: [{ marginTop: hideLabel ? 0 : 1 }, press.pressed && { transform: [{ scale: 0.92 }] }] }).view]}>
        {filled ? (
          <Enter key={mixed ? "minus" : "check"} motion="pop">
            <Icon testID={partId(testID, "checkbox", "tick")} name={mixed ? "minus" : "check"} size={tickSize as number} strokeWidth={t.size.stroke.tick} color={r.tick.text.color ?? r.box.text.color} style={Object.keys(tickRest).length ? tickRest : undefined} />
          </Enter>
        ) : null}
      </View>
      {hideLabel ? null : (
        <View style={s.text}>
          <Text testID={partId(testID, "checkbox", "label")} maxFontSizeMultiplier={fontScale.content} style={[r.label.view, r.label.text]}>
            {label}
          </Text>
          {description ? (
            <Text testID={partId(testID, "checkbox", "description")} maxFontSizeMultiplier={fontScale.content} style={[r.description.view, r.description.text]}>
              {description}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
