/**
 * The migration guide for an agent, at `/migrate.md` on the built site: `MIGRATION.md` at the repository
 * root, byte for byte. `/migrate` draws the same file for a person.
 */

import type { APIRoute } from "astro";
import migration from "../../../../MIGRATION.md?raw";

export const GET: APIRoute = () => new Response(migration, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
