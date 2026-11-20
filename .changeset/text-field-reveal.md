---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

TextField: `reveal` (default `false`). With `type="password"` it draws a Show / Hide button (the kit's ghost Button) at the end of the field, after any `trailing`: on, the characters are shown (the web input becomes `type="text"` for that time, still left to right; the phone turns `secureTextEntry` off) until it is pressed again. Its accessible name is "Show password" / "Hide password" and the web sets `aria-pressed`. New `text-field` strings: `show`, `hide`, `showLabel`, `hideLabel`. A new catalogue example ("Password with Show") adds renders to TextField's snapshot keys; no existing render changed (checked by running the docs without it). Additive.
