import { useMemo, useState } from "react";
import { View } from "react-native";
import { defineTheme, themes, type Platform, type ThemeInput } from "@antfabric/ui-core";
import type { Scene } from "@antfabric/ui-docs";
import { osOf, usePrefs } from "../lib/prefs";
import { DefaultsProvider, Stage, Thing } from "../preview/kit";
import { Canvas, CodeBlock } from "../preview/ui";

/** What the playground draws, and the documented defaults it needs for each (the page computes them per kit). */
export interface ThemePlaygroundProps {
  web: Record<string, Record<string, unknown>>;
  mobile: Record<string, Record<string, unknown>>;
}

const PRIMARIES = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Teal", value: "#0f766e" },
  { name: "Coral", value: "#fe4632" },
  { name: "Violet", value: "#7e22ce" },
  { name: "Blue", value: "#1d4ed8" },
];

type Radius = "sharp" | "default" | "round";
type Font = "geist" | "figtree" | "system";

/** Neutral's scale is 4 / 6 / 6 / 10 / 12 / 16 (and the phone's card 12). `default` leaves it alone, so it writes nothing. */
const RADII: Record<Exclude<Radius, "default">, { scale: Record<string, number>; card: number }> = {
  sharp: { scale: { tag: 0, row: 0, control: 0, input: 0, card: 0, rail: 0, panel: 0, sheet: 0, tray: 0 }, card: 0 },
  round: { scale: { tag: 8, row: 12, control: 12, input: 12, card: 20, rail: 20, panel: 24, sheet: 28, tray: 24 }, card: 24 },
};

const SYSTEM_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const NO_FILES = { regular: "", medium: "", semibold: "", bold: "", extrabold: "" };

/** The theme the controls describe, and the `defineTheme` call that writes it (the two are built from the same pieces). */
function build(primary: string, radius: Radius, font: Font) {
  const input: ThemeInput = { name: "playground", extends: themes.neutral, brand: { primary } };
  const code = ["export const playground = defineTheme({", '  name: "playground",', "  extends: themes.neutral,", `  brand: { primary: "${primary}" },`];
  if (font === "figtree") {
    input.fonts = { sans: "Figtree", display: "Figtree" };
    code.push('  fonts: { sans: "Figtree", display: "Figtree" },');
  } else if (font === "system") {
    input.fonts = { sans: { family: "system-ui", files: NO_FILES }, display: { family: "system-ui", files: NO_FILES } };
    code.push(
      "  // The system font: no file on the phone, and the platform's own stack on the web.",
      "  fonts: {",
      '    sans: { family: "system-ui", files: SYSTEM_FILES },',
      '    display: { family: "system-ui", files: SYSTEM_FILES },',
      "  },",
    );
  }
  const tokens: NonNullable<ThemeInput["tokens"]> = {};
  const shared: string[] = [];
  const lines: string[] = [];
  if (radius !== "default") {
    const { scale, card } = RADII[radius];
    tokens.shared = { radius: scale };
    tokens.profiles = { mobile: { radius: { card } } };
    const keys = Object.entries(scale).map(([k, v]) => `${k}: ${v}`);
    shared.push("radius: {", `        ${keys.slice(0, 4).join(", ")},`, `        ${keys.slice(4).join(", ")},`, "      },");
    lines.push("    // The phone has its own card radius, so the shared one alone would not reach it.", `    profiles: { mobile: { radius: { card: ${card} } } },`);
  }
  if (font === "system") {
    tokens.shared = { ...tokens.shared, font: { sans: SYSTEM_STACK, display: SYSTEM_STACK } };
    shared.push("font: { sans: SYSTEM_STACK, display: SYSTEM_STACK },");
  }
  if (shared.length) lines.unshift("    shared: {", ...shared.map((l) => (l.startsWith(" ") || l === "}," ? l : `      ${l}`)), "    },");
  if (lines.length) {
    input.tokens = tokens;
    code.push("  tokens: {", ...lines, "  },");
  }
  code.push("});");
  const head = ['import { defineTheme, themes } from "@antfabric/ui-core";'];
  if (font === "system") head.push("", `const SYSTEM_STACK = '${SYSTEM_STACK}';`, `const SYSTEM_FILES = { regular: "", medium: "", semibold: "", bold: "", extrabold: "" };`);
  return { theme: defineTheme(input), code: [...head, "", ...code].join("\n") };
}

