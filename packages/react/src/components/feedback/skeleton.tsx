import { useEffect, type CSSProperties } from "react";
import { recipes, useStrings, type KitStrings } from "@antfabric-ui/core";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, row } from "../../lib/style";

export type SkeletonShape = "line" | "block" | "circle" | "tag" | "panel" | "row";
export type SkeletonLead = "face" | "tile" | "none";

export interface SkeletonRow {
  /** Title bar width, px. */
  title: number;
  /** Subtitle bar width, px. */
  subtitle: number;
}

export interface SkeletonProps extends RootProps<HTMLDivElement> {
  /** A single shape, or `row`: the list-row preset (a lead, a title and a subtitle per row). */
  shape?: SkeletonShape;
  /** Shapes only: a length or a percentage, sized to what is coming. */
  width?: string;
  /** Shapes only. */
  height?: string;
  /** What a screen reader hears, once, when the placeholder appears: "Loading messages", not "Loading". It is also the placeholder's name. */
  label?: string;
  /** Pass useSlowFlag(loading): laid out but invisible for the first 300 ms, so nothing jumps when it fades in. */
  visible?: boolean;
  /** Row preset: a face, an icon tile, or text only. */
  lead?: SkeletonLead;
  /** Row preset: 1 a name-only row, 2 name and subtitle, 3 name and a two-line subtitle. */
  lines?: 1 | 2 | 3;
  /** Row preset: a short line at the trailing edge (a time, an age). */
  trailing?: boolean;
  /** Row preset: one entry per row, with its bar widths. Vary them so a column never reads as one stamp. */
  rows?: SkeletonRow[];
  /** Per-part styles over the theme: `{ shape: {…}, bar: {…} }`. */
  styles?: PartStyles<"skeleton">;
  /** This placeholder's built-in text (the default announcement) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["skeleton"]>;
  style?: CSSProperties;
}

/**
 * A part's fill with a 120px band of sheen crossing it every 1.4 s. Reduced motion parks the band off the shape.
 * The recipe's `bg` is the fill and its `fg` the band's colour: written here as the longhands the gradient needs, not as `background` and `color`.
 */
function sheen(part: CSSProperties): CSSProperties {
  const { background, color, ...rest } = part;
  return {
    ...rest,
    // A `styles` longhand (`backgroundColor`) replaces the recipe's fill, which the overlay then no longer writes as `background`.
    backgroundColor: rest.backgroundColor ?? (background as string | undefined),
    backgroundImage: `linear-gradient(90deg, transparent, ${color}, transparent)`,
    backgroundSize: "120px 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "48px 0",
    animation: "af-sheen 1.4s linear infinite",
  };
}

export function Skeleton({
  shape = "line",
  width = "160px",
  height = "12px",
  label,
  visible = true,
  lead = "face",
  lines = 2,
  trailing = false,
  rows = [
    { title: 148, subtitle: 196 },
    { title: 96, subtitle: 140 },
    { title: 132, subtitle: 180 },
  ],
  styles,
  strings,
  style,
  ...rest
}: SkeletonProps) {
  const s = useStrings("skeleton", strings);
  const r = useRecipe(recipes.skeleton, { variants: { shape, lead }, styles });
  const leadSize = lines === 1 ? 20 : 36;
  const bar = (width: number, height: number): CSSProperties => ({ ...box, ...sheen(partStyle(r, "bar", { width, height, maxWidth: "100%" })) });
  const subBox: CSSProperties = { ...box, justifyContent: "center", flexShrink: 0 };
  const name = label ?? s("loading");
  // Said once, through the page's announcer, when the placeholder appears: a live region that arrives with its text is not read, and
  // a page of placeholders should not be a page of live regions.
  useEffect(() => {
    if (visible) announce(name);
  }, [name, visible]);
  return (
    <div
      data-af-part="root"
      {...rootProps(rest)}
      role="group"
      aria-busy
      aria-label={name}
      style={css(
        box,
        { alignSelf: shape === "row" ? "stretch" : "flex-start", maxWidth: "100%", transition: "opacity 160ms ease-out" },
        partStyle(r, "root", enter("fade"), !visible && { opacity: 0, transition: "none" }),
        style,
      )}
    >
      {shape !== "row" ? (
        <div aria-hidden data-af-part="shape" style={css(box, sheen(partStyle(r, "shape", { width, height, maxWidth: "100%" })))} />
      ) : (
        rows.map((spec, i) => (
          <div key={i} aria-hidden data-af-part="row" style={css(row, { paddingInline: t.space.smMd, paddingBlock: t.space["2xs"] }, r.row)}>
            {lead !== "none" && <div data-af-part="lead" style={css(box, sheen(partStyle(r, "lead", { width: leadSize, height: leadSize, flexShrink: 0 }, lead === "tile" && { borderRadius: lines === 1 ? 6 : 10 })))} />}
            <div style={css(box, { flex: 1, gap: 1 })}>
              <div data-af-part="titleBox" style={css(box, { justifyContent: "center" }, r.titleBox)}>
                <div data-af-part="bar" style={bar(spec.title, 10)} />
              </div>
              {lines >= 2 && (
                <div data-af-part="subBox" style={css(subBox, r.subBox)}>
                  <div data-af-part="bar" style={bar(spec.subtitle, 8)} />
                </div>
              )}
              {lines === 3 && (
                <div data-af-part="subBox" style={css(subBox, r.subBox)}>
                  <div data-af-part="bar" style={bar(168, 8)} />
                </div>
              )}
            </div>
            {trailing && (
              <div data-af-part="subBox" style={css(subBox, r.subBox)}>
                <div data-af-part="bar" style={bar(32, 8)} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
