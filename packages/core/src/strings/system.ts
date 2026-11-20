import type { OnlyOn, StringGroups } from "./index";

/**
 * Built-in text of the `system` components, keyed by component id. See `strings/index.ts`. The English defaults are generic: where the
 * old text named a product or its features ("AntFabric", recordings, the directory), the default is a plain sentence and a product sets
 * its own through its root's `strings` (the catalogue's are `ANTFABRIC_STRINGS`).
 */
export const system = {
  "connection-banner": {
    /** The pill's word while connected. */
    online: "Online",
    /** The pill's word while the device has no network. */
    offline: "Offline",
    /** The pill's word while the network is there and the service is not answering. */
    reconnecting: "Reconnecting",
    /** The pill's accessible name while connected: a sentence, not just the colour. */
    onLabel: "Connected",
    /** The pill's accessible name while offline. */
    offLabel: "No connection",
    /** The pill's accessible name while reconnecting. */
    tryingLabel: "Reconnecting",
    /** The strip's button that reconnects at once (web and desktop). */
    tryNow: "Try now",
    /** The same button's accessible name. */
    tryNowLabel: "Try reconnecting now",
    /** The strip while offline on the web: the page keeps what was already loaded. */
    offlineWeb: "You’re offline. Showing what was already loaded. It will reconnect on its own.",
    /** The strip while offline on the desktop: the device keeps a cache. */
    offlineDesktop: "You’re offline. Showing what’s on this device. It will reconnect on its own.",
    /** The strip while the network is up and the service is not answering; the attempt is added after it from the second try. */
    reconnectingMessage: "Can’t reach the service. Reconnecting…",
    /** Added after `reconnectingMessage` from the second attempt. The leading space is part of the text. */
    attempt: " attempt {count}.",
    /** The strip while it catches up after a reconnect. */
    syncing: "Catching up on what you missed…",
    /** The note while one service (the directory) is failing and everything else works. */
    degraded: "Some details could not be loaded. Everything else works. If this lasts, ask an administrator to check your access.",
    /** The phone's card title while offline. */
    offlineTitle: "Offline",
    /** The phone's offline message when nothing is waiting. */
    offlineBody: "Your changes are saved on this device and sync automatically when you’re back online.",
    /** The phone's offline message while things wait to sync. */
    offlinePending: {
      one: "{count} item is waiting to sync. It will sync automatically when you’re back online.",
      other: "{count} items are waiting to sync. They will sync automatically when you’re back online.",
    },
    /** The phone's card title once the connection is back. */
    backOnline: "Back online",
    /** The phone's back-online message when nothing was waiting. */
    upToDate: "Everything is up to date",
    /** The phone's back-online message when things were waiting and have synced. */
    backOnlinePending: {
      one: "{count} item synced",
      other: "{count} items synced",
    },
    /** The phone's card title while syncing. */
    syncingTitle: "Syncing",
    /** The phone's syncing message. */
    syncingBody: "Uploading your changes…",
    /** The phone's card title while reconnecting. */
    reconnectingTitle: "Reconnecting",
    /** The phone's message while the service is not answering. */
    reconnectingBody: "Can’t reach the service. Trying again.",
    /** The same from the second attempt. */
    reconnectingAttempt: "Can’t reach the service. Trying again — attempt {count}.",
    /** The phone's card title while one service is failing. */
    degradedTitle: "Some details couldn’t be loaded",
    /** The phone's message while one service is failing. */
    degradedBody: "Some information is missing. Everything else works. If this lasts, ask an administrator to check your access.",
  },
  "session-state": {
    /** The title when the session has run out. */
    titleExpired: "Your session expired",
    /** The title on the web while the person is sent to sign in. */
    titleWaitingWeb: "Taking you to sign in…",
    /** The title on the desktop while the browser has the sign-in. */
    titleWaitingDesktop: "Finish signing in in your browser",
    /** The title on the phone while the sign-in sheet has the person. */
    titleWaitingPhone: "Signing you in…",
    /** The title while the app is locked. */
    titleLocked: "This app is locked",
    /** The title on the phone once the lock was passed. */
    titleUnlocked: "Unlocked",
    /** The title when the account has been suspended. */
    titleSuspended: "Your account has been suspended",
    /** The title when nobody is signed in. */
    titleSignedOut: "Welcome",
    /** The first sentence of the prose after a session expired. */
    bodyExpired: "Sign in again to pick up where you left off.",
    /** Added after `bodyExpired` on the web when the person's page is known. */
    bodyExpiredReturn: "You’ll come back to {page}.",
    /** Added after `bodyExpired` on the desktop. */
    bodyExpiredDesktop: "Your browser opens to sign in, then brings you back here.",
    /** The prose on the web while the person is sent to sign in. */
    bodyWaitingWeb: "You’ll come back to {page} when you’re done.",
    /** What `{page}` is in `bodyWaitingWeb` when the page is not known. */
    thisPage: "this page",
    /** The prose on the desktop while the browser has the sign-in. */
    bodyWaitingDesktop: "We opened your browser. When you’re done there, the app comes back here on its own.",
    /** The prose on the phone while the sign-in sheet has the person. */
    bodyWaitingPhone: "Finish in the secure sign-in sheet. You’ll come straight back here.",
    /** The prose on the web and the desktop for a lock: it is a phone feature. */
    bodyLockedDesktop: "App lock is a phone feature. On a computer, your system’s own lock screen does this job.",
    /** The prose on the phone for a lock the device's biometrics can open. `{biometric}` is the OS's name for it. */
    bodyLockedBiometric: "Unlock with {biometric}.",
    /** The prose on the phone for a lock that needs the passcode. */
    bodyLockedPasscode: "Biometrics unavailable on this device. Use your passcode to continue.",
    /** The prose when the account has been suspended. */
    bodySuspended: "Contact your administrator to get access back.",
    /** The prose on the web and the desktop when nobody is signed in. */
    bodySignedOut: "Use your work account.",
    /** The prose on the phone when nobody is signed in. */
    bodySignedOutPhone: "Sign in to continue.",
    /** The note while there is no network. */
    offline: "You’re currently offline. Sign in is not available right now.",
    /** The line beside the spinner on the web while the person is sent to sign in. */
    redirecting: "Redirecting…",
    /** The line beside the spinner while the browser or the sheet has the sign-in. */
    waitingBrowser: "Waiting for your browser…",
    /** The web's button after a session expired. */
    signInAgain: "Sign in again",
    /** The button that starts the sign-in. */
    signIn: "Sign in",
    /** The desktop's button that opens the browser once more. */
    openBrowserAgain: "Open the browser again",
    /** The button that leaves a suspended account. */
    useDifferentAccount: "Use a different account",
    /** The phone's button that opens the lock. `{biometric}` is the OS's name for it. */
    unlockWith: "Unlock with {biometric}",
    /** The phone's button that opens the lock with the passcode. */
    usePasscode: "Use passcode",
    /** The phone's button that signs out of a locked app. */
    signOut: "Sign out",
  },
  "update-banner": {
    /** The card's title while a release is waiting to be installed. */
    available: "Update available",
    /** The card's title while it downloads. */
    downloading: "Downloading update",
    /** The card's title while it installs. */
    installing: "Installing update",
    /** The card's title once it is ready and needs a restart. */
    ready: "Restart to update",
    /** The card's title when the update failed. */
    failed: "Update failed",
    /** The card's detail while it downloads with a known length. */
    downloadingPercent: "Downloading {percent}%",
    /** The card's detail while it downloads with no length. */
    downloadingUnknown: "Downloading…",
    /** The card's detail otherwise: the version waiting. */
    versionTag: "v{version}",
    /** The card's accessible name while a release waits. */
    installLabel: "Install the update, version {version}",
    /** The card's accessible name once it needs a restart. */
    restartLabel: "Restart to update to version {version}",
    /** The card's accessible name after a failure. */
    retryLabel: "Try the update again",
    /** The sentence shown when the updater gives none. */
    errorDefault: "The update could not be installed.",
    /** The web line when the new version did not load. */
    reloadFailed: "The new version didn’t load. Reload to try again.",
    /** The web line when a new version is waiting. */
    reloadAvailable: "A new version is available.",
    /** The web line's button. */
    reload: "Reload",
    /** The phone's line with the running version. */
    appVersion: "App version {version}",
    /** The phone's note when nothing newer exists. */
    latest: "You’re on the latest update for this build.",
    /** The phone's note when only a store release will do. `{store}` is the store's name. */
    storeRequired: "Version {version} changes the app itself, so it comes from {store}. Your data stays.",
    /** The Apple store's name, drawn in `storeRequired` on iOS. */
    storeApple: "the App Store",
    /** The Google store's name, drawn in `storeRequired` on Android. */
    storeGoogle: "Google Play",
    /** The phone's button that restarts onto the downloaded update. */
    restartToApply: "Restart to apply update",
    /** The phone's button that looks for an update. */
    check: "Check for updates",
    /** The phone's button that opens the App Store. */
    openAppStore: "Open the App Store",
    /** The phone's button that opens Google Play. */
    openGooglePlay: "Open Google Play",
    /** The restart sheet's title and accessible name. */
    confirmTitle: "Restart to apply?",
    /** The restart sheet's prose. */
    confirmBody: "The app will close and reopen on the new version. Anything in progress should be saved first. You can also just leave it: the update applies on its own the next time you open the app.",
    /** The restart sheet's button that restarts. */
    restartNow: "Restart now",
    /** The restart sheet's button that puts it away. */
    later: "Later",
  },
} as const satisfies StringGroups;

