/**
 * `@antfabric-ui/react/chat`: one opinionated conversation idiom, a Slack-style thread of messages and the box that writes them. Not part of
 * the root entry, which stays the generic set a product composes its own screens from. The same name, `@antfabric-ui/react-native/chat`, is
 * the phone's.
 *
 * It holds Message, MessageActions, Composer, ReactionPill, ThreadSummary, TypingIndicator and MessageDivider
 * (`../components/messaging/*`, and MessageActions on the web only). AttachmentCard, Fab and the agent components stay in the root: an ERP
 * approves an agent's proposal without a conversation. Their files stay in their category folders; a component moves here by its line being
 * added below and taken out of its category's `index.ts` (`../components/messaging`). `pnpm check code` holds the boundary: nothing
 * outside this folder imports a file this entry re-exports, or this entry, so the root can never reach the chat.
 */

export * from "../components/messaging/message";
export * from "../components/messaging/message-actions";
export * from "../components/messaging/composer";
export * from "../components/messaging/reaction-pill";
export * from "../components/messaging/thread-summary";
export * from "../components/messaging/typing-indicator";
export * from "../components/messaging/message-divider";
