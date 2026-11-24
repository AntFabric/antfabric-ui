/**
 * How tokens are named, at `/naming.json` on the built site: the grammar, the fixed words and what each means, and every group with its
 * tier and owners. It is `packages/core/naming.json` (`pnpm tokens:build`), which `pnpm check names` keeps equal to this output.
 */

import type { APIRoute } from "astro";
import { namingJson } from "@antfabric/ui-core";

export const GET: APIRoute = () => new Response(namingJson(), { headers: { "Content-Type": "application/json; charset=utf-8" } });
