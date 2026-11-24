import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { recipes, useControllable, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { isComposing } from "../../lib/keys";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { splitRootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, input, row, rtl, text } from "../../lib/style";
import { joinIds, useFormField } from "./form-field";
import { Button } from "../actions/button";

export type TextFieldSize = "lg" | "sm";
export type TextFieldType = "text" | "email" | "password" | "search" | "tel" | "url" | "number";
export type TextFieldInputMode = "text" | "email" | "numeric" | "decimal" | "tel" | "url" | "search" | "none";

/** `id`, `aria-*` and `ref` name the input; `className` and `data-*` go on the root (`splitRootProps`). */
export interface TextFieldProps extends RootProps<HTMLInputElement> {
  /** Visible label and the field's accessible name. */
  label?: string;
  value?: string;
  /** An example of the answer, never the instructions — placeholders vanish the moment someone types. */
  placeholder?: string;
  /** What the field holds: it picks the keyboard on a phone, what a browser autofills and, for `password`, hides the characters. */
  type?: TextFieldType;
  /** The name a form posts this field under, and a password manager files it by. */
  name?: string;
  /** What the browser or the phone may fill in: `email`, `username`, `current-password`, `new-password`, `one-time-code`, `tel`, `off`. */
  autoComplete?: string;
  /** The keyboard a phone browsing the web app raises, when `type` does not already say (a code of digits is `numeric`). */
  inputMode?: TextFieldInputMode;
  /** Fixed text before the value that is not part of it, like the # of a channel name. */
  prefix?: string;
  /** Field furniture in text.faint, one step smaller than the text. Never tinted on focus. */
  leadingIcon?: IconName;
  /** A control at the end of the field: Copy on a read-only link. */
  trailing?: ReactNode;
  /** With `type="password"`: a Show / Hide button at the end of the field that shows the characters while pressed on, and hides them again. */
  reveal?: boolean;
  /** One clause under the field. Replaced by the error while invalid. */
  helper?: string;
  /** What is wrong and how to fix it, shown in place of helper while invalid is true. */
  error?: string;
  invalid?: boolean;
  /** A one-word pill beside the label — "Beta", "Optional". */
  tag?: string;
  /** Sets aria-required and, with no tag, draws a "Required" tag. */
  required?: boolean;
  /** Caps typing at this many characters and shows the count. 0 is no cap and no counter. */
  maxLength?: number;
  /** lg is the 44px dialog and wizard field. sm is the 32px toolbar field. */
  size?: TextFieldSize;
  /** Skipped by Tab and not announced as editable. Say why in helper. */
  disabled?: boolean;
  /** The value can be read, selected and copied but not changed. Stays in the tab order. */
  readOnly?: boolean;
  /** Draws the focus edge without real focus — for screenshots and a form's jump-to-first-error. Real focus is tracked by the field. */
  focused?: boolean;
  /** A trailing Copy was just pressed: the field announces "Copied" and clears it after 1.5s. */
  copied?: boolean;
  onValueChange?: (value: string) => void;
  /** Enter was pressed in the field (not while an IME is composing). */
  onSubmit?: () => void;
  /** Focus left the field: the moment to check the value. */
  onBlur?: () => void;
  /** This field's built-in text ("Required", "Copied", the counter) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["text-field"]>;
  /** Per-part styles over the theme: `{ root: {…}, field: {…} }`. */
  styles?: PartStyles<"text-field">;
  style?: CSSProperties;
}

const COPIED_MS = 1500;
/** How long typing must pause before the characters left are said. */
const SAID_MS = 600;

/** Layout and motion no token decides; what the tokens decide (sizes, colours, type, edges) is the recipe's. */
const field: CSSProperties = {
  ...row,
  transition: `border-color ${t.motion.duration.base}, background ${t.motion.duration.base}, box-shadow ${t.motion.duration.base}`,
};

export function TextField({
  label = "",
  value,
  placeholder = "",
  type = "text",
  name,
  autoComplete,
  inputMode,
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
  size = "lg",
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
  ...rest
}: TextFieldProps) {
  const s = useStrings("text-field", strings);
  const own = useId();
  // A password with `reveal` shows its characters while the Show button is on.
  const [visible, setVisible] = useState(false);
  const revealing = reveal && type === "password";
  const drawnType = revealing && visible ? "text" : type;
  const form = useFormField();
  const pass = splitRootProps(rest);
  // A FormField's label points at its own id; outside one, a passed `id` replaces the kit's, so the label and the helper still line up.
  const id = form?.id ?? (pass.control.id as string | undefined) ?? own;
  const dir = useDirection();
  const ui = useInteraction({ disabled });
  const [current = "", setText] = useControllable(value, onValueChange);
  const [justCopied, setCopied] = useControllable(copied);
  const copiedSaid = s("copied");
  useEffect(() => {
    if (!justCopied) return;
    announce(copiedSaid);
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [justCopied, setCopied, copiedSaid]);

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

  const isFocused = focused || ui.focused;
  const footer = showError || !!helper || maxLength > 0;
  const said = showError ? `${id}-error` : helper ? `${id}-helper` : undefined;
  const r = useRecipe(recipes["text-field"], {
    variants: { size },
    // Hover moves the fill only, and never on a focused, invalid, read-only or disabled field.
    state: { hover: ui.hovered && !isFocused && !invalid && !readOnly && !disabled, focus: isFocused, invalid, readOnly, disabled },
    styles,
  });
  const mustHave = required || !!form?.required;
  return (
    <div data-af-part="root" {...pass.root} style={css(box, { alignSelf: "stretch", width: "100%" }, r.root, style)}>
      {(label || tag || required) && (
        <div style={css(row, { justifyContent: "space-between", gap: t.space.sm })}>
          {label && (
            <label htmlFor={id} data-af-part="label" style={css(text, r.label)}>
              {label}
            </label>
          )}
          {(tag || required) && (
            <span data-af-part="tag" style={css(text, { flexShrink: 0, lineHeight: 1.2 }, r.tag)}>
              {tag || s("required")}
            </span>
          )}
        </div>
      )}
      <div data-af-part="field" {...ui.handlers} style={css(field, partStyle(r, "field", disabled && { cursor: "not-allowed" }))}>
        {leadingIcon && <Icon part="leadingIcon" name={leadingIcon} style={r.leadingIcon} />}
        {prefix && (
          <span aria-hidden data-af-part="prefix" style={css(text, { flexShrink: 0 }, r.prefix)}>
            {prefix}
          </span>
        )}
        <input
          data-af-part="input"
          data-af-input
          type={drawnType}
          name={name}
          autoComplete={autoComplete}
          inputMode={inputMode}
          // A free-text value aligns to its own script; an address, a number or a password is always left to right.
          dir={type === "text" || type === "search" ? "auto" : "ltr"}
          value={current}
          placeholder={placeholder}
          aria-invalid={invalid || form?.invalid || undefined}
          aria-required={mustHave || undefined}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength > 0 ? maxLength : undefined}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onBlur?.()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isComposing(e)) onSubmit?.();
          }}
          {...pass.control}
          id={id}
          // A product's description is read after the kit's own.
          aria-describedby={joinIds(form?.describedBy, said, maxLength > 0 && `${id}-counter`, pass.control["aria-describedby"] as string | undefined)}
          style={css(input, { flexGrow: 1, alignSelf: "stretch" }, partStyle(r, "input", disabled && { cursor: "not-allowed" }))}
        />
        {(trailing || revealing) && (
          <div data-af-part="trailing" style={css(row, { flexShrink: 0 }, r.trailing)}>
            {trailing || null}
            {revealing && (
              <Button
                label={s(visible ? "hide" : "show")}
                // The name follows the visible word (WCAG 2.5.3), so the state is in the name and there is no aria-pressed: never both
                // ("Hide password, pressed").
                aria-label={s(visible ? "hideLabel" : "showLabel")}
                variant="ghost"
                size="sm"
                disabled={disabled}
                onPress={() => setVisible(!visible)}
              />
            )}
          </div>
        )}
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
