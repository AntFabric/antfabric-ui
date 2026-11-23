import type { ComponentDocs } from "../../types";
import { TAB_BAR_ACTION, TAB_BAR_TABS } from "../../samples";

const docs: ComponentDocs = {
  id: "tab-bar",
  name: "Tab bar",
  category: "shell",
  level: "organism",
  status: "beta",
  description: "The phone's navigation: a floating 56pt pill of four tabs and, beside it, the Fabric disc that opens the assistant. The chosen tab is a 100pt tinted capsule with its icon over its label; the others are icons alone. Scrolling a list squeezes the bar down to a 42pt circle holding the current tab, and it steps aside while the keyboard is up.",
  props: {
    tabs: {
      type: "array",
      default: [],
      sample: TAB_BAR_TABS,
      description: "NavItem: { key, label, icon, badge?, max?, badgeLabel? } left to right. Meetings never badges — a schedule is not a backlog.",
    },
    active: {
      type: "string",
      default: "",
      sample: "messages",
      description: "The key of the open tab. A key no tab has (\"none\" while a pushed screen is on top) draws no capsule: the tabs share the width evenly.",
    },
    expanded: {
      type: "boolean",
      default: true,
      description: "The tabs are shown. Left (false) is the bar squeezed by scrolling down: a 42pt circle (a 44pt touch area) with the current tab's icon, or a chevron when no tab is open. Scrolling up or a tap opens it again.",
    },
    keyboardUp: {
      type: "boolean",
      default: false,
      description: "The bar is not drawn while the keyboard is up.",
    },
    safeArea: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Draws a picture of the home indicator (iOS) or gesture handle (Android) beneath, to show the bar sits 12pt above the safe area. A real app has the system's own: leave it off.",
    },
    action: {
      type: "object",
      sample: TAB_BAR_ACTION,
      description: "ActionItem: { key, label, icon?, badge?, disabled? }. The floating round button beside the bar; its `label` is its accessible name, with the `badge` count after it ('Fabric, 2 new'). `badge` draws a count on its corner; `disabled` dims it and takes no press. Leave it out for none.",
    },
    onActiveChange: {
      type: "event",
      args: "active: string",
      changes: "active",
    },
    onExpandedChange: {
      type: "event",
      args: "expanded: boolean",
      changes: "expanded",
    },
    onAction: {
      type: "event",
      args: "action: ActionItem",
    },
  },
  platforms: {
    web: {
      status: "not-applicable",
      alternative: "nav-rail. Web and desktop navigate with the left rail — 64px of icons, 248px with labels. A phone-sized browser is offered the mobile app rather than a web bottom bar.",
    },
    desktop: {
      status: "not-applicable",
      alternative: "nav-rail. The desktop's one persistent navigation column; the assistant is the rail's first row rather than a floating disc.",
    },
    mobile: {
      status: "partial",
      base: "Views and Pressables (accessibilityRole tablist / tab, accessibilityState.selected) in StyleSheet over useTheme() tokens, with Badge and Icon. The pill and the squeezed circle are GlassSurface, so iOS 26+ draws them as Liquid Glass. Each tab's capsule and width (flex-grow 1 → 1.7) move on React Native Animated; on iOS 26+ the selection lens is a PanResponder over the tabs driving an Animated GlassSurface (clear): springy lift, follows the finger, settles on release. In the app it is the tabBar of expo-router's <Tabs>, under react-native-safe-area-context's bottom inset",
      import: "import { TabBar } from \"@antfabric/ui-react-native/shell\"",
      notes: [
        "Drawn over the screens (absolute), 12pt above the safe area on the 12pt gutter; a scrolling tab keeps bottomBarReserve free at its foot so the last row is never under the bar.",
        "Nothing is laid out by React: positions come from two springs on the UI thread, so on a switch the capsule stretches toward the new tab and its back edge catches up ('liquid', owner 2026-10-15). The catalogue draws the resting state.",
        "The capsule is the bar's tint (#FDE8E8, --brand-tint) with a coral icon and label (ADR-9406). The label is 12, the app's type floor, not the component set's 10.",
        "Fabric is a pushed screen on the root stack (ADR-9414): it covers the bar, so the bar has no list of routes to hide on.",
        "Today: only Messages is built (the other three are blank), and no tab has a badge. Per-tab badges are new in this spec, capped at 9+.",
        "Light haptic on every tab press and on the Fabric disc.",
        "iOS 26+: Liquid Glass — the surface is drawn through expo-glass-effect's GlassView (gated on its availability check; the material itself follows the device's Clear / Tinted, Reduce Transparency and Increase Contrast settings). iOS 18 and earlier keep today's blur/opaque look. The selected capsule keeps its tint on top of the glass; the Fabric disc stays brand-tinted, as a prominent control does on iOS 26.",
        "Pressing a tab sets `active`: the capsule grows toward it (flex-grow spring) while the old one shrinks, and the label fades in. Pressing the squeezed circle expands the bar again. The bar keeps both itself until the app passes them back (useControllable), reporting through onActiveChange and onExpandedChange, so the catalogue preview is interactive.",
        "iOS 26+: the selection lens. Touching the bar lifts the selected capsule into a larger clear-glass lens (about 1.2×). Dragging moves it across the tabs, stretching with speed and magnifying the icon beneath. Releasing settles it into that tab with a spring and selects it. A tap does the same in one motion. In the kit: a PanResponder claims a sideways drag from the tabs and drives an Animated GlassSurface on the JS driver (its width and position are layout); a tap stays the tab's own press, so VoiceOver and Switch Control activate tabs as usual. The haptic on each tab crossed is the app's, since the kit has no expo-haptics. iOS 18 and Android keep the tinted capsule that flows to the pressed tab.",
      ],
      gestures: [
        {
          gesture: "Tap a tab",
          action: "Switches, with a light haptic",
        },
        {
          gesture: "Tap the current tab",
          action: "Scrolls its list to the top; a second tap pops to the tab's root",
        },
        {
          gesture: "Tap the Fabric disc",
          action: "Pushes the assistant",
        },
        {
          gesture: "Scroll down / up",
          action: "Squeezes the bar to a circle / opens it again",
        },
        {
          gesture: "Tap the squeezed circle",
          action: "Opens the bar without scrolling",
        },
      ],
    },
  },
  a11y: {
    role: "tablist",
    notes: [
      "Each tab is role tab with selected state, so VoiceOver says 'Messages, tab, 1 of 4, selected'. Badges join the name: 'Inbox, 12 new'.",
      "Squeezed, the hidden tabs and the disc leave the accessibility tree and the circle is one button: 'Show tabs. Messages is open'.",
      "Reduce Motion is followed live: turning it on in Settings stops the capsule's growth and the lens's spring on the next change, with no restart.",
      "Dynamic Type: the bar and each tab take a minimum height, so they grow with the text; labels are capped at 1.3x, and from a 1.3x font scale every tab shows its label, not only the open one.",
      "A bar holds five tabs: each keeps at least the 44pt touch width, and a sixth makes the bar wider than the screen. A development build warns; put the rest behind a \"More\" tab.",
    ],
  },
  examples: [
    {
      name: "Messages",
      width: 393,
    },
    {
      name: "Inbox",
      props: {
        active: "inbox",
      },
      width: 393,
    },
    {
      name: "Meetings",
      props: {
        active: "meetings",
      },
      width: 393,
    },
    {
      name: "Squeezed on scroll",
      props: {
        expanded: false,
      },
      width: 393,
    },
    {
      name: "Under a pushed screen (Fabric)",
      props: {
        active: "none",
      },
      width: 393,
    },
    {
      name: "Android gesture handle",
      os: "android",
      width: 393,
    },
  ],
  matrix: [
    {
      prop: "active",
      values: ["messages", "recording", "inbox", "meetings", "none"],
    },
    {
      prop: "expanded",
      values: [true, false],
    },
  ],
  states: ["pressed"],
  edgeCases: [
    {
      title: "The floating action, busy or waiting",
      platforms: ["mobile"],
      handling: "The action is an ActionItem like any other: a `badge` draws its count on the button's corner and is read with its name ('Fabric, 2 new'); `disabled` dims it, takes no press and is announced as dimmed, for a moment the app cannot start what it opens.",
      example: {
        name: "Action with a count",
        props: {
          action: {
            key: "fabric",
            icon: "sparkles",
            label: "Fabric",
            badge: 2,
          },
        },
      },
    },
    {
      title: "Badge counts",
      platforms: ["mobile"],
      handling: "Each tab caps at 9+; the number is the same server count as the desktop rail and the home-screen icon badge. Recording counts untranscribed recordings, Meetings never badges.",
      example: {
        name: "Busy morning",
        props: {
          tabs: [
            {
              key: "messages",
              label: "Messages",
              icon: "message-circle",
              badge: 48,
            },
            {
              key: "recording",
              label: "Recording",
              icon: "mic",
              badge: 2,
            },
            {
              key: "inbox",
              label: "Inbox",
              icon: "inbox",
              badge: 230,
            },
            {
              key: "meetings",
              label: "Meetings",
              icon: "video",
              badge: 0,
            },
          ],
        },
        width: 393,
      },
    },
    {
      title: "The keyboard is up",
      platforms: ["mobile"],
      handling: "The bar steps aside entirely (it owns no input, so nothing is lost) and the screen's reserve drops to the keyboard's own inset. It returns when the keyboard hides, without animating over the composer.",
    },
    {
      title: "Long labels and 130% text",
      platforms: ["mobile"],
      handling: "The capsule stays 100pt; its label is capped at 1.3× and truncates with an ellipsis ('Besprechu…'). The full label is the tab's accessible name. The other tabs are icons, so scaling never crowds them.",
      example: {
        name: "German",
        props: {
          active: "meetings",
          tabs: [
            {
              key: "messages",
              label: "Nachrichten",
              icon: "message-circle",
              badge: 3,
            },
            {
              key: "recording",
              label: "Aufnahme",
              icon: "mic",
              badge: 0,
            },
            {
              key: "inbox",
              label: "Posteingang",
              icon: "inbox",
              badge: 0,
            },
            {
              key: "meetings",
              label: "Besprechungen",
              icon: "video",
              badge: 0,
            },
          ],
        },
        width: 393,
      },
    },
    {
      title: "Small phones",
      platforms: ["mobile"],
      handling: "At 320pt wide the three idle tabs get (track − 100) / 3 each, about 44pt — still the minimum hit area. Nothing below 320 is supported.",
      example: {
        name: "320pt wide",
        props: {
          active: "recording",
        },
        width: 320,
      },
    },
    {
      title: "Reduced motion",
      platforms: ["mobile"],
      handling: "No springs: the capsule jumps to the new tab, the squeeze snaps, and the icon motions (bell ring, mic pulse) do not play.",
    },
    {
      title: "Android three-button navigation",
      platforms: ["mobile"],
      handling: "The bottom inset is the 48dp button bar instead of the gesture handle; the bar still sits 12pt above it, and the system bar's background follows the theme so the buttons stay legible.",
    },
    {
      title: "App killed, reopened from a notification",
      platforms: ["mobile"],
      handling: "A cold start from a push lands on the right tab with the message pushed on top; the bar appears with that tab selected and badges from the push payload until the socket refreshes them.",
    },
    {
      title: "Liquid Glass and earlier iOS",
      platforms: ["mobile"],
      handling: "On iOS 26+ the floating pill and its squeezed circle are Liquid Glass, so the content scrolling under them shows through. The glass follows the iPhone's own settings with no work from us, because the kit draws it with the system material (GlassView): Clear or Tinted (Settings → Display & Brightness → Liquid Glass) changes how much shows through, Reduce Transparency makes it frosted and nearly opaque while keeping its shape, and Increase Contrast adds a contrasting edge. The app subscribes to AccessibilityInfo 'reduceTransparencyChanged' only to adjust what it draws around the glass. iOS before 26 keeps the blur look. This happens live in the app as the person changes the setting.",
    },
    {
      title: "The selection lens on iOS 26",
      platforms: ["mobile"],
      handling: "On iOS 26+ the selection becomes a glass lens while the finger is down and follows it across the tabs. Releasing outside the bar cancels and the lens returns to the current tab. Reduce Motion keeps the lens but removes the stretch and the overshoot. VoiceOver users switch tabs by swiping, so no gesture is needed. On iOS 18 and Android the bar has no lens: a tap moves the tinted capsule.",
    },
  ],
  related: ["nav-rail", "mobile-header", "app-icon-badge"],
  flows: [
    {
      id: "switch-tab",
      title: "Switch to Inbox from the floating bar",
      description: "The bar holds no selection of its own: expo-router tells it which tab is on screen. A tap asks the navigator to switch, and the capsule flows after the new tab.",
      platforms: ["mobile"],
      width: 393,
      steps: [
        {
          kind: "data",
          title: "The bar reads the tab state expo-router hands it",
          detail: "Tabs passes the navigator's state and navigation to the custom bar, and the bar finds the current tab's index in its own list. Badges are new in this spec; today no tab carries a count.",
          code: "const current = state.routes[state.index]?.name; const index = TABS.findIndex((t) => t.route === current)",
        },
        {
          kind: "trigger",
          title: "Inbox is tapped",
          detail: "Anywhere on the tab. On iOS 26 the finger can also land on the current tab and drag the selection across to Inbox.",
        },
        {
          kind: "motion",
          title: "On iOS 26 the selection lifts into a glass lens",
          detail: "While the finger is down the capsule becomes a clear-glass lens about 1.2× bigger, magnifying the icon under it, and dragging moves it tab to tab with a light haptic on each. Releasing settles it into Inbox. New in this spec: today's bar draws no glass. Earlier iOS and Android go straight to the capsule move.",
        },
        {
          kind: "event",
          title: "onActiveChange('inbox') fires",
          detail: "The bar hands back the tab's key. In the app this is the navigator's own tabPress event, which a screen can claim before the switch happens.",
          code: "onActiveChange?.(item.key)  // navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })",
        },
        {
          kind: "effect",
          title: "expo-router switches tabs",
          detail: "A light haptic, the bar opens again if it was squeezed, and the navigator moves unless the screen claimed the press (the spec's scroll-to-top on a second tap of the current tab).",
          code: "if (current !== name && !event.defaultPrevented) navigation.navigate(name)",
        },
        {
          kind: "motion",
          title: "The capsule stretches toward Inbox, then its back edge catches up",
          detail: "Two springs chase the new index on the UI thread: lead (stiffness 260) and trail (stiffness 120). The capsule spans both, thinning slightly at full stretch, and settles in about 0.35s. The label fades in as it arrives. With Reduce Motion both jump.",
          enter: "fade",
        },
        {
          kind: "result",
          title: "Inbox is on screen, its tab tinted coral",
          detail: "The capsule is 100pt with the icon over the label; the other three share what's left. VoiceOver reads 'Inbox, tab, 3 of 4, selected'.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {},
        },
        {
          step: 1,
          press: "Inbox, 12 new",
          hold: 1000,
          props: {},
        },
        {
          step: 5,
          hold: 1700,
          props: {
            active: "inbox",
          },
        },
      ],
    },
    {
      id: "squeeze-on-scroll",
      title: "Scrolling squeezes the bar, a tap opens it",
      description: "Reading a long list, the bar gets out of the way as a 42pt circle holding the current tab. Scrolling back up, or tapping the circle, brings the whole bar back.",
      platforms: ["mobile"],
      width: 393,
      steps: [
        {
          kind: "data",
          title: "Squeezed lives in a small store",
          detail: "Any list can squeeze the bar; the bar only draws what the store says.",
          code: "const collapsed = useBottomBarStore((s) => s.collapsed)",
        },
        {
          kind: "trigger",
          title: "The Messages list scrolls down",
          detail: "12pt of travel in one direction decides it, so a few points of jitter don't. Reaching the top always opens the bar.",
          code: "if (travel.current > barSqueeze.slopPt) setCollapsed(true)",
        },
        {
          kind: "state",
          title: "collapsed becomes true",
          detail: "Setting the value it already has returns the same state, so a scroll handler firing every frame re-renders nothing.",
          code: "setCollapsed: (collapsed) => set((s) => (s.collapsed === collapsed ? s : { collapsed }))",
        },
        {
          kind: "motion",
          title: "The pill shrinks into a 42pt circle and the Fabric disc fades",
          detail: "One spring (damping 20, stiffness 200) with about 3% overshoot. The capsule slides to the start and becomes the circle's tinted disc, so the current tab's icon doesn't jump; Fabric fades and shrinks to 0.6.",
        },
        {
          kind: "trigger",
          title: "The squeezed circle is tapped",
          detail: "Or the list scrolls back up 12pt. VoiceOver reads the circle as one button: 'Show tabs. Messages is open'.",
        },
        {
          kind: "event",
          title: "onExpandedChange(true) fires",
          code: "onExpandedChange?.(true)  // setCollapsed(false)",
        },
        {
          kind: "motion",
          title: "The bar springs back to full width",
          detail: "The same spring in reverse: the four tabs and the Fabric disc return, with the capsule still on Messages.",
        },
        {
          kind: "result",
          title: "The tabs are back, and leaving the screen restores them too",
          detail: "A screen that squeezed the bar opens it again when it loses focus, so the next tab never inherits a squeezed bar.",
          code: "useFocusEffect(useCallback(() => () => setCollapsed(false), [setCollapsed]))",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1200,
          props: {},
        },
        {
          step: 3,
          hold: 1600,
          props: {
            expanded: false,
          },
        },
        {
          step: 4,
          press: "Show tabs. Messages is open",
          hold: 900,
          props: {
            expanded: false,
          },
        },
        {
          step: 6,
          hold: 1700,
          props: {},
        },
      ],
    },
  ],
};

export default docs;
