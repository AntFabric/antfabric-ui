import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, findNodeHandle, Platform, Pressable, ScrollView, Text, TextInput, View, type ViewStyle } from "react-native";
import { recipes, useControllable, usePending, useStrings, type KitStrings, type QuestionOption, type ToolArg } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { announce, useAnnounce } from "../../lib/a11y";
import { usePress } from "../../lib/press";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

export interface QuestionPanelProps extends RootProps {
  /** "Approve this action?", "Choose one", "Type your answer". */
  title: string;
  /** The agent's display name, for the waiting bar and the paused line: "Invoice agent is paused until you answer." Empty names none. */
  agentName?: string;
  /** The collapsed bar's words. Empty reads the strings' `waiting` (or `waitingNamed` with an `agentName`). */
  waitingLabel?: string;
  /** The region's accessible name. Collapsing hides the question; it keeps this name. Empty reads the strings' `region`. */
  regionLabel?: string;
  /** The tool's own name, drawn as a chip. Only a gated tool call has one. */
  toolName?: string;
  /** What will happen, or what the question is about. Plain text, never Markdown. */
  details?: string;
  /** The tool call's arguments, printed whole as plain text; a long list scrolls. */
  args?: ToolArg[];
  /** The answer rows. List refusal first. */
  options?: QuestionOption[];
  /** A typed answer instead of rows. */
  field?: boolean;
  /** The typed answer's example. Empty reads the strings' `placeholder`. */
  placeholder?: string;
  /** Type-to-confirm: the row `confirmOption` arms only once this is typed exactly. */
  confirmText?: string;
  /** The key of the row type-to-confirm guards. Empty guards none. */
  confirmOption?: string;
  /** The chosen row's key. Nothing is chosen at first. */
  value?: string;
  /** What has been typed: the answer, or the confirm text. */
  typed?: string;
  /** Moves the screen reader's focus to the question when it appears or expands: for a question that blocks the turn. Off by default; either way the question is announced. */
  autoFocus?: boolean;
  /** The question is shown. False folds it to a bar that says the agent is waiting. */
  expanded?: boolean;
  /** Submit waits: an answer given offline has nowhere to go. */
  offline?: boolean;
  /** The answer is on its way. A press on Submit shows the same until the app answers; the app removes the panel once the answer lands. */
  sending?: boolean;
  onValueChange?: (value: string) => void;
  onTypedChange?: (typed: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  /** The chosen row's key, or the typed answer, trimmed. Submit shows Sending… until the app answers with `sending` or `offline`, or the returned promise settles. */
  onSubmit?: (answer: string) => void | Promise<unknown>;
  /** This panel's built-in text (the waiting bar, the paused and offline lines, the confirm field's words, Submit) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["question-panel"]>;
  /** Per-part styles over the theme: `{ root: {…}, title: {…} }`. */
  styles?: PartStyles<"question-panel">;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide is the recipe's. `t.space` lays parts out. */
const useStyles = createStyles((t) => ({
  card: { alignSelf: "stretch", width: "100%" },
  bar: { flexDirection: "row", alignItems: "center" },
  grow: { flex: 1, minWidth: 0 },
  header: { flexDirection: "row", alignItems: "center" },
  context: { alignItems: "flex-start", gap: t.space.xs },
  tool: { maxWidth: "100%" },
  scroll: { alignSelf: "stretch", flexGrow: 0 },
  args: { gap: t.space.xs },
  arg: { flexDirection: "row", gap: t.space.md },
  value: { flex: 1, minWidth: 0 },
  row: { flexDirection: "row", alignItems: "center" },
  rowText: { flex: 1, minWidth: 0, gap: t.space["3xs"] },
  field: { alignSelf: "stretch" },
  confirm: { flexDirection: "row", alignItems: "flex-start", marginTop: -t.space.xs },
  confirmBody: { flex: 1, minWidth: 0, gap: t.space["2xs"], paddingTop: t.space.xs },
  footer: { flexDirection: "row", alignItems: "center" },
}));

interface RowProps {
  option: QuestionOption;
  chosen: boolean;
  disabled: boolean;
  onChoose: () => void;
  styles: QuestionPanelProps["styles"];
}

function Row({ option, chosen, disabled, onChoose, styles }: RowProps) {
  const s = useStyles();
  const press = usePress({ disabled });
  const r = useRecipe(recipes["question-panel"], { state: { on: chosen, focus: press.focused, disabled }, styles });
  return (
    <Pressable
      testID="question-panel.row"
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      // What choosing it does is the radio's value, which is read after its name: a hint can be switched off and TalkBack skips it.
      accessibilityValue={option.detail ? { text: option.detail } : undefined}
      accessibilityState={{ checked: chosen, disabled }}
      disabled={disabled}
      onPress={() => onChoose()}
      {...press.handlers}
      style={[s.row, r.row.view]}
    >
      <View style={s.rowText}>
        <Text testID="question-panel.rowLabel" style={[r.rowLabel.view, r.rowLabel.text]}>
          {option.label}
        </Text>
        {option.detail ? (
          <Text testID="question-panel.rowDetail" style={[r.rowDetail.view, r.rowDetail.text]}>
            {option.detail}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function QuestionPanel({
  title,
  agentName = "",
  waitingLabel = "",
  regionLabel = "",
  toolName = "",
  details = "",
  args = [],
  options = [],
  field = false,
  placeholder = "",
  confirmText = "",
  confirmOption = "",
  value,
  typed,
  expanded,
  autoFocus = false,
  offline = false,
  sending = false,
  onValueChange,
  onTypedChange,
  onExpandedChange,
  onSubmit,
  strings,
  styles,
  style,
  testID,
  ...rest
}: QuestionPanelProps) {
  const s = useStyles();
  const str = useStrings("question-panel", strings);
  const [chosen = "", setChosen] = useControllable(value, onValueChange);
  const [entry = "", setEntry] = useControllable(typed, onTypedChange);
  const [open = true, setOpen] = useControllable(expanded, onExpandedChange);
  const shut = !open;
  // Submit reports the answer and waits: `sending` is the app's, and a press waits through usePending until the app answers (a new
  // `sending` or `offline`, or the promise onSubmit returns settling), so a failed send comes back to Submit.
  const { pending, run } = usePending([sending, offline]);
  const busy = sending || pending;
  const [focus, setFocus] = useState<"field" | "confirm" | null>(null);
  const r = useRecipe(recipes["question-panel"], { variants: { expanded: open }, state: { on: offline }, styles });
  const field_ = useRecipe(recipes["question-panel"], { state: { focus: focus === "field", disabled: busy }, styles });
  const confirm_ = useRecipe(recipes["question-panel"], { state: { focus: focus === "confirm", disabled: busy }, styles });
  const region = regionLabel || str("region");
  const waiting = waitingLabel || (agentName ? str("waitingNamed", { name: agentName }) : str("waiting"));

  const index = options.findIndex((o) => o.key === chosen);
  // Only the guarded row asks for the typing; refusing never does.
  const guarded = !field && confirmText !== "" && index >= 0 && confirmOption !== "" && chosen === confirmOption;
  const matches = entry.trim() === confirmText;
  const armed = field ? entry.trim() !== "" : index >= 0 && (!guarded || matches);
  const canSubmit = armed && !offline && !busy;

  // Going offline while the question waits is said (iOS has no live regions; the footer line is plain text).
  useAnnounce(!shut && offline && str("offline"));
  // A question that blocks the turn is said when it appears or opens (iOS has no live regions), and takes focus when the product asks.
  const heading = useRef<Text>(null);
  useEffect(() => {
    if (shut || busy) return;
    announce(str("asking", { region, title }));
    const node = autoFocus && Platform.OS !== "web" && heading.current ? findNodeHandle(heading.current) : null;
    if (node) AccessibilityInfo.setAccessibilityFocus?.(node);
    // On mount and each time it opens, not on every change of its words.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shut]);

  const submit = () => {
    if (!canSubmit) return;
    const answer = field ? entry.trim() : chosen;
    run(onSubmit && (() => onSubmit(answer)));
  };

  if (shut) {
    return (
      <View {...rootProps(rest)} testID={partId(testID, "question-panel", "root")} style={[s.card, s.bar, r.root.view, style]}>
        {/* The whole bar expands; the caret is the same action as its own labelled button. */}
        <Pressable accessibilityRole="button" accessibilityLabel={str("barLabel", { region, waiting })} accessibilityState={{ expanded: false }} onPress={() => setOpen(true)} style={s.grow}>
          <Text testID="question-panel.barLabel" numberOfLines={1} style={[r.barLabel.view, r.barLabel.text]}>
            {waiting}
          </Text>
        </Pressable>
        <IconButton icon="chevron-up" label={str("expand")} size="sm" onPress={() => setOpen(true)} />
      </View>
    );
  }

  const { placeholderTextColor: fieldPlaceholder, ...fieldText } = field_.field.text;
  const { placeholderTextColor: confirmPlaceholder, ...confirmText_ } = confirm_.confirmField.text;

  return (
    <View accessibilityLabel={region} {...rootProps(rest)} testID={partId(testID, "question-panel", "root")} style={[s.card, r.root.view, style]}>
      <View testID="question-panel.header" style={[s.header, r.header.view]}>
        <Text ref={heading} testID="question-panel.title" accessibilityRole="header" style={[s.grow, r.title.view, r.title.text]}>
          {title}
        </Text>
        <IconButton icon="chevron-down" label={str("collapse")} size="sm" onPress={() => setOpen(false)} />
      </View>

      {toolName || details || args.length > 0 ? (
        <View style={s.context}>
          {toolName ? (
            <Text testID="question-panel.tool" numberOfLines={1} style={[s.tool, r.tool.view, r.tool.text]}>
              {toolName}
            </Text>
          ) : null}
          {details ? (
            <ScrollView testID="question-panel.details" nestedScrollEnabled style={[s.scroll, r.details.view]}>
              <Text style={r.details.text}>{details}</Text>
            </ScrollView>
          ) : null}
          {args.length > 0 ? (
            <ScrollView testID="question-panel.args" nestedScrollEnabled style={[s.scroll, r.args.view]} contentContainerStyle={s.args}>
              {args.map((a, i) => (
                <View key={i} style={s.arg}>
                  <Text testID="question-panel.argName" style={[r.argName.view, r.argName.text]}>
                    {a.name}
                  </Text>
                  <Text testID="question-panel.argValue" style={[s.value, r.argValue.view, r.argValue.text]}>
                    {a.value || str("noValue")}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      {field ? (
        <TextInput
          testID="question-panel.field"
          value={entry}
          editable={!busy}
          placeholder={placeholder || str("placeholder")}
          placeholderTextColor={fieldPlaceholder}
          accessibilityLabel={title}
          returnKeyType="send"
          onChangeText={setEntry}
          onFocus={() => setFocus("field")}
          onBlur={() => setFocus(null)}
          onSubmitEditing={submit}
          style={[s.field, field_.field.view, fieldText]}
        />
      ) : (
        <View testID="question-panel.rows" accessibilityRole="radiogroup" accessibilityLabel={title} style={r.rows.view}>
          {options.map((o, i) => (
            <Row key={i} option={o} chosen={i === index} disabled={busy} onChoose={() => !busy && setChosen(o.key)} styles={styles} />
          ))}
        </View>
      )}

      {guarded ? (
        <View testID="question-panel.confirm" style={[s.confirm, r.confirm.view]}>
          <View testID="question-panel.elbow" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={r.elbow.view} />
          <View style={s.confirmBody}>
            <Text testID="question-panel.confirmCaption" style={[r.confirmCaption.view, r.confirmCaption.text]}>
              {str("irreversible")}
            </Text>
            <TextInput
              testID="question-panel.confirmField"
              value={entry}
              editable={!busy}
              placeholder={str("confirmLabel", { text: confirmText })}
              placeholderTextColor={confirmPlaceholder}
              accessibilityLabel={str("confirmLabel", { text: confirmText })}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              onChangeText={setEntry}
              onFocus={() => setFocus("confirm")}
              onBlur={() => setFocus(null)}
              style={[s.field, confirm_.confirmField.view, confirmText_]}
            />
            {entry !== "" && !matches ? (
              <Text testID="question-panel.hint" style={[r.hint.view, r.hint.text]}>
                {str("mismatch")}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View testID="question-panel.footer" style={[s.footer, r.footer.view]}>
        {/* Offline replaces the paused line rather than sitting beside it. */}
        <Text testID="question-panel.status" style={[s.grow, r.status.view, r.status.text]}>
          {offline ? str("offline") : agentName ? str("pausedNamed", { name: agentName }) : str("paused")}
        </Text>
        <Button label={busy ? str("sending") : str("submit")} variant="primary" size="md" loading={busy} disabled={!canSubmit && !busy} onPress={submit} />
      </View>
    </View>
  );
}
