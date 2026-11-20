import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View, type ViewStyle } from "react-native";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { announce } from "../../lib/a11y";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { usePress } from "../../lib/press";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";
import { fontScale } from "../../lib/type";
import { Button } from "../actions/button";

export type NotificationScheduleSurface = "menu" | "pill";

/** One way to pause: a row of the menu. */
export interface NotificationScheduleOption {
  /** What `onPause` reports. */
  key: string;
  /** The row's accessible name, with `detail` after it. Drawn too when there is no `text`. */
  label: string;
  /** What the row shows when it is not the label ("Custom…"). */
  text?: string;
  /** A trailing time: "9:00". */
  detail?: string;
  /** What "Paused until" shows once this row is chosen: "10:11", "tomorrow, 9:00". */
  until?: string;
  /** Choosing it opens the picker (the date and time fields) instead of pausing. */
  custom?: boolean;
}

export interface NotificationScheduleProps extends RootProps {
  /** menu: the Pause notifications sheet. pill: the line that shows while paused. */
  surface?: NotificationScheduleSurface;
  paused?: boolean;
  /** When the pause ends, in this device's local time: "9:00", "tomorrow, 9:00", "Mon 3 Nov, 14:30". */
  until?: string;
  /** The person's server-side quiet hours, or empty if none are set. */
  quietHours?: string;
  /** The choices, in order. */
  options?: NotificationScheduleOption[];
  /** The line under the choices ("Quiet hours are applied by the server…"); with `quietHours` it follows them. "" and no quiet hours draws no row. */
  note?: string;
  /** The Custom… picker is open. */
  custom?: boolean;
  /** The picker's date field. */
  customDate?: string;
  /** The picker's time field. */
  customTime?: string;
  /** The date field changed: what was typed. Give `customDate` too to control it. */
  onCustomDateChange?: (date: string) => void;
  /** The time field changed: what was typed. Give `customTime` too to control it. */
  onCustomTimeChange?: (time: string) => void;
  /** A choice was made: its `key`. */
  onPause?: (key: string) => void;
  /** Called with `paused` as a choice or Resume leaves it. */
  onPausedChange?: (paused: boolean) => void;
  onResume?: () => void;
  /** This sheet's built-in text (headings, the paused line, Resume) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["notification-schedule"]>;
  /** Per-part styles over the theme: `{ root: {…}, option: {…} }`. */
  styles?: PartStyles<"notification-schedule">;
  style?: ViewStyle;
}

/** Layout no token decides; the colours, sizes and type are the recipe's (`notificationSchedule`). */
const useStyles = createStyles((t) => ({
  root: { alignSelf: "flex-start" },
  // On a phone the menu is a sheet: wider, rounder, with a grabber.
  menu: {
    paddingTop: t.space["2xs"],
    paddingHorizontal: t.space.sm,
    paddingBottom: t.space.lg,
    gap: 1, /* structural: 1px optical gap between the menu rows */
  },
  grabber: { alignSelf: "center", marginTop: t.space["2xs"], marginBottom: t.space.sm },
  heading: { paddingHorizontal: t.space.sm, paddingTop: t.space.xs, paddingBottom: t.space.sm },
  active: { flexDirection: "row", alignItems: "center", margin: t.space["2xs"], paddingHorizontal: t.space.sm, paddingVertical: t.space.md },
  activeText: { flex: 1 },
  divider: { marginVertical: t.space["2xs"], marginHorizontal: t.space.sm },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionLabel: { flexShrink: 1 },
  optionDetail: { fontVariant: ["tabular-nums"] },
  customRow: { flexDirection: "row", alignItems: "center", gap: t.space.xs, paddingHorizontal: t.space.sm, paddingVertical: t.space.xs },
  field: { flex: 1, minWidth: 0 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: t.space.xs, paddingHorizontal: t.space.sm, paddingVertical: t.space.xs },
  noteIcon: { marginTop: t.space["3xs"] },
  noteText: { flex: 1 },
  pill: { flexDirection: "row", alignItems: "center" },
  pillText: { flexShrink: 1 },
  resume: { flexShrink: 0, justifyContent: "center" },
}));

