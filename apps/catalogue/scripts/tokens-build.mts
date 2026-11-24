/**
 * `pnpm tokens:build`: writes the files agents and tools read, from the source of truth:
 *
 *   packages/core/tokens.json        the design tokens in the W3C Design Tokens format (`packages/core/src/dtcg.ts`)
 *   packages/docs/components.json    every component's props, parts, recipe, a11y and examples (`scripts/agent-surface.ts`)
 *   llms.txt                         the entry point for an agent: what the library is, where the data is, the rules
 *
 * All three are committed; `pnpm check` fails when one differs from what this would write.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tokensJson } from "@antfabric/ui-core/dtcg";
import { namingJson } from "@antfabric/ui-core";
import { componentsJson, llmsTxt } from "./agent-surface";
import { DEPRECATED_GEN, deprecatedGen } from "./deprecated-gen";

const root = (p: string) => fileURLToPath(new URL(`../../../${p}`, import.meta.url));
const kb = (s: string) => `${(s.length / 1024).toFixed(0)} KB`;

for (const [path, text] of [
  [DEPRECATED_GEN, deprecatedGen()],
  ["packages/core/tokens.json", tokensJson()],
  ["packages/core/naming.json", namingJson()],
  ["packages/docs/components.json", componentsJson()],
  ["llms.txt", llmsTxt()],
] as const) {
  writeFileSync(root(path), text);
  console.log(`tokens: wrote ${path} (${kb(text)})`);
}
