# Component review: AntFabric UI 1.0

Date: 2026-11-23 · Branch: `feature/comp-review` · Scope: `@antfabric/ui-core`, `@antfabric/ui-react`, `@antfabric/ui-react-native` at 1.0.0 (source in this repo, and the tarballs installed from npm in `antfabric-ui-demo`).

No component code was changed. This file lists what was found and a plan to fix it.

## Summary

- **Baseline is green.** `pnpm check` passes (90 components, 11,993 renders, 42 warnings) and the re-render pass passes (16,368 updates, no warnings). Every ratchet list in `reports/generic.json` is empty. Everything below is what those checks do not see.
- **150 findings: 21 high, 56 medium, 73 low.** Several cover more than one component, so the number of affected components is higher.
- **Most of the serious ones come from six shared causes**, not from individual components. Fixing the shared code (and adding a check for each) closes about half the list.
- **Nothing was tested on a phone or with a screen reader.** React Native findings come from reading the code; each says so.

| Area | High | Medium | Low |
|---|---|---|---|
| Shared causes (state, focus, Escape, IME) | 5 | 5 | 0 |
| Inputs and actions | 1 | 7 | 13 |
| Overlays, navigation, system | 2 | 11 | 7 |
| Messaging, agent, feedback | 2 | 7 | 16 |
| Display, notifications, shell | 1 | 10 | 19 |
| Data (charts, table, KPIs) | 3 | 11 | 12 |
| Theme, tokens, foundations | 4 | 4 | 3 |
| Packaging and consumer | 3 | 1 | 3 |
| **Total** | **21** | **56** | **73** |

### How each finding was checked

The "Checked" column uses four words:

- **Ran**: reproduced by running it (a print-only script against `packages/core`, or the demo app in a browser).
- **Read**: the code path was read end to end by the reviewer, and for every High I re-read the cited lines myself.
- **Traced**: read end to end by one reviewer only.
- **Suspected**: plausible from the code, depends on browser, device or library behaviour that was not run. These are also collected under "Unconfirmed" at the end.

### Method

1. Baseline: `pnpm check --quiet`, which includes the re-render pass.
2. Six parallel code reviews, one per group of categories, each reading the React and React Native file of every component side by side with its docs, against checklists for correctness, WCAG 2.2 AA, kit parity and API.
3. Live checks of the published 1.0 packages in the demo app: accessibility tree, computed contrast for every text node in three themes and two schemes, target sizes, keyboard use of Select.
4. Spot-checks of the high-severity findings against the source, and probes of the pure functions in `packages/core`.

Paths are relative to `packages/` unless they start with another folder.

---

## Shared causes

These six explain most of the high-severity findings. Each is one fix in shared code plus a sweep.

### S1. A control freezes when it gets its change handler without its value (High, Read)

`core/src/state.ts:22` decides a prop is controlled when `onChange !== undefined && value !== undefined`. Almost every component gives the prop a default in its destructuring (`checked = false`, `value = ""`, `open = false`), so `value` is never `undefined` and "handler only" counts as "controlled at the default, forever".

- `<Switch label="…" onCheckedChange={save} />`: reports `true` on every click and never turns on.
- `<TextField label="Name" onValueChange={save} />`: drops every keystroke.
- `<Select items={…} value={v} onValueChange={setV} onOpenChange={log} />`: never opens.
- `<Composer onValueChange={saveDraft} />`: the field snaps back to empty.
- `<Tabs items onValueChange={log} />`: never leaves the first tab.

The hook's own comment (`state.ts:13`) and the docs (`docs/src/components/inputs/select.ts:97`, `notifications/notification-schedule.ts:67`) say handler-only keeps its own state. Only TextArea does it right (`react/src/components/inputs/text-area.tsx:67,96-97`).

Affected (both kits unless noted): select, text-field, search-field, checkbox, switch, radio-group, segmented-control, icon-button, chip, composer, swipe-row (RN), thinking-indicator, approval-item, question-panel, attachment-card, thread-summary, reaction-pill, message, message-actions, tooltip, hover-card, popover, tabs, notification-schedule, pagination.

### S2. A component shows the result before the app confirms it, and cannot go back (High, Traced)

`useControllable` only re-seeds its inner state when the prop **changes value**. Components that flip their own state on press therefore stay flipped when the app answers with the same value it had before (a failed retry, a dismissed OS prompt).

| Component | Kit | Where | What the user sees |
|---|---|---|---|
| dialog | both | `react/…/overlays/dialog.tsx:135-148`, RN `:100-112` | Confirm fails with the same `error` text as before: the CTA spins forever, Cancel, ✕, Esc, scrim and Android back are all dead |
| session-state | both | `react/…/system/session-state.tsx:47,63-66`, RN `:75-76,103-106,114` | Sign-in fails: stuck on "waiting". Phone: shows "Unlocked" before Face ID succeeds |
| update-banner | both | `react/…/system/update-banner.tsx:237-244`, RN `:100,144-147` | Check again returns "latest" again, or Retry fails again: spins forever |
| permission-prompt | both | `react/…/notifications/permission-prompt.tsx:44,95-100`, RN `:64,85-89` | "Notifications are on" is shown and announced when the OS prompt was dismissed |
| notification-item | both | `react/…/notifications/notification-item.tsx:117,136,206,216` | "Approved" is shown and announced; a failed request cannot roll it back |
| message, attachment-card | both | `react/…/messaging/message.tsx:176-180`, `attachment-card.tsx:474-477` | A retry that fails again stays on "Sending…" with no Retry or Delete |
| reaction-pill | both | `react/…/messaging/reaction-pill.tsx:77-79` | A rejected reaction stays shown as mine |
| in-app-banner | both | `react/…/notifications/in-app-banner.tsx:115,118-121` | After one dismissal the same instance never shows the next notification |
| sidebar-item in a section | both | `react/…/shell/sidebar-item.tsx:113-114,155`, `sidebar-section.tsx:88,137` | Each pressed row keeps its own `active`; when `selected` returns to `""`, several rows are current at once |
| question-panel | both | `react/…/agent/question-panel.tsx:175,205` | No way back from "Sending…" when the answer fails, unless the app pulses `sending` |

