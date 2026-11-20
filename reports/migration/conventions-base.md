# Conventions pass: base components (actions, inputs, display, feedback, overlays, navigation)

The renames of `reports/api/conventions.md` rules 1, 2 and 5 that fall on the 29 base components. Both kits, each rename the same on web, desktop and phone. Nothing here draws differently: no render hash moved.

## A changed value is `on<Prop>Change` (rule 1)

No component has `onChange` any more. Each event is declared `changes: "<prop>"` and goes through `useControllable`.

- TextField: `onChange={(value) => …}` → `onValueChange={(value) => …}` (`value` stays).
- SearchField: `onChange={(value) => …}` → `onValueChange={(value) => …}` (`value` stays; `onClear` and `onSubmit` are unchanged; the ✕ still reports `onValueChange("")` first).
- Checkbox: `onChange={(checked) => …}` → `onCheckedChange={(checked) => …}` (`checked` stays).
- Switch: `onChange={(checked) => …}` → `onCheckedChange={(checked) => …}` (`checked` stays).
- RadioGroup: `onChange={(value) => …}` → `onValueChange={(key) => …}` (`value` stays and now holds an option's `key`).
- Select: `onChange={(id) => …}` → `onValueChange={(key) => …}` (`value` stays and now holds an item's `key`). Its search box is a SearchField, so `onQueryChange` is unchanged.
- Tabs: `onChange={(id) => …}` → `onValueChange={(key) => …}` (`value` stays and now holds an item's `key`).
- SegmentedControl: `onChange={(id) => …}` → `onValueChange={(key) => …}` (`value` stays and now holds an item's `key`).

## An item is named by `key` (rule 2)

- Tabs: `items[i].id` → `items[i].key` (`TabsItem.id` → `TabsItem.key`); `value` is a key.
- SegmentedControl: `items[i].id` → `items[i].key` (`SegmentedControlItem.id` → `SegmentedControlItem.key`); `value` is a key.
- Select: `items[i].id` → `items[i].key` (`SelectItem.id` → `SelectItem.key`); `value` is a key. `activeId` keeps its name and now holds a key.
- RadioGroup: `options[i].value` → `options[i].key` (`RadioGroupOption.value` → `RadioGroupOption.key`); `value` is a key.
- Menu: unchanged. `MenuItem.key` still falls back to `label`.

## One shape per concept, every button fires something, shared string variables (rule 5)

- AvatarStack: `people` takes core's `Person[]`; `AvatarStackPerson` is removed (import `Person` from `@antfabric/ui-react` or `@antfabric/ui-react-native`). `{ name, identity, src }` is still a valid `Person`; `agent` and `presence` on a person are ignored at stack sizes, as before.
- BottomSheet: new `onPrimary`, fired by the primary button that `primaryLabel` draws (it fired nothing before).
- ProgressBar: the string `cancelUpload` takes `{name}`, not `{title}`: `strings={{ "progress-bar": { cancelUpload: "Annuler l'envoi de {title}" } }}` → `{ cancelUpload: "Annuler l'envoi de {name}" }`. The default, "Cancel upload of {name}", reads the same as before. `retryUpload` still takes `{title}`.
- Menu: no API change. Its `triggerLabel` is optional and, left out, reads the `moreActions` string ("More actions"); the docs' `default` is now that, and "More actions for #release-train" is the catalogue's `sample`.

## Docs and catalogue only (no kit change)

- A required prop has no docs `default`; the catalogue's value is its `sample`: Button, IconButton, Fab (`icon`, `label`), Checkbox, Switch, Tag, Chip, Avatar (`name`), ListItem (`title`), Kbd (`keys`), Toast, InlineBanner (`message`), EmptyState (`title`), Tooltip, Dialog (`title`), AvatarStack (`people`), Tabs, SegmentedControl, Select (`items`), RadioGroup (`options`).
- A default the kit does not have is now the kit's, with AntFabric's value as the `sample`: RadioGroup, SegmentedControl and Select `value` (`""`), RadioGroup, SegmentedControl and Select `label` (`""`), Tabs `label` (no default), Tabs `value` (`""`), Select `placeholder` (`""`) and `open` (`false`).
- The catalogue's screens (`mobile-notifications`, `mobile-notification-settings`, `desktop-notification-rail`) and `/theming` pass the new names. Table (data) is the one other component that draws a renamed one: its select-all and row Checkboxes pass `onCheckedChange`, and the phone's sort Select passes `items` with `key` and `onValueChange`.

## For the codemod

Rename props by JSX element, not by name alone (`onChange` is still a DOM event on `<input>`):

| Element | Rename |
| --- | --- |
| `TextField`, `SearchField` | `onChange` → `onValueChange` |
| `Checkbox`, `Switch` | `onChange` → `onCheckedChange` |
| `RadioGroup`, `Select`, `Tabs`, `SegmentedControl` | `onChange` → `onValueChange` |
| `Tabs`, `SegmentedControl`, `Select` | object keys `id` → `key` in the `items` array |
| `RadioGroup` | object keys `value` → `key` in the `options` array |
| `AvatarStack` | type `AvatarStackPerson` → `Person` |
| `strings["progress-bar"].cancelUpload` | placeholder `{title}` → `{name}` |
