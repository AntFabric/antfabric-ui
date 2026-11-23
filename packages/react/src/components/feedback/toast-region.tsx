import { Children, isValidElement, useRef, type CSSProperties, type ReactNode } from "react";
import { recipes, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { OverlayLayer, useLayerHost } from "../../lib/layer";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export type ToastRegionSide = "top" | "bottom";
export type ToastRegionAlign = "start" | "center" | "end";

export interface ToastRegionProps extends RootProps<HTMLDivElement> {
  /** Which edge of the window the toasts stack on. */
  side?: ToastRegionSide;
  /** Where along that edge: start, the middle, or end. */
  align?: ToastRegionAlign;
  /** The most toasts shown at once; the newest are kept. */
  max?: number;
  /** The toasts, oldest first, each with its own React `key` (each a Toast, which keeps its own timer, pause and dismissal). */
  children?: ReactNode;
  /** Per-part styles over the theme: `{ root: {…} }`. */
  styles?: PartStyles<"toast-region">;
  /** This region's built-in text (its landmark name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["toast-region"]>;
  style?: CSSProperties;
}

const ALIGN: Record<ToastRegionAlign, CSSProperties["alignItems"]> = { start: "flex-start", center: "center", end: "flex-end" };

/**
 * Where the app's toasts appear: stacked at one edge of the window, the newest nearest it, above dialogs and sheets, and never in the
 * way: the space between and around the toasts lets presses through to the page. It is drawn in the overlay layer of its AntFabricRoot;
 * on the server and in the catalogue's pictures it is drawn in place, in a stage. A press on a toast is not a press outside an open
 * dialog or popover.
 */
export function ToastRegion({ side = "bottom", align = "center", max = 3, children, styles, strings, style, ...rest }: ToastRegionProps) {
  const s = useStrings("toast-region", strings);
  const r = useRecipe(recipes["toast-region"], { styles });
  const marker = useRef<HTMLSpanElement | null>(null);
  const layer = useLayerHost(marker, true);
  const floating = !layer.inPlace && !!layer.host;
  const shown = Children.toArray(children).slice(-Math.max(1, max));

  const drawn = (
    <section
      data-af-part="root"
      data-af-layer-passive=""
      aria-label={s("label")}
      {...rootProps(rest)}
      style={css(
        box,
        {
          gap: t.space.sm,
          flexDirection: side === "bottom" ? "column" : "column-reverse",
          alignItems: ALIGN[align],
          justifyContent: side === "bottom" ? "flex-end" : "flex-start",
          pointerEvents: "none",
        },
        floating ? { flex: 1, alignSelf: "stretch" } : { alignSelf: "flex-start", width: 560, height: 240 } /* structural: stage: a small window the toasts stack in */,
        r.root,
        style,
      )}
    >
      {shown.map((toast, i) => (
        // Keyed by the toast's own key (Children.toArray keeps it), so a toast leaving or arriving never remounts the ones after it: their
        // timers, announcements and focus stay. A toast with no key falls back to its place.
        <div key={isValidElement(toast) && toast.key !== null ? toast.key : i} style={{ pointerEvents: "auto", maxWidth: "100%" }}>
          {toast}
        </div>
      ))}
    </section>
  );
  return (
    <>
      <span ref={marker} hidden />
      {floating && layer.host ? (
        <OverlayLayer host={layer.host} zIndex={t.z.toast} modal={false} near={marker}>
          {drawn}
        </OverlayLayer>
      ) : (
        drawn
      )}
    </>
  );
}
