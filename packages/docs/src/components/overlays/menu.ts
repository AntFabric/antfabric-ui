import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "menu",
  name: "Menu",
  category: "overlays",
  level: "molecule",
  status: "beta",
  description: "The dropdown a ⋮ or a ▾ opens: a floating card of rows with an optional icon, a trailing count or word, a second line saying what the row will do, a shortcut on web and desktop, and a check for toggles. Destructive rows are danger-coloured text, never a pill.",
  props: {
    label: {
      type: "string",
      sample: "Actions for #release-train",
      description: "The menu's accessible name.",
    },
    items: {
      type: "array",
      description: "Rows in order. An entry is a row by default; { type: 'separator' } draws a hairline and { type: 'label', label } a section heading. A row takes label, icon, sublabel (second line), count (trailing number or word), shortcut (Mod+F; web and desktop only), webShortcut (what the web draws instead when the browser owns the desktop shortcut; '' draws nothing), checked (true / false makes it a toggle; leave it out for an ordinary row), radio (with checked: a one-of-many row, role menuitemradio; web and desktop), href (the row navigates: an <a href role=menuitem>; web and desktop), tone ('danger'), disabled. A row's submenu is read by AppMenuBar and TrayMenu; Menu does not open one.",
      default: [],
      sample: [
        {
          label: "Search in channel",
          icon: "search",
          shortcut: "Mod+F",
          webShortcut: "",
        },
        {
          label: "Notifications",
          icon: "bell",
          count: "Mentions",
        },
        {
          label: "Mute channel",
          icon: "bell-off",
          sublabel: "No badges unless someone @mentions you",
        },
        {
          type: "separator",
        },
        {
          label: "Pinned messages",
          icon: "pin",
          count: 3,
        },
        {
          label: "Files",
          icon: "folder",
          count: "None",
          disabled: true,
        },
        {
          label: "Copy link",
          icon: "link",
        },
        {
          type: "separator",
        },
        {
          label: "Leave channel",
          icon: "log-out",
          tone: "danger",
        },
      ],
    },
    width: {
      type: "number",
      default: 240,
      platforms: ["web", "desktop"],
      description: "Panel width on web and desktop. The phone's menu is always 256pt (Figma Mobile / Menu), narrower only when the screen is.",
    },
    showTrigger: {
      type: "boolean",
      default: false,
      description: "Draws the ⋮ that opened the menu, so the catalogue shows where the panel hangs from.",
    },
    triggerIcon: {
      type: "icon",
      default: "ellipsis-vertical",
    },
    triggerLabel: {
      type: "string",
      default: "More actions",
      sample: "More actions for #release-train",
      description: "The ⋮ trigger's accessible name. Left out, it reads the `moreActions` string.",
    },
    placement: {
      type: "enum",
      options: ["below", "above"],
      default: "below",
      description: "below is the normal case. above is what the menu does by itself when there is no room under the trigger — the ⋮ on the last row of a list.",
    },
    bare: {
      type: "boolean",
      default: false,
      description: "Rows only, no card — for a sheet or another surface that lists the same rows (the long-press message sheet uses the menu's own rows this way).",
    },
    toggled: {
      type: "string",
      default: "",
      description: "The key (else the label) of the checkable row just pressed: its check is drawn flipped from what items says, and pressing it again flips it back. Preview state for the catalogue (one row at a time); in the kits the caller owns checked and hears onSelect.",
    },
    onSelect: {
      type: "event",
      args: "item: MenuItem",
      description: "A row was chosen. The caller acts on it; for a toggle row it also flips the row's checked.",
    },
    autoFocus: {
      type: "boolean",
      default: true,
      platforms: ["web", "desktop"],
      description: "Focus moves to the first enabled row when the menu mounts (from a click as well as from the keyboard) and back to what had it when it unmounts. Turn it off for rows listed on a surface that already took focus. A tree under autoFocus={false} never moves focus in.",
    },
    onClose: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <div role=\"menu\"> of <button role=\"menuitem\"> / \"menuitemcheckbox\" rows (aria-disabled rows stay reachable), inline styles over `t`; hover, press and focus from useInteraction; ↑ ↓ Home End and type-ahead through the shared roving keys, Esc and Tab handled in the panel; the panel scrolls past 80vh; Kbd for the shortcut column; pops in with enter(\"pop\"). Placing and portalling the panel are the app's",
      import: "import { Menu } from \"@antfabric/ui-react\"",
      notes: [
        "Portalling and placing the panel are the app's (it takes a `placement` of below or above and does not flip at the viewport's edge); the panel scrolls inside 80vh when it has many rows.",
        "A row with `href` is a link item (<a href role=\"menuitem\">), so ⌘-click and middle-click open a new tab; a plain click, Enter and Space call onSelect.",
        "Shortcut hints are drawn only for shortcuts the page actually owns; a browser-reserved one (⌘W, ⌘T, ⌘N, ⌘L) is replaced by the web alternative, never shown as a promise the browser will break.",
        "Right-click is not this component — see Context menu.",
        "In the catalogue the panel pops in, and pressing a checkable row flips its check (one row at a time, through `toggled`); the menu stays open, as a checkbox row does.",
      ],
      keyboard: [
        {
          keys: "Enter / Space / ↓",
          action: "On the trigger: opens and focuses the first enabled row",
        },
        {
          keys: "↑",
          action: "On the trigger: opens and focuses the last enabled row",
        },
        {
          keys: "↑ / ↓",
          action: "Moves between enabled rows, wrapping at either end; disabled rows are skipped",
        },
        {
          keys: "Home / End",
          action: "First / last row",
        },
        {
          keys: "A–Z",
          action: "Type-ahead to the next row starting with that letter",
        },
        {
          keys: "Enter / Space",
          action: "Runs the row and closes; a checkbox row toggles and stays open",
        },
        {
          keys: "Esc",
          action: "Closes and returns focus to the trigger",
        },
        {
          keys: "Tab",
          action: "Closes and moves focus on from the trigger",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <div role=\"menu\"> as web at desktop density (30px rows), drawing the desktop shortcut rather than webShortcut. The scrim and the z layers stay the app's",
      import: "import { Menu } from \"@antfabric/ui-react\"",
      notes: [
        "The transparent scrim belongs to the menu, not the caller: every menu that forgot one stayed open after a click elsewhere. A click on the scrim dismisses and stops there — nothing behind it hears the click.",
        "A row of sibling triggers sharing one open state (the task filter bar) raises them to z 62, so clicking the next filter opens it in one click instead of first closing this one.",
        "Today's MenuRow has icon, danger, disabled and checked only, opens with focusFirstItem, and handles ↑/↓ in each caller. This spec adds section labels, sublabels, trailing counts, the shortcut column, type-ahead, Home/End and wrap-around in the component itself.",
        "Desktop rows are 12px semibold at 30px; the panel radius is 13 today and moves to the 14 rail radius here.",
        "Danger rows hover to a subtle danger wash — never grey, never the brand colour.",
      ],
      keyboard: [
        {
          keys: "↑ / ↓",
          action: "Moves between enabled rows, wrapping",
        },
        {
          keys: "Enter / Space",
          action: "Runs the row",
        },
        {
          keys: "Esc",
          action: "Closes this menu only (the Escape ladder peels one layer) and returns focus to the trigger",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "<Enter motion=\"pop\"> (accessibilityRole menu) of Pressable rows (menuitem, or checkbox for a toggle row), StyleSheet over useTheme(). Anchoring with measureInWindow and the Modal stay the app's",
      import: "import { Menu } from \"@antfabric/ui-react-native\"",
      notes: [
        "A dropdown, not a sheet, and no scrim: right edge on the 12pt gutter, 4pt under the ⋮ that opened it, 256pt wide, 6pt padding, 44pt rows and 60pt for a row with a sublabel.",
        "It flips above the ⋮ when it would run off the bottom of the screen.",
        "A row with nothing behind it is disabled at 45% and says why in its count (\"None\") — the menu explains itself rather than changing shape.",
        "No shortcut column on a phone. Hover rules are not emitted here; pressed is the only feedback, with a selection haptic on press-in.",
        "A row that opens a sheet waits for the menu's onDismiss on iOS before presenting, because iOS drops a modal presented while another is still going (hooks/useSheetHandoff).",
      ],
      gestures: [
        {
          gesture: "Tap a row",
          action: "Runs it and closes the menu",
        },
        {
          gesture: "Tap outside",
          action: "Closes without running anything",
        },
        {
          gesture: "Android back",
          action: "Closes the menu",
        },
      ],
    },
  },
  a11y: {
    role: "menu",
    label: "{label}",
    notes: [
      "Rows are menuitem; a toggle is menuitemcheckbox (menuitemradio with `radio`) with aria-checked. Disabled rows stay focusable by arrow keys on web and desktop (aria-disabled) so a screen reader can hear why. A row that draws a shortcut sets aria-keyshortcuts.",
      "A row's accessible name joins label, count and sublabel: \"Files, None\", \"Mute channel, No badges unless someone @mentions you\".",
      "Section labels are not focusable and are role=presentation: they are drawn headings, not a named group.",
      "Web: focus moves to the first enabled row whenever the menu mounts, ↑ ↓ Home End and type-ahead move between rows, Esc closes (and stops there), and focus returns to what had it when the menu unmounts.",
      "The ⋮ trigger the catalogue draws is an icon button with a label and a pressed look; the kit does not set aria-haspopup or aria-expanded on it: the product's own trigger does.",
    ],
  },
  examples: [
    {
      name: "Channel menu",
      description: "The ⋮ on a channel header: shortcut, trailing word, two-line row, a disabled row that says why, and a destructive row last.",
    },
    {
      name: "Hanging from its trigger",
      props: {
        showTrigger: true,
      },
    },
    {
      name: "Toggles with sections",
      description: "The task filter popover: checked rows stay open on press so several can be chosen at once.",
      props: {
        label: "Filter tasks",
        width: 220,
        items: [
          {
            type: "label",
            label: "Status",
          },
          {
            label: "To do",
            checked: true,
          },
          {
            label: "In progress",
            checked: true,
          },
          {
            label: "In review",
            checked: false,
          },
          {
            label: "Done",
            checked: false,
          },
          {
            type: "separator",
          },
          {
            type: "label",
            label: "Assignee",
          },
          {
            label: "Assigned to me",
            icon: "user",
            checked: false,
          },
          {
            label: "Fabric's tasks",
            icon: "sparkles",
            checked: true,
          },
        ],
      },
    },
    {
      name: "Message actions",
      description: "The kebab on a message row, 168 wide on desktop.",
      props: {
        label: "Message actions",
        width: 168,
        items: [
          {
            label: "Edit message",
            icon: "pencil",
          },
          {
            label: "Forward",
            icon: "arrow-up-right",
          },
          {
            label: "Pin to channel",
            icon: "pin",
          },
          {
            type: "separator",
          },
          {
            label: "Delete message",
            icon: "trash-2",
            tone: "danger",
          },
        ],
      },
    },
    {
      name: "Conversation menu (phone)",
      description: "Mobile / Menu with a two-line row: the icon sits level with the first line.",
      props: {
        label: "Actions for Kenji Watanabe",
        items: [
          {
            label: "View profile",
            icon: "user",
          },
          {
            label: "Pinned messages",
            icon: "pin",
            count: 2,
          },
          {
            label: "Mark as unread",
            icon: "mail-check",
          },
          {
            label: "Close conversation",
            icon: "archive",
            sublabel: "Reopens with the next message",
          },
          {
            label: "Block Kenji",
            icon: "circle-alert",
            tone: "danger",
          },
        ],
      },
    },
  ],
  states: ["hover", "pressed", "focus"],
  edgeCases: [
    {
      title: "Trigger near the bottom of the window or screen",
      platforms: ["web", "desktop", "mobile"],
      handling: "The panel measures itself before it is shown (visibility hidden for the first frame, never a jump from 0,0) and flips above the trigger when the space below is smaller than its height and smaller than the space above. On the phone the same rule uses the 12pt gutter as the edge.",
      example: {
        name: "Flipped above",
        props: {
          showTrigger: true,
          placement: "above",
        },
      },
    },
    {
      title: "A row that has nothing behind it",
      platforms: ["web", "desktop", "mobile"],
      handling: "Disabled, not hidden, and it says why: \"None\" in the count, or the reason as the sublabel. A delete past the 12-hour window is a disabled Delete reading \"Messages can only be deleted within 12 hours of sending.\" An option that vanishes teaches nothing.",
      example: {
        name: "Explains itself",
        props: {
          label: "Message actions",
          width: 260,
          items: [
            {
              label: "Edit message",
              icon: "pencil",
            },
            {
              label: "Forward",
              icon: "arrow-up-right",
            },
            {
              type: "separator",
            },
            {
              label: "Delete message",
              icon: "trash-2",
              tone: "danger",
              disabled: true,
              sublabel: "Messages can only be deleted within 12 hours of sending.",
            },
          ],
        },
      },
    },
    {
      title: "Label longer than the panel",
      platforms: ["web", "desktop", "mobile"],
      handling: "One line with an ellipsis; the panel never widens past its set width. The full label stays the accessible name and, on web and desktop, the tooltip.",
      example: {
        name: "Long label",
        props: {
          items: [
            {
              label: "Move to #platform-eng-incident-review-2026-q4-follow-ups",
              icon: "folder",
            },
            {
              label: "Copy link",
              icon: "link",
            },
          ],
        },
      },
    },
    {
      title: "A row that navigates",
      platforms: ["web", "desktop"],
      handling: "A row with `href` is an <a href role=\"menuitem\">: ⌘-click and middle-click open a new tab, a plain click calls onSelect. A link takes Enter by itself; the row also takes Space, as every other row does, and keeps it from scrolling the page.",
      example: {
        name: "Link rows",
        props: {
          items: [
            {
              label: "Open in a new window",
              icon: "external-link",
              href: "/channels/platform-eng",
            },
            {
              label: "Copy link",
              icon: "link",
            },
          ],
        },
      },
    },
    {
      title: "More rows than the window has room for",
      platforms: ["web", "desktop", "mobile"],
      handling: "The panel caps at the space between the trigger and the window edge minus 8px and scrolls inside, keeping its shadow and corners. On a phone, a list longer than about eight rows is a sheet, not a dropdown.",
    },
    {
      title: "Keyboard only",
      platforms: ["web", "desktop"],
      handling: "Opening from the keyboard focuses the first enabled row (focusFirstItem); ↑/↓ wrap, Home/End jump, a letter type-aheads. Esc closes only this menu and gives focus back to the trigger. Focus is never left on <body>.",
    },
    {
      title: "Window scrolls or resizes while open",
      platforms: ["web", "desktop"],
      handling: "The panel re-places on every scroll (capture phase, so an inner scroller counts) and resize. If the trigger scrolls out of view the menu closes rather than floating over unrelated content.",
    },
    {
      title: "The action is refused by the server",
      platforms: ["web", "desktop", "mobile"],
      handling: "Rows are gated by what the client knows (abilitiesFor), but the server stays the control: a permission changed on another device makes the write fail, the menu has already closed, and a toast says what happened in the server's own words. Rows are never re-gated optimistically.",
    },
    {
      title: "Touch screen on a laptop",
      platforms: ["web", "desktop"],
      handling: "With pointer: coarse rows grow to 40px and the panel to the phone's 6px padding, so a finger can hit them; the hover wash does not stick after a tap.",
    },
    {
      title: "Right-to-left languages",
      platforms: ["web", "desktop", "mobile"],
      handling: "The panel anchors to the trigger's end edge in the reading direction; icons lead and counts, shortcuts and checks trail on the mirrored side. Directional icons (arrow-up-right) mirror.",
    },
  ],
  related: ["context-menu", "icon-button", "kbd", "dialog"],
  flows: [
    {
      id: "pick-a-row",
      title: "Open the ⋮ menu and pick a row",
      description: "The caller builds the rows from data it already holds, the ⋮ opens the panel, and choosing a row hands it back to the caller, which closes the menu and acts.",
      platforms: ["web", "desktop", "mobile"],
      width: 300,
      steps: [
        {
          kind: "data",
          title: "The screen builds the rows",
          detail: "The menu holds no data of its own. The DM menu reads the conversation from the workspace store and only offers Go to profile once the peer has resolved, so no row's only outcome is a refusal.",
          code: "const dm = useWorkspace().dms.find((d) => d.id === dmId)",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The screen builds the rows from its queries",
          detail: "The channel's ⋮ rows come from two React Query reads, so Pinned messages and Files show their real counts, and a public channel you haven't joined shows them locked.",
          code: "shelfMenuRows({ pins: pins.data?.length, files: files.data?.items.length, locked: canJoin })",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route builds the rows from its loader",
          detail: "The channel route's loader already fetched pins and files for the header, so the ⋮ reads the same TanStack Query cache and draws the counts without a second request.",
          code: "const { pins, files } = Route.useLoaderData()",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The ⋮ is pressed",
          detail: "A click, or Enter / Space with the ⋮ focused. On the phone a tap, and useMenu measures the ⋮ with measureInWindow so the panel hangs from it.",
          code: "<IconButton icon=\"ellipsis-vertical\" onPress={menu.open} />",
        },
        {
          kind: "motion",
          title: "The panel pops in under the ⋮",
          detail: "It grows from the ⋮'s corner over the dimmed-free page; nothing else moves. Today's desktop draws a short rise (af-rise, 120ms) and the phone fades its Modal; both move to this pop.",
          enter: "pop",
        },
        {
          kind: "state",
          title: "Focus moves to the first enabled row",
          detail: "Once the panel is on screen, focus lands on the first row that isn't disabled. ↑ ↓ move it, Home / End jump, typing a letter jumps to the row that starts with it.",
          code: "panel.querySelector('[role=\"menuitem\"]:not(:disabled)')?.focus()",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "A row is chosen",
          detail: "Pinned messages is pressed. A disabled row (Files, with none yet) takes no press at all.",
        },
        {
          kind: "event",
          title: "onSelect(item) fires",
          detail: "The menu hands the whole row back, so the caller can switch on its key instead of matching labels.",
          code: "onSelect?.(item)  // { label: \"Pinned messages\", icon: \"pin\", count: 3 }",
        },
        {
          kind: "effect",
          title: "The caller acts",
          detail: "On the phone the row navigates to the pinned list. On the desktop a row calls its store action, for example opening the person's profile.",
          code: "router.push({ pathname: '/channel/pinned/[id]', params: { id: channelId } })",
        },
        {
          kind: "result",
          title: "The menu closes and focus returns to the ⋮",
          detail: "Escape, a click outside and choosing a row all close it the same way, and keyboard focus goes back to the ⋮ that opened it.",
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
              align: "flex-end",
              gap: "$space.2xs",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "ellipsis-vertical",
                  label: "More actions for #release-train",
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
              align: "flex-end",
              gap: "$space.2xs",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "ellipsis-vertical",
                  label: "More actions for #release-train",
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
              align: "flex-end",
              gap: "$space.2xs",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "ellipsis-vertical",
                  label: "More actions for #release-train",
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: "More actions for #release-train",
          hold: 900,
          scene: {
            el: "view",
            style: {
              align: "flex-end",
              gap: "$space.2xs",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "ellipsis-vertical",
                  label: "More actions for #release-train",
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1500,
          scene: {
            el: "view",
            style: {
              align: "flex-end",
              gap: "$space.2xs",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "ellipsis-vertical",
                  label: "More actions for #release-train",
                  active: true,
                },
              },
              {
                el: "component",
                use: "menu",
                props: {
                  label: "Actions for #release-train",
                  items: [
                    {
                      label: "Search in channel",
                      icon: "search",
                      shortcut: "Mod+F",
                      webShortcut: "",
                    },
                    {
                      label: "Pinned messages",
                      icon: "pin",
                      count: 3,
                    },
                    {
                      label: "Files",
                      icon: "folder",
                      count: "None",
                      disabled: true,
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Leave channel",
                      icon: "log-out",
                      tone: "danger",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 6,
          press: "Pinned messages, 3",
          hold: 1100,
          scene: {
            el: "view",
            style: {
              align: "flex-end",
              gap: "$space.2xs",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "ellipsis-vertical",
                  label: "More actions for #release-train",
                  active: true,
                },
              },
              {
                el: "component",
                use: "menu",
                props: {
                  label: "Actions for #release-train",
                  items: [
                    {
                      label: "Search in channel",
                      icon: "search",
                      shortcut: "Mod+F",
                      webShortcut: "",
                    },
                    {
                      label: "Pinned messages",
                      icon: "pin",
                      count: 3,
                    },
                    {
                      label: "Files",
                      icon: "folder",
                      count: "None",
                      disabled: true,
                    },
                    {
                      type: "separator",
                    },
                    {
                      label: "Leave channel",
                      icon: "log-out",
                      tone: "danger",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              align: "flex-end",
              gap: "$space.2xs",
              width: 260,
            },
            children: [
              {
                el: "component",
                use: "icon-button",
                props: {
                  icon: "ellipsis-vertical",
                  label: "More actions for #release-train",
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "toggle-a-row",
      title: "Turn a setting on or off from the menu",
      description: "A toggle row shows a setting the caller owns. Pressing it asks the caller to flip the setting; the menu stays open so the person sees the tick change.",
      platforms: ["web", "desktop", "mobile"],
      width: 300,
      steps: [
        {
          kind: "data",
          title: "checked comes from the saved setting",
          detail: "Notification sound and Show notifications are read from the workspace store, which loads them from the saved notification preferences.",
          code: "{ label: \"Notification sound\", checked: s.notifSoundEnabled }",
        },
        {
          kind: "trigger",
          title: "The toggle row is pressed",
          detail: "Click, Space or Enter on the row. The whole row is the control, not just the box.",
        },
        {
          kind: "event",
          title: "onSelect(item) fires with the row as it was",
          detail: "The row says what it showed, so the caller flips that, never a stale copy.",
          code: "onSelect?.(item)  // { label: \"Notification sound\", checked: true }",
        },
        {
          kind: "state",
          title: "The caller flips the setting and passes it back",
          detail: "The menu doesn't keep its own copy of checked. The store saves the new value and the row redraws from it.",
          code: "a.setNotificationSound(!s.notifSoundEnabled)",
        },
        {
          kind: "motion",
          title: "The box fills and the tick pops in",
          detail: "The box cross-fades to the brand fill (150ms) while the tick pops; turning it off fades the fill back with no exit motion.",
          enter: "pop",
        },
        {
          kind: "result",
          title: "The menu stays open on the new value",
          detail: "Toggles don't close the menu, so two settings can be changed in one visit. Escape or a click outside closes it.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          props: {
            label: "Notification settings",
            items: [
              {
                type: "label",
                label: "Notifications",
              },
              {
                label: "Notification sound",
                icon: "volume-2",
                checked: false,
              },
              {
                label: "Show notifications",
                icon: "bell",
                checked: true,
              },
            ],
          },
        },
        {
          step: 1,
          press: "Notification sound",
          hold: 900,
          props: {
            label: "Notification settings",
            items: [
              {
                type: "label",
                label: "Notifications",
              },
              {
                label: "Notification sound",
                icon: "volume-2",
                checked: false,
              },
              {
                label: "Show notifications",
                icon: "bell",
                checked: true,
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1500,
          props: {
            label: "Notification settings",
            items: [
              {
                type: "label",
                label: "Notifications",
              },
              {
                label: "Notification sound",
                icon: "volume-2",
                checked: true,
              },
              {
                label: "Show notifications",
                icon: "bell",
                checked: true,
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
