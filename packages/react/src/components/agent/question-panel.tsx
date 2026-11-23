import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { recipes, useControllable, useDirection, useStrings, type KitStrings, type QuestionOption, type ToolArg } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { useAutoFocus } from "../../platform";
import { useInteraction } from "../../lib/interaction";
import { announce } from "../../lib/announce";
import { rootProps, type RootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, input, neg, pressable, row, rtl, text } from "../../lib/style";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

export interface QuestionPanelProps extends RootProps<HTMLDivElement> {
  /** "Approve this action?", "Choose one", "Type your answer". */
  title: string;
  /** The agent's display name, for the waiting bar and the paused line: "Invoice agent is paused until you answer." Empty names none. */
  agentName?: string;
  /** The collapsed bar's words. Empty reads the strings' `waiting` (or `waitingNamed` with an `agentName`). */
  waitingLabel?: string;
  /** The region's accessible name. Collapsing hides the question; it keeps this name. Empty reads the strings' `region`. */
  regionLabel?: string;
  /** The tool's own name, drawn as a chip. Only a gated tool call has one. */
  toolName?: string;
  /** What will happen, or what the question is about. Plain text, never Markdown. */
  details?: string;
  /** The tool call's arguments, printed whole as plain text; a long list scrolls. */
  args?: ToolArg[];
  /** The answer rows, numbered 1 to 9. List refusal first. */
  options?: QuestionOption[];
  /** A typed answer instead of rows. */
  field?: boolean;
  /** The typed answer's example. Empty reads the strings' `placeholder`. */
  placeholder?: string;
  /** Type-to-confirm: the row `confirmOption` arms only once this is typed exactly. */
  confirmText?: string;
  /** The key of the row type-to-confirm guards. Empty guards none. */
  confirmOption?: string;
  /** The chosen row's key. Nothing is chosen at first. */
  value?: string;
  /** What has been typed: the answer, or the confirm text. */
  typed?: string;
  /** Moves focus to the question when it appears or expands: for a question that blocks the turn. The title is the focus target. Off by default; either way the question is announced. */
  autoFocus?: boolean;
  /** The question is shown. False folds it to a bar that says the agent is waiting. */
  expanded?: boolean;
  /** Submit waits: an answer given offline has nowhere to go. */
  offline?: boolean;
  /** The answer is on its way. Pressing Submit sets it; the app removes the panel once the answer lands. */
  sending?: boolean;
  onValueChange?: (value: string) => void;
  onTypedChange?: (typed: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  /** The chosen row's key, or the typed answer, trimmed. */
  onSubmit?: (answer: string) => void;
  /** This panel's built-in text (the waiting bar, the paused and offline lines, the confirm field's words, Submit) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["question-panel"]>;
  /** Per-part styles over the theme: `{ root: {…}, title: {…} }`. */
  styles?: PartStyles<"question-panel">;
  style?: CSSProperties;
}

const KEYED = 9;

/** A key typed into one of these is text, not a choice. */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);

/** Layout no token decides; what the tokens decide is the recipe's. */
const card: CSSProperties = { ...box, width: "100%" };
const fieldLook: CSSProperties = { ...input, width: "100%", borderStyle: "solid" };

/** A scroll area a keyboard can reach: a tab stop with a name and a ring, since a clipped list cannot be scrolled otherwise (Safari does not focus scrollers). */
function useScrollRegion() {
  const ui = useInteraction();
  return { tabIndex: 0, ...ui.handlers, ring: ui.focused ? ({ boxShadow: `inset 0 0 0 2px ${t.focus.ring}` } as CSSProperties) : undefined };
}

interface RowProps {
  option: QuestionOption;
  index: number;
  id: string;
  chosen: boolean;
  tabbable: boolean;
  disabled: boolean;
  onChoose: (index: number, focus: boolean) => void;
  onMove: (index: number) => void;
  setRef: (el: HTMLButtonElement | null) => void;
  styles: QuestionPanelProps["styles"];
}

