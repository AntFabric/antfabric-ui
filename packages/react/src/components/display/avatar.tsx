import { useState, type CSSProperties } from "react";
import { initials, recipes, useStrings, type AvatarIdentity, type AvatarPresence, type KitStrings } from "@antfabric/ui-core";
import { Icon } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { css, enter, text } from "../../lib/style";
import { rootProps, type RootProps } from "../../lib/root-props";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
// Shared with the conversation components (`packages/core/src/chat-items.ts`); still exported from here.
export type { AvatarIdentity, AvatarPresence };

export interface AvatarProps extends RootProps<HTMLSpanElement> {
  name: string;
  /** Photo URL. A broken or slow image falls back to initials — never an empty circle. */
  src?: string;
  size?: AvatarSize;
  /** square is for channels, projects and bots; people are circles. */
  shape?: AvatarShape;
  identity?: AvatarIdentity;
  presence?: AvatarPresence;
  /** Marks an AI agent: a sparkle badge, so a person never mistakes an agent's message for a colleague's. */
  agent?: boolean;
  /** Beside the person's name drawn as text (a message, a list row, a hover card): the face is hidden from assistive tech, so the name is not read twice. */
  decorative?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, photo: {…} }`. */
  styles?: PartStyles<"avatar">;
  /** Built-in text (the presence words) for this instance. */
  strings?: Partial<KitStrings["avatar"]>;
  style?: CSSProperties;
}

/** The two smallest sizes set their type in points: no token is that small. */
const SMALL: Partial<Record<AvatarSize, CSSProperties>> = { xs: { fontSize: 9 }, sm: { fontSize: 10 } };

/** The layout no token decides; what the tokens decide (size, colour, type, edge) is the recipe's. */
const root: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  flexShrink: 0,
  boxSizing: "border-box",
  color: "#ffffff",
  userSelect: "none",
};

const photo: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "inherit",
  ...enter("fade"),
};

const dot: CSSProperties = { position: "absolute", right: -1, bottom: -1, width: "34%", height: "34%", minWidth: 8, minHeight: 8, boxSizing: "border-box" };

const agentBadge: CSSProperties = {
  position: "absolute",
  right: -3,
  bottom: -3,
  width: "44%",
  height: "44%",
  minWidth: 12,
  minHeight: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Photos that failed this session: a 404 keeps the initials and is not asked for again. */
const failed = new Set<string>();

export function Avatar({ name, src = "", size = "md", shape = "circle", identity = "indigo", presence = "none", agent = false, decorative = false, styles, strings, style, ...rest }: AvatarProps) {
  const s = useStrings("avatar", strings);
  const [broken, setBroken] = useState<string | null>(null);
  const showPhoto = src !== "" && src !== broken && !failed.has(src);
  // A name with no letters (an emoji, a phone number) gets the person glyph, not an empty disc.
  const letters = /\p{L}/u.test(name);
  const r = useRecipe(recipes.avatar, { variants: { size, shape, identity, presence }, styles });
  // Presence is announced in words, never by colour alone.
  const said = presence === "active" ? s("presenceActive") : presence === "away" ? s("presenceAway") : presence === "dnd" ? s("presenceDnd") : s("presenceOffline");
  return (
    <span
      data-af-part="root"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : presence === "none" ? name : s("labelWithPresence", { name, presence: said })}
      aria-hidden={decorative || undefined}
      {...rootProps(rest)}
      style={css(root, partStyle(r, "root", SMALL[size]), style)}
    >
      {/* The initials are always drawn; the photo lands over them, so a slow one never leaves an empty circle. */}
      {letters ? (
        <span data-af-part="initials" aria-hidden style={css(text, { lineHeight: 1, letterSpacing: "0.01em" }, r.initials)}>
          {initials(name)}
        </span>
      ) : (
        <Icon name="user" size="55%" />
      )}
      {showPhoto && (
        <img
          key={src}
          src={src}
          data-af-part="photo"
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => {
            failed.add(src);
            setBroken(src);
          }}
          style={css(photo, r.photo)}
        />
      )}
      {presence !== "none" && !agent && <span data-af-part="presence" style={css(dot, r.presence)} />}
      {agent && (
        <span data-af-part="agent" style={css(agentBadge, r.agent)}>
          <Icon name="sparkles" size="70%" />
        </span>
      )}
    </span>
  );
}
