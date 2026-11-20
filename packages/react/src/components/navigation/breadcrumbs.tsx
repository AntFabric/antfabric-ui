import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { recipes, useControllable, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, neg, pressable, row, rtl, text, truncate } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

/** What the status pill says is happening: `live` (red), `paused` (amber), `busy` (grey dot, red fill). `""` draws no pill. */
export type BreadcrumbsStatus = "" | "live" | "paused" | "busy";

export interface BreadcrumbsItem {
  /** What names the crumb; the list is keyed by it. */
  key: string;
  label: string;
  /** Where the crumb goes. Leave it out for a step that is not a page of its own; the last crumb is the current page. */
  to?: string;
  icon?: IconName;
}

export interface BreadcrumbsProps extends RootProps<HTMLElement> {
  /** The trail, root first; the last is where you are. */
  items: BreadcrumbsItem[];
  /** Every crumb is shown. Left (false) is only the first and the current crumb, with a … between that shows the rest. */
  expanded?: boolean;
  /** Desktop, macOS: room for the traffic lights, drawn, when the bar is the window's top edge. */
  lights?: boolean;
  /** Desktop: the status pill at the end of the bar (a recording, a sync). Empty draws none. */
  status?: BreadcrumbsStatus;
  /** The pill's word: "Recording". */
  statusLabel?: string;
  /** The pill's second figure, set in tabular figures: a clock, a count. */
  statusDetail?: string;
  /** What pressing the pill does, as its title ("Open Recordings"); read with its first letter lowered after the label and detail. */
  statusAction?: string;
  /** The navigation landmark's name. Default: the `label` string. */
  label?: string;
  onNavigate?: (to: string) => void;
  /** The … was pressed and the folded crumbs came back (true), or the trail folded again (false). */
  onExpandedChange?: (expanded: boolean) => void;
  /** Desktop: the status pill was pressed. */
  onStatus?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, crumb: {…}, pill: {…} }`. */
  styles?: PartStyles<"breadcrumbs">;
  /** This bar's built-in text (the landmark's name, the pill's spoken form, the fold's label) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["breadcrumbs"]>;
  style?: CSSProperties;
}

/** Layout and motion no token decides; what the tokens decide (colour, type, radius, size) is the recipe's. */
const linkLook: CSSProperties = {
  ...pressable,
  flexDirection: "row",
  alignItems: "center",
  paddingBlock: 3, /* structural: 3px optical padding of a crumb */
  marginInline: neg(t.space.xs),
  transition: `background ${t.duration.fast}, color ${t.duration.fast}`,
};

const sep: CSSProperties = { ...text, flexShrink: 0, lineHeight: 1 };

// Vocabulary gap: chosen by position in the group, which no prop names.
const LIGHTS = [t.os.macClose, t.os.macMin, t.os.macMax];

/** A link or a button drawn like one: hover and keyboard focus from useInteraction. */
function Crumb({ href, label, title, folded, styles, onPress, style, children }: { href?: string; label?: string; title?: string; folded?: boolean; styles?: PartStyles<"breadcrumbs">; onPress: (e: MouseEvent) => void; style?: CSSProperties; children: ReactNode }) {
  const ui = useInteraction();
  const r = useRecipe(recipes.breadcrumbs, { state: { hover: ui.hovered, focus: ui.focused }, styles });
  const look = css(linkLook, partStyle(r, "crumb", style));
  if (href)
    return (
      <a href={href} data-af-part="crumb" data-af-press title={title} onClick={(e) => onPress(e)} {...ui.handlers} style={look}>
        {children}
      </a>
    );
  return (
    <button type="button" data-af-part="crumb" data-af-press aria-label={label} title={title} aria-expanded={folded ? false : undefined} onClick={(e) => onPress(e)} {...ui.handlers} style={look}>
      {children}
    </button>
  );
}

function StatusPill({ status, word, detail, action, spoken, styles, onPress }: { status: Exclude<BreadcrumbsStatus, "">; word: string; detail: string; action: string; spoken: string; styles?: PartStyles<"breadcrumbs">; onPress: () => void }) {
  const ui = useInteraction();
  const r = useRecipe(recipes.breadcrumbs, { variants: { status }, state: { focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="pill"
      data-af-press
      // A button, never a live region: a clock announced every 250 ms is worse than silence.
      aria-label={spoken}
      title={action || undefined}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, row, { marginLeft: "auto", flexShrink: 0 }, r.pill)}
    >
      <span aria-hidden data-af-part="pillDot" style={css({ flexShrink: 0 }, r.pillDot)} />
      <span data-af-part="pillWord" style={partStyle(r, "pillWord", { whiteSpace: "nowrap" })}>
        {word}
      </span>
      <span data-af-part="pillTime" style={partStyle(r, "pillTime", { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" })}>
        {detail}
      </span>
    </button>
  );
}

export function Breadcrumbs({ items, expanded = true, lights = false, status = "", statusLabel = "", statusDetail = "", statusAction = "", label, onNavigate, onExpandedChange, onStatus, styles, strings, style, ref, ...rest }: BreadcrumbsProps) {
  const s = useStrings("breadcrumbs", strings);
  const { platform, os } = usePlatform();
  const desktop = platform === "desktop";
  const [unfolded, setExpanded] = useControllable(expanded, onExpandedChange);
  const folded = !unfolded;
  const last = items.length - 1;
  const r = useRecipe(recipes.breadcrumbs, { styles });
  const dir = useDirection();
  const nav = useRef<HTMLElement>(null);
  const revealed = useRef(false);
  // Pressing … removes the focused button: focus goes to the first crumb it revealed, so it is not dropped to the page.
  useEffect(() => {
    if (!unfolded || !revealed.current) return;
    revealed.current = false;
    const at = document.activeElement;
    if (at && at !== document.body && nav.current?.contains(at)) return;
    const items = Array.from(nav.current?.querySelectorAll<HTMLElement>("ol > li") ?? []);
    for (const li of items.slice(1, -1)) {
      const target = li.querySelector<HTMLElement>("a, button");
      if (target) return target.focus();
    }
    (nav.current?.querySelector<HTMLElement>("a, button") ?? null)?.focus();
  }, [unfolded]);
  // A plain click goes through the app's router; ⌘-click and middle-click stay the browser's, for a new tab.
  const follow = (e: MouseEvent, to: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate?.(to);
  };
  const face = (item: BreadcrumbsItem) => (
    <>
      {item.icon && <Icon part="icon" name={item.icon} style={partStyle(r, "icon", rtl({ marginRight: t.space.xs }, dir), { opacity: 0.55 })} />}
      <span data-af-part="label" style={css(text, truncate(1), r.label)}>
        {item.label}
      </span>
    </>
  );
  return (
    <nav
      ref={(el) => {
        nav.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      aria-label={label ?? s("label")}
      {...rootProps(rest)}
      data-tauri-drag-region
      data-af-part="root"
      style={css(row, { width: "100%", flexShrink: 0, userSelect: "none" }, r.root, style)}
    >
      {desktop && lights && os === "mac" && (
        <div aria-hidden data-af-part="lights" style={css(row, partStyle(r, "lights", { flexShrink: 0 }))}>
          {LIGHTS.map((bg) => (
            <span key={bg} data-af-part="light" style={partStyle(r, "light", { boxSizing: "border-box", borderStyle: "solid", borderWidth: 0.5 /* structural: macOS draws its traffic lights with a half-pixel edge */, background: bg })} />
          ))}
        </div>
      )}
      <ol data-tauri-drag-region style={css(row, { gap: t.space["2xs"], flexShrink: 1, listStyle: "none", margin: 0, padding: 0 })}>
        {items.map((item, i) => {
          if (folded && i !== 0 && i !== last) return null;
          const isLast = i === last;
          return (
            <li key={item.key} style={css(row, { gap: t.space["2xs"], flexShrink: isLast ? 1 : 0 })}>
              {i > 0 && (
                <span aria-hidden data-af-part="separator" style={css(sep, r.separator)}>
                  \
                </span>
              )}
              {folded && isLast && i > 1 && (
                <>
                  <Crumb
                    label={s("showRest")}
                    title={s("showRest")}
                    folded
                    styles={styles}
                    onPress={() => {
                      revealed.current = true;
                      setExpanded(true);
                    }} style={{ flexShrink: 0, justifyContent: "center" }}>
                    <span style={{ lineHeight: t.text.bodySmLine, letterSpacing: "0.05em" }}>…</span>
                  </Crumb>
                  <span aria-hidden data-af-part="separator" style={css(sep, r.separator)}>
                    \
                  </span>
                </>
              )}
              {isLast ? (
                <span aria-current="page" title={item.label} data-af-part="current" style={css(row, r.current)}>
                  {item.icon && <Icon part="icon" name={item.icon} style={partStyle(r, "icon", rtl({ marginRight: t.space.xs }, dir), { opacity: 0.55 })} />}
                  <span style={css(text, truncate(1))}>{item.label}</span>
                </span>
              ) : item.to ? (
                <Crumb href={desktop ? undefined : item.to} title={item.label} styles={styles} onPress={(e) => (desktop ? onNavigate?.(item.to!) : follow(e, item.to!))}>
                  {face(item)}
                </Crumb>
              ) : (
                <span data-af-part="step" style={css(row, r.step)}>
                  {face(item)}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {desktop && status !== "" && (
        <StatusPill
          status={status}
          word={statusLabel}
          detail={statusDetail}
          action={statusAction}
          spoken={s("status", { label: statusLabel, detail: statusDetail, action: statusAction.charAt(0).toLowerCase() + statusAction.slice(1) })}
          styles={styles}
          onPress={() => onStatus?.()}
        />
      )}
    </nav>
  );
}
