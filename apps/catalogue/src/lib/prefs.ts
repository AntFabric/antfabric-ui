/**
 * The visitor's choices: platform, light or dark (`scheme`), each platform's OS, and the
 * iOS / macOS version. Remembered in localStorage. The page's switches (runtime.ts) write them; every preview island reads them
 * through `usePrefs`, so a switch redraws every preview at once.
 */

import { useSyncExternalStore } from "react";
import type { OS, Platform, Scheme } from "@antfabric/ui-core";


export interface Prefs {
  platform: Platform;
  /** Light or dark. (Before themes existed this was stored as `theme`; `load` still reads that.) */
  scheme: Scheme;
  os: { desktop: OS; mobile: OS };
  /** Major version for the OSes whose look changed with Liquid Glass. */
  version: { ios: number; mac: number };
}

const KEY = "af-ui-prefs";

export const DEFAULT_PREFS: Prefs = {
  platform: "web",
  scheme: "light",
  os: { desktop: "mac", mobile: "ios" },
  version: { ios: 26, mac: 26 },
};

function load(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  const system: Scheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      // `theme` is a name the page stored before: a scheme ("light" or "dark") once, later a product theme, which the catalogue no longer switches.
      const { theme: stored, ...p } = JSON.parse(raw) as Partial<Prefs> & { theme?: string };
      // A returning visitor's old `theme` was "light" or "dark": that is their scheme now.
      const old = stored === "light" || stored === "dark" ? stored : undefined;
      return {
        ...DEFAULT_PREFS,
        ...p,
        scheme: p.scheme ?? old ?? system,
        os: { ...DEFAULT_PREFS.os, ...(p.os ?? {}) },
        version: { ...DEFAULT_PREFS.version, ...(p.version ?? {}) },
      };
    }
  } catch {
    /* private mode or blocked storage: defaults are fine */
  }
  return { ...DEFAULT_PREFS, scheme: system };
}

let prefs = load();
const listeners = new Set<() => void>();

export function getPrefs(): Prefs {
  return prefs;
}

export function setPrefs(next: Prefs) {
  prefs = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((f) => f());
}

export function subscribe(f: () => void) {
  listeners.add(f);
  return () => listeners.delete(f);
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getPrefs, () => DEFAULT_PREFS);
}

/** The OS a platform's previews draw, and its version where the version changes the look. */
export function osOf(p: Prefs, platform: Platform): { os: OS; osVersion?: number } {
  const os = platform === "web" ? "browser" : p.os[platform];
  return { os, osVersion: os === "ios" || os === "mac" ? p.version[os] : undefined };
}
