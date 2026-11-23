/**
 * `pnpm check`'s second pass: what a first render can't show. Each component is mounted once in a
 * DOM (happy-dom) and re-rendered through every state, variant, example and flow frame in turn, as
 * the playground and a flow's replay do. React's and React Native Web's warnings on update (a
 * shorthand style fighting its longhand, a controlled input flipping to uncontrolled, a key
 * collision) fail the check. The chart libraries only draw once mounted, so this is also where a data component is mounted twice
 * and must fold to one markup (the ids they number are renamed by `foldIds`, which the render snapshot uses too).
 */

import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register({ url: "http://localhost/" });
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// Animation frames never come: an endless loop (a skeleton's sweep) would otherwise keep act busy
// forever, and this pass is about what an update changes, not how it moves.
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
// ...and the person asks for less movement. A chart that draws itself in, or a KPI whose digits ease to a new value, would otherwise be caught
// at its first frame, since none ever comes; with reduced motion on, both are what they are when finished, which is what the `@mounted` hashes
// below must hold. (The animated paths are not drawn here: nothing in a DOM without frames can say whether they look right.)
const reduce = (query: string) => ({ matches: /prefers-reduced-motion:\s*reduce/.test(query), media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false });
globalThis.matchMedia = reduce as unknown as typeof globalThis.matchMedia;

const { act, createElement } = await import("react");
const { createRoot } = await import("react-dom/client");
const { PLATFORMS, antfabric, defineTheme, themes } = await import("@antfabric/ui-core");
const { components } = await import("@antfabric/ui-docs");
const { DefaultsProvider, SceneNode, Stage, Thing, kitComponent } = await import("../src/preview/kit");
const { casesFor, defaultsFor, usedIds } = await import("../src/lib/library");
const { foldIds, foldUseIds } = await import("./ids");
const { normalise, roundCoords } = await import("./snapshot-hash");
// What Tab reaches, as the kit's focus trap reads it: the modal check below holds the trap to its own rule.
const { focusables } = await import("../../../packages/react/src/lib/focus");
const { createHash } = await import("node:crypto");
const { writeFileSync } = await import("node:fs");

type OSPick = { os: import("@antfabric/ui-core").OS; osVersion?: number };
const OSES: Record<import("@antfabric/ui-core").Platform, OSPick[]> = {
  web: [{ os: "browser" }],
  desktop: [{ os: "mac", osVersion: 26 }, { os: "windows" }],
  mobile: [{ os: "ios", osVersion: 26 }, { os: "android" }],
};

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
let errors = 0;

/*
 * Focus and keyboard, read from roles: on the web and the desktop, every control a keyboard reaches
 * draws something when focused; a group with a composite role (a menu, a menubar, a toolbar, tabs, a radio group, a listbox) moves with the
 * arrow keys; and a modal dialog takes focus when it opens and keeps Tab inside. What fails today is listed in reports/generic.json
 * (`focusTodo`, `keysTodo`: `"<id>/<platform>: <what>"`); a failure not listed is an error, and a listed one that passes must come off, so
 * the lists only shrink. `AF_TODO_WRITE=1` writes the current failures into the lists instead (once, when a check is added).
 */
const { readFileSync } = await import("node:fs");
const genericFile = new URL("../../../reports/generic.json", import.meta.url);
const generic = JSON.parse(readFileSync(genericFile, "utf8")) as Record<string, unknown> & { focusTodo?: string[]; keysTodo?: string[]; controlTodo?: string[] };
const todo = { focus: new Set(generic.focusTodo ?? []), keys: new Set(generic.keysTodo ?? []), control: new Set(generic.controlTodo ?? []) };
const found = { focus: new Set<string>(), keys: new Set<string>(), control: new Set<string>() };
/** The ids this run drew, so an entry for a component it did not draw is not called stale. */
const drawn = new Set<string>();
let steps = 0;
let charts = 0;

// The mounted markup of every data component, hashed like a server render (`normalise`: variables resolved, ids folded, declarations
// canonical) under `<id>/<platform>@mounted`. The chart libraries draw their geometry in effects, so the server render of a chart is its
// frame and this is the only place its lines, bars and rings are seen. `pnpm check` reads the file this writes (AF_MOUNTED_OUT) and
// compares it with reports/renders.snapshot.json like any other key.
const mountedHashes = new Map<string, { hash: ReturnType<typeof createHash>; renders: number }>();

const logged: string[] = [];
const keep = { error: console.error, warn: console.warn };
/** React's warnings are printf-style: put the arguments back in place of each %s. */
const format = (a: unknown[]) => {
  const [first, ...rest] = a.map(String);
  return (first ?? "").replace(/%s/g, () => rest.shift() ?? "") + (rest.length ? ` ${rest.join(" ")}` : "");
};
console.error = (...a: unknown[]) => logged.push(format(a));
console.warn = (...a: unknown[]) => logged.push(format(a));