### S3. Tab leaves a modal when its last control is a roving item (High, Read)

`react/src/lib/focus.ts:5`: `FOCUSABLE` matches `button:not(:disabled)` and `input:not(:disabled)` whatever their `tabindex`; only the `[tabindex]` clause excludes `-1`. So `last` can be an element Tab never lands on, `at === last` is never true, and Tab walks out of the `aria-modal` panel (`focus.ts:80-89`).

- CommandPalette: its options are `tabIndex={-1}` buttons (`overlays/command-palette.tsx:102`), so Tab from the field leaves the palette.
- Any Dialog or Sheet whose last control is a RadioGroup, Tabs, a Menu row, or the Composer toolbar.
- A hidden input first in a form dialog: `initial: "first"` focuses nothing and focus never enters.

The re-render check passes because it uses the same selector and focuses `last` itself (`apps/catalogue/scripts/rerender.tsx:115`). WCAG 2.1.2, 2.4.3.

### S4. Escape in a dialog closes the dialog, not the thing open inside it (High, Read)

`react/src/lib/layer.tsx:69-76` listens for Escape on `document` in the capture phase and calls `stopPropagation()`. A Select, Menu, Tooltip or HoverCard inside a Dialog, Sheet or Popover handles Escape with React `onKeyDown`, which runs later, so it never sees the key. Pressing Esc on an open Select in a form dialog cancels the dialog and loses the form. The `defaultPrevented` test on line 70 can never be true in capture. WCAG 3.2.2.

### S5. Enter or Escape during IME composition acts on the half-typed text (High, Read)

Composer and TextField guard with `isComposing`; these do not:

| Where | Effect |
|---|---|
| `react/…/agent/question-panel.tsx:324-329` | Enter submits the half-composed answer and locks the panel |
| `react/…/inputs/search-field.tsx:118` | Enter fires `onSubmit`; Esc clears the field |
| `react/…/inputs/select.tsx:288,419` | Enter in the filter picks a row and closes |
| `react/…/notifications/in-app-banner.tsx:224`, `os-notification.tsx:206` | Enter sends the reply |
| `react/src/lib/layer.tsx:69-76`, `lib/focus.ts:68-72` | Esc that cancels a composition closes the overlay |
| `react/…/inputs/text-field.tsx:203` | Checks `isComposing` only; Safari and WKWebView (Tauri on macOS) report `keyCode 229` with `isComposing false` (Suspected) |

### S6. Keyboard focus drops to the page when the pressed control disappears (Medium, Traced)

AUTHORING.md:263-264 requires a hand-off. Missing in: question-panel Submit (`agent/question-panel.tsx:388`), toast and inline-banner dismiss (`feedback/toast.tsx:138`, `inline-banner.tsx:83`), a sole reaction (`messaging/reaction-pill.tsx:134`), in-app-banner ×, notification-schedule Resume and Pause, os-notification Reply, update-banner Install (`system/update-banner.tsx:151-174`), hover-card Esc from inside the card, bottom-sheet ✕ on the web. Also `lib/focus.ts:58`: when the opener of an overlay has unmounted (a menu row that opened a dialog), focus is restored to nothing. WCAG 2.4.3.

---

## High

