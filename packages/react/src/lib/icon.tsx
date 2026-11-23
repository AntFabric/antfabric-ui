import type { ComponentType, CSSProperties } from "react";
import type { IconName } from "@antfabric/ui-core";
import { t } from "../tokens";
import { iconFor } from "./icons";

/** A lucide icon name in kebab case (`"trash-2"`, `"chevron-right"`), or the icon component itself (`Trash2` from `lucide-react`). */
export type { IconComponent, IconName } from "@antfabric/ui-core";

type Glyph = ComponentType<{ "aria-hidden"?: boolean; "data-af-part"?: string; style?: CSSProperties }>;

export interface IconProps {
  name: IconName;
  /** A length: a token (`t.icon.sizeMd`) or px. Defaults to the platform's medium icon. */
  size?: string | number;
  color?: string;
  /** Defaults to the platform's weight. Small glyphs on a fill (a tick in a box) are drawn heavier. */
  strokeWidth?: number | string;
  /** The recipe part this icon draws (`data-af-part`), when it is one. */
  part?: string;
  style?: CSSProperties;
}

/**
 * A lucide icon by name or as a component, sized and stroked by the platform's tokens. A name is drawn from the kit's registry (the icons
 * the kit draws itself, and whatever the app adds with `registerIcons`), so the props API is the same as the phone kit's, where the same
 * name picks the lucide-react-native icon. A name nobody registered draws an empty box of the icon's size.
 */
export function Icon({ name, size = t.icon.size, color, strokeWidth = t.icon.stroke, part, style }: IconProps) {
  const Glyph = (typeof name === "string" ? iconFor(name) : name) as Glyph | null;
  const box: CSSProperties = { width: size, height: size, flexShrink: 0, display: "block", color, strokeWidth, ...style };
  if (!Glyph) return <span aria-hidden data-af-missing-icon={name as string} data-af-part={part} style={{ ...box, display: "inline-block" }} />;
  return <Glyph aria-hidden data-af-part={part} style={box} />;
}

/**
 * The loading spinner: a quarter arc over a faint ring, in the current colour. A spinner inside a control that already says it is busy
 * (a loading Button, whose name and `aria-busy` carry it) is `decorative`: hidden from assistive tech, so the wait is not read twice.
 */
export function Spinner({ size = t.icon.size, label = "Loading", decorative = false, part, style }: { size?: string | number; label?: string; decorative?: boolean; part?: string; style?: CSSProperties }) {
  const a11y = decorative ? { "aria-hidden": true } : { role: "progressbar", "aria-label": label };
  return (
    <span {...a11y} data-af-part={part} style={{ display: "inline-flex", width: size, height: size, flexShrink: 0, ...style }}>
      <svg viewBox="0 0 24 24" fill="none" data-af-spinner style={{ width: "100%", height: "100%", animation: "af-spin .8s linear infinite" }}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity=".25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
