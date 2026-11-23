/**
 * Draws a component from either kit: `@antfabric/ui-react` for web and desktop, and
 * `@antfabric/ui-react-native` (through React Native Web) for mobile. Also draws the docs' scenes —
 * an example's slot content, a flow frame's composition — with the same kit.
 */

import { Component, createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { Text, TextInput, View, type TextStyle, type ViewStyle } from "react-native";
import * as R from "@antfabric/ui-react";
import * as N from "@antfabric/ui-react-native";
import * as RD from "@antfabric/ui-react/data";
import * as ND from "@antfabric/ui-react-native/data";
import * as RS from "@antfabric/ui-react/shell";
import * as NS from "@antfabric/ui-react-native/shell";
import * as RC from "@antfabric/ui-react/chat";
import * as NC from "@antfabric/ui-react-native/chat";
import { cssVarName, pascal, useControllable, type InteractionState, type NativeTokens, type OS, type Platform, type Scheme, type Theme } from "@antfabric/ui-core";
import type { Scene, SceneStyle } from "@antfabric/ui-docs";
import { ANTFABRIC_STRINGS, TITLE_BAR_SAMPLE, WEB_TOP_BAR_SAMPLE } from "@antfabric/ui-docs/samples";
// Every lucide icon, for the samples' names: a kit registers only its own.
import "./icons";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;

/** The kit's component for an id on a platform, or null while it is not written yet. The data components come from the kit's `/data` subpath, the app frame from its `/shell` subpath and the conversation components from its `/chat` subpath, not its root. */
export function kitComponent(id: string, platform: Platform): AnyComponent | null {
  const kit = (platform === "mobile" ? N : R) as unknown as Record<string, unknown>;
  const data = (platform === "mobile" ? ND : RD) as unknown as Record<string, unknown>;
  const shell = (platform === "mobile" ? NS : RS) as unknown as Record<string, unknown>;
  const chat = (platform === "mobile" ? NC : RC) as unknown as Record<string, unknown>;
  const c = kit[pascal(id)] ?? data[pascal(id)] ?? shell[pascal(id)] ?? chat[pascal(id)];
  return typeof c === "function" || (typeof c === "object" && c !== null) ? (c as AnyComponent) : null;
}

export interface StageProps {
  platform: Platform;
  os: OS;
  osVersion?: number;
  /** Light or dark. */
  scheme: Scheme;
  /** The theme both kits draw in. Left out, the kit's default. */
  theme?: Theme;
  state?: InteractionState;
  /**
   * Whether an overlay drawn here moves focus into itself when it mounts (default true: the checks hold the kits to it). The catalogue's
   * pages draw many open overlays side by side as pictures, so its islands pass false and the page keeps its own focus.
   */
  autoFocus?: boolean;
  children: ReactNode;
}

/**
 * The providers a kit's components need: where they are, the theme, AntFabric's copy, and a forced state for snapshots. `strings` is
 * `ANTFABRIC_STRINGS` on both roots, whatever the theme: the catalogue is AntFabric's showcase, and sets its copy once at the root the way
 * a product does. Everything drawn inside (a component, a screen, `RailWindow`) reads it.
 */
export function Stage({ platform, os, osVersion, scheme, theme, state, autoFocus, children }: StageProps) {
  if (platform === "mobile") {
    return (
      <N.ThemeProvider scheme={scheme} os={os === "android" ? "android" : "ios"} osVersion={osVersion} theme={theme} strings={ANTFABRIC_STRINGS}>
        <N.ForceState state={state}>
          <View style={{ alignSelf: "stretch" }}>{children}</View>
        </N.ForceState>
      </N.ThemeProvider>
    );
  }
  return (
    <R.AntFabricRoot platform={platform} os={os} osVersion={osVersion} scheme={scheme} theme={theme} strings={ANTFABRIC_STRINGS} autoFocus={autoFocus} css="theme" style={{ display: "flex", flexDirection: "column" }}>
      <R.ForceState state={state}>{children}</R.ForceState>
    </R.AntFabricRoot>
  );
}

const isScene = (v: unknown): v is Scene => typeof v === "object" && v !== null && "el" in v && typeof (v as Scene).el === "string";
const hasSceneField = (v: unknown): boolean => typeof v === "object" && v !== null && !Array.isArray(v) && !isScene(v) && Object.values(v).some(isScene);

/** Props as the docs write them, with any scene (slot content) drawn by the kit. */
export function resolveProps(props: Record<string, unknown>, platform: Platform): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (isScene(v)) out[k] = <SceneNode scene={v} platform={platform} />;
    else if (Array.isArray(v) && v.length && v.every(isScene)) out[k] = v.map((s, i) => <SceneNode key={i} scene={s} platform={platform} />);
    // A list of items whose fields hold a scene (a RadioGroup option's `preview`): each such field is drawn, the rest of the item kept as it is.
    else if (Array.isArray(v) && v.some(hasSceneField)) out[k] = v.map((item) => (hasSceneField(item) ? resolveProps(item as Record<string, unknown>, platform) : item));
    else out[k] = v;
  }
  return out;
}