export function NotificationSchedule({
  surface = "menu",
  paused = false,
  until = "",
  quietHours = "",
  options = [],
  note = "",
  custom = false,
  customDate = "",
  customTime = "",
  onCustomDateChange,
  onCustomTimeChange,
  onPause,
  onPausedChange,
  onResume,
  strings,
  styles,
  style,
  testID,
  ...rest
}: NotificationScheduleProps) {
  const s = useStyles();
  const str = useStrings("notification-schedule", strings);
  // A choice shows its result at once; the app's next props (from the server) take over when they come.
  const [isPaused, setPaused] = useControllable(paused, onPausedChange);
  const [end, setEnd] = useControllable(until);
  const [picking, setPicking] = useControllable(custom);
  // What is typed in the picker is what Pause uses, and is reported as it changes.
  const [date, setDate] = useControllable(customDate, onCustomDateChange);
  const [time, setTime] = useControllable(customTime, onCustomTimeChange);
  const pause = (key: string, at: string) => {
    if (!isPaused) setPaused(true);
    setEnd(at);
    setPicking(false);
    onPause?.(key);
  };
  const choose = (o: NotificationScheduleOption) => (o.custom ? setPicking(!picking) : pause(o.key, o.until ?? ""));
  const picker = options.find((o) => o.custom);
  const resumeAll = () => {
    setPaused(false);
    onResume?.();
  };
  const r = useRecipe(recipes["notification-schedule"], { variants: { paused: isPaused }, styles });
  // The heading's letter spacing is -2% of its size; the sheet's padding on the heading, the line's colour on its text and the pill's on its.
  const heading = partStyle(r, "heading", { view: s.heading, text: { letterSpacing: (r.heading.text.fontSize as number) * -0.02 } });
  const activeText = partStyle(r, "activeText", { view: s.activeText, text: { color: r.active.text.color } });
  const pillText = partStyle(r, "pillText", { view: s.pillText, text: { color: r.pill.text.color } });
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: activeIconSize, height: _ah, ...activeIconRest } = r.activeIcon.view;
  const { width: noteIconSize, height: _nh, ...noteIconRest } = r.noteIcon.view;
  const { width: pillIconSize, height: _ph, ...pillIconRest } = r.pillIcon.view;
  const status = isPaused ? str("status", { until: end }) : str("on");
  // iOS has no live regions: a pause starting or its end moving is spoken (not on first draw).
  const said = isPaused ? status : "";
  const was = useRef(said);
  useEffect(() => {
    if (said && said !== was.current) announce(said);
    was.current = said;
  }, [said]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Enter key={surface} motion={surface === "menu" ? "pop" : "fade"} {...rootProps(rest)} testID={partId(testID, "notification-schedule", "root")} style={[s.root, r.root.view, style]}>
      {surface === "menu" ? (
        <View testID={partId(testID, "notification-schedule", "menu")} role="group" accessibilityLabel={str("pause")} style={[s.menu, r.menu.view]}>
          <View testID={partId(testID, "notification-schedule", "grabber")} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[s.grabber, r.grabber.view]} />
          <Text testID={partId(testID, "notification-schedule", "heading")} accessibilityRole="header" maxFontSizeMultiplier={fontScale.content} style={[heading.view, heading.text]}>
            {str("pause")}
          </Text>
          {isPaused ? (
            <Enter motion="fade" testID={partId(testID, "notification-schedule", "active")} style={[s.active, r.active.view]}>
              <Icon testID={partId(testID, "notification-schedule", "activeIcon")} name="moon" size={activeIconSize as number} color={r.activeIcon.text.color} style={Object.keys(activeIconRest).length ? activeIconRest : undefined} />
              <Text testID={partId(testID, "notification-schedule", "activeText")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[activeText.view, activeText.text]}>
                {str.parts("pausedUntil", { until: end })}
              </Text>
              <Resume bordered testID={testID} onPress={resumeAll} strings={strings} styles={styles} />
            </Enter>
          ) : null}
          {isPaused ? <View testID={partId(testID, "notification-schedule", "divider")} accessibilityElementsHidden importantForAccessibility="no" style={[s.divider, r.divider.view]} /> : null}
          {options.map((o) => (
            <Option testID={testID} key={o.key} label={o.detail ? str("withDetail", { label: o.label, detail: o.detail }) : o.label} text={o.text ?? o.label} detail={o.detail} expanded={o.custom ? picking : undefined} styles={styles} onPress={() => choose(o)} />
          ))}
          {picking ? (
            <Enter motion="fade" style={s.customRow}>
              <Field testID={testID} label={str("pauseUntilDate")} value={date} onValue={setDate} styles={styles} />
              <Field testID={testID} label={str("pauseUntilTime")} value={time} onValue={setTime} styles={styles} />
              <Button label={str("pauseButton")} size="sm" variant="ink" onPress={() => pause(picker?.key ?? "custom", picker?.until ?? str("untilCustom", { date, time }))} />
            </Enter>
          ) : null}
          {note || quietHours ? <View testID={partId(testID, "notification-schedule", "divider")} accessibilityElementsHidden importantForAccessibility="no" style={[s.divider, r.divider.view]} /> : null}
          {note || quietHours ? (
            <View style={s.note}>
              <Icon
                testID={partId(testID, "notification-schedule", "noteIcon")}
                name="clock"
                size={noteIconSize as number}
                color={r.noteIcon.text.color}
                style={{ ...s.noteIcon, ...noteIconRest }}
              />
              <Text testID={partId(testID, "notification-schedule", "noteText")} maxFontSizeMultiplier={fontScale.content} style={[s.noteText, r.noteText.text]}>
                {quietHours ? str("quietHours", { hours: quietHours }) : ""}
                {note}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View testID={partId(testID, "notification-schedule", "pill")} role="status" accessibilityLabel={status} style={[s.pill, r.pill.view]}>
          <Icon testID={partId(testID, "notification-schedule", "pillIcon")} name={isPaused ? "moon" : "bell"} size={pillIconSize as number} color={r.pillIcon.text.color} style={Object.keys(pillIconRest).length ? pillIconRest : undefined} />
          <Text testID={partId(testID, "notification-schedule", "pillText")} numberOfLines={1} maxFontSizeMultiplier={fontScale.content} style={[pillText.view, pillText.text]}>
            {status}
          </Text>
          {isPaused ? <Resume testID={testID} onPress={resumeAll} strings={strings} styles={styles} /> : null}
        </View>
      )}
    </Enter>
  );
}

