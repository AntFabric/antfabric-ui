/** Text helpers both kits use, so a count or a shortcut reads the same on every platform. */

import type { OS } from "./types";

const MAC_KEYS: Record<string, string> = {
  mod: "⌘",
  cmd: "⌘",
  ctrl: "⌃",
  control: "⌃",
  shift: "⇧",
  alt: "⌥",
  option: "⌥",
  enter: "↩",
  return: "↩",
  esc: "⎋",
  escape: "⎋",
  tab: "⇥",
  delete: "⌫",
  space: "Space",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
  backspace: "⌫",
};

/** `Mod+Shift+K` → `⌘⇧K` on a Mac, `Ctrl+Shift+K` elsewhere. One shortcut string, the right glyphs per OS. */
export function formatShortcut(src: string, os: OS | string): string {
  const keys = src.split("+").map((k) => k.trim());
  if (os === "mac" || os === "ios") {
    return keys.map((k) => MAC_KEYS[k.toLowerCase()] ?? k.toUpperCase()).join("");
  }
  return keys
    .map((k) => {
      const l = k.toLowerCase();
      if (l === "mod" || l === "cmd") return "Ctrl";
      if (l === "option") return "Alt";
      if (l.length === 1) return k.toUpperCase();
      return k[0]!.toUpperCase() + k.slice(1);
    })
    .join("+");
}

/** `120` → `"99+"`. A badge never grows past its cap. */
export function cap(n: number, max = 99): string {
  return n > max ? `${max}+` : String(n);
}

/** `"Priya Raman"` → `"PR"`. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** `"text-field"` → `"TextField"`: a component id as its exported name, and a lucide icon name as its export. */
export const pascal = (id: string): string => id.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
