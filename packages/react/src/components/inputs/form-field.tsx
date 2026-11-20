import { createContext, useContext, useEffect, useId, type CSSProperties, type ReactNode } from "react";
import { recipes, useStrings, type KitStrings } from "@antfabric-ui/core";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, row, text, visuallyHidden } from "../../lib/style";

/** What a control inside a FormField reads: the ids to wire up and what the field says about it. */
export interface FormFieldContextValue {
  /** The control's `id`: the label's `for` points at it. */
  id: string;
  /** The label's `id`, for a control that is not a native field (a listbox, a radio group) and names itself with `aria-labelledby`. */
  labelId: string;
  /** The ids of the description and the error that are drawn, for `aria-describedby`. */
  describedBy: string | undefined;
  /** An error is showing: `aria-invalid`. */
  invalid: boolean;
  /** `aria-required`. */
  required: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/**
 * The FormField this control sits in, or `null` when it sits in none. TextField, SearchField, Select, Checkbox, Switch and RadioGroup read
 * it; a product's own control can too, to take the same `id`, `aria-describedby`, `aria-invalid` and `aria-required`.
 */
export function useFormField(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}

/** Joins ids for `aria-describedby`, leaving out the empty ones; `undefined` when none is left. */
export function joinIds(...ids: (string | false | null | undefined)[]): string | undefined {
  const out = ids.filter(Boolean).join(" ");
  return out || undefined;
}

export interface FormFieldProps extends RootProps<HTMLDivElement> {
  /** The field's name: a real `<label for>` on the control inside. */
  label: string;
  /** One clause under the label that says what to enter or why. Read after the control's name. */
  description?: string;
  /** What is wrong and how to fix it. While it is not empty the control is marked invalid and the message is announced. */
  error?: string;
  /** Marks the control `aria-required` and draws a "Required" pill beside the label. */
  required?: boolean;
  /** Keep the label for screen readers but do not draw it, when a heading above already asks. */
  hideLabel?: boolean;
  /** The one control: a TextField, Select, SearchField, Checkbox, Switch or RadioGroup. */
  children?: ReactNode;
  /** Per-part styles over the theme: `{ root: {…}, label: {…} }`. */
  styles?: PartStyles<"form-field">;
  /** This field's built-in text (the "Required" pill) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["form-field"]>;
  style?: CSSProperties;
}

export function FormField({ label, description = "", error = "", required = false, hideLabel = false, children, styles, strings, style, ...rest }: FormFieldProps) {
  const s = useStrings("form-field", strings);
  const id = useId();
  const r = useRecipe(recipes["form-field"], { styles });
  const showError = !!error;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = showError ? `${id}-error` : undefined;
  // An error that arrives is said once; a region that mounts holding its text is not read.
  useEffect(() => {
    if (error) announce(error);
  }, [error]);
  const value: FormFieldContextValue = { id: `${id}-control`, labelId: `${id}-label`, describedBy: joinIds(descriptionId, errorId), invalid: showError, required };
  return (
    <div data-af-part="root" {...rootProps(rest)} style={css(box, { alignSelf: "stretch", width: "100%" }, partStyle(r, "root"), style)}>
      <div style={css(row, { justifyContent: "space-between", gap: t.space.sm }, hideLabel && visuallyHidden)}>
        <label id={value.labelId} htmlFor={value.id} data-af-part="label" style={css(text, r.label)}>
          {label}
        </label>
        {required && (
          <span aria-hidden data-af-part="required" style={css(text, { flexShrink: 0, lineHeight: 1.2 }, r.required)}>
            {s("required")}
          </span>
        )}
      </div>
      {description && (
        <span id={descriptionId} data-af-part="description" style={css(text, r.description)}>
          {description}
        </span>
      )}
      <FormFieldContext.Provider value={value}>{children}</FormFieldContext.Provider>
      {showError && (
        <div id={errorId} data-af-part="error" style={css(row, { alignItems: "flex-start" }, partStyle(r, "error", enter("fade")))}>
          <Icon part="errorIcon" name="circle-alert" style={partStyle(r, "errorIcon", { marginTop: t.space["3xs"] })} />
          <span data-af-part="errorText" style={css(text, r.errorText)}>
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
