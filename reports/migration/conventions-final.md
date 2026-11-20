# Conventions pass: the last fixes (`reports/api/conventions.md`)

The final pass over what the area passes left open. No render hash moved. `conventionsTodo` and `stylesProofTodo` in `reports/generic.json` are empty.

## A prop the component changes is `on<Prop>Change`; a press stays an action (rule 1)

Seven events were declared `changes:` under a press's name. Each kit really flips the prop itself, so each gets its `on<Prop>Change(next)` (declared `changes:`, through `useControllable`), and the old event stays as an action: no argument, no `changes:`, fired on every press.

- Chip: `onPress(selected)` → `onSelectedChange(selected)`; `onPress()` is new (the press).
- IconButton: `onPress(active)` → `onActiveChange(active)`; `onPress()` is new. `onActiveChange` fires only for a `toggle` button (a one-shot button never changed `active`); `onPress()` fires for both.
- ListItem: `onPress(selected)` → `onSelectedChange(selected)`; `onPress()` is new. The row flips `selected` itself on a press, as before (a ticked checkbox or option row, a filled link), so it is the row's to report.
- ReactionPill: `onPress(mine)` → `onMineChange(mine)`; `onPress()` is new. The add pill fires `onPress()` only.
- ThreadSummary: `onPress(following)` → `onFollowingChange(following)`; `onPress()` is new (opens the thread).
- AttachmentCard: `onRetry(status)` → `onStatusChange(status)`; `onRetry()` is new (Retry was pressed).
- Message: `onRetry(status)` → `onStatusChange(status)`; `onRetry()` is new (also fired by the phone's "retry" accessibility action).
- Callers that passed `onPress={(next) => …}` to read the new value pass `onXChange` instead. The kits' own: AttachmentCard's voice play button and MessageActions' ⋯ toggle read `onActiveChange`.
- Control: a component was controlled when it was given its prop and the old press event. It is now controlled when given its prop and `on<Prop>Change`. Message and Composer give a card `status` and a no-op `onStatusChange` when `onAttachmentRetry` is passed, so a card still waits for the app's `status`, as before.

## Other `on<Prop>Change` (rule 1)

- NotificationSchedule: new `onPausedChange(paused)`, declared `changes: "paused"`: called when a choice pauses (only if it was not paused) and when Resume ends the pause. `onPause(key)` and `onResume()` are unchanged. Both kits.
- UpdateBanner: new `onStageChange(stage)`, declared `changes: "stage"`: the kit moves `stage` itself, to `downloading` after Install or Retry (web, desktop) and to `checking` after Check again (phone). `onApply`, `onRestart` and `onCheck` are unchanged. Both kits.

## An item is named by `key` (rule 2)

- Select: `activeId` → `activeKey` (it holds an item's key; this replaces the "keeps its name" line in `conventions-base.md`).
- Table: `columns[i].id` → `columns[i].key` (`TableColumn.id` → `TableColumn.key`, in core, both kits and the docs). `sort.column` and `onSortChange` still hold that key. Core's `chartTable` returns columns with `key`.
- MetricTabs: `Metric.field` stays. It names the data field and is the metric's key (the one exception, written under rule 2 in `conventions.md`).

## Strings (rule 5)

- ProgressBar: `retryUpload` takes `{name}`, not `{title}`: `{ retryUpload: "Réessayer l'envoi de {title}" }` → `{ retryUpload: "Réessayer l'envoi de {name}" }`. The default, "Retry upload of {name}", reads as before.

## Parts

- PermissionPrompt (phone): the bottom-sheet form is drawn by `GlassSurface`, which now carries `permission-prompt.root`, so `styles.root` is proven on it. No drawing added.
- WorkspaceSwitcher (phone): the recipe part `sheet` is gone; the phone's bottom sheet is the `root` (a recipe variant on `root`, `platforms.mobile`), so `styles.root` reaches it. `styles={{ sheet }}` → `styles={{ root }}`; `testID` `workspace-switcher.sheet` → `workspace-switcher.root`. Web and desktop keep their `root`.

## For the codemod

- `<Chip onPress={(sel) => …}>`, `<IconButton onPress={(on) => …}>`, `<ListItem onPress={(sel) => …}>`, `<ReactionPill onPress={(mine) => …}>`, `<ThreadSummary onPress={(f) => …}>`: when the handler reads its argument, rename the prop to `onSelectedChange` / `onActiveChange` / `onSelectedChange` / `onMineChange` / `onFollowingChange`; when it ignores it, leave `onPress`.
- `<AttachmentCard onRetry>` and `<Message onRetry>`: the same, to `onStatusChange`.
- `columns={[{ id: "arr", … }]}` → `{ key: "arr", … }` on Table.
