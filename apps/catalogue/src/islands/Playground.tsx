import { useMemo, useState } from "react";
import type { Platform } from "@antfabric-ui/core";
import type { ComponentDocs, PropDoc } from "@antfabric-ui/docs";
import { osOf, usePrefs } from "../lib/prefs";
import { usage } from "../lib/usage";
import { DefaultsProvider, Stage, Thing } from "../preview/kit";
import { Dropdown } from "../preview/Dropdown";
import { Canvas, Demo } from "../preview/ui";

type Doc = Pick<ComponentDocs, "id" | "name" | "props" | "platforms">;

export interface PlaygroundProps {
  doc: Doc;
  platform: Platform;
  /** The documented defaults allowed on this platform: where the controls start. */
  initial: Record<string, unknown>;
  width?: number;
  iconChoices: string[];
  defaults: Record<string, Record<string, unknown>>;
}

const EDITABLE = ["string", "number", "boolean", "enum", "icon"];

interface Logged {
  n: number;
  name: string;
  args: unknown[];
}

/** An argument as the log shows it. A component should never pass a DOM or native event, but one that does must not take the page down. */
const json = (v: unknown) => {
  try {
    return JSON.stringify(v) ?? "undefined";
  } catch {
    return v && typeof v === "object" && "nativeEvent" in v ? "[event]" : String(v);
  }
};

const short = (v: unknown) => {
  const s = json(v);
  return s.length > 64 ? `${s.slice(0, 61)}…` : s;
};

/**
 * The component, live, with a control per prop. Pressing something in the preview is the component
 * being used: an event it fires is logged under the preview, and an event that reports a prop's new
 * value (`changes`) moves that prop's control too.
 */
export default function Playground({ doc, platform, initial, width, iconChoices, defaults }: PlaygroundProps) {
  const prefs = usePrefs();
  const { os, osVersion } = osOf(prefs, platform);
  const [values, setValues] = useState(initial);
  const [log, setLog] = useState<Logged[]>([]);
  const [key, setKey] = useState(0);

  const applies = (d: PropDoc) => !d.platforms || d.platforms.includes(platform);
  const controls = Object.entries(doc.props).filter(([, d]) => EDITABLE.includes(d.type) && applies(d));

  const events = useMemo(() => {
    let n = 0;
    return Object.fromEntries(
      Object.entries(doc.props)
        .filter(([, d]) => d.type === "event" && applies(d))
        .map(([name, d]) => [
          name,
          (...args: unknown[]) => {
            setLog((l) => [{ n: ++n + Date.now(), name, args }, ...l].slice(0, 3));
            if (d.changes) setValues((v) => ({ ...v, [d.changes!]: args[0] }));
          },
        ]),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, platform]);

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  const reset = () => {
    setValues(initial);
    setLog([]);
    setKey((k) => k + 1);
  };

  return (
    <DefaultsProvider value={defaults}>
      <Demo
        code={usage(doc as ComponentDocs, values, platform)}
        footer={
          <div className="event-log" aria-live="polite" hidden={!log.length}>
            <span className="event-log-label">Events</span>
            {log.map((e) => (
              <span className="ev" key={e.n} title={`${e.name}(${e.args.map(json).join(", ")})`}>
                <b>{e.name}</b>
                <span>({e.args.map(short).join(", ")})</span>
              </span>
            ))}
          </div>
        }
      >
        <Canvas platform={platform} width={width} className={`stage${width ? " stretch" : ""}`}>
          {(n) => (
            <Stage autoFocus={false} key={`${n}-${key}`} platform={platform} os={os} osVersion={osVersion} scheme={prefs.scheme}>
              <Thing id={doc.id} platform={platform} props={{ ...values, ...events }} />
            </Stage>
          )}
        </Canvas>
      </Demo>
      {controls.length > 0 && (
        <form className="customize" onSubmit={(e) => e.preventDefault()}>
          <div className="cz-head">
            <b>Customize</b>
            <button className="cz-reset" type="button" onClick={reset}>
              Reset
            </button>
          </div>
          <div className="cz-grid">
            {controls.map(([name, d]) => {
              const v = values[name];
              if (d.type === "boolean")
                return (
                  <label className="cz" key={name} title={d.description}>
                    <span>{name}</span>
                    <input type="checkbox" role="switch" checked={Boolean(v)} onChange={(e) => set(name, e.target.checked)} />
                  </label>
                );
              if (d.type === "enum" || d.type === "icon") {
                const options = [...new Set(d.type === "icon" ? [String((d.sample !== undefined ? d.sample : d.default) ?? ""), String(d.default ?? ""), ...iconChoices] : (d.options ?? []).map(String))];
                return (
                  <div className="cz" key={name} title={d.description}>
                    <span>{name}</span>
                    <Dropdown
                      label={name}
                      value={String(v ?? "")}
                      options={options}
                      icons={d.type === "icon"}
                      onChange={(o) => set(name, d.type === "enum" && typeof d.options?.[0] === "number" ? Number(o) : o)}
                    />
                  </div>
                );
              }
              return (
                <label className="cz" key={name} title={d.description}>
                  <span>{name}</span>
                  <input
                    type={d.type === "number" ? "number" : "text"}
                    value={v == null ? "" : String(v)}
                    placeholder={d.type === "number" ? "0" : "empty"}
                    onChange={(e) => set(name, d.type === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value)}
                  />
                </label>
              );
            })}
          </div>
        </form>
      )}
    </DefaultsProvider>
  );
}
