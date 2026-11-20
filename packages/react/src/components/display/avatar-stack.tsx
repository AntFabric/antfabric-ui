import type { CSSProperties } from "react";
import { recipes, useStrings, type KitStrings, type Person } from "@antfabric/ui-core";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Avatar } from "./avatar";

export type AvatarStackSize = "xs" | "sm" | "md";
export type AvatarStackGround = "default" | "sidebar" | "recessed" | "selected";

export interface AvatarStackProps extends RootProps<HTMLDivElement> {
  /** Resolved people, in order. The first is the lead (the thread's author, the meeting's host) and is drawn on top. */
  people: Person[];
  /** Faces drawn before the rest collapse into +N. */
  max?: 2 | 3 | 4 | 5;
  /** Everyone in the group when `people` is only a preview. 0 means `people` is everyone. */
  total?: number;
  size?: AvatarStackSize;
  /** The surface the stack sits on: each face's ring is cut in that colour. */
  ground?: AvatarStackGround;
  /** Per-part styles over the theme: `{ root: {…}, more: {…} }`. */
  styles?: PartStyles<"avatar-stack">;
  /** Built-in text (the stack's accessible names) for this instance. */
  strings?: Partial<KitStrings["avatar-stack"]>;
  style?: CSSProperties;
}

/** The layout no token decides; what the tokens decide (the chip's colour, type, edge, and the face's size) is the recipe's. */
const more: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxSizing: "border-box",
  position: "relative",
  zIndex: 1,
};

/** 9 and 10 point type for the two smallest: no token is that small. */
const SMALL: Partial<Record<AvatarStackSize, CSSProperties>> = { xs: { fontSize: 9 }, sm: { fontSize: 10 } };

/** +237 stays legible as the chip grows; past four digits it reads +10k. */
const short = (n: number) => (n > 9999 ? `${Math.floor(n / 1000)}k` : String(n));

export function AvatarStack({ people, max = 3, total = 0, size = "sm", ground = "default", styles, strings, style, ...rest }: AvatarStackProps) {
  const s = useStrings("avatar-stack", strings);
  const r = useRecipe(recipes["avatar-stack"], { variants: { size, ground }, styles });
  // Nobody draws nothing: no ghost discs.
  if (people.length === 0) return null;
  const count = Math.max(total, people.length);
  const hidden = count - max;
  // A face is as tall as the chip. A third of it overlaps the face before, and each face wears the chip's ring.
  const height = r.more.height;
  const face = typeof height === "number" ? `${height}px` : (height as string);
  const ring: CSSProperties = {
    borderStyle: "solid",
    borderWidth: size === "xs" ? 1.5 : r.more.borderWidth,
    borderColor: r.more.borderColor,
    marginInlineStart: `calc(${face} / -3)`,
  };
  return (
    <div
      data-af-part="root"
      role="group"
      aria-label={s("people", { count })}
      {...rootProps(rest)}
      style={css({ display: "flex", flexDirection: "row", alignItems: "center", alignSelf: "flex-start", boxSizing: "border-box" }, partStyle(r, "root", { paddingInlineStart: `calc(${face} / 3)` }), style)}
    >
      {people.slice(0, max).map((p, i) => (
        // No presence and no agent sparkle at stack sizes: they would cover the next face.
        <Avatar key={i} name={p.name} identity={p.identity} src={p.src} size={size} style={css(ring, { zIndex: 6 - i })} />
      ))}
      {hidden > 0 && (
        <span data-af-part="more" role="img" aria-label={s("more", { hidden })} style={css(more, partStyle(r, "more", SMALL[size], { minWidth: face }, ring))}>
          <span aria-hidden style={css(text, { lineHeight: 1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" })}>
            +{short(hidden)}
          </span>
        </span>
      )}
    </div>
  );
}
