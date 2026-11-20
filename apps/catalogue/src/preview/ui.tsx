import { useId, useRef, useState, type ReactNode } from "react";
import type { InteractionState, OS, Platform } from "@antfabric/ui-core";
import type { Scene } from "@antfabric/ui-docs";
import { highlight } from "../lib/highlight";
import { osOf, usePrefs } from "../lib/prefs";
import { SceneNode, Stage, Thing } from "./kit";

export interface CanvasProps {
  platform: Platform;
  width?: number;
  className?: string;
  label?: string;
  /** A Replay button that remounts the preview, so its entrances play again and its state resets. */
  replay?: boolean;
  children: (key: number) => ReactNode;
}

/** The frame every preview sits in. Its background follows the platform and theme tokens. */
export function Canvas({ platform, width, className = "", label, replay = true, children }: CanvasProps) {
  const { scheme } = usePrefs();
  const [n, setN] = useState(0);
  return (
    <div className={`canvas ${className}`} data-af-platform={platform} data-af-theme={scheme} aria-label={label}>
      <div data-preview-root style={width ? ({ "--w": `${width}px` } as React.CSSProperties) : undefined}>
        <div className="w">{children(n)}</div>
      </div>
      {replay && (
        <button type="button" className="replay" title="Reset this preview and replay its animations" aria-label="Replay" onClick={() => setN(n + 1)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      )}
    </div>
  );
}

export interface ShotProps {
  id: string;
  platform: Platform;
  props?: Record<string, unknown>;
  scene?: Scene;
  state?: InteractionState;
  /** Pin an OS; otherwise the preview follows the visitor's choice for the platform. */
  os?: OS;
  osVersion?: number;
  width?: number;
  className?: string;
  label?: string;
  replay?: boolean;
}

/** One component (or scene) in a canvas, drawn by its platform's kit. */
export function Shot({ id, platform, props, scene, state, os, osVersion, width, className, label, replay }: ShotProps) {
  const prefs = usePrefs();
  const chosen = osOf(prefs, platform);
  const pinned = os ? { os, osVersion: osVersion ?? (os === "ios" || os === "mac" ? prefs.version[os] : undefined) } : chosen;
  return (
    <Canvas platform={platform} width={width} className={className} label={label} replay={replay}>
      {(key) => (
        <Stage autoFocus={false} key={key} platform={platform} os={pinned.os} osVersion={pinned.osVersion} scheme={prefs.scheme} state={state}>
          {scene ? <SceneNode scene={scene} platform={platform} /> : <Thing id={id} platform={platform} props={props} />}
        </Stage>
      )}
    </Canvas>
  );
}

/** A code block with a copy button, highlighted the way the page's own blocks are. */
export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="code" data-code>
      <button className="copy" type="button" data-copy aria-label="Copy code">
        Copy
      </button>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>
    </div>
  );
}

export interface DemoProps {
  /** The heading over the block: an example's name, say. */
  title?: ReactNode;
  /** What sits under the title. */
  description?: ReactNode;
  /** With code, the block gets a Preview / Code switch. */
  code?: string;
  /** Beside the switch: a reset button, an OS pin. */
  tools?: ReactNode;
  /** Under the preview, inside the block: the event log. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * One preview block: a title row with a Preview / Code switch, then the stage. The preview stays
 * mounted while the code shows, so whatever someone did in it is still there when they switch back,
 * and the code takes at least the preview's height, so switching never pulls the page up under you.
 */
export function Demo({ title, description, code, tools, footer, children }: DemoProps) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [height, setHeight] = useState<number>();
  const preview = useRef<HTMLDivElement>(null);
  const id = useId();
  const show = (v: "preview" | "code") => {
    if (v === "code" && preview.current) setHeight(preview.current.offsetHeight);
    setView(v);
  };
  const head = title || code !== undefined || tools;
  return (
    <div className="demo-wrap">
      {head && (
        <div className="demo-head">
          <div className="demo-title">{title}</div>
          <div className="demo-tools">
            {tools}
            {code !== undefined && (
              <div className="seg sm" role="tablist" aria-label="View">
                {(["preview", "code"] as const).map((v) => (
                  <button key={v} type="button" role="tab" id={`${id}-${v}`} aria-selected={view === v} onClick={() => show(v)}>
                    {v === "preview" ? "Preview" : "Code"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {description && <p className="demo-desc">{description}</p>}
      <div className="demo">
        <div ref={preview} className="demo-view" role={code !== undefined ? "tabpanel" : undefined} aria-labelledby={code !== undefined ? `${id}-preview` : undefined} hidden={view !== "preview"}>
          {children}
        </div>
        {code !== undefined && (
          <div className="demo-view demo-code" role="tabpanel" aria-labelledby={`${id}-code`} hidden={view !== "code"} style={height ? { minHeight: height } : undefined}>
            <CodeBlock code={code} />
          </div>
        )}
        {footer}
      </div>
    </div>
  );
}
