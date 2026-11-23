import { useEffect, useRef, useState, type CSSProperties } from "react";
import { recipes, useControllable, useDirection, useStrings, type Attachment, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon } from "../../lib/icon";
import { useInteraction } from "../../lib/interaction";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, pressable, row, rtl, text, truncate, visuallyHidden } from "../../lib/style";
import { announce } from "../../lib/announce";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

export type AttachmentCardKind = NonNullable<Attachment["kind"]>;
export type AttachmentCardFileType = NonNullable<Attachment["fileType"]>;
export type AttachmentCardStatus = NonNullable<Attachment["status"]>;

export interface AttachmentCardProps extends RootProps<HTMLDivElement> {
  kind?: AttachmentCardKind;
  /** File name as uploaded. Also the accessible name's subject. */
  name?: string;
  /** The family: picks the badge colours. */
  fileType?: AttachmentCardFileType;
  /** Up to five letters on the badge: PDF, DOCX, XLSX, KEY, ZIP, TS. Empty reads strings `badge`. */
  badge?: string;
  /** Human type name for the meta line ("PDF document"). Empty reads strings `typeLabel`. */
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
  /** Bar heights in px (4–28). Drawn, never announced. */
  waveform?: number[];
  /** How many waveform bars have played; those are coral. */
  played?: number;
  playing?: boolean;
  /** The staged chip in the composer tray. */
  compact?: boolean;
  /** Link preview only: the sender can remove the preview and keep the link. */
  removable?: boolean;
  /** Opens the preview (lightbox or file viewer). */
  onOpen?: () => void;
  onDownload?: () => void;
  /** Called with `status` as Retry leaves it (uploading). */
  onStatusChange?: (status: AttachmentCardStatus) => void;
  /** Retry was pressed on a failed upload: the app starts it again. */
  onRetry?: () => void;
  /** Cancels an upload in progress, removes a staged file, or removes a link's preview. */
  onCancel?: () => void;
  /** This card's built-in text (its accessible names, "Uploading…", "Paused", the error) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["attachment-card"]>;
  /** Per-part styles over the theme: `{ root: {…}, fileCard: {…}, badge: {…}, meta: {…}, track: {…}, fill: {…} }`. */
  styles?: PartStyles<"attachment-card">;
  style?: CSSProperties;
}

/** What every piece of the card is drawn with: the card's `strings` and `styles`, so a part reaches `styles` wherever it is drawn. */
type Shared = Pick<AttachmentCardProps, "strings" | "styles">;

/** Layout no token decides; the colours, sizes and type are the recipe's (`attachmentCard`). */
const meta: CSSProperties = { ...text, ...truncate(1), fontVariantNumeric: "tabular-nums" };

function FileBadge({ fileType, badge, side, radius, styles }: Shared & { fileType: AttachmentCardFileType; badge: string; side: number; radius?: number }) {
  const r = useRecipe(recipes["attachment-card"], { variants: { fileType }, styles });
  return (
    <span
      aria-hidden
      data-af-part="badge"
      style={css(
        box,
        partStyle(r, "badge", {
          width: side,
          height: side,
          flexShrink: 0,
          ...(radius !== undefined && { borderRadius: radius }),
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: "0.02em",
          lineHeight: 1,
          userSelect: "none",
        }),
      )}
    >
      <span data-af-part="badgeText" style={css(text, r.badgeText)}>
        {badge}
      </span>
    </span>
  );
}

/** One line that gives way in the middle, so the extension survives: "platform-eng-incident-…final-v12.pdf". */
function FileName({ name, styles }: Shared & { name: string }) {
  const r = useRecipe(recipes["attachment-card"], { styles });
  const keep = Math.min(12, Math.max(0, name.length - 4));
  const head = name.slice(0, name.length - keep);
  const tail = name.slice(name.length - keep);
  return (
    <span title={name} data-af-part="fileName" style={css(row, partStyle(r, "fileName", { whiteSpace: "nowrap" }))}>
      <span style={css(text, truncate(1), { flexShrink: 1, whiteSpace: "pre" })}>{head}</span>
      <span style={css(text, { flexShrink: 0, whiteSpace: "pre" })}>{tail}</span>
    </span>
  );
}

