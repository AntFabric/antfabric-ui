---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

ToastRegion: a new feedback component in both kits, exported from the root entry: where the app's toasts appear. It takes `side` (`top` | `bottom`, default `bottom`), `align` (`start` | `center` | `end`, default `center`), `max` (3, the newest kept) and `children` (the Toasts, oldest first). On web and desktop it is a "Notifications" landmark in the overlay layer at `z.toast`, above modal dialogs and sheets, with pointer events only on the toasts; a press on a toast is not a press outside an open dialog or popover. The phone draws the stack where it is mounted (the app lays it over its screen). Recipe `toast-region` (`root`); strings `toast-region.label` ("Notifications"); no new token (it reads `z.toast`). Additive.
