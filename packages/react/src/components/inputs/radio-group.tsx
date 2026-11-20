import { useId, type CSSProperties, type ReactNode } from "react";
import { recipes, useControllable } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { useRovingKeys } from "../../lib/roving";
import { box, css, pressable, row, text } from "../../lib/style";
import { Tag, type TagTone } from "../display/tag";
import { joinIds, useFormField } from "./form-field";

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

export interface RadioGroupProps extends RootProps<HTMLDivElement> {
  /** Two to six options; more than that is a Select. */
  options: RadioGroupOption[];
  /** The chosen option's key. Empty is allowed and lights nothing — an unanswered question is genuinely unanswered. */
  value?: string;
  /** The group's name: the question being answered. */
  label?: string;
  /** Keep the name for screen readers but do not draw it, when a heading above already asks the question. */
  hideLabel?: boolean;
  /** list is a ring and a label per row. pills is the desktop's ChoicePills — a wrapping row of short answers. cards is a card per option, in as many columns as fit, for a choice that needs a picture or a few words more. */
  appearance?: RadioGroupAppearance;
  /** The whole group, for a write in flight or a person who may read but not change it. Say why near it. */
  disabled?: boolean;
  onValueChange?: (key: string) => void;
  /** Per-part styles over the theme: `{ root: {…}, option: {…} }`. */
  styles?: PartStyles<"radio-group">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; what the tokens decide (sizes, colours, type) is the recipe's. */
const optionRoot: CSSProperties = { ...pressable, flexDirection: "row", alignItems: "flex-start", textAlign: "start" };

const ring: CSSProperties = {
  ...box,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  transition: `border-color ${t.duration.base}, transform ${t.duration.fast}`,
};

const dot: CSSProperties = { transition: `transform ${t.duration.quick} ${t.ease.out}, opacity ${t.duration.fast}` };

const pillRoot: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  transition: `background ${t.duration.base}, color ${t.duration.base}, border-color ${t.duration.base}`,
};

/** A card: a column, its preview, then the label and its tags on one wrapping row, then the description. */
const cardRoot: CSSProperties = {
  ...pressable,
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "flex-start",
  textAlign: "start",
  minWidth: 0,
  transition: `border-color ${t.duration.base}, box-shadow ${t.duration.base}`,
};

interface OptionProps {
  option: RadioGroupOption;
  chosen: boolean;
  /** In the tab order: the chosen option, or the first enabled one when nothing is chosen. */
  stop: boolean;
  disabled: boolean;
  pill: boolean;
  card: boolean;
  pick: () => void;
  styles?: PartStyles<"radio-group">;
}

