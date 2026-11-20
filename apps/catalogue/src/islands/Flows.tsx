import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { MOTION, type Platform } from "@antfabric-ui/core";
import type { Flow, FlowFrame, FlowStep, FlowStepKind } from "@antfabric-ui/docs";
import { osOf, usePrefs } from "../lib/prefs";
import { DefaultsProvider, SceneNode, Stage, Thing } from "../preview/kit";
import { pressTarget } from "../preview/press";

const KIND_LABEL = { data: "Data", trigger: "Action", event: "Event", state: "State", effect: "Side effect", motion: "Motion", result: "Result" } as const;

/**
 * Who each step belongs to: the swimlanes of the flowchart. A flow starts with the person (or the
 * data the screen loads), runs through the component, the app's state and the server or OS, and ends
 * with the person again, seeing the result.
 */
const LANES: { id: string; label: string; hint: string; kinds: FlowStepKind[] }[] = [
  { id: "person", label: "Person", hint: "What they do, and what they see", kinds: ["trigger", "result"] },
  { id: "component", label: "Component", hint: "Its events and motion", kinds: ["event", "motion"] },
  { id: "app", label: "App state", hint: "Where props come from, what changes", kinds: ["data", "state"] },
  { id: "system", label: "Server · OS", hint: "Requests, navigation, OS calls", kinds: ["effect"] },
];
const laneOf = (step: FlowStep) => (step.lane ? LANES.findIndex((l) => l.id === step.lane) : LANES.findIndex((l) => l.kinds.includes(step.kind)));

export interface FlowsProps {
  id: string;
  /** The component's name, for its lane. */
  name: string;
  platform: Platform;
  flows: Flow[];
  defaults: Record<string, Record<string, unknown>>;
}

/** Every flow of a component on one platform: a tab each when there are several. */
export default function Flows({ id, name, platform, flows, defaults }: FlowsProps) {
  const [tab, setTab] = useState(0);
  return (
    <DefaultsProvider value={defaults}>
      {flows.length > 1 && (
        <div className="tabs-bar" role="tablist">
          {flows.map((f, i) => (
            <button key={f.id} type="button" role="tab" aria-selected={i === tab} onClick={() => setTab(i)}>
              {f.title}
            </button>
          ))}
        </div>
      )}
      {flows.map((f, i) => (
        <FlowPanel key={f.id} id={id} name={name} platform={platform} flow={f} single={flows.length === 1} hidden={i !== tab} />
      ))}
    </DefaultsProvider>
  );
}

/** The frame a step shows: the last one that starts at or before it. */
function frameFor(frames: FlowFrame[], step: number) {
  let at = 0;
  frames.forEach((f, i) => {
    if (f.step <= step) at = i;
  });
  return at;
}

interface Wire {
  d: string;
  head: string;
  /** Index of the step it leads into. */
  to: number;
}

/** A connector from one node's foot to the next node's head, with rounded elbows when it changes lane. */
function wire(a: DOMRect, b: DOMRect, origin: DOMRect, to: number): Wire {
  const x1 = a.left + a.width / 2 - origin.left;
  const y1 = a.bottom - origin.top;
  const x2 = b.left + b.width / 2 - origin.left;
  const y2 = b.top - origin.top - 1;
  const head = `M ${x2 - 4.5} ${y2 - 6} L ${x2} ${y2} L ${x2 + 4.5} ${y2 - 6}`;
  if (Math.abs(x2 - x1) < 1) return { d: `M ${x1} ${y1} V ${y2}`, head, to };
  const mid = (y1 + y2) / 2;
  const r = Math.min(10, Math.abs(x2 - x1) / 2, (y2 - y1) / 2);
  const dir = x2 > x1 ? 1 : -1;
  const d = `M ${x1} ${y1} V ${mid - r} Q ${x1} ${mid} ${x1 + dir * r} ${mid} H ${x2 - dir * r} Q ${x2} ${mid} ${x2} ${mid + r} V ${y2}`;
  return { d, head, to };
}

