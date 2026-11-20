---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

NavRail: `section="none"` lights no section row in the drill-in variant (as `active="none"` lights no destination), for a page of a destination that belongs to none of its sections; any other unknown key still makes the first section current. The root no longer has `min-height: 680px`: that was the catalogue's stage height, and it made an app's rail taller than a short window (the catalogue's rail window now sets it). An app's rail fills the height it is given, and its destination list scrolls. The nav-rail and full-screen snapshots that contain it moved (accepted in parity with this reason).
