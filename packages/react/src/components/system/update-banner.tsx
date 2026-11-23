import { useEffect, useId, type CSSProperties, type ReactNode } from "react";
import { usePlatform } from "../../platform";
import { ART_UPDATE, recipes, useDirection, usePending, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { useFocusHandoff } from "../../lib/focus";
import { announce } from "../../lib/announce";
import { Icon, Spinner } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, pressable, row, rtl, text, truncate } from "../../lib/style";
import { Button } from "../actions/button";

export type UpdateBannerStage = "available" | "downloading" | "installing" | "ready" | "failed" | "checking" | "latest" | "store-required";

export interface UpdateBannerProps extends RootProps<HTMLDivElement> {
  /** Desktop: available → downloading → installing → ready (or failed). The web only knows available and failed. */
  stage?: UpdateBannerStage;
  version: string;
  /** Download percent; -1 when the server sent no length. */
  progress?: number;
  /** The updater's own sentence, verbatim. Default: the `errorDefault` string. */
  error?: string;
  /** Desktop: the notice is the card. Left (false) is the nav rail collapsed to 64 px, so the notice is an icon with a dot. */
  expanded?: boolean;
  /** Reports the request Install or Retry makes (downloading). The banner waits for the app to pass the new `stage`; it never moves it. */
  onStageChange?: (stage: UpdateBannerStage) => void;
  /** Install the waiting release, or retry a failed one. The card waits until the app answers with `stage` or `error`, or the promise settles. */
  onApply?: () => void | Promise<unknown>;
  /** Restart (desktop) or reload (web) onto the new version. */
  onRestart?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, card: {…}, banner: {…}, railIcon: {…} }`. */
  styles?: PartStyles<"update-banner">;
  /** This notice's built-in text (the stage words, the progress, the button names, the reload line) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["update-banner"]>;
  style?: CSSProperties;
}

/** A window with an arrow badge: the desktop's update glyph. Its geometry is `ART_UPDATE`; the recipe paints it. */
function Art({ styles }: { styles?: PartStyles<"update-banner"> }) {
  const { window: win, bar, badge } = ART_UPDATE;
  const r = useRecipe(recipes["update-banner"], { styles });
  const dir = useDirection();
  const line = { height: bar.h, borderRadius: bar.radius };
  return (
    <div aria-hidden style={{ ...box, width: ART_UPDATE.size, height: ART_UPDATE.size, flexShrink: 0 }}>
      <div
        data-af-part="artWindow"
        style={css(
          rtl(
            css(box, {
              position: "absolute",
              left: win.left,
              top: win.top,
              width: win.w,
              height: win.h,
              gap: win.gap,
              paddingTop: win.padTop,
              paddingLeft: win.padLeft,
              borderRadius: win.radius,
            }),
            dir,
          ),
          r.artWindow,
        )}
      >
        <div data-af-part="artBarLong" style={css(line, { width: bar.long }, r.artBarLong)} />
        <div data-af-part="artBarShort" style={css(line, { width: bar.short }, r.artBarShort)} />
      </div>
      <div
        data-af-part="artBadge"
        style={css(
          rtl(
            css(box, {
              position: "absolute",
              left: badge.left,
              top: badge.top,
              width: badge.size,
              height: badge.size,
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "content-box",
              borderRadius: "50%",
            }),
            dir,
          ),
          r.artBadge,
        )}
      >
        <Icon name="arrow-up" size={badge.arrow} style={{ strokeWidth: badge.stroke }} />
      </div>
    </div>
  );
}

/** The layout and the motion no token decides; what the tokens decide (fill, edge, shadow, gap, block padding) is the recipe's. */
const card: CSSProperties = {
  ...row,
  width: "100%",
  paddingInline: t.updateBanner.cardPadX,
  textAlign: "left",
  transition: `background ${t.duration.base}`,
};

function Card({
  stage,
  pending,
  version,
  progress,
  error,
  styles,
  strings,
  onPress,
}: {
  stage: UpdateBannerStage;
  pending: boolean;
  version: string;
  progress: number;
  error: string;
  styles?: PartStyles<"update-banner">;
  strings?: Partial<KitStrings["update-banner"]>;
  onPress: () => void;
}) {
  const s = useStrings("update-banner", strings);
  const busy = stage === "downloading" || stage === "installing";
  const ui = useInteraction({ disabled: busy });
  const r = useRecipe(recipes["update-banner"], { variants: { stage }, state: { hover: ui.hovered, focus: ui.focused }, styles });
  const dir = useDirection();
  const ids = useId();
  const title = stage === "downloading" ? s("downloading") : stage === "installing" ? s("installing") : stage === "ready" ? s("ready") : stage === "failed" ? s("failed") : s("available");
  const detail = stage === "downloading" ? (progress >= 0 ? s("downloadingPercent", { percent: progress }) : s("downloadingUnknown")) : stage === "failed" ? error : s("versionTag", { version });
  const action = stage === "available" ? s("installLabel", { version }) : stage === "ready" ? s("restartLabel", { version }) : s("retryLabel");
  // Install (or Retry) becomes the busy card when the updater starts: focus, fallen to the page, follows onto it.
  const working = useFocusHandoff<HTMLDivElement>(busy);
  const children: ReactNode = (
    <>
      <Art styles={styles} />
      <div data-af-part="cardText" style={css(box, { flex: 1 }, r.cardText)}>
        <span id={`${ids}-title`} data-af-part="cardTitle" style={css(text, truncate(1), { lineHeight: 1.45 }, r.cardTitle)}>
          {title}
        </span>
        {/* Truncated for sight only: the whole sentence is in the DOM and the tooltip. */}
        <span id={`${ids}-detail`} data-af-part="cardDetail" title={detail} style={css(text, truncate(1), { lineHeight: 1.45 }, r.cardDetail)}>
          {detail}
        </span>
      </div>
      {pending ? <Spinner part="cardIcon" decorative style={r.cardIcon} /> : <Icon part="cardIcon" name={stage === "ready" ? "arrow-right" : stage === "failed" ? "refresh-cw" : "download"} style={r.cardIcon} />}
    </>
  );
  // Not clickable while the updater is working: it says what is happening, and when.
  if (busy) {
    return (
      <div ref={working} tabIndex={-1} aria-busy data-af-part="card" style={css(rtl(card, dir), partStyle(r, "card", enter("fade")))}>
        {children}
      </div>
    );
  }
  return (
    <div style={{ ...box, width: "100%" }}>
      <button
        type="button"
        data-af-press
        // Named by what it shows (WCAG 2.5.3: a voice user says the words they see); what a press does is its description and tooltip.
        aria-labelledby={`${ids}-title ${ids}-detail`}
        title={action}
        aria-busy={pending || undefined}
        aria-disabled={pending || undefined}
        onClick={() => !pending && onPress()}
        {...ui.handlers}
        data-af-part="card"
        style={css(pressable, rtl(card, dir), partStyle(r, "card", enter("rise")))}
      >
        {children}
      </button>
    </div>
  );
}

function RailIcon({ stage, pending, styles, strings, onPress }: { stage: UpdateBannerStage; pending: boolean; styles?: PartStyles<"update-banner">; strings?: Partial<KitStrings["update-banner"]>; onPress: () => void }) {
  const s = useStrings("update-banner", strings);
  const busy = stage === "downloading" || stage === "installing";
  const ui = useInteraction({ disabled: busy });
  const dot = stage === "available" || stage === "ready" || stage === "failed";
  // Busy, the icon stays in the tab order (aria-disabled, not disabled), so a keyboard press on it keeps its place.
  const r = useRecipe(recipes["update-banner"], { variants: { stage }, state: { hover: ui.hovered, focus: ui.focused }, styles });
  const title = stage === "downloading" ? s("downloading") : stage === "installing" ? s("installing") : stage === "ready" ? s("ready") : stage === "failed" ? s("failed") : s("available");
  return (
    <button
      type="button"
      data-af-press
      aria-label={title}
      title={title}
      aria-busy={pending || busy || undefined}
      aria-disabled={pending || busy || undefined}
      onClick={() => !pending && !busy && onPress()}
      {...ui.handlers}
      data-af-part="railIcon"
      style={css(pressable, { alignItems: "center", justifyContent: "center" }, partStyle(r, "railIcon", ui.disabled && { cursor: "default" }))}
    >
      {pending ? <Spinner part="railGlyph" decorative style={r.railGlyph} /> : <Icon part="railGlyph" name={stage === "ready" ? "arrow-right" : stage === "failed" ? "refresh-cw" : "download"} style={r.railGlyph} />}
      {/* A dot, never a number: there is only ever one release waiting. */}
      {dot && (
        <span
          aria-hidden
          data-af-part="railDot"
          style={css(
            { position: "absolute", boxShadow: `0 0 0 2px ${t.surface.chrome}` },
            partStyle(r, "railDot", enter("pop")),
          )}
        />
      )}
    </button>
  );
}

/** The stages that draw anything: the web and the desktop's card say a word for each. */
const SHOWN: readonly UpdateBannerStage[] = ["available", "downloading", "installing", "ready", "failed"];

export function UpdateBanner({
  stage: current = "available",
  version,
  progress = -1,
  error,
  expanded = true,
  onStageChange,
  onApply,
  onRestart,
  styles,
  strings,
  style,
  ...rest
}: UpdateBannerProps) {
  const s = useStrings("update-banner", strings);
  const { platform } = usePlatform();
  const r = useRecipe(recipes["update-banner"], { styles });
  const dir = useDirection();
  // Install and Retry report the request and wait: the stage is the updater's, and moves only when the app passes it (or an `error`), or
  // when the promise a handler returns settles.
  const { pending, run } = usePending([current, error, progress]);
  const shown = SHOWN.includes(current);
  const press = () => {
    if (current === "ready") return onRestart?.();
    if (current !== "available" && current !== "failed") return;
    run(
      onStageChange || onApply
        ? () => {
            onStageChange?.("downloading");
            return onApply?.();
          }
        : undefined,
    );
  };
  // The web's line is said through the page's announcer when it appears or fails.
  const webLine = platform === "web" && shown ? (current === "failed" ? s("reloadFailed") : s("reloadAvailable")) : "";
  useEffect(() => {
    if (webLine) announce(webLine, current === "failed" ? "assertive" : "polite");
  }, [webLine]); // eslint-disable-line react-hooks/exhaustive-deps
  // The desktop's stage is spoken through the page's announcer when it appears and as it changes, and a failure carries its reason: a status
  // mounted holding its text is not read, and a button's own name would hide the sentence around it. Said here, not by the card or the rail
  // icon, so folding or unfolding the rail (one replaces the other) says nothing again. Progress is not read out percent by percent.
  const stageTitle = current === "downloading" ? s("downloading") : current === "installing" ? s("installing") : current === "ready" ? s("ready") : current === "failed" ? s("failed") : s("available");
  const deskLine = platform !== "web" && shown ? (current === "failed" ? `${stageTitle}. ${error || s("errorDefault")}` : stageTitle) : "";
  useEffect(() => {
    if (deskLine) announce(deskLine, current === "failed" ? "assertive" : "polite");
  }, [current, platform]); // eslint-disable-line react-hooks/exhaustive-deps
  if (platform === "web") {
    return (
      <div data-af-part="root" {...rootProps(rest)} style={css(box, { maxWidth: "100%" }, r.root, style)}>
        {shown && (
          <div
            data-af-part="banner"
            style={css(row, rtl({ paddingBlock: t.space.xs, paddingLeft: t.space.md, paddingRight: t.space.xs }, dir), partStyle(r, "banner", enter("fade")))}
          >
            <Icon part="bannerIcon" name={current === "failed" ? "circle-alert" : "sparkles"} style={r.bannerIcon} />
            <span data-af-part="bannerText" style={css(text, { flex: 1 }, r.bannerText)}>
              {current === "failed" ? s("reloadFailed") : s("reloadAvailable")}
            </span>
            <Button label={s("reload")} size="sm" variant="secondary" iconLeading="rotate-cw" onPress={() => onRestart?.()} />
          </div>
        )}
      </div>
    );
  }
  return (
    <div data-af-part="root" {...rootProps(rest)} style={css(box, { maxWidth: "100%" }, r.root, style)}>
      {shown && expanded && <Card stage={current} pending={pending} version={version} progress={progress} error={error || s("errorDefault")} styles={styles} strings={strings} onPress={press} />}
      {shown && !expanded && <RailIcon stage={current} pending={pending} styles={styles} strings={strings} onPress={press} />}
    </div>
  );
}
