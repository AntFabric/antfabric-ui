/**
 * The AntFabric UI 1.0 codemod. Reads a repository that uses 0.1 and rewrites what the migration ledger (`reports/migration/`) can be
 * rewritten mechanically; everything else is printed as a manual list with file:line and the ledger file that says what to do.
 *
 *   pnpm exec tsx scripts/migrate-1.mts <repo> [--via <wrapper-package> --wrapper <path>] [--write] [--no-diff]
 *
 * <repo>       the repository to migrate
 * --via        the wrapper package the repository imports instead of @antfabric-ui/* (`@antfabric/ui-kit`)
 * --wrapper    the wrapper's source folder, relative to <repo>: its re-exports and aliases are read, and its entry files are fixed
 * --write      write the changes. Without it, nothing is written and the diff is printed.
 * --no-diff    print only the summary and the manual list
 *
 * What each rule does is in `scripts/migrate-1/renames.ts`, one entry per ledger line; `pnpm migrate:1:test` runs the fixtures.
 */
import path from "node:path";
import { migrate, report, unifiedDiff, writeFiles } from "./migrate-1/engine.mts";

const argv = process.argv.slice(2);
const positional: string[] = [];
const flags: Record<string, string | true> = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]!;
  if (a === "--write" || a === "--no-diff") flags[a.slice(2)] = true;
  else if (a.startsWith("--")) flags[a.slice(2)] = argv[++i] ?? "";
  else positional.push(a);
}
if (!positional[0] || flags.via === "" || flags.wrapper === "") {
  console.error("usage: migrate-1.mts <repo> [--via <wrapper-package> --wrapper <path>] [--write] [--no-diff]");
  process.exit(2);
}
if (flags.wrapper && !flags.via) {
  console.error("--wrapper needs --via");
  process.exit(2);
}

const result = migrate({
  repo: path.resolve(positional[0]),
  via: typeof flags.via === "string" ? flags.via : undefined,
  wrapper: typeof flags.wrapper === "string" ? flags.wrapper : undefined,
});

process.stdout.write(report(result));
if (!flags["no-diff"]) {
  const diff = unifiedDiff(result);
  if (diff) process.stdout.write(`\n${diff}\n`);
}
if (flags.write) {
  writeFiles(result);
  process.stdout.write(`\nWrote ${result.files.length} files.\n`);
  if (result.files.length) {
    process.stdout.write(`Next: run your formatter on them (the codemod leaves the lines it did not rewrite as they were), then the manual list above.\n`);
  }
} else if (result.files.length) {
  process.stdout.write(`\nDry run: nothing was written. Run again with --write to apply.\n`);
}
