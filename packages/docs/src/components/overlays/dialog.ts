import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "dialog",
  name: "Dialog",
  category: "overlays",
  level: "organism",
  status: "beta",
  description: "A modal question over a blurred scrim. A confirm is a fixed 440px card that names what will be lost, with Cancel and a solid danger CTA; a form dialog is the app's one modal width. On a phone both become a bottom sheet with the buttons stacked full width.",
  props: {
    kind: {
      type: "enum",
      options: ["confirm", "form"],
      default: "confirm",
      description: "confirm: a decision about something already chosen — fixed 440px, glyph tile, no header strip. form: fields to fill — the one modal width, clamp(540px, 37.5vw, 960px), drawn here at 540, with a header strip and a close button.",
    },
    title: {
      type: "string",
      sample: "Delete this task?",
      required: true,
    },
    subtitle: {
      type: "string",
      default: "",
      description: "A line under a form dialog's title.",
    },
    body: {
      type: "string",
      default: "",
      sample: "“Ship push opt-in for Android 14” and everything on it (subtasks, comments, attachments) will be removed. This can’t be undone.",
      description: "Names what will be lost, in specific words. A prominent destructive button with vague copy is how people delete things they meant to keep.",
    },
    icon: {
      type: "icon",
      default: "trash-2",
      description: "The confirm's glyph tile: trash-2 for a delete, log-out, unlink, list-x. Empty hides the tile. Form dialogs never have one.",
    },
    tone: {
      type: "enum",
      options: ["danger", "primary"],
      default: "danger",
      description: "danger is the solid danger-coloured CTA for anything that destroys. primary (the brand fill) is for a confirm that ends or disconnects but destroys nothing: Log out, Disconnect Gmail.",
    },
    confirmLabel: {
      type: "string",
      sample: "Delete task",
      description: "A verb plus the object, never OK or Yes.",
    },
    cancelLabel: {
      type: "string",
      default: "Cancel",
    },
    children: {
      type: "node",
      default: "",
      description: "Fields or anything else between the body and the actions.",
    },
    loading: {
      type: "boolean",
      default: false,
      description: "The confirm is in flight: its button spins and cannot be pressed again. Cancel, Esc and the scrim still cancel, so the app can abandon the request. A press on the CTA shows the same until the app answers, without this prop.",
    },
    error: {
      type: "string",
      default: "",
      description: "Why the last attempt failed. The dialog stays open; pressing the CTA again retries.",
    },
    stacked: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "Drawn over another open dialog — the one level of stacking allowed.",
    },
    behindTitle: {
      type: "string",
      default: "",
      sample: "Edit #release-train",
      platforms: ["web", "desktop"],
      description: "The title of the dialog drawn dimmed behind this one while stacked. The dialog draws only what its props give it, so the title behind is the caller's. Empty draws that dialog with no title.",
    },
    keyboard: {
      type: "boolean",
      default: false,
      platforms: ["mobile"],
      description: "The on-screen keyboard is up; the sheet sits on it.",
    },
    modal: {
      type: "boolean",
      default: false,
      description: "Drawn over the whole window, above the page: the scrim covers it, the page behind does not scroll and is out of reach, and Esc or a press on the scrim cancels the top dialog. Off, the dialog is drawn where it is mounted and its host does all of that (the catalogue draws it so).",
    },
    dismissible: {
      type: "boolean",
      default: true,
      description: "Esc, a press on the scrim, the phone's handle, Android's back and the screen reader's escape gesture cancel it. Off for a step that must be answered with one of its buttons.",
    },
    onConfirm: {
      type: "event",
      description: "Reports the request; the CTA spins until the app answers, by closing the dialog, with a new `error` or `loading`, or by settling the promise the handler returns. A failure with the same `error` as before needs the promise.",
    },
    onCancel: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A <div role=\"alertdialog\"> (confirm) or \"dialog\" (form), aria-modal, labelled by its <h2> and described by the body, on a 3px-blurred scrim; inline styles over `t`; Button and IconButton. Tab wraps inside, Esc cancels, Mod+Enter submits a form, and Cancel (a form: its first field) takes focus on open; pops in with enter(\"pop\") over a fading scrim; a press waits for the app's answer through usePending (`loading` or a new `error` ends it)",
      import: "import { Dialog } from \"@antfabric/ui-react\"",
      notes: [
        "The backdrop blurs 3px. With `modal` the dialog is drawn in the overlay layer of its AntFabricRoot (the theme applies, no overflow clips it): the scrim covers the window, the page behind does not scroll (the body and the box the page scrolls in) and the rest of the root is inert; only the top dialog takes Esc and a press on the scrim. Without `modal` it is drawn where it is mounted, and those belong to the host.",
        "Below 640px of viewport (a phone browser) the same component draws as the bottom sheet the phone app uses, buttons stacked full width.",
        "Closing a tab with a dirty form dialog fires beforeunload, so the browser asks with its own words; the app never invents a custom unload message.",
        "⌘W closes the tab, not the dialog — never advertise it as a dialog shortcut.",
      ],
      keyboard: [
        {
          keys: "Tab / Shift+Tab",
          action: "Moves inside the dialog only, wrapping at both ends",
        },
        {
          keys: "Esc",
          action: "Same as Cancel; closes only the topmost dialog",
        },
        {
          keys: "Enter",
          action: "Activates the focused button",
        },
        {
          keys: "Mod+Enter",
          action: "Submits a form dialog. A destructive confirm has no shortcut.",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <div role=\"alertdialog\"> as web at desktop density",
      import: "import { Dialog } from \"@antfabric/ui-react\"",
      notes: [
        "W_MODAL = clamp(540px, 37.5vw, 960px): 540 on a 1440 laptop, growing with the screen, capped at 960. It is the one modal width in the app; a confirm (W_CONFIRM, a fixed 440) and the command palette are the documented exemptions, and a test lists them.",
        "Confirm layout: 24 / 20 / 20 padding, 20px corners, a 42px glyph tile, a display-font title, the body at 13px, and the two buttons right-aligned at equal widths (DialogActions).",
        "The CTA is solid danger-coloured for every confirm whose glyph is a bin; Log out, Disconnect and Remove from your list stay on the brand fill because they destroy nothing.",
        "Focus: on mount the first control takes focus (a confirm's Cancel, a form's first field; the panel when it holds nothing focusable), Tab wraps inside, and the opener gets focus back on unmount if it is still on the page.",
        "In the catalogue the panel pops in over a fading scrim, and pressing the CTA spins it until the app answers; Cancel and Close stay live, as while the request is in flight.",
        "Escape runs through the app's Escape ladder: a popover menu first, then the confirm, then the form under it — one layer per press.",
      ],
      keyboard: [
        {
          keys: "Tab / Shift+Tab",
          action: "Trapped inside the panel, wrapping",
        },
        {
          keys: "Esc",
          action: "Closes the innermost layer only",
        },
        {
          keys: "Mod+Enter",
          action: "Submits a form dialog",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "A bottom sheet: <Enter motion=\"slide-up\"> (role alertdialog or dialog, accessibilityViewIsModal) over a fading scrim, StyleSheet over useTheme(); the CTA and Cancel as full-width Buttons, IconButton to close; a press waits for the app's answer through usePending (`loading` or a new `error` ends it)",
      import: "import { Dialog } from \"@antfabric/ui-react-native\"",
      notes: [
        "Title row 16 under the handle, message 28 above the buttons, then the CTA and an outlined Cancel, both 56pt and full width — Cancel under the CTA, where the thumb rests after reading.",
        "tone danger is the red destructive button; tone primary is for an approval (granting an agent permission), which must not look like a hazard.",
        "No glyph tile on the phone; the title carries the question.",
        "Closing puts the keyboard away too.",
        "In the catalogue the sheet slides up, and pressing the CTA spins it until the app answers; Cancel and Close stay live.",
      ],
      gestures: [
        {
          gesture: "Tap the CTA",
          action: "Confirms, then closes",
        },
        {
          gesture: "Tap Cancel, the ×, the backdrop, or drag down",
          action: "Cancels",
        },
        {
          gesture: "Android back",
          action: "Cancels (dismisses the keyboard first if it is up)",
        },
      ],
    },
  },
  a11y: {
    role: "alertdialog",
    label: "{title}",
    notes: [
      "aria-labelledby the title and aria-describedby the body, so a screen reader reads the question and what will be lost before the buttons.",
      "Web: focus moves in when the dialog mounts, whenever that is (a timer, a deep link, a push), unless the tree is under `autoFocus={false}`; a confirm focuses Cancel, not the CTA, so a reflexive Enter never deletes, and a form focuses its first field. Tab and Shift+Tab wrap inside the panel, Esc cancels (and stops there, so a layer under keeps its own), and when the dialog unmounts focus returns to the control that had it, if that is still on the page.",
      "With `modal` the kit makes the rest of the root inert and hidden from assistive tech and locks the page's scroll while the dialog is open. Without it, the host that mounts the dialog owns those.",
      "The glyph tile is decorative and hidden from assistive tech.",
      "Phone: the sheet is a modal view; Android's back button cancels, VoiceOver's and TalkBack's escape gesture cancels (both only while `dismissible`), screen-reader focus moves to the title on open, and an error that arrives is announced. A form dialog lifts its sheet above the keyboard.",
    ],
  },
  examples: [
    {
      name: "Destructive confirm",
    },
    {
      name: "Delete a message",
      props: {
        title: "Delete this message?",
        body: "This also deletes its 3 replies, including replies from other people. This cannot be undone.",
        confirmLabel: "Delete",
      },
    },
    {
      name: "Non-destructive confirm",
      description: "Ends a session, destroys nothing: the brand fill, not the danger fill.",
      props: {
        title: "Log out of AntFabric?",
        icon: "log-out",
        tone: "primary",
        body: "You’ll be returned to the sign-in screen. Fabric keeps your ritual and your drafts exactly as they are.",
        confirmLabel: "Log out",
      },
    },
    {
      name: "Disconnect",
      props: {
        title: "Disconnect Gmail from AntFabric?",
        icon: "unlink",
        tone: "primary",
        body: "The Inbox stops copying your mail, and the copy AntFabric keeps is deleted later unless you reconnect. Nothing in your Gmail changes, and your Calendar and Meetings keep working.",
        confirmLabel: "Disconnect",
      },
    },
    {
      name: "Form dialog",
      description: "The one modal width, drawn at 540.",
      props: {
        kind: "form",
        title: "Edit channel",
        subtitle: "#release-train · Atlas Mobile",
        body: "",
        tone: "primary",
        confirmLabel: "Save changes",
        children: [
          {
            el: "component",
            use: "text-field",
            props: {
              label: "Topic",
              value: "4.12 ships Thursday — blockers in thread",
              helper: "",
            },
          },
          {
            el: "component",
            use: "text-field",
            props: {
              label: "Description",
              value: "Where the mobile release is cut, smoke-tested and shipped. Release captain rotates weekly.",
              helper: "",
            },
          },
        ],
      },
    },
    {
      name: "Confirming",
      props: {
        loading: true,
      },
    },
    {
      name: "Failed",
      props: {
        error: "Couldn’t delete the task. Check your connection and try again — nothing was removed.",
      },
    },
  ],
  matrix: [
    {
      prop: "kind",
    },
    {
      prop: "tone",
    },
  ],
  edgeCases: [
    {
      title: "A dialog over a dialog (modal)",
      platforms: ["web", "desktop"],
      handling: "Each modal dialog joins the overlay stack: Esc and a press on the scrim cancel only the top one, and the page's scroll comes back when the last one closes.",
    },
    {
      title: "Must be answered (dismissible off)",
      platforms: ["web", "desktop", "mobile"],
      handling: "Esc, a press on the scrim, the phone's handle and Android's back do nothing; only Cancel and the CTA close it. For a step with no safe way out, such as accepting terms before going on.",
    },
    {
      title: "Unsaved changes",
      platforms: ["web", "desktop", "mobile"],
      handling: "Esc, a click on the scrim, the ×, a drag-down on the phone: on a form with edits, each asks first instead of discarding silently. A form with no edits closes at once. The question names what is unsaved, and the safe answer keeps editing.",
      example: {
        name: "Discard changes?",
        props: {
          title: "Discard your changes?",
          body: "Your edits to #release-train’s topic and description haven’t been saved.",
          confirmLabel: "Discard",
          cancelLabel: "Keep editing",
        },
      },
    },
    {
      title: "A dialog opened while another is open",
      platforms: ["web", "desktop"],
      handling: "One level only: a confirm may open over a form (Discard changes over Edit channel); nothing opens over a confirm. The second scrim is the light one, so the stack never goes black, and only the top dialog is focusable. Esc peels the confirm first. On the phone the form sheet is replaced, not stacked — and iOS silently drops a modal presented while another is still dismissing, so the confirm waits for the first sheet's onDismiss.",
      example: {
        name: "Over a form",
        props: {
          stacked: true,
          behindTitle: "Edit #release-train",
          title: "Discard your changes?",
          body: "Your edits to #release-train’s topic and description haven’t been saved.",
          confirmLabel: "Discard",
          cancelLabel: "Keep editing",
        },
      },
    },
    {
      title: "Body longer than the window",
      platforms: ["web", "desktop", "mobile"],
      handling: "The title and the actions stay put and only the body scrolls, so the buttons never leave the screen. The panel caps at the window height minus 48; drawn here at 280px of body. Below about 590px of viewport the clamp stops deciding and the panel is the window minus its padding.",
      example: {
        name: "Long body",
        props: {
          title: "Remove Fabric from #platform-eng?",
          icon: "list-x",
          tone: "primary",
          confirmLabel: "Remove Fabric",
          body: "Fabric stops reading new messages in #platform-eng and will no longer answer when someone mentions it here. Summaries it already posted stay in the channel and keep their links. Scheduled digests for this channel — the Monday standup recap and the Thursday release-readiness check — are cancelled; anyone who subscribed to them is told by Fabric in a direct message. Tasks Fabric created from this channel keep their owners and due dates, but Fabric will no longer chase them here. Meeting notes from calls started in this channel stay in Meetings. You can add Fabric back at any time from the channel's details, and it will pick up from new messages only — it does not re-read what was said while it was away. Other channels are not affected.",
        },
      },
    },
    {
      title: "Keyboard on the phone",
      platforms: ["mobile"],
      handling: "A sheet with a field lifts above the keyboard on both platforms (Android's edge-to-edge Modal does not resize for the IME, so the sheet measures it) and caps its height to what is left above the keys. Closing dismisses the keyboard too.",
      example: {
        name: "Type to confirm",
        props: {
          title: "Delete #release-train?",
          body: "Every message, file and pin in it goes, for everyone. Type the channel name to confirm.",
          confirmLabel: "Delete channel",
          keyboard: true,
          children: [
            {
              el: "input",
              attrs: {
                value: "release-tra",
                label: "Channel name",
              },
              style: {
                height: "$control.hInput",
                paddingX: "$space.md",
                radius: "$radius.input",
                border: "1px solid $border.strong",
                fontSize: "$text.body",
                color: "$fg.body",
                marginTop: -12,
                marginBottom: "$space.lg",
              },
            },
          ],
        },
      },
    },
    {
      title: "Pressed twice, slow, or failed",
      platforms: ["web", "desktop", "mobile"],
      handling: "The CTA disables the moment it is pressed; the request carries an idempotency key. The spinner appears after 300 ms and stays at least 400 ms. While in flight, Cancel, Esc and the scrim do nothing — closing would hide the outcome. After 8 s the label reads \"Still deleting…\". A failure keeps the dialog open with the reason inline, and the same button retries.",
    },
    {
      title: "Esc and focus",
      platforms: ["web", "desktop"],
      handling: "Esc is Cancel and closes only the topmost layer — an open menu first, then the confirm, then the form beneath. Tab and Shift+Tab wrap inside the panel; with nothing focusable, Tab does nothing rather than escaping. On close, focus returns to the control that opened it, or to the pane heading if that control is gone. In macOS full screen, Esc is consumed by the app before the system sees it, so cancelling a dialog never also exits full screen.",
    },
    {
      title: "The thing is deleted on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "If the task, message or channel disappears while its confirm is open (deleted from the phone, say), the confirm closes and a toast says \"Already deleted on another device.\" The CTA is never left pointing at nothing.",
    },
    {
      title: "Window hidden, tab in the background, app killed",
      platforms: ["web", "desktop", "mobile"],
      handling: "Hiding the desktop window to the tray leaves the dialog open exactly as it was; nothing auto-confirms or auto-cancels, and a deep link that arrives meanwhile waits behind it. A background web tab keeps it open. A killed phone app does not restore a transient confirm; form drafts survive.",
    },
    {
      title: "Text at 130%, reduced motion, dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "The title wraps to two lines before truncating; on the phone the sheet grows and the body scrolls before the buttons are pushed off. With reduced motion the panel fades in without the rise. In dark mode the scrim is black at 55% and the panel is the raised surface.",
    },
  ],
  related: ["bottom-sheet", "menu", "toast"],
  flows: [
    {
      id: "confirm-a-delete",
      title: "Confirm before a message is deleted",
      description: "The confirm asks about one thing already chosen and says what goes with it. Delete does the work at once; if the server refuses, the message comes back and the toast says why.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The store holds which message is being asked about",
          detail: "One field, set by the message menu's Delete. The dialog is drawn while it is set, and its copy counts the replies that would go with the message.",
          code: "askDeleteMessage: (messageId) => set(() => ({ deletingMsg: messageId, msgMenuFor: null }))",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The screen keeps the message it is asking about",
          detail: "The channel screen holds the long-pressed message in local state; the confirm sheet is visible while it is set.",
          code: "const [confirmDelete, setConfirmDelete] = useState<WireMessage | null>(null)  // <ConfirmSheet visible={confirmDelete !== null} />",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route keeps it in component state",
          detail: "The channel route holds the message id while the confirm is up, and the delete is a TanStack Query mutation on the channel's message query.",
          code: "const [deleting, setDeleting] = useState<string | null>(null)  // const del = useMutation({ mutationFn: deleteMessage })",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Delete is chosen from the message's menu",
          detail: "The ⋮ or a right-click on web and desktop, the long-press sheet on the phone. The row only asks; nothing is deleted yet.",
          code: "item('Delete', () => a.askDeleteMessage(message.id))  ·  onDelete={() => setConfirmDelete(acting)}",
        },
        {
          kind: "motion",
          title: "The scrim fades in and the card pops",
          detail: "The scrim blurs the channel behind and the card pops from the centre. Today the shared Scrim fades (af-fade); ConfirmDialog's card adds af-alert-in, and this message confirm has no card motion of its own yet.",
          enter: "pop",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The confirm slides up as a sheet",
          detail: "A bottom sheet, not a centred card: the backdrop dims and the sheet slides up, Delete within thumb reach and Cancel under it.",
          enter: "slide-up",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "Focus moves into the dialog",
          detail: "The panel takes focus unless something inside already has it, and Tab wraps inside. Today this confirm autofocuses Delete; this spec puts first focus on Cancel, so a reflexive Enter never deletes.",
          code: "if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true })",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "Delete is pressed",
          detail: "The danger button, which names the action again. A click or Enter on it; a tap on the phone.",
        },
        {
          kind: "event",
          title: "onConfirm fires",
          detail: "The dialog doesn't know what it deletes. The caller's handler does; on the phone ConfirmSheet also closes itself.",
          code: "onConfirm?.()",
        },
        {
          kind: "effect",
          title: "The dialog closes and the message goes at once",
          detail: "Optimistic: the message and any loaded replies leave the list in the same update that clears deletingMsg, then the request runs. A refusal puts the captured rows back. On the web this is the mutation's onMutate on the cached pages.",
          code: "set({ deletingMsg: null, chMsgs: { …, [key]: before.filter((m) => !removedIds.has(m.id)) } }); backend.channels.deleteMessage(messageId).catch(rollback)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "effect",
          title: "The sheet closes and the mutation runs",
          detail: "onMutate takes the message out of the cached pages and the device cache before the request; an error re-reads the channel so it comes back.",
          code: "remove.mutate(confirmDelete.id, { onError: surface }); setConfirmDelete(null)",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "The message is gone, for everyone",
          detail: "No toast when it works; the gap says it. If the server refuses, the message is back where it was and the toast reads \"That message could not be deleted.\"",
          code: "showToast(refusalText(error, 'That message could not be deleted.'), 'error')",
        },
      ],
      replay: [
        {
          step: 3,
          hold: 1300,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              justify: "center",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: true,
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1700,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              justify: "center",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: true,
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Delete this message?",
                  body: "This cannot be undone.",
                  confirmLabel: "Delete",
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: "Delete",
          hold: 1000,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              justify: "center",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: true,
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Delete this message?",
                  body: "This cannot be undone.",
                  confirmLabel: "Delete",
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1600,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              justify: "center",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 3,
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 600,
              paddingTop: "$space.xl",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: false,
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 600,
              paddingTop: "$space.xl",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: false,
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Delete this message?",
                  body: "It will be removed for everyone in the channel. This cannot be undone.",
                  confirmLabel: "Delete",
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: "Delete",
          hold: 1000,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 600,
              paddingTop: "$space.xl",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: false,
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Delete this message?",
                  body: "It will be removed for everyone in the channel. This cannot be undone.",
                  confirmLabel: "Delete",
                },
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1600,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 600,
              paddingTop: "$space.xl",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "back-out",
      title: "Back out without deleting",
      description: "Cancel is a real answer. Every way out does the same thing: the caller clears the question, the confirm goes, and the message stays exactly as it was.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "trigger",
          title: "Cancel, Escape, or a click on the scrim",
          detail: "All three answer the same way. Escape is caught on the panel and closes only this layer; a click outside the card lands on the scrim.",
          code: "onKeyDown: if (e.key === 'Escape') a.askDeleteMessage(null)  ·  <Scrim onClose={() => a.askDeleteMessage(null)}>",
          platforms: ["web", "desktop"],
        },
        {
          kind: "trigger",
          title: "Cancel, the ×, the backdrop, or Android back",
          detail: "The backdrop is a Dismiss button and Android back is the Modal's onRequestClose, so every one runs the sheet's close, which also puts the keyboard away.",
          code: "<Pressable accessibilityLabel=\"Dismiss\" onPress={close} />  ·  <Modal onRequestClose={close}>",
          platforms: ["mobile"],
        },
        {
          kind: "event",
          title: "onCancel fires",
          detail: "Not fired while a confirm is in flight: Cancel, Escape and the scrim do nothing until it settles.",
          code: "onCancel?.()",
        },
        {
          kind: "state",
          title: "The caller clears the question",
          detail: "The same field that opened the confirm closes it. Nothing else changes: no request, no toast.",
          code: "a.askDeleteMessage(null)  ·  setConfirmDelete(null)",
        },
        {
          kind: "motion",
          title: "The card and the scrim go together",
          detail: "Today the confirm unmounts in the same frame, with no exit motion, so nothing lingers over the message you kept.",
          platforms: ["web", "desktop"],
        },
        {
          kind: "motion",
          title: "The sheet slides back down",
          detail: "The Modal's slide plays in reverse and the backdrop clears.",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "Focus goes back where it was",
          detail: "The Scrim gives focus back to the element that had it, if that is still on the page. Here that was the menu's Delete row, which closed when the confirm opened, so this spec sends focus to the message instead.",
          code: "if (lost && opener && opener !== document.body && document.contains(opener)) opener.focus()",
          platforms: ["web", "desktop"],
        },
        {
          kind: "result",
          title: "Nothing changed",
          detail: "The message is still there, still the message cursor on the desktop, so ↑ ↓ carry on from it.",
        },
      ],
      replay: [
        {
          step: 0,
          press: "Cancel",
          hold: 1300,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              justify: "center",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: true,
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Delete this message?",
                  body: "This cannot be undone.",
                  confirmLabel: "Delete",
                },
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1600,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 560,
              minHeight: 380,
              justify: "center",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: true,
                },
              },
            ],
          },
        },
        {
          step: 1,
          press: "Cancel",
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 600,
              paddingTop: "$space.xl",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: false,
                },
              },
              {
                el: "component",
                use: "dialog",
                style: {
                  position: "absolute",
                  inset: 0,
                  alignSelf: "stretch",
                },
                props: {
                  title: "Delete this message?",
                  body: "It will be removed for everyone in the channel. This cannot be undone.",
                  confirmLabel: "Delete",
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1600,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 375,
              minHeight: 600,
              paddingTop: "$space.xl",
              gap: "$space.xs",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "indigo",
                  time: "2:14 PM",
                  body: "Release train is cut: 4.12.0 is on staging. Smoke tests start at 3.",
                  reactions: [],
                },
              },
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  identity: "red",
                  time: "2:16 PM",
                  body: "Ignore the build link above, it points at last night's branch.",
                  reactions: [],
                  highlighted: false,
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
