# Notifications (AppBadge, OsNotification, TrayMenu now in `/shell`; the rest in the root)

- AppBadge: `<AppBadge count={n} />` → `<AppBadge appName="Acme" mark={acmeMark} count={n} />` (import from `/shell`; `ANTFABRIC_MARK` is no longer in core).
- PermissionPrompt: no prop change; copy through `strings["permission-prompt"]`; pass `origin` on the web.
- NotificationSchedule: `tomorrowAt="9:00"` → an option with `detail: "9:00"`; pass `options` and `note`; `onPause(duration)` → `onPause(key)`.
- InAppBanner: `kind="mention" channel="#x"` → `lead="Mentioned you" context="#x" replyable actions={[{ key: "read", label: "Mark as read", dismiss: true }]}`; `kind="meeting"` → `leading="tile" icon="video" actions={[{ key: "join", label: "Join", icon: "video", variant: "soft" }]}`; dismiss reason `"read"` → `"action"`; Join and Review arrive at `onAction`, not `onOpen`; `time` no longer defaults to "now"; recipe part `channel` → `context`.
- NotificationItem: `actor` → `sender`; `preview` → `body`; `kind="thread"` → `icon="message-square-reply" lead="Replied in a thread"`; `kind="agent-approval"` → `agent icon="shield-question" approval="pending"`; `kind="meeting"` / `"recording"` → `leading="tile"` plus the icon; recipe part `preview` → `body`.
- OsNotification: `kind="dm" onAction={(verb, text) => …}` → `appName="Acme" actions={[{ key: "reply", label: "Reply", reply: true }, { key: "read", label: "Mark as read", rest: true }]} onAction={(a, text) => …}`; `channel` → `context`; `time` no longer defaults to "now" (import from `/shell`).
- TrayMenu: `<TrayMenu recorder="recording" elapsed="0:12" unread={3} />` → `<TrayMenu appName="Acme" tone="live" statusText="Recording 0:12" items={[…]} onSelect={…} />` (import from `/shell`); recipe variant `recorder` → `tone`.