/** The documented defaults of every component an island draws, keyed by id (computed by the page). */
const Defaults = createContext<Record<string, Record<string, unknown>>>({});
export const DefaultsProvider = Defaults.Provider;

/**
 * The nav rail has no collapse button of its own: its `expanded` is the sidebar button's in the title bar (desktop) or the web top
 * bar (web). So the catalogue draws it in a window under that bar, and the bar's button opens and closes it. The rail's own props
 * (the playground's control, a flow frame) still set where it starts.
 */
function RailWindow({ platform, rail }: { platform: Platform; rail: Record<string, unknown> }) {
  const [open, setOpen] = useControllable(Boolean(rail.expanded));
  const bar = { sidebarExpanded: open, onSidebarExpandedChange: (next: boolean) => setOpen(next) };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 640,
        maxWidth: "100%",
        overflow: "hidden",
        borderRadius: R.t.radius.card,
        border: `1px solid ${R.t.border.subtle}`,
        background: R.t.surface.page,
      }}
    >
      {platform === "web" ? <RS.WebTopBar compact {...WEB_TOP_BAR_SAMPLE} {...bar} /> : <RS.TitleBar {...TITLE_BAR_SAMPLE} {...bar} />}
      {/* The rail fills the height it is given (an app's window); the catalogue's window is 680 tall. */}
      <div style={{ display: "flex", flexDirection: "row", flex: 1, minHeight: 680 }}>
        <RS.NavRail {...rail} expanded={open} />
        <div style={{ flex: 1, minWidth: 0 }} />
      </div>
    </div>
  );
}

/** Components the catalogue draws inside the part of the app that drives them, on web and desktop. */
const HOSTS: Record<string, (p: { platform: Platform; rail: Record<string, unknown> }) => ReactNode> = { "nav-rail": RailWindow };

/**
 * Components that fill what they are given (a phone's screen) are drawn in a phone-sized frame, laid on their root as `styles.root`: 375 wide,
 * with room above the sheet (a tall sheet stops under the screen's header row, y 119 on an 852pt iPhone).
 */
const PHONE_FRAME = { alignSelf: "flex-start", flexGrow: 0, width: 375, maxWidth: "100%" } as const;
const FRAMES: Record<string, (props: Record<string, unknown>, platform: Platform) => Record<string, unknown> | null> = {
  "bottom-sheet": (p) => ({ ...PHONE_FRAME, ...(p.tall ? { height: 740, paddingTop: 119 } : { paddingTop: 96 }) }),
  // The phone's Sheet is a BottomSheet, which fills the Sheet.
  sheet: (_, platform) => (platform === "mobile" ? PHONE_FRAME : null),
};

/** One component with its documented defaults under the given props, or a note while the kit does not have it yet. */
export function Thing({ id, platform, props = {} }: { id: string; platform: Platform; props?: Record<string, unknown> }) {
  const defaults = useContext(Defaults)[id];
  const C = kitComponent(id, platform);
  if (!C) return <Missing id={id} platform={platform} />;
  const resolved = resolveProps({ ...defaults, ...props }, platform);
  const frame = FRAMES[id]?.(resolved, platform);
  // Under the root's own `styles`, so a product's (the styles probe's) still wins.
  if (frame) resolved.styles = { ...(resolved.styles as object | undefined), root: { ...frame, ...(resolved.styles as { root?: object } | undefined)?.root } };
  const Host = platform === "mobile" ? undefined : HOSTS[id];
  return (
    <Boundary id={id} platform={platform}>
      {Host ? <Host platform={platform} rail={resolved} /> : <C {...resolved} />}
    </Boundary>
  );
}

/** A component that throws shows its error in place, instead of blanking the whole island. */
class Boundary extends Component<{ id: string; platform: Platform; children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    const msg = `${pascal(this.props.id)}: ${this.state.error.message}`;
    return this.props.platform === "mobile" ? <Text style={{ color: "#be123c", fontSize: 12 }}>{msg}</Text> : <div className="af-missing">{msg}</div>;
  }
}

