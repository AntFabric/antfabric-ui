import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "breadcrumbs",
  name: "Breadcrumbs",
  category: "navigation",
  level: "molecule",
  status: "beta",
  description: "One 44px line across the top of the content, naming where you are and offering the way back up: Projects \\ Release Train \\ #release-train. It holds text and nothing else, except a small red pill with the elapsed time while a recording is running. On the Mac it is also the window's title bar.",
  props: {
    items: {
      type: "array",
      required: true,
      description: "[{ key, label, icon?, to? }], root first. key names the crumb. to is where the crumb goes; a crumb without one is plain text, because a crumb that looks clickable and goes nowhere is worse than one that never looked clickable. The last item is the current page and is never a link. icon is a pictogram before the label (lock for a private channel); a public channel's # is part of its label.",
      sample: [
        {
          key: "projects",
          label: "Projects",
          to: "/projects",
        },
        {
          key: "project-release-train",
          label: "Release Train",
          to: "/projects/release-train",
        },
        {
          key: "release-train",
          label: "#release-train",
        },
      ],
    },
    expanded: {
      type: "boolean",
      default: true,
      description: "Every crumb is shown. Left (false) is the trail when it does not fit: the first crumb and the current page stay, and everything between folds into … , a button that unfolds the hidden crumbs in place. The product decides when the trail folds; this prop draws the folded state. Needs three crumbs or more.",
    },
    lights: {
      type: "boolean",
      default: false,
      platforms: ["desktop"],
      description: "Today's Mac build: this row is the title bar, so the traffic lights float over its left end and the first crumb starts 96px in. Off in full screen (the lights hide) and off once the Title bar is drawn above this row.",
    },
    status: {
      type: "enum",
      options: ["", "live", "paused", "busy"],
      default: "",
      platforms: ["desktop"],
      description: "What the status pill at the end of the bar says is happening. Empty draws nothing, so the strip is text and nothing else. live is a red fill, paused amber, busy a red fill with a grey dot (finishing up). AntFabric draws its meeting recorder here: live is Recording, busy is Saving….",
    },
    statusLabel: {
      type: "string",
      default: "",
      sample: "Recording",
      platforms: ["desktop"],
      description: "The pill's word.",
    },
    statusDetail: {
      type: "string",
      default: "",
      sample: "00:00:12",
      platforms: ["desktop"],
      description: "The pill's second figure, in tabular figures so the pill does not shuffle sideways: a clock, a count. AntFabric passes the recorder's own snapshot (a 250 ms tick from Rust), formatted HH:MM:SS; this component never counts.",
    },
    statusAction: {
      type: "string",
      default: "",
      sample: "Open Recordings",
      platforms: ["desktop"],
      description: "What pressing the pill does: its title (\"Open Recordings\"), and the end of its accessible name with the first letter lowered (\"Recording: 00:00:12, open Recordings\").",
    },
    label: {
      type: "string",
      description: "The navigation landmark's name. Default: the `label` string (\"Breadcrumb\").",
    },
    onNavigate: {
      type: "event",
      args: "to: string",
    },
    onExpandedChange: {
      type: "event",
      args: "expanded: boolean",
      changes: "expanded",
      description: "The … unfolded the trail (true).",
    },
    onStatus: {
      type: "event",
      platforms: ["desktop"],
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <nav> holding an <ol>: <a href> crumbs (a plain click calls onNavigate, ⌘-click and middle-click stay the browser's), plain-text steps and an aria-current leaf; inline styles over `t`, hover and focus from useInteraction; the … <button> unfolds a folded trail (`expanded` through useControllable, reported by onExpandedChange)",
      import: "import { Breadcrumbs } from \"@antfabric-ui/react\"",
      notes: [
        "The same 44px strip, directly under the Web top bar and spanning the content column. No traffic lights and no drag region: the browser owns the frame.",
        "The trail comes from the route (each matched route's crumb, read with useMatches), so Back and Forward redraw it and a shared link lands with the right trail.",
        "Crumbs are real links (<a href>), so middle-click and ⌘-click open that level in a new browser tab.",
        "The current page names the browser tab: document.title is \"#release-train · Release Train — AntFabric\", after any unread count.",
        "No recording pill. A browser tab cannot run the recorder: capture is the desktop's Rust recorder, and outside Tauri the capture backend refuses everything, so the pill never has a state to show.",
      ],
      keyboard: [
        {
          keys: "Tab",
          action: "Moves through the crumbs that go somewhere; the current page and plain-text crumbs are not stops",
        },
        {
          keys: "Enter",
          action: "Follows the crumb",
        },
        {
          keys: "Enter / Space on …",
          action: "Unfolds the hidden crumbs in place and moves focus to the first one",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <nav> and <ol> with <button> crumbs, the macOS traffic lights when `lights` is on, and the recording pill <button> at the right end; data-tauri-drag-region on the bar",
      import: "import { Breadcrumbs } from \"@antfabric-ui/react\"",
      notes: [
        "Text and nothing else (ADR-0180): no search, no avatar, no menu. If a control is proposed for this strip, that is the old top bar being rebuilt one button at a time and needs its own decision.",
        "The one exception is the recording pill (ADR-0437): a live microphone is a statement about the hardware and the person's privacy, not navigation chrome. It renders nothing when idle, carries no Pause or Stop (ADR-1101), and clicking it opens Recordings, where those controls live. It is the only elapsed clock in the window, on every screen.",
        "The pill is 26px inside the 44px strip and must never grow it, or every pane below moves down.",
        "Since ADR-5322 the strip spans the whole window, above the nav rail. In the Mac app it is the title bar: the traffic lights float over its left end (the first crumb starts at 96px, or 16px in full screen), the nav and the list carry data-tauri-drag-region so the empty space drags the window and a double-click zooms it, and the crumbs stay ordinary buttons. If the Title bar spec is adopted, the lights and the drag region move up to it and this row starts at 16px.",
        "The trail is worked out from where you are, in the same order as the screen switch (trailOf mirrors ActiveScreen); it is never stored. Channels, Projects, Meetings, My tasks, Recordings, Inbox and Assistant are roots; a DM sits under Channels \\ Direct messages.",
        "The separator is a backslash, by the owner's call (ADR-0197), not a chevron. A private channel leads with a 12px lock at 55% opacity and a 6px gap, as the sidebar row draws it; a public channel's # is part of the label.",
        "New in this spec: folding middle crumbs into … and the 200px cap on a mid-trail crumb. Today trails are at most three crumbs and never fold.",
        "In the catalogue, pressing … unfolds the trail (it sets `expanded`) so the hidden crumbs come back in place and focus moves to the first of them.",
      ],
      keyboard: [
        {
          keys: "Tab",
          action: "Moves through the crumbs that go somewhere, then the recording pill",
        },
        {
          keys: "Enter / Space",
          action: "Follows the crumb; on the pill, opens Recordings",
        },
        {
          keys: "Enter / Space on …",
          action: "Unfolds the hidden crumbs in place and moves focus to the first one",
        },
      ],
    },
    mobile: {
      status: "not-applicable",
      alternative: "A phone has no width for a path. A pushed screen's Mobile header carries a back control and the screen's own title, which is the current page; the navigation stack is the trail. Back, the iOS edge swipe and Android back walk up it, and a long-press on the iOS back button lists every screen behind, which is the phone's version of the folded … . The recording time is on the recorder screen itself.",
    },
  },
  a11y: {
    role: "navigation",
    label: "{label}",
    notes: [
      "An ordered list of list items, so a screen reader announces the structure; the backslashes are hidden, because a spoken \"backslash\" between every crumb is noise.",
      "The current page is aria-current=\"page\" and is not a link: it names where you already are.",
      "The recording pill is a button, never a live region: a clock announced every 250 ms is worse than silence. Its name carries the destination: \"Recording: 00:00:12, open Recordings\".",
      "… is a button named \"Show the rest of the path\" with aria-expanded=false; pressing it unfolds the hidden crumbs in place and moves focus to the first one.",
    ],
  },
  examples: [
    {
      name: "Channel in a project",
      width: 720,
    },
    {
      name: "Direct message",
      props: {
        items: [
          {
            key: "channels",
            label: "Channels",
          },
          {
            key: "direct-messages",
            label: "Direct messages",
          },
          {
            key: "kenji-watanabe",
            label: "Kenji Watanabe",
          },
        ],
      },
      width: 720,
    },
    {
      name: "Private channel",
      props: {
        items: [
          {
            key: "channels",
            label: "Channels",
          },
          {
            key: "leadership-offsite",
            label: "leadership-offsite",
            icon: "lock",
          },
        ],
      },
      width: 720,
    },
    {
      name: "Assistant conversation",
      props: {
        items: [
          {
            key: "assistant",
            label: "Assistant",
            to: "/assistant",
          },
          {
            key: "draft-the-4-2-release-notes",
            label: "Draft the 4.2 release notes",
          },
        ],
      },
      width: 720,
    },
    {
      name: "While recording",
      props: {
        items: [
          {
            key: "meetings",
            label: "Meetings",
          },
        ],
        status: "live",
        statusLabel: "Recording",
        statusDetail: "00:00:12",
        statusAction: "Open Recordings",
      },
      platforms: ["desktop"],
      width: 720,
    },
  ],
  matrix: [
    {
      prop: "status",
      cases: [
        { name: "idle", props: { status: "" } },
        { name: "live", props: { status: "live", statusLabel: "Recording", statusDetail: "00:00:12", statusAction: "Open Recordings" } },
        { name: "paused", props: { status: "paused", statusLabel: "Paused", statusDetail: "00:00:12", statusAction: "Open Recordings" } },
        { name: "busy", props: { status: "busy", statusLabel: "Saving…", statusDetail: "00:00:12", statusAction: "Open Recordings" } },
      ],
    },
  ],
  edgeCases: [
    {
      title: "A trail longer than the strip",
      platforms: ["web", "desktop"],
      handling: "First the crumbs between the root and the current page fold into … , which unfolds them in order; the root never folds, so the way back to the top is always one click. Then the current page truncates with an ellipsis and its full name is the tooltip and the accessible name. A mid-trail crumb is never wider than 200px. Unfolding happens as soon as the window is wide enough again.",
      example: {
        name: "Folded",
        props: {
          expanded: false,
          items: [
            {
              key: "projects",
              label: "Projects",
              to: "/projects",
            },
            {
              key: "payments-reliability-programme",
              label: "Payments Reliability Programme",
              to: "/projects/payments-reliability",
            },
            {
              key: "payments-incident-war-room",
              label: "#payments-incident-war-room",
            },
          ],
        },
        width: 420,
      },
    },
    {
      title: "A very long channel name",
      platforms: ["web", "desktop"],
      handling: "The current page is the only crumb that shrinks, so it takes the ellipsis while the root stays whole. The leaf's line height is the body-sm leading, never 1, so descenders are not clipped.",
      example: {
        name: "Long leaf",
        props: {
          items: [
            {
              key: "channels",
              label: "Channels",
            },
            {
              key: "customer-escalations-emea-weekend-on-call-rotation",
              label: "#customer-escalations-emea-weekend-on-call-rotation",
            },
          ],
        },
        width: 360,
      },
    },
    {
      title: "Nothing open",
      platforms: ["web", "desktop"],
      handling: "An organisation with no channels, or the moment before the first list read answers, shows the root alone (ADR-4538), never Channels \\ # with a bare hash naming a channel that is not there. With no conversation open, the destination is where you are.",
      example: {
        name: "Root only",
        props: {
          items: [
            {
              key: "channels",
              label: "Channels",
            },
          ],
        },
        width: 720,
      },
    },
    {
      title: "Paused, then saving",
      platforms: ["desktop"],
      handling: "Paused turns the pill amber and says Paused with the time held; after Stop it reads Saving… with a grey dot until the file is written, then disappears. The time always comes from the recorder's own snapshot, so a stopped microphone can never keep counting. Tabular figures stop the pill shuffling sideways every second.",
      example: {
        name: "Paused",
        props: {
          items: [
            {
              key: "recordings",
              label: "Recordings",
            },
          ],
          status: "paused",
          statusLabel: "Paused",
          statusDetail: "00:12:47",
          statusAction: "Open Recordings",
        },
        width: 720,
      },
    },
    {
      title: "macOS traffic lights and full screen",
      platforms: ["desktop"],
      handling: "In today's Mac app the lights float over the row's left end, so the first crumb starts 96px in (16px start, three 12px lights, a 26px gap); move them in tauri.conf.json and this inset moves with them. In full screen macOS hides the lights and the inset drops back to 16px, read on mount and on every resize. Windows and Linux reserve nothing.",
      example: {
        name: "Mac title bar row",
        props: {
          lights: true,
        },
        os: "mac",
        width: 720,
      },
    },
    {
      title: "Renamed, moved or deleted elsewhere",
      platforms: ["web", "desktop"],
      handling: "The trail is worked out from live state, so a channel renamed on someone's phone changes here in the same moment as the sidebar. A channel deleted or archived while open drops the trail to its root and the pane shows its own empty state. Offline, the desktop draws the trail from its SQLite cache, and crumbs to screens that need the network still go there and say so.",
    },
    {
      title: "Keyboard only and screen readers",
      platforms: ["web", "desktop"],
      handling: "Tab reaches only crumbs that go somewhere, then … , then the recording pill. A plain-text crumb such as Direct messages is not a stop, because there is no screen behind it. The focus ring is drawn on the crumb's own 3px by 6px padding, so it does not touch the separators.",
    },
    {
      title: "Right-to-left languages",
      platforms: ["web", "desktop"],
      handling: "The trail runs right to left with the root at the right edge and the recording pill at the left. The backslash is mirrored so it still leans toward the next crumb. On a Mac set to Arabic or Hebrew the traffic lights move to the right, and the inset follows them.",
    },
  ],
  related: ["tabs", "title-bar", "web-top-bar", "mobile-header", "menu", "recording-indicator"],
  flows: [
    {
      id: "go-up-the-trail",
      title: "Go back up to the project",
      description: "The trail is where you are, worked out fresh each time. A crumb that has a screen behind it goes there, and the trail redraws one level up.",
      platforms: ["web", "desktop"],
      width: 600,
      steps: [
        {
          kind: "data",
          title: "The trail is worked out, never stored",
          detail: "trailOf reads where you are, in the same order as the screen switch, and gives each crumb with a screen behind it a go. A project channel is Projects \\ Release Train \\ #release-train; the leaf has no go.",
          code: "const inProject: Crumb = { label: project.name, go: () => a.openProject(project.id) }  // case 'chat': [root, inProject, channelCrumb(s, s.activeChannel)]",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "Each matched route names its crumb",
          detail: "The trail is read from the matched routes, so Back and Forward redraw it and a shared link lands with the right trail.",
          code: "useMatches().filter((m) => m.loaderData?.crumb).map((m) => ({ label: m.loaderData.crumb, to: m.pathname }))",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Release Train is clicked",
          detail: "Or Enter on it. The current page, #release-train, is plain text and not a Tab stop.",
        },
        {
          kind: "event",
          title: "onNavigate fires with where to go",
          code: "onNavigate?.('/projects/release-train')",
        },
        {
          kind: "state",
          title: "The store moves to the project",
          detail: "The project's channel list is asked for beside the navigation rather than before it, so opening never waits on the network.",
          code: "openProject: (id) => { void onOpenProject?.(id); set((s) => ({ screen: 'channels', wsMode: 'projects', … })) }",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The router follows the link",
          detail: "The crumb is a real <a href> from <Link>, so ⌘-click and middle-click open that level in a new tab; a plain click navigates in place.",
          code: "<Link to=\"/projects/$projectId\" params={{ projectId: 'release-train' }}>Release Train</Link>",
          platforms: ["web"],
        },
        {
          kind: "result",
          title: "The trail redraws one level up",
          detail: "Projects \\ Release Train, with Release Train now the current page. Nothing animates: the trail is text and changes when the screen does.",
        },
      ],
      replay: [
        {
          step: 2,
          press: "Release Train",
          hold: 1100,
          props: {
            items: [
              {
                key: "projects",
                label: "Projects",
                to: "/projects",
              },
              {
                key: "project-release-train",
                label: "Release Train",
                to: "/projects/release-train",
              },
              {
                key: "release-train",
                label: "#release-train",
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1600,
          props: {
            items: [
              {
                key: "projects",
                label: "Projects",
                to: "/projects",
              },
              {
                key: "project-release-train",
                label: "Release Train",
              },
            ],
          },
        },
      ],
    },
    {
      id: "open-recordings",
      title: "The recording pill opens Recordings",
      description: "While a meeting is being recorded, the only clock in the window sits at the end of the trail. It is a way to Recordings, not a set of controls.",
      platforms: ["desktop"],
      width: 600,
      steps: [
        {
          kind: "data",
          title: "The pill reads the recorder's own clock",
          detail: "A snapshot from the Rust recorder carries the state and the elapsed time; this component never counts. Idle draws nothing, and outside Tauri the backend refuses everything, so the pill never appears in a browser.",
          code: "const { state, elapsedMs } = useIndicator().snapshot  // useRecorder(defaultCaptureBackend())",
        },
        {
          kind: "trigger",
          title: "The red pill is clicked",
          detail: "Its name is Recording: 00:00:12, open Recordings. It carries no Pause or Stop; those live in Recordings.",
        },
        {
          kind: "event",
          title: "onStatus fires",
          code: "onStatus?.()",
        },
        {
          kind: "state",
          title: "The store opens Recordings",
          code: "openRecordings: () => set({ screen: 'channels', wsMode: 'projects', projPane: 'recordings', panel: 'none', … })",
        },
        {
          kind: "result",
          title: "The trail reads Recordings, and the pill keeps counting",
          detail: "The pill is on every screen, so it stays at the right end for as long as the recording runs.",
          code: "if (s.projPane === 'recordings') return [{ label: 'Recordings' }]",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            items: [
              {
                key: "meetings",
                label: "Meetings",
              },
            ],
            status: "live",
            statusLabel: "Recording",
            statusDetail: "00:00:12",
            statusAction: "Open Recordings",
          },
        },
        {
          step: 1,
          press: "Recording: 00:00:13, open Recordings",
          hold: 1000,
          props: {
            items: [
              {
                key: "meetings",
                label: "Meetings",
              },
            ],
            status: "live",
            statusLabel: "Recording",
            statusDetail: "00:00:13",
            statusAction: "Open Recordings",
          },
        },
        {
          step: 4,
          hold: 1600,
          props: {
            items: [
              {
                key: "recordings",
                label: "Recordings",
              },
            ],
            status: "live",
            statusLabel: "Recording",
            statusDetail: "00:00:15",
            statusAction: "Open Recordings",
          },
        },
      ],
    },
  ],
};

export default docs;
