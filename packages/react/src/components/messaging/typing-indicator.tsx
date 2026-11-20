import type { CSSProperties } from "react";
import { recipes, useDirection, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, row, rtl, text, truncate } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export interface TypingIndicatorProps extends RootProps<HTMLDivElement> {
  /** First names of the people typing in this conversation, oldest first. Never includes you. */
  names?: string[];
  /** This indicator's built-in text ("is typing", "Several people", the announced sentence) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["typing-indicator"]>;
  /** Per-part styles over the theme: `{ root: {…}, dot: {…}, who: {…} }`. */
  styles?: PartStyles<"typing-indicator">;
  style?: CSSProperties;
}

/** Read by screen readers, hidden from sight. */
const srOnly: CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" };

// Under reduced motion the kit stylesheet stops the bounce, and the dots rest at these opacities.
const DOTS = [
  { opacity: 0.35, delay: 0 },
  { opacity: 0.65, delay: 160 },
  { opacity: 1, delay: 320 },
];

export function TypingIndicator({ names = [], strings, styles, style, ...rest }: TypingIndicatorProps) {
  const s = useStrings("typing-indicator", strings);
  const r = useRecipe(recipes["typing-indicator"], { styles });
  const dir = useDirection();
  if (names.length === 0) return null;
  const who = names.length === 1 ? names[0]! : names.length === 2 ? s("two", { first: names[0]!, second: names[1]! }) : s("several");
  const verb = names.length === 1 ? s("isTyping") : s("areTyping");
  return (
    <div
      data-af-part="root"
      {...rootProps(rest)}
      style={css(row, partStyle(r, "root", { width: "100%", minHeight: 26, paddingTop: t.space["2xs"], paddingBottom: t.space.xs, fontStyle: "italic" }), style)}
    >
      {/* Not a live region: typing changes every few seconds and would talk over the reader. */}
      <span style={srOnly}>{s("announce", { who, verb })}</span>
      <div aria-hidden data-af-part="dots" style={css(row, partStyle(r, "dots", { gap: 3, flexShrink: 0 }))}>
        {DOTS.map((d, i) => (
          <span
            key={i}
            data-af-part="dot"
            style={partStyle(r, "dot", {
              opacity: d.opacity,
              animation: `af-bounce 1.2s ${t.ease.nudge} ${d.delay}ms infinite`,
            })}
          />
        ))}
      </div>
      <span aria-hidden data-af-part="who" style={css(text, truncate(1), partStyle(r, "who", { flexShrink: 1, ...rtl({ marginRight: -4 }, dir) }))}>
        {who}
      </span>
      <span aria-hidden data-af-part="verb" style={css(text, partStyle(r, "verb", { whiteSpace: "nowrap", flexShrink: 0 }))}>
        {s.parts("verbShown", { verb })}
      </span>
    </div>
  );
}
