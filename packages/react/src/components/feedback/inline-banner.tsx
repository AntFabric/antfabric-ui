import { useEffect, useRef, type CSSProperties } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { focusNear } from "../../lib/focus";
import { announce } from "../../lib/announce";
import { Icon, type IconName } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, row, text } from "../../lib/style";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

export type InlineBannerTone = "neutral" | "brand" | "warning" | "danger";

/** The glyph a banner draws when it is given none: one per tone, so a warning reads as one without the product picking a glyph. */
const TONE_ICON: Record<InlineBannerTone, IconName> = { neutral: "info", brand: "info", warning: "triangle-alert", danger: "circle-alert" };
export type InlineBannerActionVariant = "secondary" | "primary";

export interface InlineBannerProps extends RootProps<HTMLDivElement> {
  /** neutral: the state you are in. brand: the product's assistant did this, never an outage. danger is announced as an alert. warning: something will go wrong if left. danger: it already failed. */
  tone?: InlineBannerTone;
  /** The glyph before the message. Left out, the tone's own: `info` for neutral and brand, `triangle-alert` for warning, `circle-alert` for danger; `""` draws none. */
  icon?: IconName;
  /** Optional bold first line. */
  title?: string;
  message: string;
  /** At most one action. */
  actionLabel?: string;
  /** primary only when the banner holds the view's one primary action (Join channel). */
  actionVariant?: InlineBannerActionVariant;
  /** Tips and announcements can be dismissed; a banner that states a fact cannot. */
  dismissible?: boolean;
  /** Dismissed: the banner fades out. The × sets it; the app unmounts the banner on onDismiss. */
  dismissed?: boolean;
  onAction?: () => void;
  onDismiss?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, message: {…} }`. */
  styles?: PartStyles<"inline-banner">;
  /** This banner's built-in text (the × label) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["inline-banner"]>;
  style?: CSSProperties;
}

/** The rim of a warning or danger banner: its ink at 24%. A `color-mix`, which the recipe cannot say; the other tones' rims are the recipe's. */
const RIM: Partial<Record<InlineBannerTone, CSSProperties>> = {
  warning: { borderColor: `color-mix(in srgb, ${t.warning.default} 24%, transparent)` },
  danger: { borderColor: `color-mix(in srgb, ${t.danger.default} 24%, transparent)` },
};

/** The layout and the motion no token decides; what the tokens decide (fill, rim, ink, type) is the recipe's. */
const root: CSSProperties = { ...row, alignSelf: "stretch", paddingBlock: 13, paddingInline: 15, transition: `opacity ${t.duration.base}` };

export function InlineBanner({
  tone = "neutral",
  icon: given,
  title = "",
  message,
  actionLabel = "",
  actionVariant = "secondary",
  dismissible = false,
  dismissed = false,
  onAction,
  onDismiss,
  styles,
  strings,
  style,
  ...rest
}: InlineBannerProps) {
  const s = useStrings("inline-banner", strings);
  // The banner fades itself out when dismissed; the app hears about it and unmounts it.
  const [gone, setGone] = useControllable(dismissed);
  const icon = given ?? TONE_ICON[tone];
  const r = useRecipe(recipes["inline-banner"], { variants: { tone }, styles });
  // The × goes with the banner: focus moves to the nearest control that stays (the banner is the ×'s parent).
  const close = useRef<HTMLButtonElement>(null);
  // A failure is announced at once; the other tones wait for a pause. Through the page's announcer: a live region that arrives
  // holding its text is not read.
  useEffect(() => {
    if (!gone) announce([title, message].filter(Boolean).join(". "), tone === "danger" ? "assertive" : "polite");
  }, [tone, title, message]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      data-af-part="root"
      {...rootProps(rest)}
      aria-hidden={gone || undefined}
      inert={gone || undefined}
      style={css(root, partStyle(r, "root", RIM[tone], gone ? { opacity: 0, pointerEvents: "none" } : enter("fade")), style)}
    >
      {icon && <Icon part="icon" name={icon} style={r.icon} />}
      <div style={css(box, { flex: 1, gap: t.space["3xs"] })}>
        {title && <span data-af-part="title" style={css(text, r.title)}>{title}</span>}
        <span data-af-part="message" style={css(text, { lineHeight: 1.5 }, r.message)}>{message}</span>
      </div>
      {actionLabel && <Button label={actionLabel} variant={actionVariant} size="sm" onPress={() => onAction?.()} style={{ flexShrink: 0 }} />}
      {dismissible && (
        <IconButton
          icon="x"
          label={s("dismiss")}
          size="sm"
          ref={close}
          onPress={() => {
            focusNear(close.current?.parentElement);
            setGone(true);
            onDismiss?.();
          }}
          style={{ marginInlineEnd: -4 }}
        />
      )}
    </div>
  );
}
