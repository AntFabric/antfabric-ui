import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "tabs",
  name: "Tabs",
  category: "navigation",
  level: "molecule",
  status: "beta",
  description: "A row of labels on a hairline rule with one brand-coloured bar under the chosen one. It switches what part of a view you are looking at: the channel shelf (Messages, Pinned, Files, Canvas), Upcoming and Past inside a project's Meetings, a phone screen's top filter. A tab may carry a count of how many are in it. On desktop the single bar slides between tabs.",
  props: {
    items: {
      type: "array",
      required: true,
      description: "[{ key, label, badge?, badgeMore?, title?, disabled? }]. disabled draws the tab dimmed and skipped by the arrows and by a press. badge is how many are in there, never how many need you, so it is a quiet bordered chip and never the brand colour; 0 or missing draws no chip. badgeMore draws 100+ for a count from a capped read. title is a tooltip for a one-word label whose scope is not in the word.",
      sample: [
        {
          key: "messages",
          label: "Messages",
          title: "Messages in this channel",
        },
        {
          key: "pinned",
          label: "Pinned",
          badge: 3,
          title: "Pinned messages in this channel",
        },
        {
          key: "files",
          label: "Files",
          badge: 12,
          title: "Files shared in this channel",
        },
        {
          key: "canvases",
          label: "Canvas",
          badge: 2,
          title: "Canvases shared in this channel",
        },
      ],
    },
    value: {
      type: "string",
      default: "",
      sample: "messages",
      description: "The chosen tab's key. A value that matches no item is allowed and draws no bar, for a strip whose panel can be closed. Never default to the first item.",
    },
    full: {
      type: "boolean",
      default: false,
      description: "Tabs share the SPARE width of the strip (flex 1 0 auto), labels centred, and the bar spans its tab's share. For a narrow column such as the project rail; a wide pane keeps its labels left.",
    },
    rule: {
      type: "boolean",
      default: true,
      description: "Draws the hairline the bar sits on. false only when the container already draws that divider, so there is one line with one owner.",
    },
    label: {
      type: "string",
      sample: "Channel shelf",
      description: "The strip's accessible name.",
    },
    panels: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "The product draws a tabpanel for each tab with the id <id>-panel-<key>: each tab then names it in aria-controls. <id> is the strip's id, or a generated one.",
    },
    onValueChange: {
      type: "event",
      args: "key: string",
      changes: "value",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <div role=\"tablist\"> of <button role=\"tab\"> with a roving tabindex, inline styles over `t`; ← → Home End select; the brand bar under each tab scales in with a transform transition; `value` through useControllable(value, onValueChange)",
      import: "import { Tabs } from \"@antfabric/ui-react\"",
      notes: [
        "Web uses the desktop's values (a 32px strip, 12px labels). The web profile's taller controls do not apply here: a tab strip is not a row of buttons.",
        "When the tabs switch a routed view (a project's Meetings, a person's profile), each tab is a link (Tabs.Tab render={<Link>}), so the URL holds the choice, Back returns to the previous tab, ⌘-click opens it in a new browser tab and a shared link lands on the same tab.",
        "The bar animates left and right separately, the leading edge in 180 ms and the trailing edge in 250 ms, so it stretches toward the new tab and its tail catches up, as on desktop.",
      ],
      keyboard: [
        {
          keys: "ArrowLeft / ArrowRight",
          action: "Moves to and selects the previous / next tab; wraps at the ends",
        },
        {
          keys: "Home / End",
          action: "Selects the first / last tab",
        },
        {
          keys: "Tab",
          action: "Leaves the strip for the panel; only the chosen tab is in the tab order",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same tablist as web at desktop density",
      import: "import { Tabs } from \"@antfabric/ui-react\"",
      notes: [
        "The bar is ONE absolutely positioned element that travels (ADR-0518). It is 2px tall and sits 1px below the strip so it covers the hairline: it reads as a break in the rule, not a second line. The catalogue draws a bar under every tab, scaled to nothing except under the chosen one, so pressing a tab (it sets `value`) shrinks the old bar while the new one grows: the nearest a static renderer gets to the travel.",
        "The motion moves the travel edges separately, not with a transform: the edge in front arrives in 180 ms and the one behind in 250 ms, ease-out. The cross axis is placed, never eased, so a strip being resized never animates.",
        "Underlined tabs have no horizontal padding, so the bar is exactly as wide as the word. Labels are semibold whether chosen or not, so nothing changes width while the bar is moving; only the ink changes (text.strong chosen, text.faint not, ADR-1097).",
        "Two uses are sanctioned: a strip inside a pane a segmented strip already chose (Upcoming / Past, ADR-0664), and the channel shelf (ADR-1093). A segmented strip never goes inside a segmented strip; the inner one is always this.",
        "Pass rule={false} when the container draws the divider: the channel shelf puts a + beside its tabs, so the band owns the one line (ADR-1096).",
        "New in this spec: horizontal overflow (today the strip squeezes its labels), arrow-key roving focus (today the tabs are plain buttons), and a label-ink hover for unchosen tabs.",
      ],
      keyboard: [
        {
          keys: "ArrowLeft / ArrowRight",
          action: "Moves to and selects the previous / next tab",
        },
        {
          keys: "Home / End",
          action: "Selects the first / last tab",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "A horizontal ScrollView (accessibilityRole tablist) of Pressable tabs (accessibilityState.selected), StyleSheet over useTheme(); the bar scales in with Animated.timing; `value` through useControllable(value, onValueChange)",
      import: "import { Tabs } from \"@antfabric/ui-react-native\"",
      notes: [
        "Top tabs sit directly under a pushed screen's header: edge to edge, with the rule across the full width and the first label on the 12pt gutter.",
        "44pt tall, 14pt semibold labels, 16pt apart. The bar is under the word; each tab gets 8pt of hitSlop either side so neighbouring targets meet with no dead space.",
        "The bar does not slide on the phone. It moves to the chosen tab on the render after the tap, as V2's filter chips do (\"No smooth motion\").",
        "The chosen label is ink, not the brand colour. ReactionsSheet's hand-built strip draws its chosen label in the brand colour today; this spec keeps the brand colour for the bar only, as on desktop, and that sheet moves onto this component.",
        "Choosing a tab that is partly off screen scrolls it fully into view, as FilterChips does.",
        "Pressing a tab in the catalogue sets `value`; the bar there shrinks and grows between tabs, which the kit does not do (it just moves on the next render).",
        "New on the phone: the Notifications screen's All / DMs / Mentions and the channel details tabs do not exist yet. Today the channel's Pinned and Files are a ⋮ menu (ADR-8921) and the Messages list filters with chips.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Selects the tab, with a selection haptic; an unchosen label darkens while pressed",
        },
        {
          gesture: "Horizontal swipe on the strip",
          action: "Scrolls the strip when the tabs do not fit",
        },
      ],
    },
  },
  a11y: {
    role: "tablist",
    label: "{label}",
    notes: [
      "Each tab is role=tab with aria-selected / accessibilityState.selected; aria-selected is also what the sliding bar measures, so there is one way of saying chosen.",
      "On the web each tab has the id `<id>-tab-<key>` (the strip's `id`, or a generated one); with `panels` it also names `<id>-panel-<key>` in aria-controls, for the tabpanel the product draws. The kit draws no tabpanel itself.",
      "Arrow keys follow the page direction (in rtl, ArrowRight goes to the previous tab) and skip a disabled tab; a disabled tab is aria-disabled / accessibilityState.disabled, dimmed, and not selectable by press.",
      "The chosen tab is scrolled into view when it changes (web: scrollIntoView, phone: scrolled to the middle of the strip).",
      "Known gap: on the web the strip clips its focus ring (the strip scrolls, and a scroll box clips an outset shadow); the neutral theme draws the ring inset instead.",
      "The count chip is hidden and joins the tab's name: \"Files, 12\", or \"Assets, more than 100\" for a capped count.",
      "A tab whose label does not say its scope carries a title (\"Files shared in this channel\"), which the tooltip host shows.",
    ],
  },
  examples: [
    {
      name: "Channel shelf",
      width: 480,
    },
    {
      name: "Upcoming / Past, full width",
      props: {
        full: true,
        label: "Meetings",
        value: "upcoming",
        items: [
          {
            key: "upcoming",
            label: "Upcoming",
            badge: 3,
          },
          {
            key: "past",
            label: "Past",
            badge: 18,
          },
        ],
      },
      platforms: ["web", "desktop"],
      width: 280,
    },
    {
      name: "Notifications filter",
      props: {
        label: "Filter notifications",
        value: "all",
        items: [
          {
            key: "all",
            label: "All",
          },
          {
            key: "dms",
            label: "DMs",
            badge: 2,
          },
          {
            key: "mentions",
            label: "Mentions",
            badge: 3,
          },
        ],
      },
      platforms: ["mobile"],
      width: 393,
    },
    {
      name: "Channel details",
      props: {
        label: "#release-train details",
        value: "members",
        items: [
          {
            key: "about",
            label: "About",
          },
          {
            key: "members",
            label: "Members",
            badge: 24,
          },
          {
            key: "files",
            label: "Files",
            badge: 12,
          },
          {
            key: "pinned",
            label: "Pinned",
            badge: 3,
          },
        ],
      },
      platforms: ["mobile"],
      width: 393,
    },
    {
      name: "Profile",
      props: {
        label: "Profile",
        value: "about",
        items: [
          {
            key: "about",
            label: "About",
          },
          {
            key: "projects",
            label: "Projects",
            badge: 4,
          },
          {
            key: "meetings",
            label: "Meetings",
          },
        ],
      },
      width: 360,
    },
  ],
  matrix: [
    {
      prop: "full",
    },
    {
      prop: "rule",
    },
  ],
  states: ["hover", "pressed", "focus"],
  edgeCases: [
    {
      title: "Nothing chosen",
      platforms: ["web", "desktop", "mobile"],
      handling: "A value that matches no tab (empty, or a key no tab has) chooses none and draws no bar at all; the kit never falls back to the first tab. The channel shelf depends on it: with the details or thread panel open, no shelf tab is showing, and a bar under Files would be the strip telling a lie. When a tab is chosen again the bar is placed there, not slid in from where it last was. Tab then lands on the first enabled tab, the strip's one tab stop while none is chosen.",
      example: {
        name: "Thread panel open",
        props: {
          value: "",
        },
        width: 480,
      },
    },
    {
      title: "Nothing chosen and the first tab disabled",
      platforms: ["web", "desktop", "mobile"],
      handling: "A disabled tab is never chosen for the app: with no value matching, no tab is chosen, and on web and desktop Tab lands on the first enabled tab (Pinned here), from which the arrows move on, skipping the disabled one.",
      example: {
        name: "First tab disabled",
        props: {
          value: "thread",
          items: [
            { key: "messages", label: "Messages", disabled: true },
            { key: "pinned", label: "Pinned", badge: 3 },
            { key: "files", label: "Files", badge: 12 },
          ],
        },
        width: 480,
      },
    },
    {
      title: "More tabs than room",
      platforms: ["web", "desktop", "mobile"],
      handling: "Labels never wrap and never truncate: a two-line tab changes the strip's height and moves everything under it. The strip scrolls sideways instead, with no visible scrollbar and a 16px fade at whichever edge has more. Choosing or focusing a tab scrolls it fully into view. On web and desktop a vertical mouse wheel over the strip scrolls it sideways, because most mice have no horizontal wheel.",
      example: {
        name: "Narrow pane",
        width: 220,
      },
    },
    {
      title: "A huge count",
      platforms: ["web", "desktop", "mobile"],
      handling: "The chip caps at 99+ so one tab cannot outgrow its neighbours; the exact number stays in the tab's accessible name. A count from a capped read (one page of 100) is drawn 100+ with badgeMore, at least this many, never a bare 100 that reads as a fact (ADR-1026), and is announced as \"Assets, more than 100\".",
      example: {
        name: "Capped counts",
        props: {
          label: "Project rail",
          value: "assets",
          items: [
            {
              key: "assets",
              label: "Assets",
              badge: 100,
              badgeMore: true,
            },
            {
              key: "mentions",
              label: "Mentions",
              badge: 1204,
            },
            {
              key: "tasks",
              label: "Tasks",
              badge: 7,
            },
          ],
        },
        width: 360,
      },
    },
    {
      title: "A count that arrives after the strip draws",
      platforms: ["web", "desktop"],
      handling: "No chip until the count is known, never 0 and never a skeleton. When it arrives the tab widens, and the bar re-measures in the same frame: each tab is observed, not just the strip, because a tab can grow inside a strip that does not (ADR-9991, the Assets 334 bug). That re-measure only places the bar; a resize is never a journey.",
    },
    {
      title: "No swipe between panels on the phone",
      platforms: ["mobile"],
      handling: "Swiping the content left or right does not change tab. Horizontal swipes already belong to the rows (Notifications: swipe left for Mark read and Clear, ADR-9418) and to iOS's back gesture from the edge; a panel swipe would fight both. Tabs change by tapping the strip.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "Tabs grow taller with the text (font scale is capped at 1.3×) and the bar stays on the rule. A strip that fitted at 100% and no longer does at 393pt becomes scrollable rather than wrapping or shrinking a label.",
    },
    {
      title: "Reduced motion and right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "With reduced motion the desktop and web bar jumps to the chosen tab instead of stretching across; the label inks still cross-fade, since a colour change is not motion. The design tokens' global reduced-motion rule handles this, so the component adds no check of its own. In Arabic or Hebrew the tabs run right to left, ArrowRight moves toward the end of the reading order, and the bar travels leftward to the next tab.",
    },
    {
      title: "Keyboard only and screen readers",
      platforms: ["web", "desktop", "mobile"],
      handling: "Only the chosen tab is in the tab order; the arrows move and select (automatic activation, because every panel here is already loaded or shows its own skeleton). The focus ring is drawn around the label. VoiceOver and TalkBack read \"Mentions, 3, tab, 3 of 3\"; selecting announces through the selected state only, with no live region.",
    },
  ],
  related: ["segmented-control", "chip", "breadcrumbs"],
  flows: [
    {
      id: "switch-the-shelf",
      title: "Switch the channel shelf to Files",
      description: "The shelf says which part of the channel you are looking at. A tab hands its key to the pane, the pane opens that panel, and the one brand bar travels to it.",
      platforms: ["web", "desktop"],
      width: 480,
      steps: [
        {
          kind: "data",
          title: "Counts come from what the channel already holds",
          detail: "Pinned counts the pinned messages loaded for the channel, Files comes from the channel's info and Canvas rides the channel wire. The chosen tab is worked out from the side panel, so exactly one is always chosen.",
          code: "value={s.panel === 'files' || s.panel === 'canvases' || s.panel === 'pinned' ? s.panel : 'messages'}",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The URL holds the tab",
          detail: "The channel route validates ?panel=, so Back returns to the previous tab and a shared link opens on it. The counts come from the channel query the header already read.",
          code: "const { panel = 'messages' } = Route.useSearch()",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Files is clicked",
          detail: "Or ← → with the strip focused, which moves and selects. Only the chosen tab is in the Tab order.",
        },
        {
          kind: "event",
          title: "onValueChange fires with the tab's key",
          code: "onValueChange?.('files')",
        },
        {
          kind: "state",
          title: "The pane opens the Files panel",
          detail: "A direct mapping with no toggle, so clicking the chosen tab does nothing; Messages is the way back to the transcript.",
          code: "a.setPanel(next === 'files' || next === 'canvases' || next === 'pinned' ? next : 'none')",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The router writes the search param",
          detail: "Each tab is a Link, so ⌘-click opens that panel in a new browser tab.",
          code: "<Tabs.Tab render={<Link to=\".\" search={(s) => ({ ...s, panel: 'files' })} />} />",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The bar stretches to Files, then its tail catches up",
          detail: "One bar travels under the strip: the edge in front moves on the quick duration and the edge behind on the slow one, ease-out. Labels change ink only, so nothing changes width while it moves.",
        },
        {
          kind: "result",
          title: "Files is chosen and its panel is open",
          detail: "Files reads in ink, the others faint, and the Files panel sits beside the transcript.",
        },
      ],
      replay: [
        {
          step: 2,
          press: "Files, 12",
          hold: 1100,
          props: {
            items: [
              {
                key: "messages",
                label: "Messages",
                title: "Messages in this channel",
              },
              {
                key: "pinned",
                label: "Pinned",
                badge: 3,
                title: "Pinned messages in this channel",
              },
              {
                key: "files",
                label: "Files",
                badge: 12,
                title: "Files shared in this channel",
              },
              {
                key: "canvases",
                label: "Canvas",
                badge: 2,
                title: "Canvases shared in this channel",
              },
            ],
            value: "messages",
          },
        },
        {
          step: 6,
          hold: 1600,
          props: {
            items: [
              {
                key: "messages",
                label: "Messages",
                title: "Messages in this channel",
              },
              {
                key: "pinned",
                label: "Pinned",
                badge: 3,
                title: "Pinned messages in this channel",
              },
              {
                key: "files",
                label: "Files",
                badge: 12,
                title: "Files shared in this channel",
              },
              {
                key: "canvases",
                label: "Canvas",
                badge: 2,
                title: "Canvases shared in this channel",
              },
            ],
            value: "files",
          },
        },
      ],
    },
    {
      id: "who-reacted",
      title: "See who reacted, one emoji at a time",
      description: "A long-press on a reaction opens a sheet with a tab for each emoji on the message. The tab you pick decides whose faces the list shows.",
      platforms: ["mobile"],
      width: 393,
      steps: [
        {
          kind: "data",
          title: "One tab per reaction on the message",
          detail: "Built from the message's own reactions, so the counts are the server's; a reaction whose count has fallen to 0 gets no tab. It opens on the chip that was long-pressed, not the first tab.",
          code: "const tabs = useMemo(() => tabsFor(message), [message])  ·  setActive(initialTabIndex(tabsFor(message), initialEmoji))",
        },
        {
          kind: "trigger",
          title: "👀 is tapped",
          detail: "Each tab has hitSlop either side, so neighbouring targets meet with no dead space. The strip scrolls sideways when the reactions don't fit.",
        },
        {
          kind: "event",
          title: "onValueChange fires with the tab's key",
          detail: "Today's strip is hand-built and passes its index; on this component it passes the emoji.",
          code: "onValueChange?.('👀')",
        },
        {
          kind: "state",
          title: "The sheet keeps the choice itself",
          detail: "Local state, re-seeded only when the sheet opens on a new message, so a re-render never fights the tap.",
          code: "const [active, setActive] = useState(0)",
        },
        {
          kind: "motion",
          title: "The bar is under 👀 on the next render",
          detail: "No slide on the phone, as V2's filter chips. Today's strip also draws the chosen count in the brand colour; this spec keeps the brand colour for the bar alone.",
        },
        {
          kind: "result",
          title: "The list shows who reacted 👀",
          detail: "One line per person with their face and title, scrolling inside the sheet, with the whole list rather than a cap.",
        },
      ],
      replay: [
        {
          step: 1,
          press: "👀, 2",
          hold: 1100,
          props: {
            label: "Reactions",
            items: [
              {
                key: "🎉",
                label: "🎉",
                badge: 4,
              },
              {
                key: "👀",
                label: "👀",
                badge: 2,
              },
              {
                key: "✅",
                label: "✅",
                badge: 1,
              },
            ],
            value: "🎉",
          },
        },
        {
          step: 4,
          hold: 1600,
          props: {
            label: "Reactions",
            items: [
              {
                key: "🎉",
                label: "🎉",
                badge: 4,
              },
              {
                key: "👀",
                label: "👀",
                badge: 2,
              },
              {
                key: "✅",
                label: "✅",
                badge: 1,
              },
            ],
            value: "👀",
          },
        },
      ],
    },
  ],
};

export default docs;
