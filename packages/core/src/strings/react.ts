import { createContext, createElement, useContext, useMemo, type ReactNode } from "react";
import { mergeStrings, stringsFor, stringsKey, type ComponentStrings, type StringsFn, type StringsId, type StringsOverrides } from "./index";

/** Which way a tree's text runs. `rtl` mirrors the layout: the kits draw with logical properties (`marginInlineStart`), so only arrows and slides read it. */
export type Direction = "ltr" | "rtl";

/** What a tree says: its merged overrides, the locale that picks plural forms and formats numbers and dates, and the direction. */
interface StringsContextValue {
  overrides: StringsOverrides | undefined;
  locale: string;
  dir: Direction;
}

const StringsContext = createContext<StringsContextValue>({ overrides: undefined, locale: "en", dir: "ltr" });

export interface StringsProviderProps {
  /** Text over the defaults, per component id and key. Merged over the provider above's, key by key. */
  strings?: StringsOverrides;
  /** The locale plural forms are chosen in, and numbers, dates and sorting are formatted in (default: the provider above's, else `"en"`). */
  locale?: string;
  /** Which way the text runs (default: the provider above's, else `"ltr"`). */
  dir?: Direction;
  children: ReactNode;
}

/**
 * Where a tree's `strings` and `locale` live. Both kits' root and provider render one, so a product passes them where it already passes
 * the platform or the theme.
 */
export function StringsProvider({ strings, locale, dir, children }: StringsProviderProps) {
  const parent = useContext(StringsContext);
  // By content, so an inline `strings={{ … }}` does not give every component below a new function on every render.
  const text = stringsKey(strings);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `text` is `strings`' content
  const merged = useMemo(() => mergeStrings(parent.overrides, strings), [parent.overrides, text]);
  const chosen = locale ?? parent.locale;
  const way = dir ?? parent.dir;
  const value = useMemo<StringsContextValue>(() => ({ overrides: merged, locale: chosen, dir: way }), [merged, chosen, way]);
  return createElement(StringsContext.Provider, { value }, children);
}

/**
 * The text of the component `id`, for authors of kit components (a product passes `strings` instead): `s(key, vars?)` is the instance's
 * text, else the tree's, else the English default, with `{name}` placeholders filled and a `count` choosing the plural form.
 * Stable while the tree's strings, the locale and the instance's content are.
 *
 *   const s = useStrings("text-field", strings);
 *   s("characterCount", { current: 3, max: 80 });
 */
export function useStrings<Id extends StringsId>(id: Id, instance?: ComponentStrings<Id>): StringsFn<Id> {
  const { overrides, locale } = useContext(StringsContext);
  const text = stringsKey(instance);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `text` is `instance`'s content
  return useMemo(() => stringsFor(id, overrides, instance, locale), [id, overrides, locale, text]);
}

/**
 * The tree's locale for `Intl`: numbers, dates, currency and sorting. The default `"en"` is read as `"en-US"`, what the formats have always
 * written, so a product that sets no locale draws what it drew.
 */
export function useLocale(): string {
  const { locale } = useContext(StringsContext);
  return locale === "en" ? "en-US" : locale;
}

/** Which way the tree's text runs: `"rtl"` turns the arrow keys round in a row (ArrowRight goes to the previous item) and mirrors slides. */
export function useDirection(): Direction {
  return useContext(StringsContext).dir;
}
