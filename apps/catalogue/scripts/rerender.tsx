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
const generic = JSON.parse(readFileSync(genericFile, "utf8")) as Record<string, unknown> & { focusTodo?: string[]; keysTodo?: string[] };
const todo = { focus: new Set(generic.focusTodo ?? []), keys: new Set(generic.keysTodo ?? []) };
const found = { focus: new Set<string>(), keys: new Set<string>() };
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
    const all = Array.from(modal.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'));
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

console.error = keep.error;
console.warn = keep.warn;

// The focus and keyboard lists: a failure not listed is new; a listed one that passes (for a component this run drew) must come off.
if (process.env.AF_TODO_WRITE) {
  writeFileSync(genericFile, JSON.stringify({ ...generic, focusTodo: [...found.focus].sort(), keysTodo: [...found.keys].sort() }, null, 2) + "\n");
  console.log(`wrote focusTodo (${found.focus.size}) and keysTodo (${found.keys.size}) to reports/generic.json`);
} else {
  for (const [list, what] of [["focus", "focusTodo"], ["keys", "keysTodo"]] as const) {
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
console.log(errors ? `✗ ${errors} warning(s) on update` : "✓ no warnings on update");
await GlobalRegistrator.unregister();
process.exit(errors ? 1 : 0);
