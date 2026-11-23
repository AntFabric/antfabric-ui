import { useEffect, useRef, useState } from "react";
import { I18nManager, Image, Linking, Pressable, StyleSheet, Text, View, type ImageStyle, type ViewStyle } from "react-native";
import { recipes, useControllable, usePending, useStrings, type Attachment, type KitStrings } from "@antfabric/ui-core";
import { createStyles, useTheme } from "../../theme";
import { Icon, type IconName } from "../../lib/icon";
import { usePress } from "../../lib/press";
import { announce } from "../../lib/a11y";
import { rootProps, partId, type RootProps } from "../../lib/root-props";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

export type AttachmentCardKind = NonNullable<Attachment["kind"]>;
export type AttachmentCardFileType = NonNullable<Attachment["fileType"]>;
export type AttachmentCardStatus = NonNullable<Attachment["status"]>;

export interface AttachmentCardProps extends RootProps {
  kind?: AttachmentCardKind;
  /** File name as uploaded. Also the accessible name's subject. */
  name?: string;
  /** The family: picks the glyph and its tint. */
  fileType?: AttachmentCardFileType;
  /** The short type (PDF, DOCX) in the meta line. Empty reads strings `badge`. */
  badge?: string;
  /** Human type name ("PDF document"). The phone does not draw it. */
  typeLabel?: string;
  /** Formatted size. Empty while the metadata is still loading. */
  size?: string;
  /** uploading shows progress; paused is a stalled upload that resumes on its own; failed offers Retry. */
  status?: AttachmentCardStatus;
  /** Upload percent, 0–100. */
  progress?: number;
  /** Shown when status is failed. Empty reads strings `error`. */
  error?: string;
  /** Image thumbnail, or the link preview's image. */
  src?: string;
  /** Link preview title (og:title). */
  title?: string;
  /** Link preview site, shown above the title. */
  domain?: string;
  /** Link preview description, two lines at most. */
  description?: string;
  url?: string;
  /** Voice note length. */
  duration?: string;
  /** Bar heights in points (4–28). Drawn, never announced. */
  waveform?: number[];
  /** How many waveform bars have played; those are coral. */
  played?: number;
  /** The voice note is playing. Play and Pause report it through `onPlayingChange`; the app starts and stops the audio. */
  playing?: boolean;
  /** The staged chip in the composer tray. */
  compact?: boolean;
  /** Link preview only: the sender can remove the preview (web and desktop draw the button). */
  removable?: boolean;
  /** MediaViewer for images, video and previewable files; Share or Save to device for the rest. */
  onOpen?: () => void;
  /** Reports the request Retry makes (uploading). The card waits for the app to pass the new `status`; it never moves it. */
  onStatusChange?: (status: AttachmentCardStatus) => void;
  /** Retry was tapped on a failed upload: the app starts it again. Retry spins until the app answers with `status`, `error` or `progress`, or the promise settles. */
  onRetry?: () => void | Promise<unknown>;
  /** Called with `playing` as Play or Pause leaves it: the app starts or stops the voice note. */
  onPlayingChange?: (playing: boolean) => void;
  /** Cancels an upload in progress, or removes a staged file. */
  onCancel?: () => void;
  /** This card's built-in text (its accessible names, "Uploading…", "Paused", the error) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["attachment-card"]>;
  /** Per-part styles over the theme: `{ root: {…}, fileCard: {…}, badge: {…}, meta: {…}, track: {…}, fill: {…} }`. */
  styles?: PartStyles<"attachment-card">;
  style?: ViewStyle;
}

/** What every piece of the card is drawn with: the card's `strings` and `styles`, so a part reaches `styles` wherever it is drawn. */
type Shared = Pick<AttachmentCardProps, "strings" | "styles">;

const GLYPH: Record<AttachmentCardFileType, IconName> = {
  pdf: "file-text",
  doc: "file-text",
  sheet: "file-spreadsheet",
  deck: "presentation",
  image: "file-image",
  video: "file-video",
  audio: "file-audio",
  archive: "file-archive",
  code: "file-code",
  other: "file",
};

