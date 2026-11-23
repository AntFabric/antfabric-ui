import { useEffect, useRef, useState, type CSSProperties } from "react";
import { recipes, useControllable, useDirection, useStrings, type AgentStep, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, pressable, row, rtl, text, visuallyHidden } from "../../lib/style";
import { announce } from "../../lib/announce";
import { rootProps, type RootProps } from "../../lib/root-props";
import { AgentSteps } from "./agent-steps";

export interface ThinkingIndicatorProps extends RootProps<HTMLDivElement> {
  /** Every step this turn has taken, oldest first. Empty while the agent is only thinking. */
  steps?: AgentStep[];
  /** The agent's display name, for what a screen reader hears: "Invoice agent is thinking". Empty names none. */
  agentName?: string;
  /** The word beside the lattice, rotating through these every few seconds. Empty shows the strings' `word` ("Thinking") and keeps it still. */
  words?: string[];
  /** When this stretch began, in epoch ms, so the clock survives a screen switch. 0 counts from when it mounts. */
  since?: number;
  /** The steps are unfolded. Only drawn once there is a step. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** This indicator's built-in text (the word, what it announces, Show steps and Hide steps) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["thinking-indicator"]>;
  /** Per-part styles over the theme: `{ root: {…}, word: {…} }`. */
  styles?: PartStyles<"thinking-indicator">;
  style?: CSSProperties;
}

const MOOD_MS = 2400;
/** Ring of each cell from the centre: the ripple reaches the edges last. */
const RINGS = [2, 1, 2, 1, 0, 1, 2, 1, 2];
const RING_MS = 135;
const CYCLE_MS = 648;

/** 4.2s under a minute, then 1m 05s. */
function formatElapsed(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${String(Math.floor(s % 60)).padStart(2, "0")}s`;
}

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Whether the person asked for less motion. False on the server and on the first client render, so hydration matches; then it follows the setting, live. */
function useStill(): boolean {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.(REDUCED);
    if (!query) return;
    setStill(query.matches);
    const on = () => setStill(query.matches);
    query.addEventListener("change", on);
    return () => query.removeEventListener("change", on);
  }, []);
  return still;
}

export function ThinkingIndicator({ steps = [], agentName = "", words = [], since = 0, expanded, onExpandedChange, strings, styles, style, ...rest }: ThinkingIndicatorProps) {
  const s = useStrings("thinking-indicator", strings);
  const [unfolded = true, setUnfolded] = useControllable(expanded, onExpandedChange);
  const still = useStill();
  const dir = useDirection();
  const [mood, setMood] = useState(0);
  const clock = useRef<HTMLSpanElement>(null);
  const started = useRef(since || Date.now());
  const ui = useInteraction();
  const r = useRecipe(recipes["thinking-indicator"], { state: { on: still, focus: ui.focused }, styles });
  const hasTrace = steps.length > 0;
  const rotation = words.length > 0 ? words : [s("word")];
  // What a screen reader hears: what the agent is doing now, not the word on screen.
  const current = [...steps].reverse().find((st) => st.state === "running") ?? steps[steps.length - 1];
  const step = current ? (current.source ? s("stepVia", { label: current.label, source: current.source }) : current.label) : "";
  const announcement = !current
    ? agentName
      ? s("thinkingNamed", { name: agentName })
      : s("thinking")
    : agentName
      ? s("runningNamed", { name: agentName, step })
      : s("running", { step });

  // Said as it changes (what the agent is doing), through the page's one live region: a label on a status is not read when it changes.
  useEffect(() => {
    announce(announcement);
  }, [announcement]);

  useEffect(() => {
    if (still) return;
    const id = setInterval(() => setMood((m) => (m + 1) % rotation.length), MOOD_MS);
    return () => clearInterval(id);
  }, [still, rotation.length]);

  // The clock paints itself every 100 ms without re-rendering the row.
  useEffect(() => {
    started.current = since || started.current;
    const id = setInterval(() => {
      if (clock.current) clock.current.textContent = formatElapsed(Date.now() - started.current);
    }, 100);
    return () => clearInterval(id);
  }, [since]);

  const ink = r.word.color as string;
  const sheen: CSSProperties = still
    ? {}
    : {
        backgroundImage: `linear-gradient(100deg, color-mix(in srgb, ${ink} 45%, transparent) 30%, ${ink} 50%, color-mix(in srgb, ${ink} 45%, transparent) 70%)`,
        backgroundSize: "250% 100%",
        backgroundPosition: "125% 0",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        animation: "af-shimmer 1.8s linear infinite",
      };

  const head = (
    <>
      <span aria-hidden data-af-part="mark" style={css(row, { flex: "none", justifyContent: "center" }, r.mark)}>
        <span style={{ display: "grid", gridTemplateColumns: `repeat(3, ${r.cell.width})`, gap: t.space["3xs"] }}>
          {RINGS.map((ring, i) => (
            <span
              key={i}
              data-af-part="cell"
              style={partStyle(r, "cell", still ? { opacity: 0.6 } : { opacity: 0.15, animation: `af-lattice ${CYCLE_MS}ms ${t.ease.standard} ${ring * RING_MS}ms infinite` })}
            />
          ))}
        </span>
      </span>
      <span aria-hidden data-af-part="word" style={css(text, { whiteSpace: "nowrap", lineHeight: 1.2 }, partStyle(r, "word", sheen))}>
        {s.parts("wordShown", { word: rotation[mood % rotation.length]! })}
      </span>
      <span aria-hidden ref={clock} data-af-part="clock" style={css(text, { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }, r.clock)}>
        {formatElapsed(0)}
      </span>
      {hasTrace && (
        <Icon
          part="chevron"
          name="chevron-down"
          size={r.chevron.width}
          color={r.chevron.color}
          style={partStyle(r, "chevron", { transform: unfolded ? "rotate(180deg)" : "none", transition: `transform ${t.duration.base} ${t.ease.out}` })}
        />
      )}
    </>
  );

  return (
    <div data-af-part="root" {...rootProps(rest)} style={css(box, { alignItems: "flex-start", alignSelf: "flex-start" }, r.root, style)}>
      {hasTrace ? (
        <button
          type="button"
          data-af-part="toggle"
          data-af-press
          aria-expanded={unfolded}
          aria-label={s("toggleLabel", { word: s("wordShown", { word: rotation[mood % rotation.length]! }), action: unfolded ? s("hideSteps") : s("showSteps") })}
          onClick={() => setUnfolded(!unfolded)}
          {...ui.handlers}
          style={css(pressable, row, rtl({ display: "inline-flex", whiteSpace: "nowrap", textAlign: "left" }, dir), r.head, r.toggle)}
        >
          {head}
        </button>
      ) : (
        <div data-af-part="head" style={css(row, { display: "inline-flex" }, r.head)}>
          {head}
          {/* What the drawing says, for a reader moving through the page: plain text, not a live region (the change is announced). */}
          <span style={visuallyHidden}>{announcement}</span>
        </div>
      )}
      {hasTrace && (
        <div aria-hidden={!unfolded} style={{ display: "grid", gridTemplateRows: unfolded ? "1fr" : "0fr", transition: `grid-template-rows 350ms ${t.ease.out}`, alignSelf: "stretch" }}>
          <div style={{ overflow: "hidden", minHeight: 0 }}>
            <div data-af-part="trace" style={css(box, rtl({ paddingLeft: `calc(${r.mark.width} + ${t.space.sm})` }, dir), { paddingBottom: t.space["3xs"] }, r.trace)}>
              <AgentSteps steps={steps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
