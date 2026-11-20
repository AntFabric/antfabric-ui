/**
 * The "On this page" rail and the phone's navigation drawer.
 *
 * The rail lists the page's visible h2s and h3s (a component page hides the other platforms'
 * sections, and its islands draw headings after load), so it is rebuilt when the platform changes
 * and when the content does. The heading in view is marked as it scrolls. An h3 with
 * `data-toc="off"` stays out of it.
 */

import { subscribe } from "./prefs";
import { slug } from "./search";

const doc = document.querySelector<HTMLElement>(".doc");
const rail = document.querySelector<HTMLElement>("[data-toc-rail]");
const list = rail?.querySelector("ol");

const visible = (el: HTMLElement) => el.getClientRects().length > 0;

/** A heading's words without the count beside it ("Atoms", not "Atoms 20"). */
const label = (h: HTMLElement) =>
  [...h.childNodes]
    .filter((n) => !(n instanceof HTMLElement && n.classList.contains("count")))
    .map((n) => n.textContent)
    .join("")
    .trim();

/** Every heading gets an id; one inside a platform's panel is prefixed with it, since each panel repeats the same headings. */
function ensureId(h: HTMLElement) {
  if (h.id) return h.id;
  const base = slug(label(h)) || "section";
  const platform = h.closest<HTMLElement>("[data-for-platform]")?.dataset.forPlatform;
  let id = platform ? `${platform}-${base}` : base;
  for (let n = 2; document.getElementById(id); n++) id = `${platform ? `${platform}-` : ""}${base}-${n}`;
  h.id = id;
  return id;
}

let headings: HTMLElement[] = [];
let links: HTMLAnchorElement[] = [];

function build() {
  if (!doc || !rail || !list) return;
  const found = [...doc.querySelectorAll<HTMLElement>("h2, h3:not([data-toc='off'])")].filter((h) => visible(h) && !h.closest(".canvas, [data-toc-skip]"));
  if (found.length === headings.length && found.every((h, i) => h === headings[i])) return mark();
  headings = found;
  rail.hidden = headings.length < 2;
  list.replaceChildren(
    ...headings.map((h) => {
      const li = document.createElement("li");
      li.dataset.depth = h.tagName === "H3" ? "3" : "2";
      const a = document.createElement("a");
      a.href = `#${ensureId(h)}`;
      a.textContent = label(h);
      li.append(a);
      return li;
    }),
  );
  links = [...list.querySelectorAll("a")];
  mark();
}

function mark() {
  const top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 80;
  let at = 0;
  headings.forEach((h, i) => {
    if (h.getBoundingClientRect().top <= top + 48) at = i;
  });
  // At the very bottom, the last heading may never reach the top; mark it anyway.
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) at = headings.length - 1;
  links.forEach((a, i) => (i === at ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
}

// A timer, not a frame: a page opened in a background tab gets no frames until it is shown.
let queued: ReturnType<typeof setTimeout> | undefined;
const rebuild = () => {
  clearTimeout(queued);
  queued = setTimeout(build, 80);
};

if (doc) {
  build();
  subscribe(rebuild);
  new MutationObserver((records) => {
    // Only structural changes in the page's own flow; a preview redrawing inside its canvas is not one.
    if (records.some((r) => !(r.target as HTMLElement).closest?.(".canvas"))) rebuild();
  }).observe(doc, { childList: true, subtree: true });
  addEventListener("load", rebuild);
  let ticking = false;
  addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        mark();
      });
    },
    { passive: true },
  );
}

/* ---------- the phone's navigation drawer ---------- */

const toggle = document.querySelector<HTMLElement>("button[data-nav-toggle]");
const setOpen = (open: boolean) => {
  document.documentElement.toggleAttribute("data-nav-open", open);
  toggle?.setAttribute("aria-expanded", String(open));
};
document.querySelectorAll<HTMLElement>("[data-nav-toggle]").forEach((el) =>
  el.addEventListener("click", () => setOpen(!document.documentElement.hasAttribute("data-nav-open"))),
);
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.documentElement.hasAttribute("data-nav-open")) setOpen(false);
});
