import { useEffect, useId, type CSSProperties } from "react";
import { recipes, useControllable, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { splitRootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, input, row, rtl, text, visuallyHidden } from "../../lib/style";
import { joinIds, useFormField } from "./form-field";

export type TextAreaResize = "vertical" | "none";

/** `id`, `aria-*` and `ref` name the textarea; `className` and `data-*` go on the root (`splitRootProps`). */
export interface TextAreaProps extends RootProps<HTMLTextAreaElement> {
  /** Visible label and the field's accessible name. With `hideLabel` it is only the accessible name. */
  label: string;
  /** The text. Left out, the field keeps its own text, starting from `defaultValue`, and still reports each change. */
  value?: string;
  /** The text a field with no `value` starts with. */
  defaultValue?: string;
  /** An example of the answer, never the instructions — placeholders vanish the moment someone types. */
  placeholder?: string;
  /** How many lines tall the field is before it is resized. */
  rows?: number;
  /** Sets the text in the monospace face, for code, JSON and templates. */
  mono?: boolean;
  /** The name a form posts this field under. */
  name?: string;
  /** vertical lets the person drag the field taller (the grip in its corner); none keeps it at `rows`. */
  resize?: TextAreaResize;
  /** One clause under the field. Replaced by the error while invalid. */
  helper?: string;
  /** What is wrong and how to fix it, shown in place of helper while invalid is true. */
  error?: string;
  invalid?: boolean;
  /** Sets aria-required and draws a "Required" tag beside the label. */
  required?: boolean;
  /** Caps typing at this many characters and shows the count. 0 is no cap and no counter. */
  maxLength?: number;
  /** Skipped by Tab and not announced as editable. Say why in helper. */
  disabled?: boolean;
  /** The text can be read, selected and copied but not changed. Stays in the tab order. */
  readOnly?: boolean;
  /** Hides the label (and the tag) visually; it stays the field's accessible name. */
  hideLabel?: boolean;
  onValueChange?: (value: string) => void;
  /** Focus left the field: the moment to check the value. */
  onBlur?: () => void;
  /** This field's built-in text ("Required", the counter) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["text-area"]>;
  /** Per-part styles over the theme: `{ root: {…}, field: {…}, input: {…} }`. */
  styles?: PartStyles<"text-area">;
  style?: CSSProperties;
}

/** How long typing must pause before the characters left are said. */
const SAID_MS = 600;

/** Layout and motion no token decides; what the tokens decide (sizes, colours, type, edges) is the recipe's. */
const field: CSSProperties = {
  ...box,
  transition: `border-color ${t.motion.duration.base}, background ${t.motion.duration.base}, box-shadow ${t.motion.duration.base}`,
};

export function TextArea({
  label,
  value,
  defaultValue = "",
  placeholder = "",
  rows = 4,
  mono = false,
  name,
  resize = "vertical",
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
  ...rest
}: TextAreaProps) {
  const s = useStrings("text-area", strings);
  const own = useId();
  const form = useFormField();
  const pass = splitRootProps(rest);
  // A FormField's label points at its own id; outside one, a passed `id` replaces the kit's, so the label and the helper still line up.
  const id = form?.id ?? (pass.control.id as string | undefined) ?? own;
  const dir = useDirection();
  const ui = useInteraction({ disabled });
  // Left out, `value` is the field's own state, which starts as `defaultValue`.
  const [typed, setText] = useControllable(value, onValueChange);
  const current = typed ?? defaultValue;

  const showError = invalid && !!error;
  // A message that arrives is said once; a region that mounts holding its text is not read.
  useEffect(() => {
    if (showError) announce(error);
  }, [showError, error]);
  // Near the limit, and after typing pauses, the characters left are said; at the limit, that it was reached. Never on each keystroke.
  const left = maxLength - current.length;
  const near = maxLength > 0 && left <= Math.max(5, Math.ceil(maxLength * 0.1));
  const limitSaid = left <= 0 ? s("limitReached") : s("charactersLeft", { count: left });
  const typing = ui.focused;
  useEffect(() => {
    if (!near || !typing) return;
    const timer = setTimeout(() => announce(limitSaid), SAID_MS);
    return () => clearTimeout(timer);
  }, [near, typing, limitSaid]);

  const isFocused = ui.focused;
  const footer = showError || !!helper || maxLength > 0;
  const said = showError ? `${id}-error` : helper ? `${id}-helper` : undefined;
  const r = useRecipe(recipes["text-area"], {
    variants: { mono },
    // Hover moves the fill only, and never on a focused, invalid, read-only or disabled field.
    state: { hover: ui.hovered && !isFocused && !invalid && !readOnly && !disabled, focus: isFocused, invalid, readOnly, disabled },
    styles,
  });
  const mustHave = required || !!form?.required;
  return (
    <div data-af-part="root" {...pass.root} style={css(box, { alignSelf: "stretch", width: "100%" }, r.root, style)}>
      <div style={css(row, { justifyContent: "space-between", gap: t.space.sm }, hideLabel && visuallyHidden)}>
        <label htmlFor={id} data-af-part="label" style={css(text, r.label)}>
          {label}
        </label>
        {required && (
          <span data-af-part="tag" style={css(text, { flexShrink: 0, lineHeight: 1.2 }, r.tag)}>
            {s("required")}
          </span>
        )}
      </div>
      <div data-af-part="field" {...ui.handlers} style={css(field, partStyle(r, "field", disabled && { cursor: "not-allowed" }))}>
        <textarea
          data-af-part="input"
          data-af-input
          name={name}
          rows={rows}
          // Free text aligns to its own script; code and JSON are always laid out left to right.
          dir={mono ? "ltr" : "auto"}
          spellCheck={mono ? false : undefined}
          value={current}
          placeholder={placeholder}
          aria-invalid={invalid || form?.invalid || undefined}
          aria-required={mustHave || undefined}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength > 0 ? maxLength : undefined}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onBlur?.()}
          {...pass.control}
          id={id}
          // A product's description is read after the kit's own.
          aria-describedby={joinIds(form?.describedBy, said, maxLength > 0 && `${id}-counter`, pass.control["aria-describedby"] as string | undefined)}
          style={css(input, { display: "block", width: "100%", boxSizing: "border-box", resize, minHeight: 0 }, partStyle(r, "input", disabled && { cursor: "not-allowed" }))}
        />
      </div>
      {footer && (
        <div style={css(row, { alignItems: "flex-start", gap: t.space.sm })}>
          {showError && (
            <div id={`${id}-error`} data-af-part="error" style={css(row, { alignItems: "flex-start", flexGrow: 1 }, partStyle(r, "error", enter("fade")))}>
              <Icon part="errorIcon" name="circle-alert" style={partStyle(r, "errorIcon", { marginTop: t.space["3xs"] })} />
              <span data-af-part="errorText" style={css(text, r.errorText)}>
                {error}
              </span>
            </div>
          )}
          {!showError && helper && (
            <span id={`${id}-helper`} data-af-part="helper" style={css(text, { flexGrow: 1 }, r.helper)}>
              {helper}
            </span>
          )}
          {maxLength > 0 && (
            <span id={`${id}-counter`} data-af-part="counter" style={css(text, rtl({ marginLeft: "auto", flexShrink: 0, fontVariantNumeric: "tabular-nums" }, dir), r.counter)}>
              {s.parts("characterCount", { current: current.length, max: maxLength })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
