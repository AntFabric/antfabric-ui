---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

RadioGroup: `appearance="cards"` draws each option as a selectable card (web, desktop and phone). An option can carry a `preview` (a node drawn at the top of the card) and `tags` (`{ label, tone? }[]`, the kit's Tag chips after the label); both are read by the cards only. The chosen card takes a 2px edge in the strong ink (not the brand), hover takes the edge to `border.default`, a disabled card is dimmed and cannot be chosen, and radio semantics and the arrow keys are unchanged. Web and desktop lay the cards out in as many columns of at least the new token `radioGroup.cardMinW` (220) as fit; the phone stacks them one per row. New recipe parts `card`, `cardPreview`, `cardHead`, `cardLabel`, `cardTags`, `cardDescription`; new exported type `RadioGroupOptionTag`; the phone kit now takes `appearance` too (`pills` is drawn as the list there, as before). Additive: the list and the pills draw exactly as before.