/** Keys only one kit reads: the strip, the card and the reload line are web and desktop's; the phone has its own cards and sheet. */
export const systemOnly = {
  "connection-banner": {
    tryNow: ["web"],
    tryNowLabel: ["web"],
    offlineWeb: ["web"],
    offlineDesktop: ["web"],
    reconnectingMessage: ["web"],
    attempt: ["web"],
    syncing: ["web"],
    degraded: ["web"],
    offlineTitle: ["mobile"],
    offlineBody: ["mobile"],
    offlinePending: ["mobile"],
    upToDate: ["mobile"],
    backOnlinePending: ["mobile"],
    syncingTitle: ["mobile"],
    syncingBody: ["mobile"],
    reconnectingTitle: ["mobile"],
    reconnectingBody: ["mobile"],
    reconnectingAttempt: ["mobile"],
    degradedTitle: ["mobile"],
    degradedBody: ["mobile"],
  },
  "session-state": {
    titleWaitingWeb: ["web"],
    titleWaitingDesktop: ["web"],
    titleWaitingPhone: ["mobile"],
    titleUnlocked: ["mobile"],
    bodyExpiredReturn: ["web"],
    bodyExpiredDesktop: ["web"],
    bodyWaitingWeb: ["web"],
    thisPage: ["web"],
    bodyWaitingDesktop: ["web"],
    bodyWaitingPhone: ["mobile"],
    bodyLockedDesktop: ["web"],
    bodyLockedBiometric: ["mobile"],
    bodyLockedPasscode: ["mobile"],
    bodySignedOut: ["web"],
    bodySignedOutPhone: ["mobile"],
    redirecting: ["web"],
    signInAgain: ["web"],
    openBrowserAgain: ["web"],
    unlockWith: ["mobile"],
    usePasscode: ["mobile"],
    signOut: ["mobile"],
  },
  "update-banner": {
    available: ["web"],
    downloading: ["web"],
    installing: ["web"],
    ready: ["web"],
    failed: ["web"],
    downloadingPercent: ["web"],
    downloadingUnknown: ["web"],
    versionTag: ["web"],
    installLabel: ["web"],
    restartLabel: ["web"],
    retryLabel: ["web"],
    reloadFailed: ["web"],
    reloadAvailable: ["web"],
    reload: ["web"],
    appVersion: ["mobile"],
    latest: ["mobile"],
    storeRequired: ["mobile"],
    storeApple: ["mobile"],
    storeGoogle: ["mobile"],
    restartToApply: ["mobile"],
    check: ["mobile"],
    openAppStore: ["mobile"],
    openGooglePlay: ["mobile"],
    confirmTitle: ["mobile"],
    confirmBody: ["mobile"],
    restartNow: ["mobile"],
    later: ["mobile"],
  },
} as const satisfies OnlyOn<typeof system>;
