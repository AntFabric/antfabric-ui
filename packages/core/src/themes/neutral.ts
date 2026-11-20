/**
 * `neutral`: a shadcn-like look over the kit's own schema. Zinc greys with no second hue, the primary a near-black (near-white in
 * dark) instead of coral, small radii, Geist for type, and shadows that are plain black instead of AntFabric's navy. It changes the
 * look, and three things an accessibility audit asked of the default: a field's edge passes 3:1, each size name
 * draws one height across the controls, and no desktop target is under 24px. Spacing is the kit's.
 *
 * The values and the reasons are in NEUTRAL.md, with the contrast table. Colours here are literals on purpose: the kit's primitives
 * are AntFabric's palette (a warm `neutral`, a navy ink, coral) and no zinc ramp exists there, and a theme's value is never a
 * primitive it does not mean. Zinc steps are Tailwind's (50 #fafafa … 950 #09090b).
 *
 * Left alone, by intent: the avatar identity colours and `identity.agent`, the chart and data colours (`chart.*`, `data.*`,
 * `table.rowSelected`), the status family except `danger` (which moves to a plain red), the presence dots and the OS imitation
 * colours (`os.*`, `glass.bg/clear/tinted/solid`).
 *
 * The recipe overrides (Button's radius and weight, the pills that become rounded rectangles, Toast's success mark) are at the end,
 * with their reasons in NEUTRAL.md.
 *
 * This file is the theme's input, not the theme: `neutralTheme()` in `theme.ts` builds it (so `defineTheme` can start from it without an import
 * cycle) and `themes/index.ts` exports it as `neutral`. It starts from the schema (`extends: null`), like the other preset.
 */

import type { ThemeInput } from "../theme";

/** Geist for the web (the stack ends in the system's, not in Figtree) and for the phone (a file per weight; Geist has no ExtraBold, so it takes Bold). */
const GEIST_STACK = '"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const GEIST = {
  family: "Geist",
  files: { regular: "Geist-Regular", medium: "Geist-Medium", semibold: "Geist-SemiBold", bold: "Geist-Bold", extrabold: "Geist-Bold" },
} as const;

