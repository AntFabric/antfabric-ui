import { useId, useRef, type CSSProperties, type ReactNode } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { useOverlayFocus } from "../../lib/focus";
import { OverlayLayer, useLayerHost, useLayerStack } from "../../lib/layer";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, row, text, truncate } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";
import { IconButton } from "../actions/icon-button";

export type SheetSide = "start" | "end";

export interface SheetProps extends RootProps<HTMLDivElement> {
  /** The sheet is showing. ✕, Esc and a press on the scrim close it (unless `dismissible` is off). */
  open?: boolean;
  /** The sheet opened or closed: from ✕, Esc, a press on the scrim, or the caller. */
  onOpenChange?: (open: boolean) => void;
  /** Which edge of the window it slides in from: end (the right in a left-to-right page) for details, start for a navigation drawer. */
  side?: SheetSide;
  /** The panel's width in pixels; 0 is the `sheet.w` token. A window narrower than that draws it full width. */
  width?: number;
  /** The header's title. Empty draws no title (a drawer names itself with `label`). */
  title?: string;
  /** A line under the title. */
  subtitle?: string;
  /** The body, which scrolls when it is taller than the window. */
  children?: ReactNode;
  /** The actions under the body (Buttons), parted from it by a hairline. Empty draws no footer. */
  footer?: ReactNode;
  /** Draws the ✕ in the header. */
  showClose?: boolean;
  /** The sheet's accessible name when it has no title. */
  label?: string;
  /** ✕, Esc and a press on the scrim close it. Off while something must be finished first. */
  dismissible?: boolean;
  /** Per-part styles over the theme: `{ panel: {…}, header: {…}, footer: {…} }`. */
  styles?: PartStyles<"sheet">;
  /** This sheet's built-in text (its fallback name, the ✕'s name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["sheet"]>;
  style?: CSSProperties;
}

/**
 * A panel that slides in from the side of the window over a scrim: a record's details, a short form, a navigation drawer. It is always
 * modal: it is drawn in the overlay layer of its AntFabricRoot, the page behind does not scroll and is out of reach, Tab stays inside,
 * and ✕, Esc and a press on the scrim close it, giving focus back. On the server, and in the catalogue's pictures, it is drawn in place
 * in a stage the size of a small window.
 */
export function Sheet({
  open,
  onOpenChange,
  side = "end",
  width = 0,
  title = "",
  subtitle = "",
  children,
  footer,
  showClose = true,
  label = "",
  dismissible = true,
  styles,
  strings,
  style,
  ...rest
}: SheetProps) {
  const s = useStrings("sheet", strings);
  const r = useRecipe(recipes.sheet, { styles });
  const [shown = false, setShown] = useControllable(open, onOpenChange);
  const marker = useRef<HTMLSpanElement | null>(null);
  const layer = useLayerHost(marker, shown);
  const floating = shown && !layer.inPlace && !!layer.host;
  if (!shown) return null;

  const drawn = (
    <SheetPanel
      side={side}
      width={width}
      title={title}
      subtitle={subtitle}
      footer={footer}
      showClose={showClose}
      label={label || s("label")}
      closeLabel={s("close")}
      dismissible={dismissible}
      floating={floating}
      r={r}
      rootRest={rest}
      style={style}
      onClose={() => setShown(false)}
    >
      {children}
    </SheetPanel>
  );
  return (
    <>
      <span ref={marker} hidden />
      {floating && layer.host ? (
        <OverlayLayer host={layer.host} zIndex={t.z.modal} modal near={marker}>
          {drawn}
        </OverlayLayer>
      ) : (
        drawn
      )}
    </>
  );
}

interface PanelProps {
  side: SheetSide;
  width: number;
  title: string;
  subtitle: string;
  footer: ReactNode;
  showClose: boolean;
  label: string;
  closeLabel: string;
  dismissible: boolean;
  floating: boolean;
  r: ReturnType<typeof useRecipe<"root" | "panel" | "header" | "title" | "subtitle" | "close" | "body" | "footer">>;
  rootRest: RootProps<HTMLDivElement>;
  style?: CSSProperties;
  onClose: () => void;
  children: ReactNode;
}

/** The scrim and the panel, mounted while open: focus moves in when it opens and back when it closes. */
function SheetPanel({ side, width, title, subtitle, footer, showClose, label, closeLabel, dismissible, floating, r, rootRest, style, onClose, children }: PanelProps) {
  const id = useId();
  const close = () => dismissible && onClose();
  // In the layer, Esc is the stack's (after the controls inside, to the top overlay only); drawn in place, the panel's own.
  const focus = useOverlayFocus<HTMLDivElement>({ trap: true, onEscape: dismissible && !floating ? onClose : undefined, initial: "first" });
  useLayerStack(floating, () => [focus.ref.current], { onEscape: close, onOutside: close });
  const end = side === "end";
  return (
    <div
      data-af-part="root"
      {...rootProps(rootRest)}
      style={css(
        row,
        { alignItems: "stretch", justifyContent: end ? "flex-end" : "flex-start", ...enter("fade") },
        floating
          ? { alignSelf: "stretch", flex: 1, pointerEvents: "auto" }
          : { alignSelf: "flex-start", width: 640, height: 420, overflow: "hidden" } /* structural: stage: a small window the sheet slides into */,
        r.root,
        style,
      )}
    >
      <div
        ref={focus.ref}
        role="dialog"
        aria-modal
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-label={title ? undefined : label}
        tabIndex={-1}
        onKeyDown={focus.onKeyDown}
        data-af-part="panel"
        style={css(box, { height: "100%", maxWidth: "100%", outline: "none", ...enter(end ? "slide-left" : "slide-right") }, partStyle(r, "panel", width ? { width } : undefined))}
      >
        {(title || showClose) && (
          <div data-af-part="header" style={css(row, { gap: t.space.md, flexShrink: 0 }, r.header)}>
            <div style={css(box, { flex: 1 })}>
              {title && (
                <h2 id={`${id}-title`} data-af-part="title" style={css(text, { margin: 0 }, partStyle(r, "title", truncate(1)))}>
                  {title}
                </h2>
              )}
              {subtitle && <span data-af-part="subtitle" style={css(text, truncate(1), r.subtitle)}>{subtitle}</span>}
            </div>
            {showClose && <IconButton part="close" icon="x" label={closeLabel} disabled={!dismissible} onPress={() => close()} style={r.close} />}
          </div>
        )}
        <div data-af-scroll data-af-part="body" style={css(box, { flex: 1, minHeight: 0, overflowY: "auto", gap: t.space.md }, r.body)}>
          {children}
        </div>
        {footer ? (
          <div data-af-part="footer" style={css(row, { justifyContent: "flex-end", gap: t.space.sm, flexShrink: 0 }, r.footer)}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
