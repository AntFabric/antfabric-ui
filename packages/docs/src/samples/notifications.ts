import { cap, type AppMark } from "@antfabric/ui-core";

/**
 * Sample data for the notification components (AppBadge, InAppBanner, NotificationItem, NotificationSchedule, OsNotification,
 * PermissionPrompt, TrayMenu): what their docs' `sample`s, matrix `cases` and the screens share. AntFabric's copy for them is in
 * `antfabricStrings` (`@antfabric/ui-core/antfabric`). Owned by W8.
 */

/**
 * The AntFabric mark: the brand asterisk with its square core and the pointer beside it, the one drawn on the desktop app's icon and,
 * white on coral, the phone's. Copied from the catalogue's public/brand/antfabric-mark.svg; one colour, so a kit fills it with whatever
 * its part reads. `AppBadge`'s `mark` sample.
 */
export const ANTFABRIC_MARK: AppMark = {
  viewBox: "104 52 152 152",
  paths: [
    { d: "M184.421 122.852C185.154 122.852 185.75 123.441 185.758 124.174L185.854 132.792C185.862 133.535 185.261 134.143 184.517 134.143H175.584C174.852 134.143 174.256 133.554 174.248 132.821L174.152 124.203C174.144 123.459 174.745 122.852 175.489 122.852H184.421Z", evenOdd: false },
    { d: "M189.089 52.5625C190.65 52.5625 191.915 53.828 191.915 55.3888V87.2487C191.915 89.905 195.247 91.0942 196.929 89.0378L217.098 64.374C218.086 63.1658 219.866 62.9875 221.074 63.9755L235.147 75.4822C236.355 76.4703 236.533 78.2507 235.545 79.459L208.909 112.033C207.4 113.878 208.713 116.648 211.096 116.648H253.173C254.734 116.648 256 117.913 256 119.474V137.651C256 139.212 254.734 140.477 253.173 140.477H194.741C193.181 140.477 191.915 141.743 191.915 143.303V201.736C191.915 203.297 190.65 204.562 189.089 204.562H170.912C169.351 204.562 168.085 203.297 168.085 201.736V169.876C168.085 167.219 164.753 166.03 163.071 168.087L142.903 192.751C141.915 193.959 140.134 194.137 138.926 193.149L124.854 181.643C123.646 180.655 123.467 178.874 124.455 177.666L151.091 145.092C152.6 143.247 151.288 140.477 148.904 140.477H106.826C105.266 140.477 104 139.212 104 137.651V119.474C104 117.913 105.266 116.648 106.826 116.648H145.922C148.398 116.648 149.677 113.69 147.982 111.886L121.21 83.3949C120.141 82.2574 120.197 80.4689 121.334 79.4001L134.581 66.9526C135.719 65.8838 137.507 65.9395 138.576 67.0769L163.199 93.2822C164.953 95.1482 168.085 93.9073 168.085 91.347V55.3888C168.085 53.828 169.351 52.5625 170.912 52.5625H189.089ZM182.553 105.04C181.28 103.062 178.388 103.062 177.114 105.04C175.031 108.277 172.26 115.265 169.091 117.355L156.356 125.754C154.393 127.05 154.425 129.941 156.417 131.193C159.758 133.28 166.749 135.853 168.857 139.127L177.114 151.955C178.388 153.933 181.28 153.933 182.553 151.955C184.73 148.573 187.597 141.342 190.909 139.158C190.973 139.115 203.644 130.759 203.644 130.759C205.608 129.463 205.576 126.571 203.584 125.32L190.665 117.206C187.374 115.138 184.68 108.344 182.553 105.04Z", evenOdd: true },
    { d: "M255.379 163.122C256.341 163.38 256.663 164.583 255.959 165.287L216.725 204.521C216.02 205.226 214.817 204.903 214.56 203.941L200.199 150.346C199.941 149.384 200.822 148.503 201.784 148.761L255.379 163.122Z", evenOdd: false },
  ],
};

