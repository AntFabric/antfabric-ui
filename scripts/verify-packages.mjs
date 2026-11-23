/**
 * Proves the three packages work as consumers get them: builds, `pnpm pack`s the tarballs, installs them into
 * a throwaway project outside the repository, then
 *   (a) server-renders `<AntFabricRoot><Button/></AntFabricRoot>` from `@antfabric/ui-react`,
 *   (b) loads `@antfabric/ui-core`, `@antfabric/ui-core/dtcg`, `@antfabric/ui-core/chart`, `@antfabric/ui-core/tokens.json` and the fonts `fonts.css` names,
 *   (c) type-checks a small consumer file against each package's published `.d.ts`, under `moduleResolution` bundler and nodenext; checks
 *       that every file of the kits starts with `"use client"` and none of core's does, that every `.js` has its source map, and which of
 *       core's entries load in Node under the `react-server` condition (those that do not are listed in `SERVER_TODO`),
 *   (d) proves the data subpaths are the only way to reach the chart libraries: a consumer that imports only the kits' root entries,
 *       bundled by esbuild, holds no recharts, react-native-gifted-charts, gifted-charts-core or d3 module (and one that imports a
 *       `/data` entry does, so the proof is not an empty one), and the published `exports` carry `./data`,
 *   (e) proves the same of the shell subpaths: the published `exports` carry `./shell`; everything each kit's root exports, bundled,
 *       holds no `dist/shell/` file and none of the components `./shell` exports (nor the phone tab bar's `"tab-bar", "pill"` part id); a consumer of
 *       `./shell` bundles each one it exports (TitleBar with its `data-tauri-drag-region`, TabBar with its pill), and NavRail, once
 *       it is there, renders from `/shell` with its current destination marked. While an entry is empty, its half says so and passes,
 *   (f) proves the same of the chat subpaths: the published `exports` carry `./chat`; everything each kit's root exports, bundled, holds no
 *       `dist/chat/` file and none of the components `./chat` exports (nor the Composer's own marks, the web's `fieldSizing` and the phone's
 *       `composer.alsoSend`); a consumer of `./chat` bundles each one it exports, and Message, once it is there, renders from `/chat` as
 *       an `article`. While an entry is empty, its half says so and passes,
 *   (g) proves AntFabric's copy is opt-in: core's published `exports` carry `./antfabric` with its types; the subpath resolves in Node and
 *       type-checks (`antfabricStrings` as `strings` with `antfabric` as the theme, `antfabric` being `themes.antfabric`); everything the
 *       roots of core, react and react-native export, bundled, holds none of its files and none of its words (a sentence only AntFabric's
 *       copy has), and a consumer of `./antfabric` does bundle them, so the proof is not an empty one,
 *   (h) proves an app pays for the kit's icons, not lucide's: `import { Button }` from `@antfabric/ui-react`, bundled minified with
 *       lucide-react inside (only react external), holds at most `ICON_CEILING` lucide icons and stays under `BUTTON_CEILING` bytes.
 *
 *   pnpm verify:packages
 *
 * Nothing is published. The consumer's own dependencies (react, react-native, lucide, typescript) are the
 * versions the kits are developed against, installed with `pnpm install --offline` from the local store; if the
 * store lacks one, the script says so and falls back to the network for that install.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { build } from "esbuild";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const NAMES = ["core", "react", "react-native"];
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const fail = (msg) => {
  console.error(`verify:packages: FAILED, ${msg}\n(scratch project kept at ${scratch})`);
  process.exit(1);
};
let scratch = "(not created)";
const run = (cmd, args, cwd, label = `${cmd} ${args.join(" ")}`) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) fail(`${label}\n${r.stdout}${r.stderr}`);
  return r.stdout;
};

execFileSync("node", [join(root, "scripts/build-packages.mjs")], { stdio: "inherit" });

scratch = mkdtempSync(join(tmpdir(), "antfabric-ui-verify-"));
const tarballs = join(scratch, "tarballs");
const app = join(scratch, "consumer");
mkdirSync(tarballs);
mkdirSync(app);

// Pack: pnpm applies `publishConfig` (exports, main, types) and rewrites `workspace:^` to a version.
const packed = {};
for (const name of NAMES) {
  const dir = join(root, "packages", name);
  run("pnpm", ["pack", "--pack-destination", tarballs], dir, `pnpm pack (${name})`);
  const file = readdirSync(tarballs).find((f) => f === `antfabric-ui-${name}-${read(join(dir, "package.json")).version}.tgz`);
  if (!file) fail(`no tarball for ${name}`);
  packed[name] = join(tarballs, file);
  const list = run("tar", ["-tzf", packed[name]], tarballs).trim().split("\n");
  console.log(`  ${file}: ${list.length} files, ${(statSync(packed[name]).size / 1024).toFixed(0)} KB`);
  const manifest = JSON.parse(run("tar", ["-xzOf", packed[name], "package/package.json"], tarballs));
  if (!String(manifest.exports?.["."]?.import ?? "").startsWith("./dist/")) fail(`${name}: packed exports do not point at dist`);
  if (name === "core" && !String(manifest.exports?.["./antfabric"]?.import ?? "").startsWith("./dist/antfabric")) fail("core: packed exports have no ./antfabric pointing at dist/antfabric");
  if (name === "core" && !String(manifest.exports?.["./antfabric"]?.types ?? "").startsWith("./dist/antfabric")) fail("core: packed exports have no ./antfabric types in dist");
  if (name !== "core" && !String(manifest.exports?.["./data"]?.import ?? "").startsWith("./dist/data/")) fail(`${name}: packed exports have no ./data pointing at dist/data`);
  if (name !== "core" && !String(manifest.exports?.["./shell"]?.import ?? "").startsWith("./dist/shell/")) fail(`${name}: packed exports have no ./shell pointing at dist/shell`);
  if (name !== "core" && !String(manifest.exports?.["./shell"]?.types ?? "").startsWith("./dist/shell/")) fail(`${name}: packed exports have no ./shell types in dist/shell`);
  if (name !== "core" && !String(manifest.exports?.["./chat"]?.import ?? "").startsWith("./dist/chat/")) fail(`${name}: packed exports have no ./chat pointing at dist/chat`);
  if (name !== "core" && !String(manifest.exports?.["./chat"]?.types ?? "").startsWith("./dist/chat/")) fail(`${name}: packed exports have no ./chat types in dist/chat`);
  if (JSON.stringify(manifest).includes("workspace:")) fail(`${name}: packed package.json still has a workspace: range`);
  if (list.some((f) => f.includes("/src/") || f.endsWith(".tsx"))) fail(`${name}: source in the tarball`);
  // Figtree and Geist (OFL) ship with core; Satoshi's licence does not let its files be passed on, so it never may.
  if (name === "core" && !["fonts/fonts.css", "fonts/Figtree-Regular.ttf", "fonts/Figtree-OFL.txt", "fonts/Geist-Variable.woff2", "fonts/Geist-Regular.woff2", "fonts/Geist-Regular.ttf", "fonts/Geist-OFL.txt"].every((f) => list.includes(`package/${f}`))) fail("core: the Figtree or Geist fonts or fonts.css are missing from the tarball");
  if (list.some((f) => /satoshi/i.test(f))) fail(`${name}: Satoshi's files are in the tarball`);
  if (!list.includes("package/LICENSE")) fail(`${name}: no LICENSE in the tarball`);
  if (manifest.license !== "MIT") fail(`${name}: license is ${manifest.license}, not MIT`);
  if (!String(manifest.repository?.url ?? "").includes("github.com/AntFabric/antfabric-ui")) fail(`${name}: repository.url does not name github.com/AntFabric/antfabric-ui (npm provenance checks it)`);
}

// The consumer: the versions the kits are developed against, plus the three tarballs (core also stands in for the `^<version>` the kits ask for).
const dev = { ...read(join(root, "packages/react-native/package.json")).devDependencies, ...read(join(root, "packages/react/package.json")).devDependencies };
const deps = Object.fromEntries(
  ["react", "react-dom", "react-native", "react-native-svg", "lucide-react", "lucide-react-native", "@types/react", "@types/react-dom", "typescript"].map((n) => [n, dev[n]]),
);
writeFileSync(
  join(app, "package.json"),
  JSON.stringify({ name: "consumer", private: true, type: "module", dependencies: { ...deps, ...Object.fromEntries(NAMES.map((n) => [`@antfabric/ui-${n}`, `file:${packed[n]}`])) } }, null, 2),
);
writeFileSync(join(app, "pnpm-workspace.yaml"), `packages: []\nautoInstallPeers: false\noverrides:\n  "@antfabric/ui-core": "file:${packed.core}"\n`);
let install = spawnSync("pnpm", ["install", "--offline", "--ignore-scripts"], { cwd: app, encoding: "utf8" });
if (install.status !== 0) {
  console.log("  the local store is missing something; installing from the network:\n" + install.stderr.split("\n").slice(0, 4).join("\n"));
  install = spawnSync("pnpm", ["install", "--ignore-scripts"], { cwd: app, encoding: "utf8" });
  if (install.status !== 0) fail(`pnpm install\n${install.stdout}${install.stderr}`);
}

// (a) and (b), in Node, as an ESM consumer.
writeFileSync(
  join(app, "run.mjs"),
  `
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { AntFabricRoot, AntFabricProvider, Button, rootAttrs } from "@antfabric/ui-react";
import { Delta, Sparkline, rechartsTheme, useChartTokens } from "@antfabric/ui-react/data";
import * as core from "@antfabric/ui-core";
import { tokensDtcg, tokensJson } from "@antfabric/ui-core/dtcg";
import shipped from "@antfabric/ui-core/tokens.json" with { type: "json" };
import { fmt, niceScale, lttb } from "@antfabric/ui-core/chart";
import { antfabric, antfabricStrings } from "@antfabric/ui-core/antfabric";

const html = renderToStaticMarkup(createElement(AntFabricRoot, { platform: "web", scheme: "light" }, createElement(Button, { label: "Send" })));
if (!html.includes("<button")) throw new Error("no <button> in: " + html.slice(0, 400));
if (!html.includes("Send")) throw new Error("no label in: " + html.slice(0, 400));
if (!html.includes("data-af-part=")) throw new Error("no data-af-part in: " + html.slice(0, 400));
if (!html.includes('data-af-platform="web"') || !html.includes("--af-")) throw new Error("no root attributes or token variables in: " + html.slice(0, 400));

// A theme is a theme object: "dark" is a scheme, and a plain-JS consumer who passes it as a theme is told so. A host without the root writes the root's attributes with rootAttrs.
for (const bad of [() => renderToStaticMarkup(createElement(AntFabricRoot, { theme: "dark" }, null)), () => renderToStaticMarkup(createElement(AntFabricProvider, { theme: "dark" }, null))]) {
  let message = "";
  try { bad(); } catch (e) { message = e.message; }
  if (!message.includes("light or dark is ")) throw new Error("a string passed as theme did not throw the scheme hint: " + message);
}
const hostAttrs = rootAttrs({ platform: "web", os: "browser", scheme: "dark", theme: core.themes.neutral });
if (hostAttrs["data-af-theme"] !== "dark" || hostAttrs["data-af-theme-id"] !== core.themes.neutral.id || hostAttrs["data-af-os"] !== "browser") throw new Error("rootAttrs() is " + JSON.stringify(hostAttrs));
if (!core.themeCss(core.themes.neutral).includes(core.themes.neutral.id)) throw new Error("themeCss(neutral) does not name neutral's id");

for (const key of ["tokensCss", "resolveTokens", "recipes", "formatShortcut"]) if (typeof core[key] === "undefined") throw new Error("core." + key + " is missing");
if (!core.tokensCss().includes("--af-")) throw new Error("tokensCss() has no variables");
const doc = tokensDtcg();
if (!doc.primitives || !doc.fg) throw new Error("tokensDtcg() has no primitives or fg group");
if (JSON.stringify(shipped) !== JSON.stringify(JSON.parse(tokensJson()))) throw new Error("tokens.json is not what tokensJson() writes");
if (!readFileSync(new URL(import.meta.resolve("@antfabric/ui-core/tokens.json")), "utf8").includes("$description")) throw new Error("tokens.json has no descriptions");
// The font export resolves, and each file fonts.css names is beside it.
const fontsCss = new URL(import.meta.resolve("@antfabric/ui-core/fonts.css"));
for (const [, file] of readFileSync(fontsCss, "utf8").matchAll(/url\\("\\.\\/([^"]+)"\\)/g)) readFileSync(new URL(file, fontsCss));
readFileSync(new URL(import.meta.resolve("@antfabric/ui-core/fonts/Figtree-SemiBold.ttf")));
readFileSync(new URL(import.meta.resolve("@antfabric/ui-core/fonts/Geist-SemiBold.ttf")));

// The antfabric subpath loads: AntFabric's look (the very preset the root exports) and its copy, keyed by component id.
if (antfabric !== core.themes.antfabric || antfabric.id !== "") throw new Error("@antfabric/ui-core/antfabric's antfabric is not themes.antfabric, or its id is not empty");
if (antfabricStrings["session-state"]?.titleLocked !== "AntFabric is locked" || antfabricStrings["list-item"]?.withUnreadCount?.one !== "{label}, {count} mention") throw new Error("@antfabric/ui-core/antfabric's antfabricStrings is not AntFabric's copy");
if (Object.keys(core).includes("antfabricStrings")) throw new Error("core's root exports antfabricStrings; it belongs to ./antfabric only");
const lockedHtml = renderToStaticMarkup(createElement(AntFabricRoot, { platform: "web", scheme: "light", theme: antfabric, strings: antfabricStrings }, createElement("p", null, "ok")));
if (!lockedHtml.includes("data-af-platform")) throw new Error("AntFabricRoot with antfabric and antfabricStrings does not draw: " + lockedHtml.slice(0, 200));

// The chart subpath loads on its own and works.
if (fmt("compact", 12400) !== "12.4K" || niceScale([0, 97]).max !== 100 || lttb([1, 2, 3, 4, 5], 3, (_, i) => i, (v) => v).length !== 3) throw new Error("@antfabric/ui-core/chart does not format, scale or downsample");

// The data subpath loads (recharts with it) and draws: a Delta with its label, a Sparkline's labelled frame (the chart itself draws once mounted).
const dataHtml = renderToStaticMarkup(createElement(AntFabricRoot, { platform: "web", scheme: "dark" }, createElement(Delta, { value: 0.044 }), createElement(Sparkline, { data: [{ v: 1 }, { v: 3 }, { v: 2 }], y: "v", label: "Trend" })));
if (!dataHtml.includes('aria-label="Up 4.4%, good"')) throw new Error("no Delta label in: " + dataHtml.slice(0, 400));
if (!dataHtml.includes('aria-label="Trend"') || !dataHtml.includes("recharts-wrapper")) throw new Error("no Sparkline frame in: " + dataHtml.slice(0, 400));
if (typeof rechartsTheme !== "function" || typeof useChartTokens !== "function") throw new Error("the data subpath does not export its theme helpers");

// The shell subpath loads; once NavRail ships from it, it draws two destinations from data and marks the current one.
const shell = await import("@antfabric/ui-react/shell");
let shellNote = "shell: empty";
if (shell.NavRail) {
  const destinations = [{ key: "inbox", label: "Inbox", icon: "inbox" }, { key: "files", label: "Files", icon: "folder" }];
  const railHtml = renderToStaticMarkup(createElement(AntFabricRoot, { platform: "desktop", os: "mac", scheme: "light" }, createElement(shell.NavRail, { destinations, active: "files", expanded: true })));
  const current = railHtml.match(/aria-current="page"/g) ?? [];
  if (current.length !== 1) throw new Error("NavRail from /shell marks " + current.length + " destinations current, not 1: " + railHtml.slice(0, 400));
  if (!railHtml.includes("Inbox") || !railHtml.includes("Files")) throw new Error("NavRail from /shell does not draw its destinations: " + railHtml.slice(0, 400));
  shellNote = "shell: NavRail draws its destinations";
}

// The chat subpath loads; once Message ships from it, it draws as one article for a screen reader.
const chat = await import("@antfabric/ui-react/chat");
let chatNote = "chat: empty";
if (chat.Message) {
  const messageHtml = renderToStaticMarkup(createElement(AntFabricRoot, { platform: "web", scheme: "light" }, createElement(chat.Message, { author: "Aisha Bello", time: "10:42", body: "Staging is green again." })));
  if (!messageHtml.includes('role="article"')) throw new Error("Message from /chat is not an article: " + messageHtml.slice(0, 400));
  chatNote = "chat: Message draws an article";
}

const parts = [...html.matchAll(/data-af-part="([^"]+)"/g)].map((m) => m[1]);
console.log(JSON.stringify({ htmlBytes: html.length, parts, tokenGroups: Object.keys(doc).length, shippedBytes: JSON.stringify(shipped).length, shell: shellNote, chat: chatNote }));
`,
);
const out = run("node", ["run.mjs"], app, "render and load in Node");
console.log("  node: " + out.trim());

// (c) types, against the published .d.ts. Each file also carries a `@ts-expect-error`, so a package whose types fell back to `any` fails.
writeFileSync(
  join(app, "web.tsx"),
  `
import { AntFabricProvider, AntFabricRoot, Button, rootAttrs, type ActionItem, type AppMark, type ButtonProps, type MenuItem, type NavItem, type Person, type Reaction, type Attachment, type AgentStep, type ToolArg, type QuestionOption, type Approval, type AvatarIdentity, type AvatarPresence } from "@antfabric/ui-react";
import { Delta, Sparkline, rechartsTheme, type DeltaProps } from "@antfabric/ui-react/data";
import * as Shell from "@antfabric/ui-react/shell";
import * as Chat from "@antfabric/ui-react/chat";
import { defineTheme, themeCss, themes, tokensCss, tokenVars, type Scheme, type StringsOverrides } from "@antfabric/ui-core";
import { antfabric, antfabricStrings } from "@antfabric/ui-core/antfabric";
import { tokensDtcg } from "@antfabric/ui-core/dtcg";
import { fmt, niceScale, type FormatSpec, type Scale } from "@antfabric/ui-core/chart";
import tokens from "@antfabric/ui-core/tokens.json" with { type: "json" };

const props: ButtonProps = { label: "Send", variant: "primary", onPress: () => {} };
// @ts-expect-error variant is a closed union
const bad: ButtonProps = { label: "Send", variant: "nope" };
const scheme: Scheme = "dark";
const acme = defineTheme({ name: "Acme", extends: themes.neutral, brand: { primary: "#4f46e5" } });
export const element = (
  <AntFabricRoot platform="web" scheme={scheme} theme={acme}>
    <Button {...props} />
  </AntFabricRoot>
);
// AntFabric's look and its copy, from the opt-in subpath: the same theme the root's themes holds, and strings for the root.
export const antfabricApp = (
  <AntFabricRoot platform="web" scheme={scheme} theme={antfabric} strings={antfabricStrings}>
    <Button {...props} />
  </AntFabricRoot>
);
export const sameTheme: typeof themes.antfabric = antfabric;
export const copy: StringsOverrides = antfabricStrings;
// @ts-expect-error the copy is a StringsOverrides, not a string
export const badCopy: string = antfabricStrings;
// @ts-expect-error a theme is a theme object; light or dark is the scheme prop
export const badTheme = <AntFabricRoot platform="web" theme="dark">x</AntFabricRoot>;
// A host without the root: its attributes, its sheet, and the same theme given to the provider.
export const hostAttrs: Record<string, string> = rootAttrs({ platform: "web", os: "browser", scheme, theme: acme });
export const hostCss: string = tokensCss() + themeCss(acme);
export const hosted = <AntFabricProvider platform="web" os="browser" scheme={scheme} theme={acme}>x</AntFabricProvider>;
export const css: string = tokensCss();
export const vars = tokenVars();
export const doc: object = tokensDtcg();
const spec: FormatSpec = { type: "currency", compact: true };
export const price: string = fmt(spec, 12400);
export const axis: Scale = niceScale([0, 97]);
// @ts-expect-error a format has a closed set of names
export const nope: FormatSpec = "nope";
export const groups: string[] = Object.keys(tokens);
export const delta = <Delta value={0.044} variant="badge" />;
export const spark = <Sparkline data={[{ v: 1 }, { v: 2 }]} y="v" area />;
export const theme2 = rechartsTheme;
// @ts-expect-error a Delta's size is a closed union
export const badDelta: DeltaProps = { value: 1, size: "xl" };
export const shell: object = Shell;
export const chat: object = Chat;
export const row: MenuItem = { key: "mute", label: "Mute", checked: true, submenu: [{ type: "separator" }, { label: "For an hour" }] };
export const place: NavItem = { key: "inbox", label: "Inbox", icon: "inbox", badge: 3, sections: [{ key: "mentions", label: "Mentions", icon: "at-sign" }] };
export const action: ActionItem = { key: "help", label: "Help", icon: "circle-help" };
export const mark: AppMark = { viewBox: "0 0 24 24", paths: [{ d: "M0 0h24v24H0z", evenOdd: true }] };
// @ts-expect-error a NavItem names its key
export const keyless: NavItem = { label: "Inbox", icon: "inbox" };
export const identity: AvatarIdentity = "agent";
export const presence: AvatarPresence = "away";
export const person: Person = { name: "Priya Raman", identity: "indigo", presence: "active", agent: false };
export const reaction: Reaction = { emoji: "👍", count: 3, mine: true };
export const file: Attachment = { kind: "file", name: "Q3 plan.pdf", fileType: "pdf", status: "ready" };
export const step: AgentStep = { key: "read", label: "Recent messages", source: "Slack", state: "running" };
export const arg: ToolArg = { name: "channel", value: "#platform-eng" };
export const option: QuestionOption = { key: "a", label: "Staging", detail: "The shared cluster" };
export const approval: Approval = { subject: "Reorder 40 racks", source: "Purchase orders", reference: "PO-4821", status: "pending", verify: true };
// @ts-expect-error a reaction names its emoji and its count
export const bareReaction: Reaction = { count: 1 };
// @ts-expect-error an agent step is running, done or failed
export const badStep: AgentStep = { key: "x", label: "x", state: "queued" };
export { bad };
`,
);
writeFileSync(
  join(app, "native.tsx"),
  `
import { View } from "react-native";
import { ThemeProvider, Button, useTheme, type ButtonProps, type MenuItem, type NavItem, type Person, type Reaction, type Attachment, type AgentStep, type ToolArg, type QuestionOption, type Approval, type AvatarIdentity, type AvatarPresence } from "@antfabric/ui-react-native";
import { Delta, Sparkline, giftedTheme, type DeltaProps } from "@antfabric/ui-react-native/data";
import * as Shell from "@antfabric/ui-react-native/shell";
import * as Chat from "@antfabric/ui-react-native/chat";
import { resolveTokens } from "@antfabric/ui-core";
import { antfabric, antfabricStrings } from "@antfabric/ui-core/antfabric";

const props: ButtonProps = { label: "Send", variant: "primary", onPress: () => {} };
// @ts-expect-error variant is a closed union
const bad: ButtonProps = { label: "Send", variant: "nope" };
export const screen = (
  <ThemeProvider scheme="dark">
    <View>
      <Button {...props} />
    </View>
  </ThemeProvider>
);
export const antfabricScreen = (
  <ThemeProvider scheme="dark" theme={antfabric} strings={antfabricStrings}>
    <View>
      <Button {...props} />
    </View>
  </ThemeProvider>
);
export const hook = useTheme;
export const tokens = resolveTokens;
export const delta = <Delta value={0.044} variant="badge" />;
export const spark = <Sparkline data={[{ v: 1 }, { v: 2 }]} y="v" area />;
export const theme2 = giftedTheme;
// @ts-expect-error a Delta's size is a closed union
export const badDelta: DeltaProps = { value: 1, size: "xl" };
export const shell: object = Shell;
export const chat: object = Chat;
export const tabs: NavItem[] = [{ key: "home", label: "Home", icon: "house" }];
// @ts-expect-error a menu row's tone is only "danger"
export const loud: MenuItem = { label: "Delete", tone: "warning" };
export const identity: AvatarIdentity = "agent";
export const presence: AvatarPresence = "away";
export const person: Person = { name: "Priya Raman", identity: "indigo", presence: "active", agent: false };
export const reaction: Reaction = { emoji: "👍", count: 3, mine: true };
export const file: Attachment = { kind: "file", name: "Q3 plan.pdf", fileType: "pdf", status: "ready" };
export const step: AgentStep = { key: "read", label: "Recent messages", source: "Slack", state: "running" };
export const arg: ToolArg = { name: "channel", value: "#platform-eng" };
export const option: QuestionOption = { key: "a", label: "Staging", detail: "The shared cluster" };
export const approval: Approval = { subject: "Reorder 40 racks", source: "Purchase orders", reference: "PO-4821", status: "pending", verify: true };
// @ts-expect-error a reaction names its emoji and its count
export const bareReaction: Reaction = { count: 1 };
export { bad };
`,
);
const base = { target: "ES2022", module: "ESNext", moduleResolution: "Bundler", jsx: "react-jsx", strict: true, noEmit: true, skipLibCheck: true, resolveJsonModule: true, noUncheckedIndexedAccess: true, verbatimModuleSyntax: true };
writeFileSync(join(app, "tsconfig.web.json"), JSON.stringify({ compilerOptions: { ...base, lib: ["ES2022", "DOM", "DOM.Iterable"] }, files: ["web.tsx"] }));
writeFileSync(join(app, "tsconfig.native.json"), JSON.stringify({ compilerOptions: { ...base, lib: ["ES2022"], types: ["react-native"] }, files: ["native.tsx"] }));
// The same two files under Node's own resolution (`nodenext`), which follows only relative imports that name their file.
const nodenext = { ...base, module: "NodeNext", moduleResolution: "NodeNext" };
writeFileSync(join(app, "tsconfig.web-nodenext.json"), JSON.stringify({ compilerOptions: { ...nodenext, lib: ["ES2022", "DOM", "DOM.Iterable"] }, files: ["web.tsx"] }));
writeFileSync(join(app, "tsconfig.native-nodenext.json"), JSON.stringify({ compilerOptions: { ...nodenext, lib: ["ES2022"], types: ["react-native"] }, files: ["native.tsx"] }));
for (const cfg of ["web", "native", "web-nodenext", "native-nodenext"]) run(join(app, "node_modules/.bin/tsc"), ["-p", `tsconfig.${cfg}.json`], app, `tsc against the ${cfg} consumer file`);
console.log("  tsc: web.tsx (react with its item types, react/data, react/shell, react/chat, core, core/dtcg, tokens.json) and native.tsx (react-native, react-native/data, react-native/shell, react-native/chat, core) type-check against the published .d.ts, under moduleResolution bundler and nodenext");

// Server components: every file of the kits starts with "use client" (a server file that imports one gets a client boundary, not
// a crash), core's do not, and each core entry either loads in Node under the `react-server` condition (React's server build, which
// has no createContext or useState) or is listed below as one that does not yet. A listed one that loads must come off the list.
const SERVER_TODO = { ".": "state.ts and strings/react.ts call createContext at module scope", "./chart": "tween.ts imports useState, and its chunk holds state.ts" };
for (const name of NAMES) {
  const dist = join(app, "node_modules/@antfabric", `ui-${name}`, "dist");
  for (const f of readdirSync(dist, { recursive: true }).filter((f) => f.endsWith(".js"))) {
    const code = readFileSync(join(dist, f), "utf8");
    const client = code.startsWith('"use client";');
    if (name === "core" ? client : !client) fail(`${name}: dist/${f} ${client ? "starts" : "does not start"} with "use client"`);
    if (!code.includes(`//# sourceMappingURL=${f.split("/").pop()}.map`) || !statSync(join(dist, `${f}.map`), { throwIfNoEntry: false })) fail(`${name}: dist/${f} has no source map`);
  }
}
const serverLoads = {};
for (const sub of Object.keys(read(join(app, "node_modules/@antfabric/ui-core/package.json")).exports).filter((s) => !/json|css|\*/.test(s))) {
  const spec = sub === "." ? "@antfabric/ui-core" : `@antfabric/ui-core/${sub.slice(2)}`;
  const r = spawnSync("node", ["--conditions=react-server", "--input-type=module", "-e", `await import(${JSON.stringify(spec)});`], { cwd: app, encoding: "utf8" });
  serverLoads[sub] = r.status === 0;
  if (r.status !== 0 && !SERVER_TODO[sub]) fail(`core: ${spec} does not load under the react-server condition\n${r.stderr.split("\n").slice(0, 6).join("\n")}`);
  if (r.status === 0 && SERVER_TODO[sub]) fail(`core: ${spec} now loads under the react-server condition; take "${sub}" off SERVER_TODO in scripts/verify-packages.mjs`);
}
console.log(`  server: every react and react-native dist file starts with "use client", none of core's do, every .js has its .map; under react-server core ${Object.entries(serverLoads).map(([s, ok]) => `${s} ${ok ? "loads" : "does not (listed)"}`).join(", ")}`);

