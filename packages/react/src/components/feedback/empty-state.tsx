import type { CSSProperties } from "react";
import { ART, ART_CANVAS, ART_PART, recipes, type ArtPart, type ArtShape } from "@antfabric-ui/core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, text } from "../../lib/style";
import { Button } from "../actions/button";

export type EmptyStateArt = "none" | "messages" | "tasks" | "notifications" | "mail" | "files" | "projects";

export interface EmptyStateProps extends RootProps<HTMLDivElement> {
  /** The drawing for a data surface: the shape you will see once there is something here. none for an error or a refusal. */
  art?: EmptyStateArt;
  /** A glyph in a disc, for a failure, a lock, sign-in or search. Ignored when art is set. */
  icon?: IconName;
  /** What is not here. A noun phrase, not a sentence. */
  title: string;
  /** What will be here and how it gets here. One sentence. */
  line?: string;
  /** The offered next step, only where the thing is made. Empty hides the button. */
  actionLabel?: string;
  /** Almost always empty: a labelled button carries no glyph. */
  actionIcon?: IconName;
  /** The ~248px rails: less padding and a narrower measure. Same drawing, same type ramp. */
  compact?: boolean;
  onAction?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, title: {…} }`. */
  styles?: PartStyles<"empty-state">;
  style?: CSSProperties;
}

/* ---------- the drawings: 160 × 116, near-white objects with a hairline edge and one faint accent ---------- */

/** What each part carries by itself, from `art.ts`: its corner radius, the dot's side, the clip of the fold. How it is painted is the recipe's. */
const GEOMETRY: Partial<Record<ArtPart, CSSProperties>> = {
  frame: { borderRadius: ART_PART.frame.radius, overflow: "hidden" },
  card: { borderRadius: ART_PART.card.radius },
  dot: { width: ART_PART.dot.size, height: ART_PART.dot.size },
  bubble: { borderRadius: ART_PART.bubble.radius },
  tick: { borderRadius: ART_PART.tick.radius },
  box: { borderRadius: ART_PART.box.radius },
  edge: { borderRadius: ART_PART.edge.radius },
  fold: { clipPath: "polygon(0 0, 100% 100%, 0 100%)" },
  tag: { borderRadius: ART_PART.tag.radius },
};

function Drawing({ shapes, paint }: { shapes: ArtShape[]; paint: Record<ArtPart, CSSProperties> }) {
  return (
    <>
      {shapes.map((s, i) => (
        <div
          key={i}
          data-af-part={s.p}
          style={css(
            { position: "absolute", boxSizing: "border-box", left: s.x, top: s.y, width: s.w, height: s.h, right: s.r },
            GEOMETRY[s.p],
            partStyle(
              paint,
              s.p,
              s.radius !== undefined && { borderRadius: s.radius },
              s.opacity !== undefined && { opacity: s.opacity },
              s.rotate !== undefined && { transform: `rotate(${s.rotate}deg) translate(${s.tx ?? 0}px, ${s.ty ?? 0}px)` },
            ),
          )}
        >
          {s.c && <Drawing shapes={s.c} paint={paint} />}
        </div>
      ))}
    </>
  );
}

/* ---------- the component ---------- */

export function EmptyState({ art = "none", icon = "", title, line = "", actionLabel = "", actionIcon = "", compact = false, onAction, styles, style, ...rest }: EmptyStateProps) {
  const r = useRecipe(recipes["empty-state"], { variants: { compact }, styles });
  return (
    <div
      data-af-part="root"
      {...rootProps(rest)}
      style={css(
        box,
        {
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "stretch",
          flex: 1,
          textAlign: "center",
        },
        // The compact inset is the kit's; the roomy one is the recipe's.
        partStyle(r, "root", { paddingBlock: compact ? 28 : 48, paddingInline: compact ? 18 : r.root.paddingInline }, enter("fade")),
        style,
      )}
    >
      {art !== "none" ? (
        <div aria-hidden style={{ position: "relative", width: ART_CANVAS.w, height: ART_CANVAS.h, flexShrink: 0 }}>
          <Drawing shapes={ART[art]} paint={r} />
        </div>
      ) : (
        icon && (
          <div aria-hidden data-af-part="disc" style={css(box, { width: 64, height: 64, flexShrink: 0, alignItems: "center", justifyContent: "center" }, r.disc)}>
            <Icon part="discIcon" name={icon} style={r.discIcon} />
          </div>
        )
      )}
      <h2 data-af-part="title" style={css(text, { marginTop: t.space.mdLg }, r.title)}>
        {title}
      </h2>
      {line && (
        <p data-af-part="line" style={css(text, { marginTop: 5, maxWidth: compact ? 214 : 320, lineHeight: 1.6, textWrap: "pretty" }, r.line)}>
          {line}
        </p>
      )}
      {actionLabel && <Button label={actionLabel} variant="secondary" size="lg" iconLeading={actionIcon} onPress={() => onAction?.()} style={{ marginTop: t.space.lg, alignSelf: "center" }} />}
    </div>
  );
}
