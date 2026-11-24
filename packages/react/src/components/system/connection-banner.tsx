import { type CSSProperties } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { useAnnounce } from "../../lib/announce";
import { Spinner } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, pressable, row, text } from "../../lib/style";

export type ConnectionBannerState = "offline" | "reconnecting" | "back-online" | "syncing" | "degraded";
export type ConnectionBannerSurface = "banner" | "pill";

export interface ConnectionBannerProps extends RootProps<HTMLDivElement> {
  /** offline: this device has no network. reconnecting: the network is there but the service is not answering. degraded: one service (the directory) is failing. */
  state?: ConnectionBannerState;
  /** pill is the read-only Online / Offline indicator. */
  surface?: ConnectionBannerSurface;
  /** Reconnect attempt number. Shown from the second attempt. */
  attempt?: number;
  /** Try now was pressed: reconnect at once and reset the backoff. */
  onRetry?: () => void;
  /** Per-part styles over the theme: `{ strip: {…}, retry: {…}, pill: {…} }`. */
  styles?: PartStyles<"connection-banner">;
  /** This banner's built-in text (the messages, the pill's words and names, Try now) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["connection-banner"]>;
  style?: CSSProperties;
}

function Retry({ styles, strings, onPress }: { styles?: PartStyles<"connection-banner">; strings?: Partial<KitStrings["connection-banner"]>; onPress: () => void }) {
  const s = useStrings("connection-banner", strings);
  const ui = useInteraction();
  const r = useRecipe(recipes["connection-banner"], { state: { focus: ui.focused }, styles });
  return (
    <button
      data-af-part="retry"
      type="button"
      data-af-press
      // Named by its words (WCAG 2.5.3); the longer sentence is its description and tooltip.
      title={s("tryNowLabel")}
      onClick={() => onPress()}
      {...ui.handlers}
      style={css(pressable, { flexShrink: 0, justifyContent: "center", textDecoration: "underline" }, partStyle(r, "retry", ui.hovered && { opacity: 0.75 }))}
    >
      {s("tryNow")}
    </button>
  );
}

export function ConnectionBanner({ state = "offline", surface = "banner", attempt: attemptProp = 1, onRetry, styles, strings, style, ...rest }: ConnectionBannerProps) {
  const s = useStrings("connection-banner", strings);
  const { platform } = usePlatform();
  // Try now starts a fresh attempt at once, so the count moves on before the socket reports back.
  const [attempt, setAttempt] = useControllable(attemptProp);
  const busy = state === "reconnecting" || state === "syncing";
  const message =
    state === "offline"
      ? platform === "web"
        ? s("offlineWeb")
        : s("offlineDesktop")
      : state === "reconnecting"
        ? `${s("reconnectingMessage")}${attempt >= 2 ? s("attempt", { count: attempt }) : ""}`
        : s("syncing");
  // What the pill says and how it reads, by what the connection is doing. How it looks is the recipe's.
  const pill =
    state === "offline"
      ? { text: s("offline"), label: s("offLabel") }
      : state === "reconnecting"
        ? { text: s("reconnecting"), label: s("tryingLabel") }
        : { text: s("online"), label: s("onLabel") };
  const r = useRecipe(recipes["connection-banner"], { variants: { state }, styles });
  // What the banner says is spoken through the page's announcer, as it changes: a strip mounted holding its text is not read, and the
  // way back (the strip going away) would otherwise be silent. The pill's name is spoken when it changes, not when it is first drawn.
  const spoken =
    surface !== "banner" ? "" : state === "offline" || busy ? message : state === "degraded" ? s("degraded") : state === "back-online" ? s("backOnline") : "";
  useAnnounce(spoken, "polite", { initial: true });
  useAnnounce(surface === "pill" && pill.label);
  return (
    <div data-af-part="root" {...rootProps(rest)} style={css(box, { width: "100%" }, r.root, style)}>
      {surface === "banner" && (state === "offline" || busy) && (
        <div
          data-af-part="strip"
          style={css(
            row,
            {
              justifyContent: "center",
              paddingInline: t.space.mdLg,
              lineHeight: 1.4,
              textAlign: "center",
            },
            partStyle(r, "strip", enter("slide-down")),
          )}
        >
          {busy && <Spinner size={12} decorative />}
          <span style={text}>{message}</span>
          {state === "reconnecting" && (
            <Retry
              styles={styles}
              strings={strings}
              onPress={() => {
                setAttempt(attempt + 1);
                onRetry?.();
              }}
            />
          )}
        </div>
      )}
      {surface === "banner" && state === "degraded" && (
        <div
          data-af-part="degraded"
          style={css(
            box,
            { marginTop: t.space.sm, marginInline: t.space.smMd, paddingBlock: t.space.sm, paddingInline: t.space.smMd },
            partStyle(r, "degraded", enter("slide-down")),
          )}
        >
          <span data-af-part="degradedText" style={css(text, { lineHeight: 1.4 }, r.degradedText)}>
            {s("degraded")}
          </span>
        </div>
      )}
      {surface === "pill" && (
        <div
          data-af-part="pill"
          role="img"
          aria-label={pill.label}
          style={css(row, { alignSelf: "flex-start", paddingBlock: t.space.sm, paddingInline: t.space.md }, r.pill)}
        >
          <span aria-hidden data-af-part="dot" style={css({ flexShrink: 0 }, r.dot)} />
          <span data-af-part="pillText" style={css(text, r.pillText)}>{pill.text}</span>
        </div>
      )}
    </div>
  );
}