| ID | Component | Kit | Type | Where | What happens | Checked |
|---|---|---|---|---|---|---|
| H1 | ~25 components | both | bug | `core/src/state.ts:22` | See S1 | Read |
| H2 | 10 components | both | bug | see S2 | See S2 | Traced |
| H3 | dialog, sheet, command-palette, bottom-sheet | react | a11y | `react/src/lib/focus.ts:5,80-89` | See S3 | Read |
| H4 | dialog, sheet, popover | react | bug | `react/src/lib/layer.tsx:69-76` | See S4 | Read |
| H5 | question-panel, search-field, select, in-app-banner, os-notification, layer | react | bug | see S5 | See S5 | Read |
| H6 | toast-region | react | bug | `react/…/feedback/toast-region.tsx:64-68` | Wrappers are keyed by index. Removing or adding a toast remounts every toast after it: timers restart, each is announced again, focus on a later Undo is lost | Read |
| H7 | list-item | both | bug | `react/…/display/list-item.tsx:175`, RN `:145-148,186-190` | Every press runs `setOn(!on)`, for link, button and menuitem rows too. A settings row gets `aria-current="page"` and keeps it; on the phone it grows a check mark | Read |
| H8 | charts: `date`, `month`, `day` formats | core | bug | `core/src/chart/format.ts:51,64-66` | `fmt("date", "2026-05-01")` throws `Invalid time value`. A chart whose x is an ISO string crashes on render. The demo app works around it with timestamps (`antfabric-ui-demo/src/App.tsx:26`) | Ran |
| H9 | table and every `date` cell | core | bug | `core/src/chart/grid.ts:92-98,227-232` | A date-only string prints the previous day west of UTC: `"2026-03-01"` gives `Feb 28, 2026` in Los Angeles. Server and client can also disagree on hydration | Ran (reviewer) |
| H10 | `defineTheme` | core | security | `core/src/theme.ts:148-167`, `brand.ts:203-209` | `url(https://…)` and a raw newline get past the sanitiser into the stylesheet. A tenant theme stored as JSON can make every viewer's browser fetch an attacker's URL, or break the rest of the sheet | Ran |
| H11 | published types | packaging | consumer | `react/tsconfig.build.json`, installed `dist/index.d.ts` | Under `moduleResolution: nodenext` the types do not resolve: `Module "@antfabric/ui-react" has no exported member 'Button'`. The demo only works because it uses `bundler` | Ran (reviewer) |
| H12 | all entries | packaging | consumer | `scripts/build-packages.mjs:41-54` | No `"use client"` in any published file (0 matches in the installed `dist`). Importing the kit into a Next.js Server Component fails, though CONSUMING.md says "any React 19 framework" | Read; the Next failure itself was not run |
| H13 | Icon | react | consumer | `react/src/lib/icon.tsx:1,14` | `import * as lucide` plus a lookup by name defeats tree-shaking. The demo's production bundle is 1.96 MB (515 KB gzip) and holds every lucide icon | Ran |
| H14 | button, badge (AntFabric theme) | react | a11y | brand `#FE4632` with `fg.onBrand` white | White text on the brand colour is 3.42:1 in both schemes: primary Button label (12px), Badge count (11px), and the shortcut hint at 0.7 opacity is 2.32:1. Neutral and a custom indigo brand pass. WCAG 1.4.3 | Ran (demo, measured) |
| H15 | text-field, text-area, search-field and 4 more | react | a11y | `react/src/lib/style.ts:59`, `core/src/css.ts:175` | Inline `outline: none` beats the forced-colours rule written to restore it, so in Windows High Contrast a focused field shows only the caret. WCAG 2.4.7 | Traced |
| H16 | `useBackHandler` | rn | bug | `react-native/src/lib/a11y.ts:29-37` | Callers pass a new function every render, so listeners re-register on each render and the parent registers last. Android back closes the outer sheet and leaves the Select inside it open | Traced |
| H17 | sheet | rn | bug | `react-native/…/overlays/sheet.tsx:53`, `bottom-sheet.tsx:107-110,122,134` | `dismissible={false}` is not passed down: handle tap, drag, back and the escape gesture still slide the sheet away, leaving an empty scrim | Traced |
| H18 | popover | rn | bug | `react-native/…/overlays/popover.tsx:86-89,105,121-123` | Position is measured only in the wrapper's own press. Opened by the `open` prop, the panel stays at opacity 0 under a full-screen backdrop that eats the next tap | Traced |
| H19 | bar-chart, combo-chart, metric-tabs | rn | bug | `react-native/src/data/bars.tsx:57,76,79,121-123` | Tap the last stack, then pass fewer rows: `tipRows(rows[11]!)` reads `undefined` and throws during render | Traced |
| H20 | attachment-card (voice) | both | api | `react/…/messaging/attachment-card.tsx:440,326-333`, RN `:417` | Play flips its own icon and reports nothing: there is no `onPlayingChange`, so the app can never start playback | Traced |
| H21 | radio-group, segmented-control | rn | a11y | `react-native/…/inputs/radio-group.tsx:158-162`, `actions/segmented-control.tsx:147` | The group label sits on a non-accessible View and the drawn legend is `aria-hidden`, so VoiceOver and TalkBack read the options without the question. WCAG 1.3.1, 4.1.2 | Traced; not run on a device |

---

## Medium

### Shared

| ID | Component | Kit | Type | Where | What happens | Checked |
|---|---|---|---|---|---|---|
| M1 | 10 components | react | a11y | see S6 | Focus drops to `<body>` when the pressed control unmounts, disables or goes inert | Traced |
| M2 | `useControllable` | core | bug | `core/src/state.ts:16-21` | An inline object or array value without its handler (`sort={{…}}`, `selected={["a"]}`) is a new identity each render, so the user's change is reset on every parent render | Traced |
| M3 | `announce` | react | a11y | `react/src/lib/announce.ts:27,36-41`, `lib/layer.tsx:150-156` | Two messages within 50 ms: the first is dropped. With `rootAttrs` on `<body>` and a modal open, the announcer is made inert, so errors and toasts are not read. WCAG 4.1.3 | Traced |
| M4 | nested provider | both | bug | `react/src/platform.tsx:99,110-113,144`, `react-native/src/theme.tsx:68` | A nested `AntFabricProvider` (the documented way to scope strings) resets platform, OS and scheme to web, browser, light: charts go light on a dark page | Traced |
| M5 | root props | both | api | `react/…/inputs/text-field.tsx:160`, `select.tsx:319`, `chip.tsx:117` and others | `id`, `aria-*` and `ref` land on a role-less wrapper. A product's `<label htmlFor>` points at nothing, and a form cannot move focus to its first invalid field. WCAG 4.1.2 | Traced |

### Inputs and actions

| ID | Component | Kit | Type | Where | What happens | Checked |
|---|---|---|---|---|---|---|
| M6 | search-field, text-field, select | both / rn | a11y | `react/…/inputs/search-field.tsx:77-79`, RN `text-field.tsx:204`, `select.tsx:166` | Inside a FormField the placeholder beats the visible label as the accessible name. WCAG 2.5.3 | Traced |
| M7 | search-field, select | react | bug | `react/…/inputs/search-field.tsx:117-124`, `select.tsx:296-298` | The Escape that clears the field keeps bubbling and also closes the overlay around it | Read |
| M8 | select | react | bug | `react/…/inputs/select.tsx:419,288-295` | Enter on the filter's clear button picks an option instead of clearing | Traced |
| M9 | select | react | bug | `react/…/inputs/select.tsx:196,211,251` | The cursor is not reset on close or after filtering: Enter can choose nothing, or choose the last hovered row | Traced |
| M10 | checkbox, chip, icon-button | react | a11y | `core/src/tokens.ts:1074,1093,1161` | Targets under 24px: a label-less checkbox is 15×23, a chip's ✕ and a small desktop IconButton are 20×20. Measured in the demo on desktop: banner Dismiss and upload Cancel are 20×20. WCAG 2.5.8 | Ran (two of them) |
| M11 | chip, segmented-control | rn | a11y | `react-native/…/inputs/chip.tsx:89,96,121` | The hitSlop meant to reach 44pt is clipped by the component's own same-height root | Suspected |
| M12 | text-field | rn | bug | `react-native/…/inputs/text-field.tsx:79-80,210` | `type="password"` always sets `textContentType: "password"`, so a sign-up field with `autoComplete="new-password"` is offered the saved password | Suspected |

### Overlays, navigation, system

