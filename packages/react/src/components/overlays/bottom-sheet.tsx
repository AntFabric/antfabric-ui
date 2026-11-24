import type { CSSProperties, ReactNode, Ref } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, row, text, truncate } from "../../lib/style";
import { useOverlayFocus } from "../../lib/focus";
import { useInteraction } from "../../lib/interaction";
import { setRef, splitRootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

/** `id`, `aria-*` and `ref` name the dialog (the panel); `className` and `data-*` go on the root, the scrim (`splitRootProps`). */
export interface BottomSheetProps extends RootProps<HTMLDivElement> {
  /** Empty draws no title row: the handle and the content only. */
  title?: string;
  /** The 28px title for a sheet that is a destination of its own (New message). */
  largeTitle?: boolean;
  /** Full height, so a list can grow and a footer action sits at the foot. */
  tall?: boolean;
  showClose?: boolean;
  /** What the sheet holds. Rows inside bleed to the gutter themselves. */
  children?: ReactNode;
  /** A full-width action pinned at the foot. Empty draws none. */
  primaryLabel?: string;
  /** The primary button was pressed. */
  onPrimary?: () => void;
  /** Draws the on-screen keyboard, to show the sheet sitting on it. */
  keyboard?: boolean;
  /** Mid-drag: the panel follows the finger and the scrim lightens with it. */
  dragging?: boolean;
  /** Dismissed: the panel slides back down and the scrim clears. The close button sets it. */
  closed?: boolean;
  /** The person asked to close: ×, the handle, a press on the scrim, Esc. */
  onClose?: () => void;
  /** ×, the handle, a press on the scrim and Esc close it. Off for a sheet that must be answered from inside: there is no ×, and none of them do anything. */
  dismissible?: boolean;
  /** The sheet has finished leaving. */
  onDismiss?: () => void;
  /** Per-part styles over the theme: `{ panel: {…}, handle: {…}, title: {…} }`. */
  styles?: PartStyles<"bottom-sheet">;
  /** This sheet's built-in text (the handle's and close button's names, the keyboard stand-in) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["bottom-sheet"]>;
  style?: CSSProperties;
}

/**
 * The phone's sheet, for a phone-sized browser (below 640px the web app draws its dialogs this
 * way). The desktop app has no sheets.
 */
export function BottomSheet({
  title = "",
  largeTitle = false,
  tall = false,
  showClose = true,
  children,
  primaryLabel = "",
  keyboard = false,
  dragging = false,
  closed = false,
  dismissible = true,
  onPrimary,
  onClose,
  onDismiss,
  styles,
  strings,
  style,
  ...rest
}: BottomSheetProps) {
  const s = useStrings("bottom-sheet", strings);
  const [gone, setGone] = useControllable(closed);
  const handleUi = useInteraction();
  const r = useRecipe(recipes["bottom-sheet"], { variants: { dragging, closed: gone, largeTitle }, state: { focus: handleUi.focused }, styles });
  const close = () => {
    if (!dismissible) return;
    setGone(true);
    onClose?.();
  };
  // Focus moves in when the sheet mounts (not when it is drawn already dismissed), Tab stays inside, Esc closes, and focus returns to the
  // opener when it is dismissed (while it slides away, before the app unmounts it).
  const focus = useOverlayFocus<HTMLDivElement>({ initial: gone ? false : "first", trap: true, onEscape: close, open: !gone });
  const pass = splitRootProps(rest);
  const { ref, ...named } = pass.control as { ref?: Ref<HTMLDivElement> } & Record<string, unknown>;
  // The handle is 5px tall, so a transparent box centred on it reaches the target size without drawing more: a click on it is a click on the handle.
  const height = r.handle.height;
  const handleH = typeof height === "number" ? `${height}px` : (height as string);
  return (
    <div
      data-af-part="root"
      {...pass.root}
      // A press on the scrim above the panel closes it; the keyboard has Esc and the handle.
      onClick={(e) => e.target === e.currentTarget && close()}
      // It fills what it is given (the viewport, the host's layer): the panel sits at the foot and the scrim above it is the backdrop.
      style={css(box, partStyle(r, "root", { flexGrow: 1, alignSelf: "stretch", justifyContent: "flex-end", overflow: "hidden" }), style)}
    >
      <div
        ref={(el) => {
          focus.ref.current = el;
          setRef(ref, el);
        }}
        role="dialog"
        aria-modal
        data-af-part="panel"
        aria-label={title || undefined}
        aria-hidden={gone || undefined}
        {...named}
        inert={gone || undefined}
        onKeyDown={focus.onKeyDown}
        onTransitionEnd={(e) => {
          if (gone && e.target === e.currentTarget && e.propertyName === "transform") onDismiss?.();
        }}
        style={css(
          box,
          {
            paddingTop: t.space.md,
            paddingBottom: t.space.xl,
            transition: `transform ${t.motion.duration.slow} ${t.motion.easing.out}`,
          },
          partStyle(
            r,
            "panel",
            tall && { flexGrow: 1, flexBasis: 0 },
            // The entrance only on arrival: a drag or a close then moves the panel by its transition.
            !dragging && !gone && enter("slide-up"),
            dragging && { transform: "translateY(72px)", transition: "none" },
            gone && { transform: "translateY(calc(100% + 16px))" },
          ),
        )}
      >
        <button
          type="button"
          data-af-part="handle"
          data-af-press
          aria-label={s("dismiss")}
          // Not dismissible, the handle is only a picture of one.
          disabled={!dismissible}
          aria-hidden={!dismissible || undefined}
          onClick={() => close()}
          onFocus={handleUi.handlers.onFocus}
          onBlur={handleUi.handlers.onBlur}
          style={css({ alignSelf: "center", flexShrink: 0, padding: 0, border: 0, cursor: "pointer", marginBottom: t.space.lg, position: "relative" }, r.handle)}
        >
          <span aria-hidden style={{ position: "absolute", insetInline: 0, height: t.size.target.min, top: `calc((${handleH} - ${t.size.target.min}) / 2)` }} />
        </button>
        {title && (
          <div style={css(row, { justifyContent: "space-between", gap: t.space.sm, marginBottom: t.space.lg })}>
            <h2 data-af-part="title" style={css(text, { flexShrink: 1 }, partStyle(r, "title", largeTitle && truncate(1)))}>
              {title}
            </h2>
            {showClose && dismissible && <IconButton icon="x" label={s("close")} onPress={() => close()} />}
          </div>
        )}
        <div data-af-scroll style={css(box, { flexShrink: 1, gap: t.space["2xs"], overflowY: "auto" }, tall && { flexGrow: 1, flexBasis: 0 })}>
          <div data-af-part="content" style={css(box, r.content)}>{children}</div>
        </div>
        {primaryLabel && (
          <div style={css(box, { paddingTop: t.space.md })}>
            <Button label={primaryLabel} size="lg" full onPress={() => onPrimary?.()} />
          </div>
        )}
        {!keyboard && <div data-af-part="home" style={css({ flexShrink: 0 }, r.home)} />}
      </div>
      {keyboard && (
        <div
          aria-hidden
          data-af-part="keyboard"
          style={css(
            box,
            {
              height: 291, /* structural: stage: the height of the iPhone keyboard the demo stands in for */
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
            },
            r.keyboard,
          )}
        >
          <span data-af-part="keyboardLabel" style={css(text, r.keyboardLabel)}>{s("keyboard")}</span>
        </div>
      )}
    </div>
  );
}
