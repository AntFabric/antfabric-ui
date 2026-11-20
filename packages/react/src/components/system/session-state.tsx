import { useEffect, useRef, type CSSProperties } from "react";
import { recipes, useControllable, useStrings, type KitStrings } from "@antfabric-ui/core";
import { usePlatform } from "../../platform";
import { t } from "../../tokens";
import { announce } from "../../lib/announce";
import { useFocusHandoff } from "../../lib/focus";
import { Icon, Spinner } from "../../lib/icon";
import { partStyle, useRecipe, type PartStyles } from "../../lib/recipe";
import { rootProps, type RootProps } from "../../lib/root-props";
import { box, css, enter, row, text } from "../../lib/style";
import { Button } from "../actions/button";

export type SessionStateState = "expired" | "waiting" | "locked" | "suspended" | "signed-out";

export interface SessionStateProps extends RootProps<HTMLDivElement> {
  /** waiting = the SSO hand-off is in the browser. locked = the phone's app lock. */
  state?: SessionStateState;
  /** Where the web sends the person after sign-in: the URL they were on. */
  returnTo?: string;
  /** Why the last attempt did not sign anyone in: the platform layer's sentence, verbatim. */
  error?: string;
  /** No backend answering: Sign in would do nothing, so the card says so. */
  offline?: boolean;
  onSignIn?: () => void;
  onCancel?: () => void;
  onSignOut?: () => void;
  /** Per-part styles over the theme: `{ root: {…}, tile: {…}, title: {…}, actions: {…} }`. */
  styles?: PartStyles<"session-state">;
  /** This card's built-in text (the titles, the prose, the buttons) over the tree's and the English defaults. */
  strings?: Partial<KitStrings["session-state"]>;
  style?: CSSProperties;
}

const ICON: Record<SessionStateState, string> = {
  expired: "clock",
  waiting: "external-link",
  locked: "scan-face",
  suspended: "user-x",
  "signed-out": "log-in",
};

export function SessionState({ state: stateProp = "expired", returnTo = "", error = "", offline = false, onSignIn, onCancel, onSignOut, styles, strings, style, ...rest }: SessionStateProps) {
  const s = useStrings("session-state", strings);
  const { platform } = usePlatform();
  const web = platform === "web";
  // Signing in hands over to the browser: the card turns to waiting while it has them.
  const [state, setState] = useControllable(stateProp);
  const title = {
    expired: s("titleExpired"),
    waiting: web ? s("titleWaitingWeb") : s("titleWaitingDesktop"),
    locked: s("titleLocked"),
    suspended: s("titleSuspended"),
    "signed-out": s("titleSignedOut"),
  }[state];
  const body = {
    expired: `${s("bodyExpired")}${web ? (returnTo ? ` ${s("bodyExpiredReturn", { page: returnTo })}` : "") : ` ${s("bodyExpiredDesktop")}`}`,
    waiting: web ? s("bodyWaitingWeb", { page: returnTo || s("thisPage") }) : s("bodyWaitingDesktop"),
    locked: s("bodyLockedDesktop"),
    suspended: s("bodySuspended"),
    "signed-out": s("bodySignedOut"),
  }[state];
  const r = useRecipe(recipes["session-state"], { variants: { state }, styles });
  const signIn = () => {
    setState("waiting");
    onSignIn?.();
  };
  // Sign in turns into the waiting status: focus, which was on the button that went, moves to the status.
  const waitRef = useFocusHandoff<HTMLDivElement>(state === "waiting");
  // A change of state is said once when focus did not move to it, and the reason or error as it arrives: a status that is mounted
  // holding its text is not read.
  const was = useRef(state);
  useEffect(() => {
    if (was.current === state) return;
    was.current = state;
    if (!(waitRef.current && document.activeElement === waitRef.current)) announce(title);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const note = offline ? s("offline") : error;
  useEffect(() => {
    if (note) announce(note);
  }, [note]);
  return (
    <div
      data-af-part="root"
      role="region"
      {...rootProps(rest)}
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === "Escape" && state === "waiting" && !web) onCancel?.();
      }}
      style={css(
        box,
        { maxWidth: "100%", alignItems: "center", paddingTop: t.space["2xl"], paddingBottom: t.space.xl, textAlign: "center" },
        partStyle(r, "root", enter("pop")),
        style,
      )}
    >
      <div
        aria-hidden
        data-af-part="tile"
        style={css(box, { alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: t.space.xs }, r.tile)}
      >
        <Icon part="tileIcon" name={ICON[state]} style={r.tileIcon} />
      </div>
      <span role="heading" aria-level={2} data-af-part="title" style={css(text, r.title)}>
        {title}
      </span>
      <span data-af-part="body" style={css(text, r.body)}>{body}</span>
      {state === "waiting" && (
        <div ref={waitRef} tabIndex={-1} aria-busy data-af-part="wait" style={css(row, { marginTop: t.space["2xs"], outline: "none" }, r.wait)}>
          <Spinner part="spinner" decorative style={r.spinner} />
          <span data-af-part="waitText" style={css(text, r.waitText)}>{web ? s("redirecting") : s("waitingBrowser")}</span>
        </div>
      )}
      {offline ? (
        <span data-af-part="note" style={css(text, r.note)}>
          {s("offline")}
        </span>
      ) : error ? (
        <span data-af-part="note" style={css(text, r.note)}>
          {error}
        </span>
      ) : null}
      <div data-af-part="actions" style={css(box, { alignSelf: "stretch", marginTop: t.space.md }, r.actions)}>
        {state === "expired" && <Button label={web ? s("signInAgain") : s("signIn")} size="lg" full disabled={offline} onPress={signIn} />}
        {state === "signed-out" && <Button label={s("signIn")} size="lg" full disabled={offline} onPress={signIn} />}
        {state === "waiting" && !web && <Button label={s("openBrowserAgain")} variant="secondary" size="lg" full iconTrailing="external-link" onPress={() => onSignIn?.()} />}
        {state === "waiting" && !web && <Button label={s("cancel")} variant="ghost" size="lg" full onPress={() => onCancel?.()} />}
        {state === "suspended" && <Button label={s("useDifferentAccount")} variant="secondary" size="lg" full onPress={() => onSignOut?.()} />}
      </div>
    </div>
  );
}
