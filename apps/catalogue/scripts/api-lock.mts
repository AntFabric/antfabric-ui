/**
 * `pnpm api:lock`: writes `reports/api.lock.json`, the public surface of the three packages (`scripts/api-surface.ts`): every token and
 * every exported name. Commit it with the change that moved it; `pnpm check api` fails while it is stale.
 *
 * It refuses to drop an entry, or to change what a token is, unless the packages' major version is above the one the lock was written
 * at: a name that leaves breaks whoever installed the last version. Keep the old name as a deprecated alias, or raise the major version
 * in the three package.json files first.
 */

import { writeFileSync } from "node:fs";
import { API_LOCK, apiDiff, apiSurface, breaking, lockPath, lockText, major, readLock } from "./api-surface";

const now = apiSurface();
const was = readLock();

if (was) {
  const diff = apiDiff(was, now);
  const broke = breaking(diff);
  if (broke.length && major(now.version) <= major(was.version)) {
    console.error(`api: ${broke.length} breaking change(s) against ${API_LOCK} (locked at ${was.version}), and the packages are still at ${now.version}:`);
    for (const line of broke.slice(0, 40)) console.error(`  - ${line}`);
    if (broke.length > 40) console.error(`  … and ${broke.length - 40} more`);
    console.error("Keep each old name as a deprecated alias, or raise the major version in packages/*/package.json and run this again.");
    process.exit(1);
  }
  console.log(`api: ${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed since the lock at ${was.version}`);
}

writeFileSync(lockPath(), lockText(now));
console.log(`api: wrote ${API_LOCK} (${Object.keys(now.tokens).length} tokens, ${Object.values(now.exports).reduce((n, names) => n + names.length, 0)} exports in ${Object.keys(now.exports).length} entries)`);
