/**
 * `@antfabric-ui/core/antfabric`: AntFabric's own look and AntFabric's own words, for AntFabric's apps.
 *
 * The kits' English is generic wherever the 0.1 text named AntFabric or its features ("AntFabric is locked", "Search people, channels,
 * projects", "Fabric is posting it now"). Those 0.1 sentences are `antfabricStrings`: an AntFabric app passes them at its root, with the look
 * that goes with them, and keeps 0.1's wording:
 *
 *   import { antfabric, antfabricStrings } from "@antfabric-ui/core/antfabric";
 *   <AntFabricRoot theme={antfabric} strings={antfabricStrings}>…</AntFabricRoot>     // the phone: <ThemeProvider theme={antfabric} strings={antfabricStrings}>
 *
 * Opt-in on purpose. It is its own subpath and never part of the root entry, so a product that never imports it carries none of this copy
 * (`pnpm verify:packages` bundles a root-only consumer to prove it). `antfabric` is `themes.antfabric`, re-exported here so the two
 * AntFabric things come from one place. A product that is not AntFabric writes its own `strings` (or a translation) and its own theme.
 *
 * The values are the copy by component id and key, as each component's `strings` declares it (`StringsOverrides`; a template may hold
 * `{count}`-style variables or a one / other plural pair). A key left out is the kit's default. The agent's own name arrives through the
 * `agentName` prop of the components that take one, not through strings.
 */

import type { StringsOverrides } from "./strings";

export { antfabric } from "./themes";

export const antfabricStrings: StringsOverrides = {
  // Shell: the search fields name what AntFabric searches.
  "title-bar": {
    searchLabel: "Search people, channels and projects",
    searchPlaceholder: "Search people, channels, projects",
  },
  "web-top-bar": {
    searchLabel: "Search people, channels and projects",
    searchPlaceholder: "Search people, channels, projects",
  },
  "nav-rail": {
    searchLabel: "Search people, channels and projects",
    searchHint: "Search people, channels, projects ({keys})",
  },

  // Notifications: sentences that name AntFabric, its agent and its features.
  "app-badge": { unread: "{count} unread mentions and direct messages" },
  "notification-item": {
    approved: "Approved{where} · Fabric is posting it now",
    declined: "Declined{where} · Fabric won’t post it",
    expired: "This request expired. Fabric didn’t post anything.",
  },
  "permission-prompt": {
    titleOff: "Notifications are off for AntFabric",
    bodyAskBrowser: "AntFabric tells you about direct messages, mentions and meetings while this tab is in the background — or closed. Your browser asks next.",
    bodyAskMac: "Direct messages, mentions and meetings, even with the window closed. macOS asks only once, so choose Allow.",
    bodyAskIos: "Direct messages, mentions and meetings, even with AntFabric closed. iPhone asks only once, so we ask first.",
    bodyAskAndroid: "Direct messages, mentions and meetings, even with AntFabric closed. Android asks next — tap Allow.",
    bodyOnBrowser: "Mentions, DMs and meetings reach you while this tab is in the background. Your system’s Focus settings can still hold them.",
    bodyOnMac: "You get a banner whenever the AntFabric window isn’t in front. Focus can still hold them.",
    bodyOnIos: "Mentions, DMs and meetings reach you even with AntFabric closed. Focus can still hold them.",
    bodyOnAndroid: "Mentions, DMs and meetings reach you even with AntFabric closed. Do Not Disturb can still hold them.",
    bodyBlockedMac: "Open System Settings → Notifications → AntFabric and turn on Allow notifications.",
    bodyBlockedWindows: "Open Settings → System → Notifications and turn on AntFabric.",
    bodyBlockedIos: "Notifications are turned off for AntFabric in iOS Settings. Turn them on there first.",
    bodyBlockedAndroid: "Notifications are turned off for AntFabric in your phone’s Settings, under Apps. Turn them on there first.",
    bodyUnsupportedBrowser:
      "On iPhone and iPad, add AntFabric to your Home Screen first (Share → Add to Home Screen). Elsewhere, leave private browsing or try another browser. The unread count in the tab title works either way.",
    footPhone: "You can change this later in Profile → Push notifications.",
  },

  // System: connection, session and update copy that names AntFabric and its backend.
  "connection-banner": {
    onLabel: "Connected to the backend",
    offLabel: "No connection to the backend",
    tryingLabel: "Reconnecting to the backend",
    offlineWeb: "You’re offline. Showing what was already loaded. AntFabric will reconnect on its own.",
    offlineDesktop: "You’re offline. Showing what’s on this device. AntFabric will reconnect on its own.",
    reconnectingMessage: "Can’t reach AntFabric. Reconnecting…",
    degraded: "Names could not be loaded, so some people show as “Unknown user”. Everything else works. If this lasts, ask an administrator to check your access.",
    offlineBody: "Recordings are saved locally and sync automatically when you’re back online.",
    offlinePending: "Your meeting is being saved locally. It will sync automatically when you’re back online.",
    backOnlinePending: "Meeting synced · AI processing started",
    syncingBody: "Uploading your recording…",
    reconnectingBody: "Can’t reach AntFabric. Trying again.",
    reconnectingAttempt: "Can’t reach AntFabric. Trying again — attempt {count}.",
    degradedTitle: "Names couldn’t be loaded",
    degradedBody: "Some people show as “Unknown user”. Everything else works. If this lasts, ask an administrator to check your access.",
  },
  "session-state": {
    titleLocked: "AntFabric is locked",
    titleSignedOut: "Welcome to AntFabric",
    bodyWaitingDesktop: "We opened your browser. When you’re done there, AntFabric comes back here on its own.",
    bodyLockedBiometric: "Unlock with {biometric} to access your organization’s memory.",
    bodySignedOut: "Use your AntFabric work account.",
    bodySignedOutPhone: "Capture meetings on the go for teams that move fast.",
    offline: "You're currently offline. AntFabric is not answering.",
    signIn: "Login with AntFabric",
  },
  "update-banner": {
    reloadAvailable: "A new version of AntFabric is available.",
    confirmBody: "The app will close and reopen on the new version. Anything in progress (a recording, an unsaved edit) should be finished first. You can also just leave it: the update applies on its own the next time you open the app.",
  },

  // Overlays: the palette searches AntFabric's people, channels and projects.
  "hover-card": { messageSelf: "Open your space" },
  "command-palette": {
    placeholder: "Search people, channels, projects, or DM someone…",
    offline: "You're offline. Showing people and channels on this device.",
    loadingText: "Searching people…",
    prompt: "Type a name, a #channel or a project",
  },

  // Messaging: a channel is AntFabric's idea.
  message: { pinnedTitle: "Pinned to this channel" },
  composer: {
    archivedTitle: "This channel has been archived.",
    readonlyTitle: "You can’t post in this channel",
    conversation: "the channel",
  },

  // Agent.
  "question-panel": {
    offline: "You're offline. You can answer once AntFabric reconnects.",
    mismatch: "That does not match the tool name yet.",
  },
  "approval-item": {
    verified: " · confirmed with biometrics",
  },

  // Base components: what a count badge counts in a chat product, and what a placeholder holds.
  badge: { countUnread: "{count} unread mentions" },
  "list-item": { withUnreadCount: { one: "{label}, {count} mention", other: "{label}, {count} mentions" } },
  skeleton: { loading: "Loading messages" },
};
