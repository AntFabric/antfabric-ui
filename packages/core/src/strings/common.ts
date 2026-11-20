import type { StringGroup } from "./index";

/**
 * Words several components say the same way ("Close", "Dismiss", "Cancel"). A component's `s(key)` falls back to a key here when it has
 * none of its own by that name, so a product that translates "Close" once changes it everywhere. Each English default is the word the
 * kits drew before it moved here.
 */
export const common = {
  /** The history group's step back: the title bar and the web top bar. */
  back: "Back",
  /** The history group's step forward. */
  forward: "Forward",
  /** The accessible name of the back / forward / recent group, and of a history menu. */
  history: "History",
  /** The clock button beside back and forward. */
  recentHistory: "Recent history",
  /** The ☰ that opens the app's menus where the OS has no menu bar (Windows, Linux, the web). */
  applicationMenu: "Application menu",
  /** The sidebar button while the rail is open. */
  collapseSidebar: "Collapse the sidebar",
  /** The sidebar button while the rail is closed. */
  expandSidebar: "Expand the sidebar",
  /** A search field's or a search button's accessible name. */
  search: "Search",
  /** A close button's accessible name. */
  close: "Close",
  /** The × that puts away a banner, a toast or a sheet. */
  dismiss: "Dismiss",
  /** A cancel button. */
  cancel: "Cancel",
  /** A reply field's send button. */
  send: "Send",
  /** The spinner's name while a reply is being sent. */
  sending: "Sending",
  /** The action that marks a notification read. */
  markAsRead: "Mark as read",
  /** Declining a prompt for now. */
  notNow: "Not now",
  /** What an unread count is read as: "3 unread". */
  unread: "unread",
  /** An accessible name that grows one detail at a time: the name so far, then the next ("#design-crit, 3 mentions, muted"). A component applies it once per detail that holds, so a locale sets the separator once. */
  withDetail: "{label}, {detail}",

  // The conversation and agent components' shared words. `send` and `sending` above are theirs too.
  /** Trying a failed send, upload or step again. */
  retry: "Retry",
  /** A delete button. */
  delete: "Delete",
  /** Opening a collapsed thing: a thread, a list of steps, a long message. */
  expand: "Expand",
  /** Closing it again. */
  collapse: "Collapse",
  /** A save button. */
  save: "Save",
  /** Handing in an answer or a form. */
  submit: "Submit",

  // The data components' shared words (a change's sentence).
  /** The sentence about a number that went up ("Up 4.4%"): a KPI card's, a stat tile's and a period comparison's. */
  up: "Up {value}",
  /** The same for a number that went down. */
  down: "Down {value}",
  /** The same for a number that did not move. */
  noChange: "No change",
  /** The same when the change is not a number. */
  changeUnavailable: "Change unavailable",
  /** A change with what it is against after it ("Up 4.4% on September"). */
  againstPeriod: "{change} {period}",

  // The words a value's format writes (`fmt`'s `FormatWords`), for every data component that prints a value. A component with an `unavailable` of its own says that one.
  /** What stands for a value that is not there: a missing or not-a-number value in any format. */
  unavailable: "–",
  /** A change in points, from the `points` format: `{value}` is the number with its sign ("+3.1"). */
  formatPoints: "{value} pts",
  /** A length of time, from the `duration` format: whole minutes and the seconds as two digits ("2m 14s"). */
  formatDuration: "{minutes}m {seconds}s",
} as const satisfies StringGroup;
