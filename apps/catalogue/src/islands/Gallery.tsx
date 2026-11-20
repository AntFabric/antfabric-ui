import { useLayoutEffect, useRef } from "react";
import type { InteractionState, Platform } from "@antfabric-ui/core";
import type { ComponentDocs, EdgeCase, Example } from "@antfabric-ui/docs";
import type { MatrixRow } from "../lib/library";
import { usage } from "../lib/usage";
import { DefaultsProvider } from "../preview/kit";
import { Demo, Shot } from "../preview/ui";

const OS_LABEL: Record<string, string> = { browser: "Browser", mac: "macOS", windows: "Windows", linux: "Linux", ios: "iOS", android: "Android" };
const PLATFORM_LABEL: Record<Platform, string> = { web: "Web", desktop: "Desktop", mobile: "Mobile" };

export interface GalleryProps {
  id: string;
  /** For each example's code: what an app writes to get it. */
  doc: Pick<ComponentDocs, "id" | "name" | "props" | "platforms">;
  platform: Platform;
  examples: Example[];
  /** The Variants rows (`casesFor`): each case's props over the defaults, captioned with its name. */
  matrix: MatrixRow[];
  states: InteractionState[];
  edge: EdgeCase[];
  /** How many edge cases the component has on every platform together. */
  edgeTotal: number;
  defaults: Record<string, Record<string, unknown>>;
}

/** A preview wider than its grid cell takes the whole row. */
function useSpanRows() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.querySelectorAll<HTMLElement>(".edge-list > *").forEach((cell) => {
        const canvas = cell.querySelector<HTMLElement>(":scope > .canvas, :scope > .edge-shot > .canvas");
        if (canvas && canvas.scrollWidth > canvas.clientWidth + 1) cell.classList.add("span-row");
      });
    };
    const t = setTimeout(fit, 300);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, []);
  return ref;
}

/** Examples, variants, states and edge cases of one component on one platform. */
export default function Gallery({ id, doc, platform, examples, matrix, states, edge, edgeTotal, defaults }: GalleryProps) {
  const ref = useSpanRows();
  return (
    <DefaultsProvider value={defaults}>
      <div ref={ref}>
        {examples.length > 0 && (
          <div className="section">
            <h2>Examples</h2>
            <div className="demo-list">
              {examples.map((e) => (
                <Demo
                  key={e.name}
                  title={
                    <>
                      <h3>{e.name}</h3>
                      {e.os && <span className="chip">{OS_LABEL[e.os]}</span>}
                      {e.state && <span className="chip">{e.state}</span>}
                    </>
                  }
                  description={e.description}
                  code={usage(doc as ComponentDocs, e.props ?? {}, platform)}
                >
                  <Shot id={id} platform={platform} props={e.props} state={e.state} os={e.os} width={e.width} className={`stage sm${e.width ? " stretch" : ""}`} />
                </Demo>
              ))}
            </div>
          </div>
        )}

        {matrix.length > 0 && (
          <div className="section">
            <h2>Variants</h2>
            <p className="sub">Each value of a prop, or each named case, with every other prop at its default.</p>
            <div className="demo-list">
              {matrix.map((m) => (
                <Demo key={m.prop} title={<h3 className="mono-h">{m.prop}</h3>}>
                  <div className="matrix">
                    {m.cases.map((c) => (
                      <figure key={c.name}>
                        <Shot id={id} platform={platform} props={c.props} width={m.width} className={`plain tight${m.width ? " stretch" : ""}`} replay={false} />
                        <figcaption>{c.name}</figcaption>
                      </figure>
                    ))}
                  </div>
                </Demo>
              ))}
            </div>
          </div>
        )}

        {states.length > 0 && (
          <div className="section">
            <h2>States</h2>
            <p className="sub">
              Forced snapshots of each interaction state.
              {platform === "mobile" && " There is no hover on a phone, so the phone kit draws none."}
            </p>
            <Demo>
              <div className="matrix">
                {(["rest", ...states] as const).map((s) => (
                  <figure key={s}>
                    <Shot id={id} platform={platform} state={s === "rest" ? undefined : s} className="plain tight" replay={false} />
                    <figcaption>{s}</figcaption>
                  </figure>
                ))}
              </div>
            </Demo>
          </div>
        )}

        {edge.length > 0 && (
          <div className="section">
            <h2>Edge cases</h2>
            <p className="sub">
              {edge.length} of {edgeTotal} edge cases apply on {PLATFORM_LABEL[platform].toLowerCase()}: what the component does when the data or the device is not the usual.
            </p>
            <div className="edge-list">
              {edge.map((ec) => {
                const ex = ec.example && (!ec.example.platforms || ec.example.platforms.includes(platform)) ? ec.example : null;
                return (
                  <div className={`edge${ex ? "" : " no-ex"}`} key={ec.title}>
                    <div className="edge-text">
                      <h3 data-toc="off">{ec.title}</h3>
                      <p>{ec.handling}</p>
                      <div className="ps">
                        {ec.platforms.map((pp) => (
                          <span className="chip" key={pp}>
                            {PLATFORM_LABEL[pp]}
                          </span>
                        ))}
                      </div>
                    </div>
                    {ex && <Shot id={id} platform={platform} props={ex.props} state={ex.state} os={ex.os} width={ex.width} className={`plain${ex.width ? " stretch" : ""}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DefaultsProvider>
  );
}
