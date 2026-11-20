/**
 * The call site for the playground's current props: what an app writes to get this preview. The
 * props API is the same on every platform; only the import differs.
 */

import { pascal, type Platform } from "@antfabric/ui-core";
import type { ComponentDocs } from "@antfabric/ui-docs";

/** `item: MenuItem, opts: { a: string }` → `["item", "opts"]`: the names, split at top-level commas. */
function paramNames(args: string): string[] {
  const names: string[] = [];
  let depth = 0;
  let buf = "";
  for (const c of `${args},`) {
    if ("{[(<".includes(c)) depth++;
    else if ("}])>".includes(c)) depth--;
    if (c === "," && depth === 0) {
      const name = buf.split(/[?:]/)[0]!.trim();
      if (name) names.push(name);
      buf = "";
    } else buf += c;
  }
  return names;
}

const jsx = (v: unknown) => (typeof v === "string" ? JSON.stringify(v) : `{${JSON.stringify(v)}}`);

export function usage(doc: ComponentDocs, props: Record<string, unknown>, platform: Platform): string {
  const name = pascal(doc.id);
  const p = doc.platforms[platform];
  if (p.status === "not-applicable") return `// ${doc.name} is not part of the ${platform} kit.\n// Instead: ${p.alternative}`;
  const attrs: string[] = [];
  // The preview draws every prop's `sample` (AntFabric's showcase) under the props given, so the call site writes them too: an app gets
  // the component's `default`, which is what a value is left out for.
  const samples = Object.fromEntries(Object.entries(doc.props).filter(([, d]) => d.sample !== undefined).map(([k, d]) => [k, d.sample]));
  for (const [k, v] of Object.entries({ ...samples, ...props })) {
    const def = doc.props[k];
    if (!def || def.type === "event" || def.type === "node") continue;
    if (def.platforms && !def.platforms.includes(platform)) continue;
    if (v === def.default && !def.required) continue;
    if (v === "" || v === undefined || v === null) continue;
    if (v === true) attrs.push(k);
    else if (v === false) attrs.push(`${k}={false}`);
    else attrs.push(`${k}=${jsx(v)}`);
  }
  const events = Object.entries(doc.props)
    .filter(([, d]) => d.type === "event" && (!d.platforms || d.platforms.includes(platform)))
    .map(([k, d]) => `${k}={(${paramNames(d.args ?? "").join(", ")}) => {}}`);
  const all = [...attrs, ...events];
  const tag = all.length > 2 ? `<${name}\n  ${all.join("\n  ")}\n/>` : `<${name}${all.length ? ` ${all.join(" ")}` : ""} />`;
  // The data components ship from the kit's `/data` subpath, not its root.
  const from = `${platform === "mobile" ? "@antfabric/ui-react-native" : "@antfabric/ui-react"}${doc.category === "data" ? "/data" : ""}`;
  return `import { ${name} } from "${from}";\n\n${tag}`;
}