const FOCUSABLE_CONTROLS = 'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), select:not(:disabled), [role="button"], [role="tab"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"], [role="radio"], [role="checkbox"], [role="switch"], [tabindex="0"]';
/** What a control draws its focus on: itself, or for a native field the field around it (a checkbox's box, a text field's frame). */
const ringHost = (el: HTMLElement): HTMLElement => (/^(?:INPUT|TEXTAREA|SELECT)$/.test(el.tagName) ? (el.parentElement?.closest<HTMLElement>("[data-af-part]") ?? el.parentElement ?? el) : el);
const controlKey = (el: HTMLElement) => [el.tagName, el.getAttribute("role") ?? "", el.getAttribute("aria-label") ?? "", (el.textContent ?? "").trim().slice(0, 40), el.getAttribute("data-af-part") ?? ""].join("|");
/** Each control a keyboard reaches, by a readable key (one entry per distinct key: a list of like rows is named once). */
function controlsOf(host: HTMLElement): Map<string, HTMLElement> {
  const out = new Map<string, HTMLElement>();
  for (const el of host.querySelectorAll<HTMLElement>(FOCUSABLE_CONTROLS)) {
    // Not reached by Tab: hidden, taken out of the order (a roving group's other items), or not focusable at all (a readout with a role).
    if (el.closest('[aria-hidden="true"], [hidden], [inert]') || el.getAttribute("tabindex") === "-1" || el.tabIndex < 0) continue;
    const k = controlKey(el);
    if (!out.has(k)) out.set(k, el);
  }
  return out;
}
/** A control's short name for a todo line: its label or text, else its tag and part. */
const nameOf = (key: string) => {
  const [tag, role, label, txt, part] = key.split("|");
  return `${role || tag!.toLowerCase()} "${label || txt || part || "?"}"`;
};

const COMPOSITES: { role: string; items: string; keys: string[] }[] = [
  { role: "menu", items: '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]', keys: ["ArrowDown"] },
  { role: "menubar", items: '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]', keys: ["ArrowRight"] },
  { role: "toolbar", items: "button:not(:disabled)", keys: ["ArrowRight", "ArrowDown"] },
  { role: "tablist", items: '[role="tab"]', keys: ["ArrowRight", "ArrowDown"] },
  { role: "radiogroup", items: '[role="radio"], input[type="radio"]', keys: ["ArrowDown", "ArrowRight"] },
  { role: "listbox", items: '[role="option"]', keys: ["ArrowDown"] },
];

/** Arrow keys in each composite group: focus (or `aria-activedescendant`) moves from the first item to another. Returns what did not move. */
async function arrowsIn(host: HTMLElement): Promise<string[]> {
  const stuck: string[] = [];
  // A modal takes focus when it opens and keeps Tab inside it: read first, before the groups below move focus around.
  for (const modal of host.querySelectorAll<HTMLElement>('[aria-modal="true"]')) {
    const role = modal.getAttribute("role") ?? "dialog";
    if (!modal.contains(document.activeElement)) stuck.push(`${role}: focus is not inside when it opens`);
    const all = focusables(modal);
    if (all.length >= 2) {
      const last = all[all.length - 1]!;
      await act(async () => last.focus());
      await act(async () => {
        last.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
      });
      if (document.activeElement === last) stuck.push(`${role}: Tab from the last control does not go back to the first`);
    }
  }
  for (const c of COMPOSITES) {
    for (const group of host.querySelectorAll<HTMLElement>(`[role="${c.role}"]`)) {
      if (group.closest('[aria-hidden="true"], [hidden]')) continue;
      const items = Array.from(group.querySelectorAll<HTMLElement>(c.items)).filter((el) => el.closest(`[role="${c.role}"]`) === group && el.getAttribute("aria-disabled") !== "true" && !(el as HTMLButtonElement).disabled);
      if (items.length < 2) continue;
      const vertical = group.getAttribute("aria-orientation") === "vertical";
      const key = c.role === "toolbar" || c.role === "tablist" || c.role === "radiogroup" ? (vertical ? "ArrowDown" : c.keys[0]!) : c.keys[0]!;
      // A listbox driven from a field (a select's search, a palette's input) keeps focus there and moves `aria-activedescendant` or the highlight.
      const controller = c.role === "listbox" && group.id ? host.querySelector<HTMLElement>(`[aria-controls="${group.id}"], [aria-owns="${group.id}"]`) : null;
      const start = controller ?? items.find((el) => el.getAttribute("tabindex") === "0" || el.getAttribute("aria-checked") === "true" || el.getAttribute("aria-selected") === "true") ?? items[0]!;
      const markup = group.innerHTML;
      const active = () => [document.activeElement, group.getAttribute("aria-activedescendant") ?? document.activeElement?.getAttribute("aria-activedescendant") ?? ""];
      await act(async () => start.focus());
      const [before, beforeDesc] = active();
      await act(async () => {
        (document.activeElement ?? start).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
      });
      const [after, afterDesc] = active();
      const moved = (after !== before && items.some((el) => el === after || el.contains(after as Node))) || beforeDesc !== afterDesc || (!!controller && group.innerHTML !== markup);
      if (!moved) stuck.push(`${c.role}${group.getAttribute("aria-label") ? ` "${group.getAttribute("aria-label")}"` : ""}: ${key} does not move`);
      await act(async () => (document.activeElement as HTMLElement | null)?.blur?.());
    }
  }
  return stuck;
}

