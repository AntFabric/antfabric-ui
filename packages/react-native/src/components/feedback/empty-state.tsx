import { Text, View, type ViewStyle } from "react-native";
import { ART, ART_CANVAS, ART_PART, recipes, type ArtPart, type ArtShape } from "@antfabric-ui/core";
import { createStyles, useTheme } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyle, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Button } from "../actions/button";

export type EmptyStateArt = "none" | "messages" | "tasks" | "notifications" | "mail" | "files" | "projects";

export interface EmptyStateProps extends RootProps {
  /** The drawing for a data surface: the shape you will see once there is something here. none for an error or a refusal. */
  art?: EmptyStateArt;
  /** A glyph in a 64pt disc, for a failure, a lock, sign-in or search. Ignored when art is set. */
  icon?: IconName;
  /** What is not here. A noun phrase, not a sentence. */
  title: string;
  /** What will be here and how it gets here. One sentence. */
  line?: string;
  /** The offered next step, only where the thing is made. Empty hides the button. */
  actionLabel?: string;
  /** Almost always empty: a labelled button carries no glyph. */
  actionIcon?: IconName;
  onAction?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, title: {…} }`. */
  styles?: PartStyles<"empty-state">;
  style?: ViewStyle;
}

/* ---------- the drawings: 160 × 116, near-white objects with a hairline edge and one faint accent ---------- */

/** Layout no token decides; what the tokens decide (the drawing's paint, the disc, the type, the inset) is the recipe's. */
const useStyles = createStyles(() => ({
  root: { alignItems: "center", justifyContent: "center", alignSelf: "stretch", flex: 1 },
  art: { width: ART_CANVAS.w, height: ART_CANVAS.h, flexShrink: 0 },
  disc: { width: 64, height: 64, alignItems: "center", justifyContent: "center" },
  title: { textAlign: "center" },
  line: { textAlign: "center", maxWidth: "100%" },
}));

/** What each part carries by itself, from `art.ts`: its corner radius, the dot's side, the fold's legs. How it is painted is the recipe's. */
const GEOMETRY: Partial<Record<ArtPart, ViewStyle>> = {
  frame: { borderRadius: ART_PART.frame.radius, overflow: "hidden" },
  card: { borderRadius: ART_PART.card.radius },
  dot: { width: ART_PART.dot.size, height: ART_PART.dot.size },
  bubble: { borderRadius: ART_PART.bubble.radius },
  tick: { borderRadius: ART_PART.tick.radius },
  box: { borderRadius: ART_PART.box.radius },
  edge: { borderRadius: ART_PART.edge.radius },
  tag: { borderRadius: ART_PART.tag.radius },
};

/** The fold's triangle from its part's style: the fill becomes the colour of the border that draws it. */
function fold({ backgroundColor, ...rest }: ViewStyle): ViewStyle {
  return { width: 0, height: 0, borderLeftWidth: ART_PART.fold.leg, borderTopWidth: ART_PART.fold.leg, borderLeftColor: backgroundColor, borderTopColor: "transparent", ...rest };
}

function Drawing({ shapes, paint, testID }: { shapes: ArtShape[]; paint: Record<ArtPart, PartStyle>; testID?: string }) {
  return (
    <>
      {shapes.map((d, i) => {
        const { view } = partStyle(paint, d.p, {
          view: [
            GEOMETRY[d.p],
            d.radius !== undefined && { borderRadius: d.radius },
            d.opacity !== undefined && { opacity: d.opacity },
            d.rotate !== undefined && { transform: [{ rotate: `${d.rotate}deg` }, { translateX: d.tx ?? 0 }, { translateY: d.ty ?? 0 }] },
          ],
        });
        return (
          <View
            key={i}
            testID={partId(testID, "empty-state", d.p)}
            style={[
              { position: "absolute", left: d.x, top: d.y, width: d.w, height: d.h, right: d.r },
              // The page-corner fold, a lower-left triangle drawn with borders: React Native has no clip-path. Its colour is the part's fill, and
              // what else `styles.fold` sets (an opacity, say) goes on the triangle as it does on every other part.
              d.p === "fold" ? fold(view) : view,
            ]}
          >
            {d.c ? <Drawing shapes={d.c} paint={paint} testID={testID} /> : null}
          </View>
        );
      })}
    </>
  );
}

/* ---------- the component ---------- */

export function EmptyState({ art = "none", icon = "", title, line = "", actionLabel = "", actionIcon = "", onAction, styles, style, testID, ...rest }: EmptyStateProps) {
  const { t } = useTheme();
  const s = useStyles();
  const r = useRecipe(recipes["empty-state"], { styles });
  // The disc's glyph is sized by its width and height (`size`); what else `styles.discIcon` sets goes on the glyph.
  const { width: glyph, height: _h, ...discIconRest } = r.discIcon.view;
  const discIconStyle = Object.keys(discIconRest).length ? discIconRest : undefined;
  return (
    <Enter {...rootProps(rest)} testID={partId(testID, "empty-state", "root")} motion="fade" style={[s.root, r.root.view, style]}>
      {art !== "none" ? (
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={s.art}>
          <Drawing shapes={ART[art]} paint={r} testID={testID} />
        </View>
      ) : icon ? (
        <View testID={partId(testID, "empty-state", "disc")} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[s.disc, r.disc.view]}>
          <Icon testID={partId(testID, "empty-state", "discIcon")} name={icon} size={glyph as number} color={r.discIcon.text.color ?? r.disc.text.color} style={discIconStyle} />
        </View>
      ) : null}
      <Text testID={partId(testID, "empty-state", "title")} accessibilityRole="header" maxFontSizeMultiplier={fontScale.content} style={[s.title, r.title.view, r.title.text]}>
        {title}
      </Text>
      {line ? (
        <Text testID={partId(testID, "empty-state", "line")} maxFontSizeMultiplier={fontScale.content} style={[s.line, r.line.view, r.line.text]}>
          {line}
        </Text>
      ) : null}
      {actionLabel ? <Button label={actionLabel} variant="secondary" size="md" iconLeading={actionIcon} onPress={() => onAction?.()} style={{ marginTop: t.space["2xs"], alignSelf: "center" }} /> : null}
    </Enter>
  );
}
