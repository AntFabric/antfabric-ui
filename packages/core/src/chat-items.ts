/**
 * The shapes the conversation and agent components draw from data: a person, a reaction, an attachment, an agent's step, a gated tool
 * call's argument, an answer row, a decision routed to a person. Like `items.ts` they live here once and each kit re-exports them as types
 * from its root (`import type { Reaction } from "@antfabric-ui/react"`). Items carry no functions: data stays serialisable, so a server or
 * a plugin can produce it. A kit keeps a component-named type only where a component has one, derived from these; it never copies a shape.
 */

/** Which colour family a face without a photo takes, or the agent's own. MOVED from both kits' display/avatar.tsx; unchanged values. */
export type AvatarIdentity = "ink" | "indigo" | "green" | "ochre" | "red" | "agent";

/** A person's presence dot. MOVED from both kits' display/avatar.tsx; unchanged values. */
export type AvatarPresence = "none" | "active" | "away" | "dnd" | "offline";

/** Someone who wrote, replied or reacted. ThreadSummary's participants; the base of every face a chat component draws. */
export interface Person {
  name: string;
  identity?: AvatarIdentity;
  src?: string;
  /** An AI agent: the agent face, never mistaken for a colleague. The product sets the flag; the kit never decides who is one. */
  agent?: boolean;
  presence?: AvatarPresence;
}

/** One reaction on a message, in first-reacted order. Keyed by emoji: one entry per emoji. */
export interface Reaction {
  emoji: string;
  /** Server-owned. A reaction at 0 is removed, never drawn. */
  count: number;
  mine?: boolean;
  /** Who reacted, as one sentence the product writes in its locale: "You, Marcus Chen and Aisha Bello reacted". */
  reactors?: string;
}

/** A file, image, link preview or voice note on a message or staged in a composer. AttachmentCard's data props. */
export interface Attachment {
  /** What a list keys on; falls back to `name ?? url` plus the index. */
  key?: string;
  kind?: "file" | "image" | "link" | "voice";
  name?: string;
  /** The badge's colour family: the component's palette, not product content, so it stays closed. */
  fileType?: "pdf" | "doc" | "sheet" | "deck" | "image" | "video" | "audio" | "archive" | "code" | "other";
  badge?: string;
  typeLabel?: string;
  size?: string;
  status?: "ready" | "uploading" | "paused" | "failed";
  progress?: number;
  src?: string;
  title?: string;
  domain?: string;
  description?: string;
  url?: string;
  duration?: string;
}

/** One step an agent took: a tool call, a plugin action. AgentSteps and ThinkingIndicator draw it. */
export interface AgentStep {
  key: string;
  /** As a person reads it: "Recent messages", never `recent_messages`. */
  label: string;
  /** Where it ran, drawn "via {source}": an MCP server, a plugin, an integration. */
  source?: string;
  state: "running" | "done" | "failed";
}

/** One argument of a tool call an agent wants to make, printed whole as plain text. */
export interface ToolArg {
  name: string;
  value: string;
}

/** One answer row of an agent's question. */
export interface QuestionOption {
  key: string;
  label: string;
  detail?: string;
}

/** A decision routed to a person: an agent's proposal, a plugin's request, an external ticket. ApprovalItem's data props. */
export interface Approval {
  key?: string;
  subject: string;
  context?: string;
  /** The tag's words: "Agent", "Purchase orders", "Jira"; "" draws no tag. */
  source?: string;
  /** An agent proposed it: the tag takes the brand tone. */
  agent?: boolean;
  /** The source's own id, drawn beside the tag: "PO-4821", "PROJ-217". */
  reference?: string;
  amount?: string;
  requestedBy?: string;
  time?: string;
  status?: "pending" | "question" | "approved" | "rejected";
  decidedBy?: string;
  /** Pending: deciding asks the person to confirm it is them. Decided: it was confirmed that way. */
  verify?: boolean;
}
