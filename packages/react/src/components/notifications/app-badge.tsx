import type { CSSProperties } from "react";
import { cap, recipes, useStrings, type AppMark, type KitStrings } from "@antfabric-ui/core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, row, text, truncate } from "../../lib/style";

export interface AppBadgeProps extends RootProps<HTMLDivElement> {
  /** The app's name: the tab's title, and what the OS reads the icon as. Its first letter is the icon's mark when no `mark` is given. */
  appName: string;
  /** The app icon's vector mark, drawn at the icon's size in the part's colour. Left out, the first letter of `appName`. */
  mark?: AppMark;
  /** The browser tab beside the app's in the web picture; "" draws none. */
  otherTab?: string;
  /** Unread mentions and DMs — the person's whole total, never one window's. 0 clears the badge. */
  count?: number;
  /** Activity without a mention. Drawn where the OS has a dot; ignored where it only has numbers. */
  dot?: boolean;
  /** Notifications are paused: counts still show, the activity dot is dropped, and the badges we draw ourselves turn grey. */
  mutedAll?: boolean;
  /** This badge's built-in text (what the icon is read as, the tab's title) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["app-badge"]>;
  /** Per-part styles over the theme: `{ root: {…}, badge: {…} }`. */
  styles?: PartStyles<"app-badge">;
  style?: CSSProperties;
}

const SEGOE = "\"Segoe UI Variable Text\", \"Segoe UI\", sans-serif";
const CHROME = "system-ui, \"Segoe UI\", Roboto, sans-serif";

