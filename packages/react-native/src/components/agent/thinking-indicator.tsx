import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, Text, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type AgentStep, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon } from "../../lib/icon";
import { announce } from "../../lib/a11y";
import { useReducedMotion } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { AgentSteps } from "./agent-steps";

export interface ThinkingIndicatorProps extends RootProps {
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
  style?: ViewStyle;
}

const MOOD_MS = 2400;
/** Ring of each cell from the centre: the ripple reaches the edges last. */
const RINGS = [2, 1, 2, 1, 0, 1, 2, 1, 2];
const RING_MS = 135;
/** One 648 ms cycle: up over 18%, held to 42%, down by 62%, then dim. */
const PHASES = [116.64, 155.52, 129.6, 246.24];

function formatElapsed(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${String(Math.floor(s % 60)).padStart(2, "0")}s`;
}

const useStyles = createStyles((t) => ({
  root: { alignSelf: "flex-start" },
  head: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start" },
  mark: { alignItems: "center", justifyContent: "center", flexShrink: 0 },
  lattice: { flexDirection: "row", flexWrap: "wrap", gap: t.space["3xs"] },
  clock: { fontVariant: ["tabular-nums"] },
}));

/**
 * The clock paints itself every 100 ms in a child of its own: its state changes re-render this one Text, not the indicator, its lattice
 * and its steps (which would be ten renders a second on the JS thread, in a busy chat screen with the keyboard open).
 */
function Clock({ started, style }: { started: { current: number }; style: object }) {
  const [elapsed, setElapsed] = useState(() => Date.now() - started.current);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - started.current), 100);
    return () => clearInterval(id);
  }, [started]);
  return (
    <Text testID="thinking-indicator.clock" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden maxFontSizeMultiplier={fontScale.chrome} style={style}>
      {formatElapsed(elapsed)}
    </Text>
  );
}

function Cell({ ring, animate, style }: { ring: number; animate: boolean; style: ViewStyle }) {
  const v = useRef(new Animated.Value(0.15)).current;
  useEffect(() => {
    if (!animate) return;
    const native = Platform.OS !== "web";
    const easing = Easing.bezier(0.77, 0, 0.175, 1);
    const [up, hold, down, rest] = PHASES as [number, number, number, number];
    const loop = Animated.sequence([
      Animated.delay(ring * RING_MS),
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: up, easing, useNativeDriver: native }),
          Animated.delay(hold),
          Animated.timing(v, { toValue: 0.15, duration: down, easing, useNativeDriver: native }),
          Animated.delay(rest),
        ]),
      ),
    ]);
    loop.start();
    return () => loop.stop();
  }, [animate, ring, v]);
  return <Animated.View testID="thinking-indicator.cell" style={animate ? [style, { opacity: v }] : style} />;
}

/** The word breathes on the phone: React Native has no text clipped to a moving gradient without a mask. */
function useBreath(still: boolean) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (still) return;
    const native = Platform.OS !== "web";
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 0.45, duration: 900, easing: Easing.linear, useNativeDriver: native }),
        Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [still, v]);
  return v;
}

export function ThinkingIndicator({ steps = [], agentName = "", words = [], since = 0, expanded = true, onExpandedChange, strings, styles, style, testID, ...rest }: ThinkingIndicatorProps) {
  const { t } = useTheme();
  const s = useStyles();
  const str = useStrings("thinking-indicator", strings);
  const [unfolded, setUnfolded] = useControllable(expanded, onExpandedChange);
  // Follows Settings live: turning Reduce Motion on stops the lattice at once.
  const still = useReducedMotion();
  const [mood, setMood] = useState(0);
  const started = useRef(since || Date.now());
  const press = usePress();
  const r = useRecipe(recipes["thinking-indicator"], { state: { on: still, focus: press.focused }, styles });
  const breath = useBreath(still);
  const hasTrace = steps.length > 0;
  const rotation = words.length > 0 ? words : [str("word")];
  // What a screen reader hears: what the agent is doing now, not the word on screen.
  const current = [...steps].reverse().find((st) => st.state === "running") ?? steps[steps.length - 1];
  const step = current ? (current.source ? str("stepVia", { label: current.label, source: current.source }) : current.label) : "";
  const announcement = !current
    ? agentName
      ? str("thinkingNamed", { name: agentName })
      : str("thinking")
    : agentName
      ? str("runningNamed", { name: agentName, step })
      : str("running", { step });

  useEffect(() => {
    if (still) return;
    const id = setInterval(() => setMood((m) => (m + 1) % rotation.length), MOOD_MS);
    return () => clearInterval(id);
  }, [still, rotation.length]);

  started.current = since || started.current;

  // iOS has no live regions: what the agent is doing is said as it changes.
  useEffect(() => {
    announce(announcement);
  }, [announcement]);

  const hidden = { importantForAccessibility: "no-hide-descendants" as const, accessibilityElementsHidden: true };
  const markW = r.mark.view.width as number;
  // Resting cells are 60% lit. A `styles.cell.opacity` replaces the ripple: it is the escape hatch, so it beats what the kit computes.
  const cell = partStyle(r, "cell", { view: still ? { opacity: 0.6 } : undefined });
  const trace = partStyle(r, "trace", { view: { paddingLeft: markW + t.space.sm } });
  // The caret's size is its width and height; what else `styles.chevron` sets goes on the glyph.
  const { width: chevronSize, height: _ch, ...chevronRest } = r.chevron.view;
  // Three cells and the two gaps between them.
  const latticeW = 3 * (r.cell.view.width as number) + 2 * t.space["3xs"];
  const head = (
    <>
      <View testID="thinking-indicator.mark" {...hidden} style={[s.mark, r.mark.view]}>
        <View style={[s.lattice, { width: latticeW }]}>
          {RINGS.map((ring, i) => (
            <Cell key={i} ring={ring} animate={!still && styles?.cell?.opacity === undefined} style={cell.view} />
          ))}
        </View>
      </View>
      <Animated.Text testID="thinking-indicator.word" {...hidden} numberOfLines={1} maxFontSizeMultiplier={fontScale.chrome} style={[r.word.view, r.word.text, styles?.word?.opacity === undefined ? { opacity: breath } : null]}>
        {str.parts("wordShown", { word: rotation[mood % rotation.length]! })}
      </Animated.Text>
      <Clock started={started} style={[s.clock, r.clock.view, r.clock.text]} />
      {hasTrace ? (
        <View {...hidden} style={{ transform: [{ rotate: unfolded ? "180deg" : "0deg" }] }}>
          <Icon testID="thinking-indicator.chevron" name="chevron-down" size={chevronSize as number} color={r.chevron.text.color} style={Object.keys(chevronRest).length ? chevronRest : undefined} />
        </View>
      ) : null}
    </>
  );

  return (
    <View {...rootProps(rest)} testID={partId(testID, "thinking-indicator", "root")} accessible={!hasTrace} accessibilityLiveRegion="polite" accessibilityLabel={announcement} style={[s.root, r.root.view, style]}>
      {hasTrace ? (
        <Pressable
          testID="thinking-indicator.toggle"
          accessibilityRole="button"
          accessibilityLabel={str("toggleLabel", { word: str("wordShown", { word: rotation[mood % rotation.length]! }), action: unfolded ? str("hideSteps") : str("showSteps") })}
          accessibilityHint={announcement}
          accessibilityState={{ expanded: unfolded }}
          hitSlop={t.space.sm}
          onPress={() => setUnfolded(!unfolded)}
          {...press.handlers}
          style={[s.head, r.head.view, r.toggle.view]}
        >
          {head}
        </Pressable>
      ) : (
        <View testID="thinking-indicator.head" style={[s.head, r.head.view]}>
          {head}
        </View>
      )}
      {hasTrace && unfolded ? (
        <View testID="thinking-indicator.trace" style={trace.view}>
          <AgentSteps steps={steps} />
        </View>
      ) : null}
    </View>
  );
}
