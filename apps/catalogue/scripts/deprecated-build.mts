/**
 * Writes `packages/core/src/deprecated.gen.ts` from `packages/core/renames.json` alone, without loading the tokens. `pnpm tokens:build`
 * writes it too; this is for the moment the map has changed and the packages do not compile until the file has.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DEPRECATED_GEN, deprecatedGen } from "./deprecated-gen";

writeFileSync(fileURLToPath(new URL(`../../../${DEPRECATED_GEN}`, import.meta.url)), deprecatedGen());
console.log(`deprecated: wrote ${DEPRECATED_GEN}`);
