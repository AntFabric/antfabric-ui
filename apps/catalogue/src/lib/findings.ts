/**
 * What the Architecture page says about the system, written by hand: verified, inferred and
 * unknown statements, each with the `file:line` it rests on. `pnpm check` fails when a cited line does not exist; a
 * finding with `count` is confirmed against the scan at build.
 */

/** A number the scan computes, so a finding that quotes it can be confirmed on every build. */
export type CountKey =
  | "tokens.total"
  | "tokens.withoutDescription"
  | "tokens.unread"
  | "tokens.sameLightDark"
  | "tokens.sameInDarkByDesign"
  | "react.files"
  | "react.colours"
  | "react.dimensions"
  | "react-native.files"
  | "react-native.colours"
  | "react-native.dimensions";

export interface Finding {
  /** Short, stable, kebab-case. */
  id: string;
  /** Which page section it belongs to. */
  topic: "packages" | "tokens" | "components" | "kits" | "checks";
  /** verified: read in the code; inferred: follows from what was read; unknown: could not be settled from this repository. */
  tag: "verified" | "inferred" | "unknown";
  /** One or two plain sentences. */
  text: string;
  /** Repository-relative `path:line` (or `path` alone) the statement rests on. */
  refs: string[];
  /** The number the text quotes, to compare with the scan's. */
  count?: { key: CountKey; claimed: number };
}

