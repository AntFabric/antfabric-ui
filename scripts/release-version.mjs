// The version this push publishes, written into the three packages (run by release.yml before the build).
//
// Every push to main publishes a new version:
//   - packages/core/package.json holds the version people chose (1.0.0 to start; raise it to 1.1.0 or
//     2.0.0 to start a minor or a major);
//   - if npm does not have that version and it is newer than everything on npm, it is used as it is;
//   - otherwise the next patch after the newest version on npm is used (1.0.0 → 1.0.1 → 1.0.2 …).
// The three packages always share one version. Nothing is committed: git tags record what shipped.
//
// Re-running a release never ships the same commit twice or leaves a version half out:
//   - a commit that already carries a v<version> tag has shipped: skip=true, nothing is published;
//   - a version npm has for some of the three packages but not all, or that has no v<version> tag yet,
//     was cut short: it is picked again, publish-packages.mjs skips the packages npm already has, and
//     the tag step finishes it.
//
//   node scripts/release-version.mjs            writes the version, prints it (and version=, skip= to $GITHUB_OUTPUT)
//   node scripts/release-version.mjs --dry      prints it only
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PACKAGES = ["core", "react", "react-native"];
const NAMES = PACKAGES.map((p) => `@antfabric/ui-${p}`);
const ROOT = new URL("..", import.meta.url).pathname;
const file = (name) => join(ROOT, "packages", name, "package.json");
const read = (name) => JSON.parse(readFileSync(file(name), "utf8"));

const parse = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) throw new Error(`not a plain x.y.z version: ${v}`);
  return m.slice(1).map(Number);
};
const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

/** Every version of one package on npm (none before its first release). */
function published(name) {
  try {
    const out = execFileSync("npm", ["view", name, "versions", "--json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const list = JSON.parse(out);
    return (Array.isArray(list) ? list : [list]).filter((v) => /^\d+\.\d+\.\d+$/.test(v));
  } catch (error) {
    if (/E404|404 Not Found/.test(String(error.stderr ?? error.message))) return [];
    throw error;
  }
}

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
const output = (pairs) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, pairs.map(([k, v]) => `${k}=${v}\n`).join(""));
};

// Already shipped: this commit carries a release tag (a re-run, or a version published by hand and tagged).
const shipped = git("tag", "--points-at", "HEAD", "--list", "v*").split("\n").filter(Boolean).at(-1);
if (shipped) {
  output([["version", shipped.slice(1)], ["skip", "true"]]);
  console.log(`${shipped.slice(1)} (this commit is already released as ${shipped}; nothing to publish)`);
  process.exit(0);
}

const chosen = read("core").version;
const byPackage = NAMES.map((name) => new Set(published(name)));
const versions = [...new Set(byPackage.flatMap((set) => [...set]))].sort(compare);
const newest = versions.at(-1);
const tagged = (v) => git("tag", "--list", `v${v}`) !== "";
let next;
if (newest && (!byPackage.every((set) => set.has(newest)) || !tagged(newest))) next = newest; // finish a cut-short release
else if (!newest || (!versions.includes(chosen) && compare(chosen, newest) > 0)) next = chosen;
else {
  const [major, minor, patch] = parse(newest);
  next = `${major}.${minor}.${patch + 1}`;
}

// The public surface (reports/api.lock.json: every token and exported name) against the lock the newest release carried. A push that
// publishes a patch may neither drop a name (that needs a major) nor add one (a minor); a chosen version may drop one only as a major.
// `pnpm check api` says the same before the merge; this is the last gate, on the version actually being published.
function surface(text) {
  const lock = JSON.parse(text);
  const out = new Map();
  for (const [path, what] of Object.entries(lock.tokens)) out.set(`token ${path}`, what.replace(/ internal$/, ""));
  for (const [entry, names] of Object.entries(lock.exports)) for (const name of names) out.set(`export ${entry} ${name}`, "");
  return out;
}
function guard() {
  if (!newest || !tagged(newest)) return;
  let before;
  try {
    before = surface(execFileSync("git", ["show", `v${newest}:reports/api.lock.json`], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return; // the newest release predates the lock
  }
  const after = surface(readFileSync(join(ROOT, "reports/api.lock.json"), "utf8"));
  const gone = [...before].filter(([k, v]) => !after.has(k) || after.get(k) !== v).map(([k]) => k);
  const added = [...after.keys()].filter((k) => !before.has(k));
  const [a, b] = [parse(newest), parse(next)];
  const show = (list) => `${list.slice(0, 8).join(", ")}${list.length > 8 ? `, and ${list.length - 8} more` : ""}`;
  if (gone.length && b[0] <= a[0]) throw new Error(`${next} would remove or change ${gone.length} public name(s) that ${newest} has (${show(gone)}): that is a major. Raise the version to ${a[0] + 1}.0.0 in packages/*/package.json.`);
  if (added.length && b[0] === a[0] && b[1] === a[1]) throw new Error(`${next} would add ${added.length} public name(s) to ${newest} as a patch (${show(added)}): that is a minor. Raise the version to ${a[0]}.${a[1] + 1}.0 in packages/*/package.json.`);
}
guard();

if (!process.argv.includes("--dry")) {
  for (const name of PACKAGES) {
    const json = read(name);
    json.version = next;
    writeFileSync(file(name), `${JSON.stringify(json, null, 2)}\n`);
  }
}
output([["version", next], ["skip", "false"]]);
console.log(next);
