import type { CSSProperties } from "react";
import { recipes, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { css, pressable, row, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export type MessageDividerKind = "date" | "new";

export interface MessageDividerProps extends RootProps<HTMLDivElement> {
  /** date marks a day boundary; new marks the first message you have not read. */
  kind?: MessageDividerKind;
  /** "Today", "Yesterday", "Monday", "Monday, 27 October" — in the reader's locale and time zone. Ignored for new. Empty reads strings `today`. */
  label?: string;
  /** The floating day pill pinned to the top of the scroller: a button that opens the jump-to-day menu. */
  sticky?: boolean;
  /** The jump-to-day menu the sticky pill opens is open: the pill reports it through `aria-expanded`. Without it, the pill says nothing about the menu's state. */
  expanded?: boolean;
  /** The heading level of a day divider (an `h3` by default), so a timeline fits the page's outline. */
  level?: number;
  /** The sticky pill was pressed: open the jump-to-day menu. */
  onJump?: () => void;
  /** This divider's built-in text ("Today", "New messages", the pill's name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["message-divider"]>;
  /** Per-part styles over the theme: `{ root: {…}, rule: {…}, pill: {…}, label: {…} }`. */
  styles?: PartStyles<"message-divider">;
  style?: CSSProperties;
}

/** Layout no token decides; the colours, sizes and type are the recipe's (`messageDivider`). */
const chipText: CSSProperties = { ...text, whiteSpace: "nowrap" };

function StickyPill({ label, expanded, onJump, strings, styles }: { label: string; expanded?: boolean; onJump?: () => void; strings?: MessageDividerProps["strings"]; styles?: MessageDividerProps["styles"] }) {
  const ui = useInteraction();
  const s = useStrings("message-divider", strings);
  const r = useRecipe(recipes["message-divider"], { state: { hover: ui.hovered, pressed: ui.pressed, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="stickyPill"
      data-af-press
      aria-label={s("jump", { label })}
      aria-haspopup="menu"
      aria-expanded={expanded}
      onClick={() => onJump?.()}
      {...ui.handlers}
      style={css(
        pressable,
        partStyle(r, "stickyPill", { flexDirection: "row", alignItems: "center", gap: 5, height: 26, pointerEvents: "auto", transition: `background ${t.duration.fast}` }),
      )}
    >
      <span data-af-part="label" style={css(chipText, r.label)}>
        {label}
      </span>
      <Icon part="icon" name="chevron-down" size={r.icon.width} style={r.icon} />
    </button>
  );
}

export function MessageDivider({ kind = "date", label = "", sticky = false, expanded, level = 3, onJump, strings, styles, style, ...rest }: MessageDividerProps) {
  const s = useStrings("message-divider", strings);
  const date = kind === "date";
  const isNew = kind === "new";
  const r = useRecipe(recipes["message-divider"], { variants: { kind, sticky }, styles });
  const shown = label || s("today");
  // The coral line runs at half strength on web and desktop, with its label at the inline end.
  const rule = <div data-af-part="rule" style={partStyle(r, "rule", { flex: 1, minWidth: 0, opacity: isNew ? 0.5 : 1 })} />;
  return (
    <div
      data-af-part="root"
      {...rootProps(rest)}
      role={sticky ? undefined : date ? "heading" : "separator"}
      aria-level={date && !sticky ? level : undefined}
      aria-label={sticky ? undefined : isNew ? s("newMessages") : shown}
      style={css(
        row,
        partStyle(
          r,
          "root",
          { width: "100%", paddingTop: t.space.smMd, paddingBottom: t.space.xs },
          isNew && { paddingBlock: t.space["3xs"] },
          // Only the pill takes pointer events: the messages scroll under the band.
          sticky && { justifyContent: "center", paddingBlock: t.space["2xs"], position: "sticky", top: 0, pointerEvents: "none" },
        ),
        style,
      )}
    >
      {!sticky && rule}
      {date && !sticky && (
        <div data-af-part="pill" style={partStyle(r, "pill", { paddingBlock: 3 })}>
          <span data-af-part="label" style={css(chipText, r.label)}>
            {shown}
          </span>
        </div>
      )}
      {date && sticky && <StickyPill label={shown} expanded={expanded} onJump={onJump} strings={strings} styles={styles} />}
      {isNew && (
        <span data-af-part="newLabel" style={css(text, partStyle(r, "newLabel", { whiteSpace: "nowrap", letterSpacing: "0.02em" }))}>
          {s("newMessages")}
        </span>
      )}
      {!sticky && date && rule}
    </div>
  );
}
