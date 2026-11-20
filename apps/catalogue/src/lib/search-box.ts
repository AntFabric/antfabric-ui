/**
 * The search box in the top bar. ⌘K (Ctrl K) or / puts the cursor in it from anywhere on the page.
 * Its index (/search.json) is fetched the first time the box is used. Results are links, so ⌘-click
 * opens one in a new tab as any link would.
 *
 * It also gives each page's h2 an id from its text, which is how a section result
 * (`/foundations#colour`) lands on its heading.
 */

import { marks, rank, slug, type SearchHit, type SearchIndex, type SearchKind } from "./search";

const GROUPS: Record<SearchKind, { label: string; max: number }> = {
  component: { label: "Components", max: 8 },
  page: { label: "Pages", max: 6 },
  screen: { label: "Screens", max: 5 },
  token: { label: "Tokens", max: 6 },
};

const HINT = { prop: "Prop", flow: "Flow" } as const;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function highlight(text: string, query: string) {
  let out = "";
  let at = 0;
  for (const [start, end] of marks(text, query)) {
    out += esc(text.slice(at, start)) + `<mark>${esc(text.slice(start, end))}</mark>`;
    at = end;
  }
  return out + esc(text.slice(at));
}

const root = document.querySelector<HTMLElement>("[data-search]");
const input = root?.querySelector("input");
const pop = root?.querySelector<HTMLElement>(".search-pop");
const list = root?.querySelector<HTMLElement>(".search-list");
const empty = root?.querySelector<HTMLElement>(".search-empty");

