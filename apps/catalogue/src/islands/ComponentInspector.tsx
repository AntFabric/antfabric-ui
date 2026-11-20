import { useEffect, useMemo, useState } from "react";
import type { InspectedComponent, InspectedFile, InspectorData } from "../lib/inspect";
import "../styles/inspector.css";

const STORE = "af-inspector-component";
const readStored = () => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(STORE);
  } catch {
    return null;
  }
};
const title = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

const KITS = [
  { key: "react", label: "React", sub: "web and desktop" },
  { key: "native", label: "React Native", sub: "mobile" },
] as const;

function Lines({ lines }: { lines: number[] }) {
  return <span className="insp-ln">{lines.length === 1 ? `line ${lines[0]}` : `lines ${lines.join(", ")}`}</span>;
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="insp-stat" data-warn={warn && value > 0 ? "true" : undefined}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** A colour literal's own value as a swatch, when the browser can parse it. */
const isColour = (v: string) => /^(#|rgb)/i.test(v);

function KitFile({ file }: { file: InspectedFile }) {
  const groups = Object.entries(file.tokens);
  const distinct = groups.reduce((n, [, list]) => n + list.length, 0);
  const colours = file.literals.filter((l) => l.kind === "colour").length;
  const dims = file.literals.length - colours;

  return (
    <>
      <dl className="insp-stats">
        <Stat label="Token reads" value={file.refs} />
        <Stat label="Distinct tokens" value={distinct} />
        <Stat label="Colour literals" value={colours} warn />
        <Stat label="Dimension literals" value={dims} warn />
        <Stat label="Platform branches" value={file.branches.length} />
      </dl>

      <section className="insp-sec" aria-label="Token reads">
        <h4>Tokens read, by group</h4>
        {groups.length === 0 && file.dynamic.length === 0 ? <p className="insp-none">Reads no tokens.</p> : null}
        {groups.map(([group, list]) => (
          <div className="insp-group" key={group}>
            <b>{group}</b>
            <ul>
              {list.map((p) => (
                <li key={p.path}>
                  <code>{p.path}</code>
                  <Lines lines={p.lines} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        {file.dynamic.length > 0 ? (
          <div className="insp-group">
            <b>computed</b>
            <ul>
              {file.dynamic.map((d) => (
                <li key={d.path}>
                  <code>{d.path}</code>
                  <Lines lines={d.lines} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="insp-sec" aria-label="Literals">
        <h4>Literals the component hard-codes</h4>
        {file.literals.length === 0 ? (
          <p className="insp-none">None.</p>
        ) : (
          <ul className="insp-lit">
            {file.literals.map((l, i) => (
              <li key={`${l.line}-${l.kind}-${l.value}-${i}`}>
                <span className="insp-ln">{l.line}</span>
                <span className="insp-what">
                  <span className="insp-kind" data-kind={l.kind}>{l.kind}</span>
                  {l.prop ? <code>{l.prop}</code> : null}
                  <span className="insp-val">
                    {l.kind === "colour" && isColour(l.value) ? <span className="insp-swatch" style={{ background: l.value }} aria-hidden="true" /> : null}
                    {l.value}
                  </span>
                </span>
                <code className="insp-src">{l.text}</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="insp-sec" aria-label="Platform branches">
        <h4>Platform branches</h4>
        {file.branches.length === 0 ? (
          <p className="insp-none">None: the same code runs on every platform this kit serves.</p>
        ) : (
          <ul className="insp-lit">
            {file.branches.map((b) => (
              <li key={b.line}>
                <span className="insp-ln">{b.line}</span>
                <code className="insp-src" style={{ gridColumn: 2 }}>{b.text}</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="insp-sec" aria-label="Sibling imports">
        <h4>Imports from inside the kit</h4>
        {file.imports.length === 0 ? (
          <p className="insp-none">None.</p>
        ) : (
          <ul className="insp-imports">
            {file.imports.map((im) => (
              <li key={im.from}>
                <code>{im.from}</code> <span className="faint">{im.names.join(", ")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** The Architecture page's worked example: pick a component, see what each kit's file reads and hard-codes. Its data is fetched from `src` (`/inspector.json`). */
export default function ComponentInspector({ src, initial }: { src: string; initial?: string }) {
  const [data, setData] = useState<InspectorData | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(src)
      .then((r) => (r.ok ? (r.json() as Promise<InspectorData>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => live && setData(d))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [src]);

  if (failed) return <p className="insp-none">The component data did not load. Reload the page to try again.</p>;
  if (!data) return <p className="insp-none">Loading the component data…</p>;
  return <Inspector data={data} initial={initial} />;
}

function Inspector({ data, initial }: { data: InspectorData; initial?: string }) {
  const has = (id: string | null | undefined): id is string => !!id && data.some((c) => c.id === id);
  const [id, setId] = useState<string>(() => (has(initial) ? initial : (data.find((c) => c.id === "button") ?? data[0])?.id ?? ""));

  // The remembered choice is read after mount so the first render matches the server's.
  useEffect(() => {
    const stored = readStored();
    if (!has(initial) && has(stored)) setId(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (next: string) => {
    setId(next);
    try {
      localStorage.setItem(STORE, next);
    } catch {
      /* private window or blocked storage: the choice just isn't remembered */
    }
  };

  const byCategory = useMemo(() => {
    const m = new Map<string, InspectedComponent[]>();
    for (const c of data) m.set(c.category, [...(m.get(c.category) ?? []), c]);
    return [...m];
  }, [data]);

  const current = data.find((c) => c.id === id);
  if (!current) return <p className="insp-none">No components.</p>;

  return (
    <div className="insp">
      <div className="insp-bar">
        <label htmlFor="insp-pick">Component</label>
        <select id="insp-pick" className="insp-select" value={id} onChange={(e) => pick(e.target.value)}>
          {byCategory.map(([category, list]) => (
            <optgroup label={title(category)} key={category}>
              {list.map((c) => (
                <option value={c.id} key={c.id}>{c.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="insp-docs">
          Docs: <code>{current.docs}</code>
        </span>
      </div>

      <div className="insp-kits">
        {KITS.map((kit) => {
          const file = current[kit.key];
          return (
            <article className="insp-kit" key={kit.key} aria-label={`${kit.label} kit`}>
              <header>
                <h3>
                  {kit.label} <span className="faint">({kit.sub})</span>
                </h3>
                {file ? <code className="insp-file">{file.file}</code> : null}
              </header>
              {file ? (
                <KitFile file={file} />
              ) : (
                <p className="insp-missing">
                  {current.name} has no file in the {kit.label} kit: it is not on {kit.sub}.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