| ID | Component | Kit | Type | Where | What happens | Checked |
|---|---|---|---|---|---|---|
| M13 | popover | react | bug | `react/…/overlays/popover.tsx:135-138,170` | A click inside anything portalled from the popover's content (an inner Dialog or Popover) bubbles to the root and closes the outer popover | Traced |
| M14 | context-menu | react | a11y | `react/…/overlays/context-menu.tsx:147,153`, `menu.tsx:207-211` | Quick reactions cannot be reached by keyboard (Tab closes the menu), and "+" does nothing. WCAG 2.1.1 | Traced |
| M15 | hover-card | react | bug | `react/…/overlays/hover-card.tsx:149-159,177` | Esc while closed still swallows the key; touch cannot open the card, so Message and View profile are unreachable | Traced |
| M16 | tooltip, hover-card | react | a11y | `react/…/overlays/tooltip.tsx:107-111` | A bubble opened by hover cannot be dismissed with Escape unless focus is inside its host. WCAG 1.4.13 | Traced |
| M17 | command-palette | react | bug | `react/…/overlays/command-palette.tsx:162-165,196,268` | After filtering, no row is highlighted but Enter selects the first; "No results" is mounted with its text and not announced | Traced |
| M18 | update-banner | react | a11y | `react/…/system/update-banner.tsx:132-134,184-186` | The stage is announced again every time the nav rail collapses or expands | Traced |
| M19 | bottom-sheet, sheet | both | a11y | `react/…/overlays/bottom-sheet.tsx:81,98-102`, RN `sheet.tsx:52` | A sheet with no title is an unnamed dialog; the caller's `aria-label` goes on the wrapper. WCAG 4.1.2 | Traced |
| M20 | bottom-sheet | both | api | RN `bottom-sheet.tsx:51-52,145`, web `:86-92` | The shipped root is the catalogue's demo stage (375 wide, 96 top padding), and the documented backdrop dismiss does not exist | Traced |
| M21 | dialog | rn | a11y | `react-native/…/overlays/dialog.tsx:133,147-151` | The escape gesture ignores `dismissible`; an arriving error is not announced on iOS | Traced |
| M22 | context-menu | rn | bug | `react-native/…/overlays/context-menu.tsx:94-124` | The emoji search box filters nothing (two hard-coded lists) | Traced |
| M23 | tabs | both | api | `react/…/navigation/tabs.tsx:103`, RN `:99` | The docs say an unmatched `value` draws no bar; both kits select the first tab, even a disabled one | Traced |

### Messaging, agent, feedback

| ID | Component | Kit | Type | Where | What happens | Checked |
|---|---|---|---|---|---|---|
| M24 | message, thread-summary | both | bug | `react/…/messaging/thread-summary.tsx:78-81`, `message.tsx:355-363` | Opening a thread from a message flips its "Following" mark | Traced |
| M25 | message | react | bug | `react/…/messaging/message.tsx:188,277-281` | The actions bar unmounts while its ⋯ menu is open, so the menu loses its anchor | Traced |
| M26 | composer, attachment-card | both | api | `react/…/messaging/composer.tsx:300,315-316` | `onAttachmentOpen` and `onAttachmentDownload` never fire for staged files: the chip has no pressable body | Traced |
| M27 | toast | both | bug | `react/…/feedback/toast.tsx:157-160`, RN `:94-97` | Pressing the action hides the toast but never fires `onDismiss`; it stays mounted and holds a slot | Traced |
| M28 | composer, message | both | a11y | `react/…/messaging/composer.tsx:264,270`, `message.tsx:366,390` | Offline and failed-to-send are mounted as live regions with their text instead of going through `announce()`; nothing is said on iOS. WCAG 4.1.3 | Traced |
| M29 | thinking-indicator | rn | a11y | `react-native/…/agent/thinking-indicator.tsx:183,188` | The word that rotates every 2.4 s is inside a live region | Suspected |
| M30 | toast | rn | bug | `react-native/…/feedback/toast.tsx:38-41` | The chip colour parser assumes six-digit hex: `#fff` becomes blue, `rgb(…)` becomes invalid | Traced |

### Display, notifications, shell

| ID | Component | Kit | Type | Where | What happens | Checked |
|---|---|---|---|---|---|---|
| M31 | in-app-banner | react | a11y | `react/…/notifications/in-app-banner.tsx:143-144` | An arriving banner is a live region mounted with its text and never announced; the phone kit announces. WCAG 4.1.3 | Traced |
| M32 | web-top-bar | react | bug | `react/…/shell/web-top-bar.tsx:207` | `compact` does not remove Recent history above 768px | Traced |
| M33 | tab-bar | rn | bug | `react-native/…/shell/tab-bar.tsx:421-431` | A squeezed bar draws nothing when `active` matches no tab, and there is no control to bring it back | Traced |
| M34 | card | react | bug | `react/…/display/card.tsx:42,98-121` | In an interactive card the stretched press target covers plain links, buttons and text inside it | Traced |
| M35 | app-menu-bar | react | a11y | `react/…/shell/app-menu-bar.tsx:133,160-163` | A checked entry is only a visible tick: no `menuitemcheckbox`, no `aria-checked`. WCAG 4.1.2 | Traced |
| M36 | avatar, sidebar-item, nav-rail | both | a11y | `react/…/display/avatar.tsx:90,119-123`, `shell/sidebar-item.tsx:123-131` | The agent marker and presence are colour and shape only, not in the accessible name. WCAG 1.1.1, 1.4.1 | Traced |
| M37 | list-item, app-badge, in-app-banner, sidebar-section, permission-prompt, message, thread-summary, message-divider, skeleton | both | api | `react/…/display/list-item.tsx:160-166` and others | The kit's `aria-label` is written after the pass-through spread, so the product's name is dropped | Traced |
| M38 | sidebar-section | react | parity | `react/…/shell/sidebar-section.tsx:14,58-60` | Rows in a section cannot offer their menu on the web; the phone has `onItemLongPress` | Traced |
| M39 | sidebar-item, sidebar-section | rn | bug | `react-native/…/shell/sidebar-item.tsx:140-143` | The long-press handler is always attached, so a hold swallows the press and every row advertises an "Options" action that does nothing | Traced |
| M40 | badge | both | a11y | `react/…/display/badge.tsx:56-61`, RN `:52` | `live` does not announce a count change. WCAG 4.1.3 | Traced |