function Missing({ id, platform }: { id: string; platform: Platform }) {
  const label = `${pascal(id)} is not in ${platform === "mobile" ? "@antfabric/ui-react-native" : "@antfabric/ui-react"} yet`;
  if (platform === "mobile")
    return (
      <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: "#be123c", padding: 6 }}>
        <Text style={{ color: "#be123c", fontSize: 12, fontFamily: "ui-monospace, monospace" }}>{label}</Text>
      </View>
    );
  return <div className="af-missing">{label}</div>;
}

/* ---------- scenes ---------- */

export function SceneNode({ scene, platform }: { scene: Scene; platform: Platform }) {
  return platform === "mobile" ? <NativeScene scene={scene} /> : <DomScene scene={scene} platform={platform} />;
}

const tokenVar = (v: string) => v.replace(/\$([a-z][a-z0-9]*(?:\.[a-z0-9][a-z0-9-]*)*)/gi, (_, path: string) => `var(${cssVarName(path)})`);

const UNITLESS = new Set(["opacity", "zIndex", "flex", "grow", "shrink", "flexGrow", "flexShrink", "fontWeight", "aspectRatio", "order"]);

/** The docs' scene style vocabulary as CSS, the way the React kit lays out (flex columns that may shrink). */
export function domStyle(style: SceneStyle = {}): CSSProperties {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(style)) {
    if (typeof raw === "object") continue;
    const v = typeof raw === "number" ? (UNITLESS.has(key) || (key === "lineHeight" && raw <= 4) ? raw : `${raw}px`) : tokenVar(raw);
    switch (key) {
      case "bg":
        out.background = v;
        break;
      case "paddingX":
        out.paddingLeft = out.paddingRight = v;
        break;
      case "paddingY":
        out.paddingTop = out.paddingBottom = v;
        break;
      case "marginX":
        out.marginLeft = out.marginRight = v;
        break;
      case "marginY":
        out.marginTop = out.marginBottom = v;
        break;
      case "radius":
        out.borderRadius = v;
        break;
      case "direction":
        out.flexDirection = v;
        break;
      case "align":
        out.alignItems = v;
        break;
      case "justify":
        out.justifyContent = v;
        break;
      case "wrap":
        out.flexWrap = raw === "true" || raw === "wrap" ? "wrap" : "nowrap";
        break;
      case "grow":
        out.flexGrow = v;
        break;
      case "shrink":
        out.flexShrink = v;
        break;
      case "size":
        out.width = out.height = v;
        out.flexShrink = 0;
        break;
      case "font":
        out.fontFamily = v;
        break;
      case "shadow":
        out.boxShadow = v;
        break;
      case "truncate":
        Object.assign(out, Number(raw) <= 1 ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 } : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: Number(raw), overflow: "hidden" });
        break;
      default:
        out[key] = v;
    }
  }
  return out as CSSProperties;
}

const box: CSSProperties = { display: "flex", flexDirection: "column", boxSizing: "border-box", minWidth: 0, position: "relative" };

function DomScene({ scene: s, platform }: { scene: Scene; platform: Platform }): ReactNode {
  const style = { ...domStyle(s.style), ...R.enter(s.enter) };
  const kids = s.children?.map((c, i) => <DomScene key={i} scene={c} platform={platform} />);
  switch (s.el) {
    case "component":
      return (
        <div data-af={s.use} style={{ ...box, ...style }}>
          <Thing id={s.use ?? ""} platform={platform} props={s.props} />
        </div>
      );
    case "text":
      return <span style={{ display: "block", margin: 0, minWidth: 0, ...style }}>{s.text}</span>;
    case "icon":
      return <R.Icon name={s.icon ?? ""} style={style} />;
    case "input":
      return <input data-af-input placeholder={String(s.attrs?.placeholder ?? "")} aria-label={String(s.attrs?.label ?? "")} style={{ border: 0, background: "transparent", font: "inherit", color: "inherit", outline: "none", ...style }} />;
    case "textarea":
      return <textarea data-af-input placeholder={String(s.attrs?.placeholder ?? "")} rows={2} style={{ border: 0, background: "transparent", font: "inherit", color: "inherit", outline: "none", resize: "none", ...style }} />;
    default:
      return (
        <div aria-label={s.attrs?.label ? String(s.attrs.label) : undefined} style={{ ...box, ...style }}>
          {kids}
        </div>
      );
  }
}

/** A token path (`brand.default`) looked up in the resolved tokens. */
function lookup(t: NativeTokens, path: string): string | number | undefined {
  let at: unknown = t;
  for (const k of path.split(".")) at = (at as Record<string, unknown> | undefined)?.[k];
  return typeof at === "string" || typeof at === "number" ? at : undefined;
}

