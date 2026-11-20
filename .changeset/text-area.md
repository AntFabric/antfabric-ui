---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

TextArea: a new input in both kits, the multi-line sibling of TextField, exported from the root entry. It takes `label` (required), `value` or `defaultValue`, `placeholder`, `rows` (4), `mono` (the `font.mono` face, for code, JSON and templates), `readOnly`, `disabled`, `required` (a "Required" tag, as TextField), `helper`, `error` with `invalid`, `maxLength` with a counter, `hideLabel`, `onValueChange` and `onBlur`; on web and desktop also `name` and `resize` ("vertical" or "none"). Its recipe `text-area` has TextField's parts and states (`root`, `label`, `tag`, `field`, `input`, `error`, `errorIcon`, `errorText`, `helper`, `counter`) and reads TextField's tokens; no new token. Strings `text-area`: `required`, `characterCount`, `charactersLeft`, `limitReached`. Additive: nothing existing changes.
