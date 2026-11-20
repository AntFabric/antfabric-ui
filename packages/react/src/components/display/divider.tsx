import type { CSSProperties } from "react";
import { recipes } from "@antfabric-ui/core";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerInset = "none" | "sm" | "md";

export interface DividerProps extends RootProps<HTMLDivElement> {
  orientation?: DividerOrientation;
  label?: string;
  inset?: DividerInset;
  /** Per-part styles over the theme: `{ root: {…}, rule: {…}, label: {…} }`. */
  styles?: PartStyles<"divider">;
  style?: CSSProperties;
}

export function Divider({ orientation = "horizontal", label = "", inset = "none", styles, style, ...rest }: DividerProps) {
  const vertical = orientation === "vertical";
  const r = useRecipe(recipes.divider, { variants: { orientation, inset }, styles });
  const labelled = !vertical && label !== "";
  const rule = (key: string) => <div key={key} data-af-part="rule" style={css(box, partStyle(r, "rule", { flex: 1 }))} />;
  return (
    <div
      data-af-part="root"
      role="separator"
      aria-orientation={orientation}
      aria-label={labelled ? label : undefined}
      {...rootProps(rest)}
      style={css(box, { flexDirection: vertical ? "column" : "row", alignItems: "center", alignSelf: "stretch" }, r.root, style)}
    >
      {labelled ? rule("start") : null}
      {labelled ? (
        <span data-af-part="label" style={css(text, { textAlign: "center" }, r.label)}>
          {label}
        </span>
      ) : null}
      {labelled ? rule("end") : null}
      {!labelled ? rule("rule") : null}
    </div>
  );
}
