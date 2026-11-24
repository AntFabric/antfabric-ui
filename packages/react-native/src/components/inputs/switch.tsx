import { useEffect, useRef } from "react";
import { Animated, I18nManager, Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { useFormField } from "./form-field";
import { bezier } from "../../lib/motion";

export interface SwitchProps extends RootProps {
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
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (sizes, colours, type) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { flexDirection: "row", alignItems: "center" },
  text: { flexGrow: 1, flexShrink: 1, minWidth: 0, gap: t.space["3xs"] },
  track: { flexShrink: 0, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", overflow: "visible" },
}));

export function Switch({ checked, label, description = "", icon = "", hideLabel = false, disabled = false, onCheckedChange, styles, style, testID, ...rest }: SwitchProps) {
  const { t } = useTheme();
  const form = useFormField();
  const s = useStyles();
  const press = usePress({ disabled });
  const [on = false, setOn] = useControllable(checked, onCheckedChange);
  // Each OS's own shape is in the tokens: UISwitch's 51×31 pill on iOS, Material's thin track under a bigger thumb on Android.
  const r = useRecipe(recipes.switch, { state: { on, focus: press.focused, disabled: press.disabled }, styles });
  // The icon's size is its width and height (`size`); what else `styles.icon` sets goes on the glyph.
  const { width: iconSize, height: _ih, ...iconRest } = r.icon.view;

  // The thumb slides by transform, as the native switches animate it.
  const x = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    const run = Animated.timing(x, { toValue: on ? 1 : 0, duration: t.duration.quick, easing: bezier(t.ease.out), useNativeDriver: Platform.OS !== "web" });
    run.start();
    return () => run.stop();
  }, [on, x, t.duration, t.ease]);

  return (
    <Pressable
      testID={partId(testID, "switch", "root")}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={[description, form?.hint].filter(Boolean).join(". ") || undefined}
      accessibilityState={{ checked: on, disabled: press.disabled }}
      disabled={press.disabled}
      onPress={() => setOn(!on)}
      {...press.handlers}
      {...rootProps(rest)}
      style={[s.root, partStyle(r, "root", { view: { alignSelf: hideLabel ? "flex-start" : "stretch" } }).view, style]}
    >
      {icon && !hideLabel ? <Icon testID={partId(testID, "switch", "icon")} name={icon} size={iconSize as number} color={r.icon.text.color} style={Object.keys(iconRest).length ? iconRest : undefined} /> : null}
      {hideLabel ? null : (
        <View style={s.text}>
          <Text testID={partId(testID, "switch", "label")} maxFontSizeMultiplier={fontScale.content} style={[r.label.view, r.label.text]}>
            {label}
          </Text>
          {description ? (
            <Text testID={partId(testID, "switch", "description")} maxFontSizeMultiplier={fontScale.content} style={[r.description.view, r.description.text]}>
              {description}
            </Text>
          ) : null}
        </View>
      )}
      <View testID={partId(testID, "switch", "track")} style={[s.track, r.track.view]}>
        <Animated.View
          testID={partId(testID, "switch", "thumb")}
          style={[r.thumb.view, { transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, I18nManager.isRTL ? -t.switch.thumbTravel : t.switch.thumbTravel] }) }] }]}
        />
      </View>
    </Pressable>
  );
}
