import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import * as lucide from "lucide-react";
import { pascal } from "@antfabric-ui/core";

/** A lucide glyph by kit name, looked up among the package's exports the way the React kit does, so renamed icons keep their old names. */
function Glyph({ name }: { name: string }) {
  const Svg = (lucide as unknown as Record<string, ComponentType<{ size?: number; strokeWidth?: number }>>)[pascal(name)];
  return <span className="dd-glyph">{Svg ? <Svg size={14} strokeWidth={2} /> : null}</span>;
}

export interface DropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  /** What the empty option reads as. */
  empty?: string;
  /** Draw each option's lucide glyph beside its name. */
  icons?: boolean;
  label: string;
}

const GAP = 6;
const MAX = 288;

/**
 * The catalogue's own select. A native `<select>` opens the OS's menu, which on macOS is a dark
 * sheet over the page that no stylesheet reaches; this one is a button and a listbox drawn in the
 * page's palette. The list is `position: fixed` from the trigger's rect, so no card clips it, and it
 * opens upward when there is no room below.
 */
export function Dropdown({ value, options, onChange, empty = "none", icons = false, label }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number; max: number }>();
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const id = useId();
  const name = (o: string) => (o === "" ? empty : o);

  const place = () => {
    const r = trigger.current?.getBoundingClientRect();
    if (!r) return;
    const below = innerHeight - r.bottom - GAP - 8;
    const above = r.top - GAP - 8;
    const up = below < Math.min(MAX, 180) && above > below;
    const width = Math.max(r.width, 180);
    const left = Math.min(r.right - width, innerWidth - width - 8);
    setPos(up ? { left: Math.max(8, left), bottom: innerHeight - r.top + GAP, width, max: Math.min(MAX, above) } : { left: Math.max(8, left), top: r.bottom + GAP, width, max: Math.min(MAX, below) });
  };

  const show = () => {
    setActive(Math.max(0, options.indexOf(value)));
    place();
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };
  const pick = (i: number) => {
    onChange(options[i]!);
    close();
  };

  useLayoutEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!list.current?.contains(t) && !trigger.current?.contains(t)) close(false);
    };
    const move = (e: Event) => {
      if (e.target instanceof Node && list.current?.contains(e.target)) return;
      place();
    };
    addEventListener("pointerdown", outside, true);
    addEventListener("scroll", move, true);
    addEventListener("resize", move);
    return () => {
      removeEventListener("pointerdown", outside, true);
      removeEventListener("scroll", move, true);
      removeEventListener("resize", move);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    const step: Record<string, () => number> = {
      ArrowDown: () => Math.min(last, active + 1),
      ArrowUp: () => Math.max(0, active - 1),
      Home: () => 0,
      End: () => last,
      PageDown: () => Math.min(last, active + 8),
      PageUp: () => Math.max(0, active - 8),
    };
    if (step[e.key]) {
      e.preventDefault();
      setActive(step[e.key]!());
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      close(e.key === "Escape");
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      // Typing jumps to the first option that starts with what was typed in the last half second.
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 500 ? typed.current.text : "") + e.key.toLowerCase(), at: now };
      const hit = options.findIndex((o) => name(o).toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="dd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-label={`${label}: ${name(value)}`}
        onClick={() => (open ? close() : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            show();
          }
        }}
      >
        {icons && value !== "" && <Glyph name={value} />}
        <span className={`dd-value${value === "" ? " none" : ""}`}>{name(value)}</span>
        <svg className="dd-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
        </svg>
      </button>
      {open && pos && (
        <div
          ref={list}
          id={`${id}-list`}
          className={`dd-list${pos.bottom !== undefined ? " up" : ""}`}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-o${active}`}
          style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: pos.max }}
          onKeyDown={onKey}
        >
          {options.map((o, i) => (
            <div
              key={o}
              id={`${id}-o${i}`}
              data-i={i}
              role="option"
              aria-selected={o === value}
              className={`dd-opt${i === active ? " active" : ""}`}
              onPointerMove={() => i !== active && setActive(i)}
              onClick={() => pick(i)}
            >
              {icons && (o === "" ? <span className="dd-glyph" /> : <Glyph name={o} />)}
              <span className={o === "" ? "none" : undefined}>{name(o)}</span>
              {o === value && (
                <svg className="dd-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
