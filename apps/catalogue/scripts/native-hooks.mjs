/**
 * The resolutions `native.mjs` installs, one file so the catalogue's Vite config (astro.config.mjs) can be read against it.
 * react-native-svg is stubbed with every element gifted-charts uses mapped to its DOM element, not resolved to the real web
 * build (src/preview/stubs/react-native-svg.ts says why).
 */
const here = new URL("../package.json", import.meta.url).href;

const ALIAS = {
  "react-native": "react-native-web",
  "lucide-react-native": "lucide-react",
};

const STUBS = {
  "expo-glass-effect": new URL("../src/preview/stubs/expo-glass-effect.ts", import.meta.url).href,
  "react-native-svg": new URL("../src/preview/stubs/react-native-svg.ts", import.meta.url).href,
  "expo-linear-gradient": new URL("../src/preview/stubs/linear-gradient.ts", import.meta.url).href,
  "react-native-linear-gradient": new URL("../src/preview/stubs/linear-gradient.ts", import.meta.url).href,
};

export function resolve(specifier, context, next) {
  const to = ALIAS[specifier];
  if (to) return next(to, { ...context, parentURL: here });
  if (STUBS[specifier]) return { url: STUBS[specifier], shortCircuit: true };
  return next(specifier, context);
}