/** Layout no token decides; the colours, sizes and type are the recipe's (`attachmentCard`). */
const useStyles = createStyles((t) => ({
  root: { alignSelf: "flex-start", maxWidth: "100%" },
  fileCard: { flexDirection: "row", alignItems: "center", width: 300, maxWidth: "100%", padding: t.space.sm, paddingRight: t.space.md },
  fileOpen: { flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 },
  badge: { alignItems: "center", justifyContent: "center" },
  fileText: { flex: 1, minWidth: 0, gap: t.space["3xs"] },
  meta: { fontVariant: ["tabular-nums"] },
  track: { height: 3, marginTop: t.space["2xs"], overflow: "hidden" },
  fill: { height: "100%" },
  imageCard: { width: 220, maxWidth: "100%", overflow: "hidden" },
  image: { width: "100%", height: 165 },
  scrim: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, justifyContent: "flex-end" },
  imageTrack: { height: 4, overflow: "hidden" },
  imageFailed: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" },
  failedText: { textAlign: "center" },
  linkCard: { flexDirection: "row", width: 300, maxWidth: "100%", paddingVertical: t.space["2xs"], paddingLeft: t.space.md, borderLeftWidth: 3 },
  linkOpen: { flexDirection: "row", alignItems: "flex-start", flex: 1, minWidth: 0 },
  linkSite: { flexDirection: "row", alignItems: "center", gap: t.space["2xs"] },
  linkDomain: { flexShrink: 1 },
  linkThumb: { width: 72, height: 72 },
  voiceCard: { flexDirection: "row", alignItems: "center", width: 280, maxWidth: "100%", paddingVertical: t.space.xs, paddingLeft: t.space.xs, paddingRight: t.space.mdLg },
  wave: { flexDirection: "row", alignItems: "center", gap: t.space["3xs"], flex: 1, minWidth: 0, height: 28, overflow: "hidden" },
  bar: { width: 3 },
  duration: { fontVariant: ["tabular-nums"] },
  chip: { flexDirection: "row", alignItems: "center", width: 220, maxWidth: "100%", paddingVertical: t.space.xs, paddingLeft: t.space.xs, paddingRight: t.space["2xs"], borderRadius: 10 },
  chipThumb: { width: 36, height: 36, borderRadius: 8 },
}));

type Card = Required<Omit<AttachmentCardProps, "ref" | "testID" | "nativeID" | "accessibilityLabel" | "accessibilityHint" | "style" | "strings" | "styles" | "onOpen" | "onRetry" | "onStatusChange" | "onCancel" | "playing" | "onPlayingChange">> &
  Shared & {
    open: () => void;
    retry: () => void;
    /** Retry was tapped and the app has not answered yet. */
    retrying: boolean;
    cancel: () => void;
  };

function FileBadge({ fileType, side, radius, styles }: Shared & { fileType: AttachmentCardFileType; side: number; radius: number }) {
  const s = useStyles();
  const r = useRecipe(recipes["attachment-card"], { variants: { fileType }, styles });
  const badge = partStyle(r, "badge", { view: { width: side, height: side, borderRadius: radius } });
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: iconSize, height: _iconHeight, ...iconRest } = r.badgeIcon.view;
  return (
    <View
      testID="attachment-card.badge"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[s.badge, badge.view]}
    >
      <Icon testID="attachment-card.badgeIcon" name={GLYPH[fileType]} size={iconSize as number} color={r.badge.text.color} style={Object.keys(iconRest).length ? iconRest : undefined} />
    </View>
  );
}

function Track({ name, progress, status, part, strings, styles }: Shared & { name: string; progress: number; status: AttachmentCardStatus; part: "track" | "imageTrack" }) {
  const s = useStyles();
  const str = useStrings("attachment-card", strings);
  const r = useRecipe(recipes["attachment-card"], { variants: { status }, styles });
  const fill = partStyle(r, "fill", { view: { width: `${progress}%` } });
  return (
    <View
      testID={`attachment-card.${part}`}
      accessibilityRole="progressbar"
      accessibilityLabel={str("uploadingLabel", { name })}
      accessibilityValue={{ min: 0, max: 100, now: progress }}
      style={[s[part], r[part].view]}
    >
      <View testID="attachment-card.fill" style={[s.fill, fill.view]} />
    </View>
  );
}

/** One line that gives way in the middle, so the extension survives. */
function FileName({ name, styles }: Shared & { name: string }) {
  const r = useRecipe(recipes["attachment-card"], { styles });
  return (
    <Text testID="attachment-card.fileName" numberOfLines={1} ellipsizeMode="middle" style={[r.fileName.view, r.fileName.text]}>
      {name}
    </Text>
  );
}

