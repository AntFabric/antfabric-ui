import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "update-banner",
  name: "Update notice",
  category: "system",
  level: "molecule",
  status: "stable",
  description: "How each platform says a new version is ready, without interrupting: the desktop rail card that walks from Update available to Restart to update, the web's Reload line that never fires mid-typing, and the phone's over-the-air update card with its restart sheet — plus the case where only a store update will do.",
  props: {
    stage: {
      type: "enum",
      options: [
        "available",
        "downloading",
        "installing",
        "ready",
        "failed",
        "checking",
        "latest",
        "store-required",
      ],
      default: "available",
      description: "Desktop uses available → downloading → installing → ready (or failed). The phone adds checking, latest and store-required. The web only knows available and failed.",
    },
    version: {
      type: "string",
      sample: "0.43.0",
      required: true,
    },
    progress: {
      type: "number",
      default: -1,
      sample: 42,
      platforms: ["desktop"],
      description: "Download percent; -1 when the server sent no length.",
    },
    error: {
      type: "string",
      description: "The updater's own sentence, verbatim. Left out, the card says the `errorDefault` string (\"The update could not be installed.\").",
    },
    expanded: {
      type: "boolean",
      default: true,
      platforms: ["desktop"],
      description: "The notice is the card. Left (false) is the nav rail collapsed to 64 px: an icon with a dot.",
    },
    appVersion: {
      type: "string",
      sample: "1.4.2",
      required: true,
      platforms: ["mobile"],
      description: "The running bundle's version (expoConfig.version).",
    },
    confirm: {
      type: "boolean",
      default: false,
      platforms: ["mobile"],
      description: "The Restart to apply? sheet is open.",
    },
    onStageChange: {
      type: "event",
      args: "stage: UpdateBannerStage",
      description: "Reports the request a press makes: downloading after Install or Retry (desktop), checking after Check again (phone). The notice never moves `stage` itself: the pressed control spins until the app answers with a new `stage` or `error` (or the promise onApply or onCheck returns settles), so a check or retry that fails the same way again comes back to where it was.",
    },
    onApply: {
      type: "event",
      description: "Desktop: install the waiting release, or retry a failed one; the card spins until the app answers with `stage` or `error`, or the promise the handler returns settles. Phone: open the store for a store-required version.",
    },
    onRestart: {
      type: "event",
      description: "Desktop: Restart to update relaunches onto the installed release. Web: Reload. Phone: Restart now in the sheet.",
    },
    onCheck: {
      type: "event",
      platforms: ["mobile"],
      description: "Check again: reports the request; the button spins until the app answers with `stage` (checking, latest, failed) or `error`, or the promise the handler returns settles.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=\"status\" inverse pill, inline styles over `t`, fading in with enter(\"fade\"), with the kit's Button for Reload; the app pins it bottom-left and compares the build id against /version.json on each route change and every 30 min",
      import: "import { UpdateBanner } from \"@antfabric/ui-react\"",
      notes: [
        "Reload is the person's choice. The page is never reloaded for them while a composer has focus or holds text — drafts are already saved per conversation, so Reload brings them back.",
        "Only when the server says the running build is too old to talk to it (an API version below the minimum) does the line change to \"This version of AntFabric is out of date. Reload to keep going.\" — still a button, still waiting for an idle moment.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "On Reload: reloads; drafts are restored",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "A <button> card (role=\"status\", or \"alert\" when failed) for the foot of the nav rail, inline styles over `t`, rising in with enter(\"rise\"); a non-pressable busy card while downloading or installing; a 40px rail <button> with a dot when collapsed. Hover and focus from useInteraction; `stage` is the app's (a press waits through usePending); the app drives it from the Tauri updater plugin",
      import: "import { UpdateBanner } from \"@antfabric/ui-react\"",
      notes: [
        "Renders nothing unless a release is genuinely waiting: a failed launch check, or a shell with no updater configured, stays idle and silent.",
        "No dismiss, by the owner's design (ADR-0294): a waiting update stays until it is installed or the app restarts.",
        "The card rises in. Pressing Update available (or a failed one) calls onStageChange(\"downloading\") and onApply and spins until the app passes the next `stage`; downloading → installing → ready follow the updater's events through `stage`. The busy card is not pressable. Restart to update calls onRestart, which relaunches.",
        "The title must fit a 127 px column at the 15 px top of the type ladder — every stage title is one line, nowrap.",
        "Collapsed rail: the same glyph with a dot, never a number — there is only ever one release waiting.",
        "The running app re-checks periodically, not only at launch; an app nobody quits otherwise never learns a release exists.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Installs, restarts or retries, by stage",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "A View card with the kit's Button, StyleSheet over useTheme(); the Restart to apply? sheet slides up with <Enter motion=\"slide-up\"> and follows a downward drag (PanResponder + Animated) to put itself away. `confirm` through useControllable; `stage` is the app's (Check again waits through usePending), driven from expo-updates",
      import: "import { UpdateBanner } from \"@antfabric/ui-react-native\"",
      notes: [
        "OTA updates replace the JavaScript only. A change to native code bumps runtimeVersion, and the phone is then told to update from the store — an OTA cannot deliver it.",
        "Restarting is optional: an update that has downloaded applies on its own the next time the app opens.",
        "In the catalogue Check for updates spins until the app answers (the flows pass `stage: \"checking\"`), Restart to apply update sets `confirm` so the sheet slides up, and Later puts it away.",
        "In a development build expo-updates rejects every call, so the card says \"Updates are not enabled in this build.\" rather than pretending it checked.",
      ],
      gestures: [
        {
          gesture: "Swipe the sheet down",
          action: "Same as Later",
        },
      ],
    },
  },
  a11y: {
    notes: [
      "A change of stage is spoken when it happens, through the page's own announcer on the web and desktop (a failure assertively, with the updater's reason read out after the title) and through the screen reader's announcement call on the phone for a failure, the latest-version note and the store notice. Progress is not read out percent by percent. The card is not a live region itself: one that arrives holding its text is not read.",
      "The card's button is named by what it shows, its title and its detail line (\"Restart to update v0.43.0\"), so a voice user says the words they see (WCAG 2.5.3) and reaching it reads the failure too; the whole action (\"Restart to update to version 0.43.0\") is its description and tooltip. The web's reload line is announced the same way.",
      "On the phone Android's back button puts the restart sheet away.",
      "The detail line truncates for sighted readers only; the full error is in the DOM and in the tooltip.",
    ],
  },
  examples: [
    {
      name: "Update available",
      platforms: ["desktop"],
    },
    {
      name: "Downloading",
      platforms: ["desktop"],
      props: {
        stage: "downloading",
      },
    },
    {
      name: "Installing",
      platforms: ["desktop"],
      props: {
        stage: "installing",
      },
    },
    {
      name: "Restart to update",
      platforms: ["desktop"],
      props: {
        stage: "ready",
      },
    },
    {
      name: "Update failed",
      platforms: ["desktop"],
      props: {
        stage: "failed",
        error: "The update signature could not be verified.",
      },
    },
    {
      name: "Collapsed rail",
      platforms: ["desktop"],
      props: {
        stage: "ready",
        expanded: false,
      },
    },
    {
      name: "New version (web)",
      platforms: ["web"],
    },
    {
      name: "Check for updates",
      platforms: ["mobile"],
      props: {
        stage: "latest",
      },
    },
    {
      name: "Checking",
      platforms: ["mobile"],
      props: {
        stage: "checking",
      },
    },
    {
      name: "Ready to restart",
      platforms: ["mobile"],
      props: {
        stage: "ready",
      },
    },
    {
      name: "Restart to apply?",
      platforms: ["mobile"],
      props: {
        stage: "ready",
        confirm: true,
      },
    },
    {
      name: "Store update needed",
      platforms: ["mobile"],
      props: {
        stage: "store-required",
        version: "1.5.0",
      },
    },
  ],
  edgeCases: [
    {
      title: "Never reload under someone's typing",
      platforms: ["web"],
      handling: "Reload happens only on the button. A composer with focus or text holds off even the out-of-date case until it is empty and blurred; drafts are persisted per conversation and come back after the reload.",
    },
    {
      title: "Several tabs on the web",
      platforms: ["web"],
      handling: "Every open tab shows the line; reloading one does not reload the others. A service-worker update activates only once no tab is on the old build, so a tab in the background is never swapped out from under its owner.",
    },
    {
      title: "Restart while recording",
      platforms: ["desktop", "mobile"],
      handling: "Restart to update is held while a recording runs: the desktop card reads \"Restart after recording\" and does nothing until it stops; the phone's sheet already says to finish a recording first, and Later is always there.",
    },
    {
      title: "The download has no length",
      platforms: ["desktop"],
      handling: "With no content length the detail reads \"Downloading…\" instead of a percentage; the card is not clickable while downloading or installing.",
      example: {
        name: "Unknown progress",
        platforms: ["desktop"],
        props: {
          stage: "downloading",
          progress: -1,
        },
      },
    },
    {
      title: "A long failure",
      platforms: ["desktop", "mobile"],
      handling: "The updater's sentence is shown verbatim (so it can be reported accurately), truncated to one line in the rail with the whole of it in the tooltip and to screen readers. Clicking the card retries.",
      example: {
        name: "Signature error",
        platforms: ["desktop"],
        props: {
          stage: "failed",
          error: "Signature verification failed for antfabric_0.43.0_aarch64.app.tar.gz: the public key does not match.",
        },
      },
    },
    {
      title: "Offline, or no updater in this build",
      platforms: ["web", "desktop", "mobile"],
      handling: "A check that cannot reach the server leaves the notice hidden on desktop and web; on the phone, Check for updates reports the failure under the button. A build with no updater configured says nothing at all on desktop and \"Updates are not enabled in this build.\" on the phone.",
      example: {
        name: "Check failed",
        platforms: ["mobile"],
        props: {
          stage: "failed",
          error: "Could not reach the update server. Check your connection and try again.",
        },
      },
    },
    {
      title: "The last update would not start",
      platforms: ["mobile"],
      handling: "If expo-updates fell back to the embedded bundle (isEmergencyLaunch), the card says \"The last update couldn't start, so AntFabric is running the version it shipped with.\" and Check for updates fetches a fresh one.",
    },
  ],
  related: ["connection-banner", "nav-rail", "toast"],
  flows: [
    {
      id: "install-and-restart",
      title: "A release is waiting: install it, then restart onto it",
      description: "The app finds a release on its own and says so without interrupting. On the desktop one press downloads and installs it and a second restarts onto it; the web has nothing to install, so its one button reloads.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "The app checks for a release, and checks again",
          detail: "At launch, then hourly and whenever the window regains focus, so an app nobody quits still learns a release exists. A failed check, or a shell with no updater, stays silent.",
          code: "const timer = setInterval(maybeCheck, RECHECK_INTERVAL_MS)  // 60 min; and window 'focus'",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The running build is compared with /version.json",
          detail: "On every route change and every 30 minutes. Only a server that says this build is too old to talk to it changes the copy to out of date.",
          code: "const { build } = await fetch('/version.json').then((r) => r.json()); if (build !== BUILD_ID) setStage('available')",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "A release is found",
          code: "setUpdate(result.update); setStage('available')",
          platforms: ["desktop"],
        },
        {
          kind: "motion",
          title: "The card rises in at the foot of the nav rail",
          detail: "Above the notification bell, with a coral dot when the rail is collapsed. There's no dismiss: a waiting update stays until it's installed or the app restarts (ADR-0294).",
          enter: "rise",
          platforms: ["desktop"],
        },
        {
          kind: "motion",
          title: "The line fades in at the bottom left",
          detail: "A toast with no timeout. Nothing reloads by itself.",
          enter: "fade",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Update available is pressed",
          detail: "The whole card is the button.",
          platforms: ["desktop"],
        },
        {
          kind: "event",
          title: "onApply() fires",
          detail: "Available and failed both apply; a failed update is tried again from the download.",
          code: "onApply?.()  // UpdateNotice: available: { act: apply }, failed: { act: apply }",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "Download, then install",
          detail: "The card is busy while it works and shows the percentage when the server sent a length. If either part fails, it shows the updater's own sentence and becomes Update failed, which tries again.",
          code: "setStage('downloading'); await backend.download(setProgress); setStage('installing'); await backend.install(); setStage('ready')",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "Restart to update",
          detail: "The card turns to Restart to update, and its arrow points on. Restarting is still the person's choice.",
          code: "ready: { title: 'Restart to update', act: restart }",
          platforms: ["desktop"],
        },
        {
          kind: "trigger",
          title: "Restart to update is pressed",
          platforms: ["desktop"],
        },
        {
          kind: "trigger",
          title: "Reload is pressed",
          detail: "The page never reloads itself while a composer has focus or holds text.",
          platforms: ["web"],
        },
        {
          kind: "event",
          title: "onRestart() fires",
          code: "onRestart?.()",
        },
        {
          kind: "effect",
          title: "The app relaunches on the new version",
          detail: "If the relaunch is refused, the card says why and stays.",
          code: "const { relaunch } = await loadProcessPlugin(); await relaunch()",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The page reloads",
          detail: "Drafts are saved per conversation, so they come back after the reload.",
          code: "location.reload()",
          platforms: ["web"],
        },
        {
          kind: "result",
          title: "On the new version, where you left off",
          detail: "The card is gone. The window reopens on the conversation it showed before.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 248,
              height: 240,
              padding: 12,
              justify: "flex-end",
              align: "flex-start",
              bg: "$color.background.recessed",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 3,
                },
              },
            ],
          },
        },
        {
          step: 3,
          hold: 1500,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 248,
              height: 240,
              padding: 12,
              justify: "flex-end",
              align: "flex-start",
              bg: "$color.background.recessed",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 3,
                },
              },
              {
                el: "component",
                use: "update-banner",
                style: {
                  position: "absolute",
                  left: 12,
                  bottom: 60,
                },
                props: {
                  stage: "available",
                  version: "0.43.0",
                },
              },
            ],
          },
        },
        {
          step: 5,
          press: 1,
          hold: 900,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 248,
              height: 240,
              padding: 12,
              justify: "flex-end",
              align: "flex-start",
              bg: "$color.background.recessed",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 3,
                },
              },
              {
                el: "component",
                use: "update-banner",
                style: {
                  position: "absolute",
                  left: 12,
                  bottom: 60,
                },
                props: {
                  stage: "available",
                  version: "0.43.0",
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1600,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 248,
              height: 240,
              padding: 12,
              justify: "flex-end",
              align: "flex-start",
              bg: "$color.background.recessed",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 3,
                },
              },
              {
                el: "component",
                use: "update-banner",
                style: {
                  position: "absolute",
                  left: 12,
                  bottom: 60,
                },
                props: {
                  stage: "downloading",
                  version: "0.43.0",
                  progress: 64,
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1500,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 248,
              height: 240,
              padding: 12,
              justify: "flex-end",
              align: "flex-start",
              bg: "$color.background.recessed",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 3,
                },
              },
              {
                el: "component",
                use: "update-banner",
                style: {
                  position: "absolute",
                  left: 12,
                  bottom: 60,
                },
                props: {
                  stage: "ready",
                  version: "0.43.0",
                },
              },
            ],
          },
        },
        {
          step: 9,
          press: 1,
          hold: 900,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 248,
              height: 240,
              padding: 12,
              justify: "flex-end",
              align: "flex-start",
              bg: "$color.background.recessed",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 3,
                },
              },
              {
                el: "component",
                use: "update-banner",
                style: {
                  position: "absolute",
                  left: 12,
                  bottom: 60,
                },
                props: {
                  stage: "ready",
                  version: "0.43.0",
                },
              },
            ],
          },
        },
        {
          step: 14,
          hold: 1500,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 248,
              height: 240,
              padding: 12,
              justify: "flex-end",
              align: "flex-start",
              bg: "$color.background.recessed",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "bell",
                  label: "Notifications",
                  badge: 3,
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              height: 260,
              paddingTop: 24,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Crit at 3 in #design-crit?",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1500,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              height: 260,
              paddingTop: 24,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Crit at 3 in #design-crit?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "update-banner",
                style: {
                  position: "absolute",
                  left: 16,
                  bottom: 16,
                },
                props: {
                  stage: "available",
                },
              },
            ],
          },
        },
        {
          step: 10,
          press: 0,
          hold: 900,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              height: 260,
              paddingTop: 24,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Crit at 3 in #design-crit?",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "update-banner",
                style: {
                  position: "absolute",
                  left: 16,
                  bottom: 16,
                },
                props: {
                  stage: "available",
                },
              },
            ],
          },
        },
        {
          step: 14,
          hold: 1500,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              height: 260,
              paddingTop: 24,
              bg: "$color.background.card",
              border: "1px solid $color.border.subtle",
              radius: "$radius.card",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Aisha Bello",
                  identity: "green",
                  time: "2:14 PM",
                  body: "Pushed the new spacing frames for the composer. Crit at 3 in #design-crit?",
                  reactions: [],
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "ota-restart",
      title: "Check for updates, then restart to apply",
      description: "The phone's over-the-air update: Check downloads the new JavaScript bundle, and Restart asks first, because reloading ends whatever is in progress.",
      platforms: ["mobile"],
      steps: [
        {
          kind: "data",
          title: "The card reads the running build",
          detail: "App version is the running bundle's own version. In a development build expo-updates refuses every call, so the card says Updates are not enabled in this build instead of pretending it checked.",
          code: "const runtime = useMemo(() => otaUpdates.getRuntime(), []); const { isUpdatePending } = useUpdates()",
        },
        {
          kind: "trigger",
          title: "Check for updates is pressed",
          detail: "On Settings, or the compact card on the sign-in screen.",
        },
        {
          kind: "event",
          title: "onCheck() fires",
          code: "onCheck?.()",
        },
        {
          kind: "effect",
          title: "Check, then download in one go",
          detail: "The button spins while it works. A change to native code can't arrive this way; the runtime version differs, and the card says to update from the App Store or Google Play.",
          code: "const checked = await otaUpdates.check(); if (checked.status === 'available') await otaUpdates.download()",
        },
        {
          kind: "state",
          title: "The update is ready",
          detail: "The button becomes Restart to apply update. Restarting is optional: a downloaded update applies on its own the next time the app opens.",
          code: "const updateReady = fetched || isUpdatePending",
        },
        {
          kind: "trigger",
          title: "Restart to apply update is pressed",
        },
        {
          kind: "state",
          title: "The card opens its restart sheet",
          code: "onPress={() => setConfirmOpen(true)}  // <Sheet visible={confirmOpen} title=\"Restart to apply?\" />",
        },
        {
          kind: "motion",
          title: "The sheet slides up",
          detail: "Restart to apply? The app closes and reopens, so a recording or an unsaved edit should be finished first. Later puts the sheet away.",
          enter: "slide-up",
        },
        {
          kind: "trigger",
          title: "Restart now is pressed",
        },
        {
          kind: "event",
          title: "onRestart() fires",
          code: "onRestart?.()",
        },
        {
          kind: "effect",
          title: "The app reloads on the new bundle",
          detail: "If the reload is refused, the card shows why and stays where it was.",
          code: "await Updates.reloadAsync()",
        },
        {
          kind: "result",
          title: "On the new version",
          detail: "Settings reads the new app version and You're on the latest update for this build.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            stage: "latest",
            appVersion: "1.4.2",
          },
        },
        {
          step: 1,
          press: 0,
          hold: 900,
          props: {
            stage: "latest",
            appVersion: "1.4.2",
          },
        },
        {
          step: 3,
          hold: 1400,
          props: {
            stage: "checking",
            appVersion: "1.4.2",
          },
        },
        {
          step: 4,
          hold: 1400,
          props: {
            stage: "ready",
            version: "1.4.3",
            appVersion: "1.4.2",
          },
        },
        {
          step: 5,
          press: 0,
          hold: 900,
          props: {
            stage: "ready",
            version: "1.4.3",
            appVersion: "1.4.2",
          },
        },
        {
          step: 7,
          hold: 1700,
          props: {
            stage: "ready",
            version: "1.4.3",
            appVersion: "1.4.2",
            confirm: true,
          },
        },
        {
          step: 8,
          press: 1,
          hold: 900,
          props: {
            stage: "ready",
            version: "1.4.3",
            appVersion: "1.4.2",
            confirm: true,
          },
        },
        {
          step: 11,
          hold: 1600,
          props: {
            stage: "latest",
            appVersion: "1.4.3",
          },
        },
      ],
    },
  ],
};

export default docs;
