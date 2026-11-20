import type { OnlyOn, StringGroups } from "./index";

/** Built-in text of the `display` components, keyed by component id. See `strings/index.ts`. */
export const display = {
  avatar: {
    /** The avatar's accessible name when it shows a presence dot: the name, then the presence word. */
    labelWithPresence: "{name}, {presence}",
    /** The presence word a screen reader hears for the green dot. */
    presenceActive: "active",
    /** The presence word for the away dot. */
    presenceAway: "away",
    /** The presence word for the do-not-disturb dot. */
    presenceDnd: "do not disturb",
    /** The presence word for the offline ring. */
    presenceOffline: "offline",
  },
  "avatar-stack": {
    /** The stack's accessible name: how many people it stands for. */
    people: { one: "{count} person", other: "{count} people" },
    /** The accessible name of the +N chip: how many faces are not drawn. */
    more: "and {hidden} more",
  },
  badge: {
    /** The accessible name of a dot badge. */
    newActivity: "New activity",
    /** The accessible name of a number badge that has a `label`: the count, then what it counts. */
    countWithLabel: "{count} {label}",
    /** The accessible name of a number badge with no `label` of its own and `unread` set. */
    countUnread: "{count} unread",
    /** The accessible name of a number badge with no `label` and no `unread`: the count alone. */
    count: "{count}",
  },
  card: {
    /** The label of the card's long-press action in the screen reader's actions menu (phone, when the card has `onLongPress`). */
    select: "Select",
  },
  kbd: {
    /** How a screen reader says the Command key. */
    command: "Command",
    /** How a screen reader says the Control key. */
    control: "Control",
    /** How a screen reader says the Option key. */
    option: "Option",
    /** How a screen reader says the Alt key. */
    alt: "Alt",
    /** How a screen reader says the Shift key. */
    shift: "Shift",
    /** How a screen reader says the Return key (a Mac's name for Enter). */
    return: "Return",
    /** How a screen reader says the Enter key. */
    enter: "Enter",
    /** How a screen reader says the Escape key. */
    escape: "Escape",
    /** How a screen reader says the Tab key. */
    tab: "Tab",
    /** How a screen reader says the Delete key. */
    delete: "Delete",
    /** How a screen reader says the Backspace key. */
    backspace: "Backspace",
    /** How a screen reader says the Space key. */
    space: "Space",
    /** How a screen reader says the up arrow key. */
    up: "Up Arrow",
    /** How a screen reader says the down arrow key. */
    down: "Down Arrow",
    /** How a screen reader says the left arrow key. */
    left: "Left Arrow",
    /** How a screen reader says the right arrow key. */
    right: "Right Arrow",
  },
  "list-item": {
    /** The row's accessible name when it has a subtitle: the title, then the subtitle. */
    withSubtitle: "{title}, {subtitle}",
    /** The row's accessible name when it has a `detail` (a value, a time, a size): what it said so far, then the detail. */
    withDetail: "{label}, {detail}",
    /** The row's accessible name when its count badge is drawn: what it said so far, then the count. */
    withUnreadCount: "{label}, {count} unread",
    /** The row's accessible name when it is unread with no count. */
    withUnread: "{label}, unread",
    /** The label of the row's long-press action in the screen reader's actions menu (phone, when the row has `onLongPress`). */
    longPress: "More actions",
  },
} as const satisfies StringGroups;

/** Keys one kit alone reads (`pnpm check strings`): the phone's long-press actions have no web counterpart. */
export const displayOnly = { card: { select: ["mobile"] }, "list-item": { longPress: ["mobile"] } } as const satisfies OnlyOn<typeof display>;
