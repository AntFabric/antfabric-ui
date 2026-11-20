/**
 * The catalogue's page script. The previews are React islands that draw the kits themselves; this
 * runs the page around them:
 *
 *   - platform / OS / version / scheme (light or dark) / theme switches, written to the shared prefs the islands read
 *   - tabs, copy buttons and folded code
 *   - fitting wide previews and screens to their place
 */

import type { OS, Platform, Scheme } from "@antfabric/ui-core";
import { getPrefs, setPrefs, subscribe } from "./prefs";

const OS_NAME: Record<OS, string> = { mac: "macOS", windows: "Windows", linux: "Linux", ios: "iOS", android: "Android", browser: "Browser" };

function apply() {
  const prefs = getPrefs();
  const html = document.documentElement;
  html.dataset.platform = prefs.platform;
  html.dataset.scheme = prefs.scheme;
  html.dataset.osDesktop = prefs.os.desktop;
  html.dataset.osMobile = prefs.os.mobile;
  html.dataset.verIos = String(prefs.version.ios);
  html.dataset.verMac = String(prefs.version.mac);
  // Canvases drawn by Astro (the screens' frames) follow the scheme here; the islands' canvases follow it themselves.
  document.querySelectorAll<HTMLElement>("[data-af-theme]").forEach((el) => {
    if (!el.hasAttribute("data-theme-pinned") && !el.closest("astro-island")) el.dataset.afTheme = prefs.scheme;
  });
  document.querySelectorAll<HTMLElement>("[data-set-platform]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setPlatform === prefs.platform)));
  document.querySelectorAll<HTMLElement>("[data-set-os]").forEach((b) => {
    const [p, os] = (b.dataset.setOs || "").split(":");
    b.setAttribute("aria-pressed", String(prefs.os[p as "desktop" | "mobile"] === os));
  });
  document.querySelectorAll<HTMLElement>("[data-set-scheme]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setScheme === prefs.scheme)));
  document.querySelectorAll<HTMLElement>("[data-set-version]").forEach((b) => {
    const [os, v] = (b.dataset.setVersion || "").split(":");
    b.setAttribute("aria-pressed", String(prefs.version[os as "ios" | "mac"] === Number(v)));
  });
  document.querySelectorAll<HTMLElement>("[data-os-label]").forEach((el) => {
    el.textContent = OS_NAME[prefs.os[el.dataset.osLabel as "desktop" | "mobile"]];
  });
  requestAnimationFrame(fitAll);
}

document.addEventListener("click", (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>("[data-set-platform],[data-set-os],[data-set-version],[data-set-theme],[data-set-scheme],[data-copy],[data-tab],[data-expand]");
  if (!t) return;
  const prefs = getPrefs();
  if (t.dataset.setPlatform) {
    const platform = t.dataset.setPlatform as Platform;
    if (platform !== prefs.platform) keepPlace(platform, () => setPrefs({ ...prefs, platform }));
  }
  else if (t.dataset.setOs) {
    const [p, os] = t.dataset.setOs.split(":") as ["desktop" | "mobile", OS];
    setPrefs({ ...prefs, os: { ...prefs.os, [p]: os } });
  } else if (t.dataset.setVersion) {
    const [os, v] = t.dataset.setVersion.split(":") as ["ios" | "mac", string];
    setPrefs({ ...prefs, version: { ...prefs.version, [os]: Number(v) } });
  } else if (t.dataset.setScheme) {
    setPrefs({ ...prefs, scheme: t.dataset.setScheme === "toggle" ? (prefs.scheme === "dark" ? "light" : "dark") : (t.dataset.setScheme as Scheme) });
  } else if (t.dataset.copy !== undefined) {
    const src = t.closest("[data-code]")?.querySelector("code")?.textContent ?? "";
    navigator.clipboard?.writeText(src).then(
      () => {
        t.dataset.copied = "true";
        setTimeout(() => delete t.dataset.copied, 1400);
      },
      () => {},
    );
  } else if (t.dataset.expand !== undefined) {
    const block = t.closest<HTMLElement>("[data-code]");
    if (!block) return;
    const open = block.dataset.collapsed === "true";
    block.dataset.collapsed = String(!open);
    t.textContent = open ? "Collapse" : "Expand";
    if (!open) block.scrollIntoView({ block: "nearest" });
  } else if (t.dataset.tab) {
    const group = t.closest<HTMLElement>("[data-tabs]");
    if (!group) return;
    group.querySelectorAll<HTMLElement>("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b === t)));
    group.querySelectorAll<HTMLElement>("[data-tab-panel]").forEach((p) => (p.hidden = p.dataset.tabPanel !== t.dataset.tab));
  }
});

/* ---------- switching platform without losing your place ---------- */

const shown = (el: Element) => el.getClientRects().length > 0;

/**
 * Switching platform swaps every platform panel at once, and the panels differ in height, so the
 * page would jump under the reader. Instead, the heading at the top of the view stays where it is:
 * the same heading in the new platform's panel (by its text), or, for a shared one, itself. A
 * heading the new platform does not have lands the reader at the top of that platform's panel.
 */
function keepPlace(next: Platform, change: () => void) {
  const line = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 48;
  const heads = [...document.querySelectorAll<HTMLElement>(".doc h2, .doc h3")].filter(shown);
  const anchor = heads.filter((h) => h.getBoundingClientRect().top <= line).pop();
  if (!anchor) return change();
  const before = anchor.getBoundingClientRect().top;
  const panel = anchor.closest<HTMLElement>("[data-for-platform]");
  // "On mobile" is "On web" in the web panel.
  const text = anchor.textContent?.trim().replace(/^On (web|desktop|mobile)$/, `On ${next}`);
  change();
  let target: HTMLElement | undefined = anchor;
  if (panel) {
    target = [...document.querySelectorAll<HTMLElement>(`.doc [data-for-platform="${next}"] ${anchor.tagName}`)].find((h) => h.textContent?.trim() === text && shown(h));
    if (!target) {
      // Not on this platform: go to where the platform's own content starts.
      const first = document.querySelector<HTMLElement>(`.doc [data-for-platform="${next}"]`);
      if (first && shown(first)) scrollTo({ top: scrollY + first.getBoundingClientRect().top - line + 48, behavior: "instant" });
      return;
    }
  }
  scrollBy({ top: target.getBoundingClientRect().top - before, behavior: "instant" });
}

/* ---------- fitting ---------- */

const overflows = (el: HTMLElement) => el.scrollWidth > el.clientWidth + 1;

/** A gallery tile's preview scales down until it fits the tile. */
function fitTiles() {
  document.querySelectorAll<HTMLElement>(".tile .canvas").forEach((canvas) => {
    const root = canvas.querySelector<HTMLElement>("[data-preview-root]");
    if (!root || !canvas.getClientRects().length) return;
    root.style.zoom = "1";
    const pad = getComputedStyle(canvas);
    const inset = parseFloat(pad.paddingLeft) + parseFloat(pad.paddingRight);
    for (let i = 0; i < 6 && overflows(canvas); i++) {
      root.style.zoom = String(Math.max(0.3, (parseFloat(root.style.zoom) * (canvas.clientWidth - inset)) / (canvas.scrollWidth - inset)));
    }
  });
}

/** A screen's device scales down to fit its stage. */
function fitStages() {
  document.querySelectorAll<HTMLElement>(".screen-stage").forEach((stage) => {
    const device = stage.firstElementChild as HTMLElement | null;
    if (!device) return;
    device.style.zoom = "1";
    const pad = getComputedStyle(stage);
    const room = stage.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
    const need = device.getBoundingClientRect().width;
    device.style.zoom = need > room ? String(Math.max(0.15, room / need)) : "1";
  });
}

function fitAll() {
  fitTiles();
  fitStages();
}

addEventListener("resize", fitAll);
// Islands draw after this script runs; fit again once they have.
addEventListener("load", () => setTimeout(fitAll, 300));

subscribe(apply);
apply();
