import { Platform, type TextStyle } from "react-native";
import { tokens, type NativeTokens } from "@antfabric/ui-core";

/**
 * What a component asks `font()` for. `regular` is 400 and `book` is 450; the token behind `regular` is
 * `font.weightNormal` because the product's `font.weightRegular` is the 450.
 */
export type Weight = "regular" | "book" | "medium" | "semibold" | "bold" | "black";
const weights = (f: NativeTokens["font"]): Record<Weight, number> => ({
  regular: f.weightNormal,
  book: f.weightRegular,
  medium: f.weightMedium,
  semibold: f.weightSemibold,
  bold: f.weightBold,
  black: f.weightBlack,
});
export type Face = "sans" | "display" | "mono";

/**
 * React Native picks a weight by font FILE, not by `fontWeight`: the app loads one family per weight
 * (`Figtree-SemiBold`) with expo-font, and Android would fake a bold from the regular file. So a
 * component asks for `font("semibold")` instead of setting `fontWeight`.
 *
 * Body text is Figtree, headlines Satoshi. Satoshi ships no SemiBold, so semibold maps to Medium. The file names are tokens of the
 * mobile profile (`font.fileSansSemibold`), described and mapped to the phone's own `bodyFamily` / `displayFamily` like any other.
 * `book` (450) and `regular` (400) share the Regular file, and `black` is the heaviest file the app ships (ExtraBold for Figtree).
 *
 * Pass the theme's `t` and a theme's or brand's `fonts` take over from Figtree and Satoshi; without it the kit's own are used.
 * A file name of `""` is the system font: no `fontFamily`, and `fontWeight` is the number the weight's name stands for.
 */
const KIT_FONTS: NativeTokens["font"] = { ...tokens.shared.font, ...tokens.profiles.mobile.font };

const files = (f: NativeTokens["font"], face: "sans" | "display"): Record<Weight, string> => {
  const file = face === "sans" ? { regular: f.fileSansRegular, medium: f.fileSansMedium, semibold: f.fileSansSemibold, bold: f.fileSansBold, black: f.fileSansExtrabold } : { regular: f.fileDisplayRegular, medium: f.fileDisplayMedium, semibold: f.fileDisplaySemibold, bold: f.fileDisplayBold, black: f.fileDisplayExtrabold };
  return { ...file, book: file.regular };
};

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: tokens.shared.font.mono });

export function font(weight: Weight = "regular", face: Face = "sans", t?: Pick<NativeTokens, "font">): TextStyle {
  const f = t?.font ?? KIT_FONTS;
  // In a browser (the catalogue, through React Native Web) the CSS font stack and weight are exact.
  if (Platform.OS === "web") return { fontFamily: f[face], fontWeight: String(weights(f)[weight]) as TextStyle["fontWeight"] };
  if (face === "mono") return { fontFamily: MONO };
  const file = files(f, face)[weight];
  // A theme that keeps the system font names no file: the platform picks the face, so the weight is asked for by number.
  if (file === "") return { fontWeight: weights(f)[weight] as TextStyle["fontWeight"] };
  return { fontFamily: file };
}

/**
 * How far each kind of text grows with Dynamic Type and Android's font scale (`maxFontSizeMultiplier` on the `Text`). Reading text grows
 * as far as the person asked, up to 2×; a label inside a control grows less, and the control takes `minHeight` instead of `height` so the
 * grown label fits; chrome that must stay one line (a tab bar label, a badge count, an axis tick) grows least, and iOS's large content
 * viewer is the way to read it bigger.
 *
 *   <Text maxFontSizeMultiplier={fontScale.control} style={…}>
 */
export const fontScale = {
  /** Message text, list rows, descriptions, sheet bodies. */
  content: 2,
  /** A button's, chip's, field's or segment's label. */
  control: 1.5,
  /** Tab bar labels, badge and count pills, chart ticks and centre values, a header's title. */
  chrome: 1.3,
} as const;