// `antfabric` first (the keys parity holds), then `neutral` (what the kits draw with no theme): a recipe override or a token that only one
// of them has can warn on update, and a chart's mounted markup is per theme.
for (const theme of [antfabric, themes.neutral]) {
const suffix = theme === antfabric ? "" : `#${theme.name}`;
const named = theme === antfabric ? "" : ` (${theme.name})`;
for (const doc of components) {
  if (only.length && !only.includes(doc.id)) continue;
  for (const platform of PLATFORMS) {
    if (doc.platforms[platform].status === "not-applicable" || !kitComponent(doc.id, platform)) continue;
    const defaults = defaultsFor(usedIds(doc), platform);
    const cases = casesFor(doc, platform);
    for (const os of OSES[platform]) {
      const host = document.createElement("div");
      document.body.appendChild(host);
      const root = createRoot(host);
      const seen = new Set<string>();
      const step = async (at: string, body: ReturnType<typeof createElement>, state?: import("@antfabric/ui-core").InteractionState) => {
        logged.length = 0;
        steps++;
        try {
          await act(async () => root.render(createElement(DefaultsProvider, { value: defaults }, createElement(Stage, { platform, ...os, scheme: "light", theme, state, children: body }))));
        } catch (e) {
          logged.push((e as Error).message);
        }
        for (const l of logged) {
          const line = l.split("\n")[0]!.slice(0, 220);
          if (seen.has(line)) continue;
          seen.add(line);
          errors++;
          keep.error(`  ✗ ${doc.id} ${platform}/${os.os}${named} → ${at}: ${line}`);
        }
        if (doc.category === "data") mount(platform, host.innerHTML);
      };
      const mount = (p: import("@antfabric/ui-core").Platform, html: string) => {
        const key = `${doc.id}/${p}@mounted${suffix}`;
        const entry = mountedHashes.get(key) ?? { hash: createHash("sha256"), renders: 0 };
        mountedHashes.set(key, entry);
        entry.hash.update(`${normalise(roundCoords(foldUseIds(html)), p, "light", { os: os.os, theme })}\n\u0000\n`);
        entry.renders++;
      };
      const thing = (props?: Record<string, unknown>) => createElement(Thing, { id: doc.id, platform, props });
      await step("rest", thing());
      // A chart library draws only once mounted (its first server render is the empty frame), so this is where its ids are seen: the same
      // chart mounted a second time in this run, after the first, must fold to the same markup (`foldIds`: the counters are not in the hash).
      if (doc.category === "data") {
        const first = foldIds(host.innerHTML);
        const again = document.createElement("div");
        document.body.appendChild(again);
        const second = createRoot(again);
        await act(async () => second.render(createElement(DefaultsProvider, { value: defaults }, createElement(Stage, { platform, ...os, scheme: "light", theme, children: thing() }))));
        charts++;
        if (foldIds(again.innerHTML) !== first) {
          errors++;
          keep.error(`  ✗ ${doc.id} ${platform}/${os.os}${named} → mounted twice: the second mount's markup differs from the first's after folding generated ids`);
        }
        await act(async () => second.unmount());
        again.remove();
      }
      // Keyboard and focus, on the web and the desktop: arrows in the composite groups, a modal's focus, and a ring on every control.
      // In a root of their own, so the keys pressed (a tab chosen, a radio checked) do not carry into the steps and hashes below.
      if (platform !== "mobile") {
        drawn.add(doc.id);
        const where = `${doc.id}/${platform}`;
        const probeHost = document.createElement("div");
        document.body.appendChild(probeHost);
        const probe = createRoot(probeHost);
        const draw = (state?: import("@antfabric/ui-core").InteractionState, autoFocus?: boolean) => createElement(DefaultsProvider, { value: defaults }, createElement(Stage, { platform, ...os, scheme: "light", theme, state, autoFocus, children: thing() }));
        const quiet = logged.length;
        try {
          // Opened from the keyboard: a menu or a dialog that moves focus only for a keyboard user (or after any input) sees a key first.
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
          await act(async () => probe.render(draw()));
          for (const what of await arrowsIn(probeHost)) found.keys.add(`${where}: ${what}`);
          await act(async () => probe.unmount());
          // Each control focused for real (happy-dom matches `:focus-visible` after `focus()`, as a browser does after Tab): its ring host must change.
          // Drawn with `autoFocus={false}`: an overlay that took focus on mount would be read focused at rest (happy-dom does not hand React the
          // blur), and whether focus is drawn is this check's question, not where it starts (the modal check above holds that).
          const fresh = createRoot(probeHost);
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
          await act(async () => fresh.render(draw(undefined, false)));
          for (const [k, el] of controlsOf(probeHost)) {
            if (!el.isConnected) continue;
            // A control that took focus when it mounted (a menu's first row) is read at rest first.
            if (document.activeElement === el || el.contains(document.activeElement)) await act(async () => (document.activeElement as HTMLElement).blur());
            const before = ringHost(el).outerHTML;
            await act(async () => el.focus());
            // An element focus() cannot reach (a readout given a menu role with no tabIndex) is not a control the keyboard reaches.
            if (document.activeElement !== el) continue;
            const after = el.isConnected ? ringHost(el).outerHTML : "";
            await act(async () => el.blur());
            if (before === after) found.focus.add(`${where}: ${nameOf(k)} draws nothing when focused`);
          }
          await act(async () => fresh.unmount());
        } catch (e) {
          logged.push(`focus probe: ${(e as Error).message}`);
        }
        probeHost.remove();
        // What the probe's own renders warned is the update pass's business below, not this check's.
        logged.length = quiet;
      }
      // Every control, hovered, pressed, released, left and focused for real, as a pointer and a keyboard would.
      const controls = Array.from(host.querySelectorAll<HTMLElement>("button, [role='button'], [data-af-press], input, textarea"));
      for (const el of controls) {
        logged.length = 0;
        steps++;
        const fire = (type: string) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0, pointerId: 1, pointerType: "mouse" }));
        await act(async () => {
          fire("pointerover");
          fire("pointerenter");
        });
        await act(async () => fire("pointerdown"));
        await act(async () => fire("pointerup"));
        await act(async () => {
          fire("pointerout");
          fire("pointerleave");
        });
        await act(async () => el.focus());
        await act(async () => el.blur());
        for (const l of logged) {
          const line = l.split("\n")[0]!.slice(0, 220);
          if (seen.has(line)) continue;
          seen.add(line);
          errors++;
          keep.error(`  ✗ ${doc.id} ${platform}/${os.os}${named} → pointer on <${el.tagName.toLowerCase()} ${el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 30) ?? ""}>: ${line}`);
        }
      }
      for (const s of cases.states) await step(`state ${s}`, thing(), s);
      await step("rest again", thing());
      for (const m of cases.matrix) for (const c of m.cases) await step(`${m.prop}=${c.name}`, thing(c.props));
      for (const e of cases.examples) await step(`example "${e.name}"`, thing(e.props), e.state);
      // A chart's empty and one-point cases are where a mounted chart goes wrong; the server render of a chart is only its frame.
      if (doc.category === "data") for (const e of cases.edge) if (e.example && (!e.example.platforms || e.example.platforms.includes(platform))) await step(`edge "${e.title}"`, thing(e.example.props), e.example.state);
      for (const flow of doc.flows ?? []) {
        if (!flow.platforms.includes(platform)) continue;
        for (const [n, fr] of (flow.replay ?? []).entries()) {
          if (fr.platforms && !fr.platforms.includes(platform)) continue;
          await step(`flow "${flow.id}" frame ${n}`, fr.scene ? createElement(SceneNode, { scene: fr.scene, platform }) : thing(fr.props));
        }
      }
      await act(async () => root.unmount());
      host.remove();
    }
  }
}
}

