/**
 * Start here for a new React Native component (mobile). Copy to `src/components/<category>/<id>.tsx`, then:
 *   - rename `Example` / `ExampleProps` to PascalCase(id), and the file's `./src/` imports to `../../`;
 *   - move `recipe` to `packages/core/src/recipes/<category>/<id>.ts`, list it in that category's `index.ts`, and read
 *     `recipes.<id>` here (the recipe is beside the component only so this file stands alone). The React kit reads the same one;
 *   - export the component from the category's `index.ts`; the docs file is the one the React template shows.
 * The recipe file, `packages/core/src/recipes/<category>/<id>.ts`:
 *     import { defineRecipe } from "../../recipe";
 *     export const iconButton = defineRecipe({ parts: [...], styles: { ... } });   // camelCase of the id; a reserved word takes `Recipe` (`switchRecipe`)
 *   its line in `recipes/<category>/index.ts`:  import { iconButton } from "./icon-button";  ...  { button, "icon-button": iconButton } as const
 *   (the key is the docs id) and the kit reads it, never imports the file:
 *     import { recipes } from "@antfabric/ui-core";   useRecipe(recipes["icon-button"], ...)     // `recipes.button` for a one-word id
 * A STATIC component (a divider, a spacer, a heading) has no hover, press or focus: drop `usePress`, `{...press.handlers}` and the `Pressable`, every `state` in the
 * recipe and in `useRecipe` (pass only `variants`), `useControllable` and the `onX` props. It still marks every part, takes `style`, and has docs
 * and a recipe. `accessibilityRole` has no "separator" value: hide a decorative line from screen readers with `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"`.
 * After the files are in place: `pnpm tokens:build` (rewrites tokens.json, components.json and llms.txt), `pnpm check <id>`, then
 * `pnpm check --update-snapshot` for the new component's keys only, then the full `pnpm check`.
 * `pnpm check <id>` enforces: `ExampleProps` is exactly the documented props for the phone; every `useControllable(value, onX)` has
 * `onX.changes` in the docs; no handler is passed straight through; tokens are read through the recipe; every part has its `testID`.
 * `pnpm describe button` shows a finished component.
 */
import { Pressable, Text, View, type TextStyle, type ViewStyle } from "react-native";
import { defineRecipe, useControllable, type RecipePart } from "@antfabric/ui-core";
import { createStyles } from "./src/theme";
import { Icon, type IconName } from "./src/lib/icon";
import { Enter } from "./src/lib/motion";
import { usePress } from "./src/lib/press";
import { useRecipe } from "./src/lib/recipe";
import { IconButton } from "./src/components/actions/icon-button";

/** Styles are data: a `$group.leaf` token per part, per variant prop and value, per state, per platform. No literals. */
const recipe = defineRecipe({
  parts: ["root", "icon", "message", "toggle", "detail"],
  styles: {
    root: {
      base: { gap: "$space.md", radius: "$radius.card", borderWidth: "$border.wHairline", borderColor: "$border.subtle", paddingX: "$space.lg", paddingY: "$space.md" },
      variants: { tone: { info: { bg: "$surface.card" }, warning: { bg: "$warning.soft" } } },
      platforms: { mobile: { base: { radius: "none", borderWidth: "none" } } },
    },
    icon: { base: { square: "$icon.size" }, variants: { tone: { info: { fg: "$fg.faint" }, warning: { fg: "$warning.default" } } } },
    message: { base: { fg: "$fg.body", font: "$font.sans", size: "$text.bodySm", line: "$text.bodySmLine" } },
    toggle: {
      base: { fg: "$fg.muted", font: "$font.sans", size: "$text.caption", weight: "$font.weightMedium", radius: "$radius.row" },
      states: { focus: { shadow: "$shadow.focus" } },
    },
    detail: { base: { fg: "$fg.muted", font: "$font.sans", size: "$text.caption" } },
  },
});

export type ExampleTone = "info" | "warning";

/** Per-part styles over the theme. Once the recipe is in core this is `PartStyles<"example">` (`import type { PartStyles } from "./src/lib/recipe"`): copy that, not this line. */
type ExampleStyles = Partial<Record<RecipePart<typeof recipe>, ViewStyle & TextStyle>>;

export interface ExampleProps {
  message: string;
  /** What the tone says, in a sentence: the docs' description for an option shows in the playground. */
  tone?: ExampleTone;
  icon?: IconName;
  /** More to say; shown when expanded. */
  detail?: string;
  /** A prop a press changes goes through `useControllable`, and its event is declared with `changes: "expanded"`. */
  expanded?: boolean;
  dismissible?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onDismiss?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, icon: {…} }`. Every recipe-backed component takes it, typed `PartStyles<"<id>">`, and passes it to `useRecipe`. */
  styles?: ExampleStyles;
  style?: ViewStyle;
}

/** Layout no token decides. What the tokens decide is the recipe's; `t.space` lays parts out. */
const useStyles = createStyles((t) => ({
  root: { flexDirection: "row", alignItems: "flex-start", alignSelf: "stretch" },
  body: { flex: 1, minWidth: 0, gap: t.space.xs },
  toggle: { alignSelf: "flex-start" },
  dismiss: { flexShrink: 0 },
}));

export function Example({ message, tone = "info", icon = "info", detail = "", expanded = false, dismissible = false, onExpandedChange, onDismiss, styles, style }: ExampleProps) {
  const s = useStyles();
  const [open, setOpen] = useControllable(expanded, onExpandedChange);
  // A phone has no hover: there is none here.
  const press = usePress();
  const r = useRecipe(recipe, { variants: { tone }, state: { focus: press.focused }, styles });
  return (
    <Enter motion="fade" style={{ alignSelf: "stretch" }}>
      <View testID="example.root" accessibilityRole="alert" style={[s.root, r.root.view, style]}>
        <Icon testID="example.icon" name={icon} size={r.icon.view.width as number} color={r.icon.text.color} />
        <View style={s.body}>
          {/* Every Text sets its own type: it inherits nothing. */}
          <Text testID="example.message" style={r.message.text}>
            {message}
          </Text>
          {/* A string is never `{detail && <X />}`: an empty one is a text node inside a View. */}
          {detail ? (
            <Pressable testID="example.toggle" accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} {...press.handlers} style={[s.toggle, r.toggle.view]}>
              <Text style={r.toggle.text}>{open ? "Hide details" : "Show details"}</Text>
            </Pressable>
          ) : null}
          {detail && open ? (
            <Text testID="example.detail" style={r.detail.text}>
              {detail}
            </Text>
          ) : null}
        </View>
        {dismissible ? <IconButton icon="x" label="Dismiss" size="sm" onPress={() => onDismiss?.()} style={s.dismiss} /> : null}
      </View>
    </Enter>
  );
}
