// Recipes for the messaging components: one file per component, listed here.
import { attachmentCard } from "./attachment-card";
import { composer } from "./composer";
import { message } from "./message";
import { messageActions } from "./message-actions";
import { messageDivider } from "./message-divider";
import { reactionPill } from "./reaction-pill";
import { swipeRow } from "./swipe-row";
import { threadSummary } from "./thread-summary";
import { typingIndicator } from "./typing-indicator";

export const messaging = { "attachment-card": attachmentCard, composer, message, "message-actions": messageActions, "message-divider": messageDivider, "reaction-pill": reactionPill, "swipe-row": swipeRow, "thread-summary": threadSummary, "typing-indicator": typingIndicator } as const;
