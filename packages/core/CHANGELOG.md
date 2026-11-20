# @antfabric-ui/core

## 1.1.0

### Minor Changes

- The component audit's fixes (168 findings: 132 fixed, 31 partly, 3 decided as rules for 2.0).

  Added, nothing renamed or removed:

  - **FormField**: a label, description, error and required around one control, which it gives an id, `aria-describedby`, `aria-invalid` and `aria-required`.
  - **Pass-through on every component** (`RootProps`): `id`, `className`, `data-*`, `aria-*` and `ref` on the web; `testID` (a prefix for the parts), `nativeID`, the accessibility label and hint and `ref` on the phone.
  - **Roots and providers** take `locale` (numbers, dates, currency and sorting), `dir` and, on the web, `autoFocus`. New hooks: `useLocale`, `useDirection`, and on the phone `useReducedMotion` and `fontScale`.
  - **New props**:
    - TextField: `type`, `autoComplete`, `name`, `inputMode`, `onSubmit`, `onBlur`, and phone secure entry.
    - Select: `name` and `onOpenChange`.
    - Button: `type`.
    - Toast: `duration` and `onPauseChange`.
    - Tooltip and HoverCard: `children`, `open` and `onOpenChange`.
    - Menu: `autoFocus`, plus href and radio rows.
    - ListItem and Card: `href`.
    - Tabs: `panels` and disabled tabs.
    - Avatar: `decorative`. Badge: `live` and `unread`.
    - Table: `total` (server-side paging and sorting), `renderCell`, `renderActions`, `onRowPress`, `maxHeight`, `currency`, column `maxWidth` and `wrap`, and phone `expanded`.
    - Pagination: `pageSizes`, `onPageSizeChange` and `jump`.
    - PeriodCompare: `inverse`.
    - ApprovalItem: `expired`, `failed`, `onRetry` and `expanded`.
    - Composer: `disabled`, `maxLength`, `autoFocus` and `avoidKeyboard`.
    - QuestionPanel: `autoFocus`. SwipeRow: `onPress`.
    - NavRail: `workspaceMenuOpen` and `profileMenuOpen`.
    - NotificationSchedule: `onCustomDateChange` and `onCustomTimeChange`.
    - MessageDivider: `expanded` and `level`.
    - Charts: `headingLevel`. LineChart: `marks`. Meter: `showState`. Sparkline and SparkBars: `format`.
  - **Token** `opacity.secondary` (0.7).

  Behaviour a product will notice:

  - **Keyboard and focus:**
    - Overlays move focus in when they open, keep Tab inside when modal, close on Escape and give focus back. A host drawing open overlays as pictures passes `autoFocus={false}`.
    - Menus, menubars, toolbars, tabs and radio groups move with the arrow keys.
    - Every control draws a keyboard focus state, and Windows High Contrast outlines it.
    - A message row is a tab stop that shows its actions.
  - **Announcements:** statuses are announced through one announcer on the web and through VoiceOver and TalkBack on the phone. Toast, the banners and Skeleton are no longer live regions mounted with their text, and Badge is no longer a live region by default.
  - **Defaults and layout:**
    - DonutChart's legend row picks its segment; the swatch now shows or hides it.
    - MobileHeader's `statusBar` and TabBar's `safeArea` default to false.
    - TitleBar's search is centred whatever its sides hold.
  - **Neutral theme** (the default; `antfabric` keeps 1.0's look):
    - Field edges are `border.default` (3:1).
    - Each size name draws one height across Button, Select, TextField and SearchField.
    - Desktop targets are at least 24px.
    - Faded text that fell under 4.5:1 is drawn at full ink, and the agent identity is a deeper coral.

- IconButton takes an optional `avatar` (`{ name, src?, identity?, presence? }`): a person's face fills the button in place of the icon, for a profile button. The face takes the button's size and shape on every platform, keeps the focus ring and badge, and is hidden from screen readers so `label` names the button once. A new `avatar` part restyles it. Without `avatar`, nothing changes.

## 1.0.0

### Major Changes

- 1.0: the kit is a generic base. With no theme every component draws `themes.neutral`; AntFabric's look is `themes.antfabric`, passed once as `theme` on `AntFabricRoot` or `ThemeProvider`. Light or dark is `scheme` (`Theme` is now the theme object; `brand` is part of a theme made with `defineTheme`). Every component takes `styles` (per part) and `strings` (the text the kit draws), and both roots take `strings` and `locale`. Containers take children instead of `content`. App chrome is `./shell` and the conversation is `./chat`, on both kits. One set of names across all 85 components: a changed value is `on<Prop>Change` (`onChange` is gone), an item is named by `key`, open or closed is `expanded`. `AppBadge` takes your product's `mark`; core no longer exports `ANTFABRIC_MARK`. `ProjectMoveCard` is removed.

  This breaks every consumer once, on purpose. `MIGRATION.md` has the short path (install 1.0, run the codemod `pnpm migrate:1`, keep AntFabric's look with `themes.antfabric`), and every break by area.
