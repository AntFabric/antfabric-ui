import { Pressable, Text, View, type ViewStyle } from "react-native";
import { type RootProps, rootProps } from "../../lib/root-props";
import { PieChart } from "react-native-gifted-charts";
import { recipes, useLocale, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { DIMMED, fmt, goalsOf, overallOf, ringAt, ringBands, seriesColors, summarizeGoals, type FormatSpec, type Goal, type Row, type FormatWords } from "@antfabric/ui-core/chart";
import { createStyles } from "../../theme";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { ChartCard } from "../../data/chart-card";
import { ChartFrame } from "../../data/frame";
import { chartFont, useChartTokens } from "../../data/theme";
import { MetricValue } from "./metric-value";

export interface GoalRingsProps extends RootProps {
  /** Rows, one per goal, in order (the first three are drawn): [{ goal: "Tickets resolved", done: 455, target: 600 }, …]. The same rows can feed a table. */
  data: Row[];
  /** The field of each row that names its goal. */
  name: string;
  /** The field of each row that is what is done. */
  value: string;
  /** The field of each row that is its target. A target of 0, or one that is not a number, is no goal: the ring is its empty track. */
  goal: string;
  /** The card's title. It names the plot too. */
  title: string;
  /** One line under the title: what it covers. */
  subtitle?: string;
  /** A format name, its options, or a function: what core's `fmt` takes. What is done, the target and what is left print through it. */
  format?: FormatSpec;
  /** The done column's name in "View as table". */
  valueLabel?: string;
  /** The target column's name in "View as table". */
  goalLabel?: string;
  /** What the middle says above the overall share: "Completed". It says "This goal" while a goal is picked. */
  centerLabel?: string;
  /** The goal that is picked, by its name: the middle shows its share and the other rings step back. Left out, the chart keeps its own, starting with none. */
  selected?: string | null;
  /** Called with the picked goal's name, or null when it is picked again. */
  onSelectedChange?: (selected: string | null) => void;
  /** The title of the empty state when there are no rows. */
  empty?: string;
  /** One sentence under it: what to do about it. */
  emptyLine?: string;
  /** Grey bars in place of the rings, and no "View as table". */
  loading?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, plot: {…} }`. */
  styles?: PartStyles<"goal-rings">;
  /** This chart's built-in text (its empty state, its labels for a screen reader) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["goal-rings"]>;
  /** The card title's heading level. The phone has one kind of header, so it is read for the web's sake and has no effect here. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: ViewStyle;
}

/** A slice of nothing would not draw; this is nothing a person could see. */
const SLIVER = 0.0001;
/** The percent the middle and the list print: whole numbers. */
const WHOLE = { type: "percent", digits: 0 } as const;

/** Layout no token decides; what the tokens decide (the ring's size, the gaps, the swatch and the type) is the recipe's. */
const useStyles = createStyles((t) => ({
  rings: { alignItems: "stretch" },
  ring: { alignSelf: "center", alignItems: "center", justifyContent: "center" },
  band: { position: "absolute" },
  hit: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  center: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" },
  list: { alignSelf: "stretch" },
  goalHead: { flexDirection: "row", alignItems: "center" },
  label: { flex: 1 },
  of: { fontVariant: ["tabular-nums"] },
  figures: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: t.space.sm, paddingLeft: t.space.smMd + t.space.sm },
}));

interface GoalItemProps {
  goal: Goal;
  color: string;
  format?: FormatSpec;
  /** Another goal is picked, so this one steps back. */
  dim: boolean;
  /** This goal is the one that is picked. */
  picked: boolean;
  onPress: () => void;
  styles?: PartStyles<"goal-rings">;
  strings?: Partial<KitStrings["goal-rings"]>;
}

/** One goal in the list: its colour and name, what is done of the target, and what is left. Tapping it picks its ring. */
function GoalItem({ goal, color, format, dim, picked, onPress, styles, strings }: GoalItemProps) {
  const locale = useLocale();
  const str = useStrings("goal-rings", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const s = useStyles();
  const tk = useChartTokens();
  // The phone has no hover: a focused goal (keyboard, switch access) is ringed.
  const press = usePress();
  const r = useRecipe(recipes["goal-rings"], { state: { focus: press.focused }, styles });
  const left = !goal.known ? str("noGoal") : goal.met ? str("goalMet") : str("toGo", { value: fmt(format, goal.left, formatWords, locale) });
  const item = partStyle(r, "goal", { view: { opacity: dim ? DIMMED : 1 } });
  const swatch = partStyle(r, "swatch", { view: { backgroundColor: color } });
  const name = partStyle(r, "label", { text: chartFont(tk) });
  const of = partStyle(r, "of", { text: chartFont(tk) });
  const done = partStyle(r, "done", { text: chartFont(tk, "semibold") });
  const rest = partStyle(r, "left", { text: chartFont(tk) });
  return (
    <Pressable
      testID="goal-rings.goal"
      accessibilityRole="button"
      accessibilityLabel={goal.known ? str("goalSummary", { label: goal.label, done: fmt(format, goal.done, formatWords, locale), target: fmt(format, goal.target, formatWords, locale), left }) : str("goalUnknown", { label: goal.label, left })}
      accessibilityState={{ selected: picked }}
      onPress={() => onPress()}
      {...press.handlers}
      style={item.view}
    >
      <View testID="goal-rings.goalHead" style={[s.goalHead, r.goalHead.view]}>
        <View testID="goal-rings.swatch" style={swatch.view} />
        <Text testID="goal-rings.label" numberOfLines={1} style={[s.label, name.view, name.text]}>{goal.label}</Text>
      </View>
      {/* The number leads under its name: what is done, large, then the target and what is left, quieter. */}
      <View style={s.figures}>
        {goal.known ? (
          <Text testID="goal-rings.of" style={[s.of, of.view, of.text]}>
            <Text testID="goal-rings.done" style={[done.view, done.text]}>{fmt(format, goal.done, formatWords, locale)}</Text> / {fmt(format, goal.target, formatWords, locale)}
          </Text>
        ) : null}
        <Text testID="goal-rings.left" style={[rest.view, rest.text]}>{left}</Text>
      </View>
    </Pressable>
  );
}

export function GoalRings({ data, name, value, goal, title, subtitle = "", format = "integer", valueLabel, goalLabel, centerLabel, selected, onSelectedChange, empty, emptyLine, loading = false, styles, strings, headingLevel: _headingLevel, testID, style, ...rest }: GoalRingsProps) {
  const str = useStrings("goal-rings", strings);
  const formatWords: FormatWords = { unavailable: str("unavailable"), points: ({ value }) => str("formatPoints", { value }), duration: ({ minutes, seconds }) => str("formatDuration", { minutes, seconds }) };
  const locale = useLocale();
  const s = useStyles();
  const tk = useChartTokens();
  const r = useRecipe(recipes["goal-rings"], { styles });
  const goals = goalsOf(data, name, value, goal);
  const palette = seriesColors(tk);
  const size = tk.chart.ringSize;
  const bands = ringBands(size, tk.chart.ringW, tk.chart.ringGap, goals.length);
  // The goal that is picked: a finger has no hover, so a tap on a ring or on its row picks it, and a tap on it again puts it back.
  const [picked, setPicked] = useControllable(selected, onSelectedChange);
  const at = picked == null ? -1 : goals.findIndex((g) => g.label === picked);
  const lit = at >= 0 ? (goals[at] ?? null) : null;
  const summary = summarizeGoals({ label: title, goals, format, formatWords, locale }, {
    noGoals: (v) => str("summaryNoGoals", v),
    goal: (v) => str("summaryGoal", v),
    noGoal: (v) => str("summaryNoGoal", v),
    separator: () => str("summarySeparator"),
    summary: (v) => str("summary", v),
  });
  const centerLabel$ = partStyle(r, "centerLabel", { text: chartFont(tk) });
  const dimmed = (k: number) => at >= 0 && at !== k;
  const pick = (k: number) => {
    const next = goals[k]?.label;
    if (next !== undefined) setPicked(picked === next ? null : next);
  };
  return (
    <ChartCard
      id="goal-rings"
      testID={testID}
      root={rootProps(rest)}
      r={r} viewAsTable={str("viewAsTable")} viewAsChart={str("viewAsChart")}
      title={title}
      subtitle={subtitle}
      table={!loading && data.length ? { data, x: name, y: [value, goal], format, labels: { [value]: valueLabel ?? str("valueLabel"), [goal]: goalLabel ?? str("goalLabel") } } : null}
      style={style}
    >
      <ChartFrame height={size} grow interactive label={loading ? str("loading", { title }) : summary} loading={loading} empty={goals.length === 0} emptyTitle={empty ?? str("empty")} emptyLine={emptyLine ?? str("emptyLine")} loadingLabel={str("loadingChart")}>
        {() => (
          <View testID="goal-rings.rings" style={[s.rings, r.rings.view]}>
            <Enter motion="pop" testID="goal-rings.ring" accessible accessibilityRole="image" accessibilityLabel={summary} style={[s.ring, r.ring.view]}>
              {/* gifted-charts' pie starts at 12 o'clock and runs clockwise. One donut per ring, the biggest first, each in a view as wide as its outer edge and centred, so a smaller ring sits in the hole of the one before. */}
              {goals.map((g, k) => (
                <View key={g.label} pointerEvents="none" style={[s.band, { left: size / 2 - bands[k]!.outer, top: size / 2 - bands[k]!.outer, opacity: dimmed(k) ? DIMMED : 1 }]}>
                  <PieChart
                    donut
                    radius={bands[k]!.outer}
                    innerRadius={bands[k]!.inner}
                    innerCircleColor={tk.surface.card}
                    strokeWidth={0}
                    focusOnPress={false}
                    data={[
                      { value: Math.max(g.ratio, SLIVER), color: g.ratio > 0 ? palette[k % palette.length]! : tk.chart.track },
                      { value: Math.max(1 - g.ratio, SLIVER), color: tk.chart.track },
                    ]}
                  />
                </View>
              ))}
              {/* gifted-charts finds a pressed ring from the page's coordinates on the web, which are wrong wherever the chart is not at the page's corner; this finds it from where the touch landed. */}
              <View
                testID="goal-rings.hit"
                style={s.hit}
                onStartShouldSetResponder={() => goals.length > 0}
                onResponderRelease={(e) => {
                  const hit = ringAt(e.nativeEvent.locationX, e.nativeEvent.locationY, size, bands);
                  if (hit >= 0) pick(hit);
                }}
              />
              <View testID="goal-rings.center" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[s.center, r.center.view]}>
                <Text testID="goal-rings.centerLabel" numberOfLines={1} style={[centerLabel$.view, centerLabel$.text]}>{lit ? str("thisGoal") : (centerLabel ?? str("centerLabel"))}</Text>
                <MetricValue value={lit ? lit.ratio : overallOf(goals)} format={WHOLE} size="md" />
              </View>
            </Enter>
            <View testID="goal-rings.list" accessibilityRole="list" accessibilityLabel={str("goals")} style={[s.list, r.list.view]}>
              {goals.map((g, k) => (
                <GoalItem key={g.label} goal={g} color={palette[k % palette.length]!} format={format} dim={dimmed(k)} picked={at === k} onPress={() => pick(k)} styles={styles} strings={strings} />
              ))}
            </View>
          </View>
        )}
      </ChartFrame>
    </ChartCard>
  );
}
