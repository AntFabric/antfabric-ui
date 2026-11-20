import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { hitSlopTo } from "../../lib/a11y";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { useFormField } from "./form-field";
import { bezier } from "../../lib/motion";
import { Tag, type TagTone } from "../display/tag";

export type RadioGroupAppearance = "list" | "pills" | "cards";

/** A chip after a card's label: "In use", "Default", "Coming soon". */
export interface RadioGroupOptionTag {
  label: string;
  tone?: TagTone;
}

export interface RadioGroupOption {
  key: string;
  label: string;
  description?: string;
  disabled?: boolean;
  /** `cards` only: a picture at the top of the card (a small drawing of a layout, a theme's colours). Decorative: the label names the option. */
  preview?: ReactNode;
  /** `cards` only: the kit's Tag chips after the label. */
  tags?: RadioGroupOptionTag[];
}

export interface RadioGroupProps extends RootProps {
  /** Two to six options; more than that is a Select. */
  options: RadioGroupOption[];
  /** The chosen option's key. Empty is allowed and lights nothing — an unanswered question is genuinely unanswered. */
  value?: string;
  /** The group's name: the question being answered. */
  label?: string;
  /** Keep the name for screen readers but do not draw it, when a heading above already asks the question. */
  hideLabel?: boolean;
  /** list is a ring and a label per row. pills is drawn as the list on the phone. cards is a card per option, stacked one per row. */
  appearance?: RadioGroupAppearance;
  /** The whole group, for a write in flight or a person who may read but not change it. Say why near it. */
  disabled?: boolean;
  onValueChange?: (key: string) => void;
  /** Per-part styles over the theme: `{ root: {…}, option: {…} }`. */
  styles?: PartStyles<"radio-group">;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (sizes, colours, type) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { alignSelf: "stretch" },
  option: { flexDirection: "row", alignItems: "flex-start" },
  ring: { alignItems: "center", justifyContent: "center" },
  text: { flexShrink: 1, minWidth: 0, gap: t.space["3xs"] },
  card: { alignSelf: "stretch" },
  cardPreview: { overflow: "hidden" },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
}));