// The published .d.ts files reference only the package itself, its dependency and its peers.
const allowed = {
  core: ["react"],
  react: ["react", "react-dom", "@antfabric/ui-core", "lucide-react", "recharts"],
  "react-native": ["react", "react-native", "react-native-svg", "expo-glass-effect", "@antfabric/ui-core", "lucide-react-native", "react-native-gifted-charts", "gifted-charts-core"],
};
for (const name of NAMES) {
  const dist = join(app, "node_modules/@antfabric", `ui-${name}`, "dist");
  const seen = new Set();
  for (const f of readdirSync(dist, { recursive: true }).filter((f) => f.endsWith(".d.ts") || f.endsWith(".js"))) {
    const code = readFileSync(join(dist, f), "utf8");
    const specs = [...code.matchAll(/^\s*(?:import|export)\b[^"'\n]*\bfrom\s*"([^"]+)"/gm), ...code.matchAll(/^\s*import\s*"([^"]+)"/gm), ...code.matchAll(/\b(?:require|import)\("([^"]+)"\)/g)].map((m) => m[1]);
    for (const spec of specs) if (!spec.startsWith(".") && !spec.startsWith("node:")) seen.add(spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);
  }
  const extra = [...seen].filter((s) => !allowed[name].includes(s));
  if (extra.length) fail(`${name}: dist imports ${extra.join(", ")}, which is not a declared dependency or peer`);
}
// expo-glass-effect is an optional peer, required lazily in a try/catch; Metro needs the literal call (in whichever file holds the glass code).
const nativeDist = join(app, "node_modules/@antfabric/ui-react-native/dist");
if (!readdirSync(nativeDist, { recursive: true }).some((f) => String(f).endsWith(".js") && readFileSync(join(nativeDist, String(f)), "utf8").includes('require("expo-glass-effect")'))) fail("react-native: the literal require(\"expo-glass-effect\") is gone, Metro will not see it");

// (d) The chart libraries are reachable only through the data subpaths. Bundle what an app that never charts imports (each kit's root
// entry, plus core) and list every file that went in; then what an app that charts imports, to show the list can hold them.
const CHART_LIBS = /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:recharts|react-native-gifted-charts|gifted-charts-core|d3-[\w-]+|victory-vendor|@reduxjs\/toolkit|react-redux)\//;
const THIRD_PARTY_EXTERNAL = ["react", "react-dom", "react/jsx-runtime", "react-native", "react-native-svg", "lucide-react", "lucide-react-native", "expo-glass-effect", "expo-linear-gradient", "react-native-linear-gradient"];
const bundled = async (name, source) => {
  writeFileSync(join(app, `${name}.mjs`), source);
  const { metafile } = await build({ absWorkingDir: app, entryPoints: [`${name}.mjs`], bundle: true, write: false, metafile: true, format: "esm", platform: "neutral", mainFields: ["module", "main"], conditions: ["import"], external: THIRD_PARTY_EXTERNAL, logLevel: "silent" });
  return Object.keys(metafile.inputs);
};
const rootOnly = await bundled("root-only", 'import { AntFabricRoot, Button } from "@antfabric/ui-react";\nimport { ThemeProvider, Button as NativeButton } from "@antfabric/ui-react-native";\nimport { resolveTokens } from "@antfabric/ui-core";\nexport { AntFabricRoot, Button, ThemeProvider, NativeButton, resolveTokens };\n');
const leaked = rootOnly.filter((f) => CHART_LIBS.test(f) || /\/dist\/data\//.test(f));
if (leaked.length) fail("a consumer that imports only the root entries bundles chart code:\n  " + leaked.slice(0, 8).join("\n  "));
const withData = await bundled("with-data", 'import { Sparkline } from "@antfabric/ui-react/data";\nimport { Sparkline as NativeSparkline } from "@antfabric/ui-react-native/data";\nexport { Sparkline, NativeSparkline };\n');
for (const lib of ["recharts", "gifted-charts"]) if (!withData.some((f) => f.includes(lib))) fail("a consumer that imports the data entries does not bundle " + lib + ": the root-entry proof above would be an empty one");
console.log("  bundle: the root entries of react, react-native and core bundle " + rootOnly.length + " files, none from recharts, react-native-gifted-charts, gifted-charts-core or d3; the /data entries bundle " + withData.length + ", with both libraries");
if (rootOnly.some((f) => /\/dist\/shell\//.test(f))) fail("a consumer that imports only the root entries bundles a dist/shell/ file");
if (rootOnly.some((f) => /\/dist\/chat\//.test(f))) fail("a consumer that imports only the root entries bundles a dist/chat/ file");

// (e) The app frame is reachable only through the shell subpaths. Bundle everything each kit's root exports, and everything its /shell
// exports; a component /shell exports must be in the second (so the proof is not an empty one) and in no file of the first. A component
// is seen by its declaration (`function TitleBar(`; esbuild keeps names and numbers a clash, `TitleBar2`), and two by what only they draw.
const bundledText = async (name, source) => {
  writeFileSync(join(app, `${name}.mjs`), source);
  const { metafile, outputFiles } = await build({ absWorkingDir: app, entryPoints: [`${name}.mjs`], bundle: true, write: false, metafile: true, format: "esm", platform: "neutral", mainFields: ["module", "main"], conditions: ["import"], external: THIRD_PARTY_EXTERNAL, logLevel: "silent" });
  const out = Object.values(metafile.outputs)[0];
  return { inputs: Object.keys(metafile.inputs), exports: out?.exports ?? [], text: outputFiles.map((f) => f.text).join("\n") };
};
// TabBar names its parts through partId(testID, "tab-bar", part), so its mark is the call's arguments, as the bundle writes them.
const MARKS = { TitleBar: "data-tauri-drag-region", TabBar: '"tab-bar", "pill"', Composer: { react: "fieldSizing", "react-native": '"composer.alsoSend"' } };
const declared = (text, name) => new RegExp(`\\bfunction ${name}\\d*\\(`).test(text);
// The marks only these two draw, so the root's bundle must not hold them (TitleBar's drag region is drawn by other shell parts too).
const ONLY_THEIRS = new Set(["TabBar", "Composer"]);
const markOf = (name, kit) => (typeof MARKS[name] === "object" ? MARKS[name][kit] : MARKS[name]);
const seen = [];
for (const kit of ["react", "react-native"]) {
  const rootAll = await bundledText(`root-all-${kit}`, `export * from "@antfabric/ui-${kit}";\n`);
  for (const sub of ["shell", "chat"]) {
    const withSub = await bundledText(`with-${sub}-${kit}`, `export * from "@antfabric/ui-${kit}/${sub}";\n`);
    if (!withSub.inputs.some((f) => new RegExp(`@antfabric/ui-${kit}/dist/${sub}/index\\.js$`).test(f))) fail(`${kit}: a consumer of /${sub} does not bundle dist/${sub}/index.js`);
    const into = rootAll.inputs.filter((f) => new RegExp(`/dist/${sub}/`).test(f));
    if (into.length) fail(`${kit}: everything the root exports, bundled, takes in ${into.join(", ")}`);
    const components = withSub.exports.filter((n) => /^[A-Z]/.test(n) && declared(withSub.text, n));
    for (const name of components) {
      if (rootAll.exports.includes(name)) fail(`${kit}: ${name} is exported from both the root and /${sub}`);
      if (declared(rootAll.text, name)) fail(`${kit}: everything the root exports, bundled, holds ${name}, which ships from /${sub}`);
      const mark = markOf(name, kit);
      if (mark && !withSub.text.includes(mark)) fail(`${kit}: /${sub} exports ${name} but its bundle has no ${mark}`);
      if (mark && ONLY_THEIRS.has(name) && rootAll.text.includes(mark)) fail(`${kit}: everything the root exports, bundled, holds ${mark}, which only ${name} from /${sub} draws`);
    }
    seen.push(`${kit}/${sub} ${components.length ? components.join(", ") : "empty"}`);
  }
}
console.log("  bundle: everything the roots export holds no dist/shell/ or dist/chat/ file and no component /shell or /chat exports (" + seen.join("; ") + ")");

// (g) AntFabric's copy is reachable only through `@antfabric/ui-core/antfabric`. Everything the three roots export, bundled, holds no
// dist/antfabric file and none of its words; a consumer of the subpath holds both, so the check is not an empty one. The words are two
// sentences only AntFabric's copy has ("AntFabric is locked" is session-state's `titleLocked`, "Fabric is posting it now" notification-item's `approved`).
const COPY_WORDS = ["AntFabric is locked", "Fabric is posting it now"];
const withCopy = await bundledText("with-antfabric", 'export * from "@antfabric/ui-core/antfabric";\n');
if (!withCopy.inputs.some((f) => /@antfabric\/ui-core\/dist\/antfabric\.js$/.test(f))) fail("a consumer of ./antfabric does not bundle dist/antfabric.js");
for (const w of COPY_WORDS) if (!withCopy.text.includes(w)) fail(`a consumer of ./antfabric does not bundle "${w}": the proof below would be an empty one`);
for (const name of NAMES) {
  const everything = await bundledText(`root-copy-${name}`, `export * from "@antfabric/ui-${name}";\n`);
  if (everything.inputs.some((f) => /\/dist\/antfabric\.js$/.test(f))) fail(`${name}: everything the root exports, bundled, takes in dist/antfabric.js`);
  for (const w of COPY_WORDS) if (everything.text.includes(w)) fail(`${name}: everything the root exports, bundled, holds "${w}", which is AntFabric's copy and ships from core/antfabric only`);
  if (everything.exports.includes("antfabricStrings")) fail(`${name}: the root exports antfabricStrings`);
}
// react's root pulls core's root in; the check above held it to core's own, and this one says so for what a plain app imports.
const plainApp = await bundledText("plain-app", 'import { AntFabricRoot, Button } from "@antfabric/ui-react";\nimport { ThemeProvider } from "@antfabric/ui-react-native";\nimport { themes } from "@antfabric/ui-core";\nexport { AntFabricRoot, Button, ThemeProvider, themes };\n');
for (const w of COPY_WORDS) if (plainApp.text.includes(w)) fail(`a consumer of the roots holds "${w}"`);
console.log("  bundle: AntFabric's copy ships from core/antfabric only: its bundle holds " + COPY_WORDS.map((w) => `"${w}"`).join(" and ") + "; the roots of core, react and react-native, bundled, hold neither");

// (h) A consumer pays for the icons the kit draws, not for lucide. `import { Button }`, bundled for production with lucide-react inside
// (only react is external), holds the kit's registry of lucide icons and no more, and stays under a ceiling. Before the registry, the
// kit looked icons up in `import * as lucide`, and the same consumer held every one of lucide's 1859 icons in 1,205 KB (284 KB gzip).
const BUTTON_CEILING = 500 * 1024; // measured 398 KB minified (94 KB gzip) with 88 icons; about 1.25×
const ICON_CEILING = 120; // the React kit registers 88
const button = await build({ absWorkingDir: app, stdin: { contents: 'export { Button } from "@antfabric/ui-react";\n', resolveDir: app, loader: "js" }, bundle: true, write: false, metafile: true, minify: true, format: "esm", platform: "browser", conditions: ["import"], external: ["react", "react-dom", "react/jsx-runtime"], define: { "process.env.NODE_ENV": '"production"' }, logLevel: "silent" });
const buttonBytes = button.outputFiles[0].contents.length;
const buttonIcons = Object.entries(Object.values(button.metafile.outputs)[0].inputs).filter(([f, v]) => /lucide-react\/dist\/esm\/icons\//.test(f) && v.bytesInOutput > 0).length;
if (buttonIcons > ICON_CEILING) fail(`a consumer of Button bundles ${buttonIcons} lucide icons (ceiling ${ICON_CEILING}): something imports lucide as a whole again`);
if (buttonBytes > BUTTON_CEILING) fail(`a consumer of Button bundles ${(buttonBytes / 1024).toFixed(0)} KB minified, over the ${BUTTON_CEILING / 1024} KB ceiling`);
console.log(`  bundle: Button alone, minified with lucide-react inside, is ${(buttonBytes / 1024).toFixed(0)} KB (ceiling ${BUTTON_CEILING / 1024} KB) with ${buttonIcons} lucide icons (ceiling ${ICON_CEILING})`);

rmSync(scratch, { recursive: true, force: true });
console.log("verify:packages: ok");