function Row({ option, index, id, chosen, tabbable, disabled, onChoose, onMove, setRef, styles }: RowProps) {
  const ui = useInteraction({ disabled });
  const r = useRecipe(recipes["question-panel"], { state: { on: chosen, focus: ui.focused, disabled }, styles });
  const keyed = index < KEYED;
  const dir = useDirection();
  const keys = (e: KeyboardEvent<HTMLButtonElement>) => {
    const next = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const prev = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const step = e.key === "ArrowDown" || e.key === next ? 1 : e.key === "ArrowUp" || e.key === prev ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    onMove(step);
  };
  return (
    <button
      ref={setRef}
      type="button"
      role="radio"
      aria-checked={chosen}
      aria-label={option.label}
      aria-describedby={option.detail ? `${id}-${index}-d` : undefined}
      tabIndex={tabbable ? 0 : -1}
      disabled={disabled}
      data-af-part="row"
      data-af-press
      onClick={() => onChoose(index, false)}
      onKeyDown={keys}
      {...ui.handlers}
      style={css(pressable, row, rtl({ width: "100%", textAlign: "left" }, dir), partStyle(r, "row", { cursor: disabled ? "not-allowed" : "pointer", transition: `background ${t.duration.fast}, border-color ${t.duration.fast}` }))}
    >
      <span style={css(box, { flex: 1, gap: t.space["3xs"] })}>
        <span data-af-part="rowLabel" style={css(text, r.rowLabel)}>
          {option.label}
        </span>
        {option.detail ? (
          <span id={`${id}-${index}-d`} data-af-part="rowDetail" style={css(text, r.rowDetail)}>
            {option.detail}
          </span>
        ) : null}
      </span>
      {keyed && (
        <span aria-hidden data-af-part="key" style={css(row, { flex: "none", justifyContent: "center", boxSizing: "border-box" }, r.key)}>
          {index + 1}
        </span>
      )}
    </button>
  );
}

