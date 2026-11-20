/**
 * Which themes `defineTheme` built. A theme's values are written into a stylesheet, so only a theme that went through
 * `defineTheme`'s checks may reach one: an object that merely has the shape (parsed from JSON, say, or spread into a copy) is
 * refused by `themeCss`, `tokenValues` and `resolveTokens`.
 *
 * The mark is a registered symbol on the theme, not a module-private set, so a theme built by one copy of
 * `@antfabric/ui-core` is accepted by another (an app whose dependencies resolve two copies). JSON cannot carry a symbol, and the
 * property is not enumerable, so neither a parsed theme nor `{ ...theme }` has it.
 */

const BUILT = Symbol.for("@antfabric/ui-core/theme");

/** Marks a theme `defineTheme` is about to freeze. Returns it, for chaining. */
export function markBuilt<T extends object>(theme: T): T {
  Object.defineProperty(theme, BUILT, { value: true });
  return theme;
}

/** Throws unless `theme` is one `defineTheme` built; `who` is the caller, for the message. */
export function assertBuilt(theme: unknown, who: string): void {
  if (typeof theme !== "object" || theme === null || (theme as Record<symbol, unknown>)[BUILT] !== true)
    throw new Error(`${who}: themes must come from defineTheme (a theme stored as JSON goes back through defineTheme({ name, tokens, … }) before it is used)`);
}
