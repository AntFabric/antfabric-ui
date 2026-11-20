/**
 * `pnpm frames <id> [platform] [os]` — what each flow frame draws, so a `press` can be checked
 * without opening the catalogue: every pressable in the frame, numbered the way `press` counts
 * them, with the component it belongs to and its label or text. ▶ marks where the press lands.
 */

import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { parseHTML } from "linkedom";
import { OS_VERSIONS, PLATFORM_OS, PLATFORMS, type OS, type Platform } from "@antfabric-ui/core";
import { registry } from "@antfabric-ui/docs";
import { DefaultsProvider, SceneNode, Stage, Thing } from "../src/preview/kit";
import { pressables, pressTarget } from "../src/preview/press";
import { defaultsFor, usedIds } from "../src/lib/library";

const [id, only, osArg] = process.argv.slice(2) as [string, Platform | undefined, OS | undefined];
const doc = registry[id];
if (!doc) {
  console.error(`No component "${id}"`);
  process.exit(1);
}

for (const flow of doc.flows ?? []) {
  console.log(`\n■ ${flow.id} — ${flow.title}`);
  for (const platform of PLATFORMS) {
    if (only && platform !== only) continue;
    if (!flow.platforms.includes(platform)) continue;
    const os = osArg && PLATFORM_OS[platform].includes(osArg) ? osArg : PLATFORM_OS[platform][0]!;
    const steps = flow.steps.map((s, i) => ({ s, i })).filter(({ s }) => !s.platforms || s.platforms.includes(platform));
    console.log(`  ${platform} (${os}): steps ${steps.map(({ s, i }) => `${i}:${s.kind}`).join(" ")}`);
    const defaults = defaultsFor(usedIds(doc), platform);
    for (const [n, frame] of (flow.replay ?? []).entries()) {
      if (frame.platforms && !frame.platforms.includes(platform)) continue;
      const body = frame.scene ? createElement(SceneNode, { scene: frame.scene, platform }) : createElement(Thing, { id, platform, props: frame.props });
      const html = renderToString(createElement(DefaultsProvider, { value: defaults }, createElement(Stage, { platform, os, osVersion: OS_VERSIONS[os]?.glass, scheme: "light", children: body })));
      const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
      const all = pressables(document.body);
      const hit = frame.press === undefined ? null : pressTarget(document.body, frame.press);
      const onStep = steps.some(({ i }) => i === frame.step) ? "" : "  ⚠ its step is not shown on this platform";
      console.log(`    frame ${n} → step ${frame.step}${frame.press === undefined ? "" : ` · press ${JSON.stringify(frame.press)}`}${onStep}`);
      if (frame.press !== undefined && !hit) console.log(`      ⚠ the press lands on nothing`);
      const missing = [...html.matchAll(/([A-Z][A-Za-z0-9]*) is not in @antfabric-ui\/[a-z-]+ yet/g)].map((m) => m[1]);
      if (missing.length) console.log(`      (waiting on ${[...new Set(missing)].join(", ")})`);
      all.forEach((el, i) => {
        const owner = el.closest("[data-af]")?.getAttribute("data-af");
        const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 48);
        const label = el.getAttribute("aria-label");
        console.log(`      ${el === hit ? "▶" : " "} ${i} ${owner ? `[${owner}] ` : ""}${text || label || `<${el.tagName.toLowerCase()}>`}${label && text && label !== text ? `  (label "${label}")` : ""}`);
      });
    }
  }
}
