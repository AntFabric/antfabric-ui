/**
 * Every component as data, at `/components.json` on the built site. It is `packages/docs/components.json`
 * (`pnpm tokens:build`), which `pnpm check` keeps equal to this output.
 */

import type { APIRoute } from "astro";
import { componentsJson } from "../../scripts/agent-surface";

export const GET: APIRoute = () => new Response(componentsJson(), { headers: { "Content-Type": "application/json; charset=utf-8" } });
