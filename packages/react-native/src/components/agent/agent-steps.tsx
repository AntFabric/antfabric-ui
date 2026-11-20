import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, Text, View, type ViewStyle } from "react-native";
import { recipes, useStrings, type AgentStep, type KitStrings } from "@antfabric-ui/core";
import { createStyles } from "../../theme";
import { Icon } from "../../lib/icon";
import { Enter, useReducedMotion } from "../../lib/motion";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";

export interface AgentStepsProps extends RootProps {
  /** Every step this turn has taken, oldest first. */
  steps?: AgentStep[];
  /** How many of the newest to draw; the rest are counted. 0 is the platform's own: 3 on the phone. */
  max?: number;
  /** This list's built-in text (its name, "+N earlier", "via …", the markers' names) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["agent-steps"]>;
  /** Per-part styles over the theme: `{ root: {…}, label: {…} }`. */
  styles?: PartStyles<"agent-steps">;
  style?: ViewStyle;
}

/** The newest `max` steps and how many were left out. Never drops a step silently. */
function visibleSteps(steps: AgentStep[], max: number): { shown: AgentStep[]; hidden: number } {
  const cap = Math.max(0, Math.floor(max));
  if (cap === 0) return { shown: [], hidden: steps.length };
  if (steps.length <= cap) return { shown: steps, hidden: 0 };
  return { shown: steps.slice(-cap), hidden: steps.length - cap };
}

const useStyles = createStyles(() => ({
  row: { flexDirection: "row", alignItems: "center", minWidth: 0 },
  marker: { alignItems: "center", justifyContent: "center", overflow: "visible", flexShrink: 0 },
  label: { flexShrink: 1 },
  source: { flexShrink: 0 },
}));

/** 0.55 to full and back, 800 ms each way; held at full under Reduce Motion. */
function Pulse({ style }: { style: ViewStyle }) {
  const v = useRef(new Animated.Value(0)).current;
  // Follows Settings live.
  const moving = !useReducedMotion();
  useEffect(() => {
    if (!moving) return;
    const native = Platform.OS !== "web";
    const easing = Easing.bezier(0.77, 0, 0.175, 1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 800, easing, useNativeDriver: native }),
        Animated.timing(v, { toValue: 0, duration: 800, easing, useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [moving, v]);
  return <Animated.View testID="agent-steps.dot" style={[style, { opacity: moving ? v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) : 1 }]} />;
}

function Step({ step, strings, styles }: { step: AgentStep; strings: AgentStepsProps["strings"]; styles: AgentStepsProps["styles"] }) {
  const s = useStyles();
  const str = useStrings("agent-steps", strings);
  const running = step.state === "running";
  const r = useRecipe(recipes["agent-steps"], { state: { on: running }, styles });
  const { width: doneSize, height: _dh, ...doneRest } = r.done.view;
  const { width: failedSize, height: _fh, ...failedRest } = r.failed.view;
  return (
    // One stop per step, with its state in words ("running: Search the CRM via Salesforce"): the marker, label and source are not three stops.
    <Enter
      motion="fade"
      testID="agent-steps.row"
      accessible
      accessibilityRole="text"
      accessibilityLabel={[str("stepLabel", { state: str(step.state === "running" ? "running" : step.state === "done" ? "done" : "failed"), label: step.label }), step.source ? str("via", { source: step.source }) : ""].filter(Boolean).join(" ")}
      style={[s.row, r.row.view]}
    >
      <View testID="agent-steps.marker" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.marker, r.marker.view]}>
        {running ? <Pulse style={r.dot.view} /> : null}
        {step.state === "done" ? <Icon testID="agent-steps.done" name="check" size={doneSize as number} color={r.done.text.color} style={Object.keys(doneRest).length ? doneRest : undefined} /> : null}
        {step.state === "failed" ? <Icon testID="agent-steps.failed" name="x" size={failedSize as number} color={r.failed.text.color} style={Object.keys(failedRest).length ? failedRest : undefined} /> : null}
      </View>
      {/* Labels and sources are text a server named, never Markdown. */}
      <Text testID="agent-steps.label" numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[s.label, r.label.view, r.label.text]}>
        {step.label}
      </Text>
      {step.source ? (
        <Text testID="agent-steps.source" numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[s.source, r.source.view, r.source.text]}>
          {str.parts("via", { source: step.source })}
        </Text>
      ) : null}
    </Enter>
  );
}

export function AgentSteps({ steps = [], max = 0, strings, styles, style, testID, ...rest }: AgentStepsProps) {
  const str = useStrings("agent-steps", strings);
  const r = useRecipe(recipes["agent-steps"], { styles });
  const { shown, hidden } = visibleSteps(steps, max > 0 ? max : 3);
  if (steps.length === 0) return null;
  return (
    <View accessibilityLabel={str("label")} {...rootProps(rest)} testID={partId(testID, "agent-steps", "root")} accessibilityRole="list" style={[r.root.view, style]}>
      {hidden > 0 ? (
        <Text testID="agent-steps.more" style={[r.more.view, r.more.text]}>
          {str.parts("earlier", { count: hidden })}
        </Text>
      ) : null}
      {shown.map((st) => (
        <Step key={st.key} step={st} strings={strings} styles={styles} />
      ))}
    </View>
  );
}
