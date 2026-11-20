/**
 * `pnpm report [--json]`: how much of the library is tokens and how much is literals. Read-only.
 * The scan is `src/lib/scan.ts`, shared with the Architecture page; this prints it. `--json` prints
 * the whole result (`reports/baseline.json` is the Phase 0 copy).
 *
 * `pnpm literals:tighten` (`--tighten`) is the one write: it rewrites `packages/<kit>/literals.allow.json`
 * to the current counts (colours, dimensions and fixed text), the ratchet `pnpm check literals` enforces. It never raises a count: if a file
 * holds more than its allowance (or has literals and no entry) it changes nothing and lists the files.
 * A kit with no allow file yet is seeded from the current counts.
 */

import { writeFileSync } from "node:fs";
import { allowanceJson, allowancePath, currentCounts, readAllowance, repoRoot, scan } from "../src/lib/scan";

const root = repoRoot();
const result = scan(root);
if (process.argv.includes("--tighten")) {
  const up: string[] = [];
  const writes: Array<() => void> = [];
  for (const kit of result.kits) {
    const now = currentCounts(kit);
    const was = readAllowance(root, kit.kit);
    if (!was) {
      writes.push(() => writeFileSync(allowancePath(root, kit.kit), allowanceJson(now)));
      console.log(`${kit.kit}: no literals.allow.json yet, seeding ${Object.keys(now).length} files`);
      continue;
    }
    // A kit whose saved file has no `text` field anywhere predates the text count: its first tighten writes the current text counts, never an error.
    const seedText = Object.values(was).every((a) => a.text === undefined);
    for (const [file, n] of Object.entries(now)) {
      const a = was[file] ?? { colours: 0, dimensions: 0, text: 0 };
      if (n.colours > a.colours || n.dimensions > a.dimensions || (!seedText && n.text > a.text)) {
        up.push(`${file}: colours ${a.colours} → ${n.colours}, dimensions ${a.dimensions} → ${n.dimensions}, text ${a.text ?? "-"} → ${n.text}`);
      }
    }
    const show = (n?: { colours: number; dimensions: number; text?: number }) => (n ? `${n.colours}/${n.dimensions}/${n.text ?? "-"}` : "-");
    const changed = Object.keys({ ...was, ...now }).filter((f) => JSON.stringify(was[f]) !== JSON.stringify(now[f]));
    if (changed.length) console.log(`${kit.kit}: ${changed.length} file(s) tightened (colours/dimensions/text):\n${changed.map((f) => `  ${f}: ${show(was[f])} → ${now[f] ? show(now[f]) : "gone"}`).join("\n")}`);
    else console.log(`${kit.kit}: already at the current counts`);
    writes.push(() => writeFileSync(allowancePath(root, kit.kit), allowanceJson(now)));
  }
  if (up.length) {
    console.error(`\nNot tightened: these files went up. Take the literals out (or name them as tokens), then run again.\n${up.map((l) => `  ${l}`).join("\n")}`);
    process.exit(1);
  }
  writes.forEach((w) => w());
} else if (process.argv.includes("--json")) {
  // Pretty-printed, but a list of line numbers (or one literal) stays on one line so a diff reads.
  const json = JSON.stringify(result, null, 2)
    .replace(/\[\s+([\d,\s]+?)\s+\]/g, (_, n: string) => `[${n.replace(/\s+/g, " ")}]`)
    .replace(/\{\s+("line": \d+),\s+(?:("prop": "\w+"),\s+)?("value": "[^"]*")\s+\}/g, (_, l: string, p: string | undefined, v: string) => `{ ${l}, ${p ? `${p}, ` : ""}${v} }`);
  console.log(json);
} else {
  const pad = (s: string | number, n: number, right = false) => (right ? String(s).padStart(n) : String(s).padEnd(n));
  for (const kit of result.kits) {
    console.log(`\n${kit.kit}\n`);
    console.log(`${pad("component", 26)}${pad("refs", 6, true)}${pad("distinct", 10, true)}${pad("colour", 8, true)}${pad("dim", 6, true)}${pad("ratio", 7, true)}${pad("branch", 8, true)}${pad("annot", 7, true)}`);
    for (const f of kit.files) {
      console.log(
        `${pad(`${f.category}/${f.id}`, 26)}${pad(f.tokenRefs, 6, true)}${pad(Object.keys(f.tokenPaths).length, 10, true)}${pad(f.colours.length, 8, true)}${pad(f.dimensions.length, 6, true)}${pad(f.ratios.length, 7, true)}${pad(f.platformBranches.length, 8, true)}${pad(f.annotated.length, 7, true)}`,
      );
    }
    const t = kit.totals;
    console.log(`${pad(`total (${t.files} files)`, 26)}${pad(t.tokenRefs, 6, true)}${pad(t.distinctTokens, 10, true)}${pad(t.colours, 8, true)}${pad(t.dimensions, 6, true)}${pad(t.ratios, 7, true)}${pad(t.platformBranches, 8, true)}${pad(t.annotated, 7, true)}`);
  }
  const t = result.tokens;
  const list = (title: string, items: string[]) => console.log(`${pad(title, 44)}${pad(items.length, 4, true)}${items.length ? `  ${items.join(" ")}` : ""}`);
  console.log("\ntokens\n");
  console.log(`${pad("leaves (shared + themes + profiles, unioned)", 44)}${pad(t.total, 4, true)}  shared ${t.inShared}, themes ${t.inThemes}, profiles ${t.inProfiles}`);
  const r = t.tiers;
  console.log(`${pad("values pointing at a primitive (references)", 44)}${pad(r.references, 4, true)}  of ${r.values} values; ${r.literals} are literals; ${r.leavesWithReference} of ${t.total} leaves have a reference`);
  console.log(`${pad("primitives referenced", 44)}${pad(r.primitivesReferenced, 4, true)}  of ${r.primitivesMirrored} mirrored in primitives.ts`);
  console.log(`${pad("references and literals by place", 44)}      ${Object.entries(r.byContext).map(([c, n]) => `${c} ${n.references}/${n.literals}`).join(" · ")}`);
  console.log(`${pad("`$description` on a set or group", 44)}${pad(Object.keys(t.descriptions).length, 4, true)}  ${Object.keys(t.descriptions).join(" ")}`);
  list("without a description (descriptions.ts)", t.withoutDescription);
  list("read by no component", t.unread);
  list("read only through a computed key", t.readOnlyDynamically);
  list("identical in light and dark", t.sameLightDark);
  list("identical in light and dark, by design", t.sameInDarkByDesign);
  list("in shared, overridden in one profile", t.sharedOverriddenInOneProfile.map((o) => `${o.path} (${o.profile})`));
  list("in some profiles but not all", t.partialProfiles.map((o) => `${o.path} (${o.profiles.join(",")})`));
  console.log("");
}
