/**
 * The design tokens as a W3C Design Tokens file, at `/tokens.json` on the built site. It is
 * `packages/core/tokens.json` (`pnpm tokens:build`), which `pnpm check` keeps equal to this output.
 */

import type { APIRoute } from "astro";
import { tokensJson } from "@antfabric-ui/core/dtcg";

export const GET: APIRoute = () => new Response(tokensJson(), { headers: { "Content-Type": "application/json; charset=utf-8" } });
