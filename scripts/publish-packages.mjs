// Publishes @antfabric/ui-core, ui-react and ui-react-native, in that order (the kits depend on core).
//
// pnpm packs each package, because only pnpm applies publishConfig (the dist exports) and turns
// workspace:^ into a version range; npm publishes the tarball, because npm's trusted publishing
// (OIDC from GitHub Actions, no token) needs the npm CLI 11.5.1 or later. Run `pnpm build:packages` first.
// A version npm already has is skipped, so a failed release can be re-run.
//
// In GitHub Actions every package still to publish is checked first, with the same OIDC token exchange
// npm does, and nothing is published unless npmjs.com trusts this workflow for all of them. Without
// it, npm falls back to no token for an untrusted package and stops there with ENEEDAUTH, after the
// packages before it went out (1.1.0's core without its kits).
//
//   node scripts/publish-packages.mjs             publish
//   node scripts/publish-packages.mjs --dry-run   pack and run npm publish --dry-run (sends nothing)
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PACKAGES = ["core", "react", "react-native"];
const ROOT = new URL("..", import.meta.url).pathname;
const dry = process.argv.includes("--dry-run");
const pnpm = /pnpm/.test(process.env.npm_execpath ?? "") ? process.env.npm_execpath : "pnpm";
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], ...opts });

const npmVersion = run("npm", ["--version"]).trim().split(".").map(Number);
if (!dry && (npmVersion[0] < 11 || (npmVersion[0] === 11 && (npmVersion[1] < 5 || (npmVersion[1] === 5 && npmVersion[2] < 1))))) {
  throw new Error(`npm ${npmVersion.join(".")} is too old for trusted publishing (11.5.1 or later)`);
}

function onNpm(name, version) {
  try {
    return run("npm", ["view", `${name}@${version}`, "version"], { stdio: ["ignore", "pipe", "pipe"] }).trim() === version;
  } catch (error) {
    if (/E404|404 Not Found/.test(String(error.stderr ?? error.message))) return false;
    throw error;
  }
}

/** The packages npmjs.com does not trust this workflow to publish, each with npm's answer. */
async function untrusted(names) {
  if (!process.env.GITHUB_ACTIONS) return []; // a hand publish signs in with npm login
  const { ACTIONS_ID_TOKEN_REQUEST_URL: url, ACTIONS_ID_TOKEN_REQUEST_TOKEN: bearer } = process.env;
  if (!url || !bearer) throw new Error("the job has no OIDC token: give it permissions: id-token: write");
  const request = new URL(url);
  request.searchParams.set("audience", "npm:registry.npmjs.org");
  const id = await fetch(request, { headers: { Accept: "application/json", Authorization: `Bearer ${bearer}` } });
  if (!id.ok) throw new Error(`GitHub refused the OIDC token: ${id.status} ${await id.text()}`);
  const { value } = await id.json();
  const failed = [];
  for (const name of names) {
    const exchange = `https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${name.replace("/", "%2f")}`;
    const res = await fetch(exchange, { method: "POST", headers: { Authorization: `Bearer ${value}` } });
    if (!res.ok) failed.push(`${name}: ${res.status} ${(await res.text()).slice(0, 300)}`);
  }
  return failed;
}

const todo = [];
for (const name of PACKAGES) {
  const dir = join(ROOT, "packages", name);
  const { name: pkg, version } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  if (!dry && onNpm(pkg, version)) console.log(`${pkg}@${version} is already on npm, skipped`);
  else todo.push({ dir, pkg, version });
}

const refused = dry ? [] : await untrusted(todo.map((p) => p.pkg));
if (refused.length) {
  const repo = process.env.GITHUB_REPOSITORY ?? "AntFabric/antfabric-ui";
  throw new Error(
    `npm does not trust this workflow for ${refused.length} package(s), so nothing was published:\n` +
      refused.map((line) => `  ${line}`).join("\n") +
      `\nOn npmjs.com, each package, Settings, Trusted Publisher, GitHub Actions: ${repo.split("/")[0]} / ` +
      `${repo.split("/")[1]}, workflow release.yml, no environment (RELEASING.md). Then re-run this job.`,
  );
}

const out = mkdtempSync(join(tmpdir(), "antfabric-ui-publish-"));
for (const { dir, pkg, version } of todo) {
  const before = new Set(readdirSync(out));
  const shell = pnpm.endsWith(".js") || pnpm.endsWith(".cjs") || pnpm.endsWith(".mjs");
  run(shell ? process.execPath : pnpm, [...(shell ? [pnpm] : []), "pack", "--pack-destination", out], { cwd: dir });
  const tarball = readdirSync(out).find((f) => !before.has(f) && f.endsWith(".tgz"));
  if (!tarball) throw new Error(`pnpm pack wrote no tarball for ${pkg}`);
  console.log(`${dry ? "dry run" : "publishing"}: ${pkg}@${version}`);
  execFileSync("npm", ["publish", join(out, tarball), "--access", "public", ...(dry ? ["--dry-run"] : [])], { stdio: "inherit" });
}
