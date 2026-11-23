import { useEffect, useState, type ReactNode } from "react";
import { Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { announce } from "../../lib/a11y";
import { Icon, type IconName } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { useFormField } from "./form-field";
import { Button } from "../actions/button";

export type TextFieldType = "text" | "email" | "password" | "search" | "tel" | "url" | "number";

export interface TextFieldProps extends RootProps {
  /** Visible label and the field's accessibility label. */
  label?: string;
  value?: string;
  /** An example of the answer, never the instructions — placeholders vanish the moment someone types. */
  placeholder?: string;
  /** What the field holds: it picks the keyboard, turns off capitals and autocorrect for an address, and, for `password`, hides the characters. */
  type?: TextFieldType;
  /** What the phone may fill in: `email`, `username`, `current-password`, `new-password`, `one-time-code`, `tel`, `off`. */
  autoComplete?: string;
  /** Fixed text before the value that is not part of it, like the # of a channel name. */
  prefix?: string;
  /** Field furniture in text.faint. Never tinted on focus. */
  leadingIcon?: IconName;
  /** A control at the end of the field: Copy on a read-only link, Show on a password. */
  trailing?: ReactNode;
  /** With `type="password"`: a Show / Hide button at the end of the field that shows the characters while on. */
  reveal?: boolean;
  /** One clause under the field. Replaced by the error while invalid. */
  helper?: string;
  /** What is wrong and how to fix it, shown in place of helper while invalid is true. */
  error?: string;
  invalid?: boolean;
  /** A one-word pill beside the label — "Beta", "Optional". */
  tag?: string;
  /** Marks the field required and, with no tag, draws a "Required" tag. */
  required?: boolean;
  /** Caps typing at this many characters and shows the count. 0 is no cap and no counter. */
  maxLength?: number;
  /** Not editable and not announced as editable. Say why in helper. */
  disabled?: boolean;
  /** The value can be read, selected and copied but not changed. */
  readOnly?: boolean;
  /** Draws the focus edge without real focus — for screenshots and a form's jump-to-first-error. */
  focused?: boolean;
  /** A trailing Copy was just tapped: the field announces "Copied" and clears it after 1.5s. */
  copied?: boolean;
  onValueChange?: (value: string) => void;
  /** The keyboard's Return key (Done, or Search for `type="search"`) was pressed. */
  onSubmit?: () => void;
  /** Focus left the field: the moment to check the value. */
  onBlur?: () => void;
  /** This field's built-in text ("Required", "Copied", the counter) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["text-field"]>;
  /** Per-part styles over the theme: `{ root: {…}, field: {…} }`. */
  styles?: PartStyles<"text-field">;
  style?: ViewStyle;
}

const COPIED_MS = 1500;
/** How long typing must pause before the characters left are said. */
const SAID_MS = 600;

/** The phone's keyboard, capitals, autofill and secure entry for what the field holds. */
function entry(type: TextFieldType, autoComplete?: string): Partial<TextInputProps> {
  const address = type === "email" || type === "url" || type === "password" || type === "tel" || type === "number";
  // The web's autocomplete names, in the phone's.
  const known: Record<string, TextInputProps["autoComplete"]> = { "current-password": "current-password", "new-password": "new-password", email: "email", username: "username", tel: "tel", "one-time-code": "one-time-code", off: "off" };
  return {
    secureTextEntry: type === "password",
    keyboardType: type === "email" ? "email-address" : type === "tel" ? "phone-pad" : type === "url" ? "url" : type === "number" ? "decimal-pad" : "default",
    autoCapitalize: address ? "none" : undefined,
    autoCorrect: address ? false : undefined,
    textContentType: type === "email" ? "emailAddress" : type === "password" ? "password" : type === "tel" ? "telephoneNumber" : type === "url" ? "URL" : undefined,
    autoComplete: autoComplete ? known[autoComplete] : undefined,
    returnKeyType: type === "search" ? "search" : undefined,
  };
}

/** Layout no token decides; what the tokens decide (sizes, colours, type, edges) is the recipe's. */
const useStyles = createStyles(() => ({
  root: { alignSelf: "stretch", width: "100%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tag: { flexShrink: 0 },
  box: { flexDirection: "row", alignItems: "center" },
  prefix: { flexShrink: 0 },
  input: { flexGrow: 1, flexShrink: 1, alignSelf: "stretch", padding: 0 },
  trailing: { flexShrink: 0 },
  footer: { flexDirection: "row", alignItems: "flex-start" },
  message: { flexDirection: "row", alignItems: "flex-start", flexGrow: 1, flexShrink: 1 },
  errorText: { flexShrink: 1 },
  helper: { flexGrow: 1, flexShrink: 1 },
  counter: { marginStart: "auto", flexShrink: 0, fontVariant: ["tabular-nums"] },
}));

export function TextField({
  label = "",
  value,
  placeholder = "",
  type = "text",
  autoComplete,
  prefix = "",
  leadingIcon = "",
  trailing,
  reveal = false,
  helper = "",
  error = "",
  invalid = false,
  tag = "",
  required = false,
  maxLength = 0,
  disabled = false,
  readOnly = false,
  focused = false,
  copied = false,
  onValueChange,
  onSubmit,
  onBlur,
  strings,
  styles,
  style,
  testID,
  ...rest
}: TextFieldProps) {
  const form = useFormField();
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("text-field", strings);
  // A password with `reveal` shows its characters while the Show button is on.
  const [visible, setVisible] = useState(false);
  const revealing = reveal && type === "password";
  const [current = "", setText] = useControllable(value, onValueChange);
  const [hasFocus, setFocus] = useState(false);
  const [justCopied, setCopied] = useControllable(copied);
  const copiedSaid = str("copied");
  useEffect(() => {
    if (!justCopied) return;
    announce(copiedSaid);
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [justCopied, setCopied, copiedSaid]);

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
  const isFocused = focused || hasFocus;
  // The phone's field has no size: it is always the large one.
  const r = useRecipe(recipes["text-field"], { variants: { size: "lg" }, state: { focus: isFocused, invalid, readOnly, disabled }, styles });
  // An icon's size is its width and height (`size`); what else `styles` sets on it goes on the glyph.
  const { width: leadSize, height: _lh, ...leadRest } = r.leadingIcon.view;
  const errorIcon = partStyle(r, "errorIcon", { view: { marginTop: t.space["3xs"] } });
  const { width: errSize, height: _eh, ...errRest } = errorIcon.view;
  const edge = r.field.view.borderWidth as number;
  // The text sits inside the field's edge, one width in from each side.
  const input = partStyle(r, "input", { view: { minHeight: (r.field.view.minHeight as number) - 2 * edge } });
  // The placeholder's colour is a TextInput prop, not a style.
  const { placeholderTextColor, ...inputText } = input.text;
  const tagText = partStyle(r, "tag", { text: { lineHeight: (r.tag.text.fontSize as number) * 1.2 } }).text;
  return (
    <View testID={partId(testID, "text-field", "root")} {...rootProps(rest)} style={[s.root, r.root.view, style]}>
      {label || tag || required ? (
        <View style={[s.header, { gap: t.space.sm }]}>
          {label ? (
            <Text testID={partId(testID, "text-field", "label")} maxFontSizeMultiplier={fontScale.content} style={[r.label.view, r.label.text]}>
              {label}
            </Text>
          ) : null}
          {tag || required ? (
            <View testID={partId(testID, "text-field", "tag")} style={[s.tag, r.tag.view]}>
              <Text maxFontSizeMultiplier={fontScale.chrome} style={tagText}>{tag || str("required")}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View testID={partId(testID, "text-field", "field")} style={[s.box, r.field.view]}>
        {leadingIcon ? <Icon testID={partId(testID, "text-field", "leadingIcon")} name={leadingIcon} size={leadSize as number} color={r.leadingIcon.text.color} style={Object.keys(leadRest).length ? leadRest : undefined} /> : null}
        {prefix ? (
          <Text aria-hidden testID={partId(testID, "text-field", "prefix")} style={[s.prefix, r.prefix.view, r.prefix.text]}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          testID={partId(testID, "text-field", "input")}
          value={current}
          onChangeText={(next) => setText(next)}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          accessibilityLabel={label || placeholder || form?.label}
          // What is said after the name: the error or the helper, the field's own description and error, and that it is required.
          accessibilityHint={[showError ? error : helper, form?.hint, required && !form?.required ? tag || str("required") : ""].filter(Boolean).join(". ") || undefined}
          accessibilityState={{ disabled }}
          editable={!disabled && !readOnly}
          maxLength={maxLength > 0 ? maxLength : undefined}
          {...entry(type, autoComplete)}
          secureTextEntry={type === "password" && !(revealing && visible)}
          returnKeyType={type === "search" ? "search" : onSubmit ? "done" : undefined}
          onSubmitEditing={() => onSubmit?.()}
          // Entry text grows with the person's setting like reading text; the field's `minHeight` grows with it.
          maxFontSizeMultiplier={fontScale.content}
          onFocus={() => setFocus(true)}
          onBlur={() => {
            setFocus(false);
            onBlur?.();
          }}
          style={[s.input, input.view, inputText]}
        />
        {trailing || revealing ? (
          <View testID={partId(testID, "text-field", "trailing")} style={[s.trailing, r.trailing.view]}>
            {trailing || null}
            {revealing ? (
              <Button label={str(visible ? "hide" : "show")} accessibilityLabel={str(visible ? "hideLabel" : "showLabel")} variant="ghost" size="sm" disabled={disabled} onPress={() => setVisible(!visible)} />
            ) : null}
          </View>
        ) : null}
      </View>
      {showError || helper || maxLength > 0 ? (
        <View style={[s.footer, { gap: t.space.sm }]}>
          {showError ? (
            <Enter testID={partId(testID, "text-field", "error")} motion="fade" style={[s.message, r.error.view]}>
              <Icon testID={partId(testID, "text-field", "errorIcon")} name="circle-alert" size={errSize as number} color={errorIcon.text.color ?? r.error.text.color} style={errRest} />
              <Text testID={partId(testID, "text-field", "errorText")} maxFontSizeMultiplier={fontScale.content} style={[s.errorText, r.errorText.view, r.errorText.text]}>
                {error}
              </Text>
            </Enter>
          ) : null}
          {!showError && helper ? (
            <Text testID={partId(testID, "text-field", "helper")} maxFontSizeMultiplier={fontScale.content} style={[s.helper, r.helper.view, r.helper.text]}>
              {helper}
            </Text>
          ) : null}
          {maxLength > 0 ? (
            <Text testID={partId(testID, "text-field", "counter")} maxFontSizeMultiplier={fontScale.content} style={[s.counter, r.counter.view, r.counter.text]}>
              {str("characterCount", { current: current.length, max: maxLength })}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
