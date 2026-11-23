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
 *
 * The kits' files (every entry and every chunk) start with `"use client"`, so a React Server Component can import them; core's do not,
 * so a server file can reach what of core does not touch React's client API (`./dtcg`, `./antfabric`). Each `.js` has a source map. tsc
 * writes the `.d.ts` with the sources' extensionless relative imports, which `moduleResolution: nodenext` cannot follow; `fixDeclarations`
 * then gives each one the `.js` (or `/index.js`) of the file beside it, and fails on one that names no file.
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsc = join(root, "node_modules/.bin/tsc");

const PACKAGES = {
  core: { entries: ["src/index.ts", "src/dtcg.ts", "src/chart/index.ts", "src/antfabric.ts"], splitting: true },
  react: { entries: ["src/index.ts", "src/data/index.ts", "src/shell/index.ts", "src/chat/index.ts"], splitting: true, useClient: true },
  "react-native": { entries: ["src/index.ts", "src/data/index.ts", "src/shell/index.ts", "src/chat/index.ts"], splitting: true, useClient: true, keepRequire: ["expo-glass-effect"] },
};

// `from "./x"`, `import("./x")` and `import "./x"` in a .d.ts, relative only: "./x" becomes "./x.js" or "./x/index.js", ".." "../index.js".
const RELATIVE = /(\bfrom\s*|\bimport\s*\(\s*|^\s*import\s*)(["'])(\.\.?(?:\/[^"']*)?)\2/gm;
function fixDeclarations(dist, name) {
  let count = 0;
  for (const f of readdirSync(dist, { recursive: true }).filter((f) => f.endsWith(".d.ts"))) {
    const file = join(dist, f);
    const code = readFileSync(file, "utf8");
    const fixed = code.replace(RELATIVE, (all, head, q, spec) => {
      if (/\.(?:js|json)$/.test(spec)) return all;
      const at = join(dirname(file), spec);
      const to = existsSync(`${at}.d.ts`) ? `${spec}.js` : existsSync(join(at, "index.d.ts")) ? `${spec.replace(/\/$/, "")}/index.js` : null;
      if (!to) throw new Error(`${name}: dist/${relative(dist, file)} imports "${spec}", which is no .d.ts in dist`);
      count++;
      return `${head}${q}${to}${q}`;
    });
    if (fixed !== code) writeFileSync(file, fixed);
  }
  return count;
}

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
    sourcemap: true,
    banner: opts.useClient ? { js: '"use client";' } : undefined,
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
  const fixed = fixDeclarations(join(dir, "dist"), name);
  const files = readdirSync(join(dir, "dist"), { recursive: true }).filter((f) => /\.(js|d\.ts)$/.test(f));
  console.log(`@antfabric/ui-${name}: dist/ ${files.length} files, ${fixed} relative .d.ts imports given their .js`);
}
