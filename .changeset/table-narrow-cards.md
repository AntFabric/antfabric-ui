---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

Table (web and desktop): a new prop `narrow` (`"scroll" | "cards"`, default `"scroll"`). With `"cards"`, while the table's own box is narrower than the new token `table.cardsBelow` (600, measured with a ResizeObserver, not the window), it draws the phone's card per row instead of the grid: the title column (in the strong ink), its badge and `renderActions` in the card's head, a label and value line for every other column, a sort bar (Select and a direction button) above and a compact pager under the cards; ticking, `onRowPress`, `renderCell`, loading and the empty state all work. The phone's card parts (`bar`, `barSort`, `cards`, `card`, `cardHead`, `cardTitle`, `cardLines`, `cardLine`, `cardLabel`, `cardValue`) now reach web and desktop. Additive: a table that does not set `narrow` draws exactly as before.
