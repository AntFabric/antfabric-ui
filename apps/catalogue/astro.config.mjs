// @ts-check
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const require = createRequire(import.meta.url);
/** @param {string} name */
const pkg = (name) => dirname(require.resolve(`${name}/package.json`));

/**
 * The catalogue draws the real components: `@antfabric/ui-react` for web and desktop, and
 * `@antfabric/ui-react-native` for mobile, through React Native Web. So `react-native` resolves to
 * react-native-web here, lucide's native icons to its DOM ones (same names, same props: a DOM
 * <svg> sits inside a React Native Web view as it would in react-native-svg), and react-native-svg
 * itself to the DOM's own elements (src/preview/stubs: every one gifted-charts draws with, not only <svg> and <path>), and the
 * linear-gradient packages gifted-charts throws without to a <div> with a CSS gradient.
 */
export default defineConfig({
  site: "https://ui.antfabric.dev",
  trailingSlash: "ignore",
  build: { format: "directory" },
  devToolbar: { enabled: false },
  integrations: [react()],
  // The one Markdown file the site renders is CONSUMING.md (`/install`); its code blocks take the catalogue's own style, not Shiki's.
  markdown: { syntaxHighlight: false },
  vite: {
    resolve: {
      alias: [
        { find: /^react-native$/, replacement: pkg("react-native-web") },
        { find: /^lucide-react-native$/, replacement: pkg("lucide-react") },
        { find: /^expo-glass-effect$/, replacement: fileURLToPath(new URL("./src/preview/stubs/expo-glass-effect.ts", import.meta.url)) },
        { find: /^react-native-svg$/, replacement: fileURLToPath(new URL("./src/preview/stubs/react-native-svg.ts", import.meta.url)) },
        { find: /^(expo-linear-gradient|react-native-linear-gradient)$/, replacement: fileURLToPath(new URL("./src/preview/stubs/linear-gradient.ts", import.meta.url)) },
      ],
      extensions: [".web.mjs", ".web.js", ".web.ts", ".web.tsx", ".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
      dedupe: ["react", "react-dom", "react-native-web"],
    },
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
      global: "globalThis",
    },
    optimizeDeps: {
      include: ["react-native-web", "lucide-react"],
      rolldownOptions: { resolve: { extensions: [".web.mjs", ".web.js", ".web.ts", ".web.tsx", ".mjs", ".js", ".ts", ".tsx", ".json"] } },
    },
    ssr: { noExternal: ["react-native-web", /^@antfabric\/ui-/] },
  },
});
