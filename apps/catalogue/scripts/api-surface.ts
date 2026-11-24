/**
 * The public surface of the three packages, as data: every token (its type, tier and visibility) and every name each entry exports, types
 * included. `reports/api.lock.json` is this, committed; `pnpm api:lock` rewrites it and refuses to drop an entry without a major version,
 * and `pnpm check api` fails when the two differ. So a token or an export cannot leave, and none can arrive unreviewed: the lock's diff is
 * what a release changes for the people who installed the last one.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { renames, tokenMeta } from "@antfabric/ui-core";
import { tokenPaths } from "./token-leaves";

export interface ApiSurface {
  /** The version of the packages this was locked at. */
  version: string;
  /** Every token path, with `<type> <tier>` and `internal` where it is left out of the documented set. */
  tokens: Record<string, string>;
  /** Every name each entry exports, values and types, by import specifier. */
  exports: Record<string, string[]>;
}

export const API_LOCK = "reports/api.lock.json";
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const PACKAGES = ["core", "react", "react-native"] as const;

const packageJson = (name: string) => JSON.parse(readFileSync(join(ROOT, "packages", name, "package.json"), "utf8")) as { name: string; version: string; exports: Record<string, string> };

/** The names a package's source entries export, read by the type checker so that types count too. */
function exportsOf(pkg: (typeof PACKAGES)[number]): Record<string, string[]> {
  const dir = join(ROOT, "packages", pkg);
  const json = packageJson(pkg);
  const entries = Object.entries(json.exports).filter(([, file]) => /\.tsx?$/.test(file));
  const configPath = join(dir, "tsconfig.json");
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (d) => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n")); } });
  if (!parsed) throw new Error(`api: cannot read ${configPath}`);
  const files = entries.map(([, file]) => join(dir, file));
  const program = ts.createProgram({ rootNames: files, options: { ...parsed.options, noEmit: true } });
  const checker = program.getTypeChecker();
  const out: Record<string, string[]> = {};
  entries.forEach(([entry], i) => {
    const source = program.getSourceFile(files[i]!);
    const symbol = source && checker.getSymbolAtLocation(source);
    if (!symbol) throw new Error(`api: ${files[i]} is not a module`);
    out[entry === "." ? json.name : `${json.name}${entry.slice(1)}`] = checker.getExportsOfModule(symbol).map((s) => s.getName()).sort();
  });
  return out;
}

export function apiSurface(): ApiSurface {
  const tokens: Record<string, string> = {};
  for (const path of [...tokenPaths()].sort()) {
    const m = tokenMeta(path);
    tokens[path] = `${m.type} ${m.tier}${m.visibility === "public" ? "" : ` ${m.visibility}`}`;
  }
  // A renamed token's old path is still part of the surface until it is removed: it reads `deprecated → <new path>`.
  for (const [old, now] of Object.entries(renames as Record<string, string>)) tokens[old] = `deprecated → ${now}`;
  return { version: packageJson("core").version, tokens: Object.fromEntries(Object.entries(tokens).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))), exports: Object.assign({}, ...PACKAGES.map(exportsOf)) };
}

/** One line per entry: `token fg.muted = color semantic`, `export @antfabric/ui-core tokensCss`. */
export function apiEntries(surface: Pick<ApiSurface, "tokens" | "exports">): Map<string, string> {
  const out = new Map<string, string>();
  for (const [path, what] of Object.entries(surface.tokens)) out.set(`token ${path}`, what);
  for (const [entry, names] of Object.entries(surface.exports)) for (const name of names) out.set(`export ${entry} ${name}`, "");
  return out;
}

export interface ApiDiff {
  added: string[];
  removed: string[];
  /** A token whose type or tier moved, or that became internal: `token fg.muted: color semantic → dimension semantic`. */
  changed: string[];
}

export function apiDiff(was: Pick<ApiSurface, "tokens" | "exports">, now: Pick<ApiSurface, "tokens" | "exports">): ApiDiff {
  const [a, b] = [apiEntries(was), apiEntries(now)];
  return {
    added: [...b.keys()].filter((k) => !a.has(k)),
    removed: [...a.keys()].filter((k) => !b.has(k)),
    changed: [...b].filter(([k, v]) => a.has(k) && a.get(k) !== v).map(([k, v]) => `${k}: ${a.get(k)} → ${v}`),
  };
}

/** Whether a change breaks the people on the locked version: something left, or a token is no longer what it was. A token that only became internal, or that was renamed and kept as a deprecated name, still works, so it does not. */
export const breaking = (d: ApiDiff): string[] => [...d.removed, ...d.changed.filter((c) => !/^token \S+: (\S+ \S+) → \1 internal$/.test(c) && !/^token \S+: .* → deprecated → \S+$/.test(c))];

export const major = (version: string) => Number(version.split(".")[0]);
export const readLock = (): ApiSurface | null => {
  try {
    return JSON.parse(readFileSync(join(ROOT, API_LOCK), "utf8")) as ApiSurface;
  } catch {
    return null;
  }
};
export const lockText = (surface: ApiSurface) => `${JSON.stringify(surface, null, 2)}\n`;
export const lockPath = () => join(ROOT, API_LOCK);
export const lockDir = () => dirname(lockPath());