function FlowPanel({ id, name, platform, flow, single, hidden }: { id: string; name: string; platform: Platform; flow: Flow; single: boolean; hidden: boolean }) {
  const prefs = usePrefs();
  const { os, osVersion } = osOf(prefs, platform);
  const steps = flow.steps.map((s, i) => ({ s, i })).filter(({ s }) => !s.platforms || s.platforms.includes(platform));
  const frames = (flow.replay ?? []).filter((fr) => !fr.platforms || fr.platforms.includes(platform));
  const lanes = LANES.filter((_, li) => steps.some(({ s }) => laneOf(s) === li));
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mount, setMount] = useState(0);
  const [wires, setWires] = useState<Wire[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const chart = useRef<HTMLDivElement>(null);
  const step = steps[pos]!;
  const frame = frames.length ? frames[frameFor(frames, step.i)] : undefined;

  // Play: hold each step long enough to read — the frame's own `hold` where one starts, else 1.4s.
  useEffect(() => {
    if (!playing) return;
    const starts = frames.find((f) => f.step === step.i);
    const timer = setTimeout(() => {
      if (pos >= steps.length - 1) setPlaying(false);
      else setPos(pos + 1);
    }, starts?.hold ?? 1400);
    return () => clearTimeout(timer);
  }, [playing, pos]); // eslint-disable-line react-hooks/exhaustive-deps

  // The connectors are drawn from where the nodes actually landed, and again whenever the chart resizes.
  useLayoutEffect(() => {
    const grid = chart.current;
    if (!grid || hidden) return;
    const draw = () => {
      const origin = grid.getBoundingClientRect();
      const nodes = Array.from(grid.querySelectorAll<HTMLElement>("[data-node]")).map((n) => n.getBoundingClientRect());
      setWires(nodes.slice(1).map((b, k) => wire(nodes[k]!, b, origin, k + 1)));
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [hidden, steps.length, platform]);

  // A frame that starts on this step and names a press: a tap mark where the finger lands.
  useLayoutEffect(() => {
    const f = frames.find((fr) => fr.step === step.i);
    if (f?.press === undefined || !stage.current) return;
    const canvas = stage.current;
    const raf = requestAnimationFrame(() => {
      const hit = pressTarget(canvas, f.press!);
      if (!hit) return;
      const a = canvas.getBoundingClientRect();
      const b = hit.getBoundingClientRect();
      const tap = document.createElement("span");
      tap.className = "flow-tap";
      tap.style.left = `${b.left - a.left + canvas.scrollLeft + b.width / 2}px`;
      tap.style.top = `${b.top - a.top + canvas.scrollTop + b.height / 2}px`;
      canvas.appendChild(tap);
      // On web and desktop, the control's own pressed look: a pointer press, released before the
      // next frame (a click never fires, so nothing acts). React Native Web would treat it as a tap.
      const real = platform !== "mobile";
      if (real) hit.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
      setTimeout(() => {
        if (real) hit.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, button: 0 }));
        tap.remove();
      }, 420);
    });
    return () => cancelAnimationFrame(raf);
  }, [pos, mount]); // eslint-disable-line react-hooks/exhaustive-deps

  // A scene wider than its stage scales down to fit.
  useLayoutEffect(() => {
    const canvas = stage.current;
    const root = canvas?.querySelector<HTMLElement>("[data-preview-root]");
    if (!canvas || !root) return;
    const fit = () => {
      root.style.zoom = "1";
      const pad = getComputedStyle(canvas);
      const room = canvas.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
      if (root.scrollWidth > room) root.style.zoom = String(Math.max(0.4, room / root.scrollWidth));
    };
    fit();
    const t = setTimeout(fit, 450);
    addEventListener("resize", fit);
    return () => {
      clearTimeout(t);
      removeEventListener("resize", fit);
    };
  }, [pos, mount, hidden, frame]);

  // While playing, keep the step being played in view in the chart.
  useEffect(() => {
    if (!playing || hidden) return;
    const node = chart.current?.querySelector<HTMLElement>('[aria-current="step"]');
    const r = node?.getBoundingClientRect();
    if (node && r && (r.top < 120 || r.bottom > innerHeight - 40)) {
      node.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }, [pos, hidden, playing]);

  const go = (to: number) => {
    setPlaying(false);
    setPos(Math.max(0, Math.min(steps.length - 1, to)));
  };
  const play = () => {
    if (playing) return setPlaying(false);
    if (pos >= steps.length - 1 || pos === 0) {
      setPos(0);
      setMount((m) => m + 1);
    }
    setPlaying(true);
  };

  const columns = { gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))` } as CSSProperties;

  return (
    <div className="flow-panel" hidden={hidden} data-playing={playing || undefined}>
      {single && <h3 className="flow-title">{flow.title}</h3>}
      {flow.description && <p className="flow-desc">{flow.description}</p>}
      <div className="flow-body">
        <div className="flow-chart">
          <div className="flow-lanes" style={columns}>
            {lanes.map((l) => (
              <div className="flow-lane-head" key={l.id} data-lane={l.id}>
                <b>{l.id === "component" ? name : l.label}</b>
                <span>{l.id === "component" ? "Component · its events and motion" : l.hint}</span>
              </div>
            ))}
          </div>
          <div className="flow-grid" style={columns} ref={chart}>
            {lanes.map((l, li) => (
              <div key={l.id} className="flow-lane-band" data-lane={l.id} style={{ gridColumn: li + 1, gridRow: `1 / ${steps.length + 1}` }} />
            ))}
            <svg className="flow-wires" aria-hidden="true">
              {wires.map((w) => (
                <g key={w.to} className={w.to === pos ? "is-active" : w.to < pos ? "is-done" : undefined}>
                  <path d={w.d} />
                  <path d={w.head} />
                </g>
              ))}
            </svg>
            {steps.map(({ s, i }, n) => (
              <button
                key={i}
                type="button"
                data-node
                className="flow-node"
                data-kind={s.kind}
                data-state={n < pos ? "done" : n > pos ? "next" : undefined}
                aria-current={n === pos ? "step" : undefined}
                style={{ gridRow: n + 1, gridColumn: lanes.indexOf(LANES[laneOf(s)]!) + 1 }}
                onClick={() => go(n)}
              >
                <span className="flow-kind">
                  <span className="n">{n + 1}</span>
                  {KIND_LABEL[s.kind]}
                </span>
                <span className="flow-node-title">{s.title}</span>
                {s.code && (
                  <code className="flow-node-code">
                    <span>{s.code}</span>
                  </code>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flow-side">
          {frame && (
            <div className="flow-stage">
              <div className="canvas plain flow-canvas" data-af-platform={platform} data-af-theme={prefs.scheme} ref={stage}>
                <div data-preview-root style={flow.width ? ({ "--w": `${flow.width}px` } as CSSProperties) : undefined}>
                  <div className="w">
                    <Stage autoFocus={false} key={mount} platform={platform} os={os} osVersion={osVersion} scheme={prefs.scheme}>
                      {frame.scene ? <SceneNode scene={frame.scene} platform={platform} /> : <Thing id={id} platform={platform} props={frame.props} />}
                    </Stage>
                  </div>
                </div>
              </div>
              <div className="flow-controls">
                <button type="button" className="flow-play" onClick={play}>
                  {playing ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="4.5" width="4" height="15" rx="1" />
                      <rect x="14" y="4.5" width="4" height="15" rx="1" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M7 4.5v15l13-7.5z" />
                    </svg>
                  )}
                  <span>{playing ? "Pause" : "Play"}</span>
                </button>
                <button type="button" className="flow-nav" aria-label="Previous step" onClick={() => go(pos - 1)}>
                  <Chevron dir="left" />
                </button>
                <span className="flow-count">
                  Step {pos + 1} of {steps.length}
                </span>
                <button type="button" className="flow-nav" aria-label="Next step" onClick={() => go(pos + 1)}>
                  <Chevron dir="right" />
                </button>
              </div>
            </div>
          )}
          <div className="flow-detail" data-kind={step.s.kind} key={pos}>
            <span className="flow-kind">
              <span className="n">{pos + 1}</span>
              {KIND_LABEL[step.s.kind]} · {LANES[laneOf(step.s)]!.id === "component" ? name : LANES[laneOf(step.s)]!.label}
            </span>
            <h3>{step.s.title}</h3>
            {step.s.detail && <p>{step.s.detail}</p>}
            {step.s.code && (
              <pre className="flow-code">
                <code>{step.s.code}</code>
              </pre>
            )}
            {step.s.enter && MOTION[step.s.enter] && (
              <dl className="kv flow-motion">
                <dt>Motion</dt>
                <dd>
                  {MOTION[step.s.enter].label}: from {MOTION[step.s.enter].from}, {MOTION[step.s.enter].duration}ms, {MOTION[step.s.enter].easing}
                </dd>
                <dt>{platform === "mobile" ? "React Native" : "React"}</dt>
                <dd>
                  <code className="mono">{platform === "mobile" ? `<Enter motion="${step.s.enter}">  // ${MOTION[step.s.enter].native}` : `style={enter("${step.s.enter}")}`}</code>
                </dd>
              </dl>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}
