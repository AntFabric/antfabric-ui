import { TEXTURE, texturePath, type MarkTexture } from "@antfabric/ui-core/chart";

export interface TexturePatternProps {
  id: string;
  texture: MarkTexture;
  /** The colour the texture is inked in: the card's, so it is tone on tone over any fill. A plain colour, never a `var(--af-…)` (an SVG attribute does not read one). */
  ink: string;
  /** The colour under the texture: a bar's, so the pattern is the bar's whole fill. */
  fill: string;
}

/**
 * A series' texture (`seriesMark(i).texture`) as an SVG `<pattern>`, `TEXTURE.tile` square in user space: the fill, then the texture over it. Put it in
 * a `<defs>` and fill a shape with `url(#id)`. A bar and the legend's swatch draw the same one, so the key reads as the plot does.
 */
export function TexturePattern({ id, texture, ink, fill }: TexturePatternProps) {
  const dots = texture === "dots";
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={TEXTURE.tile} height={TEXTURE.tile}>
      <rect width={TEXTURE.tile} height={TEXTURE.tile} fill={fill} />
      <path d={texturePath(texture)} fill={dots ? ink : "none"} stroke={dots ? "none" : ink} strokeWidth={TEXTURE.stroke} opacity={TEXTURE.opacity} />
    </pattern>
  );
}
