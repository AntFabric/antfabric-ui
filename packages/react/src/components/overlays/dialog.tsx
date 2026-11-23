import { useId, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { recipes, usePending, useStrings, type KitStrings } from "@antfabric/ui-core";
import { t } from "../../tokens";
import { Icon, type IconName } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { box, css, enter, row, text, truncate } from "../../lib/style";
import { useAnnounce } from "../../lib/announce";
import { focusables, useOverlayFocus } from "../../lib/focus";
import { OverlayLayer, useLayerHost, useLayerStack } from "../../lib/layer";
import { rootProps, type RootProps } from "../../lib/root-props";
import { Button } from "../actions/button";
import { IconButton } from "../actions/icon-button";

export type DialogKind = "confirm" | "form";
export type DialogTone = "danger" | "primary";

export interface DialogProps extends RootProps<HTMLDivElement> {
  /** confirm: a decision about something already chosen, 440 wide with a glyph tile. form: fields to fill, 540 wide with a header strip and a close button. */
  kind?: DialogKind;
  title: string;
  /** A line under a form dialog's title. */
  subtitle?: string;
  /** Names what will be lost, in specific words. */
  body?: string;
  /** The confirm's glyph tile. Empty hides it; a form dialog never has one. */
  icon?: IconName;
  /** danger is the destructive CTA for anything that destroys; primary (the brand fill) for one that ends or disconnects but destroys nothing. */
  tone?: DialogTone;
  /** A verb plus the object, never OK or Yes. */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Fields or anything else between the body and the actions. */
  children?: ReactNode;
  /** The confirm is in flight: its button spins and cannot be pressed again. Cancel, Close and Esc still cancel. A press shows it until the app answers. */
  loading?: boolean;
  /** Why the last attempt failed. The dialog stays open; pressing the CTA again retries. */
  error?: string;
  /** Drawn over another open dialog — the one level of stacking allowed. */
  stacked?: boolean;
  /** The title of the dialog drawn dimmed behind this one while `stacked`. Empty draws that dialog with no title. */
  behindTitle?: string;
  /**
   * Drawn over the whole window, above the page: the scrim covers it, the page behind does not scroll and is out of reach, and Esc or a
   * press on the scrim cancels (the top dialog only). Off, the dialog is drawn where it is mounted, and its host does all of that.
   */
  modal?: boolean;
  /** Esc, a press on the scrim and Android's back cancel it. Off for a step that must be answered with a button. */
  dismissible?: boolean;
  /** Reports the request. Return a promise, or answer with `error` or by closing; until then the CTA spins. */
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** Per-part styles over the theme: `{ panel: {…}, title: {…}, actions: {…} }`. */
  styles?: PartStyles<"dialog">;
  /** This dialog's built-in text (the button words, the close button's name) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["dialog"]>;
  style?: CSSProperties;
}

/** The layout and the motion no token styles; what the tokens decide is the recipe's. */
const panelLook: CSSProperties = {
  ...box,
  maxWidth: "100%",
  paddingTop: t.space["2xl"],
  paddingInline: t.space.xl,
  paddingBottom: t.space.xl,
  outline: "none",
  ...enter("pop"),
  transformOrigin: "center",
};

const formLook: CSSProperties = { paddingTop: 0, paddingInline: 0, paddingBottom: 0, overflow: "hidden" };

const titleLook: CSSProperties = { ...text, margin: 0 };

const underlay: CSSProperties = {
  ...box,
  position: "absolute",
  top: t.space["2xl"],
  left: t.space["2xl"],
  right: t.space["2xl"],
  height: 300, /* structural: stage: the dummy dialog drawn under the real one */
  gap: t.space.md,
  padding: t.space.lg,
};

const field: CSSProperties = { flexShrink: 0 };

/**
 * A decision about something already chosen, or a short form. With `modal` it is drawn over the whole window in the overlay layer: on
 * the client it mounts once, in the layer (so focus moves into the panel it ends up in); on the server it is drawn in place.
 */
export function Dialog(props: DialogProps) {
  const marker = useRef<HTMLSpanElement | null>(null);
  const layer = useLayerHost(marker, !!props.modal);
  if (!props.modal) return <DialogView {...props} floating={false} />;
  if (!layer.client) return <DialogView {...props} floating={false} />;
  return (
    <>
      <span ref={marker} hidden />
      {layer.host ? (
        <OverlayLayer host={layer.host} zIndex={t.z.modal} modal near={marker}>
          <DialogView {...props} floating />
        </OverlayLayer>
      ) : null}
    </>
  );
}

function DialogView({
  kind = "confirm",
  title,
  subtitle = "",
  body = "",
  icon = "trash-2",
  tone = "danger",
  confirmLabel,
  cancelLabel,
  children,
  loading = false,
  error = "",
  stacked = false,
  behindTitle = "",
  modal: _modal = false,
  dismissible = true,
  onConfirm,
  onCancel,
  styles,
  strings,
  style,
  floating,
  ...rest
}: DialogProps & { floating: boolean }) {
  const id = useId();
  const s = useStrings("dialog", strings);
  const r = useRecipe(recipes.dialog, { variants: { kind }, styles });
  const actions = useRef<HTMLDivElement>(null);
  // A press waits for the app's answer: a new `error` or `loading`, or the promise `onConfirm` returns settling. Then the CTA can retry.
  const { pending, run } = usePending([error, loading]);
  const busy = loading || pending;
  const form = kind === "form";
  // Cancelling stays live while the request is in flight: the app may abandon it.
  const cancel = () => onCancel?.();
  const confirm = () => {
    if (!loading) run(onConfirm);
  };

  // The focus contract: focus moves in when the dialog mounts (a form to its first field, a confirm to Cancel, so a reflexive Enter never
  // deletes), Tab stays inside, Esc cancels, and focus goes back to the opener when it unmounts. In the layer, Esc is the stack's: it comes
  // after the controls inside (an open Select keeps its own) and reaches the top overlay only.
  const focus = useOverlayFocus<HTMLDivElement>({
    trap: true,
    onEscape: dismissible && !floating ? cancel : undefined,
    initial: (panel) => (form ? focusables(panel).find((el) => el.matches("input, textarea, select")) : actions.current?.querySelector<HTMLElement>("button")) ?? panel,
  });
  const panel = focus.ref;
  // Only the top overlay takes Esc and a press on the scrim; a dialog that must be answered takes them and does nothing.
  useLayerStack(floating, () => [panel.current], { onEscape: () => dismissible && cancel(), onOutside: () => dismissible && cancel() });

  const keyboard = (e: KeyboardEvent) => {
    focus.onKeyDown(e);
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && form) {
      e.preventDefault();
      confirm();
    }
  };

  // An error that arrives is said at once, through the page's announcer (which a modal leaves reachable), not by a region mounted with it.
  useAnnounce(error, "assertive", { initial: true });
  const errorBox = error && (
    <div
      data-af-part="error"
      style={css(
        row,
        { alignItems: "flex-start", gap: t.space.xs, marginTop: t.space.md, padding: t.space.sm },
        partStyle(r, "error", form && { marginTop: 0, marginInline: t.space.lg, marginBottom: t.space.sm }),
      )}
    >
      <Icon part="errorIcon" name="circle-alert" style={partStyle(r, "errorIcon", { marginTop: t.space["3xs"] })} />
      <span data-af-part="errorText" style={css(text, { flex: 1 }, r.errorText)}>{error}</span>
    </div>
  );

  const drawn = (
    <div
      data-af-part="root"
      {...rootProps(rest)}
      style={css(
        box,
        {
          alignSelf: "flex-start",
          alignItems: "center",
          justifyContent: "center",
          padding: t.space["2xl"],
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          ...enter("fade"),
        },
        partStyle(r, "root", stacked && { width: 588, minHeight: 400 }), /* structural: stage: the stacked-dialog demo frame */
        floating && { alignSelf: "stretch", flex: 1, overflowY: "auto", pointerEvents: "auto" },
        style,
      )}
    >
      {stacked && (
        <>
          <div aria-hidden data-af-part="underlay" style={css(underlay, r.underlay)}>
            {behindTitle ? <span data-af-part="title" style={css(titleLook, partStyle(r, "title", { marginBottom: t.space.xs }))}>{behindTitle}</span> : null}
            <div data-af-part="field" style={css(field, r.field)} />
            <div data-af-part="field" style={css(field, r.field)} />
            <div data-af-part="field" style={css(field, r.field)} />
          </div>
          <div data-af-part="dim" style={css({ position: "absolute", inset: 0 }, r.dim)} />
        </>
      )}
      <div
        ref={panel}
        role={kind === "confirm" ? "alertdialog" : "dialog"}
        aria-modal
        aria-labelledby={`${id}-title`}
        aria-describedby={body ? `${id}-body` : undefined}
        tabIndex={-1}
        onKeyDown={keyboard}
        data-af-part="panel"
        style={css(panelLook, partStyle(r, "panel", form && formLook))}
      >
        {!form && icon && (
          <div aria-hidden data-af-part="icon" style={css(box, { flexShrink: 0, alignItems: "center", justifyContent: "center", marginBottom: t.space.lg }, r.icon)}>
            <Icon part="glyph" name={icon} style={r.glyph} />
          </div>
        )}
        {!form && (
          <h2 id={`${id}-title`} data-af-part="title" style={css(titleLook, partStyle(r, "title", truncate(2), { marginBottom: t.space.xs }))}>
            {title}
          </h2>
        )}
        {form && (
          <div data-af-part="formHeader" style={css(row, { gap: t.space.md, paddingInline: t.space.lg, paddingBlock: t.space.lgXl }, r.formHeader)}>
            <div style={css(box, { flex: 1 })}>
              <h2 id={`${id}-title`} data-af-part="title" style={css(titleLook, partStyle(r, "title", truncate(1)))}>
                {title}
              </h2>
              {subtitle && <span data-af-part="subtitle" style={css(text, truncate(1), r.subtitle)}>{subtitle}</span>}
            </div>
            <IconButton part="close" icon="x" label={s("close")} onPress={() => cancel()} style={r.close} />
          </div>
        )}
        <div data-af-scroll data-af-part="scroll" style={css(box, { gap: t.space.md, overflowY: "auto" }, partStyle(r, "scroll", form && { padding: t.space.lg }))}>
          {body && (
            <p id={`${id}-body`} data-af-part="body" style={css(text, { lineHeight: 1.55 }, r.body)}>
              {body}
            </p>
          )}
          {children ? <div style={css(box, { gap: t.space.md })}>{children}</div> : null}
        </div>
        {errorBox}
        <div
          ref={actions}
          data-af-part="actions"
          style={css(
            row,
            { justifyContent: "flex-end", gap: t.space.sm },
            partStyle(r, "actions", { marginTop: form ? 0 : t.space.xl }, form && { paddingInline: t.space.lg, paddingBlock: t.space.mdLg }),
          )}
        >
          <Button label={cancelLabel ?? s("cancel")} variant="secondary" size="lg" onPress={() => cancel()} style={{ minWidth: t.dialog.actionMinW }} />
          <Button
            label={confirmLabel ?? s("confirm")}
            variant={tone === "danger" ? "danger" : "primary"}
            size="lg"
            loading={busy}
            shortcut={form ? "Mod+Enter" : undefined}
            onPress={() => confirm()}
            style={{ minWidth: t.dialog.actionMinW }}
          />
        </div>
      </div>
    </div>
  );
  return drawn;
}
