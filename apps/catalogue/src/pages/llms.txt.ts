/**
 * The entry point for an agent, at `/llms.txt` on the built site: what the library is, the two JSON files, the
 * authoring rules and the component to copy. It is `llms.txt` at the repository root (`pnpm tokens:build`), which
 * `pnpm check` keeps equal to this output.
 */

import type { APIRoute } from "astro";
import { llmsTxt } from "../../scripts/agent-surface";

export const GET: APIRoute = () => new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
