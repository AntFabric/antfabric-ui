import type { KeyboardEvent as ReactKeyboardEvent } from "react";

/**
 * The key belongs to an input method that is still composing (Japanese, Chinese, Korean, a dead key): Enter commits the candidate and
 * Escape cancels it, so neither may submit, choose, clear or close. Safari reports the committing keydown with `isComposing` false and
 * `keyCode` 229, hence both.
 *
 *   onKeyDown={(e) => { if (isComposing(e)) return; if (e.key === "Enter") submit(); }}
 */
export function isComposing(e: KeyboardEvent | ReactKeyboardEvent): boolean {
  const native = "nativeEvent" in e ? e.nativeEvent : e;
  return native.isComposing || native.keyCode === 229;
}