if (root && input && pop && list && empty) {
  let index: Promise<SearchIndex> | null = null;
  const load = () =>
    (index ??= fetch("/search.json")
      .then((r) => r.json() as Promise<SearchIndex>)
      .catch((e: unknown) => {
        index = null;
        throw e;
      }));

  /** The results on show, in the order the arrow keys walk them. */
  let shown: SearchHit[] = [];
  let active = 0;
  let seq = 0;

  const open = () => {
    pop.hidden = false;
    input.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    pop.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  };

  function select(i: number, scroll = true) {
    active = i;
    list!.querySelectorAll<HTMLElement>("[role=option]").forEach((o) => o.setAttribute("aria-selected", String(Number(o.dataset.i) === i)));
    const el = document.getElementById(`search-opt-${i}`);
    if (!el) return;
    input!.setAttribute("aria-activedescendant", el.id);
    if (scroll) el.scrollIntoView({ block: "nearest" });
  }

  function render(index: SearchIndex, query: string) {
    // Groups keep the order of their best result, so "foundations" puts Pages first; Tokens come last.
    const found = new Map<SearchKind, SearchHit[]>();
    for (const hit of rank(index, query)) {
      const g = found.get(hit.entry.kind) ?? [];
      if (g.length < GROUPS[hit.entry.kind].max) g.push(hit);
      found.set(hit.entry.kind, g);
    }
    const groups = new Map([...found].sort(([a], [b]) => Number(a === "token") - Number(b === "token")));
    shown = [...groups.values()].flat();
    const platform = document.documentElement.dataset.platform ?? "web";
    let i = 0;
    list!.innerHTML = [...groups]
      .map(
        ([kind, hits]) =>
          `<div role="group" aria-labelledby="search-group-${kind}"><div class="search-group" id="search-group-${kind}" role="presentation">${GROUPS[kind].label}</div>${hits
            .map(({ entry: e, hint }) => {
              const matched = hint && (hint.field === "prop" ? `<code>${highlight(hint.text, query)}</code>` : highlight(hint.text, query));
              const sub = hint ? `${HINT[hint.field]} · ${matched}` : esc(e.description ?? "");
              const na = e.na?.includes(platform) ? `<span class="na">Not on ${platform}</span>` : "";
              return `<a class="search-opt" role="option" id="search-opt-${i}" data-i="${i++}" href="${esc(e.href)}" tabindex="-1" aria-selected="false"${na ? " data-na" : ""}>
                <span class="ic">${index.icons[e.icon] ?? ""}</span>
                <span class="txt"><span class="t"><b>${highlight(e.name, query)}</b><span class="meta">${esc(e.meta)}</span></span>${sub ? `<span class="sub">${sub}</span>` : ""}</span>
                ${na}<span class="go">${index.icons["corner-down-left"] ?? ""}</span>
              </a>`;
            })
            .join("")}</div>`,
      )
      .join("");
    empty!.hidden = shown.length > 0;
    empty!.textContent = shown.length ? "" : `Nothing matches “${query}”. Try a component, a prop like onPress, a token like fg.muted, or a page like Foundations.`;
    list!.scrollTop = 0;
    open();
    select(0);
  }

  async function update() {
    const query = input!.value.trim();
    const mine = ++seq;
    if (!query) return close();
    let idx: SearchIndex;
    try {
      idx = await load();
    } catch {
      if (mine !== seq) return;
      list!.innerHTML = "";
      shown = [];
      empty!.hidden = false;
      empty!.textContent = "Search couldn't load. Reload the page to try again.";
      return open();
    }
    if (mine === seq && input!.value.trim() === query) render(idx, query);
  }

  function go(href: string, newTab: boolean) {
    if (newTab) {
      window.open(href, "_blank", "noopener");
      return;
    }
    close();
    input!.blur();
    const url = new URL(href, location.href);
    const here = (p: string) => p.replace(/\/$/, "") || "/";
    if (here(url.pathname) === here(location.pathname) && url.hash) {
      if (location.hash === url.hash) reveal();
      else location.hash = url.hash;
    } else location.assign(href);
  }

  input.addEventListener("focus", () => {
    void load().catch(() => {});
    if (input.value.trim()) void update();
  });
  root.addEventListener("pointerenter", () => void load().catch(() => {}), { once: true });
  input.addEventListener("input", () => void update());
  input.addEventListener("blur", close);
  input.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (pop.hidden) return void update();
      if (shown.length) select((active + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length);
    } else if (e.key === "Enter") {
      const hit = !pop.hidden && shown[active];
      if (!hit) return;
      e.preventDefault();
      go(hit.entry.href, e.metaKey || e.ctrlKey);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (!pop.hidden) close();
      else {
        input.value = "";
        input.blur();
      }
    }
  });

  // Keep the cursor in the box while a result is pressed, so the click still lands on the link.
  pop.addEventListener("pointerdown", (e) => e.preventDefault());
  list.addEventListener("pointermove", (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>("[role=option]");
    if (opt && Number(opt.dataset.i) !== active) select(Number(opt.dataset.i), false);
  });
  list.addEventListener("click", (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLAnchorElement>("[role=option]");
    if (!opt || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    go(opt.getAttribute("href")!, false);
  });

  const editable = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      input.focus();
      input.select();
    } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !editable(e.target)) {
      e.preventDefault();
      input.focus();
    }
  });

  const key = root.querySelector<HTMLElement>("[data-search-key]");
  if (key && !/Mac|iPhone|iPad/.test(navigator.userAgent)) key.textContent = "Ctrl K";

  // The full prompt doesn't fit beside the menu button on a phone.
  const narrow = matchMedia("(max-width: 860px)");
  const placeholder = () => (input.placeholder = narrow.matches ? "Search" : "Search documentation");
  narrow.addEventListener("change", placeholder);
  placeholder();
}

/* ---------- section anchors ---------- */

function anchorHeadings() {
  document.querySelectorAll<HTMLElement>("main h2:not([id])").forEach((h) => {
    const id = slug(h.textContent ?? "");
    if (id && !document.getElementById(id)) h.id = id;
  });
}

function reveal() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) document.getElementById(id)?.scrollIntoView();
}

anchorHeadings();
if (location.hash) {
  reveal();
  // Islands draw after this and push the heading down. Follow it once they have, unless the visitor has scrolled since.
  let moved = false;
  const stop = () => (moved = true);
  for (const type of ["wheel", "touchmove", "keydown"]) addEventListener(type, stop, { once: true, passive: true });
  addEventListener("load", () => setTimeout(() => moved || reveal(), 400));
}
