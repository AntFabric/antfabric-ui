import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "connection-banner",
  name: "Connection banner",
  category: "system",
  level: "molecule",
  status: "stable",
  description: "Says what the connection is doing, quietly, for as long as it is true: the desktop's amber offline strip, the phone's offline / back-online / syncing card and Online pill, a reconnecting line with the attempt count, and the degraded-service note when names cannot be resolved.",
  props: {
    state: {
      type: "enum",
      options: ["offline", "reconnecting", "back-online", "syncing", "degraded"],
      default: "offline",
      description: "offline: this device has no network. reconnecting: the network is there but AntFabric is not answering. degraded: connected, but one service (the directory) is failing.",
    },
    surface: {
      type: "enum",
      options: ["banner", "pill"],
      default: "banner",
      description: "pill is the phone header's Online / Offline indicator; it is read-only.",
    },
    attempt: {
      type: "number",
      default: 1,
      sample: 3,
      description: "Reconnect attempt number. Shown from the second attempt.",
    },
    pending: {
      type: "number",
      default: 0,
      platforms: ["mobile"],
      description: "Things waiting to sync (AntFabric: recordings waiting to upload). Changes what offline and back-online say.",
    },
    onRetry: {
      type: "event",
      platforms: ["web", "desktop"],
      description: "Try now was pressed: reconnect at once and reset the backoff. The phone has no Retry; its queue drains on the reconnect edge.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=\"status\" strip, inline styles over `t`, that slides down with enter(\"slide-down\"); Try now is a <button> with hover and focus from useInteraction. The app feeds `state` from navigator.onLine, the online/offline events and the realtime socket",
      import: "import { ConnectionBanner } from \"@antfabric/ui-react\"",
      notes: [
        "Two signals, two states: the browser's offline event means the device has no network and shows \"You're offline\" at once; a socket that drops while navigator.onLine is true waits out the 5 s grace and then says \"Reconnecting…\", because the network is fine and AntFabric is not.",
        "No device cache on the web: offline shows what was already loaded in this tab, and says so.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "On Try now: reconnects immediately and resets the backoff",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same role=\"status\" strip as web, in warning.soft over a warning.border edge, for inside the content column (never across the rail); the degraded note is a recessed card for the sidebar above the conversation list",
      import: "import { ConnectionBanner } from \"@antfabric/ui-react\"",
      notes: [
        "Amber and centred on purpose (owner, 2026-09-22): amber is degraded-but-working; not danger, because nothing failed; not coral, because the strip asks for no action.",
        "Dark themes wash the amber anchor at 10% with a 25% edge instead of the light ramp — the desktop's --banner-warning-* tokens carry both. Here warning.soft and warning.border carry both themes.",
        "Nothing is said on the way back: the strip going away is the signal.",
        "Reconnecting with an attempt count and Try now is new; today the strip covers both cases with the offline sentence.",
        "The composer has its own line for this (OFFLINE_NOTICE, where \"X is typing…\" sits); this strip is for every other screen.",
        "The strip slides down into place when it appears. Try now starts a fresh attempt at once, so the count moves on (it sets `attempt` + 1 in the catalogue).",
      ],
    },
    mobile: {
      status: "ready",
      base: "<Enter motion=\"slide-down\"> card (its words announced, no live region) with an Icon and two Texts, StyleSheet over useTheme(), for under the screen header; the pill is a read-only labelled View for HeaderActions",
      import: "import { ConnectionBanner } from \"@antfabric/ui-react-native\"",
      notes: [
        "Offline is a normal mode for a capture app, so it reads as reassurance on a neutral surface — no alarm colour, no Retry: the capture queue drains itself on the reconnect edge.",
        "\"Back online\" stays 5 s (RECONNECT_NOTICE_MS) and only claims a sync when something was waiting.",
        "The card slides down into place when it appears.",
        "The pill is read-only. It used to be a tap-to-force-offline toggle, which pinned the app offline; that override is gone.",
        "The phone refuses sends while offline; the draft stays in the composer.",
      ],
    },
  },
  a11y: {
    role: "status",
    notes: [
      "A change of state is spoken politely, never interrupting, and never as an alert: nothing here is an error. On the web the strip's message, the degraded note and \"Back online\" go through the page's own announcer when the state changes (a strip mounted holding its text is not read, and the way back would otherwise be silent). On the phone the card's title and message are spoken by the screen reader's announcement call, and the card is role=status.",
      "The pill is a labelled picture that stays on the page (role=img on the web); a change of its name is announced (not on first draw). Its label is a sentence (\"No connection to the backend\"), not the colour.",
      "The strip's spinner is hidden from assistive technology; the message says what is happening.",
      "Try now is named by its words (WCAG 2.5.3: a voice user says what they see); \"Try reconnecting now\" is its description and tooltip.",
    ],
  },
  examples: [
    {
      name: "Offline (desktop)",
      platforms: ["desktop"],
      width: 720,
    },
    {
      name: "Offline (web)",
      platforms: ["web"],
      width: 720,
    },
    {
      name: "Reconnecting",
      platforms: ["web", "desktop"],
      width: 720,
      props: {
        state: "reconnecting",
      },
    },
    {
      name: "Names can't be resolved",
      platforms: ["web", "desktop"],
      width: 260,
      props: {
        state: "degraded",
      },
    },
    {
      name: "Offline (phone)",
      platforms: ["mobile"],
      width: 361,
    },
    {
      name: "Offline, meeting waiting",
      platforms: ["mobile"],
      width: 361,
      props: {
        pending: 1,
      },
    },
    {
      name: "Back online",
      platforms: ["mobile"],
      width: 361,
      props: {
        state: "back-online",
      },
    },
    {
      name: "Meeting synced",
      platforms: ["mobile"],
      width: 361,
      props: {
        state: "back-online",
        pending: 1,
      },
    },
    {
      name: "Syncing",
      platforms: ["mobile"],
      width: 361,
      props: {
        state: "syncing",
      },
    },
    {
      name: "Online pill",
      props: {
        surface: "pill",
        state: "back-online",
      },
    },
    {
      name: "Offline pill",
      props: {
        surface: "pill",
      },
    },
  ],
  edgeCases: [
    {
      title: "A blip is not offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "Nothing is shown for the first 5 s of a socket drop (OFFLINE_GRACE_MS). A dev server restart, a wake reconnect (250 ms) or a gateway redeploy never flashes the strip or raises the offline toast. Sends inside the grace still go over REST; the grace holds the announcement, never the work.",
    },
    {
      title: "Coming back",
      platforms: ["web", "desktop", "mobile"],
      handling: "Web and desktop say nothing — the strip leaving is the signal, and a resync runs with its own \"Refreshing…\" toast only when the person asked for one. The phone says \"Back online\" for 5 s, with \"Meeting synced · AI processing started\" only if a recording was waiting.",
      example: {
        name: "Back online, phone",
        platforms: ["mobile"],
        width: 361,
        props: {
          state: "back-online",
        },
      },
    },
    {
      title: "Reconnecting for a long time",
      platforms: ["web", "desktop", "mobile"],
      handling: "Backoff runs 0.5 s, 1 s, 2 s … up to 30 s between attempts; the line shows the attempt number from the second one and Try now resets the backoff. The strip never escalates to a modal: the workspace under it stays usable from what is on the device.",
      example: {
        name: "Attempt 12",
        platforms: ["web", "desktop"],
        width: 720,
        props: {
          state: "reconnecting",
          attempt: 12,
        },
      },
    },
    {
      title: "Trying to send while offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "Refused, not queued, with the draft kept: \"You're offline. Your message wasn't sent. It's still here for when you're back.\" A send that silently waits cannot be told from one that was lost.",
    },
    {
      title: "An expired session is not offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "The socket's 4401 and a confirmed 401 go to the sign-in flow (Session state), never to this strip. Showing \"Reconnecting…\" to someone whose session ended would keep them waiting for something that cannot happen.",
    },
    {
      title: "One service failing",
      platforms: ["web", "desktop", "mobile"],
      handling: "When the directory read fails, names fall back to \"Unknown user\" and this note sits above the conversation list. It has no close button and names no cause (a 403, a 500 and a timeout look the same here); it goes away by itself when the 5-minute refresh succeeds.",
      example: {
        name: "Degraded, phone",
        platforms: ["mobile"],
        width: 361,
        props: {
          state: "degraded",
        },
      },
    },
    {
      title: "Narrow windows and 130% text",
      platforms: ["web", "desktop", "mobile"],
      handling: "The strip wraps to two centred lines rather than truncating — the second half of the sentence (\"will reconnect on its own\") is the reassurance. On a phone the card grows with Dynamic Type.",
      example: {
        name: "Narrow",
        platforms: ["web", "desktop"],
        width: 340,
      },
    },
  ],
  related: ["session-state", "toast", "composer"],
  flows: [
    {
      id: "drop-and-reconnect",
      title: "The connection drops, the strip says so, and goes when it's back",
      description: "A blip says nothing. Once the connection has been gone long enough to matter, the strip slides down and stays for as long as it's true; when the socket is live again it leaves and the open conversation is read again.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The realtime client reports its status",
          detail: "The socket is connecting, live, offline or refused. A close, or a watchdog that hears nothing for too long, reports offline and schedules the next attempt.",
          code: "setStatus('offline', { reason: 'closed', code }); scheduleRetry()  // ws.onclose",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "A health check every five seconds",
          detail: "The phone asks the backend's /v1/healthz every 5 s with a 3 s timeout and only reports a change. No answer is offline; an answer that says the directory is failing is degraded.",
          code: "startConnectivityMonitor((online, degraded) => { setOnline(online); setBackendDegraded(degraded) })",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The socket and the browser both report",
          detail: "The same realtime client as the desktop, plus the browser's own offline and online events, so a pulled cable is known at once rather than after a timeout.",
          code: "addEventListener('offline', () => applyConnectivity('offline', { immediate: true }))",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The connection drops",
          lane: "system",
          detail: "The Wi-Fi goes, the laptop sleeps through a deploy, or the gateway restarts. Nothing is drawn yet.",
        },
        {
          kind: "state",
          title: "Five seconds of grace, then the verdict",
          detail: "A socket that flaps must not flash the strip, so nothing is said for OFFLINE_GRACE_MS unless the OS already reports no network. Then the store's connectivity becomes offline, and a toast that stays says You're currently offline.",
          code: "timers.set(OFFLINE_GRACE_TIMER, declareOffline, OFFLINE_GRACE_MS)  // 5_000 → set({ connectivity: 'offline' })",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The phone goes offline and stops uploading",
          detail: "An upload in flight is cancelled before the app believes it's offline, so it can't run on and fail twice. useSyncNotice turns online and the recording queue into what the card says.",
          code: "if (!online) useCaptureQueue.getState().cancelInFlight(); useAppStore.getState().setOnline(online)",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The strip slides down above the workspace",
          detail: "Amber, one line, centred, and nothing beside it moves. Today's OfflineBar appears without motion; it takes this slide.",
          enter: "slide-down",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The card slides down at the top of the screen",
          detail: "Offline, and what happens to a recording made now. Today's ConnectivityBanner is built but has no caller: the Recording screen hides it (owner, 2026-09-09) and the processing screen shows its own InfoBanner instead.",
          enter: "slide-down",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "AntFabric keeps trying on its own",
          detail: "Each failed attempt waits twice as long as the last, up to 30 seconds, so a laptop that wakes after a deploy doesn't wait minutes and a refusing gateway isn't hammered. The phone simply checks again five seconds later.",
          code: "const delay = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6))",
        },
        {
          kind: "trigger",
          title: "The connection is back",
          lane: "system",
          detail: "The socket opens and goes live, or the next health check answers.",
        },
        {
          kind: "state",
          title: "Online again, and the conversation is read again",
          detail: "The grace timer is cleared, connectivity goes back to online and the offline toast is dismissed. Whatever the socket missed is fetched by re-reading the open conversation.",
          code: "timers.clear(OFFLINE_GRACE_TIMER); set({ connectivity: 'online' }); dismissOffline()",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "Online again, and the queues retry",
          detail: "Recordings that failed to upload and edits saved offline go out again. A reconnect isn't a person retrying, so no retry budget is refunded.",
          code: "useCaptureQueue.getState().retryErrored({ refund: false }); useMutationQueue.getState().retryFailed()",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The strip goes, and the composer sends again",
          detail: "Nothing celebrates a reconnect on the desktop: the strip simply leaves.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "result",
          title: "Back online, for five seconds",
          detail: "The card turns green and says Back online · Everything is up to date (or Meeting synced · AI processing started when a recording was waiting), then leaves on its own.",
          code: "const RECONNECT_NOTICE_MS = 5000",
          platforms: ["mobile"],
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
              width: 520,
              minHeight: 260,
              paddingTop: 48,
              bg: "$surface.card",
              border: "1px solid $border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "10:42 AM",
                  body: "Staging is green again. I'll cut the release branch at 4 and post the checklist in #release-train.",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 2,
          hold: 1300,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 260,
              paddingTop: 48,
              bg: "$surface.card",
              border: "1px solid $border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "10:42 AM",
                  body: "Staging is green again. I'll cut the release branch at 4 and post the checklist in #release-train.",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1800,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 260,
              paddingTop: 48,
              bg: "$surface.card",
              border: "1px solid $border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "10:42 AM",
                  body: "Staging is green again. I'll cut the release branch at 4 and post the checklist in #release-train.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "connection-banner",
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 520,
                },
                props: {
                  state: "offline",
                },
              },
              {
                el: "component",
                use: "toast",
                style: {
                  position: "absolute",
                  bottom: 16,
                  alignSelf: "center",
                },
                props: {
                  message: "You're currently offline.",
                  tone: "info",
                  dismissible: false,
                },
              },
            ],
          },
        },
        {
          step: 12,
          hold: 1600,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 520,
              minHeight: 260,
              paddingTop: 48,
              bg: "$surface.card",
              border: "1px solid $border.subtle",
              radius: "$radius.card",
              overflow: "hidden",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "10:42 AM",
                  body: "Staging is green again. I'll cut the release branch at 4 and post the checklist in #release-train.",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 360,
              paddingTop: 120,
              paddingX: 16,
              gap: "$space.2xs",
              bg: "$surface.card",
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Design crit",
                  subtitle: "Recorded today · 42 min",
                  leading: "tile",
                  icon: "mic",
                  chevron: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Release train sync",
                  subtitle: "Yesterday · 18 min",
                  leading: "tile",
                  icon: "mic",
                  chevron: true,
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 360,
              paddingTop: 120,
              paddingX: 16,
              gap: "$space.2xs",
              bg: "$surface.card",
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Design crit",
                  subtitle: "Recorded today · 42 min",
                  leading: "tile",
                  icon: "mic",
                  chevron: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Release train sync",
                  subtitle: "Yesterday · 18 min",
                  leading: "tile",
                  icon: "mic",
                  chevron: true,
                },
              },
              {
                el: "component",
                use: "connection-banner",
                style: {
                  position: "absolute",
                  top: 16,
                  left: 16,
                  width: 343,
                },
                props: {
                  state: "offline",
                  pending: 1,
                },
              },
            ],
          },
        },
        {
          step: 13,
          hold: 1800,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 360,
              paddingTop: 120,
              paddingX: 16,
              gap: "$space.2xs",
              bg: "$surface.card",
            },
            children: [
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Design crit",
                  subtitle: "Recorded today · 42 min",
                  leading: "tile",
                  icon: "mic",
                  chevron: true,
                },
              },
              {
                el: "component",
                use: "list-item",
                props: {
                  title: "Release train sync",
                  subtitle: "Yesterday · 18 min",
                  leading: "tile",
                  icon: "mic",
                  chevron: true,
                },
              },
              {
                el: "component",
                use: "connection-banner",
                style: {
                  position: "absolute",
                  top: 16,
                  left: 16,
                  width: 343,
                },
                props: {
                  state: "back-online",
                  pending: 1,
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "try-now",
      title: "Reconnecting: try now instead of waiting",
      description: "When the network is there but AntFabric isn't answering, the strip says which attempt this is and offers Try now, which skips the wait.",
      platforms: ["web", "desktop"],
      width: 520,
      steps: [
        {
          kind: "data",
          title: "The client counts its attempts",
          detail: "Every failed attempt adds one and doubles the wait. The strip shows the count from the second attempt on.",
          code: "attempt += 1; retry = setTimeout(connect, delay)",
        },
        {
          kind: "state",
          title: "The network is up, AntFabric isn't",
          detail: "The browser says it's online but the socket keeps failing, so the strip says Can't reach AntFabric instead of You're offline. Today's desktop has the one offline strip for both; this spec splits them.",
          code: "state = navigator.onLine ? 'reconnecting' : 'offline'",
        },
        {
          kind: "trigger",
          title: "Try now is pressed",
          detail: "A click, or Enter with the button focused. It sits at the end of the strip only while reconnecting.",
        },
        {
          kind: "event",
          title: "onRetry() fires",
          detail: "The strip doesn't reconnect anything itself; the caller owns the socket.",
          code: "onRetry?.()",
        },
        {
          kind: "effect",
          title: "The wait resets and it connects at once",
          detail: "The realtime client already does this when the window regains focus, the OS comes back online or the tab becomes visible: wake() zeroes the attempts and connects straight away. Try now calls the same thing.",
          code: "attempt = 0; if (retry) clearTimeout(retry); retry = setTimeout(connect, WAKE_RECONNECT_MS)",
        },
        {
          kind: "result",
          title: "Catching up, then gone",
          detail: "If the socket opens, the strip says Catching up on what you missed… while the conversation is read again, then slides away. If not, the count starts over and the next wait is the shortest one again.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            state: "reconnecting",
            attempt: 2,
          },
        },
        {
          step: 1,
          hold: 1300,
          props: {
            state: "reconnecting",
            attempt: 3,
          },
        },
        {
          step: 2,
          press: 0,
          hold: 900,
          props: {
            state: "reconnecting",
            attempt: 3,
          },
        },
        {
          step: 5,
          hold: 1600,
          props: {
            state: "syncing",
          },
        },
      ],
    },
  ],
};

export default docs;