/** A card: the preview, the label and its tags, the description. The card is the radio and its edge says it is chosen, so it draws no ring. */
function Card({ option, chosen, disabled, pick, styles, testID }: { option: RadioGroupOption; chosen: boolean; disabled: boolean; pick: () => void; styles?: PartStyles<"radio-group">; testID?: string }) {
  const s = useStyles();
  const press = usePress({ disabled });
  const r = useRecipe(recipes["radio-group"], { state: { on: chosen, focus: press.focused, disabled: press.disabled }, styles });
  const preview = partStyle(r, "cardPreview", { view: s.cardPreview });
  return (
    <Pressable
      testID={partId(testID, "radio-group", "card")}
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      // The tags, then the description, are said after the name: "In use. Spaces and channels in a rail on the left."
      accessibilityHint={[...(option.tags ?? []).map((g) => g.label), option.description].filter(Boolean).join(". ") || undefined}
      accessibilityState={{ checked: chosen, disabled: press.disabled }}
      disabled={press.disabled}
      onPress={pick}
      {...press.handlers}
      style={partStyle(r, "card", { view: s.card }).view}
    >
      {option.preview ? (
        <View testID={partId(testID, "radio-group", "cardPreview")} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={preview.view}>
          {option.preview}
        </View>
      ) : null}
      <View testID={partId(testID, "radio-group", "cardHead")} style={partStyle(r, "cardHead", { view: s.wrapRow }).view}>
        <Text testID={partId(testID, "radio-group", "cardLabel")} maxFontSizeMultiplier={fontScale.content} style={[r.cardLabel.view, r.cardLabel.text]}>
          {option.label}
        </Text>
        {option.tags?.length ? (
          <View testID={partId(testID, "radio-group", "cardTags")} style={partStyle(r, "cardTags", { view: s.wrapRow }).view}>
            {option.tags.map((g) => (
              <Tag key={g.label} label={g.label} tone={g.tone} size="sm" />
            ))}
          </View>
        ) : null}
      </View>
      {option.description ? (
        <Text testID={partId(testID, "radio-group", "cardDescription")} maxFontSizeMultiplier={fontScale.content} style={[r.cardDescription.view, r.cardDescription.text]}>
          {option.description}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Option({ option, chosen, disabled, pick, styles, testID }: { option: RadioGroupOption; chosen: boolean; disabled: boolean; pick: () => void; styles?: PartStyles<"radio-group">; testID?: string }) {
  const { t } = useTheme();
  const s = useStyles();
  const press = usePress({ disabled });
  const r = useRecipe(recipes["radio-group"], { state: { on: chosen, focus: press.focused, disabled: press.disabled }, styles });
  // The dot grows from the ring's centre as the old one shrinks away.
  const grow = useRef(new Animated.Value(chosen ? 1 : 0)).current;
  useEffect(() => {
    const run = Animated.timing(grow, { toValue: chosen ? 1 : 0, duration: t.duration.quick, easing: bezier(t.ease.out), useNativeDriver: Platform.OS !== "web" });
    run.start();
    return () => run.stop();
  }, [chosen, grow, t.duration, t.ease]);
  return (
    <Pressable
      testID={partId(testID, "radio-group", "option")}
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      accessibilityHint={option.description}
      hitSlop={hitSlopTo(t.control.hit, t.choice.ringSize + 2 * t.choice.padY, t.control.hit)}
      accessibilityState={{ checked: chosen, disabled: press.disabled }}
      disabled={press.disabled}
      onPress={pick}
      {...press.handlers}
      style={[s.option, r.option.view]}
    >
      <View testID={partId(testID, "radio-group", "ring")} style={[s.ring, partStyle(r, "ring", { view: press.pressed && { transform: [{ scale: 0.9 }] } }).view]}>
        <Animated.View testID={partId(testID, "radio-group", "dot")} style={[r.dot.view, { opacity: grow, transform: [{ scale: grow }] }]} />
      </View>
      <View style={s.text}>
        <Text testID={partId(testID, "radio-group", "label")} maxFontSizeMultiplier={fontScale.content} style={[r.label.view, r.label.text]}>
          {option.label}
        </Text>
        {option.description ? (
          <Text testID={partId(testID, "radio-group", "description")} maxFontSizeMultiplier={fontScale.content} style={[r.description.view, r.description.text]}>
            {option.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/** The phone draws the list for `pills` (they are the desktop's ChoicePills), and `cards` stacked one per row. */
export function RadioGroup({ options, value = "", label = "", hideLabel = false, appearance = "list", disabled = false, onValueChange, styles, style, testID, ...rest }: RadioGroupProps) {
  const s = useStyles();
  const form = useFormField();
  const card = appearance === "cards";
  const r = useRecipe(recipes["radio-group"], { variants: { appearance: card ? "cards" : "list" }, styles });
  const [current, setCurrent] = useControllable(value, onValueChange);
  return (
    <View testID={partId(testID, "radio-group", "root")} accessibilityRole="radiogroup" accessibilityLabel={label || form?.label || undefined} accessibilityHint={form?.hint} accessibilityState={{ disabled }} {...rootProps(rest)} style={[s.root, r.root.view, style]}>
      {label && !hideLabel ? (
        <Text testID={partId(testID, "radio-group", "legend")} aria-hidden style={[r.legend.view, r.legend.text]}>
          {label}
        </Text>
      ) : null}
      <View testID={partId(testID, "radio-group", "options")} style={r.options.view}>
        {options.map((o) =>
          card ? (
            <Card key={o.key} testID={testID} option={o} chosen={o.key === current} disabled={disabled || !!o.disabled} pick={() => setCurrent(o.key)} styles={styles} />
          ) : (
            <Option key={o.key} testID={testID} option={o} chosen={o.key === current} disabled={disabled || !!o.disabled} pick={() => setCurrent(o.key)} styles={styles} />
          ),
        )}
      </View>
    </View>
  );
}
