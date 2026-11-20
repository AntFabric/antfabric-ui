import { useId, type CSSProperties } from "react";
import { recipes, useDirection, useStrings, type KitStrings } from "@antfabric-ui/core";
import { t } from "../../tokens";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, row, text, truncate } from "../../lib/style";
import { IconButton } from "../actions/icon-button";

export type ProgressBarTone = "brand" | "neutral" | "success" | "danger";
export type ProgressBarAction = "none" | "cancel" | "retry";

export interface ProgressBarProps extends RootProps<HTMLDivElement> {
  /** 0–100, clamped. A NaN draws indeterminate rather than a bar stuck at zero. */
  value?: number;
  /** The size is not known yet. No value is announced. */
  indeterminate?: boolean;
  /** Accessible name of the bar. Left out, the bar is named by its `title` when it has one, else "Progress". */
  label?: string;
  /** brand while it moves; success when done; danger when it stopped and needs you; neutral for a quiet measure. */
  tone?: ProgressBarTone;
  /** Turns the bar into an upload row: the file or job name, one line. */
  title?: string;
  /** How much has moved, in units a person reads: "2.1 of 5.3 MB". */
  detail?: string;
  /** The row's one control: Cancel while it moves, Retry once it has failed. */
  action?: ProgressBarAction;
  onCancel?: () => void;
  onRetry?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, fill: {…} }`. */
  styles?: PartStyles<"progress-bar">;
  /** This bar's built-in text (the default name, the Cancel and Retry labels) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["progress-bar"]>;
  style?: CSSProperties;
}

/** The layout no token decides; what the tokens decide (fill, radius, ink, type, gaps) is the recipe's. */
const track: CSSProperties = { ...box, flexDirection: "row", height: 5, overflow: "hidden" };

export function ProgressBar({
  value = 40,
  indeterminate = false,
  label,
  tone = "brand",
  title = "",
  detail = "",
  action = "none",
  onCancel,
  onRetry,
  styles,
  strings,
  style,
  ...rest
}: ProgressBarProps) {
  const s = useStrings("progress-bar", strings);
  const unknown = indeterminate || Number.isNaN(value);
  const pct = unknown ? 0 : Math.min(100, Math.max(0, value));
  const r = useRecipe(recipes["progress-bar"], { variants: { tone }, styles });
  const dir = useDirection();
  const titleId = useId();
  // A bar in a list of uploads is named by its file, and says its detail ("2.1 of 5.3 MB") as the value's text.
  const named = label === undefined && title ? { "aria-labelledby": titleId } : { "aria-label": label ?? s("label") };
  return (
    <div data-af-part="root" {...rootProps(rest)} style={css(box, { alignSelf: "stretch", minWidth: 120 }, r.root, style)}>
      {title && (
        <div data-af-part="header" style={css(row, r.header)}>
          <span id={titleId} data-af-part="title" style={css(text, truncate(1), { flex: 1 }, r.title)}>{title}</span>
          {detail && (
            <span data-af-part="detail" style={css(text, { whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }, r.detail)}>
              {detail}
            </span>
          )}
          {action === "cancel" && <IconButton icon="x" label={s("cancelUpload", { name: title })} size="sm" onPress={() => onCancel?.()} style={{ marginInlineEnd: -4 }} />}
          {action === "retry" && <IconButton icon="rotate-ccw" label={s("retryUpload", { name: title })} size="sm" onPress={() => onRetry?.()} style={{ marginInlineEnd: -4 }} />}
        </div>
      )}
      <div
        role="progressbar"
        {...named}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={unknown ? undefined : pct}
        aria-valuetext={!unknown && detail ? detail : undefined}
        aria-busy={unknown || (pct < 100 && tone !== "danger")}
        data-af-part="track"
        style={css(track, r.track)}
      >
        <div
          data-af-part="fill"
          style={css(
            { height: "100%" },
            partStyle(
              r,
              "fill",
              unknown
                ? { width: "32%", animation: `af-indeterminate 1.4s ${t.ease.standard} infinite` }
                : // A transform, not a width: the fill slides out from under the track's clip, so no layout runs while it moves and the rounded end keeps its shape.
                  { width: "100%", transform: `translateX(${dir === "rtl" ? "" : "-"}${100 - pct}%)`, transition: `transform ${t.duration.slow} ease` },
            ),
          )}
        />
      </div>
    </div>
  );
}
