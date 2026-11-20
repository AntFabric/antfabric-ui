import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const packages = fileURLToPath(new URL("../../../packages/", import.meta.url));

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files: Record<string, string[]> = {};

/** A component's source in a kit: `packages/<kit>/src/components/<category>/<id>.tsx`. */
export function sourceFile(kit: "react" | "react-native", id: string): string | null {
  files[kit] ??= walk(join(packages, kit, "src/components"));
  return files[kit]!.find((f) => f.endsWith(`/${id}.tsx`)) ?? null;
}