### Data

| ID | Component | Kit | Type | Where | What happens | Checked |
|---|---|---|---|---|---|---|
| M41 | line-chart, bar-chart (`niceScale`) | core | bug | `core/src/chart/scale.ts:85-91` | Values near 1e16 with a small range loop forever; from about 1e12 the ticks are duplicates | Ran (reviewer) |
| M42 | chart tokens | both | a11y | `core/src/tokens.ts:709-757` | In light scheme several marks are under 3:1 on the card: `chart.previous` 1.34, `chart.track` 1.14, `chart.other` 1.87, `series2/4/6/7` 2.5 to 2.7, `data.warning` 2.35. WCAG 1.4.11 | Ran (reviewer, computed) |
| M43 | gauge-chart | both | bug | `react/…/data/gauge-chart.tsx:123,128-130` | `value={58} max={100}` with the default percent format prints `5,800%` | Traced |
| M44 | metric-value, kpi-card, table | core | api | `core/src/chart/format.ts:13-14,63` | `currency` always rounds to whole units: `19.99` prints `$20`, with no option for cents | Ran |
| M45 | gauge-chart, meter | both | a11y | `react/…/data/gauge-chart.tsx:63,70-76`, `meter.tsx:36,49` | Caution and critical are colour only by default. WCAG 1.4.1 | Traced |
| M46 | line-chart, bar-chart, radar-chart | both | a11y | `react/…/data/line-chart.tsx:67`, `radar-chart.tsx:95` | Series are told apart by hue alone by default (`marks` defaults to false). WCAG 1.4.1 | Traced |
| M47 | every chart summary | core | a11y | `core/src/chart/summarize.ts:63-72` | The screen-reader sentence is wrong for 0 to a negative ("rose"), for NaN, and for numeric strings. WCAG 1.1.1 | Ran (reviewer) |
| M48 | bar-chart, combo-chart, metric-tabs | rn | bug | `react-native/src/data/bars.tsx:78-84` | The dimming and tooltip from a tapped bar can never be dismissed. WCAG 1.4.13 | Traced |
| M49 | period-compare, metric-tabs | rn | parity | `react-native/…/data/period-compare.tsx:102` | `nativeID`, `accessibilityLabel` and `ref` are dropped | Traced |
| M50 | donut-chart | both | a11y | `react/…/data/donut-chart.tsx:127-145`, RN `:104-122` | Web: the hide toggle is 14×16px inside another button. Phone: the switch is nested in an accessible Pressable and is likely unreachable. Measured in the demo: legend toggles are 20px tall. WCAG 2.5.8 | Ran (size); phone Suspected |
| M51 | table | both | api | `react/…/data/table.tsx:381,485,575` | Rows without the `rowKey` field all get the id `"undefined"`: ticking one box ticks every row | Traced |

### Foundations and packaging

