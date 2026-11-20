# Messaging (seven now in `/chat`; AttachmentCard and SwipeRow stay in the root)

- MessageDivider, TypingIndicator, ReactionPill: no prop change; import from `/chat`.
- ThreadSummary: `ThreadSummaryParticipant` → core `Person`; import from `/chat`.
- AttachmentCard: no prop change; types derive from core `Attachment`.
- MessageActions: `canReact` → `addReaction`, `canReplyInThread` → `replyInThread`, `canForward` → `forward`, `hasMore` → `more`, `onMore` → `onMenuOpenChange`; all default `false`, `quickReactions` defaults `[]` (the old bar: `quickReactions={["👍","✅","👀"]} addReaction replyInThread forward more`); new `actions` / `onAction`.
- SwipeRow: `context="notification" onMarkRead onClear` → `icon="at-sign" actions={[{ key: "read", label: "Mark {title} read", text: "Mark read", unreadOnly: true }, { key: "clear", label: "Clear {title}", text: "Clear", tone: "danger" }]} onAction`; `context="history"` → `dense` plus Rename and Delete items; `glyph` → `icon`; `open` and `unread` default `false`; a danger action leaves the row open; the product sets `unread={false}` (no local flip).
- Composer: `showFormatting` → `formatting` (off by default); the old tool row: `attach emoji mention commands` (and `record` on the phone); new `onEmoji`, `onMention`, `onCommands`, `onFormat`, `onFormatting`; `ComposerAttachment` → `Attachment`; `placeholder`, `alsoSendTo` default `""` (from strings); locked notices' wording through `strings.composer`.
- Message: `MessageReaction` → `Reaction`, `MessageAttachment` → `Attachment`; the old web bar: `quickReactions={["👍","✅","👀"]} addReaction replyInThread forward more` plus `onReact`, `onAddReaction`, `onForward`, `onMenuOpenChange`; phone: `addReaction` keeps the add pill; an empty bar is not drawn; new `actions` / `onAction`.