function Meta({ p, compact }: { p: Card; compact: boolean }) {
  const s = useStyles();
  const { strings } = p;
  const str = useStrings("attachment-card", strings);
  const r = useRecipe(recipes["attachment-card"], { styles: p.styles });
  const meta = partStyle(r, "meta", { text: s.meta });
  const shared = { strings: p.strings, styles: p.styles };
  const pct = Math.round(p.progress);
  const moving = p.status === "uploading" || p.status === "paused";
  const ready = compact ? p.size : [p.size, p.badge].filter(Boolean).join(" · ");
  return (
    <View style={s.fileText}>
      <FileName name={p.name} {...shared} />
      {p.status === "ready" ? (
        <Text testID="attachment-card.meta" numberOfLines={1} style={[meta.view, meta.text]}>
          {ready}
        </Text>
      ) : null}
      {p.status === "uploading" ? (
        <Text testID="attachment-card.meta" numberOfLines={1} style={[meta.view, meta.text]}>
          {compact ? str("ofSize", { percent: pct, size: p.size }) : str("uploading", { percent: pct, size: p.size })}
        </Text>
      ) : null}
      {p.status === "paused" ? (
        <Text testID="attachment-card.paused" style={[r.paused.view, r.paused.text]}>
          {compact ? str("pausedShort", { percent: pct }) : str("paused", { percent: pct })}
        </Text>
      ) : null}
      {p.status === "failed" ? (
        <Text testID="attachment-card.failed" numberOfLines={2} style={[r.failed.view, r.failed.text]}>
          {compact ? str("didntUpload") : p.error}
        </Text>
      ) : null}
      {moving ? <Track name={p.name} progress={pct} status={p.status} part="track" {...shared} /> : null}
    </View>
  );
}

function FileCard(p: Card) {
  const s = useStyles();
  const { strings } = p;
  const str = useStrings("attachment-card", strings);
  const press = usePress({ disabled: p.status !== "ready" });
  const r = useRecipe(recipes["attachment-card"], { state: { focus: press.focused }, styles: p.styles });
  const fileCard = partStyle(r, "fileCard", { view: s.fileCard });
  const fileOpen = partStyle(r, "fileOpen", { view: press.pressed ? { opacity: 0.7 } : undefined });
  const shared = { strings: p.strings, styles: p.styles };
  const pct = Math.round(p.progress);
  // The stop's name carries the state, since the meta line and the bar inside it are not read separately: the percent while it uploads,
  // that it is paused, and the reason when it failed.
  const label =
    p.status === "uploading" ? str("statusUploading", { name: p.name, percent: pct }) : p.status === "paused" ? str("statusPaused", { name: p.name, percent: pct }) : p.status === "failed" ? str("statusFailed", { name: p.name, error: p.error }) : str("fileOpenPhone", { name: p.name, size: p.size, badge: p.badge });
  return (
    <View testID="attachment-card.fileCard" style={fileCard.view}>
      <Pressable
        testID="attachment-card.fileOpen"
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={p.status === "uploading" || p.status === "paused" ? { min: 0, max: 100, now: pct } : undefined}
        accessibilityState={{ disabled: press.disabled }}
        disabled={press.disabled}
        onPress={p.open}
        {...press.handlers}
        style={[s.fileOpen, fileOpen.view]}
      >
        <FileBadge fileType={p.fileType} side={40} radius={11} {...shared} />
        <Meta p={p} compact={false} />
      </Pressable>
      {p.status === "uploading" || p.status === "paused" ? <IconButton icon="x" label={str("cancelUpload", { name: p.name })} size="sm" onPress={p.cancel} /> : null}
      {p.status === "failed" ? <Button label={str("retry")} variant="secondary" size="sm" iconLeading="rotate-ccw" loading={p.retrying} onPress={p.retry} /> : null}
    </View>
  );
}

function ImageCard(p: Card & { onBroken: () => void }) {
  const { t } = useTheme();
  const s = useStyles();
  const { strings } = p;
  const str = useStrings("attachment-card", strings);
  const press = usePress({ disabled: p.status !== "ready" });
  const r = useRecipe(recipes["attachment-card"], { styles: p.styles });
  const failedTitle = partStyle(r, "failedTitle", { text: s.failedText });
  const shared = { strings: p.strings, styles: p.styles };
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: failedIconSize, height: _failedIconHeight, ...failedIconRest } = r.failedIcon.view;
  const pct = Math.round(p.progress);
  return (
    <View testID="attachment-card.imageCard" style={[s.imageCard, r.imageCard.view]}>
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={str("photo", { name: p.name, size: p.size })}
        accessibilityState={{ disabled: press.disabled }}
        disabled={press.disabled}
        onPress={p.open}
        {...press.handlers}
        style={[{ width: "100%" }, press.pressed && { opacity: 0.85 }, press.focused && { boxShadow: `inset 0 0 0 3px ${t.focus.ring}` }]}
      >
        <Image source={{ uri: p.src }} accessibilityIgnoresInvertColors resizeMode="cover" onError={p.onBroken} style={s.image} />
      </Pressable>
      {p.status === "uploading" || p.status === "paused" ? (
        <View testID="attachment-card.scrim" pointerEvents="none" style={[s.scrim, r.scrim.view]}>
          <Track name={p.name} progress={pct} status={p.status} part="imageTrack" {...shared} />
        </View>
      ) : null}
      {p.status === "failed" ? (
        <View testID="attachment-card.failedOverlay" style={[s.imageFailed, r.failedOverlay.view]}>
          <Icon testID="attachment-card.failedIcon" name="circle-alert" size={failedIconSize as number} color={r.failedIcon.text.color} style={Object.keys(failedIconRest).length ? failedIconRest : undefined} />
          <Text testID="attachment-card.failedTitle" numberOfLines={2} style={[failedTitle.view, failedTitle.text]}>
            {str.parts("failedUpload", { name: p.name })}
          </Text>
          <Button label={str("retry")} variant="secondary" size="sm" iconLeading="rotate-ccw" loading={p.retrying} onPress={p.retry} />
        </View>
      ) : null}
    </View>
  );
}

