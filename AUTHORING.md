# Writing a component

Every component exists twice, one file per kit, and one recipe that both kits read for its styles:

| Platform | Kit | File |
| --- | --- | --- |
| Web (TanStack Start) and desktop (Tauri) | `@antfabric/ui-react` | `packages/react/src/components/<category>/<id>.tsx` |
| Mobile (Expo) | `@antfabric/ui-react-native` | `packages/react-native/src/components/<category>/<id>.tsx` |
| Both (the styles) | `@antfabric/ui-core` | `packages/core/src/recipes/<category>/<id>.ts`, see Recipes |

What the catalogue says about it (props as documented, examples, edge cases, platform notes, flows)
is `packages/docs/src/components/<category>/<id>.ts`. Both kits share one props API: the docs'
`props`, minus the ones limited to the other kit's platforms.

Every docs file names the component's `level`, in atomic design's terms, and the catalogue lists
components by it, smallest first. An `atom` is one control or mark that does not break down further
(Button, Badge, Tooltip); a `molecule` is a few atoms doing one job together (Search field, List
item, Menu); an `organism` is a whole region of a screen (Dialog, Composer, Nav rail). A component
may import only components at its own level or below: `pnpm check` reads each kit file's imports
and fails when, say, an atom draws a molecule. The folder is still the category; the level is how
big it is.

`pnpm check <id>` must pass before a component is done. It type-checks both kits, checks the docs
and the recipe, checks that each kit's `XProps` matches the documented props, and renders every
example, variant, state, edge case and flow frame on every OS on the server, failing on any React or
React Native warning. `pnpm frames <id> [platform] [os]` shows where each flow frame's `press` lands.

## Start from the template

Copy `packages/react/TEMPLATE.tsx` and `packages/react-native/TEMPLATE.tsx`. Each is a small, complete
component (a `Notice`, named `Example`) that follows every rule below once: a recipe, a `tone` variant,
state from the interaction hook, a controllable prop with its event, a plain event, a composed sibling,
an entrance. Their comments say what to rename and what `pnpm check` enforces; the docs file's shape is at
the bottom of the React one. Both are type-checked with their kit, so they cannot drift, and neither is
exported or in the catalogue.

### Adding a component: the checklist

In this order (`<id>` is the docs id, `kebab-case`; `<Id>` its PascalCase):

1. Copy both `TEMPLATE.tsx` files to `packages/<kit>/src/components/<category>/<id>.tsx`; rename `Example` to `<Id>`; change the `./src/` imports to `../../`.
2. Recipe: move the inline recipe to `packages/core/src/recipes/<category>/<id>.ts` and add its line to that category's `index.ts` there (shape under Recipes, "The recipe file").
3. Docs: write `packages/docs/src/components/<category>/<id>.ts`, with its `level`, and add its line to `packages/docs/src/components/index.ts`.
4. Kit exports: export `<Id>` and `<Id>Props` (and any prop type) from each kit's category `index.ts`.
5. `pnpm tokens:build`: regenerates `packages/core/tokens.json`, `packages/docs/components.json` and `llms.txt` (all three are committed; `pnpm check agent` fails when one is stale).
6. `pnpm check <id>` until it passes.
7. `pnpm check --update-snapshot`: accepts the render-snapshot keys for the new component in `reports/renders.snapshot.json`. Read the diff: only new keys for `<id>` should appear. Never use it to hide a change to another component.
8. The full `pnpm check`: it must be green with the snapshot written.

### A static component

A divider, a spacer, a heading or a badge has no hover, press or focus. Start from the same template and drop what it does not use:

- No `useInteraction` (React) or `usePress` (React Native), no `{...ui.handlers}`, no `data-af-press`, no `Pressable` or `<button>`.
- No `states` in the recipe, and no `state:` in `useRecipe(...)`: pass only `{ variants }` (or nothing). No `useControllable` and no `onX` props, unless the docs declare them.
- It still marks every part (`data-af-part="<part>"` on the web, `testID="<id>.<part>"` on the phone), still takes `style` on the root, and still needs a docs file with examples, a recipe and the `pnpm check <id>` run. `states` in the docs is left out (a static component has none to force).
- Accessibility for something decorative or a separator:
  - **Web and desktop:** a separator between groups is `role="separator"` (add `aria-orientation="vertical"` when it is vertical; a horizontal one is the default); a purely decorative element is `aria-hidden`, or `role="presentation"` on a wrapper with no meaning. `<hr>` carries the separator role by itself.
  - **Phone:** `accessibilityRole` has no `"separator"` value (React Native's `accessibilityRole` type lists `none`, `image`, `header`, `text` and the like). A divider that only draws a line is hidden from screen readers: `accessibilityElementsHidden` (iOS) and `importantForAccessibility="no-hide-descendants"` (Android) on the `View`. Group meaning comes from the containers around it (`accessibilityRole="header"`, `"list"`), not from the line.
  - Say in the docs' `a11y` which of these the component does.

`pnpm describe button` is the canonical finished example: its props, parts, recipe table, a11y notes and
the four file paths in one screen. `pnpm describe <id>` does the same for any component, and
`pnpm describe tokens <group>` prints a token group with its variables, values per mode and descriptions.
Add `--json` to any of them for data.

## Recipes

Read this before you write any style. A component's styling decisions (colour, size, radius, type,
shadow, edge) are written once, as data, in `packages/core/src/recipes/<category>/<id>.ts`, and both
kits read them. Every component has one; `actions/button.ts` is the short one to read first. The kits
keep behaviour (hover, press, `Animated`, roles) and layout no token decides (flex direction,
alignment, `cursor`, a press scale).

```ts
export const switchRecipe = defineRecipe({
  parts: ["root", "track", "thumb"],                 // each is drawn with data-af-part / testID
  styles: {
    track: {
      base: { width: "$switch.trackW", radius: "$radius.pill", bg: "$switch.trackOff" },
      variants: { size: { sm: { height: "$control.hSm" } } },     // prop → value → style (the docs' options)
      states: { on: { bg: "$brand.default" }, "hover+on": { bg: "$brand.hover" } },
      platforms: { mobile: { base: { padding: "$space.sm" } } },  // where the phone differs
    },
  },
  reads: ["$switch.thumbTravel"],                    // tokens the kit reads for behaviour, not style
});
```

- **The recipe file** is `packages/core/src/recipes/<category>/<id>.ts`, and its shape never varies:

  ```ts
  // packages/core/src/recipes/actions/icon-button.ts
  import { defineRecipe } from "../../recipe";           // always this path, from two folders down

  export const iconButton = defineRecipe({ parts: ["root", "icon"], styles: { /* … */ } });
  ```

  The export is the **camelCase of the id** (`icon-button` → `iconButton`, `segmented-control` → `segmentedControl`, `button` →
  `button`); a name that is a reserved word takes a `Recipe` suffix (`switch` → `switchRecipe`). The category's `index.ts` imports it
  and lists it under the **docs id** as the key: `import { iconButton } from "./icon-button";` and
  `export const actions = { button, "icon-button": iconButton, … } as const;` (a one-word id is shorthand, `button`; a reserved
  word is `switch: switchRecipe`). A kit never imports the file: it reads
  `import { recipes } from "@antfabric/ui-core"` and then `useRecipe(recipes["icon-button"], …)` (`recipes.button` for a one-word id).
- **Compound variants are not expressible.** A part's `variants` are chosen one prop at a time and combine only by layering, so a
  style that depends on two props together (an inset that is `paddingX` for `orientation="horizontal"` and `paddingY` for
  `"vertical"`, only while `inset` is on) cannot be one entry. `states` take a compound key (`"invalid+focus"`), but that joins
  *states*, not variant values, and `pnpm check recipes` requires every variant prop and value to be one of the docs' options, so
  a made-up prop to carry the combination fails. Workaround, in order of preference: (a) split the part so each prop styles its own
  part and the two never meet (a `rule` part drawn by `orientation`, an `inset` wrapper part drawn by `inset`, one of them
  reading each axis); (b) keep the one combined value in the kit, using `t.space` (the kit may read `space.*`), with a comment. If none fits, open a GitHub issue naming the component. The type
  is not extended for this yet.
