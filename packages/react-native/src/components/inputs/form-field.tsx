import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Text, View, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings } from "@antfabric-ui/core";
import { createStyles, useTheme } from "../../theme";
import { announce } from "../../lib/a11y";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";

/** What a control inside a FormField reads: its name, what to read after it, and what the field says about it. */
export interface FormFieldContextValue {
  /** The field's label: the name of a control that has none of its own. */
  label: string;
  /** The description, then the error, as one hint read after the control's name; `required` is added at the end. */
  hint: string | undefined;
  /** An error is showing. */
  invalid: boolean;
  /** The control is required. */
  required: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/** The FormField this control sits in, or `null`. TextField, SearchField, Select, Checkbox, Switch and RadioGroup read it. */
export function useFormField(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}

export interface FormFieldProps extends RootProps {
  /** The field's name. */
  label: string;
  /** One clause under the label that says what to enter or why. Read after the control's name. */
  description?: string;
  /** What is wrong and how to fix it. While it is not empty the control is marked invalid and the message is announced. */
  error?: string;
  /** Marks the control required (read after its name) and draws a "Required" pill beside the label. */
  required?: boolean;
  /** Keep the label for screen readers but do not draw it, when a heading above already asks. */
  hideLabel?: boolean;
  /** The one control: a TextField, Select, SearchField, Checkbox, Switch or RadioGroup. */
  children?: ReactNode;
  /** Per-part styles over the theme: `{ root: {…}, label: {…} }`. */
  styles?: PartStyles<"form-field">;
  /** This field's built-in text (the "Required" pill) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["form-field"]>;
  style?: ViewStyle;
}

const useStyles = createStyles(() => ({
  root: { alignSelf: "stretch", width: "100%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  required: { flexShrink: 0 },
  error: { flexDirection: "row", alignItems: "flex-start" },
  errorText: { flexShrink: 1 },
}));

export function FormField({ label, description = "", error = "", required = false, hideLabel = false, children, styles, strings, style, testID, ...rest }: FormFieldProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("form-field", strings);
  const r = useRecipe(recipes["form-field"], { styles });
  const showError = !!error;
  // iOS has no live regions: a message that arrives is said once.
  useEffect(() => {
    if (error) announce(error);
  }, [error]);
  // One hint, read after the control's name: what to enter, what is wrong, and that it is required.
  const hint = [description, error, required ? str("required") : ""].filter(Boolean).join(". ");
  const errorIcon = partStyle(r, "errorIcon", { view: { marginTop: t.space["3xs"] } });
  const { width: errSize, height: _eh, ...errRest } = errorIcon.view;
  return (
    <FormFieldContext.Provider value={{ label, hint: hint || undefined, invalid: showError, required }}>
      <View testID={partId(testID, "form-field", "root")} {...rootProps(rest)} style={[s.root, r.root.view, style]}>
        {hideLabel ? null : (
          <View style={[s.header, { gap: t.space.sm }]}>
            <Text testID={partId(testID, "form-field", "label")} maxFontSizeMultiplier={fontScale.content} style={[r.label.view, r.label.text]}>
              {label}
            </Text>
            {required ? (
              <View testID={partId(testID, "form-field", "required")} aria-hidden style={[s.required, r.required.view]}>
                <Text maxFontSizeMultiplier={fontScale.chrome} style={r.required.text}>
                  {str("required")}
                </Text>
              </View>
            ) : null}
          </View>
        )}
        {description ? (
          <Text testID={partId(testID, "form-field", "description")} maxFontSizeMultiplier={fontScale.content} style={[r.description.view, r.description.text]}>
            {description}
          </Text>
        ) : null}
        {children}
        {showError ? (
          <Enter testID={partId(testID, "form-field", "error")} motion="fade" style={[s.error, r.error.view]}>
            <Icon testID={partId(testID, "form-field", "errorIcon")} name="circle-alert" size={errSize as number} color={errorIcon.text.color ?? r.error.text.color} style={errRest} />
            <Text testID={partId(testID, "form-field", "errorText")} maxFontSizeMultiplier={fontScale.content} style={[s.errorText, r.errorText.view, r.errorText.text]}>
              {error}
            </Text>
          </Enter>
        ) : null}
      </View>
    </FormFieldContext.Provider>
  );
}
