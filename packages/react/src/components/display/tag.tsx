import type { CSSProperties } from "react";
import { recipes } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { css, text, truncate } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export type TagTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
export type TagSize = "sm" | "md";

export interface TagProps extends RootProps<HTMLSpanElement> {
  label: string;
  /** One colour family per tone in every theme. brand is blue, not coral: a status tag never says "needs you". */
  tone?: TagTone;
  /** Optional leading glyph, for when the word alone is ambiguous at a glance (lock for Private). */
  icon?: IconName;
  /** md is the platform's own tag; sm is the phone's dense one. Both are 2 × 8 on web and desktop. */
  size?: TagSize;
  /** Per-part styles over the theme: `{ root: {…}, icon: {…} }`. */
  styles?: PartStyles<"tag">;
  style?: CSSProperties;
}

/** The layout and the motion no token decides; what the tokens decide (fill, ink, type, radius, gap) is the recipe's. The padding is the kit's (see the recipe). */
const root: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
  boxSizing: "border-box",
  minWidth: 0,
  maxWidth: "100%",
  paddingBlock: t.space["3xs"],
  paddingInline: t.space.sm,
  whiteSpace: "nowrap",
  userSelect: "none",
  // Invisible until forced colours drop the fill; then it keeps the tag's shape without moving it. The width and colour are the recipe's.
  outlineOffset: -1,
  transition: `background ${t.duration.base}, color ${t.duration.base}`,
};

/** A fact about its row, never a control: no press, no hover, not focusable. `size` only differs on the phone. */
export function Tag({ label, tone = "neutral", icon = "", styles, style, ...rest }: TagProps) {
  const r = useRecipe(recipes.tag, { variants: { tone }, styles });
  return (
    <span data-af-part="root" title={label} {...rootProps(rest)} style={css(root, r.root, style)}>
      {icon && <Icon part="icon" name={icon} size={r.icon.width} style={r.icon} />}
      <span style={css(text, truncate(1))}>{label}</span>
    </span>
  );
}
