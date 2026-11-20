// The version this push publishes, written into the three packages (run by release.yml before the build).
//
// Every push to main publishes a new version:
//   - packages/core/package.json holds the version people chose (1.0.0 to start; raise it to 1.1.0 or
//     2.0.0 to start a minor or a major);
//   - if npm does not have that version and it is newer than everything on npm, it is used as it is;
//   - otherwise the next patch after the newest version on npm is used (1.0.0 → 1.0.1 → 1.0.2 …).
// The three packages always share one version. Nothing is committed: git tags record what shipped.
//
//   node scripts/release-version.mjs            writes the version, prints it (and to $GITHUB_OUTPUT)
//   node scripts/release-version.mjs --dry      prints it only
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PACKAGES = ["core", "react", "react-native"];
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

/** Every version of @antfabric/ui-core on npm (none before the first release). */
function published() {
  try {
    const out = execFileSync("npm", ["view", "@antfabric/ui-core", "versions", "--json"], {
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

const chosen = read("core").version;
const versions = published().sort(compare);
const newest = versions.at(-1);
let next;
if (!newest || (!versions.includes(chosen) && compare(chosen, newest) > 0)) next = chosen;
else {
  const [major, minor, patch] = parse(newest);
  next = `${major}.${minor}.${patch + 1}`;
}

if (!process.argv.includes("--dry")) {
  for (const name of PACKAGES) {
    const json = read(name);
    json.version = next;
    writeFileSync(file(name), `${JSON.stringify(json, null, 2)}\n`);
  }
}
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${next}\n`);
console.log(next);