export const FINDINGS: Finding[] = [
  {
    id: "one-token-source",
    topic: "packages",
    tag: "verified",
    text: "Both kits read the same token object from @antfabric/ui-core, through tokenVars() in the React kit and resolveTokens() in the phone kit. Neither kit defines a value of its own.",
    refs: ["packages/react/src/tokens.ts:11", "packages/react-native/src/theme.tsx:8"],
  },
  {
    id: "core-no-build-step",
    topic: "packages",
    tag: "verified",
    text: "@antfabric/ui-core has no build script and exports its TypeScript source directly from src/index.ts.",
    refs: ["packages/core/package.json:8"],
  },
  {
    id: "helper-code-copied",
    topic: "packages",
    tag: "verified",
    text: "Resolved: lib/state.ts was byte-identical in both kits, and ForceState and useForcedState were written out twice. Both now live once in packages/core/src/state.ts, and each kit re-exports them.",
    refs: [
      "packages/core/src/state.ts:1",
      "packages/react/src/index.ts:5",
      "packages/react-native/src/index.ts:4",
    ],
  },
  {
    id: "product-apps-outside",
    topic: "packages",
    tag: "unknown",
    text: "The product apps are not in this repository, so it cannot be checked from here whether they consume the kits. The README says neither app consumes them yet.",
    refs: ["README.md:72"],
  },
  {
    id: "token-values-copied",
    topic: "tokens",
    tag: "unknown",
    text: "The token values were copied from the desktop app's desktop.css and the mobile app's tokens.ts. Whether they still match those files cannot be checked here.",
    refs: ["packages/core/src/tokens.ts:3"],
  },
  {
    id: "desktop-web-one-kit",
    topic: "kits",
    tag: "verified",
    text: "Desktop and web share one kit, @antfabric/ui-react. The data-af-platform attribute picks profiles.desktop or profiles.web, and the web profile's own description calls its values a proposal.",
    refs: ["packages/react/src/platform.tsx:20", "packages/core/src/tokens.ts:427"],
  },
  {
    id: "theme-switching-differs",
    topic: "kits",
    tag: "verified",
    text: "In the React kit a theme change is an attribute on the root, so nothing re-renders. In the phone kit ThemeProvider swaps the token object and every consumer re-renders.",
    refs: ["packages/core/src/css.ts:9", "packages/react-native/src/theme.tsx:50"],
  },
  {
    id: "motion-offsets-duplicated",
    topic: "kits",
    tag: "verified",
    text: "MOTION in core gives the durations and easings, but the entrance offsets (8px, -14px, scale 0.94) are written again as keyframes in core's css.ts and again in the phone kit's from().",
    refs: ["packages/core/src/css.ts:69", "packages/react-native/src/lib/motion.tsx:29"],
  },
  {
    id: "glass-stubbed-in-catalogue",
    topic: "kits",
    tag: "inferred",
    text: "The catalogue stubs expo-glass-effect, so the GlassView path in the phone kit's glass.tsx only runs on a device. This follows from the alias and the import, not from a test.",
    refs: ["apps/catalogue/astro.config.mjs:29", "packages/react-native/src/lib/glass.tsx:45"],
  },
  {
    id: "props-one-api",
    topic: "kits",
    tag: "verified",
    text: "Every prop that differs between the kits is scoped to platforms in the docs. pnpm check fails when a kit's XProps does not match its documented props for its platforms.",
    refs: ["apps/catalogue/scripts/check.tsx:155"],
  },
  {
    id: "react-component-count",
    topic: "components",
    tag: "verified",
    text: "@antfabric/ui-react has 57 components, each written by hand as its own file.",
    refs: ["packages/react/src/components"],
    count: { key: "react.files", claimed: 57 },
  },
  {
    id: "rn-component-count",
    topic: "components",
    tag: "verified",
    text: "@antfabric/ui-react-native has 49 components, each written by hand as a separate implementation.",
    refs: ["packages/react-native/src/components"],
    count: { key: "react-native.files", claimed: 49 },
  },
  {
    id: "button-variants-differ",
    topic: "components",
    tag: "verified",
    text: "The Button's variant-to-token mapping is one recipe, read by both kits. The one difference it keeps is the ink variant when pressed: the web uses brand.active, the phone brand.default.",
    refs: ["packages/core/src/recipes/actions/button.ts:29", "packages/core/src/recipes/actions/button.ts:37"],
  },
  {
    id: "button-label-size",
    topic: "components",
    tag: "verified",
    text: "The Button label is 12px caption text on the web for the sm and md sizes. In the phone kit it is 16px body text at every size.",
    refs: ["packages/core/src/recipes/actions/button.ts:14", "packages/core/src/recipes/actions/button.ts:15"],
  },
  {
    id: "button-haptic-missing",
    topic: "components",
    tag: "inferred",
    text: "The Button docs ask for a light impact haptic on press-in on mobile, but no file in the phone kit imports a haptics module.",
    refs: ["packages/docs/src/components/actions/button.ts:107", "packages/react-native/src/components/actions/button.tsx"],
  },
  {
    id: "button-border-literal",
    topic: "components",
    tag: "verified",
    text: "Both Button files set borderWidth to the literal 1, and there is no border-width token. Since Phase 3 the secondary variant's edge is border.wHairline, named in the Button's recipe.",
    refs: ["packages/core/src/recipes/actions/button.ts:23"],
  },
  {
    id: "switch-literals",
    topic: "components",
    tag: "verified",
    text: "The Switch is sized with literals in both kits. The web uses a 30px width, and the phone uses shape constants for iOS (51x31) and Android (36x14).",
    refs: ["packages/react/src/components/inputs/switch.tsx:38", "packages/react-native/src/components/inputs/switch.tsx:25"],
  },
  {
    id: "icon-button-coarse-literal",
    topic: "components",
    tag: "verified",
    text: "IconButton uses literal 32px and 40px boxes on coarse pointers instead of a size token.",
    refs: ["packages/react/src/components/actions/icon-button.tsx:71"],
  },
  {
    id: "react-colour-literals",
    topic: "components",
    tag: "verified",
    text: "The React kit has 18 colour literals in component files, for example the Switch background #ffffff.",
    refs: ["packages/react/src/components/inputs/switch.tsx:51"],
    count: { key: "react.colours", claimed: 18 },
  },
  {
    id: "rn-colour-literals",
    topic: "components",
    tag: "verified",
    text: "The phone kit has 15 colour literals in component files, for example the Switch thumb #ffffff.",
    refs: ["packages/react-native/src/components/inputs/switch.tsx:36"],
    count: { key: "react-native.colours", claimed: 15 },
  },
  {
    id: "react-dimension-literals",
    topic: "components",
    tag: "verified",
    text: "The React kit has 715 dimension literals in component files: numbers on size keys (width, padding, fontSize…) where a token could carry the decision.",
    refs: ["packages/react/src/components/inputs/switch.tsx:38"],
    count: { key: "react.dimensions", claimed: 715 },
  },
  {
    id: "rn-dimension-literals",
    topic: "components",
    tag: "verified",
    text: "The phone kit has 429 dimension literals in component files: numbers on size keys (width, padding, fontSize…) where a token could carry the decision.",
    refs: ["packages/react-native/src/components/inputs/switch.tsx:25"],
    count: { key: "react-native.dimensions", claimed: 429 },
  },
  {
    id: "one-token-tier",
    topic: "tokens",
    tag: "verified",
    text: "The token file has 212 leaves made of shared, themes and profiles. Where a value is one of the product's primitives it is a reference into primitives.ts (the mirror of the product's Tier 1, `pnpm primitives`); every other value is a literal, and no token points at another token.",
    refs: ["packages/core/src/tokens.ts:33", "packages/core/src/primitives.ts"],
    count: { key: "tokens.total", claimed: 212 },
  },
  {
    id: "descriptions-on-profiles",
    topic: "tokens",
    tag: "verified",
    text: "In tokens.ts only the three profiles (web, desktop, mobile) carry a $description. The 212 token descriptions live in a typed side file, descriptions.ts, keyed by leaf path.",
    refs: ["packages/core/src/tokens.ts:427", "packages/core/src/tokens.ts:500", "packages/core/src/tokens.ts:573"],
  },
  {
    id: "radius-card-override",
    topic: "tokens",
    tag: "verified",
    text: "radius.card is the only shared token a profile overrides: 12 in shared, and 16 in profiles.mobile.",
    refs: ["packages/core/src/tokens.ts:41", "packages/core/src/tokens.ts:645"],
  },
  {
    id: "tokens-unused",
    topic: "tokens",
    tag: "verified",
    text: "24 tokens are read by no file in either kit. The 24th is accent.default: the scan used to count it as read through Card's computed t.color[accent], which no longer names a group once the colours are top-level.",
    refs: ["packages/core/src/tokens.ts", "reports/baseline.json"],
    count: { key: "tokens.unread", claimed: 24 },
  },
  {
    id: "same-light-dark",
    topic: "tokens",
    tag: "verified",
    text: "17 tokens have the same value in light and dark, so the dark theme repeats them. All 17 are marked sameInDark in descriptions.ts, each with the reason (the brand, a person's colour, the OS's own chrome).",
    refs: ["packages/core/src/tokens.ts", "packages/core/src/descriptions.ts"],
    count: { key: "tokens.sameInDarkByDesign", claimed: 17 },
  },
  {
    id: "fonts-second-source",
    topic: "tokens",
    tag: "verified",
    text: "Fonts have a second source of truth in the phone kit. lib/type.ts maps weights to file names such as Figtree-SemiBold, and those names are not in tokens.ts.",
    refs: ["packages/react-native/src/lib/type.ts:18"],
  },
  {
    id: "token-classes-inferred",
    topic: "tokens",
    tag: "inferred",
    text: "The token classes (component, layout, OS) are inferred from the names, because tokens.ts has no metadata that says what a token is.",
    refs: ["packages/core/src/tokens.ts"],
  },
  {
    id: "checks-do-not-read-values",
    topic: "checks",
    tag: "verified",
    text: "pnpm check fails on undeclared props, unknown token names and React warnings, but it does not read style values. A literal colour or a divergent variant mapping passes.",
    refs: ["apps/catalogue/scripts/check.tsx:155", "apps/catalogue/scripts/rerender.tsx"],
  },
  {
    id: "usecontrollable-declared",
    topic: "checks",
    tag: "verified",
    text: "Every useControllable(value, onEvent) call must match a changes declaration on onEvent in the docs, or the check fails.",
    refs: ["apps/catalogue/scripts/check.tsx:161"],
  },
];