/** Layout no token decides; the OS's colours, sizes and type are the recipe's (`appBadge`, under each OS). */
const center: CSSProperties = { alignItems: "center", justifyContent: "center" };
/** The share of the icon box the mark fills: the desktop app's icon's. */
const MARK_FILL = 0.92;
/** The app's mark at a size, in its part's colour; the first letter of the app's name when it has none. */
function Mark({ mark, name, size, style }: { mark?: AppMark; name: string; size: number; style: CSSProperties }) {
  if (!mark) {
    return (
      <span data-af-part="mark" aria-hidden="true" style={css({ display: "block", flexShrink: 0, fontSize: Math.round(size * MARK_FILL), lineHeight: 1, fontWeight: t.font.weightBold }, style)}>
        {Array.from(name)[0] ?? ""}
      </span>
    );
  }
  // The colour is the glyph's fill; the rest of the part's style is the svg's.
  const { color, ...rest } = style;
  return (
    <svg data-af-part="mark" width={size} height={size} viewBox={mark.viewBox} fill={color} aria-hidden="true" style={css({ display: "block", flexShrink: 0 }, rest)}>
      {mark.paths.map((p) => (
        <path key={p.d.slice(0, 12)} d={p.d} fillRule={p.evenOdd ? "evenodd" : undefined} clipRule={p.evenOdd ? "evenodd" : undefined} />
      ))}
    </svg>
  );
}
const digits: CSSProperties = { ...text, lineHeight: 1, fontVariantNumeric: "tabular-nums" };
const dock: CSSProperties = { ...row, alignItems: "flex-end", paddingTop: t.space.sm, paddingBottom: t.space["2xs"], backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" };
const appIcon: CSSProperties = { ...box, ...center, flexShrink: 0 };
const runDot: CSSProperties = { position: "absolute", bottom: t.border.wHairline, left: "calc(50% - 2px)", borderRadius: "50%" };
const pill: CSSProperties = { ...box, ...center, position: "absolute" };
const taskButton: CSSProperties = { ...box, ...center, flexShrink: 0 };
const tab: CSSProperties = { ...row };
const tabTitle: CSSProperties = { ...text, ...truncate(1), flex: 1 };
/** Every OS's 1.5px badge edge is a width no token has: its colour is the recipe's. */
const edge: CSSProperties = { borderWidth: "1.5px", borderStyle: "solid" };

export function AppBadge({ appName, mark, otherTab = "", count: n = 0, dot = false, mutedAll = false, strings, styles, style, ...rest }: AppBadgeProps) {
  const { os } = usePlatform();
  const s = useStrings("app-badge", strings);
  const r = useRecipe(recipes["app-badge"], { variants: { mutedAll }, styles });
  // A dot is activity; pausing drops it, but never the count.
  const shown = n > 0 || (dot && !mutedAll);
  const what = n > 0 ? s("unread", { count: n }) : dot && !mutedAll ? s("newActivity") : s("noUnread");
  const icon = (size: number) => (
    <span data-af-part="appIcon" style={css(appIcon, { width: size, height: size }, r.appIcon)}>
      <Mark mark={mark} name={appName} size={Math.round(size * MARK_FILL)} style={r.mark} />
    </span>
  );
  return (
    <div role="img" aria-label={mutedAll ? s("paused", { what }) : what} data-af-part="root" {...rootProps(rest)} style={css(box, { alignSelf: "flex-start" }, r.root, style)}>
      {os === "mac" && (
        <div data-af-part="container" style={css(dock, r.container)}>
          <div style={css(box, center)}>
            {icon(56)}
            {shown && (
              <span data-af-part="badge" style={css(pill, partStyle(r, "badge", enter("pop")))}>
                <span data-af-part="digits" style={css(digits, r.digits)}>
                  {n > 0 ? cap(n) : "•"}
                </span>
              </span>
            )}
          </div>
          <span data-af-part="runDot" style={css(runDot, r.runDot)} />
        </div>
      )}
      {os === "windows" && (
        <div data-af-part="container" style={css(row, { fontFamily: SEGOE }, r.container)}>
          <span data-af-part="glyphButton" style={css(taskButton, r.glyphButton)}>
            <Icon name="layout-grid" size={20} />
          </span>
          <span data-af-part="taskButton" style={css(taskButton, r.taskButton)}>
            <span style={css(box, center)}>
              {icon(24)}
              {shown && (
                <span data-af-part="badge" style={css(pill, partStyle(r, "badge", edge, n === 0 && { minWidth: t.osBadge.winDot, height: t.osBadge.winDot, paddingInline: 0 }, enter("pop")))}>
                  {n > 0 && (
                    <span data-af-part="digits" style={css(digits, r.digits)}>
                      {cap(n, 9)}
                    </span>
                  )}
                </span>
              )}
            </span>
            <span data-af-part="taskBar" style={{ position: "absolute", bottom: t.border.wHairline, ...r.taskBar }} />
          </span>
          <span data-af-part="glyphButton" style={css(taskButton, r.glyphButton)}>
            <Icon name="folder" size={20} />
          </span>
        </div>
      )}
      {os === "linux" && (
        <div data-af-part="container" style={css(dock, r.container)}>
          <div style={css(box, center)}>
            {icon(48)}
            {n > 0 && (
              <span data-af-part="badge" style={css(pill, partStyle(r, "badge", edge, enter("pop")))}>
                <span data-af-part="digits" style={css(digits, r.digits)}>
                  {cap(n)}
                </span>
              </span>
            )}
          </div>
          <span data-af-part="runDot" style={css(runDot, r.runDot)} />
        </div>
      )}
      {os === "browser" && (
        <div data-af-part="container" style={css(row, { alignItems: "flex-end", paddingTop: t.space.sm, fontFamily: CHROME }, r.container)}>
          {otherTab && (
            <div data-af-part="activeTab" style={css(tab, r.activeTab)}>
              <Icon part="tabIcon" name="globe" size={16} style={r.tabIcon} />
              <span data-af-part="tabTitle" style={css(tabTitle, r.tabTitle)}>
                {otherTab}
              </span>
              <Icon part="tabIcon" name="x" size={14} style={r.tabIcon} />
            </div>
          )}
          <div data-af-part="tab" style={css(tab, r.tab)}>
            <span style={box}>
              <span data-af-part="favicon" style={css(box, center, { flexShrink: 0 }, r.favicon)}>
                <Mark mark={mark} name={appName} size={16} style={r.mark} />
              </span>
              {shown && <span data-af-part="badge" style={css({ position: "absolute", boxSizing: "border-box", borderRadius: "50%" }, partStyle(r, "badge", edge, enter("pop")))} />}
            </span>
            <span data-af-part="tabTitle" style={css(tabTitle, r.tabTitle)}>
              {n > 0 ? s("tabTitle", { count: cap(n), app: appName }) : appName}
            </span>
            <Icon part="tabIcon" name="x" size={14} style={r.tabIcon} />
          </div>
        </div>
      )}
    </div>
  );
}
