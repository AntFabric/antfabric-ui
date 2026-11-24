import type { CSSProperties, MutableRefObject } from "react";
import { recipes, useControllable, useStrings, type IconActionItem, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, enter, pressable, row, text } from "../../lib/style";
import { useRovingKeys } from "../../lib/roving";
import { rootProps, type RootProps } from "../../lib/root-props";
import { IconButton } from "../actions/icon-button";


export interface MessageActionsProps extends RootProps<HTMLDivElement> {
  /** One-press reactions, as emoji, drawn before the rule. Empty draws none (and no rule). */
  quickReactions?: string[];
  /** The smile-plus that opens the emoji picker. Off in an archived channel. */
  addReaction?: boolean;
  /** Off on a reply, and on the thread root inside its own thread panel. Absent, not disabled. */
  replyInThread?: boolean;
  forward?: boolean;
  /** The product's own actions, drawn as square icon buttons after Forward and before ⋯. */
  actions?: IconActionItem[];
  /** Whether the ⋯ menu has anything in it. A menu with no rows is never drawn. */
  more?: boolean;
  /** The ⋯ menu is open: its button stays pressed, and the row keeps the bar while it is. */
  menuOpen?: boolean;
  onReact?: (emoji: string) => void;
  onAddReaction?: () => void;
  onReplyInThread?: () => void;
  onForward?: () => void;
  /** A product action was pressed. */
  onAction?: (action: IconActionItem) => void;
  /** Called with `menuOpen` as the press on ⋯ leaves it. */
  onMenuOpenChange?: (menuOpen: boolean) => void;
  /** This bar's built-in text (its name and every button's) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["message-actions"]>;
  /** Per-part styles over the theme: `{ root: {…}, quick: {…}, emoji: {…}, rule: {…} }`. */
  styles?: PartStyles<"message-actions">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; the colours and sizes are the recipe's (`messageActions`). */
const root: CSSProperties = { ...row, alignSelf: "flex-start", gap: t.space["3xs"], padding: t.space["3xs"], borderRadius: 10, zIndex: 2, ...enter("fade") };

const quick: CSSProperties = {
  ...pressable,
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: `background ${t.motion.duration.fast}, transform ${t.motion.duration.fast}`,
};

function QuickReaction({ emoji, onPress, strings, styles }: Pick<MessageActionsProps, "strings" | "styles"> & { emoji: string; onPress: () => void }) {
  const s = useStrings("message-actions", strings);
  const ui = useInteraction();
  const r = useRecipe(recipes["message-actions"], { state: { hover: ui.hovered, pressed: ui.pressed, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part="quick"
      data-af-press
      aria-label={s("react", { emoji })}
      title={s("react", { emoji })}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(quick, partStyle(r, "quick", ui.hovered && { transform: "scale(1.12)" }, ui.pressed && { transform: "scale(.96)" }))}
    >
      <span aria-hidden data-af-part="emoji" style={css(text, partStyle(r, "emoji", { lineHeight: 1 }))}>
        {emoji}
      </span>
    </button>
  );
}

export function MessageActions({
  quickReactions = [],
  addReaction = false,
  replyInThread = false,
  forward = false,
  actions = [],
  more = false,
  menuOpen,
  onReact,
  onAddReaction,
  onReplyInThread,
  onForward,
  onAction,
  onMenuOpenChange,
  strings,
  styles,
  style,
  ref: rootRef,
  ...rest
}: MessageActionsProps) {
  const s = useStrings("message-actions", strings);
  const [open = false, setOpen] = useControllable(menuOpen, onMenuOpenChange);
  const r = useRecipe(recipes["message-actions"], { styles });
  // Arrows (and Home, End) move between the buttons; left and right follow the tree's direction.
  const keys = useRovingKeys<HTMLDivElement>({ items: "button:not(:disabled)", orientation: "horizontal", roving: true });
  const setRef = (el: HTMLDivElement | null) => {
    keys.ref.current = el;
    if (typeof rootRef === "function") rootRef(el);
    else if (rootRef) (rootRef as MutableRefObject<HTMLDivElement | null>).current = el;
  };
  return (
    <div ref={setRef} role="toolbar" aria-label={s("label")} data-af-part="root" {...rootProps(rest)} onKeyDown={keys.onKeyDown} style={css(root, r.root, style)}>
      {quickReactions.map((emoji) => (
        <QuickReaction key={emoji} emoji={emoji} onPress={() => onReact?.(emoji)} strings={strings} styles={styles} />
      ))}
      {quickReactions.length > 0 && <span data-af-part="rule" style={partStyle(r, "rule", { height: 18, flexShrink: 0, marginInline: t.space["3xs"] })} />}
      {addReaction && <IconButton icon="smile-plus" label={s("addReaction")} shape="square" onPress={() => onAddReaction?.()} />}
      {replyInThread && <IconButton icon="message-square-reply" label={s("replyInThread")} shape="square" onPress={() => onReplyInThread?.()} />}
      {forward && <IconButton icon="forward" label={s("forward")} shape="square" onPress={() => onForward?.()} />}
      {actions.map((a) => (
        <IconButton key={a.key} icon={a.icon} label={a.label} badge={a.badge} disabled={a.disabled} shape="square" onPress={() => onAction?.(a)} />
      ))}
      {more && (
        // A menu button, not a toggle: it says it opens a menu and whether the menu is open (a null `aria-pressed` drops the toggle's
        // attribute); it still draws pressed while the menu is open.
        <IconButton
          icon="ellipsis"
          label={s("more")}
          shape="square"
          active={open}
          onPress={() => setOpen(!open)}
          aria-haspopup="menu"
          aria-expanded={open}
          {...({ "aria-pressed": null } as object)}
        />
      )}
    </div>
  );
}
