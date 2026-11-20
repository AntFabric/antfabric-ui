import type { ComponentDocs } from "../../types";
import { MOBILE_HEADER_ACTIONS, MOBILE_HEADER_DETAILS } from "../../samples";

const docs: ComponentDocs = {
  id: "mobile-header",
  name: "Mobile header",
  category: "shell",
  level: "organism",
  status: "beta",
  description: "The top of every phone screen, under the status bar. A tab screen carries its name as a 28pt large title with the bell and your photo on the right; a pushed screen carries a back control, a 16pt title with an optional subtitle, and its own actions. iOS centres a pushed title and uses a chevron; Android starts it at the left with an arrow.",
  props: {
    variant: {
      type: "enum",
      options: ["main", "pushed"],
      default: "main",
      description: "main: a tab's large title + bell + photo. pushed: back + title + actions, for anything opened on top of a tab.",
    },
    title: {
      type: "string",
      sample: "Messages",
      required: true,
    },
    subtitle: {
      type: "string",
      default: "",
      description: "Pushed only — '7 members', '#design-crit'. One line, faint.",
    },
    titleGlyph: {
      type: "icon",
      default: "",
      description: "Pushed only — a channel's # or lock, 4pt before the title.",
    },
    userName: {
      type: "string",
      default: "",
      sample: "Priya Raman",
      description: "Names the photo on the main header's right, and its initials. Empty draws no photo.",
    },
    avatarSrc: {
      type: "string",
      default: "",
    },
    identity: {
      type: "enum",
      options: ["ink", "indigo", "green", "ochre", "red", "agent"],
      default: "ink",
      description: "The colour of the photo's initials when there is no `avatarSrc`.",
    },
    actions: {
      type: "array",
      default: [],
      sample: MOBILE_HEADER_ACTIONS,
      description: "IconActionItem: { key, icon, label, badge?, disabled? } for each 40pt control: before the photo on a main header, after the title on a pushed one. A badge is a coral count (9+ at most). Two at most on a pushed header; more go behind ⋮.",
    },
    titleAlign: {
      type: "enum",
      options: ["platform", "start", "center"],
      default: "platform",
      description: "platform centres a pushed title on iOS and starts it on Android. V2 today draws start on both.",
    },
    statusBar: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Draws a picture of the OS status bar above, to show the safe area the header sits under. A real app has the system's own bar: leave it off and pad the header by the device's top inset.",
    },
    clock: {
      type: "string",
      default: "9:41",
      description: "The status bar's clock.",
    },
    connection: {
      type: "enum",
      options: ["online", "connecting", "offline"],
      default: "online",
      description: "A one-line status under the header while the socket is not connected.",
    },
    onBack: {
      type: "event",
    },
    onAction: {
      type: "event",
      args: "action: IconActionItem",
    },
    onProfile: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "not-applicable",
      alternative: "web-top-bar. In a browser the browser draws the status of the device and the back button; the app's top bar carries search, Help and the ⋯ menu.",
    },
    desktop: {
      status: "not-applicable",
      alternative: "title-bar. A desktop window has a title bar with window controls, history buttons and search; notifications and the profile live in the nav rail.",
    },
    mobile: {
      status: "partial",
      base: "Views and Text in StyleSheet over useTheme() tokens (fonts by file; the status bar's clock in the system face), IconButton for bell, back and actions, a Pressable around the Avatar, the kit's Spinner for Connecting…; title as accessibilityRole header. The drawn status bar is a stand-in: in the app the header sits in SafeAreaView edges={['top']} with expo-status-bar",
      import: "import { MobileHeader } from \"@antfabric-ui/react-native/shell\"",
      notes: [
        "main is MainHeader today: the 28pt title is Figtree, not the Heading face; the bell and photo are 40pt boxes 8pt apart, 12pt under the status bar on the 12pt gutter.",
        "The bell pushes /notifications onto the root stack (ADR-9417) and rings on the tap; the photo pushes /profile (ADR-9419), named 'Settings' to VoiceOver. The unread badge on the bell is new in this spec — today the bell has no count.",
        "pushed is Screen's header: 16 SemiBold title, 12 Medium faint subtitle, the row centred on the 40pt controls, and a 12pt gap under it (V2, 2026-10-15). A title somebody else named (a channel, a person) is held to one line.",
        "iOS/Android: V2 today starts the title and uses Ionicons chevron-back on both. titleAlign 'platform' gives iOS's centred title and Android's left title with an arrow — the owner to choose.",
        "Status-bar ink follows the theme (dark ink on light, light ink in dark mode) via expo-status-bar. Android 15 is edge-to-edge by force, so the header always pads by the top inset rather than trusting a translucent bar.",
      ],
      gestures: [
        {
          gesture: "Tap bell",
          action: "Rings, and pushes Notifications",
        },
        {
          gesture: "Tap photo",
          action: "Pushes Settings (profile)",
        },
        {
          gesture: "Long press photo",
          action: "Opens the workspace switcher sheet when more than one workspace is signed in",
        },
        {
          gesture: "Swipe from the left edge (iOS) / system back (Android)",
          action: "Same as the back control; Android 14+ shows the predictive-back peek",
        },
        {
          gesture: "Tap status bar (iOS)",
          action: "Scrolls the screen's list to the top",
        },
      ],
    },
  },
  a11y: {
    notes: [
      "The title is the screen's heading (accessibilityRole header) and the first thing VoiceOver reads after the back control.",
      "The bell's name carries the count: 'Notifications, 3 unread'. The connection line is a polite live region on Android and is also announced once when it appears, since iOS has no live regions.",
      "Header titles grow with Dynamic Type up to 1.3x so they stay on one line; the rows and buttons are not fixed-height.",
      "The status bar and its clock are a picture, hidden from the accessibility tree and off by default: the system draws the real one. The header does not read the device's safe-area insets itself; the app pads it by the top inset.",
    ],
  },
  examples: [
    {
      name: "Messages tab",
      width: 393,
    },
    {
      name: "Nothing unread",
      props: {
        actions: [{ key: "notifications", icon: "bell", label: "Notifications" }],
      },
      width: 393,
    },
    {
      name: "Channel",
      props: {
        variant: "pushed",
        actions: [{ key: "details", icon: "info", label: "Channel details" }],
        title: "release-train",
        titleGlyph: "hash",
        subtitle: "7 members",
      },
      width: 393,
    },
    {
      name: "Channel on Android",
      props: {
        variant: "pushed",
        actions: [{ key: "details", icon: "info", label: "Channel details" }],
        title: "release-train",
        titleGlyph: "hash",
        subtitle: "7 members",
      },
      os: "android",
      width: 393,
    },
    {
      name: "Private channel, two actions",
      props: {
        variant: "pushed",
        title: "leadership-sync",
        titleGlyph: "lock",
        subtitle: "5 members",
        actions: [
          {
            key: "search",
            icon: "search",
            label: "Search in channel",
          },
          {
            key: "details",
            icon: "info",
            label: "Channel details",
          },
        ],
      },
      width: 393,
    },
    {
      name: "Thread",
      props: {
        variant: "pushed",
        title: "Thread",
        subtitle: "#design-crit",
        actions: [],
      },
      width: 393,
    },
    {
      name: "V2 today — start-aligned",
      props: {
        variant: "pushed",
        title: "Pinned messages",
        titleAlign: "start",
        actions: [],
      },
      os: "ios",
      width: 393,
    },
  ],
  matrix: [
    {
      prop: "variant",
      cases: [
        { name: "main", props: { variant: "main", actions: MOBILE_HEADER_ACTIONS } },
        { name: "pushed", props: { variant: "pushed", actions: [MOBILE_HEADER_DETAILS] } },
      ],
    },
    {
      prop: "connection",
    },
  ],
  states: ["pressed"],
  edgeCases: [
    {
      title: "The bell has no count today",
      platforms: ["mobile"],
      handling: "The spec adds the coral badge on the bell, capped at 9+, from the same server count as the desktop rail's Notifications. Reading a notification on any device lowers it; it is never cleared just by opening the inbox screen.",
      example: {
        name: "27 unread",
        props: {
          actions: [{ key: "notifications", icon: "bell", label: "Notifications", badge: 27 }],
        },
        width: 393,
      },
    },
    {
      title: "A long title",
      platforms: ["mobile"],
      handling: "Large titles and pushed titles stay on one line with an ellipsis, and never push the bell, photo or actions off screen. The full name is what VoiceOver reads; tapping a channel's title opens its details.",
      example: {
        name: "Long channel name",
        props: {
          variant: "pushed",
          actions: [{ key: "details", icon: "info", label: "Channel details" }],
          title: "customer-escalations-emea-q4-renewals",
          titleGlyph: "hash",
          subtitle: "212 members",
        },
        width: 393,
      },
    },
    {
      title: "Connecting and offline",
      platforms: ["mobile"],
      handling: "After 2 s without a socket the header says 'Connecting…' with a spinner; once the OS reports no network it says 'Offline — showing what's on this phone'. Sends are refused while offline. The line disappears the moment the socket is back, with no 'Connected' flash.",
      example: {
        name: "Offline",
        props: {
          connection: "offline",
        },
        width: 393,
      },
    },
    {
      title: "Text at 130%",
      platforms: ["mobile"],
      handling: "Font scale is capped at 1.3× (maxFontSizeMultiplier). The header's height is a minimum, so the row grows; the 28pt title truncates before the controls move, and the 40pt controls do not scale.",
    },
    {
      title: "Right-to-left",
      platforms: ["mobile"],
      handling: "The row mirrors: the back control moves to the right and its glyph points right; bell and photo move to the left. A start-aligned title aligns right.",
    },
    {
      title: "Notch, Dynamic Island, landscape",
      platforms: ["mobile"],
      handling: "The header pads by the safe-area top inset, never a constant: 47pt under the Dynamic Island, 24–32dp on Android, 0 in iPhone landscape where the status bar hides. Landscape adds the side insets so the back control clears the notch.",
      example: {
        name: "Landscape, no status bar",
        props: {
          statusBar: false,
          variant: "pushed",
          actions: [{ key: "details", icon: "info", label: "Channel details" }],
          title: "release-train",
          titleGlyph: "hash",
          subtitle: "7 members",
        },
        width: 393,
      },
    },
    {
      title: "Notifications turned off for AntFabric",
      platforms: ["mobile"],
      handling: "The bell still works — the inbox is in-app and the count comes from the server. The Notifications screen opens with 'Notifications are off for AntFabric' and a button to the system settings.",
    },
    {
      title: "Photo fails to load",
      platforms: ["mobile"],
      handling: "The avatar shows initials first and fades the photo in when it decodes; a 404 keeps the initials for the session. The button is never an empty circle.",
    },
  ],
  related: ["tab-bar", "workspace-switcher", "web-top-bar", "title-bar", "notification-inbox"],
  flows: [
    {
      id: "bell-opens-notifications",
      title: "The bell rings and opens Notifications",
      description: "A tab's header is two controls and a title. The bell answers the tap with a ring, then pushes Notifications on top of everything, tab bar included.",
      platforms: ["mobile"],
      width: 393,
      steps: [
        {
          kind: "data",
          title: "The tab screen builds its header",
          detail: "MainHeader takes the tab's title and your photo. The bell has no count today; the spec's count would come from useUnreadCountQuery, which already exists (one row per page, polled every minute) but nothing draws yet.",
          code: "<MainHeader title=\"Messages\" me={me} />",
        },
        {
          kind: "trigger",
          title: "The bell is tapped",
          detail: "A 40pt target beside your photo. VoiceOver reads 'Notifications, 3 unread'.",
        },
        {
          kind: "motion",
          title: "The bell rings",
          detail: "The bell swings −12°, 10.2°, −6° and 3° about its top while the clapper slides inside it, over 1.1s. It plays on the tap, so the ring is feedback rather than news.",
        },
        {
          kind: "event",
          title: "onAction(notifications) fires",
          code: "onAction?.(action)  // { key: \"notifications\", … }",
        },
        {
          kind: "effect",
          title: "Notifications is pushed onto the root stack",
          detail: "A stack screen, not a tab, so it covers the tab bar, and Back or a swipe from the left edge returns here (ADR-9417).",
          code: "router.push('/notifications')",
        },
        {
          kind: "motion",
          title: "The screen slides in from the right",
          detail: "The root stack's slide_from_right. Its header is the pushed kind: Back where the large title was, and the title in the middle on iOS.",
          enter: "slide-left",
        },
        {
          kind: "result",
          title: "Notifications, with a way back",
          detail: "No subtitle; Read all appears on the right once something is unread. Reading a notification lowers the count on every device; opening the screen alone never clears it.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
            },
            children: [
              {
                el: "component",
                use: "mobile-header",
                props: {},
              },
            ],
          },
        },
        {
          step: 1,
          press: "Notifications, 3 unread",
          hold: 1100,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
            },
            children: [
              {
                el: "component",
                use: "mobile-header",
                props: {},
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
            },
            children: [
              {
                el: "component",
                use: "mobile-header",
                props: {},
              },
              {
                el: "component",
                use: "mobile-header",
                enter: "slide-left",
                style: {
                  position: "absolute",
                  inset: 0,
                },
                props: {
                  variant: "pushed",
                  title: "Notifications",
                  subtitle: "",
                  titleGlyph: "",
                  actions: [],
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "go-back",
      title: "Back from #release-train to Messages",
      description: "A pushed screen's header leads with Back. Back, the edge swipe and Android's system back all leave the same way, and a screen with nothing behind it falls back to its tab instead of doing nothing.",
      platforms: ["mobile"],
      width: 393,
      steps: [
        {
          kind: "data",
          title: "The pushed screen builds its header",
          detail: "Screen draws the back control the screen hands it, the title, the channel's # and the member line as the subtitle.",
          code: "<Screen title={headerTitle} subtitle={memberLine} headerLeft={back} titleGlyph={channelGlyph} />",
        },
        {
          kind: "trigger",
          title: "Back is tapped",
          detail: "Or a swipe from the left edge on iOS, or the system back on Android, with the predictive-back peek on 14 and later.",
        },
        {
          kind: "event",
          title: "onBack fires",
          code: "onBack?.()  // goBack()",
        },
        {
          kind: "effect",
          title: "The router pops, or falls back to the tab",
          detail: "A channel opened from a notification on a cold start has nothing behind it, so Back replaces it with the Messages tab rather than doing nothing.",
          code: "if (router.canGoBack()) router.back(); else router.replace(fallback)",
        },
        {
          kind: "motion",
          title: "The channel slides away to the right",
          detail: "The pop reverses slide_from_right: #release-train leaves to the right and Messages is uncovered with its large title, bell and photo.",
        },
        {
          kind: "result",
          title: "Back on Messages, where you left it",
          detail: "The list keeps its scroll position and the tab bar is visible again.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
            },
            children: [
              {
                el: "component",
                use: "mobile-header",
                props: {},
              },
              {
                el: "component",
                use: "mobile-header",
                style: {
                  position: "absolute",
                  inset: 0,
                },
                props: {
                  variant: "pushed",
                  actions: [{ key: "details", icon: "info", label: "Channel details" }],
                  title: "release-train",
                  titleGlyph: "hash",
                  subtitle: "7 members",
                },
              },
            ],
          },
        },
        {
          step: 1,
          press: "Back",
          hold: 1000,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
            },
            children: [
              {
                el: "component",
                use: "mobile-header",
                props: {},
              },
              {
                el: "component",
                use: "mobile-header",
                style: {
                  position: "absolute",
                  inset: 0,
                },
                props: {
                  variant: "pushed",
                  actions: [{ key: "details", icon: "info", label: "Channel details" }],
                  title: "release-train",
                  titleGlyph: "hash",
                  subtitle: "7 members",
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 393,
            },
            children: [
              {
                el: "component",
                use: "mobile-header",
                props: {},
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
