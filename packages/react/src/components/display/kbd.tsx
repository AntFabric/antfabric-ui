import { useMemo, type CSSProperties } from "react";
import { formatShortcut, recipes, useStrings, type KitStrings, type OS } from "@antfabric-ui/core";
import { usePlatform } from "../../platform";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, text, visuallyHidden } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export type KbdTone = "default" | "inverse" | "bare";

export interface KbdProps extends RootProps<HTMLElement> {
  /** Written once, `Mod+Shift+K`; each OS draws its own glyphs. */
  keys: string;
  /** inverse sits on a dark tooltip; bare drops the key cap for a quiet hint in a row. */
  tone?: KbdTone;
  /** The recipe part this key cap is in another component (`data-af-part`), when it is one; its own is `root`. */
  part?: string;
  /** Per-part styles over the theme: `{ root: {…} }`. */
  styles?: PartStyles<"kbd">;
  /** Built-in text (the key names a screen reader says) for this instance. */
  strings?: Partial<KitStrings["kbd"]>;
  style?: CSSProperties;
}

/** The layout no token decides; what the tokens decide (the cap's fill, edge, ink and type) is the recipe's. */
const root: CSSProperties = { display: "flex", flexDirection: "row", alignItems: "center", alignSelf: "flex-start", flexShrink: 0, boxSizing: "border-box", height: 20, margin: 0 };

/**
 * The bare tone has no key cap, so no edge and no padding; the recipe has no zero, so these are the kit's. The bottom style is named
 * here too, so the default tone's `border-bottom-style` is not removed on a rerender (React warns when a longhand goes beside a shorthand).
 */
const BARE: CSSProperties = { borderWidth: 0, borderBottomStyle: "solid", borderBottomWidth: 0, paddingInline: 0 };

function spoken(keys: string, os: OS, said: Record<string, [mac: string, other: string]>): string {
  return keys
    .split("+")
    .map((k) => k.trim())
    .map((k) => said[k.toLowerCase()]?.[os === "mac" ? 0 : 1] ?? (k.length === 1 ? k.toUpperCase() : k))
    .join(" ");
}

/**
 * A shortcut written once (`Mod+Shift+K`) as `aria-keyshortcuts` for the control it belongs to: `Meta` or `Control` for Mod, the key
 * names ARIA uses. Put it on the control, not on the cap: the cap is for eyes, the attribute is how assistive tech learns the key.
 */
export function ariaShortcut(keys: string, os: OS): string {
  // ARIA's key names are the words with a capital: Control, Meta, Alt, Shift, Enter, Escape.
  const word = (lower: string) =>
    lower === "mod" ? (os === "mac" ? "meta" : "control")
    : lower === "cmd" ? "meta"
    : lower === "ctrl" || lower === "control" ? "control"
    : lower === "alt" || lower === "option" ? "alt"
    : lower === "shift" ? "shift"
    : lower === "enter" || lower === "return" ? "enter"
    : lower === "esc" || lower === "escape" ? "escape"
    : "";
  return keys
    .split("+")
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => {
      const named = word(k.toLowerCase());
      return named ? named.charAt(0).toUpperCase() + named.slice(1) : k.length === 1 ? k.toUpperCase() : k;
    })
    .join("+");
}

export function Kbd({ keys, tone = "default", part = "root", styles, strings, style, ...rest }: KbdProps) {
  const { os } = usePlatform();
  const s = useStrings("kbd", strings);
  // How each key is said, on a Mac and elsewhere: the accessible name is words, not glyphs.
  const said = useMemo<Record<string, [mac: string, other: string]>>(
    () => ({
      mod: [s("command"), s("control")],
      cmd: [s("command"), s("control")],
      ctrl: [s("control"), s("control")],
      control: [s("control"), s("control")],
      alt: [s("option"), s("alt")],
      option: [s("option"), s("alt")],
      shift: [s("shift"), s("shift")],
      enter: [s("return"), s("enter")],
      return: [s("return"), s("enter")],
      esc: [s("escape"), s("escape")],
      escape: [s("escape"), s("escape")],
      tab: [s("tab"), s("tab")],
      delete: [s("delete"), s("delete")],
      backspace: [s("delete"), s("backspace")],
      space: [s("space"), s("space")],
      up: [s("up"), s("up")],
      down: [s("down"), s("down")],
      left: [s("left"), s("left")],
      right: [s("right"), s("right")],
    }),
    [s],
  );
  const r = useRecipe(recipes.kbd, { variants: { tone }, styles });
  return (
    <kbd data-af-part={part} {...rootProps(rest)} style={css(root, partStyle(r, "root", tone === "bare" && BARE), style)}>
      {/* The glyphs are for eyes; the words are what a screen reader reads (a <kbd> has no role to carry a name). */}
      <span aria-hidden style={css(text, { lineHeight: 1, whiteSpace: "nowrap" })}>{formatShortcut(keys, os)}</span>
      <span style={visuallyHidden}>{spoken(keys, os, said)}</span>
    </kbd>
  );
}
