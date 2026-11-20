import { useEffect, useId, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon, Spinner, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, input, pressable, row, text, truncate } from "../../lib/style";
import { announce } from "../../lib/announce";
import { useOverlayFocus } from "../../lib/focus";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Avatar, type AvatarIdentity, type AvatarPresence } from "../display/avatar";
import { Kbd } from "../display/kbd";

export interface CommandPaletteItem {
  /** What `selected` and the group's order match, and what the row is known by. */
  key: string;
  label: string;
  /** What Enter will do, drawn on the right: Message, Channel, Open. */
  hint?: string;
  /** The glyph, when the row is not a face. */
  icon?: IconName;
  /** Draws the label's face (an Avatar) in the slot instead of `icon`. */
  avatar?: boolean;
  /** The face's colour, presence and agent mark. */
  identity?: AvatarIdentity;
  presence?: AvatarPresence;
  agent?: boolean;
  /** A status, inline after the label so rows keep one height. */
  status?: string;
  /** An action's shortcut, written once (`Mod+Shift+N`). */
  shortcut?: string;
  /** What the web draws instead when the browser owns the desktop shortcut. */
  webShortcut?: string;
  /** The highlighted row while nothing has been pressed or arrowed to. */
  selected?: boolean;
}

export interface CommandPaletteGroup {
  /** Names the group when its label is not unique; falls back to `label`. */
  key?: string;
  label: string;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps extends RootProps<HTMLDivElement> {
  query?: string;
  /** The field's placeholder. Default: the `placeholder` string. */
  placeholder?: string;
  /** The filters under the field, one pill each. Empty draws none. */
  filters?: string[];
  /** The pill that is on; one that no filter names leaves all off. */
  filter?: string;
  /** The key of the highlighted row. Empty follows the items' own `selected`. */
  selected?: string;
  /** Result groups in order. */
  groups?: CommandPaletteGroup[];
  /** People are still being searched on the server; local results are already shown. */
  loading?: boolean;
  /** Only what is on this device can be found. */
  offline?: boolean;
  /** The key hints along the foot. */
  showHints?: boolean;
  /** Enter asks the agent when nothing matches: the ask row, the hint along the foot and the empty state's sentence. */
  ask?: boolean;
  /** The agent's name: it only words the ask row, the hint and the empty state (and names the face). */
  agentName?: string;
  onQueryChange?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  onSelect?: (item: CommandPaletteItem) => void;
  /** Nothing matched and Enter hands the query to the agent. */
  onAsk?: (query: string) => void;
  onClose?: () => void;
  /** Per-part styles over the theme: `{ panel: {…}, field: {…}, option: {…}, hints: {…} }`. */
  styles?: PartStyles<"command-palette">;
  /** This palette's built-in text (the field's placeholder, the states, the hints) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["command-palette"]>;
  style?: CSSProperties;
}

const line = `${t.border.wHairline} solid ${t.border.subtle}`;

/** The layout no token decides; what the tokens decide is the recipe's. */
const optionLook: CSSProperties = { ...pressable, flexDirection: "row", alignItems: "center", gap: t.space.md, paddingBlock: t.space.smMd, textAlign: "left" };

const slotLook: CSSProperties = { ...box, flexShrink: 0, alignItems: "center", justifyContent: "center" };
const hintText: CSSProperties = { ...text, marginLeft: t.space["3xs"] };

function Option({ id, label, selected, styles, onPress, children }: { id: string; label: string; selected: boolean; styles?: PartStyles<"command-palette">; onPress: () => void; children: ReactNode }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["command-palette"], { state: { on: selected, hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="option"
      data-af-press
      id={id}
      role="option"
      aria-selected={selected}
      aria-label={label}
      // Focus stays in the field; the arrows move aria-activedescendant.
      tabIndex={-1}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(optionLook, r.option)}
    >
      {children}
    </button>
  );
}

function Pill({ label, on, styles, onPress }: { label: string; on: boolean; styles?: PartStyles<"command-palette">; onPress: () => void }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["command-palette"], { state: { on, hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="pill"
      data-af-press
      aria-pressed={on}
      aria-label={label}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, row, { paddingInline: t.space.md, border: `${t.border.wHairline} solid ${on ? t.fg.strong : t.border.subtle}`, transition: `background ${t.duration.fast}, border-color ${t.duration.fast}` }, r.pill)}
    >
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}

export function CommandPalette({
  query = "",
  placeholder,
  filters = [],
  filter = "",
  selected = "",
  groups = [],
  loading = false,
  offline = false,
  showHints = true,
  ask = false,
  agentName = "",
  onQueryChange,
  onFilterChange,
  onSelect,
  onAsk,
  onClose,
  styles,
  strings,
  style,
  ...rest
}: CommandPaletteProps) {
  const s = useStrings("command-palette", strings);
  const { platform } = usePlatform();
  const id = useId();
  // After useId: a hook before it would renumber the ids the palette writes (its listbox and options).
  const fieldUi = useInteraction();
  const r = useRecipe(recipes["command-palette"], { state: { focus: fieldUi.focused }, styles });
  const field = useRef<HTMLInputElement>(null);
  const [q, setQ] = useControllable(query, onQueryChange);
  const [kind, setKind] = useControllable(filter, onFilterChange);
  const [pick, setPick] = useControllable(selected);
  const all = groups.flatMap((g) => g.items);
  const isOn = (item: CommandPaletteItem) => (pick ? item.key === pick : !!item.selected);
  const current = all.find(isOn);
  const optionId = (item: CommandPaletteItem) => `${id}-${all.indexOf(item)}`;
  const choose = (item: CommandPaletteItem) => {
    setPick(pick === "" && item.selected ? "" : item.key);
    onSelect?.(item);
  };

  // The focus contract: focus moves to the field when the palette mounts, Tab stays inside, and focus returns to the opener when it
  // unmounts. Esc is the field's own (it clears the query first), and closes from anywhere else in the panel.
  const focus = useOverlayFocus<HTMLDivElement>({ trap: true, initial: () => field.current, onEscape: () => onClose?.() });
  const asking = !groups[0] && !loading && q !== "" && ask;

  // How many results there are, said once when typing pauses: never per keystroke, never as a region that arrives holding its text.
  const count = all.length;
  useEffect(() => {
    if (q === "" || loading || count === 0) return;
    const wait = setTimeout(() => announce(s("resultCount", { count })), 400);
    return () => clearTimeout(wait);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, count, loading]);

  const keyboard = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!all.length) return;
      const at = current ? all.indexOf(current) : -1;
      const next = all[(at + (e.key === "ArrowDown" ? 1 : -1) + all.length) % all.length]!;
      setPick(next.key);
      document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (current ?? all[0]) choose((current ?? all[0])!);
      else if (q && !loading && ask) onAsk?.(q);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      if (q) setQ("");
      else onClose?.();
    }
  };

  const empty = !groups[0] && !loading;
  // The query is its own text node in the ask row, as it always was: the sentence is cut where it goes.
  const [askBefore, askAfter] = s("askText", { name: agentName, query: "\u0000" }).split("\u0000");
  return (
    <div
      data-af-part="root"
      {...rootProps(rest)}
      style={css(
        box,
        {
          alignSelf: "flex-start",
          alignItems: "center",
          paddingInline: t.space["2xl"],
          paddingTop: t.space["5xl"],
          paddingBottom: t.space["4xl"],
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          ...enter("fade"),
        },
        r.root,
        style,
      )}
    >
      <div
        ref={focus.ref}
        role="dialog"
        aria-modal
        aria-label={s("label")}
        onKeyDown={focus.onKeyDown}
        data-af-part="panel"
        style={css(box, { maxWidth: "100%", overflow: "hidden", ...enter("pop") }, r.panel)}
      >
        <div data-af-part="field" style={css(row, { gap: t.space.md, paddingInline: t.space.lgXl }, r.field)}>
          <Icon part="searchIcon" name="search" style={r.searchIcon} />
          <input
            ref={field}
            data-af-input
            data-af-part="input"
            value={q}
            placeholder={placeholder ?? s("placeholder")}
            aria-label={s("search")}
            role="combobox"
            aria-expanded={all.length > 0 || asking}
            aria-controls={`${id}-results`}
            aria-activedescendant={current ? optionId(current) : asking ? `${id}-ask` : undefined}
            aria-autocomplete="list"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={keyboard}
            onFocus={fieldUi.handlers.onFocus}
            onBlur={fieldUi.handlers.onBlur}
            style={css(input, { flex: 1 }, r.input)}
          />
          {loading && <Spinner decorative part="fieldSpinner" label={s("searching")} style={r.fieldSpinner} />}
          <Kbd keys="Esc" aria-hidden />
        </div>
        {filters.length > 0 && (
          <div role="group" aria-label={s("filterLabel")} data-af-part="filters" style={css(row, { flexWrap: "wrap", gap: t.space.xs, paddingBlock: t.space.smMd, paddingInline: t.space.lgXl }, r.filters)}>
            {filters.map((f) => (
              <Pill key={f} label={f} on={f === kind} styles={styles} onPress={() => setKind(f)} />
            ))}
          </div>
        )}
        {offline && (
          <div role="status" data-af-part="offline" style={css(row, { gap: t.space.sm, paddingBlock: t.space.sm, paddingInline: t.space.lgXl }, r.offline)}>
            <Icon part="offlineIcon" name="wifi-off" style={r.offlineIcon} />
            <span data-af-part="offlineText" style={css(text, r.offlineText)}>{s("offline")}</span>
          </div>
        )}
        <div id={`${id}-results`} role="listbox" aria-label={s("results")} data-af-scroll data-af-part="results" style={css(box, { padding: t.space.sm, overflowY: "auto" }, r.results)}>
          {groups.map((g, gi) => (
            <div key={g.key ?? g.label} role="group" aria-label={g.label} style={css(box, gi > 0 && { marginTop: t.space.sm, borderTop: line })}>
              <span aria-hidden data-af-part="groupLabel" style={css(text, { paddingTop: t.space.sm, paddingInline: t.space.smMd, paddingBottom: t.space["2xs"] }, r.groupLabel)}>
                {g.label}
              </span>
              {g.items.map((item) => {
                const keys = platform === "web" && item.webShortcut ? item.webShortcut : item.shortcut;
                return (
                  <Option key={item.key} id={optionId(item)} label={item.hint ? s("option", { label: item.label, hint: item.hint }) : item.label} selected={isOn(item)} styles={styles} onPress={() => choose(item)}>
                    <span aria-hidden data-af-part="slot" style={css(slotLook, r.slot)}>
                      {item.avatar ? (
                        <Avatar name={item.label} identity={item.identity ?? "indigo"} presence={item.presence ?? "none"} agent={item.agent ?? false} style={{ width: t.palette.slot, height: t.palette.slot, fontSize: t.text.micro }} />
                      ) : item.icon ? (
                        <Icon part="slotIcon" name={item.icon} style={r.slotIcon} />
                      ) : null}
                    </span>
                    <span style={css(row, { flex: 1, gap: t.space.sm })}>
                      <span data-af-part="label" style={css(text, truncate(1), { flexShrink: 0, maxWidth: "100%" }, r.label)}>{item.label}</span>
                      {item.status && <span data-af-part="status" style={css(text, truncate(1), { flex: 1 }, r.status)}>{item.status}</span>}
                    </span>
                    {keys && <Kbd keys={keys} tone="bare" />}
                    {item.hint && <span data-af-part="hint" style={css(text, { whiteSpace: "nowrap" }, r.hint)}>{item.hint}</span>}
                  </Option>
                );
              })}
            </div>
          ))}
          {loading && (
            <div role="status" aria-live="polite" data-af-part="loading" style={css(row, { gap: t.space.sm, paddingBlock: t.space.smMd }, r.loading)}>
              <Spinner decorative part="loadingSpinner" label={s("searching")} style={r.loadingSpinner} />
              <span data-af-part="loadingText" style={css(text, r.loadingText)}>{s("loadingText")}</span>
            </div>
          )}
          {empty && (
            <div style={css(box, { alignItems: "center", gap: t.space.md, padding: t.space.md })}>
              <span role="status" aria-live="polite" data-af-part="emptyText" style={css(text, { paddingTop: t.space.sm, textAlign: "center" }, r.emptyText)}>
                {q ? (ask ? s("emptyAsk", { name: agentName }) : s("empty")) : s("prompt")}
              </span>
              {q && ask && (
                <Option id={`${id}-ask`} label={s("askLabel", { name: agentName, query: q })} selected styles={styles} onPress={() => onAsk?.(q)}>
                  <span aria-hidden data-af-part="slot" style={css(slotLook, r.slot)}>
                    <Avatar name={agentName} identity="agent" agent style={{ width: t.palette.slot, height: t.palette.slot, fontSize: t.text.micro }} />
                  </span>
                  <span style={css(row, { flex: 1, gap: t.space.sm })}>
                    <span data-af-part="label" style={css(text, truncate(1), { flexShrink: 0, maxWidth: "100%" }, r.label)}>
                      {askBefore}
                      {q}
                      {askAfter}
                    </span>
                  </span>
                  <Kbd keys="Enter" tone="bare" />
                </Option>
              )}
            </div>
          )}
        </div>
        {showHints && (
          <div aria-hidden data-af-part="hints" style={css(row, { gap: t.space.lg, paddingBlock: t.space.sm, paddingInline: t.space.lgXl }, r.hints)}>
            <div style={css(row, { gap: t.space["2xs"] })}>
              <Kbd keys="↑" />
              <Kbd keys="↓" />
              <span data-af-part="hintText" style={css(hintText, r.hintText)}>{s("toMove")}</span>
            </div>
            <div style={css(row, { gap: t.space["2xs"] })}>
              <Kbd keys="Enter" />
              <span data-af-part="hintText" style={css(hintText, r.hintText)}>{s("toOpen")}</span>
            </div>
            <div style={css(row, { gap: t.space["2xs"] })}>
              <Kbd keys="Esc" />
              <span data-af-part="hintText" style={css(hintText, r.hintText)}>{s("toClose")}</span>
            </div>
            {ask && (
              <div data-af-part="aiHint" style={css(row, { gap: t.space["2xs"], marginLeft: "auto" }, r.aiHint)}>
                <Icon part="aiIcon" name="sparkles" style={r.aiIcon} />
                <span data-af-part="hintText" style={css(hintText, r.hintText)}>{s("askHint", { name: agentName })}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
