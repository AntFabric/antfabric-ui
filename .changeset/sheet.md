---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

Sheet: a new overlay in both kits, exported from the root entry: a panel that slides in from the side of the window over a scrim (a record's details, a short form, a navigation drawer). It takes `open` / `onOpenChange`, `side` (`start` | `end`, default `end`), `width` (0 = the new `sheet.w` token, 480), `title`, `subtitle`, `children` (the body, which scrolls), `footer` (actions), `showClose`, `label` (its name without a title) and `dismissible`. On web and desktop it is always modal, drawn in the overlay layer: Tab wraps inside, Esc and a press on the scrim close it (top overlay only), the page's scroll is locked and the rest of the root is inert. The phone draws the BottomSheet (drawn where it is mounted, as the BottomSheet is). Recipe `sheet` (`root`, `panel`, `header`, `title`, `subtitle`, `close`, `body`, `footer`); new token `sheet.w`; strings `sheet.label` ("Panel"). Additive: nothing existing changes.