/*
 * Handler only keeps its own state (reports/api/conventions.md, rule 1): for each prop the docs declare `changes: "<p>"`, the component is
 * mounted with `<p>` left out and only `on<P>Change`, and its controls are pressed one at a time (a text field typed into, a select changed),
 * each sequence from a fresh mount and breadth first (every control at rest, then every control after a press that drew something new, as a
 * trigger that opens a list), until a press fires the event. The same presses are then replayed on a mount with neither (which keeps its own
 * state: the reference), and the two must draw the same state: roles, names, aria-checked/selected/pressed/expanded/current, field values
 * and the markup. Why not compare with a mount given `<p>: next`: the presses before the one that fired (opening the list) would be missing
 * from it. A press that fires the event without moving the reference (choosing what is already chosen) does not count, and the search goes
 * on; a prop no press changes (an overlay the app opens, a stage the app sets) is skipped. One OS per platform, the desktop only for what the
 * web does not draw (one kit file), `antfabric` only. Failures are `controlTodo` in reports/generic.json, held as focusTodo is.
 */
const PRESSABLE = 'button:not(:disabled), [role="button"], [role="tab"], [role="option"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="switch"], [role="checkbox"], [role="radio"], [role="link"], a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [data-af-press], [tabindex="0"]';
const SIGNED = 'button, a, input, textarea, select, [role], [aria-checked], [aria-selected], [aria-pressed], [aria-expanded], [aria-current]';
const STATE_ATTRS = ["role", "aria-label", "aria-checked", "aria-selected", "aria-pressed", "aria-expanded", "aria-current"];
const pressablesOf = (host: HTMLElement) => Array.from(host.querySelectorAll<HTMLElement>(PRESSABLE)).filter((el) => el.getAttribute("aria-disabled") !== "true");
/**
 * What the person can see and a screen reader can read: each control's role, name, aria-checked/selected/pressed/expanded/current and field
 * value, then the whole markup with generated ids folded (the phone's kit says a switch is on by its look, which only the markup carries).
 */
