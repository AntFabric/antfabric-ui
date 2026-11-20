import { useEffect, useId, useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { recipes, type KitStrings } from "@antfabric-ui/core";
import { t } from "../../tokens";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, pressable, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export type CardLevel = "pane" | "rail" | "inner";
export type CardElevate = "none" | "hairline" | "card" | "raise" | "float";
export type CardTint = "default" | "brand" | "recessed";
export type CardPad = "default" | "none";

export interface CardProps extends RootProps<HTMLDivElement> {
  /** Whatever the card holds. The card adds the frame and an 8px gap between direct children; it never styles the content. */
  children?: ReactNode;
  /** The nesting level, named instead of the radius: pane 16 → rail 14 → inner 12. */
  level?: CardLevel;
  /** card on the cream page, hairline on a tinted surface, none for a card inside a panel. */
  elevate?: CardElevate;
  /** brand is a coral-tinted note ("Fabric wrote this"); recessed is a box on white. */
  tint?: CardTint;
  /** The whole card opens something. Hover fills it; the border and the shadow hold still. */
  interactive?: boolean;
  /** Accessible name of the press target when interactive, e.g. "Open Checkout revamp". Left out, the target is named by the card's first heading, else by its text. */
  label?: string;
  /** A card that navigates: the stretched target is an `<a href>`, so ⌘-click and middle-click open it in a new tab. A plain click calls `onPress` (and stays on the page) when there is one. */
  href?: string;
  pad?: CardPad;
  onPress?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, placeholder: {…} }`. */
  styles?: PartStyles<"card">;
  /** Built-in text for this instance. The web has none of its own: the long-press action's label is the phone's. */
  strings?: Partial<KitStrings["card"]>;
  style?: CSSProperties;
}

/** The layout and the motion no token decides; what the tokens decide (fill, edge, radius, shadow, padding) is the recipe's. */
const root: CSSProperties = { ...box, transition: `background-color ${t.duration.fast}, color ${t.duration.fast}` };

// The stretched press target: under the content, so a nested button stays its own control.
const hit: CSSProperties = { ...pressable, position: "absolute", inset: 0, borderRadius: "inherit", zIndex: 0 };

const placeholder: CSSProperties = { ...text, minHeight: 64, alignSelf: "stretch" };

/** A click on the card's own surface opens it; one on a control inside it belongs to that control. */
const onSurface = (e: MouseEvent<HTMLElement>) => !(e.target as HTMLElement).closest?.("button, a, input, textarea, select, [role='button'], [data-af-press]");

export function Card({
  children,
  level = "pane",
  elevate = "hairline",
  tint = "default",
  interactive = false,
  label = "",
  href,
  pad = "default",
  onPress,
  styles,
  style,
  ref,
  ...rest
}: CardProps) {
  const host = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLElement | null>(null);
  const headingId = useId();
  // An interactive card with no `label` is named by its first heading (else its text), so the stretched target is never nameless.
  useEffect(() => {
    const el = target.current;
    if (!interactive || label || !el) return;
    const heading = host.current?.querySelector<HTMLElement>("h1, h2, h3, h4, h5, h6, [role='heading']");
    if (heading) {
      if (!heading.id) heading.id = headingId;
      el.setAttribute("aria-labelledby", heading.id);
      el.removeAttribute("aria-label");
      return;
    }
    el.removeAttribute("aria-labelledby");
    const said = (host.current?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
    if (said) el.setAttribute("aria-label", said);
  });
  const ui = useInteraction();
  const { onFocus, onBlur, ...pointer } = ui.handlers;
  const r = useRecipe(recipes.card, { variants: { level, elevate, tint, pad }, state: { hover: interactive && ui.hovered, focus: interactive && ui.focused }, styles });
  return (
    <div
      ref={(el) => {
        host.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      data-af-part="root"
      {...rootProps(rest)}
      {...(interactive ? pointer : null)}
      onClick={interactive ? (e) => onSurface(e) && onPress?.() : undefined}
      style={css(root, partStyle(r, "root", pad === "none" && { padding: 0 }, interactive && { cursor: "pointer" }), style)}
    >
      {interactive && href ? (
        <a
          ref={(el) => {
            target.current = el;
          }}
          href={href}
          data-af-press
          aria-label={label || undefined}
          onClick={(e) => {
            // ⌘-, ctrl- and middle-click are the browser's; a plain click is the product's when it gave `onPress`.
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !onPress) return;
            e.preventDefault();
            onPress();
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          style={css(hit, { display: "block" })}
        />
      ) : interactive ? (
        <button ref={(el) => {
            target.current = el;
          }}
          type="button" data-af-press aria-label={label || undefined} onClick={() => onPress?.()} onFocus={onFocus} onBlur={onBlur} style={hit} />
      ) : null}
      {typeof children === "string" || typeof children === "number" ? <span data-af-part="placeholder" style={css(placeholder, r.placeholder)}>{children}</span> : children}
    </div>
  );
}