- **Values are `"$group.leaf"` token references**, `"transparent"` or `"none"`, typed against `TokenPath`, so a typo
  fails `pnpm typecheck`. No literal, no `calc`, no ratio (`lineHeight: 1.2` stays in the kit). The keys are a small
  vocabulary, documented with what each becomes in CSS and in React Native at the top of `packages/core/src/recipe.ts`.
  `"none"` removes a key an earlier layer set (for `weight`, it leaves the phone's font weight unset).

  | Group | Keys |
  | --- | --- |
  | Colour | `bg`, `fg`, `placeholder`, `opacity` |
  | Size | `width`, `height`, `square`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight` |
  | Space | `padding`, `paddingX`, `paddingY`, `paddingTop` / `Right` / `Bottom` / `Left`; `margin`, `marginX`, `marginY`, `marginTop` / `Right` / `Bottom` / `Left`; `gap` |
  | Position | `top`, `right`, `bottom`, `left`, `inset`, `zIndex` (the kit says `position`) |
  | Corners | `radius`; `radiusTop`, `radiusBottom`; `radiusTopLeft` / `TopRight` / `BottomRight` / `BottomLeft` |
  | Edges | `borderWidth`, `borderColor`; one edge: `borderTopWidth` / `Right` / `Bottom` / `Left`, and `…Color` |
  | Outline (web and desktop only; the phone drops it) | `outlineWidth`, `outlineColor`, `outlineOffset` |
  | Type | `font`, `weight`, `size`, `line`, `tracking` |
  | Shadows | `shadow`, `ring`, `halo` |

  Shadows stack by one rule, top first: `halo` (a second shadow token), then `ring` (an inset hairline in a colour), then
  `shadow`, joined into one `boxShadow`; `none` leaves one out. A single edge or corner is laid over `borderWidth` /
  `radius`, whichever layer wrote which (the web writes shorthands first). A reader that cannot say a thing (a `calc`, a
  `color-mix`, a ratio) is a gap: the kit keeps that value, and the recipe grants the token through `reads` with a comment.
- **Precedence, one rule:** base, then each variant prop in the order listed (its value's style, then that value's own
  `states`), then `states` in the order listed (`"invalid+focus"` applies when both are on), then the platform's entries
  (`web` / `desktop` / `mobile`, then the OS), each laid out the same way. Later wins. Hover is ignored on the phone;
  `ios` / `android` never apply on the web. Where the kits genuinely differ, keep both with `platforms.mobile` and say why
  in a comment; the difference goes to the owner (a GitHub issue), the recipe does not pick.
- **Per-part styles.** Every recipe-backed component takes `styles?: PartStyles<"<its id>">` (from `lib/recipe`, in both kits) and passes it
  to `useRecipe(recipe, { variants, state, styles })`. It is the per-instance escape hatch, one entry per recipe part:
  `<Button styles={{ root: { borderRadius: 2 }, icon: { opacity: 0.5 } }} />`. The web's values are `CSSProperties`; the phone's are
  `ViewStyle & TextStyle`, and the reader sends the text keys (`color`, `fontSize`, `lineHeight`…) to the part's `text` and the rest to its
  `view`.
  - **Precedence, decided.** For one part, last wins:
    1. the recipe;
    2. the theme's recipe override;
    3. the kit's own inline styles for the part (what a prop or a state makes it write: `full`'s width, a disabled cursor, a size that
       follows `size`, a bar's width that follows its value);
    4. `styles[part]`;
    5. `style`, on the root.

    `styles` is the escape hatch, so it beats anything the kit computes for the part, including its own inline styles; `style` is the
    root's and beats everything. The kit never keeps a key out of `styles`' reach.
  - **How to write it.** `r.<part>` is steps 1 and 2 and also `styles[part]`, so a part the kit styles no further is drawn from it as it is
    (`style={r.icon}`). A part the kit also styles inline is drawn with `partStyle(r, part, …inline)` (`lib/recipe`, both kits), which puts
    `styles[part]` after the inline: web `style={css(pressable, partStyle(r, "root", full && { width: "100%" }, disabled && { cursor: "not-allowed" }), style)}`;
    phone `const root = partStyle(r, "root", { view: full && { width: "100%" } })` then `style={[root.view, style]}` and `style={root.text}` on the
    `Text`. Never `css(r.root, inline)` or `[r.root.view, inline]` for a part that takes `styles`: the inline would win. Given no `styles`,
    `partStyle` draws what `css(r.part, …inline)` drew, so converting a part moves no pixel.
  - **Shorthands.** On the web a longhand in `styles` refines the recipe's shorthand (`overlayCss` writes the shorthand as its longhands
    first, so a state change never resets it) and a shorthand replaces the recipe's longhands (`padding` over `paddingTop`); the phone does
    the same. Every part a component draws applies its whole `r.<part>` (the web as `style={r.icon}`, the phone through its `view` and `text`:
    the size, the rest of the view style, the colour), so `styles` reaches it, not only the keys the component reads for a size. Never a
    `className`.
  - **A root, in every drawing.** A recipe with a `root` part draws it in every state: the outermost element of a drawing is the `root`, never
    only its other parts around a nested component's root (a collapsed bar that draws `bar` and an IconButton, a phone sheet that draws
    `sheet` and no `root`). The probe fails a drawing whose outermost part is not the root; today's are in `stylesProofTodo`.
  - **What `pnpm check` holds** (`pnpm check generic`; `styles` is universal, so the docs file does not list it): `pnpm check code` requires the exact type
    `PartStyles<"<id>">`, the pass-through to `useRecipe`, and the same prop in both kits; a component that does not declare it yet is in
    `stylesTodo` in `reports/generic.json`, and its id comes off the list in the commit that adds the prop. Then, for every component that
    does declare it, a probe draws each of its examples, edge cases and matrix values (web, desktop, the phone's two OSes) with `styles`
    giving every part a declaration no kit writes (`mix-blend-mode`; on the phone also `text-decoration-color` for a `Text`) and every
    declaration the part already had set to a different value (sizes, spacing, radii, colours, opacity other than 0 or 1, cursor). The part
    must carry them all. A part that does not is listed with its parts, `"<kit>:<part>"`, in `stylesProofTodo`; the check prints which
    declaration lost and in which example. Fix it by routing the part through `partStyle`, then take the entry off the list (the check fails
    until you do).
- **Add the recipe to its category's `index.ts`** (`recipes/<category>/index.ts`), not to a shared file. `recipes.<id>` is typed.
- **React:** `const r = useRecipe(recipes.button, { variants: { variant, size }, state: { hover: ui.hovered, pressed: ui.pressed, focus: ui.focused, disabled: ui.disabled } })`
  gives a `CSSProperties` per part: `style={css(pressable, r.root, style)}`. Draw every part with `data-af-part="<part>"`
  (an `Icon` or `Spinner` takes `part`). Put the kit's own layout before the recipe's style; what a prop or a state adds goes through
  `partStyle(r, "root", …inline)`, never after `r.root` in `css(…)`, so `styles` stays after it (see "Per-part styles").
- **React Native:** `useRecipe` from `lib/recipe` gives `{ view, text }` per part: `view` for the `View`, `text` for the `Text`
  (the typography keys, with the font file for the weight; a `Text` inherits nothing, so a part's type goes where the
  words are, and an icon's colour is `r.root.text.color`). Give every drawn part `testID="<id>.<part>"`.
- **State flags are the kit's call:** a hover that must not apply to an invalid field is `hover: ui.hovered && !invalid`.
- **`pnpm check recipes`** (also part of `pnpm check <id>` and the full run) enforces: every `$token` exists for the
  platforms that read it; only vocabulary keys; every variant prop and value is one of the documented prop's `options`;
  every part is drawn (a `data-af-part` on the web, the `testID` on the phone, in at least one render of each platform
  that draws it; `on: ["web", "desktop"]` on a part says it is not on the phone); and each kit file reads no token the
  recipe does not grant. Granted = the recipe's entries for that kit (`mobile`, `ios`, `android` entries are the phone's)
  plus its `reads`; the structural allowance is `space.*`, `duration.*` and `ease.*`, which lay parts out and move
  them. A style that creeps back into a component as `t.something` fails there.
- **The component's page** draws the recipe as "Anatomy and tokens": a table per part (when, property, token), each token
  linking to its row on Foundations.
- **The render snapshot** (`reports/renders.snapshot.json`) hashes each element's declarations, not how they were written
  (the order of a style, `border` longhands against a shorthand, a class against inline style). A value that moves between
  the recipe and the kit changes no hash unless the value does. `data-af-part` and the `<id>.<part>` `testID` are not hashed.
  Besides the keys the catalogue draws (`<id>/<platform>`, and `#neutral` for the second theme) there is `<id>/<platform>#bare`: the
  rest render with the kit's defaults only (a `required` prop takes its `sample`), the English strings and the `neutral` theme, which
  is what a product gets before it passes anything. A kit default that changes, or a built-in string that is reworded, moves it.

## Both kits

- **Styles** come from the recipe, never from the kit file: the recipe says which token each part reads.
  A size or colour with no token gets one before the component reads it, and `pnpm check literals` names any
  new literal. Unitless ratios (`lineHeight: 1.2`, `scale: 0.97`) stay in the kit.
- **One component per file**, named `PascalCase(id)` (`icon-button` → `IconButton`), with an
  exported `IconButtonProps` interface. Export any type a prop uses (`MenuItem`, `Person`;
  an array prop's item type is `<Component><Singular prop>`). Add the export to the category's
  `index.ts`.
- **Props:** exactly the documented ones for the kit's platforms, plus `style` on the root. Defaults
  in the destructuring match the docs' `default`, except demo text (a required `label`'s default is
  the catalogue's sample, not the component's). `pnpm check defaults` holds it: for each documented non-event prop with a `default` (and
  not `required`), in each kit that draws it, the component drawn with all its documented defaults and again with that one prop left out must
  draw the same markup. A difference means the docs say a default the component does not have; fix the docs (or move a demo value to the
  prop's `sample`) or the kit, then take `<id>.<prop>` off `defaultsTodo` in `reports/generic.json`.
- **Events** are props named `onX`, called with the documented `args` and nothing else: write
  `onClick={() => onPress?.()}`, never `onClick={onPress}`, which would hand the app a DOM event.
  A prop that a press changes (`checked`, `open`, `value`, `active`) goes through
  `useControllable(value, onEvent)`, and its event is declared in the docs with `changes: "<prop>"`.
  That makes it controlled when an app passes both and keeps its own state otherwise, so the
  catalogue's previews stay pressable. Never default that prop in the destructuring (the event alone would then hold it at
  the default); default the result: `const [on = false, setOn] = useControllable(checked, onCheckedChange)`
  (`pnpm check conventions`, rule `controllable-default`).
- **Built-in text:** a component has no fixed words of its own (aria labels, "Not now", "Required", a counter): it reads them from the
  dictionary in `packages/core/src/strings/<category>.ts`, keyed by its docs id, and a product overrides them per tree (`strings` on
  `AntFabricRoot` / `AntFabricProvider` / `ThemeProvider`, with `locale`) or per instance (the component's `strings` prop).
  - The English default equals the text the component always had, so no render changes. A key is named for what it says, not where it
    sits (`required`, `copied`, `characterCount`; not `tag2` or `footerRight`), and is one template: `"Reply to {name}"`, or
    `{ one: "{count} reply", other: "{count} replies" }`, where the variable `count` picks the form. Words several components share
    ("Close") go in `common.ts` and a component reads them with no key of its own by that name.
  - In the file: `strings?: Partial<KitStrings["<id>"]>` in `XProps`, then `const s = useStrings("<id>", strings)` (on the phone, where `s`
    is the stylesheet, `const str = …`), and `s("key", { name })` wherever the text is drawn, in `aria-label`s and announcements too.
    `pnpm check literals` counts the fixed text left in a file (`text` in `literals.allow.json`): run `pnpm literals:tighten` when it falls.
  - **What `pnpm check strings` holds**, read from each kit file's syntax tree, not its text:
    - Every `useStrings("<id>", strings)` binding (`s`, `str`, any name) and every call of it (`s(…)`, `s.parts(…)`). A key is a literal, a
      conditional of literals, a template (`` s(`tab${k}`) `` names every key that starts `tab`), or a `const` of literal keys; one it cannot
      follow, or a binding handed to a function (`useSaid(s)`), is an error: call it where the text is drawn.
    - **Every key is read by every kit that draws the component.** A key only one kit has a use for (the phone's long-press label, a desktop
      shortcut hint) is declared platform-only, next to the keys, in the category file:
      `export const displayOnly = { card: { select: ["mobile"] } } as const satisfies OnlyOn<typeof display>;`, `"web"` for the React kit (web
      and desktop) and `"mobile"` for the phone's. Only the named kit reads it, and the other must not (`strings/index.ts` collects every
      `<category>Only`). Never read a key and throw the result away (`void s("select")`) to satisfy the check: a call whose result is
      discarded is an error.
    - **The variables are the template's placeholders**, and `count` for a plural: `s("reply", { name })` for `"Reply to {name}"`, `{ count }` for
      `{ one: …, other: … }`; a placeholder left out, or a variable no placeholder uses, is an error. A key the dictionary and `common` do not
      have is an error.
    - A component that breaks one of these is listed in `stringsTodo` in `reports/generic.json`, with the reasons printed by the check; take it
      off in the commit that fixes it (the check fails until you do).
  - Markup does not change: where JSX wrote `{n} mentions` (two text nodes), the React kit draws `{s.parts("mentions", { n })}`, which
    cuts the text at its variables the same way; `s("mentions", { n })` is for an attribute, a string and the phone.
- **Pass-through:** every component's props extend the kit's `RootProps` (`lib/root-props.ts`): `id`, `className`, `data-*`, `aria-*` and
  `ref` on the web, `testID`, `nativeID`, the accessibility label and hint and `ref` on the phone. Destructure `...rest` and spread
  `{...rootProps(rest)}` on the root after the kit's own attributes and before `style`; on the phone the root's `testID` is
  `partId(testID, "<id>", "root")` and each part's `partId(testID, "<id>", "<part>")`. They are universal props: the docs do not list them.
- **Locale and direction:** numbers, dates, currency and sorting use `useLocale()` (never a hard-coded `"en-US"`); a style that names a
  side (`paddingLeft`, `left`, a corner) goes through `rtl(style, useDirection())` on the web (recipes are mirrored for you) and a
  transform or swipe direction reads `I18nManager.isRTL` on the phone. Keep physical properties: a left-to-right render must not move.
- **Keyboard and focus** (WAI-ARIA APG), held by the rerender pass for every control on the web and the desktop:
  - Every control a keyboard reaches draws a focus state (its recipe's `focus` state from `useInteraction`); `kitCss` outlines it in
    Windows High Contrast. `focusTodo` in `reports/generic.json` lists the ones that do not yet.
  - A composite group (menu, menubar, toolbar, tablist, radiogroup, listbox) is one tab stop and moves with the arrows:
    `useRovingKeys` from `lib/roving.ts`. A listbox driven from a field moves `aria-activedescendant`. `keysTodo` lists the ones that do not.
  - An overlay keeps `useOverlayFocus` from `lib/focus.ts`: focus in when it opens (unless the tree says `autoFocus={false}`), Tab trapped
    when modal, Escape, focus back to the opener when it closes. A focused control that is replaced by something else hands focus on
    (`useFocusHandoff`).
  - Escape goes to the innermost handler that uses it: a handler that consumes Escape (or Enter) calls `e.preventDefault()`, and returns
    first when `isComposing(e)` (`lib/keys.ts`), since an IME's keys are its own. An overlay drawn in the layer (`useLayerStack`) takes
    Escape from the stack, which reads only what nothing inside prevented and gives it to the top overlay; it passes no `onEscape` to
    `useOverlayFocus` while it floats.
  - A status that appears is announced: `announce()` from `lib/announce.ts` on the web (never a live region mounted with its text) and
    from `lib/a11y.ts` on the phone (iOS has no live regions).
- **Composition:** import sibling components from their files (`../actions/button`), never from the
  kit's index.
- **Icons** are lucide names in kebab case, drawn with the kit's `<Icon name>`; every icon prop is an `IconName`,
  which also takes the icon component. A name is drawn from the kit's registry, `src/lib/icons.ts`, which imports
  exactly the lucide icons the kit draws, one by one, so an app's bundle holds those and not all of lucide. A name
  you add to kit code goes in the registry in the same change (`pnpm check code` fails both ways: a drawn name not
  registered, a registered name not drawn), spelled out where it is drawn (`tone === "danger" ? "circle-alert" :
  "info"`, never `` `chevron-${dir}` ``). No other kit file imports lucide. Items carry no functions, except a
  component icon: an item's `icon` may be one, for an app that has not registered the name.
- **Shortcuts** are written once (`Mod+Enter`) and drawn with `formatShortcut(keys, os)` from
  `@antfabric/ui-core`.
- **Entrances** (menus and dialogs pop, sheets slide up, banners drop, toasts rise) play on mount,
  with the names in `MOTION` (`@antfabric/ui-core`). Reduced motion turns them off.
- **Liquid Glass** is on for iOS 26+ (`useTheme().glass`) and macOS 26+ (`usePlatform().glass`), never
  elsewhere. Only the control layer gets glass: bars, floating buttons, sheets, menus, banners.
- **Sample data** is AntFabric's own: `#platform-eng`, `#design-crit`, real-sounding names from many
  cultures, AI agents called "Fabric". Copy is plain and specific. Coral means it needs you; one
  primary action per view. Every icon-only control has an accessible label.

## The React kit (web and desktop)

The same file serves the browser and the desktop app. What differs comes from `usePlatform()`:
`platform` (`"web"` or `"desktop"`), `os` (`browser`, `mac`, `windows`, `linux`), `osVersion`, and
`glass`.

- **Styles come from the recipe** (see Recipes). The kit writes what the recipe leaves out: layout,
  and `cursor`. Its own inline styles read `t` only for `t.space`, `t.duration` and `t.ease`, as
  `var(--af-…)` strings (`t.space.md`; `t.space["2xs"]` uses brackets, as a key that starts with a digit
  must). The theme and the platform's density come from the `data-af-theme` / `data-af-platform`
  attributes above.
- **Layout helpers** in `lib/style.ts`: `box` (a flex column that may shrink, like a React Native
  view), `row`, `pressable` (a `<button>` with the browser's look removed), `text`, `input`,
  `truncate(lines)`, `glass(kind)`, `enter(name)`, and `css(...parts)` to join style objects,
  skipping falsy ones.
- **Interaction** comes from `useInteraction({ disabled })`: `hovered`, `pressed`, `focused`
  (keyboard only), `disabled`, and `handlers` to spread on the element. The catalogue forces these
  for its state snapshots, so draw states from this hook, never from `:hover` CSS.
- **Borders are longhands** (`borderWidth`, `borderStyle`, `borderColor`), never the `border`
  shorthand. The recipe's reader writes them this way, and the kit's own inline styles do too:
  React warns when a hover or a variant changes `borderColor` under `border`. The same goes for any
  shorthand a state changes part of. `pnpm check` re-renders every component through its states and
  fails on these warnings.
- **Pressables** are `<button type="button">` (or `<a href>` for a link), with `data-af-press`.
  Inputs carry `data-af-input`, which styles their placeholder.
- **Keyframes** in the kit stylesheet: `af-spin`, `af-sheen` (skeleton sweep), `af-indeterminate`,
  `af-pulse`, `af-bounce` (typing dot), `af-ring`, `af-step-pulse` (a running step's dot), `af-lattice` (the
  thinking mark's cells), `af-shimmer` (the thinking word's sheen), and the `af-in-*` entrances behind `enter()`.

## The React Native kit (mobile)

- **Styles come from the recipe** (see Recipes). `useRecipe` from `lib/recipe` gives `{ view, text }`
  per part. `createStyles((t) => ({ … }))`, built from the phone's resolved tokens once per scheme,
  holds the layout the recipe leaves out, with `t.space` for gaps. A layout that depends on a prop or
  a press state goes inline over it. `useTheme()` gives `t`, `scheme`, `os` (`ios` / `android`),
  `osVersion` and `glass`.
- **Fonts by file.** A recipe's `weight` becomes the weight's font file through `font(weight)`, never
  `fontWeight`. The app loads one font file per weight. Code outside a recipe calls `font("semibold")`
  (Figtree; `font("bold", "display")` for Satoshi headlines).
- **Text never inherits.** Every `<Text>` takes the type its part's recipe gives it (`r.<part>.text`),
  and every `<Icon>` gets a `color`, the recipe's `text.color` for that part.
- **Never `{value && <X />}` with a string or number value**: an empty string becomes a text node
  inside a View, which React Native rejects. Use `{value ? <X /> : null}`.
- **Press** comes from `usePress({ disabled })`: `pressed`, `focused`, `disabled`, and `handlers` for
  the `Pressable`. There is no hover on a phone.
- **Accessibility:** `accessibilityRole`, `accessibilityLabel`, `accessibilityState`. A control drawn under 44pt gets
  `hitSlop={hitSlopTo(t.control.hit, height, width)}` (`lib/a11y.ts`); an overlay closes on Android's back (`useBackHandler`).
- **Dynamic Type:** each `Text` takes `maxFontSizeMultiplier={fontScale.content | control | chrome}` (`lib/type.ts`), and a control that
  holds a label has a `minHeight`, not a fixed `height`, so the grown label fits.
- **Reduce Motion** is `useReducedMotion()` (state that follows Settings) or `reducedMotion()` outside render, from `lib/motion.tsx`:
  never read once at import.
- **Truncation** is `numberOfLines`.
- **Motion** is React Native's `Animated` (on the native driver): `<Enter motion="pop">` for an
  entrance, `useEnter`, and `Animated` / `PanResponder` for gestures (swipe rows, sheet drags, the
  iOS 26 tab-bar lens). No Reanimated.
- **Glass:** `<GlassSurface style glassStyle>` draws iOS 26's system material through
  expo-glass-effect when the app has it, and an approximation elsewhere. `glassStyle` comes after the material (a
  background or shadow it sets replaces the system's and the approximation's), so a glass part passes its per-part
  `styles` there (`glassStyle={[shape, styles?.pill]}`) and puts its `testID` on the `GlassSurface`.

## The docs file

```ts
const docs: ComponentDocs = {
  id, name, category, status, description,
  props: { label: { type: "string", default: "Send invite", required: true }, onPress: { type: "event" }, … },
  platforms: { web: { status, base, import, notes, keyboard }, desktop: { … }, mobile: { … } },
  a11y, examples, matrix, states, edgeCases, related, flows,
};
```

- **`default` and `sample`.** A prop's `default` is the component's own: what a product gets when it passes nothing, generic, often
  empty. Where the catalogue should show AntFabric's content instead (its destinations, its workspace, its menus), that value is the
  prop's `sample`: every render, the playground and the usage code start from `sample ?? default`. Shared sample data lives in
  `packages/docs/src/samples/<category>.ts`; AntFabric's copy lives in core's opt-in `@antfabric/ui-core/antfabric` (`antfabricStrings`,
  `packages/core/src/antfabric.ts`), re-exported as `ANTFABRIC_STRINGS` and set at the root by the catalogue's `Stage`.
- **`matrix`** draws one prop across its values (`{ prop }`, or `{ prop, values }`). A row over something that is not one prop's
  value (a removed `kind` and the props it implied) is `{ prop, cases: [{ name, props }] }`: each case drawn with `props`, captioned
  `name`, in order. `prop` then only heads the row; every prop a case passes must be declared.
- **Which entry.** A component ships from its kit's root, except a data component (`./data`), the app frame and pictures of native
  surfaces (`./shell`), whose line goes in `src/shell/index.ts`, and the conversation idiom (`./chat`:
  Message, Composer, ReactionPill, ThreadSummary, TypingIndicator, MessageDivider, and MessageActions on the
  web), whose line goes in `src/chat/index.ts`. In each case the line is taken out of the category's `index.ts` (the root's, for a
  shell component), and `pnpm check code` fails when anything outside the subpath's folder imports its entry or a file it re-exports.
- **API conventions** (`reports/api/conventions.md`; `pnpm check conventions`). Four rules to know before you name a prop:
  1. A prop a component can change is reported by `on<Prop>Change(next)`, declared `changes: "<prop>"` in the docs and run through
     `useControllable`. There is no `onChange`; `open` / `onOpenChange` is only for overlays.
  2. An item in a list is named by `key: string`, and a prop that names an item (`value`, `selected`, `active`, `current`) holds a key.
  3. A panel, section, rail or bar that opens and closes takes `expanded` / `onExpandedChange`: positive, default what it drew
     before. No `collapsed`.
  4. An axis chart reads `x` and `y`; a part-of-whole chart reads `name` and `value`. `label` is only ever the accessible name.

  A `required` prop has no docs `default`: the catalogue draws it with its `sample`. A rename goes in `reports/migration/` before → after.
- **`platforms.<p>.base`** says what the component is built on in its kit, honestly ("`<button>`
  drawn from its recipe; hover and focus from useInteraction").
- **Two different statuses.** The component's own `status` is `"stable"`, `"beta"` or `"draft"` (`ComponentDocs.status` in
  `packages/docs/src/types.ts`); set `"draft"` on a new component and the owner moves it up. Each platform's
  `platforms.<p>.status` is `"ready"`, `"partial"` (gaps in `notes`), `"planned"` or `"not-applicable"` (with an
  `alternative`). `pnpm describe <id>` prints both, labelled.
- **`keyboard`** keys are written `Mod+K`; the page draws them per OS. **`gestures`** are mostly
  mobile.
- **Examples, edge cases and flow frames** pass props by name. A slot prop (`type: "node"`) takes a
  scene: `{ el: "view" | "text" | "icon" | "component", use, props, style, children }`, with a
  small style vocabulary (`bg`, `paddingX`, `radius`, `direction`, `align`, `justify`, `truncate`,
  `$token.refs`) that the catalogue draws with either kit.

## Flows

A flow shows how a component works inside the apps, one step at a time: where its data comes from,
what the person does, which event fires, whose state changes, what moves, and what they see after.
The component page draws it as a swimlane flowchart (Person, the component, App state, Server · OS),
one node per step with its `code`, and plays it on a live stage drawn by the kit.

- **Step kinds**, in the order they usually come: `data` (where the props come from), `trigger`
  (what the person does, or what arrives), `event` (the callback and its payload), `state` (what
  changes and who owns it), `effect` (a request, navigation, an OS call), `motion` (what moves, with
  `enter` naming the entrance), and `result` (what they see after).
- **The lane follows the kind**: `trigger` and `result` are the person's, `event` and `motion` the
  component's, `data` and `state` the app's, `effect` the server's or the OS's. A trigger that arrives
  rather than being done (a socket event, the connection dropping) says `lane: "system"`.
- **A step that differs per platform is two steps**, each with its own `platforms`.
- **`replay` frames** draw the component with `props`, or a `scene` composed from components (the
  CTA and the dialog it opens). Each frame names the `step` it starts at and holds for `hold` ms; a
  step with no frame keeps the frame before it. Keep a scene's structure the same between frames and
  only add or remove children: a component that appears plays its entrance.
- **`press`** draws a tap on the nth pressable of the frame (from 0, outermost pressables in document
  order), on the root of the component it names, or on the control whose label or text it is
  (`"press": "Back"`). Prefer the label: it survives a control added before it (Windows and Linux
  add a ☰ to the title bar). `pnpm frames <id> desktop windows` shows where each press lands.