function stateOf(host: HTMLElement): string {
  const rows = Array.from(host.querySelectorAll<HTMLElement>(SIGNED)).map((el) => {
    const field = el as HTMLInputElement;
    const value = /^(?:INPUT|TEXTAREA|SELECT)$/.test(el.tagName) ? `=${field.value}${field.type === "checkbox" || field.type === "radio" ? (field.checked ? "+" : "-") : ""}` : "";
    return `${el.tagName}${STATE_ATTRS.map((a) => `|${el.getAttribute(a) ?? ""}`).join("")}${value}|${(el.textContent ?? "").trim().slice(0, 60)}`;
  });
  return `${rows.join("\n")}\n${foldIds(foldUseIds(host.innerHTML))}`;
}
/** A value a field does not hold yet, of a kind its type accepts. */
const typedFor = (el: HTMLInputElement | HTMLTextAreaElement) => {
  const kind = el instanceof HTMLInputElement ? el.type : "text";
  const pick = kind === "date" ? "2026-12-01" : kind === "time" ? "09:30" : kind === "number" || kind === "range" ? "3" : "Fabric";
  return el.value === pick ? `${pick}2` : pick;
};
/** Press, type into or change one control, as a person would (React's `onChange` reads the value through the native setter and `input`). */
async function activate(el: HTMLElement) {
  await act(async () => {
    if (el instanceof HTMLSelectElement) {
      const other = Array.from(el.options).find((o) => o.value !== el.value);
      if (!other) return;
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")!.set!.call(el, other.value);
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else if ((el instanceof HTMLInputElement && !/^(?:checkbox|radio|button|submit|reset|file)$/.test(el.type)) || el instanceof HTMLTextAreaElement) {
      const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, typedFor(el));
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else el.click();
  });
}
// A link pressed in the probe must not navigate the document away.
document.addEventListener("click", (e) => {
  if ((e.target as Element | null)?.closest?.("a[href]")) e.preventDefault();
}, true);

let controlProbed = 0;
let controlMoved = 0;
let controlMounts = 0;
const PROBE_OS: Record<import("@antfabric/ui-core").Platform, OSPick> = { web: { os: "browser" }, desktop: { os: "mac", osVersion: 26 }, mobile: { os: "ios", osVersion: 26 } };
/** Presses before the one that is tried (a trigger that opens a list, then a row of it), and mounts per prop. */
const MAX_PREFIX = 2;
const MAX_MOUNTS = 60;
for (const doc of components) {
  if (only.length && !only.includes(doc.id)) continue;
  for (const platform of PLATFORMS) {
    if (doc.platforms[platform].status === "not-applicable" || !kitComponent(doc.id, platform)) continue;
    const applies = (d?: { platforms?: import("@antfabric/ui-core").Platform[] }) => !d?.platforms || d.platforms.includes(platform);
    const defaults = defaultsFor(usedIds(doc), platform);
    /**
     * Mounts the component on its own and presses `presses` in turn (each an index into its pressable controls, read again after every press).
     * Returns the state at rest and after each press, how many controls the last state has, and whether the last press called `calls`' spy.
     */
    const run = async (props: Record<string, unknown>, presses: number[], calls?: unknown[]) => {
      controlMounts++;
      const host = document.createElement("div");
      document.body.appendChild(host);
      const root = createRoot(host);
      const states: string[] = [];
      let lastFired = false;
      let count = 0;
      try {
        await act(async () => root.render(createElement(DefaultsProvider, { value: defaults }, createElement(Stage, { platform, ...PROBE_OS[platform], scheme: "light", theme: antfabric, children: createElement(Thing, { id: doc.id, platform, props }) }))));
        states.push(stateOf(host));
        for (const i of presses) {
          const el = pressablesOf(host)[i];
          if (!el) break;
          const before = calls?.length ?? 0;
          await activate(el);
          lastFired = (calls?.length ?? 0) > before;
          states.push(stateOf(host));
        }
        count = pressablesOf(host).length;
      } finally {
        await act(async () => root.unmount());
        host.remove();
      }
      return { states, count, lastFired, complete: states.length === presses.length + 1 };
    };
    for (const [event, d] of Object.entries(doc.props)) {
      const prop = d.changes;
      if (!prop || !applies(d) || !applies(doc.props[prop])) continue;
      // The desktop draws the web's kit file: probed there only for what the web does not draw.
      const onWeb = (x?: { platforms?: import("@antfabric/ui-core").Platform[] }) => !x?.platforms || x.platforms.includes("web");
      if (platform === "desktop" && doc.platforms.web.status !== "not-applicable" && kitComponent(doc.id, "web") && onWeb(d) && onWeb(doc.props[prop])) continue;
      drawn.add(doc.id);
      controlProbed++;
      const quiet = logged.length;
      const calls: unknown[] = [];
      const handled = { [prop]: undefined, [event]: (next: unknown) => void calls.push(next) };
      const reference = { [prop]: undefined };
      try {
        // Breadth first over press sequences, each from a fresh mount: every control at rest, then every control after each press that drew
        // something new (a trigger that opened a list), and so on. The first press that fires the event and moves the reference decides.
        const frontier: number[][] = [[]];
        const seen = new Set<string>();
        let mounts = 0;
        let done = false;
        for (let f = 0; f < frontier.length && !done && mounts < MAX_MOUNTS; f++) {
          const prefix = frontier[f]!;
          const base = await run(handled, prefix, calls);
          mounts++;
          if (!base.complete) continue;
          seen.add(base.states.at(-1)!);
          for (let i = 0; i < base.count && !done && mounts < MAX_MOUNTS; i++) {
            const presses = [...prefix, i];
            const n = presses.length;
            const h = await run(handled, presses, calls);
            mounts++;
            if (!h.complete) continue;
            if (h.lastFired) {
              const r = await run(reference, presses);
              mounts++;
              // Fired without moving the reference (it chose what was already chosen): keep looking.
              if (r.complete && r.states[n] !== r.states[n - 1]) {
                done = true;
                controlMoved++;
                if (h.states[n] !== r.states[n]) found.control.add(`${doc.id}/${platform}: ${prop} does not move with only ${event}`);
                continue;
              }
            }
            if (prefix.length < MAX_PREFIX && !seen.has(h.states[n]!)) {
              seen.add(h.states[n]!);
              frontier.push(presses);
            }
          }
        }
      } catch (e) {
        logged.push(`control probe: ${(e as Error).message}`);
      }
      logged.length = quiet;
    }
  }
}

// `styles` on the web: a longhand the recipe also writes as a shorthand (`styles.root.backgroundColor` beside the recipe's `background`) must stay
// through every state, and updating the recipe's value must not warn of the two fighting. Button is mounted with it and driven like a pointer would.
{
  const ReactKit = await import("@antfabric/ui-react");
  const cases: [string, Record<string, unknown>, (el: HTMLElement) => string | undefined][] = [
    ["backgroundColor", { root: { backgroundColor: "red" } }, (el) => (el.style.backgroundColor === "red" ? undefined : `background-color is "${el.style.backgroundColor}", not red`)],
    ["paddingLeft", { root: { paddingLeft: 3 } }, (el) => (el.style.paddingLeft === "3px" ? undefined : `padding-left is "${el.style.paddingLeft}", not 3px`)],
    ["borderTopLeftRadius", { root: { borderTopLeftRadius: 2 } }, (el) => (el.style.borderTopLeftRadius === "2px" ? undefined : `border-top-left-radius is "${el.style.borderTopLeftRadius}", not 2px`)],
  ];
  for (const theme of [antfabric, themes.neutral]) {
    for (const [name, styles, wrong] of cases) {
      const host = document.createElement("div");
      document.body.appendChild(host);
      const root = createRoot(host);
      logged.length = 0;
      steps++;
      const at = `styles.root.${name} on Button (web${theme === antfabric ? "" : `, ${theme.name}`})`;
      await act(async () => root.render(createElement(Stage, { platform: "web", os: "browser", scheme: "light", theme, children: createElement(ReactKit.Button, { label: "Save", styles }) })));
      const el = host.querySelector("button")!;
      const fire = (type: string) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0, pointerId: 1, pointerType: "mouse" }));
      const problems: string[] = [];
      const look = (when: string) => {
        const w = wrong(el);
        if (w) problems.push(`${when}: ${w}`);
      };
      look("at rest");
      await act(async () => {
        fire("pointerover");
        fire("pointerenter");
      });
      look("hovered");
      await act(async () => fire("pointerdown"));
      look("pressed");
      await act(async () => fire("pointerup"));
      await act(async () => {
        fire("pointerout");
        fire("pointerleave");
      });
      look("left");
      for (const l of logged) problems.push(`warned: ${l.split("\n")[0]!.slice(0, 200)}`);
      for (const p of new Set(problems)) {
        errors++;
        keep.error(`  ✗ ${at} → ${p}`);
      }
      await act(async () => root.unmount());
      host.remove();
    }
  }
}

