---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

Dialog: `modal` (default `false`) and `dismissible` (default `true`). With `modal` the web and desktop dialog is drawn in the overlay layer of its AntFabricRoot: the scrim covers the window, the page behind does not scroll (the body and the box the page scrolls in, counted for stacked dialogs) and the rest of the root is inert and hidden from assistive tech; only the top dialog takes Esc and a press on the scrim, which cancel it. The phone draws it in a transparent Modal over the app, with a press above the sheet cancelling. `dismissible: false` turns off Esc, the scrim, the phone's handle and Android's back, for a step that must be answered with a button. Without `modal` nothing changes: the dialog is drawn where it is mounted, and no snapshot moved.
