/**
 * Start here for a new React component (web and desktop). Copy to `src/components/<category>/<id>.tsx`, then:
 *   - rename `Example` / `ExampleProps` to PascalCase(id), and the file's `./src/` imports to `../../`;
 *   - move `recipe` to `packages/core/src/recipes/<category>/<id>.ts`, list it in that category's `index.ts`, and read
 *     `recipes.<id>` here (the recipe is beside the component only so this file stands alone);
 *   - export the component from the category's `index.ts`, and write `packages/docs/src/components/<category>/<id>.ts`
 *     (the shape is at the bottom).
 * The recipe file, `packages/core/src/recipes/<category>/<id>.ts`:
 *     import { defineRecipe } from "../../recipe";
 *     export const iconButton = defineRecipe({ parts: [...], styles: { ... } });   // camelCase of the id; a reserved word takes `Recipe` (`switchRecipe`)
 *   its line in `recipes/<category>/index.ts`:  import { iconButton } from "./icon-button";  ...  { button, "icon-button": iconButton } as const
 *   (the key is the docs id) and the kit reads it, never imports the file:
 *     import { recipes } from "@antfabric/ui-core";   useRecipe(recipes["icon-button"], ...)     // `recipes.button` for a one-word id
 * A STATIC component (a divider, a spacer, a heading) has no hover, press or focus: drop `useInteraction`, `{...ui.handlers}`, `data-af-press` and the `<button>`, every `state` in the
 * recipe and in `useRecipe` (pass only `variants`), `useControllable` and the `onX` props. It still marks every part, takes `style`, and has docs
 * and a recipe. A separator is `role="separator"` (plus `aria-orientation="vertical"` when vertical); a decorative element is `aria-hidden`.
 * After the files are in place: `pnpm tokens:build` (rewrites tokens.json, components.json and llms.txt), `pnpm check <id>`, then
 * `pnpm check --update-snapshot` for the new component's keys only, then the full `pnpm check`.
 * `pnpm check <id>` enforces: `ExampleProps` is exactly the documented props; every `useControllable(value, onX)` has
 * `onX.changes` in the docs; no handler is passed straight through; tokens are read through the recipe; every part is drawn.
 * `pnpm describe button` shows a finished component.
 */
import type { CSSProperties } from "react";
import { defineRecipe, useControllable, type RecipePart } from "@antfabric/ui-core";
import { t } from "./src/tokens";
import { Icon, type IconName } from "./src/lib/icon";
import { useInteraction } from "./src/lib/interaction";
import { useRecipe } from "./src/lib/recipe";
import { box, css, enter, pressable, row, text } from "./src/lib/style";
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
      states: { hover: { fg: "$fg.strong" }, focus: { shadow: "$shadow.focus" } },
    },
    detail: { base: { fg: "$fg.muted", font: "$font.sans", size: "$text.caption" } },
  },
});

export type ExampleTone = "info" | "warning";

/** Per-part styles over the theme. Once the recipe is in core this is `PartStyles<"example">` (`import type { PartStyles } from "./src/lib/recipe"`): copy that, not this line. */
type ExampleStyles = Partial<Record<RecipePart<typeof recipe>, CSSProperties>>;

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
  style?: CSSProperties;
}

/** Layout and motion no token decides. What the tokens decide is the recipe's. */
const root: CSSProperties = { ...row, alignItems: "flex-start", alignSelf: "stretch" };

export function Example({ message, tone = "info", icon = "info", detail = "", expanded = false, dismissible = false, onExpandedChange, onDismiss, styles, style }: ExampleProps) {
  const [open, setOpen] = useControllable(expanded, onExpandedChange);
  // States come from the hook, never from `:hover`; the catalogue forces them for its snapshots.
  const ui = useInteraction();
  const r = useRecipe(recipe, { variants: { tone }, state: { hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <div data-af-part="root" role="status" style={css(root, r.root, enter("fade"), style)}>
      <Icon part="icon" name={icon} size={r.icon.width} color={r.icon.color} />
      <div style={css(box, { flex: 1, gap: t.space.xs })}>
        <span data-af-part="message" style={css(text, r.message, { lineHeight: 1.5 })}>
          {message}
        </span>
        {detail && (
          <button type="button" data-af-part="toggle" data-af-press aria-expanded={open} onClick={() => setOpen(!open)} {...ui.handlers} style={css(pressable, r.toggle, { alignSelf: "flex-start" })}>
            {open ? "Hide details" : "Show details"}
          </button>
        )}
        {detail && open && (
          <span data-af-part="detail" style={css(text, r.detail)}>
            {detail}
          </span>
        )}
      </div>
      {dismissible && <IconButton icon="x" label="Dismiss" size="sm" onPress={() => onDismiss?.()} style={{ flexShrink: 0 }} />}
    </div>
  );
}

/*
The docs file, `packages/docs/src/components/<category>/<id>.ts` (list it in `packages/docs/src/components/index.ts`):

import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "example",
  name: "Example",
  category: "feedback",
  status: "draft",   // the component's: "stable" | "beta" | "draft" (new = draft). A platform's own `status` below is "ready" | "partial" | "planned" | "not-applicable".
  description: "One plain sentence: what it is for and what it is not.",
  props: {
    message: { type: "string", default: "Fabric summarised #platform-eng while you were out.", required: true },
    tone: { type: "enum", options: ["info", "warning"], default: "info", description: "info states a fact. warning: something will go wrong if left." },
    icon: { type: "icon", default: "info" },
    detail: { type: "string", default: "" },
    expanded: { type: "boolean", default: false },
    dismissible: { type: "boolean", default: false },
    onExpandedChange: { type: "event", args: "expanded: boolean", changes: "expanded" },
    onDismiss: { type: "event" },
  },
  platforms: {
    web: { status: "ready", base: "A <div role=status> drawn from its recipe; toggle hover and focus from useInteraction", import: 'import { Example } from "@antfabric/ui-react"' },
    desktop: { status: "ready", base: "The same <div> at desktop density", import: 'import { Example } from "@antfabric/ui-react"' },
    mobile: { status: "ready", base: "View and Text drawn from the same recipe", import: 'import { Example } from "@antfabric/ui-react-native"' },
  },
  a11y: { role: "status", notes: ["The toggle sets aria-expanded; Dismiss is a labelled IconButton."] },
  examples: [{ name: "Info", props: { message: "Fabric summarised #platform-eng while you were out." } }],
  related: ["inline-banner"],
};

export default docs;

Also: `source` (the file in today's desktop / mobile app, traced, never guessed), `edgeCases`, `states`, `matrix` and `flows` when they apply (AUTHORING.md, "The docs file" and "Flows").
*/
