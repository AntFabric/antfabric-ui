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
export type Politeness = "polite" | "assertive";

const regions: Partial<Record<Politeness, HTMLElement>> = {};
const timers: Partial<Record<Politeness, ReturnType<typeof setTimeout>>> = {};

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

/** Says `message` to screen readers. The same message twice in a row is read twice: the region is emptied first. */
export function announce(message: string, politeness: Politeness = "polite"): void {
  const el = region(politeness);
  if (!el || !message) return;
  el.textContent = "";
  clearTimeout(timers[politeness]);
  // A beat between emptying and filling, so the change is seen as new text.
  timers[politeness] = setTimeout(() => {
    el.textContent = message;
  }, 50);
}
