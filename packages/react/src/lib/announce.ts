/**
 * One polite and one assertive live region for the whole page, added to `document.body` the first time something is announced. A status
 * component announces through them instead of mounting a live region with its content: a region that arrives already holding its text
 * is not read by most screen readers, and one region per toast or banner reads each of them twice.
 *
 *   announce(s("restored"));                 // polite: waits for the reader to finish
 *   announce(s("connectionLost"), "assertive"); // interrupts: an error, a blocking question
 *
 * Nothing is drawn: the regions are clipped to one pixel. On the server, and before the page has a body, it does nothing.
 */
import { useEffect, useRef } from "react";

export type Politeness = "polite" | "assertive";

const regions: Partial<Record<Politeness, HTMLElement>> = {};
/** Set while a message waits for the beat. */
const timers: Partial<Record<Politeness, ReturnType<typeof setTimeout>>> = {};
/** What is waiting for the beat to pass, per politeness. */
const pending: Record<Politeness, string[]> = { polite: [], assertive: [] };

function region(kind: Politeness): HTMLElement | null {
  if (typeof document === "undefined" || !document.body) return null;
  const had = regions[kind];
  if (had?.isConnected) return had;
  const el = document.createElement("div");
  el.setAttribute("aria-live", kind);
  el.setAttribute("aria-atomic", "true");
  el.setAttribute("data-af-announcer", kind);
  // role=status / alert as well: some readers only watch roles.
  el.setAttribute("role", kind === "assertive" ? "alert" : "status");
  Object.assign(el.style, { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", margin: "-1px", padding: "0", border: "0" });
  document.body.appendChild(el);
  regions[kind] = el;
  return el;
}

/**
 * Says `message` to screen readers. The same message twice in a row is read twice: the region is emptied first, and filled after a beat.
 * Messages that arrive within that beat (an error and the toast that reports it, a field's error and its form's) are read together, in
 * order, each ending in a full stop (one region change, which every reader reads whole); the same text twice in one beat is read once.
 */
export function announce(message: string, politeness: Politeness = "polite"): void {
  const el = region(politeness);
  if (!el || !message) return;
  const queue = pending[politeness];
  if (!queue.includes(message)) queue.push(message);
  // Already waiting for the beat: this one is read with the others when it passes (a stream of messages cannot hold the region empty).
  if (timers[politeness] !== undefined) return;
  el.textContent = "";
  // A beat between emptying and filling, so the change is seen as new text.
  timers[politeness] = setTimeout(() => {
    timers[politeness] = undefined;
    el.textContent = queue.splice(0).reduce((said, m) => (said ? `${said.trimEnd()}${/[.!?…]$/.test(said.trimEnd()) ? "" : "."} ${m}` : m), "");
  }, 50);
}

/**
 * Announces `message` each time it changes to a new text ("" or nothing says nothing): a status that changes in place (a send that failed, a
 * page count, offline), drawn as plain text beside it. Not on the first render unless `initial`: what was there when the screen came is not
 * news, while a toast or a banner, whose arrival is the news, passes `initial`.
 *
 *   useAnnounce(status === "failed" ? s("failed") : "", "assertive");
 */
export function useAnnounce(message: string | false | null | undefined, politeness: Politeness = "polite", { initial = false }: { initial?: boolean } = {}): void {
  const said = useRef<string | false | null | undefined>(initial ? undefined : message);
  useEffect(() => {
    if (message && message !== said.current) announce(message, politeness);
    said.current = message;
    // Keyed on the text: the same words drawn again are not said again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);
}
