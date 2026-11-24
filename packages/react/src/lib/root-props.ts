import type { Ref } from "react";

/**
 * What every component passes through to its root element, beside its documented props: an `id` (a label's `htmlFor`, a skip link, an
 * `aria-controls` elsewhere on the page), a `className` (a product's own stylesheet), `data-*` (tests, analytics) and `aria-*` (an
 * `aria-describedby` to help text the kit does not draw, an `aria-label` that names this instance), and a `ref` to the root element
 * (React 19: a prop, no `forwardRef`). Universal: the docs do not list them, as they do not list `style`, `styles` or `strings`.
 *
 *   export interface ButtonProps extends RootProps<HTMLButtonElement> { … }
 *   export function Button({ label, …, ...rest }: ButtonProps) {
 *     return <button {...kitAttrs} {...rootProps(rest)} style={…}>
 *
 * `rootProps` is spread after the kit's own attributes, so a product's `aria-label` names the instance. `data-af-*` is the kit's and is
 * never taken from props. A root that wraps the one element with the role (a field, a select, a sheet) splits them (`splitRootProps`).
 */
export type RootProps<E extends HTMLElement = HTMLElement> = {
  id?: string;
  className?: string;
  ref?: Ref<E>;
} & { [K in `data-${string}`]?: string | number | boolean | undefined } & { [K in `aria-${string}`]?: string | number | boolean | undefined };

const PASSED = /^(?:id|className|ref|data-(?!af-)[\w-]+|aria-[\w-]+)$/;

/** The pass-through attributes in `props` (anything else is left out): spread it on the root element. */
export function rootProps(props: object): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) if (v !== undefined && PASSED.test(k)) out[k] = v;
  return out;
}

/**
 * For a component whose root wraps the one element that carries its role (a field's input, a select's trigger, a chip's button, a sheet's
 * dialog): `control` holds `id`, `aria-*` and `ref`, for that element, so a `<label htmlFor>`, a form's jump to its first invalid field and the
 * product's `aria-label` reach it; `root` holds `className` and `data-*`, which stay on the root with `style`. Spread each after the kit's own
 * attributes on its element.
 */
export function splitRootProps(props: object): { root: Record<string, unknown>; control: Record<string, unknown> } {
  const root: Record<string, unknown> = {};
  const control: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rootProps(props))) (k === "className" || k.startsWith("data-") ? root : control)[k] = v;
  return { root, control };
}

/** Gives `el` to a ref a product passed, beside the kit's own: `ref={(el) => { own.current = el; setRef(ref, el); }}`. */
export function setRef<E>(ref: Ref<E> | undefined, el: E | null): void {
  if (typeof ref === "function") ref(el);
  else if (ref) (ref as { current: E | null }).current = el;
}
