/**
 * The Architecture page's worked example, built with the site: per component, what each kit's file
 * reads and hard-codes (`src/lib/inspect.ts`). About 360 KB, so the `ComponentInspector` island
 * fetches it once it is on screen instead of the page carrying it.
 */

import type { APIRoute } from "astro";
import { inspectorData } from "../lib/inspect";
import { repoRoot, scan } from "../lib/scan";

export const GET: APIRoute = () => {
  const root = repoRoot();
  return new Response(JSON.stringify(inspectorData(root, scan(root))), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
