---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

Popover: a new overlay in both kits, exported from the root entry: a panel that hangs from the control that opened it (a menu, a short form, a list). It takes `content`, `open` / `onOpenChange`, `side` (`top` | `bottom` | `left` | `right`, default `bottom`), `align` (`start` | `center` | `end`), `width`, `matchTrigger`, `label`, `bare` (no card, for a Menu), `modal`, `showTrigger`, `triggerLabel` and `children` (the trigger). On web and desktop the open panel is drawn in a new internal overlay layer: a fixed, full-window box rendered into the nearest AntFabricRoot (so the theme applies and no overflow clips it), placed from the trigger, flipped where there is no room, re-placed on scroll and resize, closed by Esc and a press outside (only the top overlay takes them), with focus moved in and back; `modal` traps Tab and makes the rest of the root inert. On the phone it is a transparent Modal placed with measureInWindow. Recipe `popover` (`root`, `panel`); no new token (it reads `z.popover`). Additive: nothing existing changes.