export function QuestionPanel({
  title,
  agentName = "",
  waitingLabel = "",
  regionLabel = "",
  toolName = "",
  details = "",
  args = [],
  options = [],
  field = false,
  placeholder = "",
  confirmText = "",
  confirmOption = "",
  value,
  typed,
  expanded,
  autoFocus = false,
  offline = false,
  sending = false,
  onValueChange,
  onTypedChange,
  onExpandedChange,
  onSubmit,
  strings,
  styles,
  style,
  ref: rootRef,
  ...rest
}: QuestionPanelProps) {
  const s = useStrings("question-panel", strings);
  const id = useId();
  const [chosen = "", setChosen] = useControllable(value, onValueChange);
  const [entry = "", setEntry] = useControllable(typed, onTypedChange);
  const [open = true, setOpen] = useControllable(expanded, onExpandedChange);
  const shut = !open;
  const [busy, setBusy] = useControllable(sending);
  const allowFocus = useAutoFocus();
  const heading = useRef<HTMLSpanElement | null>(null);
  const detailsScroll = useScrollRegion();
  const argsScroll = useScrollRegion();
  const [focus, setFocus] = useState<"field" | "confirm" | null>(null);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const caret = useRef<HTMLButtonElement | null>(null);
  const toggled = useRef(false);
  const r = useRecipe(recipes["question-panel"], { variants: { expanded: open }, state: { on: offline }, styles });
  const field_ = useRecipe(recipes["question-panel"], { state: { focus: focus === "field", disabled: busy }, styles });
  const confirm_ = useRecipe(recipes["question-panel"], { state: { focus: focus === "confirm", disabled: busy }, styles });
  const region = regionLabel || s("region");
  const waiting = waitingLabel || (agentName ? s("waitingNamed", { name: agentName }) : s("waiting"));

  const index = options.findIndex((o) => o.key === chosen);
  // Only the guarded row asks for the typing; refusing never does.
  const guarded = !field && confirmText !== "" && index >= 0 && confirmOption !== "" && chosen === confirmOption;
  const matches = entry.trim() === confirmText;
  const armed = field ? entry.trim() !== "" : index >= 0 && (!guarded || matches);
  const canSubmit = armed && !offline && !busy;

  const choose = (at: number, focusRow: boolean) => {
    if (busy) return;
    setChosen(options[at]!.key);
    if (focusRow) rows.current[at]?.focus();
  };
  const move = (step: number) => choose(((index < 0 ? 0 : index) + step + options.length) % options.length, true);
  const submit = () => {
    if (!canSubmit) return;
    setBusy(true);
    onSubmit?.(field ? entry.trim() : chosen);
  };
  const toggle = (to: boolean) => {
    toggled.current = true;
    setOpen(!to);
  };

  // 1 to 9 choose a row while focus is inside the panel (never from the page, and never from a text field); they never submit.
  const digits = (e: KeyboardEvent<HTMLDivElement>) => {
    if (shut || busy || field || options.length === 0) return;
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || !/^[1-9]$/.test(e.key)) return;
    const at = Number(e.key) - 1;
    if (at >= Math.min(options.length, KEYED) || isTyping(e.target)) return;
    e.preventDefault();
    setChosen(options[at]!.key);
    rows.current[at]?.focus();
  };

  // A question that blocks the turn is said when it appears or opens, and takes focus when the product asks it to.
  useEffect(() => {
    if (shut || busy) return;
    announce(s("asking", { region, title }), "assertive");
    if (autoFocus && allowFocus) heading.current?.focus({ preventScroll: true });
    // On mount and each time it opens, not on every change of its words.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shut]);

  // The caret that was pressed unmounts with its state; focus moves to the one that replaces it.
  useEffect(() => {
    if (!toggled.current) return;
    toggled.current = false;
    caret.current?.focus();
  }, [shut]);
  // The caret's state, on the button IconButton draws: it says whether the question is open, whatever its label says.
  useEffect(() => {
    caret.current?.setAttribute("aria-expanded", String(!shut));
  });

  if (shut) {
    return (
      <div role="region" aria-label={region} data-af-part="root" {...rootProps(rest)} ref={rootRef} onClick={() => toggle(false)} style={css(card, row, partStyle(r, "root", { cursor: "pointer" }), style)}>
        <span data-af-part="barLabel" style={css(text, { flex: 1 }, r.barLabel)}>
          {waiting}
        </span>
        <span ref={(el) => void (caret.current = el?.querySelector("button") ?? null)} onClick={(e) => e.stopPropagation()}>
          <IconButton icon="chevron-up" label={s("expand")} size="sm" onPress={() => toggle(false)} />
        </span>
      </div>
    );
  }

  return (
    <div role="region" aria-label={region} data-af-part="root" {...rootProps(rest)} ref={rootRef} onKeyDown={digits} style={css(card, r.root, style)}>
      <div data-af-part="header" style={css(row, r.header)}>
        <span ref={heading} tabIndex={-1} id={`${id}-title`} data-af-part="title" style={css(text, { flex: 1 }, r.title)}>
          {title}
        </span>
        <span ref={(el) => void (caret.current = el?.querySelector("button") ?? null)}>
          <IconButton icon="chevron-down" label={s("collapse")} size="sm" onPress={() => toggle(true)} />
        </span>
      </div>

      {(toolName || details || args.length > 0) && (
        <div style={css(box, { alignItems: "flex-start", gap: t.space.xs })}>
          {toolName && (
            <code data-af-part="tool" style={css(text, { maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, r.tool)}>
              {toolName}
            </code>
          )}
          {details && (
            <p
              data-af-part="details"
              role="region"
              aria-label={s("detailsLabel")}
              tabIndex={detailsScroll.tabIndex}
              onFocus={detailsScroll.onFocus}
              onBlur={detailsScroll.onBlur}
              style={css(text, { width: "100%", overflowY: "auto", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }, r.details, detailsScroll.ring)}
            >
              {details}
            </p>
          )}
          {args.length > 0 && (
            <dl
              data-af-part="args"
              role="group"
              aria-label={s("argsLabel")}
              tabIndex={argsScroll.tabIndex}
              onFocus={argsScroll.onFocus}
              onBlur={argsScroll.onBlur}
              style={css({ display: "grid", gridTemplateColumns: "max-content minmax(0, 1fr)", rowGap: t.space.xs, columnGap: t.space.md, width: "100%", margin: 0, overflowY: "auto" }, r.args, argsScroll.ring)}
            >
              {args.map((a, i) => (
                <div key={i} style={{ display: "contents" }}>
                  <dt data-af-part="argName" style={css(text, r.argName)}>
                    {a.name}
                  </dt>
                  <dd data-af-part="argValue" style={css(text, { margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }, r.argValue)}>
                    {a.value || s("noValue")}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {field ? (
        <input
          data-af-part="field"
          data-af-input
          value={entry}
          disabled={busy}
          placeholder={placeholder || s("placeholder")}
          aria-labelledby={`${id}-title`}
          onChange={(e) => setEntry(e.target.value)}
          onFocus={() => setFocus("field")}
          onBlur={() => setFocus(null)}
          onKeyDown={(e) => {
            // Enter submits here, and only here: on a row it chooses.
            if (e.key !== "Enter") return;
            e.preventDefault();
            submit();
          }}
          style={css(fieldLook, field_.field)}
        />
      ) : (
        <div role="radiogroup" aria-labelledby={`${id}-title`} data-af-part="rows" style={css(box, r.rows)}>
          {options.map((o, i) => (
            <Row
              key={i}
              option={o}
              index={i}
              id={id}
              chosen={i === index}
              tabbable={i === (index < 0 ? 0 : index)}
              disabled={busy}
              onChoose={choose}
              onMove={move}
              setRef={(el) => void (rows.current[i] = el)}
              styles={styles}
            />
          ))}
        </div>
      )}

      {guarded && (
        <div data-af-part="confirm" style={css(row, { alignItems: "flex-start", marginTop: neg(t.space.xs) }, r.confirm)}>
          <span aria-hidden data-af-part="elbow" style={css({ flex: "none", borderStyle: "solid", borderTopWidth: 0, borderRightWidth: 0 }, r.elbow)} />
          <div style={css(box, { flex: 1, gap: t.space["2xs"], paddingTop: t.space.xs })}>
            <span data-af-part="confirmCaption" style={css(text, r.confirmCaption)}>
              {s("irreversible")}
            </span>
            <input
              data-af-part="confirmField"
              data-af-input
              value={entry}
              disabled={busy}
              placeholder={s("confirmLabel", { text: confirmText })}
              aria-label={s("confirmLabel", { text: confirmText })}
              aria-describedby={entry !== "" && !matches ? `${id}-hint` : undefined}
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => setEntry(e.target.value)}
              onFocus={() => setFocus("confirm")}
              onBlur={() => setFocus(null)}
              style={css(fieldLook, confirm_.confirmField)}
            />
            {entry !== "" && !matches && (
              <span id={`${id}-hint`} data-af-part="hint" style={css(text, r.hint)}>
                {s("mismatch")}
              </span>
            )}
          </div>
        </div>
      )}

      <div data-af-part="footer" style={css(row, r.footer)}>
        {/* Offline replaces the paused line rather than sitting beside it. */}
        <span role={offline ? "status" : undefined} data-af-part="status" style={css(text, { flex: 1 }, r.status)}>
          {offline ? s("offline") : agentName ? s("pausedNamed", { name: agentName }) : s("paused")}
        </span>
        <Button label={busy ? s("sending") : s("submit")} variant="primary" size="md" disabled={!canSubmit} onPress={submit} />
      </div>
    </div>
  );
}
