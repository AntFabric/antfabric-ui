import { Text, View, type ViewStyle } from "react-native";
import { recipes, useStrings, type KitStrings, type Person } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { Avatar } from "./avatar";

export type AvatarStackSize = "xs" | "sm" | "md";
export type AvatarStackGround = "default" | "sidebar" | "recessed" | "selected";

export interface AvatarStackProps extends RootProps {
  /** Resolved people, in order. The first is the lead (the thread's author, the meeting's host) and is drawn on top. */
  people: Person[];
  /** Faces drawn before the rest collapse into +N. The app's AvatarStack draws 4. */
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
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (the chip's colour, type, edge, and the face's size) is the recipe's. */
const useStyles = createStyles((t) => ({
  root: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start" },
  more: { flexDirection: "row", alignItems: "center", justifyContent: "center", zIndex: 1 },
  moreText: { lineHeight: t.font.size.caption, fontVariant: ["tabular-nums"] },
}));

/** +237 stays legible as the chip grows; past four digits it reads +10k. */
const short = (n: number) => (n > 9999 ? `${Math.floor(n / 1000)}k` : String(n));

export function AvatarStack({ people, max = 3, total = 0, size = "sm", ground = "default", styles, strings, style, testID, ...rest }: AvatarStackProps) {
  const s = useStyles();
  const str = useStrings("avatar-stack", strings);
  const r = useRecipe(recipes["avatar-stack"], { variants: { size, ground }, styles });
  // Nobody draws nothing: no ghost discs.
  if (people.length === 0) return null;
  const count = Math.max(total, people.length);
  // +N is everyone the faces do not show: a preview shorter than `max` draws fewer faces, and the rest are hidden.
  const hidden = count - Math.min(max, people.length);
  // A face is as tall as the chip. Each overlaps the one before by a third, and wears the chip's ring (the ground's colour).
  const side = r.more.view.height as number;
  const ring: ViewStyle = { borderWidth: size === "xs" ? 1.5 : (r.more.view.borderWidth as number), borderColor: r.more.view.borderColor, marginStart: -side / 3 };
  return (
    // Not one accessible node: each face is read by its own name, as on the web.
    <View testID={partId(testID, "avatar-stack", "root")} role="group" accessibilityLabel={str("people", { count })} {...rootProps(rest)} style={[s.root, partStyle(r, "root", { view: { paddingStart: side / 3 } }).view, style]}>
      {people.slice(0, max).map((p, i) => (
        // No presence and no agent sparkle at stack sizes: they would cover the next face.
        <Avatar key={i} name={p.name} identity={p.identity} src={p.src} size={size} style={{ ...ring, zIndex: 6 - i }} />
      ))}
      {hidden > 0 ? (
        <View testID={partId(testID, "avatar-stack", "more")} accessible accessibilityLabel={str("more", { hidden })} style={[s.more, partStyle(r, "more", { view: [ring, { minWidth: side }] }).view]}>
          <Text importantForAccessibility="no" style={[s.moreText, r.more.text]}>
            +{short(hidden)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