function LinkCard(p: Card) {
  const { t } = useTheme();
  const s = useStyles();
  const { strings } = p;
  const str = useStrings("attachment-card", strings);
  const press = usePress();
  const r = useRecipe(recipes["attachment-card"], { state: { focus: press.focused }, styles: p.styles });
  const linkOpen = partStyle(r, "linkOpen", { view: press.pressed ? { opacity: 0.7 } : undefined });
  const linkDomain = partStyle(r, "linkDomain", { text: s.linkDomain });
  // The quote edge is on the leading side: the right one in a right-to-left layout.
  const card = StyleSheet.flatten(s.linkCard);
  const edge: ViewStyle | undefined = I18nManager.isRTL ? { borderLeftWidth: 0, borderRightWidth: card.borderLeftWidth, paddingLeft: 0, paddingRight: card.paddingLeft } : undefined;
  // An icon's size is its width and height; what else `styles` sets on it goes on the glyph.
  const { width: linkIconSize, height: _linkIconHeight, ...linkIconRest } = r.linkIcon.view;
  return (
    <View testID="attachment-card.linkCard" style={[s.linkCard, edge, r.linkCard.view]}>
      <Pressable
        testID="attachment-card.linkOpen"
        accessibilityRole="link"
        accessibilityLabel={str("link", { title: p.title, domain: p.domain })}
        onPress={() => {
          if (p.url) void Linking.openURL(p.url).catch(() => {});
        }}
        {...press.handlers}
        style={[s.linkOpen, linkOpen.view]}
      >
        <View style={s.fileText}>
          <View testID="attachment-card.linkSite" style={[s.linkSite, r.linkSite.view]}>
            <Icon testID="attachment-card.linkIcon" name="globe" size={linkIconSize as number} color={r.linkSite.text.color} style={Object.keys(linkIconRest).length ? linkIconRest : undefined} />
            <Text testID="attachment-card.linkDomain" numberOfLines={1} style={[linkDomain.view, linkDomain.text]}>
              {p.domain}
            </Text>
          </View>
          <Text testID="attachment-card.linkTitle" numberOfLines={2} style={[r.linkTitle.view, r.linkTitle.text]}>
            {p.title}
          </Text>
          {p.description ? (
            <Text testID="attachment-card.linkDesc" numberOfLines={2} style={[r.linkDesc.view, r.linkDesc.text]}>
              {p.description}
            </Text>
          ) : null}
        </View>
        {p.src ? <Image testID="attachment-card.linkThumb" source={{ uri: p.src }} accessibilityIgnoresInvertColors resizeMode="cover" style={[s.linkThumb, r.linkThumb.view as ImageStyle]} /> : null}
      </Pressable>
    </View>
  );
}

function VoiceCard(p: Card & { playing: boolean; onPlaying: (on: boolean) => void }) {
  const s = useStyles();
  const { strings } = p;
  const str = useStrings("attachment-card", strings);
  const r = useRecipe(recipes["attachment-card"], { styles: p.styles });
  const played = useRecipe(recipes["attachment-card"], { state: { on: true }, styles: p.styles });
  const duration = partStyle(r, "duration", { text: s.duration });
  return (
    <View testID="attachment-card.voiceCard" style={[s.voiceCard, r.voiceCard.view]}>
      <IconButton
        icon={p.playing ? "pause" : "play"}
        label={str(p.playing ? "pause" : "play", { duration: p.duration })}
        variant="soft"
        toggle
        active={p.playing}
        onActiveChange={(on) => p.onPlaying(on)}
      />
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.wave}>
        {p.waveform.map((h, i) => (
          <View key={i} testID="attachment-card.bar" style={[s.bar, partStyle(i < p.played ? played : r, "bar", { view: { height: h } }).view]} />
        ))}
      </View>
      <Text testID="attachment-card.duration" style={[duration.view, duration.text]}>
        {p.duration}
      </Text>
    </View>
  );
}