function Track({ name, progress, status, height, part, decorative = false, strings, styles }: Shared & { name: string; progress: number; status: AttachmentCardStatus; height: number; part: "track" | "imageTrack"; decorative?: boolean }) {
  const s = useStrings("attachment-card", strings);
  const r = useRecipe(recipes["attachment-card"], { variants: { status }, styles });
  return (
    <span
      // Inside a button the bar is drawn only: its children are not exposed, so FileCard carries the progress as a sibling.
      {...(decorative ? { "aria-hidden": true } : { role: "progressbar", "aria-valuenow": progress, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": s("uploadingLabel", { name }) })}
      data-af-part={part}
      style={css(box, { height, flexShrink: 0, overflow: "hidden" }, r[part])}
    >
      <span data-af-part="fill" style={css({ display: "block", width: `${progress}%`, height: "100%", transition: "width 120ms linear" }, r.fill)} />
    </span>
  );
}

type Card = Required<Omit<AttachmentCardProps, "id" | "ref" | "className" | "style" | "strings" | "styles" | "onOpen" | "onDownload" | "onRetry" | "onStatusChange" | "onCancel" | "playing">> &
  Shared & {
    open: () => void;
    download: () => void;
    retry: () => void;
    cancel: () => void;
  };

function FileCard(p: Card) {
  const { strings } = p;
  const s = useStrings("attachment-card", strings);
  const ui = useInteraction({ disabled: p.status !== "ready" });
  const r = useRecipe(recipes["attachment-card"], { state: { focus: ui.focused }, styles: p.styles });
  const shared = { strings: p.strings, styles: p.styles };
  const pct = Math.round(p.progress);
  // The button's name carries the state, since a button's children are not read: the percent while it uploads, the reason when it failed.
  const name = p.status === "uploading" ? s("statusUploading", { name: p.name, percent: pct }) : p.status === "paused" ? s("statusPaused", { name: p.name, percent: pct }) : p.status === "failed" ? s("statusFailed", { name: p.name, error: p.error }) : s("preview", { name: p.name });
  return (
    <div data-af-part="fileCard" style={css(row, { width: 320, maxWidth: "100%" }, r.fileCard)}>
      {(p.status === "uploading" || p.status === "paused") && (
        <span role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={s("uploadingLabel", { name: p.name })} style={visuallyHidden} />
      )}
      <button
        type="button"
        data-af-part="fileOpen"
        data-af-press
        aria-label={name}
        title={name}
        disabled={ui.disabled}
        onClick={p.open}
        {...ui.handlers}
        style={css(pressable, { flexDirection: "row", alignItems: "center", flex: 1 }, partStyle(r, "fileOpen", ui.disabled && { cursor: "default" }))}
      >
        <FileBadge fileType={p.fileType} badge={p.badge} side={40} {...shared} />
        <span style={css(box, { flex: 1, gap: t.space["3xs"] })}>
          <FileName name={p.name} {...shared} />
          {p.status === "ready" && (
            <span data-af-part="meta" style={css(meta, r.meta)}>
              {[p.typeLabel, p.size].filter(Boolean).join(" · ")}
            </span>
          )}
          {p.status === "uploading" && (
            <span data-af-part="meta" style={css(meta, r.meta)}>
              {s.parts("uploading", { percent: pct, size: p.size })}
            </span>
          )}
          {p.status === "paused" && (
            <span data-af-part="paused" style={css(text, r.paused)}>
              {s.parts("paused", { percent: pct })}
            </span>
          )}
          {p.status === "failed" && (
            <span data-af-part="failed" style={css(text, truncate(2), r.failed)}>
              {p.error}
            </span>
          )}
          {(p.status === "uploading" || p.status === "paused") && (
            <span style={{ display: "block", marginTop: t.space["2xs"] }}>
              <Track name={p.name} progress={pct} status={p.status} height={3} part="track" decorative {...shared} />
            </span>
          )}
        </span>
      </button>
      {p.status === "ready" && <IconButton icon="download" label={s("download", { name: p.name })} size="sm" shape="square" onPress={p.download} style={{ flexShrink: 0 }} />}
      {(p.status === "uploading" || p.status === "paused") && <IconButton icon="x" label={s("cancelUpload", { name: p.name })} size="sm" onPress={p.cancel} style={{ flexShrink: 0 }} />}
      {p.status === "failed" && <Button label={s("retry")} variant="secondary" size="sm" iconLeading="rotate-ccw" onPress={p.retry} style={{ flexShrink: 0 }} />}
    </div>
  );
}

function ImageCard(p: Card & { onBroken: () => void }) {
  const { strings } = p;
  const s = useStrings("attachment-card", strings);
  const ui = useInteraction({ disabled: p.status !== "ready" });
  const r = useRecipe(recipes["attachment-card"], { styles: p.styles });
  const shared = { strings: p.strings, styles: p.styles };
  const pct = Math.round(p.progress);
  return (
    <div data-af-part="imageCard" style={css(box, { width: 360, maxWidth: "100%", overflow: "hidden" }, r.imageCard)}>
      <button
        type="button"
        data-af-press
        aria-label={s("photo", { name: p.name, size: p.size })}
        disabled={ui.disabled}
        onClick={p.open}
        {...ui.handlers}
        style={css(pressable, { width: "100%" }, ui.hovered && { opacity: 0.94 }, ui.focused && { boxShadow: `inset 0 0 0 3px ${t.focus.ring}` }, ui.disabled && { cursor: "default" })}
      >
        <img src={p.src} alt="" width={360} height={225} loading="lazy" decoding="async" onError={p.onBroken} style={{ display: "block", width: "100%", height: 225, objectFit: "cover", flexShrink: 0 }} />
      </button>
      {(p.status === "uploading" || p.status === "paused") && (
        <div data-af-part="scrim" style={css(box, { position: "absolute", inset: 0, justifyContent: "flex-end", pointerEvents: "none" }, r.scrim)}>
          <Track name={p.name} progress={pct} status={p.status} height={4} part="imageTrack" {...shared} />
        </div>
      )}
      {p.status === "failed" && (
        <div
          data-af-part="failedOverlay"
          style={css(box, { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", textAlign: "center" }, r.failedOverlay)}
        >
          <Icon part="failedIcon" name="circle-alert" size={r.failedIcon.width} color={r.failedIcon.color} style={r.failedIcon} />
          <span data-af-part="failedTitle" style={css(text, truncate(2), r.failedTitle)}>
            {s.parts("failedUpload", { name: p.name })}
          </span>
          <Button label={s("retry")} variant="secondary" size="sm" iconLeading="rotate-ccw" onPress={p.retry} />
        </div>
      )}
    </div>
  );
}

function LinkCard(p: Card) {
  const { strings } = p;
  const s = useStrings("attachment-card", strings);
  const ui = useInteraction();
  const dir = useDirection();
  const r = useRecipe(recipes["attachment-card"], { state: { focus: ui.focused }, styles: p.styles });
  return (
    <div
      data-af-part="linkCard"
      style={css(
        box,
        rtl(
          {
            flexDirection: "row",
            width: 480,
            maxWidth: "100%",
            paddingTop: t.space["2xs"],
            paddingRight: t.space.xl,
            paddingBottom: t.space["2xs"],
            paddingLeft: t.space.md,
            // The edge's width is the kit's; its colour is the recipe's (`borderLeftColor`), so `styles` can change either.
            borderLeftWidth: 3 /* structural: the quote edge */,
            borderLeftStyle: "solid",
          },
          dir,
        ),
        r.linkCard,
      )}
    >
      <a
        href={p.url || undefined}
        target="_blank"
        rel="noopener noreferrer"
        data-af-part="linkOpen"
        data-af-press
        aria-label={s("link", { title: p.title, domain: p.domain })}
        {...ui.handlers}
        style={css(pressable, { flexDirection: "row", alignItems: "flex-start", flex: 1 }, r.linkOpen)}
      >
        <span style={css(box, { flex: 1, gap: t.space["3xs"] })}>
          <span data-af-part="linkSite" style={css(row, { gap: t.space["2xs"] }, r.linkSite)}>
            <Icon part="linkIcon" name="globe" size={r.linkIcon.width} style={r.linkIcon} />
            <span data-af-part="linkDomain" style={css(text, truncate(1), r.linkDomain)}>
              {p.domain}
            </span>
          </span>
          <span data-af-part="linkTitle" style={css(text, truncate(2), r.linkTitle)}>
            {p.title}
          </span>
          {p.description && (
            <span data-af-part="linkDesc" style={css(text, truncate(2), r.linkDesc)}>
              {p.description}
            </span>
          )}
        </span>
        {p.src && (
          <img
            src={p.src}
            alt=""
            width={72}
            height={72}
            loading="lazy"
            decoding="async"
            data-af-part="linkThumb"
            style={css({ display: "block", width: 72, height: 72, flexShrink: 0, objectFit: "cover", boxSizing: "border-box" }, r.linkThumb)}
          />
        )}
      </a>
      {p.removable && <IconButton icon="x" label={s("removePreview")} size="sm" onPress={p.cancel} style={{ position: "absolute", top: 0, ...rtl({ right: -6 }, dir) }} />}
    </div>
  );
}

function VoiceCard(p: Card & { playing: boolean; onPlaying: (on: boolean) => void }) {
  const { strings } = p;
  const s = useStrings("attachment-card", strings);
  const r = useRecipe(recipes["attachment-card"], { styles: p.styles });
  const played = useRecipe(recipes["attachment-card"], { state: { on: true }, styles: p.styles });
  const dir = useDirection();
  return (
    <div data-af-part="voiceCard" style={css(row, rtl({ width: 300, maxWidth: "100%", paddingTop: t.space.xs, paddingRight: t.space.mdLg, paddingBottom: t.space.xs, paddingLeft: t.space.xs }, dir), r.voiceCard)}>
      <IconButton
        icon={p.playing ? "pause" : "play"}
        label={s(p.playing ? "pause" : "play", { duration: p.duration })}
        variant="soft"
        toggle
        active={p.playing}
        onActiveChange={(on) => p.onPlaying(on)}
        style={{ flexShrink: 0 }}
      />
      <span aria-hidden style={css(row, { gap: t.space["3xs"], flex: 1, height: 28, overflow: "hidden" })}>
        {p.waveform.map((h, i) => (
          <span key={i} data-af-part="bar" style={partStyle(i < p.played ? played : r, "bar", { width: 3, height: h, flexShrink: 0 })} />
        ))}
      </span>
      <span data-af-part="duration" style={css(text, partStyle(r, "duration", { fontVariantNumeric: "tabular-nums", flexShrink: 0 }))}>
        {p.duration}
      </span>
    </div>
  );
}

function Chip(p: Card) {
  const { strings } = p;
  const s = useStrings("attachment-card", strings);
  const r = useRecipe(recipes["attachment-card"], { styles: p.styles });
  const shared = { strings: p.strings, styles: p.styles };
  const pct = Math.round(p.progress);
  const moving = p.status === "uploading" || p.status === "paused";
  const dir = useDirection();
  return (
    <div
      data-af-part="chip"
      style={css(row, rtl({ width: 260, maxWidth: "100%", paddingTop: t.space.xs, paddingRight: t.space["2xs"], paddingBottom: t.space.xs, paddingLeft: t.space.xs, borderRadius: 10 }, dir), r.chip)}
    >
      {p.kind === "image" && p.src && (
        <img
          src={p.src}
          alt=""
          width={36}
          height={36}
          data-af-part="chipThumb"
          style={css({ display: "block", width: 36, height: 36, flexShrink: 0, objectFit: "cover", borderRadius: 8, boxSizing: "border-box" }, r.chipThumb)}
        />
      )}
      {p.kind !== "image" && <FileBadge fileType={p.fileType} badge={p.badge} side={36} radius={8} {...shared} />}
      <span style={css(box, { flex: 1, gap: t.space["3xs"] })}>
        <FileName name={p.name} {...shared} />
        {p.status === "ready" && (
          <span data-af-part="meta" style={css(meta, r.meta)}>
            {p.size}
          </span>
        )}
        {p.status === "uploading" && (
          <span data-af-part="meta" style={css(meta, r.meta)}>
            {s.parts("ofSize", { percent: pct, size: p.size })}
          </span>
        )}
        {p.status === "paused" && (
          <span data-af-part="paused" style={css(text, r.paused)}>
            {s.parts("pausedShort", { percent: pct })}
          </span>
        )}
        {p.status === "failed" && (
          <span data-af-part="failed" style={css(text, truncate(2), r.failed)}>
            {s("didntUpload")}
          </span>
        )}
        {moving && (
          <span style={{ display: "block", marginTop: t.space["2xs"] }}>
            <Track name={p.name} progress={pct} status={p.status} height={3} part="track" {...shared} />
          </span>
        )}
      </span>
      {p.status === "failed" && <IconButton icon="rotate-ccw" label={s("retryName", { name: p.name })} size="sm" onPress={p.retry} style={{ flexShrink: 0 }} />}
      <IconButton icon="x" label={moving ? s("cancelUpload", { name: p.name }) : s("remove", { name: p.name })} size="sm" onPress={p.cancel} style={{ flexShrink: 0 }} />
    </div>
  );
}

export function AttachmentCard({
  kind = "file",
  name = "",
  fileType = "other",
  badge = "",
  typeLabel = "",
  size = "",
  status,
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
  playing = false,
  compact = false,
  removable = false,
  onOpen,
  onDownload,
  onStatusChange,
  onRetry,
  onCancel,
  strings,
  styles,
  style,
  ...rest
}: AttachmentCardProps) {
  const s = useStrings("attachment-card", strings);
  const r = useRecipe(recipes["attachment-card"], { styles });
  const extension = (n: string) => (/\.([a-z0-9]{1,5})$/i.exec(n)?.[1] ?? s("imageBadge")).toUpperCase();
  const [state = "ready", setState] = useControllable(status, onStatusChange);
  const [on, setOn] = useControllable(playing);
  // A thumbnail that will not load falls back to the file card with the image badge, so the file can still be downloaded.
  const [broken, setBroken] = useState<string | null>(null);
  const asFile = kind === "image" && !compact && src !== "" && broken === src;
  // A stall or a failure arrives on its own while the person is elsewhere: say it (the percent is not, it would talk over everything).
  const last = useRef(state);
  useEffect(() => {
    if (last.current === state) return;
    last.current = state;
    if (state === "failed") announce(s("statusFailed", { name, error: error || s("error") }), "assertive");
    else if (state === "paused") announce(s("statusPaused", { name, percent: Math.round(progress) }));
  }, [state, name, error, progress, s]);
  const p: Card = {
    kind,
    name,
    fileType: asFile ? "image" : fileType,
    badge: asFile ? extension(name) : badge || s("badge"),
    typeLabel: asFile ? s("image") : typeLabel || s("typeLabel"),
    size,
    status: state,
    progress: Math.min(100, Math.max(0, progress)),
    error: error || s("error"),
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
    download: () => onDownload?.(),
    retry: () => {
      setState("uploading");
      onRetry?.();
    },
    cancel: () => onCancel?.(),
    strings,
    styles,
  };
  return (
    <div data-af-part="root" {...rootProps(rest)} style={css(box, { alignSelf: "flex-start", maxWidth: "100%" }, r.root, style)}>
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
    </div>
  );
}