| ID | Component | Kit | Type | Where | What happens | Checked |
|---|---|---|---|---|---|---|
| M52 | `formatShortcut` | core | bug | `core/src/format.ts:29,39` | `formatShortcut("Mod++", "windows")` throws: a render crash for any menu item with that shortcut off the Mac | Ran |
| M53 | `createStyles` | rn | bug | `react-native/src/theme.tsx:93-103` | The per-component style cache grows without bound under a live theme picker | Traced |
| M54 | `fontScale` | rn | a11y | `react-native/src/lib/type.ts:51-66` | Control text is capped at 1.5× and chrome at 1.3×, and the large-content viewer the comment relies on is not wired anywhere. WCAG 1.4.4 | Traced |
| M55 | theme sheets | react | bug | `react/src/platform.tsx:163-167` | Each distinct theme id leaves a `<style>` in `<head>` for the life of the page (the demo's colour picker makes one per colour) | Suspected |
| M56 | CONSUMING.md §4 | packaging | consumer | `core/src/tokens.ts:1501-1504` | A phone app on the AntFabric theme that loads only Figtree, as the guide says, has no chart font: charts ask for Geist | Traced |

---

## Low

All Traced unless marked.

### Inputs and actions

| ID | Component | Kit | Where | What happens |
|---|---|---|---|---|
| L1 | select | both | `react/…/inputs/select.tsx:424-428` | "No matches" is never announced |
| L2 | select | rn | `react-native/…/inputs/select.tsx:192-224` | Docs promise the search field focused and focus returned to the trigger; neither happens |
| L3 | chip | both | `react/…/inputs/chip.tsx:123,127-130` | A suggestion chip latches into its selected look after one press |
| L4 | chip | both | `react/…/inputs/chip.tsx:85,131-136` | The chip hides itself whatever `onRemove` decides; a held Backspace removes a run of chips |
| L5 | segmented-control | react | `react/…/actions/segmented-control.tsx:128-137` | Alt+Arrow and Cmd+Arrow are swallowed |
| L6 | select | react | `react/…/inputs/select.tsx:306-312` | Type-ahead reacts to Cmd+C. Space may reopen the panel in Firefox (Suspected) |
| L7 | text-field | rn | `react-native/…/inputs/text-field.tsx:206` | `required` with a `tag` reads the tag and never says "required" |
| L8 | icon-button, select, segmented-control | react | `react/src/lib/interaction.ts:58-66` | Throws under jsdom (no `matchMedia`, no `ResizeObserver`), so a consumer's Jest or Vitest tests fail |
| L9 | text-field | react | `react/…/inputs/text-field.tsx:211-219` | The reveal button changes both its name and `aria-pressed`: "Hide password, pressed" |
| L10 | segmented-control | react | `react/…/actions/segmented-control.tsx:75-85` | `role="tab"` with no id and no `aria-controls`, so it cannot be tied to a panel. Seen live in the demo |
| L11 | segmented-control | rn | `react-native/…/actions/segmented-control.tsx:112-144` | The lens drag is rebuilt mid-gesture when the parent re-renders (Suspected) |
| L12 | fab | rn | `react-native/…/actions/fab.tsx:62-73` | A wiggling Fab still fires after it is disabled |
| L13 | switch | react | `react/…/inputs/switch.tsx:53-58` | Inside a FormField it ignores the field's invalid and required state |

### Overlays, navigation, system

| ID | Component | Kit | Where | What happens |
|---|---|---|---|---|
| L14 | menu | react | `react/…/overlays/menu.tsx:121-142` | A link row does not activate on Space |
| L15 | dialog, sheet | react | `react/src/lib/layer.tsx:78-86` | Any pointerdown on the scrim cancels, including its scrollbar and right-click (Suspected) |
| L16 | popover, update-banner, bottom-sheet | rn | `react-native/…/overlays/popover.tsx:131-132` | Backdrop is a button named "Open"; restart sheet takes no accessibility focus; closed sheet is hidden on iOS only |
| L17 | tabs | rn | `react-native/…/navigation/tabs.tsx:121` | The consumer's `ref` is discarded |
| L18 | update-banner, connection-banner, breadcrumbs | react | `react/…/system/update-banner.tsx:163` | The accessible name leaves out the visible text ("Try reconnecting now" over "Try now"). WCAG 2.5.3 |
| L19 | sheet, popover, context-menu | both | RN `sheet.tsx:53`, `popover.tsx:109` | Kit differences the docs do not mention: ✕ needs a title on the phone; the phone popover never re-measures on rotation |
| L20 | stacked modals | react | `react/src/lib/layer.tsx:152` | The lower modal's layer is not made inert |

### Messaging, agent, feedback

| ID | Component | Kit | Where | What happens |
|---|---|---|---|---|
| L21 | message | react | `react/…/messaging/message.tsx:254-258` | On touch, the actions bar can stay open on several rows (Suspected) |
| L22 | reaction-pill | react | `react/…/messaging/reaction-pill.tsx:102,112-117` | An empty who-reacted card opens on hover and focus |
| L23 | thinking-indicator | react | `react/…/agent/thinking-indicator.tsx:120-136` | Without steps it has no accessible content |
| L24 | typing-indicator | rn | `react-native/…/messaging/typing-indicator.tsx:37-53` | The dot animations loop while nobody is typing |
| L25 | attachment-card | rn | `react-native/…/messaging/attachment-card.tsx:187` | Upload percent is a live region (Suspected) |
| L26 | attachment-card | rn | `react-native/…/messaging/attachment-card.tsx:402,306` | `removable` is ignored for links; `Linking.openURL` opens any scheme the message carried |
| L27 | composer | react | `react/…/messaging/composer.tsx:259,221` | With `sendKey="mod-enter"` the edit hint still says Enter saves |
| L28 | composer | both | `react/…/messaging/composer.tsx:204,372` | The "waiting for the upload" announcement cannot be reached by a press |
| L29 | toast | react | `react/…/feedback/toast.tsx:109-120` | A new `message` on a mounted toast does not restart its clock |
| L30 | skeleton | both | `react/…/feedback/skeleton.tsx:97-103` | An invisible skeleton is still exposed as "Loading" |
| L31 | message-actions | react | `react/…/messaging/message-actions.tsx:116` | ⋯ is exposed as a toggle, not a menu button |
| L32 | progress-bar | both | `react/…/feedback/progress-bar.tsx:40` | `value` defaults to 40: an upload with no value yet draws and announces 40% |
| L33 | skeleton | rn | `react-native/…/feedback/skeleton.tsx:156` | The row's lead ignores `lines={1}` |
| L34 | swipe-row | rn | `react-native/…/messaging/swipe-row.tsx:174-181` | A drag that starts on an open row can jump (Suspected) |
| L35 | empty-state | react | `react/…/feedback/empty-state.tsx:107` | The title is always an `<h2>` |
| L36 | composer link cards | both | `react/…/messaging/attachment-card.tsx:347-403` | Link cards never call `onOpen` |

### Display, notifications, shell

| ID | Component | Kit | Where | What happens |
|---|---|---|---|---|
| L37 | sidebar-section | both | `react/…/shell/sidebar-section.tsx:69,127-131` | Add and Options buttons are drawn with no handlers |
| L38 | tab-bar, os-notification | rn / react | `react-native/…/shell/tab-bar.tsx:195-212` | The floating action ignores `disabled` and `badge` |
| L39 | avatar | both | `core/src/format.ts:50-57` | An emoji first character becomes a broken glyph ("�R") |
| L40 | avatar-stack | both | `react/…/display/avatar-stack.tsx:51-52` | +N is wrong when the preview is shorter than `max` (2 faces, total 10: "+7") |
| L41 | notification-schedule | both | `react/…/notifications/notification-schedule.tsx:158` | Pause works with empty fields: "Paused until , " |
| L42 | title-bar | react | `react/…/shell/title-bar.tsx:150` | Minimise, Maximise and Close are `tabIndex={-1}` (Suspected: depends on the host window) |
| L43 | workspace-switcher | react | `react/…/shell/workspace-switcher.tsx:161-176` | With no workspaces the menu cannot be entered by Tab; Space on a row scrolls the page |
| L44 | workspace-switcher | rn | `react-native/…/shell/workspace-switcher.tsx:73-75` | The activity dot is not in the row's name |
| L45 | nav-rail | react | `react/…/shell/nav-rail.tsx:306,330-360` | Collapsed with a `title` and no `logo`: an empty focusable button |
| L46 | tray-menu, app-menu-bar | react | `react/…/shell/tray-menu.tsx:229` | A key containing `"` or `\` throws in `querySelector` |
| L47 | in-app-banner | both | `react/…/notifications/in-app-banner.tsx:157` | The open button's name drops the queue count, lead and time, and reads "Title: . Open" with no body |
| L48 | tab-bar | rn | `react-native/…/shell/tab-bar.tsx:178-185` | The squeezed disc is 42pt with no hitSlop |
| L49 | title-bar, web-top-bar | react | `react/…/shell/title-bar.tsx:77-78,92-93` | Physical sides are not mirrored in RTL |
| L50 | os-notification | react | `react/…/notifications/os-notification.tsx:298,426` | In the browser picture a reply action marked `rest` is a dead button |
| L51 | os-notification | rn | `react-native/…/notifications/os-notification.tsx:123` | Part testIDs are literals, so two banners share ids |
| L52 | sidebar-item | react | `react/…/shell/sidebar-item.tsx:107,182` | The invisible ⋮ takes taps on touch screens (Suspected) |
| L53 | notification-item | react | `react/…/notifications/notification-item.tsx:262` | Row actions are about 22px tall (Suspected) |
| L54 | title-bar, web-top-bar | react | `react/…/shell/title-bar.tsx:106,123` | The search button is named "Search" whatever its placeholder shows |
| L55 | mobile-header | rn | `react-native/…/shell/mobile-header.tsx:115-118` | Coming back online is not announced |

### Data

| ID | Component | Kit | Where | What happens |
|---|---|---|---|---|
| L56 | pagination | react | `react/…/data/pagination.tsx:58-66` | The pager takes focus when the page changes while nothing is focused |
| L57 | metric-tabs | react | `react/…/data/metric-tabs.tsx:119-121` | Ids come from the title with `\W`, so two non-Latin titles collide |
| L58 | line-chart | rn | `react-native/src/data/lines.tsx:57-61` | With `marks`, the plot draws two marker shapes while the legend shows five |
| L59 | delta, metric-value | rn | `core/src/chart/format.ts:60-63` | Signed and compact formats rely on Intl options Hermes may not support (Suspected) |
| L60 | meter | both | `react/…/data/meter.tsx:42-43,49` | A `score` meter with no value shows the critical icon |
| L61 | "View as table" | core | `core/src/chart/table.ts:40` | A data field named `key` is overwritten with `row-0` |
| L62 | period-compare | rn | `core/src/chart/parts.ts:46-50` | The spoken change ignores the locale (`11.3%` beside `11,3 %`) |
| L63 | line-chart, spark-bars | rn | `react-native/src/data/lines.tsx:52` | `null` values and all-negative bars are passed to gifted-charts unguarded (Suspected) |
| L64 | formats | core | `core/src/chart/format.ts:62,68,73` | `-0.0 pts`; `-2m -30s`; `"abc"` prints `NaN` (Ran) |
| L65 | sort | core | `core/src/chart/grid.ts:107` | Invalid dates are not sorted last |
| L66 | kpi-card, goal-rings, donut-chart, sparkline, table (rn), metric-tabs (rn) | both | several | Smaller gaps: a shortened KPI gives the screen reader the compact figure; goal rings clamp 116% to 100% in the centre; duplicate labels collide; `points` and `duration` words are always English; the phone table always draws its sort bar |
| L67 | pagination | both | `react/…/data/pagination.tsx:93` | `jump` builds one Select item per page on every render |

### Foundations and packaging

| ID | Component | Kit | Where | What happens |
|---|---|---|---|---|
| L68 | `useInteraction` | react | `react/src/lib/interaction.ts:42` | Focus-visible is sampled once at focus: click, then use the keyboard, and no ring appears (Suspected) |
| L69 | `useInteraction` | react | `react/src/lib/interaction.ts:33-37` | Hover can stay stuck after disable and re-enable (Suspected) |
| L70 | kit stylesheet | react | `react/src/platform.tsx:159` | The sheet's `href` is the same for every kit version, so a host and a plugin on different versions share the first one |
| L71 | CONSUMING.md §8 | packaging | `CONSUMING.md` | The guide says no `className`, `ref`, `aria-*` or `data-*` passes through; the kit passes them |
| L72 | build output | packaging | `scripts/build-packages.mjs:41-54` | No source maps; no `nonce` for the injected sheets under a strict CSP |
| L73 | `defineTheme` | core | `core/src/native.ts:50-59` | `"0.5rem"` is accepted and reaches a React Native style as a string. Also: `formatShortcut("Mod+K", "browser")` gives Ctrl+K on a Mac unless the app passes `os` |

---

## Fix plan

Ordered so that shared fixes land first. Each batch is one pull request to `main`, and **every merge publishes a patch to npm**, so each needs a `CHANGELOG.md` line. Batches 1, 4 and 6 change behaviour a consumer could depend on and may deserve a minor version.

| # | Batch | Closes | Approach | How it is proved |
|---|---|---|---|---|
| 1 | Controlled state | H1, M2, pagination, notification-schedule | Stop defaulting a controllable prop in the destructuring; pass the raw prop to `useControllable` and default the result (as `text-area.tsx` does). Compare arrays and plain objects by content in the seed check | New rule in `pnpm check conventions`: no destructuring default on a prop passed to `useControllable`. New re-render probe: mount with the handler only, press, expect the state to move |
| 2 | Focus, Escape, IME in `react/src/lib` | H3, H4, H5, M1 (the `restore` part), L20 | `focusables()`: require `el.tabIndex >= 0`, drop hidden inputs, check `getClientRects()`. Layer Escape: in-place overlays register a `useLayerStack` entry while open, so the innermost closes first. One `isComposing(e)` helper (`isComposing \|\| keyCode === 229`) used by every Enter and Escape handler. `useOverlayFocus` takes a fallback when the opener is gone | Fix the same selector in `rerender.tsx:115`; add key probes: Select inside Dialog + Esc; Tab from a dialog whose last control is a RadioGroup. `focusTodo` and `keysTodo` stay empty |
| 3 | Theme sanitiser | H10, L73 | Reject control characters and `url(`, `image(`, `image-set(`, `src(`, `@`, `!` in `flaw()`; validate brand `soft`, `tint` as colours; reject non-px lengths for sets the phone reads | Add the two failing inputs to the `throws(…)` cases in `pnpm check themes` |
| 4 | Packaging | H11, H12, H13, L72, M56, L71 | `"use client"` banner on the react entries and core's root; bundle declarations per entry or emit `.js` extensions; let `Icon` take a component as well as a name and resolve names through a registry the app fills; source maps; correct CONSUMING.md §4 and §8 | Add a `nodenext` consumer and a bundle-size ceiling to `pnpm verify:packages` |
| 5 | Data core | H8, H9, M41, M43, M44, M47, M51, L60, L61, L64, L65 | `whenOf`: accept ISO strings, treat date-only as a calendar date. `niceScale`: build ticks by index with a cap. Gauge reuses `meterReading`. `currency` honours `digits`. `summarize` coerces and filters with `Number.isFinite`. Table falls back to the row index | `pnpm check chart`: add each input from this file as a case |
| 6 | Optimistic state | H2, H20, M24, M27 | Needs the owner decision below first. Then: components stop flipping state they do not own, or each declares the event that makes it controllable (`onPlayingChange`, `onStateChange`, `onDismissedChange`) | Re-render probe per component: press, keep the prop unchanged, expect the pending state and not the final one |
| 7 | Announcements | M3, M17, M28, M31, M40, L1, L55 | Queue messages in `announce`; exclude the announcer from `inert`; replace mounted-with-text status regions with an `announce()` call in an effect | A check that no component mounts `role="status"` together with its text |
| 8 | Focus hand-off | M1 | `useFocusHandoff` (already in `lib/focus.ts`) in the ten places listed in S6; QuestionPanel uses Button's `loading` | Extend the focus probe: after activating, `document.activeElement` is not `body` |
| 9 | Pass-through props | M5, M19, M37, M49, L17, L51 | Spread `rootProps(rest)` after the kit's attributes; for single-control composites route `id`, `aria-*` and `ref` to the element that has the role | Extend `pnpm check generic`: a passed `aria-label` and `id` must reach the role-bearing element |
| 10 | Contrast and target size | H14, H15, M10, M42, M45, M46, M50, L48, L53 | Needs the owner decision below (the look is held by parity). Then: token changes in `tokens.ts`, `marks` on by default, 24px minimum targets, drop inline `outline: none` on inputs | A contrast check over token pairs in `pnpm check tokens`; accept the changed keys in `reports/parity.json` with a reason |
| 11 | React Native overlays | H16, H17, H18, H19, M20, M21, M22, M33, M39, M48 | `useBackHandler` keeps `onBack` in a ref; BottomSheet takes `dismissible`; Popover measures in an effect on `shown`; `GiftedBars` clamps `active` | Needs a device or simulator pass; the server render cannot see these |
| 12 | Per-component fixes | the remaining Medium and Low rows | One pull request per category | `pnpm check <id>` and an added edge case in the component's docs where one is missing |

Suggested order: 3 (security) and 1 first, then 2, 4, 5. Batches 6 and 10 wait on decisions.

## Owner decisions

Worded to file as GitHub issues. None has been filed.

1. **Should a component ever show a result before the app confirms it?** Today Dialog, SessionState, UpdateBanner, PermissionPrompt, NotificationItem, Message, AttachmentCard and ReactionPill flip their own state on press and cannot go back when the app answers with the same value (S2). Options: never flip (the app drives every state), or keep the optimistic flip and add an explicit event or reset signal to each.
2. **AntFabric's brand colour fails contrast with white text.** `#FE4632` with white is 3.42:1 (H14); body text needs 4.5:1. Options: darken the brand fill used behind text, switch `fg.onBrand` to a dark ink for this brand, or make `fg.onBrand` pick by contrast for every theme. Any of them changes renders held by `reports/parity.json`.
3. **Chart palette in light scheme.** `chart.previous`, `chart.track`, `chart.other`, four series colours and `data.warning` are under 3:1 (M42). Changing them moves parity keys for every chart.
4. **`marks` on by default** for multi-series charts (M46), and Meter's state icon on by default (M45). Both change the default look.
5. **Icon loading.** The kit bundles all of lucide into every app (H13). A registry or component-valued `icon` prop changes the API of every component that takes an icon name.
6. **`Tabs` with an unmatched `value`**: the docs say nothing is selected, both kits select the first tab (M23). Pick one.
7. **`BottomSheet`'s 375-wide demo frame** ships in the kit (M20). Moving it to the catalogue changes what the component draws.
8. **Minimum pointer target on desktop.** Small IconButton, chip remove and checkbox are 20px or less (M10). 24px changes the desktop density.

## Unconfirmed

These depend on behaviour that was not run. Treat them as leads.

- **Needs a phone or simulator:** H16, H17, H18, H19, H21, M11, M12, M21, M29, M50 (phone part), L11, L25, L34, L59, L63.
- **Needs a screen reader:** how each reader treats live regions mounted with their text (M28, M31, M40), H21.
- **Needs a specific browser:** Safari IME on TextField (S5), Firefox Space on Select (L6), forced colours on Windows (H15), focus-visible after a click (L68), scrim scrollbar (L15), touch (L21, L52).
- **Needs Next.js:** H12 was confirmed as an absence of `"use client"`, not by running the App Router.
- **React behaviour assumed:** hoisted theme `<style>` elements are not removed (M55).

## What was already right

Worth knowing so fixes do not regress it, all observed live in the demo app: labels are associated with their fields, the Select exposes `aria-expanded`, `aria-controls` and `aria-activedescendant` and returns focus to its trigger on Escape, progress bars carry their values, charts have a text summary, a "View as table" button and arrow-key reading, the Neutral theme and a custom indigo brand pass text contrast in both schemes, and the page logs no console errors.