// A theme built inline on every render has the same id each time: the provider keys its context by the id, so what is inside does not re-render.
{
  const ReactKit = await import("@antfabric/ui-react");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  let drawnTimes = 0;
  const Probe = () => (drawnTimes++, null);
  const child = createElement(Probe); // one element: only a changed context re-renders it
  const inline = () => defineTheme({ name: "Inline", brand: { primary: "#4f46e5" } });
  for (let i = 0; i < 3; i++) await act(async () => root.render(createElement(ReactKit.AntFabricProvider, { theme: inline(), children: child })));
  if (drawnTimes !== 1) {
    errors++;
    keep.error(`  ✗ AntFabricProvider with an inline defineTheme(...) re-rendered its tree ${drawnTimes - 1} time(s) over three renders: its context is not keyed by the theme's id`);
  }
  await act(async () => root.unmount());
  host.remove();
}

/*
 * Keys across layers, on the web (the desktop draws the same kit file), in the setups a single component never shows: an Escape meant for a
 * Select inside a modal Dialog closes the Select and leaves the Dialog; Tab and Shift+Tab stay inside a modal whose controls are a roving
 * group (a Sheet holding only a RadioGroup, the CommandPalette from its field); an Enter that commits an IME composition submits nothing.
 * Tab is pressed as a browser presses it: the keydown first, and when nothing prevented it, focus moves to the next element in the
 * browser's own order (`tabOrder`, kept apart from the kit's `focusables` so a wrong rule there shows). Failures are `keysTodo` lines.
 */
{
  const Kit = await import("@antfabric/ui-react");
  const want = (id: string) => !only.length || only.includes(id);
  /** What a browser's Tab reaches: an enabled control or `tabindex`, at 0 or more, not hidden, not inert. */
  const tabOrder = () =>
    Array.from(document.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]")).filter(
      (el) => el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled && !(el instanceof HTMLInputElement && el.type === "hidden") && !el.closest("[hidden], [inert]"),
    );
  const press = async (key: string, init: KeyboardEventInit = {}) => {
    const ev = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
    await act(async () => void (document.activeElement ?? document.body).dispatchEvent(ev));
    return ev;
  };
  const pressTab = async (shift: boolean) => {
    const at = document.activeElement as HTMLElement | null;
    if ((await press("Tab", { shiftKey: shift })).defaultPrevented) return;
    const order = tabOrder();
    const from = at && at !== document.body ? at : null;
    const next = shift
      ? [...order].reverse().find((el) => !from || el !== from && from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)
      : order.find((el) => !from || from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    await act(async () => (next ? next.focus() : from?.blur()));
  };
  /** Tab, then Shift+Tab, from `start` round the modal and past: focus never leaves it. */
  const trapLeaks = async (modal: HTMLElement, start: HTMLElement) => {
    const out: string[] = [];
    for (const shift of [false, true]) {
      await act(async () => start.focus());
      const turns = tabOrder().filter((el) => modal.contains(el)).length + 2;
      for (let i = 0; i < turns; i++) {
        await pressTab(shift);
        if (!modal.contains(document.activeElement)) {
          out.push(`${shift ? "Shift+Tab" : "Tab"} from ${start.getAttribute("role") ?? start.tagName.toLowerCase()} leaves the modal`);
          break;
        }
      }
    }
    return out;
  };
  const mountWeb = async (children: ReturnType<typeof createElement>, id?: string) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const doc = id ? components.find((d) => d.id === id) : undefined;
    const stage = createElement(Stage, { platform: "web", os: "browser", scheme: "light", theme: antfabric, children });
    await act(async () => root.render(doc ? createElement(DefaultsProvider, { value: defaultsFor(usedIds(doc), "web") }, stage) : stage));
    return {
      host,
      done: async () => {
        await act(async () => root.unmount());
        host.remove();
      },
    };
  };
  const quiet = logged.length;
  try {
    if (want("select")) {
      drawn.add("select");
      const cancels: unknown[] = [];
      const items = [
        { key: "platform", label: "Platform" },
        { key: "mobile", label: "Mobile" },
      ];
      const m = await mountWeb(createElement(Kit.Dialog, { modal: true, kind: "form", title: "Move AF-1182", onCancel: () => cancels.push(1), children: createElement(Kit.Select, { label: "Project", items, value: "platform" }) }));
      const trigger = m.host.querySelector<HTMLElement>('[role="combobox"]');
      if (!trigger) found.keys.add("select/web: no Select drawn in the modal Dialog probe");
      else {
        await act(async () => trigger.click());
        await act(async () => trigger.focus());
        await press("Escape");
        if (trigger.getAttribute("aria-expanded") !== "false") found.keys.add("select/web: Escape on an open Select in a modal Dialog does not close the Select");
        if (cancels.length) found.keys.add("select/web: Escape on an open Select in a modal Dialog cancels the Dialog");
        // The same key again, the Select closed: now the Dialog's.
        else if ((await press("Escape"), cancels.length !== 1)) found.keys.add("select/web: Escape on a closed Select in a modal Dialog does not cancel the Dialog");
      }
      await m.done();
    }
    if (want("sheet")) {
      drawn.add("sheet");
      const options = [
        { key: "all", label: "All new messages" },
        { key: "mentions", label: "Mentions and replies" },
        { key: "none", label: "Nothing" },
      ];
      const m = await mountWeb(createElement(Kit.Sheet, { open: true, showClose: false, title: "Notify me about", children: createElement(Kit.RadioGroup, { label: "Notify me about", hideLabel: true, options, value: "mentions" }) }));
      const modal = m.host.querySelector<HTMLElement>('[aria-modal="true"]');
      const radio = m.host.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
      if (!modal || !radio) found.keys.add("sheet/web: no modal RadioGroup drawn in the trap probe");
      else for (const leak of await trapLeaks(modal, radio)) found.keys.add(`sheet/web: holding only a RadioGroup, ${leak}`);
      await m.done();
    }
    if (want("command-palette")) {
      drawn.add("command-palette");
      const m = await mountWeb(createElement(Thing, { id: "command-palette", platform: "web" }), "command-palette");
      const modal = m.host.querySelector<HTMLElement>('[aria-modal="true"]');
      const field = modal?.querySelector<HTMLElement>("input");
      if (!modal || !field) found.keys.add("command-palette/web: no field drawn in the trap probe");
      else for (const leak of await trapLeaks(modal, field)) found.keys.add(`command-palette/web: ${leak}`);
      await m.done();
    }
    // Enter while an IME composes commits the candidate; plain Enter after it submits (the probe's control).
    const composing: [string, (spy: unknown[]) => ReturnType<typeof createElement>][] = [
      ["search-field", (spy) => createElement(Kit.SearchField, { placeholder: "Search messages", value: "デプロイ", onSubmit: () => spy.push(1) })],
      ["question-panel", (spy) => createElement(Kit.QuestionPanel, { title: "What should the release be called?", field: true, typed: "春のリリース", onSubmit: (a: string) => void spy.push(a) })],
    ];
    for (const [id, draw] of composing) {
      if (!want(id)) continue;
      drawn.add(id);
      const spy: unknown[] = [];
      const m = await mountWeb(draw(spy));
      const field = m.host.querySelector<HTMLElement>("input, textarea");
      if (!field) found.keys.add(`${id}/web: no field drawn in the IME probe`);
      else {
        await act(async () => field.focus());
        await press("Enter", { isComposing: true });
        if (spy.length) found.keys.add(`${id}/web: Enter during IME composition submits`);
        else if ((await press("Enter"), !spy.length)) found.keys.add(`${id}/web: Enter does not submit (the IME probe proves nothing)`);
      }
      await m.done();
    }
  } catch (e) {
    errors++;
    keep.error(`  ✗ layered keys probe: ${(e as Error).message}`);
  }
  logged.length = quiet;
}

