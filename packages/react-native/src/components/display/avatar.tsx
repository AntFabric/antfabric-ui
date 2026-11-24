import { useState } from "react";
import { Image, StyleSheet, Text, View, type ImageStyle, type ViewStyle } from "react-native";
import { initials, recipes, useStrings, type AvatarIdentity, type AvatarPresence, type KitStrings } from "@antfabric/ui-core";
import { createStyles } from "../../theme";
import { Icon } from "../../lib/icon";
import { Enter } from "../../lib/motion";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { partId, rootProps, type RootProps } from "../../lib/root-props";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
// Shared with the conversation components (`packages/core/src/chat-items.ts`); still exported from here.
export type { AvatarIdentity, AvatarPresence };

export interface AvatarProps extends RootProps {
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
  /** Beside the person's name drawn as text: the face is hidden from VoiceOver and TalkBack, so the name is not read twice. */
  decorative?: boolean;
  /** Per-part styles over the theme: `{ root: {…}, photo: {…} }`. */
  styles?: PartStyles<"avatar">;
  /** Built-in text (the presence words) for this instance. */
  strings?: Partial<KitStrings["avatar"]>;
  style?: ViewStyle;
}

/** Layout no token decides; what the tokens decide (size, colour, edge) is the recipe's. */
const useStyles = createStyles(() => ({
  root: { alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: "100%" },
  // 10pt at the least, so the dot survives Dynamic Type and the small sizes.
  presence: { position: "absolute", right: -1, bottom: -1, width: "34%", height: "34%", minWidth: 10, minHeight: 10 },
  agent: { position: "absolute", right: -3, bottom: -3, alignItems: "center", justifyContent: "center" },
}));

/** Photos that failed this session: a 404 keeps the initials and is not asked for again. */
const failed = new Set<string>();

export function Avatar({ name, src = "", size = "md", shape = "circle", identity = "indigo", presence = "none", agent = false, decorative = false, styles, strings, style, testID, ...rest }: AvatarProps) {
  const s = useStyles();
  const str = useStrings("avatar", strings);
  const [broken, setBroken] = useState<string | null>(null);
  const r = useRecipe(recipes.avatar, { variants: { size, shape, identity, presence }, styles });
  // Presence is announced in words, never by colour alone.
  const said = presence === "active" ? str("presenceActive") : presence === "away" ? str("presenceAway") : presence === "dnd" ? str("presenceDnd") : str("presenceOffline");
  const side = r.root.view.width as number;
  // 9 and 10pt for the two smallest: no token is that small.
  const fontSize = (r.root.text.fontSize as number | undefined) ?? { xs: 9, sm: 10 }[size as "xs" | "sm"];
  const radius = r.root.view.borderRadius as number;
  const badge = Math.max(12, side * 0.44);
  const showPhoto = src !== "" && src !== broken && !failed.has(src);
  // A name with no letters (an emoji, a phone number) gets the person glyph, not an empty disc.
  const letters = /\p{L}/u.test(name);
  return (
    <View
      testID={partId(testID, "avatar", "root")}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : "image"}
      accessibilityLabel={decorative ? undefined : agent ? str("labelAgent", { name }) : presence === "none" ? name : str("labelWithPresence", { name, presence: said })}
      importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
      accessibilityElementsHidden={decorative || undefined}
      {...rootProps(rest)}
      style={[s.root, r.root.view, style]}
    >
      {/* The initials are always drawn; the photo lands over them, so a slow one never leaves an empty circle. */}
      {letters ? (
        <Text testID={partId(testID, "avatar", "initials")} style={[{ color: "#ffffff" }, r.root.text, { fontSize, lineHeight: fontSize, letterSpacing: fontSize * 0.01 }, r.initials.view, r.initials.text]}>
          {initials(name)}
        </Text>
      ) : (
        <Icon name="user" size={Math.round(side * 0.55)} color="#ffffff" />
      )}
      {showPhoto ? (
        <Enter key={src} motion="fade" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: "hidden" }]}>
          <Image
            testID={partId(testID, "avatar", "photo")}
            source={{ uri: src }}
            style={[s.photo, r.photo.view as ImageStyle]}
            onError={() => {
              failed.add(src);
              setBroken(src);
            }}
          />
        </Enter>
      ) : null}
      {presence !== "none" && !agent ? <View testID={partId(testID, "avatar", "presence")} style={[s.presence, r.presence.view]} /> : null}
      {agent ? (
        <View testID={partId(testID, "avatar", "agent")} style={[s.agent, partStyle(r, "agent", { view: { width: badge, height: badge } }).view]}>
          <Icon name="sparkles" size={Math.round(badge * 0.7)} color={r.agent.text.color} />
        </View>
      ) : null}
    </View>
  );
}
