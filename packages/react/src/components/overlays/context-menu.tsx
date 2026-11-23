import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, neg, pressable, row, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Avatar, type AvatarIdentity } from "../display/avatar";
import { Menu, type MenuRowItem } from "./menu";

/** A row of the menu under the reactions, in Menu's own shape. */
export type ContextMenuItem = MenuRowItem;

export interface ContextMenuProps extends RootProps<HTMLDivElement> {
  /** The quick set, as emoji, in order. Empty draws no reaction row at all (and no +). */
  quickReactions?: string[];
  /** Which of `quickReactions` are the person's own: pressing one takes its emoji out, pressing another puts it in. */
  picked?: string[];
  items?: ContextMenuItem[];
  /** The rows' accessible name. Default: the `actions` string. */
  label?: string;
  /** Draws the message that was right-clicked, highlighted, with the menu at the pointer. */
  showTarget?: boolean;
  author?: string;
  /** The author's fallback avatar colour. */
  identity?: AvatarIdentity;
  time?: string;
  /** The message text. */
  body?: string;
  onReact?: (emoji: string) => void;
  onSelect?: (item: ContextMenuItem) => void;
  onClose?: () => void;
  /** Per-part styles over the theme: `{ panel: {…}, reaction: {…}, emoji: {…}, divider: {…} }`. */
  styles?: PartStyles<"context-menu">;
  /** This menu's built-in text (the reaction row's and buttons' names, the rows' name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["context-menu"]>;
  style?: CSSProperties;
}

/** The layout and the motion no token decides; what the tokens decide is the recipe's. */
const panelLook: CSSProperties = { ...box, ...enter("pop") };

const reactionLook: CSSProperties = {
  ...pressable,
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: `background ${t.duration.fast}, transform ${t.duration.fast}`,
};

function Reaction({ label, mine, more, title, styles, onPress, children }: { label: string; mine?: boolean; more?: boolean; title?: string; styles?: PartStyles<"context-menu">; onPress?: () => void; children: ReactNode }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["context-menu"], { state: { hover: ui.hovered, pressed: ui.pressed, focus: ui.focused, on: mine }, styles });
  return (
    <button
      type="button"
      data-af-part={more ? "more" : "reaction"}
      data-af-press
      aria-label={label}
      aria-pressed={mine}
      title={title}
      onClick={() => onPress?.()}
      {...ui.handlers}
      style={css(reactionLook, partStyle(r, more ? "more" : "reaction", ui.hovered && { transform: "scale(1.12)" }))}
    >
      {children}
    </button>
  );
}

export function ContextMenu({
  quickReactions = [],
  picked = [],
  items = [],
  label,
  showTarget = false,
  author = "",
  identity = "indigo",
  time = "",
  body = "",
  onReact,
  onSelect,
  onClose,
  styles,
  strings,
  style,
  ...rest
}: ContextMenuProps) {
  const s = useStrings("context-menu", strings);
  // The person's own quick reactions (a new array of the same emoji is not a change).
  const [owned, setOwned] = useControllable(picked);
  const r = useRecipe(recipes["context-menu"], { variants: { showTarget }, styles });
  const mine = (emoji: string) => owned.includes(emoji);
  const keyboard = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    onClose?.();
  };
  return (
    <div data-af-part="root" {...rootProps(rest)} style={css(box, { alignSelf: "flex-start" }, r.root, style)}>
      {showTarget && (
        <div
          data-af-part="target"
          style={css(
            row,
            {
              alignItems: "flex-start",
              gap: t.space.sm,
              width: 460, /* structural: stage: the width of the message-under-menu demo scene */
              paddingInline: t.space.md,
              paddingBlock: t.space.sm,
            },
            r.target,
          )}
        >
          <Avatar name={author} identity={identity} size="md" />
          <div style={css(box, { flex: 1, gap: t.space["3xs"] })}>
            <span data-af-part="author" style={css(text, r.author)}>
              {author}
              <span data-af-part="time" style={css({ whiteSpace: "pre" }, r.time)}>{`  ${time}`}</span>
            </span>
            <span data-af-part="message" style={css(text, r.message)}>{body}</span>
          </div>
        </div>
      )}
      <div data-af-part="panel" onKeyDown={keyboard} style={css(panelLook, partStyle(r, "panel", showTarget && { marginTop: neg(t.space.xs) }))}>
        {quickReactions.length > 0 && (
          <div role="group" aria-label={s("quickReactions")} style={css(row, { justifyContent: "space-between", gap: t.space["3xs"], padding: t.space["2xs"] })}>
            {quickReactions.map((emoji) => (
              <Reaction
                key={emoji}
                label={s(mine(emoji) ? "unreact" : "react", { emoji })}
                mine={mine(emoji)}
                styles={styles}
                onPress={() => {
                  setOwned(mine(emoji) ? owned.filter((e) => e !== emoji) : [...owned, emoji]);
                  onReact?.(emoji);
                }}
              >
                <span aria-hidden data-af-part="emoji" style={css(text, { lineHeight: 1 }, r.emoji)}>
                  {emoji}
                </span>
              </Reaction>
            ))}
            <Reaction more label={s("more")} title={s("more")} styles={styles}>
              <Icon part="moreIcon" name="smile-plus" style={r.moreIcon} />
            </Reaction>
          </div>
        )}
        {quickReactions.length > 0 && <div data-af-part="divider" style={css({ flexShrink: 0, marginBlock: t.space["2xs"] }, r.divider)} />}
        <Menu items={items} label={label ?? s("actions")} bare onSelect={(item) => onSelect?.(item)} onClose={() => onClose?.()} />
      </div>
    </div>
  );
}