console.error = keep.error;
console.warn = keep.warn;

// The focus and keyboard lists: a failure not listed is new; a listed one that passes (for a component this run drew) must come off.
if (process.env.AF_TODO_WRITE) {
  writeFileSync(genericFile, JSON.stringify({ ...generic, focusTodo: [...found.focus].sort(), keysTodo: [...found.keys].sort(), controlTodo: [...found.control].sort() }, null, 2) + "\n");
  console.log(`wrote focusTodo (${found.focus.size}), keysTodo (${found.keys.size}) and controlTodo (${found.control.size}) to reports/generic.json`);
} else {
  for (const [list, what] of [["focus", "focusTodo"], ["keys", "keysTodo"], ["control", "controlTodo"]] as const) {
    for (const f of found[list]) if (!todo[list].has(f)) {
      errors++;
      keep.error(`  ✗ ${f} (not in ${what} in reports/generic.json)`);
    }
    for (const t of todo[list]) if (drawn.has(t.split("/")[0]!) && !found[list].has(t)) {
      errors++;
      keep.error(`  ✗ ${t}: passes now; take it off ${what} in reports/generic.json`);
    }
  }
}
if (process.env.AF_MOUNTED_OUT) {
  const out: Record<string, { hash: string; renders: number }> = {};
  for (const [key, e] of mountedHashes) out[key] = { hash: e.hash.digest("hex").slice(0, 16), renders: e.renders };
  writeFileSync(process.env.AF_MOUNTED_OUT, JSON.stringify(out));
}
console.log(`re-rendered through ${steps} updates${charts ? `; ${charts} charts mounted twice, one markup each` : ""}`);
if (controlProbed) console.log(`handler only: ${controlProbed} changeable props probed (${controlMounts} mounts), ${controlMoved} moved by a press, ${found.control.size} held at their default`);
console.log(errors ? `✗ ${errors} warning(s) on update` : "✓ no warnings on update");
await GlobalRegistrator.unregister();
process.exit(errors ? 1 : 0);
