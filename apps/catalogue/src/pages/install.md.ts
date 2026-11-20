/**
 * The install guide for an agent, at `/install.md` on the built site: `CONSUMING.md` at the repository
 * root, byte for byte. `/install` draws the same file for a person.
 */

import type { APIRoute } from "astro";
import consuming from "../../../../CONSUMING.md?raw";

export const GET: APIRoute = () => new Response(consuming, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
