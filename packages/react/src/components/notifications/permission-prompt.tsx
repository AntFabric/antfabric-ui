import { useEffect, useRef, type CSSProperties } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { Icon } from "../../lib/icon";
import { useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, row, text, truncate } from "../../lib/style";
import { Button } from "../actions/button";

export type PermissionPromptPermission = "default" | "granted" | "denied" | "unsupported";

export interface PermissionPromptProps extends RootProps<HTMLDivElement> {
  /** The OS's answer. default = never asked. Windows and Linux have no prompt, so default there reads as on. */
  permission?: PermissionPromptPermission;
  /** The site the browser's permission prompt names, drawn in the address-bar picture of a blocked tab. "" draws none. */
  origin?: string;
  /** Runs the OS request — from this click, never on load. */
  onAllow?: () => void;
  onLater?: () => void;
  onOpenSettings?: () => void;
  onTest?: () => void;
  /** Web: "Check again" was pressed after the person switched notifications on in the browser; the app re-reads `Notification.permission` and passes the new `permission`. */
  onCheckAgain?: () => void;
  /** This prompt's built-in text (titles, explanations, buttons) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["permission-prompt"]>;
  /** Per-part styles over the theme: `{ root: {…}, title: {…} }`. */
  styles?: PartStyles<"permission-prompt">;
  style?: CSSProperties;
}

/** Layout and motion no token decides; the colours, sizes and type are the recipe's (`permissionPrompt`). */
const root: CSSProperties = { ...box, ...enter("pop") };

const tile: CSSProperties = { ...box, flexShrink: 0, alignItems: "center", justifyContent: "center" };
const body: CSSProperties = { ...text };
const chip: CSSProperties = { ...row };

export function PermissionPrompt({ permission = "default", origin = "", onAllow, onLater, onOpenSettings, onTest, onCheckAgain, strings, styles, style, ...rest }: PermissionPromptProps) {
  const { os } = usePlatform();
  const s = useStrings("permission-prompt", strings);
  // Turn on shows the on state at once; the app's next `permission` (the OS's real answer) takes over.
  const [state, setState] = useControllable(permission);
  // What the prompt says on this OS, for this answer. Windows and Linux never ask: there, not-yet-asked is already on.
  const silentOs = os === "windows" || os === "linux";
  const ask = state === "default" && !silentOs;
  const on = state === "granted" || (state === "default" && silentOs);
  const c = { ask, on };
  const titleKey =
    state === "unsupported"
      ? os === "browser"
        ? "titleUnsupportedBrowser"
        : "titleUnsupportedBuild"
      : state === "denied"
        ? os === "browser"
          ? "titleBlocked"
          : os === "linux"
            ? "titleNoServer"
            : "titleOff"
        : on
          ? "titleOn"
          : "titleAsk";
  const bodyKey = ask
    ? os === "browser"
      ? "bodyAskBrowser"
      : "bodyAskMac"
    : on
      ? os === "windows"
        ? "bodyOnWindows"
        : os === "linux"
          ? "bodyOnLinux"
          : os === "browser"
            ? "bodyOnBrowser"
            : "bodyOnMac"
      : state === "denied"
        ? os === "browser"
          ? "bodyBlockedBrowser"
          : os === "mac"
            ? "bodyBlockedMac"
            : os === "windows"
              ? "bodyBlockedWindows"
              : "bodyBlockedLinux"
        : os === "browser"
          ? "bodyUnsupportedBrowser"
          : "bodyUnsupportedBuild";
  const footKey = os === "browser" ? "footBrowser" : "footDesktop";
  const silentOn = state === "default" && silentOs;
  const blockedTab = state === "denied" && os === "browser";
  const r = useRecipe(recipes["permission-prompt"], { variants: { permission: silentOn ? "granted" : state }, styles });
  // Turn on goes when the answer comes: the new title is said (through the page's announcer), and focus, which was on the button that
  // went, moves to the title. Not on first draw.
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const was = useRef(state);
  useEffect(() => {
    if (was.current === state) return;
    was.current = state;
    announce(s(titleKey));
    if (!document.activeElement || document.activeElement === document.body) titleRef.current?.focus({ preventScroll: true });
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div role="region" aria-label={s("notifications")} data-af-part="root" {...rootProps(rest)} style={css(root, r.root, style)}>
      <div style={css(row, { gap: t.space.md })}>
        <div aria-hidden data-af-part="tile" style={css(tile, r.tile)}>
          <Icon part="tileIcon" name={c.on ? "bell-ring" : state === "default" ? "bell" : "bell-off"} size={r.tileIcon.width} style={r.tileIcon} />
        </div>
        <h2 ref={titleRef} tabIndex={-1} data-af-part="title" style={css(text, { flex: 1, outline: "none" }, r.title)}>
          {s(titleKey)}
        </h2>
      </div>
      <p data-af-part="body" style={css(body, r.body)}>
        {s(bodyKey)}
      </p>
      {/* Where the switch is in a Chromium tab: the site button, then Notifications → Allow. */}
      {blockedTab && (
        <div aria-hidden data-af-part="hint" style={css(row, r.hint)}>
          <div data-af-part="addressChip" style={css(chip, { flex: 1 }, r.addressChip)}>
            <div data-af-part="lock" style={css(box, { flexShrink: 0, alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 2px ${t.brand.default}` }, r.lock)}>
              <Icon name="lock" size={13} />
            </div>
            {origin && (
              <span data-af-part="chipUrl" style={css(text, truncate(1), r.chipUrl)}>
                {origin}
              </span>
            )}
          </div>
          <Icon part="arrowIcon" name="arrow-right" size={14} style={r.arrowIcon} />
          <div data-af-part="tabChip" style={css(chip, r.tabChip)}>
            <Icon name="bell" size={13} />
            <span data-af-part="chipLabel" style={css(text, r.chipLabel)}>
              {s("notifications")}
            </span>
            <span data-af-part="chipAllow" style={css(text, { marginLeft: t.space["2xs"] }, r.chipAllow)}>
              {s("allow")}
            </span>
          </div>
        </div>
      )}
      {state !== "unsupported" && (
        <div style={css(row, { flexWrap: "wrap", gap: t.space.xs, marginTop: t.space["2xs"] })}>
          {c.ask && (
            <Button
              label={s("turnOn")}
              iconLeading="bell"
              onPress={() => {
                setState("granted");
                onAllow?.();
              }}
            />
          )}
          {c.ask && <Button label={s("notNow")} variant="ghost" onPress={() => onLater?.()} />}
          {/* Linux has no settings page to open when it is off: the test is how a person checks their notification server. */}
          {(c.on || (state === "denied" && os === "linux")) && <Button label={s("test")} variant="secondary" onPress={() => onTest?.()} />}
          {silentOn && os === "windows" && <Button label={s("openNotificationSettings")} variant="ghost" iconTrailing="external-link" onPress={() => onOpenSettings?.()} />}
          {/* Nothing reopens the browser's prompt: the app re-reads Notification.permission when this fires. */}
          {blockedTab && <Button label={s("checkAgain")} variant="secondary" iconLeading="refresh-cw" onPress={() => onCheckAgain?.()} />}
          {state === "denied" && os === "mac" && <Button label={s("openSystemSettings")} iconTrailing="external-link" onPress={() => onOpenSettings?.()} />}
          {state === "denied" && os === "windows" && <Button label={s("openSettings")} iconTrailing="external-link" onPress={() => onOpenSettings?.()} />}
        </div>
      )}
      {c.ask && (
        <p data-af-part="foot" style={css(body, r.foot)}>
          {s(footKey)}
        </p>
      )}
    </div>
  );
}
