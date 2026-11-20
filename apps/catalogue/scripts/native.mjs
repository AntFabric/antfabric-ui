/**
 * Lets Node render the React Native kit the way the catalogue does: `react-native` is
 * react-native-web, lucide's native icons are its DOM ones, and react-native-svg and the linear-gradient
 * packages are the stubs in src/preview/stubs. Loaded with `tsx --import`.
 *
 * The hooks are the synchronous kind (`registerHooks`), not `register`: react-native-gifted-charts is CommonJS, and
 * its `require("react-native")` only reaches react-native-web through a hook that sees `require` as well as `import`.
 */
import { registerHooks } from "node:module";
import { resolve } from "./native-hooks.mjs";

registerHooks({ resolve });