const CARD: Scene[] = [
  {
    el: "view",
    style: { direction: "row", align: "center", justify: "space-between", gap: 8 },
    children: [
      { el: "text", text: "Checkout revamp", style: { fontSize: "$text.title", fontWeight: "$font.weightSemibold", color: "$fg.strong" } },
      { el: "component", use: "tag", props: { label: "On track", tone: "success" } },
    ],
  },
  { el: "text", text: "Priya shipped the payment sheet. Two reviews left before Friday.", style: { fontSize: "$text.bodySm", color: "$fg.muted" } },
];

/** The same small set on both kits: the playground's whole point is that one theme restyles them together. */
function Sample({ platform }: { platform: Platform }) {
  const buttons = [
    { label: "Send invite", variant: "primary" },
    { label: "Cancel", variant: "secondary" },
    { label: "Skip", variant: "ghost" },
  ];
  const rest = (
    <>
      <Thing id="text-field" platform={platform} props={{ label: "Channel name", value: "platform-eng", prefix: "#", helper: "Lowercase, no spaces." }} />
      <Thing id="switch" platform={platform} props={{ label: "Notify me about mentions", checked: true }} />
      <Thing id="card" platform={platform} props={{ children: CARD }} />
      <Thing id="tag" platform={platform} props={{ label: "Design review", tone: "brand" }} />
      <Thing id="inline-banner" platform={platform} props={{ tone: "brand", icon: "sparkles", title: "Fabric drafted a reply", message: "Review it before it goes out.", actionLabel: "Review draft" }} />
    </>
  );
  if (platform === "mobile")
    return (
      <View style={{ gap: 14, alignItems: "stretch" }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {buttons.map((b) => (
            <Thing key={b.label} id="button" platform={platform} props={b} />
          ))}
        </View>
        {rest}
      </View>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "stretch" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {buttons.map((b) => (
          <Thing key={b.label} id="button" platform={platform} props={b} />
        ))}
      </div>
      {rest}
    </div>
  );
}

function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; text: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="tp-field">
      <span className="tp-label">{label}</span>
      <div className="seg sm" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * A theme built live from three controls: `defineTheme({ extends: themes.neutral, brand, fonts, tokens })`, drawn on web and on the
 * phone in the visitor's scheme, with the call that makes it under the previews. The site's own theme switch is not involved:
 * this page's previews draw the playground's theme and nothing else.
 */
export default function ThemePlayground({ web, mobile }: ThemePlaygroundProps) {
  const prefs = usePrefs();
  const [primary, setPrimary] = useState(PRIMARIES[0]!.value);
  const [radius, setRadius] = useState<Radius>("default");
  const [font, setFont] = useState<Font>("geist");
  const { theme, code } = useMemo(() => build(primary, radius, font), [primary, radius, font]);

  const column = (platform: Platform, label: string, caption: string, defaults: ThemePlaygroundProps["web"]) => {
    const where = osOf(prefs, platform);
    return (
      <div>
        <DefaultsProvider value={defaults}>
          <Canvas platform={platform} className="plain stretch" label={`${label} preview`} replay={false}>
            {() => (
              <Stage autoFocus={false} platform={platform} os={where.os} osVersion={where.osVersion} theme={theme} scheme={prefs.scheme}>
                <Sample platform={platform} />
              </Stage>
            )}
          </Canvas>
        </DefaultsProvider>
        <div className="cap">
          <b>{label}</b>
          <span className="faint">{caption}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="tp">
      <div className="tp-controls">
        <div className="tp-field">
          <span className="tp-label" id="tp-primary">
            Primary
          </span>
          <div className="tp-swatches" role="group" aria-labelledby="tp-primary">
            {PRIMARIES.map((p) => (
              <button key={p.value} type="button" className="tp-swatch" style={{ background: p.value }} aria-label={p.name} aria-pressed={primary === p.value} title={p.name} onClick={() => setPrimary(p.value)} />
            ))}
            <label className="tp-custom" title="Pick any colour">
              <input type="color" value={primary} aria-label="Custom primary colour" onChange={(e) => setPrimary(e.target.value)} />
              <code>{primary}</code>
            </label>
          </div>
        </div>
        <Seg
          label="Radius"
          value={radius}
          options={[
            { id: "sharp", text: "Sharp" },
            { id: "default", text: "Default" },
            { id: "round", text: "Round" },
          ]}
          onChange={setRadius}
        />
        <Seg
          label="Font"
          value={font}
          options={[
            { id: "geist", text: "Geist" },
            { id: "figtree", text: "Figtree" },
            { id: "system", text: "System" },
          ]}
          onChange={setFont}
        />
      </div>
      <div className="grid c2">
        {column("web", "Web and desktop", "AntFabricRoot theme", web)}
        {column("mobile", "Phone", "ThemeProvider theme", mobile)}
      </div>
      <CodeBlock code={code} />
    </div>
  );
}
