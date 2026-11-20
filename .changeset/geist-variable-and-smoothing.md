---
"@antfabric-ui/core": minor
"@antfabric-ui/react": minor
"@antfabric-ui/react-native": minor
---

Lighter, truer Geist on the web and the desktop. `@antfabric-ui/core/fonts.css` now loads Geist as one variable face (`fonts/Geist-Variable.woff2`, weights 100 to 900) instead of four static woff2 files, so an in-between weight such as 450 draws as asked instead of snapping to 500; the static `Geist-*.ttf` files (the phone's) and `Geist-*.woff2` files still ship, unused by the sheet. `AntFabricRoot` sets `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale` and `text-rendering: optimizeLegibility` on its element, so macOS draws text with grayscale antialiasing, as the reference product does, instead of a step heavier; `style` on the root still overrides them. No font weight or size token changes, and the phone kit is unchanged.