function nativeValue(t: NativeTokens, raw: string | number): string | number {
  if (typeof raw === "number") return raw;
  const whole = /^\$([a-z0-9.-]+)$/i.exec(raw);
  if (whole) return lookup(t, whole[1]!) ?? raw;
  const px = /^(-?[\d.]+)px$/.exec(raw);
  if (px) return Number(px[1]);
  return raw.replace(/\$([a-z][a-z0-9]*(?:\.[a-z0-9][a-z0-9-]*)*)/gi, (_, p: string) => String(lookup(t, p) ?? ""));
}

/** The same vocabulary as React Native style, with tokens resolved. */
export function nativeStyle(t: NativeTokens, style: SceneStyle = {}): ViewStyle & TextStyle {
  const out: Record<string, unknown> = {};
  const border = (side: string, raw: string) => {
    const m = /^(\d+(?:\.\d+)?)px\s+(solid|dashed|dotted)\s+(.+)$/.exec(String(nativeValue(t, raw)));
    if (!m) return;
    out[`border${side}Width`] = Number(m[1]);
    out[`border${side}Color`] = m[3];
    if (m[2] !== "solid") out.borderStyle = m[2];
  };
  for (const [key, raw] of Object.entries(style)) {
    if (typeof raw === "object") continue;
    const v = nativeValue(t, raw);
    switch (key) {
      case "bg":
        out.backgroundColor = v;
        break;
      case "paddingX":
        out.paddingHorizontal = v;
        break;
      case "paddingY":
        out.paddingVertical = v;
        break;
      case "marginX":
        out.marginHorizontal = v;
        break;
      case "marginY":
        out.marginVertical = v;
        break;
      case "radius":
        out.borderRadius = v;
        break;
      case "direction":
        out.flexDirection = v;
        break;
      case "align":
        out.alignItems = v;
        break;
      case "justify":
        out.justifyContent = v;
        break;
      case "wrap":
        out.flexWrap = raw === "true" || raw === "wrap" ? "wrap" : "nowrap";
        break;
      case "grow":
        out.flexGrow = v;
        break;
      case "shrink":
        out.flexShrink = v;
        break;
      case "size":
        out.width = out.height = v;
        out.flexShrink = 0;
        break;
      case "font":
        out.fontFamily = v;
        break;
      case "shadow":
        out.boxShadow = v;
        break;
      case "inset":
        out.top = out.left = out.right = out.bottom = v;
        break;
      case "border":
        border("", String(raw));
        break;
      case "borderTop":
      case "borderBottom":
      case "borderLeft":
      case "borderRight":
        border(key.slice(6), String(raw));
        break;
      case "fontWeight":
        out.fontWeight = String(v);
        break;
      case "lineHeight":
        if (typeof v === "number" && v <= 4) {
          const size = nativeValue(t, String(style.fontSize ?? ""));
          if (typeof size === "number") out.lineHeight = Math.round(v * size);
        } else out.lineHeight = v;
        break;
      case "letterSpacing":
        if (typeof v === "number") out.letterSpacing = v;
        break;
      case "truncate":
      case "transition":
      case "cursor":
      case "transform":
        break;
      default:
        out[key] = v;
    }
  }
  return out as ViewStyle & TextStyle;
}

function NativeScene({ scene: s }: { scene: Scene }): ReactNode {
  const { t } = N.useTheme();
  const style = nativeStyle(t, s.style);
  const kids = s.children?.map((c, i) => <NativeScene key={i} scene={c} />);
  const wrap = (node: ReactNode) => (s.enter ? <N.Enter motion={s.enter}>{node}</N.Enter> : node);
  switch (s.el) {
    case "component":
      return wrap(
        // dataSet is React Native Web's: it lands as data-af on the element, which a flow's press finds.
        <View {...({ dataSet: { af: s.use } } as object)} style={style}>
          <Thing id={s.use ?? ""} platform="mobile" props={s.props} />
        </View>,
      );
    case "text":
      return (
        <Text numberOfLines={s.style?.truncate ? Number(s.style.truncate) : undefined} style={[{ color: t.fg.body, fontSize: t.text.body }, N.font("regular"), style]}>
          {s.text}
        </Text>
      );
    case "icon":
      return <N.Icon name={s.icon ?? ""} color={typeof style.color === "string" ? style.color : undefined} />;
    case "input":
    case "textarea":
      return <TextInput placeholder={String(s.attrs?.placeholder ?? "")} placeholderTextColor={t.fg.placeholder} multiline={s.el === "textarea"} style={[{ color: t.fg.body, fontSize: t.text.body }, style]} />;
    default:
      return wrap(
        <View accessibilityLabel={s.attrs?.label ? String(s.attrs.label) : undefined} style={style}>
          {kids}
        </View>,
      );
  }
}

