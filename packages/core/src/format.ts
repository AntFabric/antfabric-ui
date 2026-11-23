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

/**
 * The keys of a shortcut string. `+` joins them, so the plus key itself is written `+` where a key goes (`Mod++`, `Ctrl+Shift++`, `+`
 * alone) or by name (`Shift+Plus`).
 */
function shortcutKeys(src: string): string[] {
  const parts = src.split("+").map((k) => k.trim());
  const keys: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (part !== "") {
      keys.push(part.toLowerCase() === "plus" ? "+" : part);
      continue;
    }
    // A literal `+` splits into two empty pieces (`"Mod++"` → `Mod`, ``, ``): one key.
    keys.push("+");
    if (parts[i + 1] === "") i++;
  }
  return keys;
}

/**
 * `Mod+Shift+K` → `⌘⇧K` on a Mac, `Ctrl+Shift+K` elsewhere. One shortcut string, the right glyphs per OS. The plus key is `+` on a Mac
 * (`Mod++` → `⌘+`) and `Plus` elsewhere (`Ctrl+Plus`), where `+` already joins the keys.
 *
 * `"browser"` reads as Ctrl: a server render cannot know the visitor's machine. On the web, `usePlatform().shortcutOs` (React kit) is the
 * visitor's OS once mounted (`mac` on a Mac), so a component passes that rather than `os`.
 */
export function formatShortcut(src: string, os: OS | string): string {
  const keys = shortcutKeys(src);
  if (os === "mac" || os === "ios") {
    return keys.map((k) => MAC_KEYS[k.toLowerCase()] ?? k.toUpperCase()).join("");
  }
  return keys
    .map((k) => {
      const l = k.toLowerCase();
      if (l === "mod" || l === "cmd") return "Ctrl";
      if (l === "option") return "Alt";
      if (l === "+") return "Plus";
      if (l.length === 1) return k.toUpperCase();
      return k[0]!.toUpperCase() + k.slice(1);
    })
    .join("+");
}

/** `120` → `"99+"`. A badge never grows past its cap. */
export function cap(n: number, max = 99): string {
  return n > max ? `${max}+` : String(n);
}

// One character as a person sees it, not one UTF-16 unit, so an emoji (a surrogate pair, a ZWJ family, a flag) stays whole. Where there is
// no `Intl.Segmenter` (older Hermes), `Array.from` keeps a code point whole: right for a single emoji, the first person of a joined one.
const graphemes: { segment(s: string): Iterable<{ segment: string }> } | null =
  typeof Intl !== "undefined" && typeof (Intl as { Segmenter?: unknown }).Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
function firstGrapheme(word: string): string {
  if (graphemes) for (const { segment } of graphemes.segment(word)) return segment;
  return Array.from(word)[0] ?? "";
}

/** `"Priya Raman"` → `"PR"`, `"🦊 Fox"` → `"🦊F"`. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => firstGrapheme(w).toUpperCase())
    .join("");
}

/** `"text-field"` → `"TextField"`: a component id as its exported name, and a lucide icon name as its export. */
export const pascal = (id: string): string => id.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