export const neutralInput: ThemeInput = {
  name: "neutral",
  extends: null,
  fonts: { sans: GEIST, display: GEIST },
  tokens: {
    shared: {
      font: { sans: GEIST_STACK, display: GEIST_STACK },
      // shadcn's scale: 4 / 6 / 6 / 10 / 12 / 16. `pill` and `circle` stay: a tag, an avatar and a switch mean round.
      radius: { tag: 4, row: 6, control: 6, input: 6, card: 10, rail: 10, panel: 12, sheet: 16, tray: 12 },
      // The desktop's macOS menu bar rows and titles were 22px: 24, WCAG 2.2's minimum target (X-05).
      osMenu: { macItemH: 24, macTitleH: 24 },
    },
    schemes: {
      light: {
        // The agent's coral under white initials was 3.42:1; one step deeper is 4.98:1 (WCAG 1.4.3).
        identity: { agent: "#d2321e" },
        surface: {
          page: "#ffffff",
          card: "#ffffff",
          raised: "#ffffff",
          chrome: "#ffffff",
          sidebar: "#fafafa",
          recessed: "#fafafa",
          muted: "#f4f4f5",
          selected: "#eeeef0",
          unread: "rgba(9,9,11,.03)",
          inverse: "#18181b",
        },
        hover: { surface: "#f4f4f5" },
        brand: { default: "#18181b", hover: "#27272a", active: "#3f3f46", soft: "#f4f4f5", softHover: "#e4e4e7", tint: "#f4f4f5" },
        accent: { default: "#71717a", soft: "rgba(24,24,27,.06)" },
        fg: {
          strong: "#09090b",
          body: "#18181b",
          muted: "#52525b",
          subtle: "#5d5d66",
          faint: "#6b6b74",
          placeholder: "#6b6b74",
          onBrand: "#ffffff",
          onInverse: "#fafafa",
          onBrandSoft: "#18181b",
        },
        link: { default: "#18181b" },
        border: { subtle: "#e4e4e7", muted: "#d4d4d8", default: "#8f8f98", strong: "#09090b", active: "#71717a", brand: "#d4d4d8" },
        focus: { ring: "#71717a" },
        switch: { trackOff: "#8f8f98" },
        skeleton: { fill: "#f4f4f5", sheen: "#fafafa" },
        tabs: { track: "#f4f4f5" },
        scrim: { light: "rgba(9,9,11,.18)", default: "rgba(9,9,11,.34)", strong: "rgba(9,9,11,.42)" },
        glass: { edge: "rgba(9,9,11,.42)" },
        os: { statusFg: "#09090b" },
        tag: { neutralBg: "#f4f4f5", neutralFg: "#52525b", brandBg: "#18181b", brandFg: "#fafafa" },
        // Danger moves from AntFabric's crimson to a plain red, which sits beside zinc without a pink cast; success, warning and info stay.
        danger: { default: "#c81e1e", soft: "#fef2f2", hover: "#991b1b", solid: "#dc2626", solidHover: "#b91c1c" },
        table: { header: "#fafafa", rowHover: "#f4f4f5" },
        shadow: {
          hairline: "0 1px 2px rgba(0,0,0,.05)",
          card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
          raise: "0 4px 12px rgba(0,0,0,.06)",
          float: "0 8px 24px rgba(0,0,0,.08)",
          pill: "0 4px 14px rgba(0,0,0,.12)",
          menu: "0 1px 2px rgba(0,0,0,.05), 0 6px 20px rgba(0,0,0,.08)",
          modal: "0 1px 3px rgba(0,0,0,.06), 0 16px 40px rgba(0,0,0,.1)",
          tooltip: "0 1px 2px rgba(0,0,0,.05), 0 4px 12px rgba(0,0,0,.08)",
          // A 1px gap and a 2px ring (3px in all, like AntFabric's halo), solid so it holds 3:1 on white.
          focus: "0 0 0 1px #ffffff, 0 0 0 3px #71717a",
          glass: "inset 0 1px 0.5px rgba(255,255,255,.9), inset 0 -0.5px 0.5px rgba(255,255,255,.4), inset 0 0 0 0.5px rgba(255,255,255,.55), 0 0 0 0.5px rgba(0,0,0,.08), 0 8px 28px rgba(0,0,0,.14)",
          glassContrast: "inset 0 0 0 1px rgba(9,9,11,.42), 0 8px 28px rgba(0,0,0,.16)",
        },
      },
      dark: {
        // The agent's coral under white initials was 3.42:1; one step deeper is 4.98:1 (WCAG 1.4.3).
        identity: { agent: "#d2321e" },
        surface: {
          page: "#09090b",
          card: "#18181b",
          raised: "#202023",
          chrome: "#09090b",
          sidebar: "#111113",
          recessed: "#111113",
          muted: "#27272a",
          selected: "#34343a",
          unread: "rgba(250,250,250,.04)",
          inverse: "#fafafa",
          app: "#09090b",
          overlay: "rgba(9,9,11,.88)",
        },
        hover: { surface: "#27272a" },
        brand: { default: "#fafafa", hover: "#e4e4e7", active: "#d4d4d8", soft: "#27272a", softHover: "#3f3f46", tint: "#27272a" },
        accent: { default: "#a1a1aa", soft: "rgba(250,250,250,.1)" },
        fg: {
          strong: "#fafafa",
          body: "#e4e4e7",
          muted: "#b4b4bb",
          subtle: "#aaaab2",
          faint: "#9c9ca5",
          placeholder: "#9c9ca5",
          onBrand: "#18181b",
          onInverse: "#18181b",
          onBrandSoft: "#fafafa",
        },
        link: { default: "#fafafa" },
        border: { subtle: "#27272a", muted: "#3f3f46", default: "#71717a", strong: "#fafafa", active: "#a1a1aa", brand: "#3f3f46" },
        focus: { ring: "#a1a1aa" },
        switch: { trackOff: "#71717a" },
        skeleton: { fill: "#27272a", sheen: "#3f3f46" },
        tabs: { track: "#27272a" },
        tag: { neutralBg: "#27272a", neutralFg: "#d4d4d8", brandBg: "#fafafa", brandFg: "#18181b" },
        danger: { default: "#f87171", soft: "#2a1415", hover: "#fca5a5", solid: "#dc2626", solidHover: "#b91c1c" },
        table: { header: "#111113", rowHover: "#27272a" },
        shadow: {
          focus: "0 0 0 1px #09090b, 0 0 0 3px #a1a1aa",
        },
      },
    },
    profiles: {
      // The phone's cards were one step rounder than the desktop's (16 against 12); they still are (12 against 10).
      // The phone's large control was 40, under its medium 44: the scale now climbs (34, 40, 44, 48, 56), so `lg` is never smaller than `md`.
      // The segmented strip (tab, track padding and edge) is as tall as `control.hMd`, as the other medium controls are (X-04, S1-18).
      mobile: { radius: { card: 12 }, control: { hLg: 48 }, segmentedControl: { h: 34 } },
      // The switch's thumb shadow was navy on the web and the desktop.
      web: { switch: { thumbShadow: "0 1px 2px rgba(0,0,0,.18)" }, segmentedControl: { h: 26 } },
      // The desktop's small icon button and smallest control were 20 and 22px: 24, WCAG 2.2's minimum target (2.5.8), as on the web.
      desktop: { switch: { thumbShadow: "0 1px 2px rgba(0,0,0,.18)" }, control: { hIconSm: 24, hXxs: 24 }, segmentedControl: { h: 24 } },
    },
  },
  // What the tokens cannot say, because the recipe names the shape or the colour (NEUTRAL.md, "Recipe overrides"): controls that were
  // pills become rounded rectangles; shapes that mean round (tags, chips, badges, switches, progress, grabbers) stay pills.
  recipes: {
    // Medium weight, as shadcn's; ink's hover was the brand (coral), which here is the ink itself, so it steps to the brand's hover.
    // One height per size name across Button, Select, TextField and SearchField: sm is `control.hSm`, md `control.hMd`, lg `control.hInput`
    // (the button's sm was hXs and its lg hXl, the select's md and the search field were hLg).
    button: {
      shortcut: { base: { opacity: "none" } },
      root: {
        base: { radius: "$radius.control", weight: "$font.weightMedium" },
        variants: {
          size: { sm: { height: "$control.hSm" }, lg: { height: "$control.hInput" } },
          variant: { ink: { states: { hover: { bg: "$brand.hover", fg: "$fg.onBrand" } } } },
        },
      },
    },
    // A field's edge is `border.default`, 3:1 or more against the page and the card in both schemes (WCAG 1.4.11); it was `border.subtle`
    // or `border.muted`, 1.2 to 1.5:1, the look shadcn has and the one the contrast table in NEUTRAL.md flagged.
    "text-field": { field: { base: { borderColor: "$border.default" } } },
    select: { trigger: { base: { height: "$control.hMd", borderColor: "$border.default" } } },
    "search-field": { root: { base: { height: "$control.hMd", borderColor: "$border.default" } } },
    dialog: { field: { base: { borderColor: "$border.default" } } },
    "question-panel": { field: { base: { borderColor: "$border.default" } } },
    // 24px targets on the web and the desktop (WCAG 2.2 2.5.8, X-05): a label-less checkbox, a radio row, a chip's ✕, the connection
    // banner's retry and a notification row's actions were 15 to 22px. The phone reaches 44pt by hitSlop and is left as it is.
    checkbox: { root: { platforms: { web: { base: { minHeight: "$control.hit", minWidth: "$control.hit" } }, desktop: { base: { minHeight: "$control.hit", minWidth: "$control.hit" } } } } },
    chip: { remove: { platforms: { web: { base: { square: "$control.hXxs" } }, desktop: { base: { square: "$control.hXxs" } } } }, count: { base: { opacity: "none" } } },
    "notification-item": { rowAction: { base: { minHeight: "$control.hit" } } },
    // Text that faded to 0.7 or 0.6 over its own ink fell under 4.5:1 (X-06): a chip's count (2.89:1), the shortcut on a danger button
    // (2.98:1) and a sending message's time (2.38:1). Neutral draws them at full ink; the status line still says "Sending…".
    message: { root: { variants: { status: { sending: { opacity: "none" } } } } },
    // The tab strip scrolls and clips an outer ring: the focused tab draws its ring inside (S2-13).
    tabs: { tab: { states: { focus: { shadow: "none", ring: "$border.strong" } } } },
    "segmented-control": { track: { base: { radius: "$radius.control" } }, card: { base: { radius: "$radius.tag" } }, tab: { base: { radius: "$radius.tag" } } },
    "radio-group": {
      pill: { base: { radius: "$radius.input", borderColor: "$border.default" } },
      option: { platforms: { web: { base: { minHeight: "$control.hit" } }, desktop: { base: { minHeight: "$control.hit" } } } },
    },
    // The "Main menu" chip (`pill`) and the destination rows (`row`).
    "nav-rail": { pill: { base: { radius: "$radius.control" } }, row: { base: { radius: "$radius.control" } } },
    "app-menu-bar": { segment: { base: { radius: "$radius.control" } }, themeTrack: { base: { radius: "$radius.control" } } },
    "command-palette": { pill: { base: { radius: "$radius.control" } } },
    "in-app-banner": { field: { base: { radius: "$radius.input", borderColor: "$border.default" } } },
    "context-menu": { search: { base: { radius: "$radius.input" } } },
    "update-banner": { banner: { base: { radius: "$radius.card" } } },
    "connection-banner": { retry: { base: { radius: "$radius.control", height: "$control.hit" } } },
    "notification-schedule": { resume: { base: { radius: "$radius.control" } }, resumeBordered: { base: { radius: "$radius.control" } } },
    // The success mark was a brand disc; on the light toast the brand is the toast's own ink, so the disc would vanish.
    toast: { mark: { variants: { tone: { success: { bg: "$success.default" } } } } },
  },
};
