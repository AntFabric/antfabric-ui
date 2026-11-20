# Conventions pass: messaging, agent and ContextMenu (`reports/api/conventions.md`)

- Composer:
  - `value` / `onChange` → `value` / `onValueChange` (declared `changes: "value"`).
  - `tools` are `IconActionItem` (`ActionItem & { icon: string }`): the icon is required, and an action with no icon is no longer filtered out. `onAction` is given the `IconActionItem`.
  - A staged attachment passes every `Attachment` field to AttachmentCard (`typeLabel`, `title`, `domain`, `description`, `url`, `duration` too), as Message does: a staged link or voice note is drawn, not left empty.
  - New `onAttachmentOpen`, `onAttachmentDownload` (web and desktop), `onAttachmentCancel` and `onAttachmentRetry`, each given the `Attachment`. Today's staged chip fired nothing. Given `onAttachmentRetry`, the card follows the attachment's `status` instead of flipping itself to uploading.
- Message: the same four events (the phone has no `onAttachmentDownload`); `actions` are `IconActionItem`, `onAction` is given one.
- MessageActions: `actions` are `IconActionItem`, `onAction` is given one.
- ContextMenu:
  - `authorIdentity` → `identity`, `text` → `body`.
  - `reactions: { emoji, mine? }[]` → `quickReactions: string[]` and `picked: string[]`: `[{ emoji: "👍", mine: true }, { emoji: "❤️" }]` → `quickReactions={["👍", "❤️"]} picked={["👍"]}`.
  - `picked` was one emoji (or `"none"`, or `""` to follow the marks); it is now the person's own set. Pressing a reaction puts its emoji in or takes it out and calls `onReact`, so several can be yours at once. `ContextMenuReaction` is gone.
- QuestionPanel:
  - `collapsed` / `onCollapsedChange` → `expanded` / `onExpandedChange`, default inverted (`collapsed` false → `expanded` true; `collapsed` → `expanded={false}`).
  - Recipe part `bar` is gone: the folded panel is the `root` with `expanded` false (a recipe variant on `root`), so `styles.root` reaches it. `styles={{ bar }}` → `styles={{ root }}`; the phone's `testID` `question-panel.bar` → `question-panel.root`.
  - `title` is required and has no docs `default`; its catalogue value is its `sample` ("Approve this action?").
- ThinkingIndicator: `open` / `onOpenChange` → `expanded` / `onExpandedChange` (default `true` as before).
- ReactionPill `emoji` and ThreadSummary `replyCount` are required: their docs `default` (`👍`, `4`) moved to `sample`.
- Not changed, for the lead: four events are declared `changes: "<prop>"` under another name (AttachmentCard and Message `onRetry` for `status`, ThreadSummary `onPress` for `following`, ReactionPill `onPress` for `mine`), so the machine check for rule 1 (`change-event-name`) will list them. They are action-named on purpose, as `conventions.md` keeps Message `onOpenThread`.
