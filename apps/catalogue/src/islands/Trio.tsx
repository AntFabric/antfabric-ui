import type { Platform } from "@antfabric-ui/core";
import { DefaultsProvider } from "../preview/kit";
import { Shot } from "../preview/ui";

export interface TrioProps {
  id: string;
  props?: Record<string, unknown>;
  wide?: boolean;
  cells: { platform: Platform; label: string; caption?: string; na?: string; defaults: Record<string, Record<string, unknown>> }[];
}

/** One component with the same props on web, desktop and mobile, side by side. */
export default function Trio({ id, props, wide, cells }: TrioProps) {
  return (
    <div className="grid c3">
      {cells.map((c) => (
        <div key={c.platform}>
          {c.na ? (
            <div className="na-panel" style={{ minHeight: 120, display: "grid", placeItems: "center", textAlign: "center" }}>
              <span className="muted" style={{ fontSize: 12.5 }}>
                Not on {c.label.toLowerCase()} — {c.na}.
              </span>
            </div>
          ) : (
            <DefaultsProvider value={c.defaults}>
              <Shot id={id} platform={c.platform} props={props} className={`plain${wide ? " stretch" : ""}`} />
            </DefaultsProvider>
          )}
          <div className="cap">
            <b>{c.label}</b>
            <span className="faint">{c.caption}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