function Chip(p: Card) {
  const s = useStyles();
  const { strings } = p;
  const str = useStrings("attachment-card", strings);
  const r = useRecipe(recipes["attachment-card"], { styles: p.styles });
  const shared = { strings: p.strings, styles: p.styles };
  const moving = p.status === "uploading" || p.status === "paused";
  return (
    <View testID="attachment-card.chip" style={[s.chip, r.chip.view]}>
      {p.kind === "image" && p.src ? (
        <Image testID="attachment-card.chipThumb" source={{ uri: p.src }} accessibilityIgnoresInvertColors resizeMode="cover" style={[s.chipThumb, r.chipThumb.view as ImageStyle]} />
      ) : null}
      {p.kind !== "image" ? <FileBadge fileType={p.fileType} side={36} radius={8} {...shared} /> : null}
      <Meta p={p} compact />
      {p.status === "failed" ? <IconButton icon="rotate-ccw" label={str("retryName", { name: p.name })} size="sm" disabled={p.retrying} onPress={p.retry} /> : null}
      <IconButton icon="x" label={moving ? str("cancelUpload", { name: p.name }) : str("remove", { name: p.name })} size="sm" onPress={p.cancel} />
    </View>
  );
}

export function AttachmentCard({
  kind = "file",
  name = "",
  fileType = "other",
  badge = "",
  typeLabel = "",
  size = "",
  status: state = "ready",
  progress = 0,
  error = "",
  src = "",
  title = "",
  domain = "",
  description = "",
  url = "",
  duration = "",
  waveform = [],
  played = 0,
  playing,
  compact = false,
  removable = false,
  onOpen,
  onStatusChange,
  onRetry,
  onPlayingChange,
  onCancel,
  strings,
  styles,
  style,
  testID,
  ...rest
}: AttachmentCardProps) {
  const s = useStyles();
  const str = useStrings("attachment-card", strings);
  const r = useRecipe(recipes["attachment-card"], { styles });
  // Retry reports the request and spins until the app answers: the upload's status is the app's, never moved here.
  const { pending: retrying, run } = usePending([state, error, progress]);
  // Playing is the card's own toggle, reported so the app can start or stop the audio.
  const [on = false, setOn] = useControllable(playing, onPlayingChange);
  // A thumbnail that will not load falls back to the file card with the image glyph, so the file can still be opened.
  const [broken, setBroken] = useState<string | null>(null);
  const asFile = kind === "image" && !compact && src !== "" && broken === src;
  // iOS has no live regions: a stall or a failure that arrives while the person is elsewhere is said.
  const last = useRef(state);
  useEffect(() => {
    if (last.current === state) return;
    last.current = state;
    if (state === "failed") announce(str("statusFailed", { name, error: error || str("error") }));
    else if (state === "paused") announce(str("statusPaused", { name, percent: Math.round(progress) }));
  }, [state, name, error, progress, str]);
  const p: Card = {
    kind,
    name,
    fileType: asFile ? "image" : fileType,
    badge: asFile ? (/\.([a-z0-9]{1,5})$/i.exec(name)?.[1] ?? str("imageBadge")).toUpperCase() : badge || str("badge"),
    typeLabel,
    size,
    status: state,
    progress: Math.min(100, Math.max(0, progress)),
    error: error || str("error"),
    src,
    title,
    domain,
    description,
    url,
    duration,
    waveform,
    played,
    compact,
    removable,
    open: () => onOpen?.(),
    retry: () =>
      run(
        onStatusChange || onRetry
          ? () => {
              onStatusChange?.("uploading");
              return onRetry?.();
            }
          : undefined,
      ),
    retrying,
    cancel: () => onCancel?.(),
    strings,
    styles,
  };
  return (
    <View {...rootProps(rest)} testID={partId(testID, "attachment-card", "root")} style={[s.root, r.root.view, style]}>
      {compact && kind !== "link" && kind !== "voice" ? (
        <Chip {...p} />
      ) : kind === "file" || asFile ? (
        <FileCard {...p} />
      ) : kind === "image" ? (
        <ImageCard {...p} onBroken={() => setBroken(src)} />
      ) : kind === "link" ? (
        <LinkCard {...p} />
      ) : (
        <VoiceCard {...p} playing={on} onPlaying={setOn} />
      )}
    </View>
  );
}