/** InAppBanner's actions in the catalogue: Mark as read puts the banner away. */
export const IN_APP_BANNER_ACTIONS = [{ key: "read", label: "Mark as read", dismiss: true }];
/** A meeting's banner: Join, the one that does the thing, on a soft button. */
export const IN_APP_BANNER_JOIN = { key: "join", label: "Join", icon: "video", variant: "soft" };
/** An agent's approval request: Review. */
export const IN_APP_BANNER_REVIEW = { key: "review", label: "Review", variant: "soft" };
/**
 * The six kinds InAppBanner had, as the props each implied: the matrix draws these, and a screen passes the bundle it needs. A bundle
 * names every prop the `sample` sets (`lead`, `replyable`, `actions`), so it replaces the mention the catalogue starts from.
 */
export const IN_APP_BANNER_CASES = [
  { name: "dm", props: { lead: "", replyable: true, actions: IN_APP_BANNER_ACTIONS } },
  { name: "mention", props: { lead: "Mentioned you", replyable: true, actions: IN_APP_BANNER_ACTIONS } },
  { name: "thread", props: { lead: "Replied in a thread", replyable: true, actions: IN_APP_BANNER_ACTIONS } },
  { name: "meeting", props: { leading: "tile", icon: "video", lead: "", replyable: false, actions: [IN_APP_BANNER_JOIN] } },
  { name: "agent-done", props: { agent: true, lead: "", replyable: false, actions: IN_APP_BANNER_ACTIONS } },
  { name: "approval-needed", props: { agent: true, lead: "", replyable: false, actions: [IN_APP_BANNER_REVIEW] } },
];

/** What the old tray menu's props said, as TrayMenu's: the recorder's state, the stopwatch, the unread total and the pause. */
export interface TrayMenuState {
  recorder?: "idle" | "recording" | "paused" | "stopping";
  elapsed?: string;
  unread?: number;
  /** Notifications are paused until `until`. */
  paused?: boolean;
  until?: string;
  /** Pause notifications ▸ is open. */
  open?: boolean;
  tomorrowAt?: string;
}

/**
 * TrayMenu's `items`, `tone`, `statusText` and `openMenu` for a recorder state: the readouts, the recording rows for that state, the pause row
 * with its submenu (or, while paused, its readout and Resume), and the app's rows. The words are AntFabric's own; the times are the catalogue's,
 * counted from the clock's 10:42.
 */
export function trayMenuProps({ recorder = "recording", elapsed = "0:12", unread = 3, paused = false, until = "9:00", open = false, tomorrowAt = "9:00" }: TrayMenuState = {}) {
  const status = recorder === "recording" ? `Recording — ${elapsed}` : recorder === "paused" ? `Paused — ${elapsed}` : recorder === "stopping" ? "Saving…" : "Not recording";
  const bar = recorder === "recording" ? `Recording ${elapsed}` : recorder === "paused" ? `Paused ${elapsed}` : recorder === "stopping" ? "Saving…" : "";
  const idle = recorder === "idle";
  const separator = { type: "separator" };
  const items = [
    { type: "label", label: status },
    { type: "label", label: unread > 0 ? `${cap(unread)} unread mentions and DMs` : "No unread messages" },
    separator,
    { key: "start", label: "Start Recording", icon: "circle", filled: true, tone: "danger", disabled: !idle },
    ...(recorder === "recording" ? [{ key: "pause", label: "Pause Recording", icon: "pause", filled: true }] : []),
    ...(recorder === "paused" ? [{ key: "resume", label: "Resume Recording", icon: "play", filled: true }] : []),
    ...(recorder === "recording" || recorder === "paused" ? [{ key: "stop", label: "Stop Recording", icon: "square", filled: true }] : []),
    separator,
    ...(paused
      ? [
          { type: "label", label: `Notifications paused until ${until}` },
          { key: "resume-notifications", label: "Resume notifications", icon: "bell" },
        ]
      : [
          {
            key: "pause-notifications",
            label: "Pause notifications",
            icon: "moon",
            submenu: [
              { key: "30m", label: "30 minutes" },
              { key: "1h", label: "1 hour" },
              { key: "2h", label: "2 hours" },
              { key: "tomorrow", label: "Until tomorrow", count: tomorrowAt },
              separator,
              { key: "custom", label: "Custom…" },
            ],
          },
        ]),
    separator,
    { key: "folder", label: "Open Recordings Folder" },
    { key: "window", label: "Show / Hide AntFabric" },
    separator,
    { key: "quit", label: "Quit AntFabric" },
  ];
  const tone = recorder === "recording" ? "live" : recorder === "stopping" ? "busy" : recorder;
  return { items, tone, statusText: bar, openMenu: open && !paused ? "pause-notifications" : "" };
}

