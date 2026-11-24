import { StyleSheet } from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { TEXTURE, texturePath, type MarkTexture } from "@antfabric/ui-core/chart";

export interface TextureProps {
  /** The pattern's id: its own per chart and series, so two charts never share one. */
  id: string;
  texture: MarkTexture;
  /** The colour the texture is inked in: the card's, so it is tone on tone over any fill. */
  ink: string;
}

/**
 * A series' texture (`seriesMark(i).texture`) laid over whatever it is drawn in, filling it: a bar (gifted-charts' `barInnerComponent`, a stack's
 * `innerBarComponent`) or the legend's swatch, so the key reads as the plot does. The fill under it is the bar's or the swatch's own colour.
 */
export function Texture({ id, texture, ink }: TextureProps) {
  const dots = texture === "dots";
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id={id} patternUnits="userSpaceOnUse" width={TEXTURE.tile} height={TEXTURE.tile}>
          <Path d={texturePath(texture)} fill={dots ? ink : "none"} stroke={dots ? "none" : ink} strokeWidth={TEXTURE.stroke} opacity={TEXTURE.opacity} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
