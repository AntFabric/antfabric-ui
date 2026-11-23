import type { Ref } from "react";
import type { View } from "react-native";

/**
 * What every phone component passes through to its root view, beside its documented props: `testID` (an instance a test can find),
 * `nativeID` (what another view's `accessibilityLabelledBy` points at), `accessibilityLabel` and `accessibilityHint` (a product's name for
 * this instance, over the kit's), and a `ref` to the root view (React 19: a prop). Universal: the docs do not list them.
 *
 * With a `testID`, the root takes it and each part is `<testID>.<part>`; without one, the parts keep the kit's `<id>.<part>`, which the
 * catalogue's checks read.
 *
 * A root that wraps the one view with the role (a field's `TextInput`, a select's trigger, a sheet's dialog) spreads `rootProps(rest)` on
 * that view and keeps only `testID` and `style` itself.
 */
export interface RootProps<V = View> {
  testID?: string;
  nativeID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  ref?: Ref<V>;
}

/** The pass-through props in `props`, for the root view. `testID` is left out: give the root `partId(testID, id, "root")`. */
export function rootProps(props: object): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) if (v !== undefined && /^(?:nativeID|accessibilityLabel|accessibilityHint|ref)$/.test(k)) out[k] = v;
  return out;
}

/** Gives `el` to a ref a product passed, beside the kit's own: `ref={(el) => { own.current = el; setRef(ref, el); }}`. */
export function setRef<V>(ref: Ref<V> | undefined, el: V | null): void {
  if (typeof ref === "function") ref(el);
  else if (ref) (ref as { current: V | null }).current = el;
}

/** A part's `testID`: `<testID>` for the root and `<testID>.<part>` for the rest when the product gave one, else the kit's `<id>.<part>`. */
export function partId(testID: string | undefined, id: string, part: string): string {
  if (!testID) return `${id}.${part}`;
  return part === "root" ? testID : `${testID}.${part}`;
}
