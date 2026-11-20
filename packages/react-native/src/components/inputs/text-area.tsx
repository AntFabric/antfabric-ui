import { useEffect, useState } from "react";
import { Text, TextInput, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { announce } from "../../lib/a11y";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { useFormField } from "./form-field";

export interface TextAreaProps extends RootProps {
  /** Visible label and the field's accessibility label. With `hideLabel` it is only the accessibility label. */
  label: string;
  /** The text. Left out, the field keeps its own text, starting from `defaultValue`, and still reports each change. */
  value?: string;
  /** The text a field with no `value` starts with. */
  defaultValue?: string;
  /** An example of the answer, never the instructions — placeholders vanish the moment someone types. */
  placeholder?: string;
  /** How many lines tall the field is at least; it grows with what is typed. */
  rows?: number;
  /** Sets the text in the monospace face, for code, JSON and templates. */
  mono?: boolean;
  /** One clause under the field. Replaced by the error while invalid. */
  helper?: string;
  /** What is wrong and how to fix it, shown in place of helper while invalid is true. */
  error?: string;
  invalid?: boolean;
  /** Marks the field required and draws a "Required" tag beside the label. */
  required?: boolean;
  /** Caps typing at this many characters and shows the count. 0 is no cap and no counter. */
  maxLength?: number;
  /** Not editable and not announced as editable. Say why in helper. */
  disabled?: boolean;
  /** The text can be read, selected and copied but not changed. */
  readOnly?: boolean;
  /** Hides the label (and the tag); it stays the field's accessibility label. */
  hideLabel?: boolean;
  onValueChange?: (value: string) => void;
  /** Focus left the field: the moment to check the value. */
  onBlur?: () => void;
  /** This field's built-in text ("Required", the counter) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["text-area"]>;
  /** Per-part styles over the theme: `{ root: {…}, field: {…}, input: {…} }`. */
  styles?: PartStyles<"text-area">;
  style?: ViewStyle;
}

/** How long typing must pause before the characters left are said. */
const SAID_MS = 600;

/** Layout no token decides; what the tokens decide (sizes, colours, type, edges) is the recipe's. */
const useStyles = createStyles(() => ({
  root: { alignSelf: "stretch", width: "100%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tag: { flexShrink: 0 },
  input: { alignSelf: "stretch", textAlignVertical: "top" },
  footer: { flexDirection: "row", alignItems: "flex-start" },
  message: { flexDirection: "row", alignItems: "flex-start", flexGrow: 1, flexShrink: 1 },
  errorText: { flexShrink: 1 },
  helper: { flexGrow: 1, flexShrink: 1 },
  counter: { marginStart: "auto", flexShrink: 0, fontVariant: ["tabular-nums"] },
}));

export function TextArea({
  label,
  value,
  defaultValue = "",
  placeholder = "",
  rows = 4,
  mono = false,
  helper = "",
  error = "",
  invalid = false,
  required = false,
  maxLength = 0,
  disabled = false,
  readOnly = false,
  hideLabel = false,
  onValueChange,
  onBlur,
  strings,
  styles,
  style,
  testID,
  ...rest
}: TextAreaProps) {
  const form = useFormField();
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("text-area", strings);
  // Left out, `value` is the field's own state, which starts as `defaultValue`.
  const [typed, setText] = useControllable(value, onValueChange);
  const current = typed ?? defaultValue;
  const [hasFocus, setFocus] = useState(false);

  const showError = invalid && !!error;
  // iOS has no live regions: a message that arrives is said once.
  useEffect(() => {
    if (showError) announce(error);
  }, [showError, error]);
  // Near the limit, and after typing pauses, the characters left are said; at the limit, that it was reached. Never on each keystroke.
  const left = maxLength - current.length;
  const near = maxLength > 0 && left <= Math.max(5, Math.ceil(maxLength * 0.1));
  const limitSaid = left <= 0 ? str("limitReached") : str("charactersLeft", { count: left });
  useEffect(() => {
    if (!near || !hasFocus) return;
    const timer = setTimeout(() => announce(limitSaid), SAID_MS);
    return () => clearTimeout(timer);
  }, [near, hasFocus, limitSaid]);
  const r = useRecipe(recipes["text-area"], { variants: { mono }, state: { focus: hasFocus, invalid, readOnly, disabled }, styles });
  const errorIcon = partStyle(r, "errorIcon", { view: { marginTop: t.space["3xs"] } });
  const { width: errSize, height: _eh, ...errRest } = errorIcon.view;
  // `rows` lines of the input's own line height, plus its inset: the least the field is tall. It grows with the text from there.
  const inset = r.input.view.paddingVertical as number;
  const input = partStyle(r, "input", { view: { minHeight: (r.input.text.lineHeight as number) * rows + 2 * inset } });
  // The placeholder's colour is a TextInput prop, not a style.
  const { placeholderTextColor, ...inputText } = input.text;
  const tagText = partStyle(r, "tag", { text: { lineHeight: (r.tag.text.fontSize as number) * 1.2 } }).text;
  return (
    <View testID={partId(testID, "text-area", "root")} {...rootProps(rest)} style={[s.root, r.root.view, style]}>
      {hideLabel ? null : (
        <View style={[s.header, { gap: t.space.sm }]}>
          <Text testID={partId(testID, "text-area", "label")} maxFontSizeMultiplier={fontScale.content} style={[r.label.view, r.label.text]}>
            {label}
          </Text>
          {required ? (
            <View testID={partId(testID, "text-area", "tag")} style={[s.tag, r.tag.view]}>
              <Text maxFontSizeMultiplier={fontScale.chrome} style={tagText}>{str("required")}</Text>
            </View>
          ) : null}
        </View>
      )}
      <View testID={partId(testID, "text-area", "field")} style={r.field.view}>
        <TextInput
          testID={partId(testID, "text-area", "input")}
          multiline
          numberOfLines={rows}
          value={current}
          onChangeText={(next) => setText(next)}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          accessibilityLabel={label || placeholder || form?.label}
          // What is said after the name: the error or the helper, the field's own description and error, and that it is required.
          accessibilityHint={[showError ? error : helper, form?.hint, required && !form?.required ? str("required") : ""].filter(Boolean).join(". ") || undefined}
          accessibilityState={{ disabled }}
          editable={!disabled && !readOnly}
          maxLength={maxLength > 0 ? maxLength : undefined}
          // Code and JSON are typed as they are: no capitals and no autocorrect.
          autoCapitalize={mono ? "none" : undefined}
          autoCorrect={mono ? false : undefined}
          // Entry text grows with the person's text size like reading text; the field's `minHeight` grows with it.
          maxFontSizeMultiplier={fontScale.content}
          onFocus={() => setFocus(true)}
          onBlur={() => {
            setFocus(false);
            onBlur?.();
          }}
          style={[s.input, input.view, inputText]}
        />
      </View>
      {showError || helper || maxLength > 0 ? (
        <View style={[s.footer, { gap: t.space.sm }]}>
          {showError ? (
            <Enter testID={partId(testID, "text-area", "error")} motion="fade" style={[s.message, r.error.view]}>
              <Icon testID={partId(testID, "text-area", "errorIcon")} name="circle-alert" size={errSize as number} color={errorIcon.text.color ?? r.error.text.color} style={errRest} />
              <Text testID={partId(testID, "text-area", "errorText")} maxFontSizeMultiplier={fontScale.content} style={[s.errorText, r.errorText.view, r.errorText.text]}>
                {error}
              </Text>
            </Enter>
          ) : null}
          {!showError && helper ? (
            <Text testID={partId(testID, "text-area", "helper")} maxFontSizeMultiplier={fontScale.content} style={[s.helper, r.helper.view, r.helper.text]}>
              {helper}
            </Text>
          ) : null}
          {maxLength > 0 ? (
            <Text testID={partId(testID, "text-area", "counter")} maxFontSizeMultiplier={fontScale.content} style={[s.counter, r.counter.view, r.counter.text]}>
              {str("characterCount", { current: current.length, max: maxLength })}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
