import { useEffect, useRef, type CSSProperties } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, input, pressable, row, text, truncate } from "../../lib/style";
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

export interface NotificationScheduleProps extends RootProps<HTMLDivElement> {
  /** menu: the Pause notifications choices. pill: the line that shows while paused. */
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
  /** This menu's built-in text (headings, the paused line, Resume) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["notification-schedule"]>;
  /** Per-part styles over the theme: `{ root: {…}, option: {…} }`. */
  styles?: PartStyles<"notification-schedule">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; the colours, sizes and type are the recipe's (`notificationSchedule`). */
const menu: CSSProperties = {
  ...box,
  gap: 1, /* structural: 1px optical gap between the menu rows */
};

const heading: CSSProperties = { ...text, padding: `${t.space.xs} ${t.space.sm} ${t.space["2xs"]}`, textTransform: "uppercase" };

const active: CSSProperties = { ...row, margin: t.space["2xs"], padding: `${t.space.xs} ${t.space.sm}`, ...enter("fade") };

const divider: CSSProperties = { margin: `${t.space["2xs"]} ${t.space.sm}` };

const option: CSSProperties = { ...pressable, flexDirection: "row", alignItems: "center", justifyContent: "space-between" };

const field: CSSProperties = { ...input, flex: 1, minWidth: 0 };

const pill: CSSProperties = { ...row };

const resume: CSSProperties = { ...pressable, flexShrink: 0, whiteSpace: "nowrap", justifyContent: "center" };

export function NotificationSchedule({
  surface = "menu",
  paused,
  until = "",
  quietHours = "",
  options = [],
  note = "",
  custom = false,
  customDate,
  customTime,
  onCustomDateChange,
  onCustomTimeChange,
  onPause,
  onPausedChange,
  onResume,
  strings,
  styles,
  style,
  ...rest
}: NotificationScheduleProps) {
  const s = useStrings("notification-schedule", strings);
  // A choice shows its result at once; the app's next props (from the server) take over when they come.
  const [isPaused = false, setPaused] = useControllable(paused, onPausedChange);
  const [end, setEnd] = useControllable(until);
  const [picking, setPicking] = useControllable(custom);
  // What is typed in the picker is what Pause uses, and is reported as it changes.
  const [date = "", setDate] = useControllable(customDate, onCustomDateChange);
  const [time = "", setTime] = useControllable(customTime, onCustomTimeChange);
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
  // The paused line arrives holding its text, which is not read: it is said when a pause starts, its end moves or it is resumed (not on
  // first draw). The pill is plain text too.
  const said = isPaused ? s("status", { until: end }) : s("on");
  const was = useRef(said);
  useEffect(() => {
    if (said && said !== was.current) announce(said);
    was.current = said;
  }, [said]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div key={surface} data-af-part="root" {...rootProps(rest)} style={css(box, { alignSelf: "flex-start" }, partStyle(r, "root", enter(surface === "menu" ? "pop" : "fade")), style)}>
      {surface === "menu" ? (
        <div role="group" aria-label={s("pause")} data-af-part="menu" style={css(menu, r.menu)}>
          <span data-af-part="heading" style={css(heading, r.heading)}>
            {s("pause")}
          </span>
          {isPaused && (
            <div data-af-part="active" style={css(active, r.active)}>
              <Icon part="activeIcon" name="moon" size={r.activeIcon.width} style={r.activeIcon} />
              <span data-af-part="activeText" style={css(text, truncate(1), { flex: 1 }, r.activeText)}>
                {s.parts("pausedUntil", { until: end })}
              </span>
              <Resume bordered onPress={resumeAll} strings={strings} styles={styles} />
            </div>
          )}
          {isPaused && <div aria-hidden data-af-part="divider" style={css(divider, r.divider)} />}
          {options.map((o) => (
            <Option key={o.key} label={o.detail ? s("withDetail", { label: o.label, detail: o.detail }) : o.label} text={o.text ?? o.label} detail={o.detail} expanded={o.custom ? picking : undefined} styles={styles} onPress={() => choose(o)} />
          ))}
          {picking && (
            <div style={css(row, { gap: t.space.xs, padding: `${t.space.xs} ${t.space.sm}` }, enter("fade"))}>
              <Field label={s("pauseUntilDate")} value={date} onValue={setDate} styles={styles} />
              <Field label={s("pauseUntilTime")} value={time} onValue={setTime} styles={styles} />
              <Button label={s("pauseButton")} size="sm" variant="ink" onPress={() => pause(picker?.key ?? "custom", picker?.until ?? s("untilCustom", { date, time }))} />
            </div>
          )}
          {(note || quietHours) && <div aria-hidden data-af-part="divider" style={css(divider, r.divider)} />}
          {(note || quietHours) && (
            <div style={css(row, { alignItems: "flex-start", gap: t.space.xs, padding: `${t.space.xs} ${t.space.sm}` })}>
              <Icon part="noteIcon" name="clock" size={r.noteIcon.width} style={css({ marginTop: t.space["3xs"] }, r.noteIcon)} />
              <span data-af-part="noteText" style={css(text, { flex: 1 }, r.noteText)}>
                {quietHours ? s("quietHours", { hours: quietHours }) : ""}
                {note}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div role="group" aria-label={isPaused ? s("status", { until: end }) : s("on")} data-af-part="pill" style={css(pill, r.pill)}>
          <Icon part="pillIcon" name={isPaused ? "moon" : "bell"} size={r.pillIcon.width} style={r.pillIcon} />
          <span data-af-part="pillText" style={css(text, truncate(1), r.pillText)}>
            {isPaused ? s("status", { until: end }) : s("on")}
          </span>
          {isPaused && <Resume onPress={resumeAll} strings={strings} styles={styles} />}
        </div>
      )}
    </div>
  );
}

function Option({ label, text: shown = label, detail, expanded, styles, onPress }: { label: string; text?: string; detail?: string; expanded?: boolean; styles?: PartStyles<"notification-schedule">; onPress: () => void }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["notification-schedule"], { state: { hover: ui.hovered, focus: ui.focused, pressed: ui.pressed }, styles });
  return (
    <button
      type="button"
      data-af-part="option"
      data-af-press
      aria-label={label}
      aria-expanded={expanded}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(option, r.option)}
    >
      <span data-af-part="optionLabel" style={css(text, truncate(1), r.optionLabel)}>
        {shown}
      </span>
      {detail ? (
        <span data-af-part="optionDetail" style={css(text, { flexShrink: 0, fontVariantNumeric: "tabular-nums" }, r.optionDetail)}>
          {detail}
        </span>
      ) : null}
    </button>
  );
}

/** Resume, in the paused line (with a border, on the soft fill) and on the pill. */
function Resume({ bordered = false, strings, styles, onPress }: { bordered?: boolean; strings?: Partial<KitStrings["notification-schedule"]>; styles?: PartStyles<"notification-schedule">; onPress: () => void }) {
  const ui = useInteraction();
  const s = useStrings("notification-schedule", strings);
  const r = useRecipe(recipes["notification-schedule"], { state: { hover: ui.hovered, focus: ui.focused }, styles });
  return (
    <button
      type="button"
      data-af-part={bordered ? "resumeBordered" : "resume"}
      data-af-press
      aria-label={s("resumeLabel")}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(resume, bordered ? r.resumeBordered : r.resume)}
    >
      {s("resume")}
    </button>
  );
}

function Field({ label, value, onValue, styles }: { label: string; value: string; onValue: (value: string) => void; styles?: PartStyles<"notification-schedule"> }) {
  const ui = useInteraction();
  const r = useRecipe(recipes["notification-schedule"], { state: { focus: ui.focused }, styles });
  return <input data-af-part="field" data-af-input aria-label={label} value={value} onChange={(e) => onValue(e.target.value)} {...ui.handlers} style={css(field, r.field)} />;
}