/** The menu while recording: TrayMenu's sample. */
export const TRAY_MENU_SAMPLE = trayMenuProps();

/** The four recorder states TrayMenu's `recorder` had, as the props each implied. */
export const TRAY_MENU_CASES = (["idle", "recording", "paused", "stopping"] as const).map((recorder) => ({ name: recorder, props: trayMenuProps({ recorder }) }));

/** OsNotification's buttons in the catalogue. `icon` is what iOS draws beside the row in its long-press menu; the other OSes ignore it. */
export const OS_NOTIFICATION_REPLY = { key: "reply", label: "Reply", icon: "reply", reply: true };
export const OS_NOTIFICATION_READ = { key: "read", label: "Mark as read", icon: "circle-check", rest: true };
export const OS_NOTIFICATION_JOIN = { key: "join", label: "Join", icon: "video", rest: true };
export const OS_NOTIFICATION_APPROVE = { key: "approve", label: "Approve", icon: "check", rest: true };
export const OS_NOTIFICATION_DECLINE = { key: "decline", label: "Decline", icon: "x", rest: true };
/** A chat message's: Reply, then Mark as read (the one shown at rest). */
export const OS_NOTIFICATION_ACTIONS = [OS_NOTIFICATION_REPLY, OS_NOTIFICATION_READ];
/**
 * The six kinds OsNotification had, as the props each implied: the matrix draws these, and a screen passes the bundle it needs. Each names
 * `actions`, which the sample sets, so it replaces the chat buttons the catalogue starts from.
 */
export const OS_NOTIFICATION_CASES = [
  { name: "dm", props: { actions: OS_NOTIFICATION_ACTIONS } },
  { name: "mention", props: { actions: OS_NOTIFICATION_ACTIONS } },
  { name: "thread", props: { lead: "Replied in a thread", actions: OS_NOTIFICATION_ACTIONS } },
  { name: "meeting", props: { leading: "tile", actions: [OS_NOTIFICATION_JOIN] } },
  { name: "agent-done", props: { agent: true, actions: [OS_NOTIFICATION_READ] } },
  { name: "approval-needed", props: { agent: true, actions: [OS_NOTIFICATION_APPROVE, OS_NOTIFICATION_DECLINE] } },
];

/**
 * The eight kinds NotificationItem had, as the props each implied: the matrix draws these, and a screen passes the bundle it needs.
 * Each names the `icon` the sample sets, so it replaces the mention the catalogue starts from.
 */
export const NOTIFICATION_ITEM_CASES = [
  { name: "mention", props: { icon: "at-sign" } },
  { name: "dm", props: { icon: "message-circle" } },
  { name: "thread", props: { icon: "message-square-reply", lead: "Replied in a thread" } },
  { name: "reaction", props: { icon: "smile-plus" } },
  { name: "meeting", props: { leading: "tile", icon: "video" } },
  { name: "recording", props: { leading: "tile", icon: "file-audio" } },
  { name: "agent-done", props: { agent: true, icon: "sparkles" } },
  { name: "agent-approval", props: { agent: true, icon: "shield-question", approval: "pending" } },
];

/** NotificationSchedule's choices: the times are the catalogue's, counted from 9:41. "Until tomorrow" is 9:00, the start of the person's working hours. */
export const NOTIFICATION_SCHEDULE_OPTIONS = [
  { key: "30m", label: "30 minutes", until: "10:11" },
  { key: "1h", label: "1 hour", until: "10:41" },
  { key: "2h", label: "2 hours", until: "11:41" },
  { key: "tomorrow", label: "Until tomorrow", detail: "9:00", until: "tomorrow, 9:00" },
  { key: "custom", label: "Custom time", text: "Custom…", until: "tomorrow, 14:30", custom: true },
];

/** NotificationSchedule's `note`: AntFabric's backend behaviour. */
export const NOTIFICATION_SCHEDULE_NOTE = "Quiet hours are applied by the server, so they hold on every device.";