function Option({ testID, label, text = label, detail, expanded, styles, onPress }: { testID?: string; label: string; text?: string; detail?: string; expanded?: boolean; styles?: PartStyles<"notification-schedule">; onPress: () => void }) {
  const s = useStyles();
  const press = usePress();
  const r = useRecipe(recipes["notification-schedule"], { state: { focus: press.focused, pressed: press.pressed }, styles });
  return (
    <Pressable
      testID={partId(testID, "notification-schedule", "option")}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.option, r.option.view]}
    >
      <Text testID={partId(testID, "notification-schedule", "optionLabel")} numberOfLines={1} maxFontSizeMultiplier={fontScale.control} style={[s.optionLabel, r.optionLabel.view, r.optionLabel.text]}>
        {text}
      </Text>
      {detail ? (
        <Text testID={partId(testID, "notification-schedule", "optionDetail")} maxFontSizeMultiplier={fontScale.control} style={[s.optionDetail, r.optionDetail.text]}>
          {detail}
        </Text>
      ) : null}
    </Pressable>
  );
}

function Resume({ testID, bordered = false, strings, styles, onPress }: { testID?: string; bordered?: boolean; strings?: Partial<KitStrings["notification-schedule"]>; styles?: PartStyles<"notification-schedule">; onPress: () => void }) {
  const s = useStyles();
  const str = useStrings("notification-schedule", strings);
  const press = usePress();
  const r = useRecipe(recipes["notification-schedule"], { state: { pressed: press.pressed, focus: press.focused }, styles });
  const part = bordered ? "resumeBordered" : "resume";
  return (
    <Pressable
      testID={partId(testID, "notification-schedule", part)}
      accessibilityRole="button"
      accessibilityLabel={str("resumeLabel")}
      onPress={() => onPress()}
      {...press.handlers}
      style={[s.resume, r[part].view]}
    >
      <Text testID={partId(testID, "notification-schedule", "resumeText")} numberOfLines={1} maxFontSizeMultiplier={fontScale.control} style={[r.resumeText.view, r.resumeText.text]}>
        {str("resume")}
      </Text>
    </Pressable>
  );
}

function Field({ testID, label, value, onValue, styles }: { testID?: string; label: string; value: string; onValue: (value: string) => void; styles?: PartStyles<"notification-schedule"> }) {
  const s = useStyles();
  const [focused, setFocused] = useState(false);
  const r = useRecipe(recipes["notification-schedule"], { state: { focus: focused }, styles });
  return (
    <TextInput
      testID={partId(testID, "notification-schedule", "field")}
      accessibilityLabel={label}
      value={value}
      onChangeText={onValue}
      maxFontSizeMultiplier={fontScale.control}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[s.field, r.field.view, r.field.text]}
    />
  );
}