function Option({ option, chosen, stop, disabled, pill, card, pick, styles }: OptionProps) {
  const ui = useInteraction({ disabled });
  const own = useId();
  const descriptionId = `${own}-description`;
  // Only an unchosen pill takes the hover fill: hovering the chosen one would promise an action that does nothing.
  const r = useRecipe(recipes["radio-group"], { state: { on: chosen, hover: ui.hovered && !(pill && chosen), focus: ui.focused, disabled: ui.disabled }, styles });
  const common = {
    type: "button" as const,
    "data-af-press": true,
    role: "radio",
    "aria-checked": chosen,
    "aria-label": option.label,
    "aria-describedby": option.description && !pill ? descriptionId : undefined,
    tabIndex: stop ? 0 : -1,
    disabled: ui.disabled,
    onClick: pick,
    ...ui.handlers,
  };
  if (card) {
    // The card is the radio: its edge says it is chosen, so it draws no ring. The preview is decorative; the label names the option.
    return (
      // Named by its label and then its tags ("Sidebar In use"), never by the description, which is its description.
      <button key="card" {...common} aria-label={undefined} aria-labelledby={option.tags?.length ? `${own}-label ${own}-tags` : `${own}-label`} data-af-part="card" style={css(cardRoot, partStyle(r, "card", ui.disabled && { cursor: "not-allowed" }))}>
        {option.preview ? (
          <span aria-hidden data-af-part="cardPreview" style={css(box, partStyle(r, "cardPreview", { overflow: "hidden" }))}>
            {option.preview}
          </span>
        ) : null}
        <span data-af-part="cardHead" style={css(row, partStyle(r, "cardHead", { flexWrap: "wrap" }))}>
          <span id={`${own}-label`} data-af-part="cardLabel" style={css(text, r.cardLabel)}>
            {option.label}
          </span>
          {option.tags?.length ? (
            <span id={`${own}-tags`} data-af-part="cardTags" style={css(row, partStyle(r, "cardTags", { flexWrap: "wrap" }))}>
              {option.tags.map((g) => (
                <Tag key={g.label} label={g.label} tone={g.tone} size="sm" />
              ))}
            </span>
          ) : null}
        </span>
        {option.description ? (
          <span id={descriptionId} data-af-part="cardDescription" style={css(text, r.cardDescription)}>
            {option.description}
          </span>
        ) : null}
      </button>
    );
  }
  if (pill) {
    return (
      <button key="pill" {...common} data-af-part="pill" style={css(pillRoot, partStyle(r, "pill", ui.disabled && { cursor: "not-allowed" }))}>
        <span style={css(text, { lineHeight: 1.2 })}>{option.label}</span>
      </button>
    );
  }
  return (
    <button key="row" {...common} data-af-part="option" style={css(optionRoot, partStyle(r, "option", ui.disabled && { cursor: "not-allowed" }))}>
      <span aria-hidden data-af-part="ring" style={css(ring, r.ring)}>
        <span data-af-part="dot" style={css(dot, partStyle(r, "dot", { opacity: chosen ? 1 : 0, transform: chosen ? "scale(1)" : "scale(0)" }))} />
      </span>
      <span style={css(box, { flexShrink: 1, gap: t.space["3xs"] })}>
        <span data-af-part="label" style={css(text, r.label)}>
          {option.label}
        </span>
        {option.description && (
          <span id={descriptionId} data-af-part="description" style={css(text, r.description)}>
            {option.description}
          </span>
        )}
      </span>
    </button>
  );
}

export function RadioGroup({ options, value = "", label = "", hideLabel = false, appearance = "list", disabled = false, onValueChange, styles, style, ...rest }: RadioGroupProps) {
  const form = useFormField();
  const [current, setCurrent] = useControllable(value, onValueChange);
  const enabled = options.filter((o) => !o.disabled);
  const stopKey = options.some((o) => o.key === current && !o.disabled) ? current : enabled[0]?.key;
  const pill = appearance === "pills";
  const card = appearance === "cards";
  const r = useRecipe(recipes["radio-group"], { variants: { appearance }, styles });

  // Arrow keys move from the option that has focus to the next enabled one, wrapping, and choose it, as a native radio group does. Which
  // way left and right go follows the direction of the tree. The first press moves even when nothing is chosen yet.
  const keys = useRovingKeys<HTMLDivElement>({
    items: '[role="radio"]',
    orientation: "both",
    skip: ":disabled",
    onMove: (_item, index) => {
      const next = enabled[index];
      if (next) setCurrent(next.key);
    },
  });

  return (
    <div
      id={form?.id}
      role="radiogroup"
      aria-label={label || undefined}
      aria-labelledby={!label && form ? form.labelId : undefined}
      aria-describedby={joinIds(form?.describedBy)}
      aria-invalid={form?.invalid || undefined}
      aria-required={form?.required || undefined}
      aria-disabled={disabled || undefined}
      data-af-part="root"
      {...rootProps(rest)}
      style={css(box, partStyle(r, "root", { alignSelf: "stretch" }), style)}
    >
      {label && !hideLabel && (
        <span aria-hidden data-af-part="legend" style={css(text, r.legend)}>
          {label}
        </span>
      )}
      <div
        ref={keys.ref}
        onKeyDown={(e) => void keys.onKeyDown(e)}
        data-af-part="options"
        style={
          card
            ? // As many columns of at least `radioGroup.cardMinW` as fit; one, the full width, when the group is narrower than that.
              css({ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(min(${t.radioGroup.cardMinW}, 100%), 1fr))` }, r.options)
            : pill
              ? css(row, partStyle(r, "options", { flexWrap: "wrap" }))
              : css(box, partStyle(r, "options", { gap: t.space["3xs"] }))
        }
      >
        {options.map((o) => (
          <Option
            key={o.key}
            option={o}
            pill={pill}
            card={card}
            chosen={o.key === current}
            stop={o.key === stopKey}
            disabled={disabled || !!o.disabled}
            pick={() => setCurrent(o.key)}
            styles={styles}
          />
        ))}
      </div>
    </div>
  );
}
