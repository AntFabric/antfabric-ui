/**
 * Builds the three publishable packages to `dist/`: ESM `.js` (esbuild) and `.d.ts` (tsc).
 *
 *   pnpm build:packages            # all three
 *   pnpm build:packages react      # one (core, react, react-native)
 *
 * The workspace keeps importing `src`; only the packed tarball points at `dist` (`publishConfig`).
 * Peers and dependencies stay external (`packages: "external"`); relative imports are bundled, which
 * also inlines the JSON `core/dtcg` reads. Every package is split into shared chunks so its entries do not carry two copies of
 * what they share: core's `index` and `dtcg` of the tokens, and a kit's root, `data`, `shell` and `chat` entries of the platform context and
 * the components the data, shell and chat ones draw with (a second copy of `AntFabricRoot`'s context would not see the root's). `chart`
 * (core's `./chart` subpath) imports nothing of it and stays its own file. `antfabric` (core's `./antfabric` subpath, AntFabric's copy) is an
 * entry of its own on purpose: the root never imports it, so a product that does not name it carries none of AntFabric's wording. A kit's `data` entry is the only one that reaches recharts or
 * gifted-charts, which are dependencies, so they stay external there and nowhere else; its `shell` entry (the app frame and the
 * pictures of native surfaces) is the only one that reaches the shell components, and its `chat` entry (the conversation idiom) the only one
 * that reaches Message and the rest of the chat components.
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsc = join(root, "node_modules/.bin/tsc");

const PACKAGES = {
  core: { entries: ["src/index.ts", "src/dtcg.ts", "src/chart/index.ts", "src/antfabric.ts"], splitting: true },
  react: { entries: ["src/index.ts", "src/data/index.ts", "src/shell/index.ts", "src/chat/index.ts"], splitting: true },
  "react-native": { entries: ["src/index.ts", "src/data/index.ts", "src/shell/index.ts", "src/chat/index.ts"], splitting: true, keepRequire: ["expo-glass-effect"] },
};

const wanted = process.argv.slice(2);
for (const name of wanted) if (!PACKAGES[name]) throw new Error(`unknown package "${name}" (core, react, react-native)`);

for (const [name, opts] of Object.entries(PACKAGES)) {
  if (wanted.length && !wanted.includes(name)) continue;
  const dir = join(root, "packages", name);
  rmSync(join(dir, "dist"), { recursive: true, force: true });

  await build({
    absWorkingDir: dir,
    entryPoints: opts.entries,
    outdir: "dist",
    bundle: true,
    packages: "external",
    format: "esm",
    platform: "neutral",
    target: "es2022",
    jsx: "automatic",
    splitting: opts.splitting ?? false,
    chunkNames: "chunks/[name]-[hash]",
    logLevel: "warning",
  });

  // Metro only sees `require("literal")`; esbuild's `__require` wrapper hides it. An optional peer is loaded that way.
  // The call is in whichever file holds the component that loads it (a shared chunk, once the entries are split).
  for (const mod of opts.keepRequire ?? []) {
    const call = `__require("${mod}")`;
    const holders = readdirSync(join(dir, "dist"), { recursive: true }).filter((f) => f.endsWith(".js") && readFileSync(join(dir, "dist", f), "utf8").includes(call));
    if (!holders.length) throw new Error(`${name}: expected ${call} in dist`);
    for (const f of holders) writeFileSync(join(dir, "dist", f), readFileSync(join(dir, "dist", f), "utf8").replaceAll(call, `require("${mod}")`));
  }
  if (opts.keepRequire) {
    for (const f of readdirSync(join(dir, "dist"), { recursive: true }).filter((f) => f.endsWith(".js"))) {
      if (/__require\(/.test(readFileSync(join(dir, "dist", f), "utf8"))) throw new Error(`${name}: another wrapped require is left in dist/${f}`);
    }
  }

  execFileSync(tsc, ["-p", join(dir, "tsconfig.build.json")], { stdio: "inherit" });
  const files = readdirSync(join(dir, "dist"), { recursive: true }).filter((f) => /\.(js|d\.ts)$/.test(f));
  console.log(`@antfabric/ui-${name}: dist/ ${files.length} files`);
}
