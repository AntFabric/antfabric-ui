import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "composer",
  name: "Composer",
  category: "messaging",
  level: "organism",
  status: "beta",
  description: "Where a message is written. On web and desktop it is the rich input with a formatting toolbar, attach, emoji, @mention and send; on the phone it is the ComposerBar that rides the keyboard. It knows when it cannot send — empty, uploading, too long, offline, read-only, archived — and says why.",
  props: {
    placeholder: {
      type: "string",
      default: "",
      sample: "Message #platform-eng",
      description: "\"Message #<channel>\", \"Message <person>\" in a DM, \"Reply…\" in a thread, \"Edit message\" while editing.",
    },
    value: {
      type: "string",
      default: "",
      description: "The draft. Kept per conversation, across channel switches and restarts.",
    },
    mode: {
      type: "enum",
      options: ["default", "editing", "thread", "offline", "readonly", "archived"],
      default: "default",
      description: "editing: changing one of your messages. thread: the reply box, with \"Also send to #channel\". offline: sends refused, draft kept. readonly / archived: no box at all, a notice instead.",
    },
    sendKey: {
      type: "enum",
      options: ["enter", "mod-enter"],
      default: "enter",
      platforms: ["web", "desktop"],
      description: "Preferences → Messages: Enter sends and Shift+Enter is a new line (default), or Mod+Enter sends and Enter is a new line. Mod+Enter always sends in both.",
    },
    uploading: {
      type: "boolean",
      default: false,
      description: "A staged file is still uploading. Send waits for it.",
    },
    attachments: {
      type: "array",
      default: [],
      description: "Staged files, links and voice notes, as Attachment { key, kind, name, fileType, badge, typeLabel, size, status, progress, src, title, domain, description, url, duration }, drawn as attachment cards above the text: every field reaches the card, as Message passes it.",
    },
    lengthHint: {
      type: "string",
      default: "",
      description: "Silent until the draft is within 1,000 of the 16,000-character limit: \"1,000 left\", then \"240 over\".",
    },
    tooLong: {
      type: "boolean",
      default: false,
      description: "Past the limit: the hint turns red and Send is disabled.",
    },
    alsoSend: {
      type: "boolean",
      default: false,
      description: "Thread only: also post this reply to the channel.",
    },
    alsoSendTo: {
      type: "string",
      default: "",
      sample: "#platform-eng",
      description: "The conversation the reply would also go to.",
    },
    formatting: {
      type: "boolean",
      default: false,
      sample: true,
      description: "Web and desktop: the formatting toolbar above the text (can be hidden from Preferences; the shortcuts still work). Phone: the Formatting button beside Attach.",
    },
    attach: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The Attach button; disabled offline.",
    },
    emoji: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The Emoji button.",
    },
    mention: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The Mention someone button.",
    },
    commands: {
      type: "boolean",
      default: false,
      sample: true,
      description: "The slash-command button. Hidden while editing.",
    },
    record: {
      type: "boolean",
      default: false,
      sample: true,
      platforms: ["mobile"],
      description: "The mic beside Send. Hidden while editing, disabled offline.",
    },
    tools: {
      type: "array",
      default: [],
      description: "The product's own tools: IconActionItem { key, label, icon, badge?, disabled? }, drawn as icon buttons after the built-in ones and before Send. The icon is required: a product's tool cannot draw a blank button.",
    },
    focused: {
      type: "boolean",
      default: false,
      description: "Draws the focused edge (the catalogue cannot focus).",
    },
    disabled: {
      type: "boolean",
      default: false,
      description: "The composer takes no input: the field and every tool are disabled, and Send waits.",
    },
    maxLength: {
      type: "number",
      description: "The most characters the field takes, enforced by the platform. Pair it with lengthHint to show how many are left.",
    },
    autoFocus: {
      type: "boolean",
      default: false,
      description: "Focuses the field when the composer mounts (after Reply or Edit opens it). Not under a host that draws overlays as pictures.",
    },
    avoidKeyboard: {
      type: "boolean",
      default: false,
      platforms: ["mobile"],
      description: "Lifts the composer above the keyboard (a KeyboardAvoidingView, padding on iOS). Off by default: a screen that already resizes for the keyboard must not do it twice. Home-indicator spacing is the screen's (SafeAreaView or safe-area insets around the composer).",
    },
    onValueChange: {
      type: "event",
      args: "value: string",
      changes: "value",
      description: "The draft as it is typed, and \"\" when Send clears it. Given `value` too, the box is controlled (the app keeps the draft per conversation); otherwise it keeps its own.",
    },
    onAlsoSendChange: {
      type: "event",
      args: "alsoSend: boolean",
      changes: "alsoSend",
      description: "Thread only: called with `alsoSend` as a press on \"Also send to\" leaves it.",
    },
    onSend: {
      type: "event",
      args: "text: string",
      description: "Enter (per sendKey), Mod+Enter, or Send, with a sendable draft: the words as typed. The box clears in the same tick. Save while editing.",
    },
    onCancelEdit: {
      type: "event",
    },
    onAttach: {
      type: "event",
      description: "Desktop/web: the file picker (multiple). Mobile: the \"Add to your message\" sheet — Upload File, Upload Image, Take Photo.",
    },
    onRecord: {
      type: "event",
      platforms: ["mobile"],
      description: "The mic is pressed: the app's recorder takes over (hold to record, slide to cancel).",
    },
    onEmoji: {
      type: "event",
      description: "The Emoji button was pressed: the app opens its picker.",
    },
    onMention: {
      type: "event",
      description: "The Mention someone button was pressed: the app opens its picker.",
    },
    onCommands: {
      type: "event",
      description: "The slash-command button was pressed: the app opens its command list.",
    },
    onFormat: {
      type: "event",
      platforms: ["web", "desktop"],
      args: "format: ComposerFormat",
      description: "A formatting button was pressed (bold, italic, underline, strikethrough, link, ordered-list, bulleted-list, code, code-block): the app wraps the selection.",
    },
    onFormatting: {
      type: "event",
      platforms: ["mobile"],
      description: "The Formatting button was pressed: the app opens its formatting face.",
    },
    onAction: {
      type: "event",
      args: "action: IconActionItem",
      description: "A product tool was pressed. Called with the whole item, so the product switches on `action.key`.",
    },
    onAttachmentOpen: {
      type: "event",
      args: "attachment: Attachment",
      description: "A staged attachment's card was pressed: the app opens its preview.",
    },
    onAttachmentDownload: {
      type: "event",
      platforms: ["web", "desktop"],
      args: "attachment: Attachment",
      description: "Never called, and deprecated: a staged file is the sender's own, so its chip has no download (a ready chip's body calls onAttachmentOpen). Kept so 1.x code compiles; removed in 2.0.",
    },
    onAttachmentCancel: {
      type: "event",
      args: "attachment: Attachment",
      description: "A staged attachment's remove (or cancel, while it uploads) was pressed: the app takes it out of `attachments`.",
    },
    onAttachmentRetry: {
      type: "event",
      args: "attachment: Attachment",
      description: "A failed attachment's Retry was pressed: the app starts its upload again. Given this, the card is controlled by the attachment's own `status`.",
    },
  },
  platforms: {
    web: {
      status: "partial",
      base: "A plain <textarea data-af-input> (field-sizing: content, and a measured height as a fallback) in a card drawn with inline styles over `t`; the toolbar and footer are the kit's IconButton, staged files the kit's AttachmentCard (compact). Enter / Shift+Enter / Mod+Enter / Escape on the textarea, IME-safe. Rich text, the emoji panel and the @ / # / : / slash pickers are the app's.",
      import: "import { Composer } from \"@antfabric/ui-react/chat\"",
      notes: [
        "Centred at clamp(680px, 34vw, 880px) — the desktop's --content-w-composer — so a 2560px window does not stretch a line of text across the screen.",
        "Drafts are saved to IndexedDB per workspace and conversation on every pause in typing, so a reload or a crashed tab keeps them. Two tabs on one channel share the draft (BroadcastChannel); the last edit wins.",
        "Closing the tab with an unsent draft does not warn (it is saved); closing it mid-upload does (beforeunload).",
        "Shortcuts the browser owns are never used: link is Mod+Shift+K because Mod+K is the quick switcher, and nothing here uses ⌘W / ⌘T / ⌘N / ⌘L.",
        "Paste of an image or file stages it; dropping files anywhere on the conversation shows \"Drop files to attach to #platform-eng\".",
        "Not in the kit yet: formatting marks and their shortcuts (the toolbar draws but does nothing on a plain textarea), the emoji, @ / # / : and slash pickers, ↑ to edit your last message, paste and drop staging, and the Aa collapse under 420px.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "Sends (Enter-sends setting); picks the highlighted person when the @ picker is open",
        },
        {
          keys: "Shift+Enter",
          action: "New line; inside a list, the next item — an empty item leaves the list",
        },
        {
          keys: "Mod+Enter",
          action: "Always sends",
        },
        {
          keys: "Mod+B / Mod+I / Mod+U",
          action: "Bold / italic / underline",
        },
        {
          keys: "Mod+Shift+X",
          action: "Strikethrough",
        },
        {
          keys: "Mod+E",
          action: "Inline code",
        },
        {
          keys: "Mod+Shift+K",
          action: "Add a link",
        },
        {
          keys: "↑",
          action: "In an empty box: edit your last message",
        },
        {
          keys: "Escape",
          action: "Closes a picker; while editing, cancels the edit",
        },
      ],
    },
    desktop: {
      status: "partial",
      base: "The same file as web (one component): the textarea grows 22–220px, then scrolls; IconButton footer; ⌘ glyphs in the hints from usePlatform().os. The RichInput, EmojiPanel and MentionPicker are the app's.",
      import: "import { Composer } from \"@antfabric/ui-react/chat\"",
      notes: [
        "Footer today: + Attach files, Insert emoji, Mention someone, Slash command, the silent-until-needed LengthCounter, and a Send that turns into a coral circle once there is something to send (ADR-8930).",
        "The channel composer spans the pane today (padding 0 18 16); the clamp width is what Home and Fabric use. Confirm whether channels should adopt it.",
        "Offline (ADR-0704): Enter is refused with \"You're offline. Your message wasn't sent. It's still here for when you're back.\" and the draft stays. The typing slot above says AntFabric is offline for as long as it is.",
        "Drafts live in the SQLite cache per conversation and survive quitting the app and close-to-tray.",
        "Uploads go up on pick, not on send, so a large file never makes Enter feel broken; Send waits (\"Waiting for the upload to finish\").",
        "In the catalogue, Send clears `value` when the draft is sendable (the coral circle goes back to a faint glyph), and the thread's 'Also send to' row toggles `alsoSend`. The editing and offline lines rise in above the box.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "Sends (or picks in an open picker)",
        },
        {
          keys: "Shift+Enter",
          action: "New line, list-aware",
        },
        {
          keys: "Mod+Enter",
          action: "Always sends",
        },
        {
          keys: "Mod+B / Mod+I / Mod+U / Mod+E",
          action: "Bold / italic / underline / code",
        },
        {
          keys: "Mod+Shift+K",
          action: "Add a link",
        },
        {
          keys: "↑",
          action: "In an empty box: edit your last message",
        },
        {
          keys: "Escape",
          action: "Closes a picker, then cancels an edit",
        },
      ],
    },
    mobile: {
      status: "partial",
      base: "A multiline TextInput (34–112pt, then it scrolls) in a View (radius 20) + the bar of the kit's IconButtons at 36pt with no gaps; staged files are the kit's AttachmentCard (compact). Keyboard avoidance and haptics are the screen's.",
      import: "import { Composer } from \"@antfabric/ui-react-native/chat\"",
      notes: [
        "Keyboard-aware: the composer rides the keyboard (useKeyboardInset), sits on the home-indicator inset when it is down, and tapping the timeline dismisses the keyboard without losing the draft.",
        "Grows from one line to 112pt, then scrolls inside. Today's channel composer grows to 20% of the screen (4–8 lines, models/composerHeight.ts) and the Fabric composer stops at 112 — this spec uses 112 everywhere; confirm with design.",
        "Return inserts a new line; only the Send button sends. With a hardware keyboard on iPad, Enter sends and Shift+Enter is a new line, as on desktop.",
        "The bar: + opens \"Add to your message\" (Upload File, Upload Image, Take Photo); Aa swaps the bar to the formatting face (B I U S, lists, link) with a 180 ms slide; ☺ emoji; @ mention; / commands; the mic records a voice note (new — the app has no voice notes yet).",
        "Idle Send is a bare faint glyph; only a sendable draft lights the coral circle. Editing swaps it for a check labelled Save.",
        "Offline the phone refuses the send (\"You're offline, so this hasn't been sent. It's still here.\") and keeps the text; the line above the composer says AntFabric is offline, after a 5 s grace so a blip never flashes.",
        "Not in the kit yet: the Aa formatting face, Enter-sends on an iPad hardware keyboard, and the mic's hold-to-record gesture (a tap calls onRecord; the recorder is the app's).",
      ],
      gestures: [
        {
          gesture: "Tap Send",
          action: "Sends; light haptic. Disabled (no response) when there is nothing sendable",
        },
        {
          gesture: "Press and hold the mic",
          action: "Records a voice note; slide left to cancel, release to stage it",
        },
        {
          gesture: "Swipe down on the timeline",
          action: "Dismisses the keyboard interactively",
        },
      ],
    },
  },
  a11y: {
    notes: [
      "The text box is labelled by its purpose (\"Message\", \"Thread reply\", \"Edit message\"); on the phone the placeholder is its hint, so the channel name is heard too.",
      "Send exposes its disabled state. Pressing Send or Enter while a file uploads announces \"Waiting for the upload to finish\"; the hint under the box says the same.",
      "The length counter is drawn, not read on every keystroke: it is announced when the draft crosses 100, 50 and 10 characters left, and when it goes over.",
      "The formatting toolbar is one group: arrow keys, Home and End move between its buttons (web and desktop).",
      "Going offline (and the channel locking) is announced when it happens, so a screen-reader user hears why the send will not go; the line itself is plain text.",
      "Read-only and archived notices replace the box entirely, so there is no field to land in that cannot be used.",
      "`disabled` disables the field and every tool. On the phone the toolbar buttons are 36pt drawn with a touch area that stops short of 44pt until IconButton grows its hit area from the drawn size.",
    ],
  },
  examples: [
    {
      name: "Empty",
      props: {},
      width: 640,
    },
    {
      name: "Typing",
      props: {
        value: "Cutting the release branch at 4. Anything still open on PLAT-2291?",
        focused: true,
      },
      width: 640,
    },
    {
      name: "Mod+Enter sends",
      props: {
        value: "Notes from today's crit:\n1. Tighten the empty states",
        sendKey: "mod-enter",
        focused: true,
      },
      platforms: ["web", "desktop"],
      width: 640,
    },
    {
      name: "Editing a message",
      props: {
        mode: "editing",
        placeholder: "Edit message",
        value: "Staging is green again. I'll cut the release branch at 4:30 instead.",
        focused: true,
      },
      width: 640,
    },
    {
      name: "Replying in a thread",
      props: {
        mode: "thread",
        placeholder: "Reply…",
        value: "Fixed in #4127 — merging after CI.",
        alsoSendTo: "#release-train",
        alsoSend: true,
      },
      width: 420,
    },
    {
      name: "Offline",
      props: {
        mode: "offline",
        value: "Will check the Android build when I land.",
      },
      width: 640,
    },
    {
      name: "Uploading attachments",
      props: {
        value: "Recording from the design crit, and the deck.",
        uploading: true,
        attachments: [
          {
            kind: "file",
            name: "design-crit-2026-10-29.mp4",
            fileType: "video",
            badge: "MP4",
            size: "184 MB",
            status: "uploading",
            progress: 46,
          },
          {
            kind: "file",
            name: "onboarding-v4.key",
            fileType: "deck",
            badge: "KEY",
            size: "22 MB",
            status: "ready",
          },
        ],
      },
      width: 640,
    },
    {
      name: "Read-only channel",
      props: {
        mode: "readonly",
      },
      width: 640,
    },
    {
      name: "Archived channel",
      props: {
        mode: "archived",
      },
      width: 640,
    },
    {
      name: "Near the limit",
      props: {
        value: "Full incident timeline below (pasted from the postmortem doc)…",
        lengthHint: "1,000 left",
      },
      width: 640,
    },
    {
      name: "Over the limit",
      props: {
        value: "Full incident timeline below (pasted from the postmortem doc)…",
        lengthHint: "240 over",
        tooLong: true,
      },
      width: 640,
    },
  ],
  matrix: [
    {
      prop: "mode",
    },
  ],
  edgeCases: [
    {
      title: "Pressing Enter while composing in an IME",
      platforms: ["web", "desktop"],
      handling: "Enter that commits a Japanese, Chinese or Korean composition (isComposing / keyCode 229) never sends. Only an Enter after composition ends does.",
    },
    {
      title: "A picker is open",
      platforms: ["web", "desktop", "mobile"],
      handling: "While the @, #, : or / picker has candidates, Enter and Tab choose the highlighted one and Escape closes it; nothing sends. On mobile the pickers are sheets above the keyboard and the bar's buttons open them directly.",
    },
    {
      title: "Double press on Send",
      platforms: ["web", "desktop", "mobile"],
      handling: "The box is cleared and Send disabled in the same tick as the press, before the request; the message carries a client id so a network retry cannot post it twice.",
    },
    {
      title: "Send pressed while a file is still uploading",
      platforms: ["web", "desktop", "mobile"],
      handling: "Send stays reachable (aria-disabled on the web, not disabled), drawn quiet: a press, or Enter, sends nothing and says \"Waiting for the upload to finish\", the same words as the line under the box. Once the upload is done Send lights up.",
      example: {
        name: "Waiting for the upload",
        props: { value: "Here's the deck for Thursday", uploading: true, attachments: [{ key: "deck", name: "q3-roadmap.key", fileType: "deck", badge: "KEY", size: "18 MB", status: "uploading", progress: 64 }] },
      },
    },
    {
      title: "Editing with Mod+Enter to send",
      platforms: ["web", "desktop"],
      handling: "The edit banner names the key that saves: ⌘↩ (Ctrl+Enter on Windows and Linux) with sendKey mod-enter, Enter otherwise, since plain Enter is a new line there.",
      example: {
        name: "Editing, Mod+Enter",
        props: { mode: "editing", sendKey: "mod-enter", value: "Moving the release train to Thursday" },
      },
    },
    {
      title: "Offline, then back",
      platforms: ["web", "desktop", "mobile"],
      handling: "Typing is never blocked offline. Send is refused with the plain sentence and the draft stays exactly as typed; when the connection returns the notice goes and Send lights up again. Nothing is sent automatically from the composer — a message you could not see leave should not leave on its own.",
    },
    {
      title: "Edit that empties the message",
      platforms: ["web", "desktop", "mobile"],
      handling: "Saving an edit with no text left asks \"Delete this message?\" instead of posting an empty edit. Esc (or Cancel on mobile) restores the original and leaves the draft that was in the box before editing untouched.",
    },
    {
      title: "Session expired or removed from the channel",
      platforms: ["web", "desktop", "mobile"],
      handling: "A 401 refuses the send with \"Your session expired. Sign in again.\" and keeps the draft for after sign-in. Removed from a private channel mid-draft: the box is replaced by \"You are not in this channel.\" and the draft is kept locally for a day.",
    },
    {
      title: "Microphone denied",
      platforms: ["mobile"],
      handling: "Holding the mic with permission denied shows \"AntFabric can't use the microphone. Allow it in Settings.\" with Open Settings; it never re-prompts in a loop. The mic stays visible so the reason is discoverable.",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "The 112pt cap holds, so fewer lines show and the field scrolls inside; the bar's 36pt targets do not shrink and the formatting face scrolls horizontally rather than pushing Send off the card.",
    },
    {
      title: "Narrow pane",
      platforms: ["web", "desktop"],
      handling: "Under 420px the formatting toolbar collapses behind an Aa button (as on mobile) and the hint below is dropped; Send and the counter never move.",
      example: {
        name: "Narrow thread reply",
        props: {
          mode: "thread",
          placeholder: "Reply…",
          formatting: false,
          alsoSendTo: "#design-crit",
        },
        width: 320,
      },
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "The box takes dir=auto from its first strong character, so an Arabic message is typed right-to-left in an English workspace; the toolbar and Send mirror with the UI direction, and the send glyph flips.",
    },
  ],
  related: ["message", "typing-indicator", "attachment-card", "emoji-picker", "mention-picker"],
  flows: [
    {
      id: "send-a-message",
      title: "Send a message",
      description: "The composer only hands the words over. The screen decides whether they can go, clears the box in the same tick, and the timeline shows the message. If the send fails, the words come back.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The draft lives in the workspace store",
          detail: "chInput is the open conversation's draft, and drafts[key] keeps every other one across channel switches. Every keystroke goes through setChInput, which also re-arms your typing signal. Send is disabled only while a file uploads or the draft is too long.",
          code: "disabled={uploading || tooLong}  // uploading = (s.chUploading ?? 0) > 0",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The screen owns the send, the composer owns the text",
          detail: "ChannelComposer keeps the draft. The channel screen gives it onSend, the attachment tray (files upload on pick) and whether the phone is offline.",
          code: "const offline = useIsOffline()  ·  const send = useSendMessageMutation(channelId)",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route holds the draft and a send mutation",
          detail: "The draft is saved to IndexedDB per conversation. The channel route owns a TanStack Query mutation whose onMutate draws the message as sending, the way the phone does.",
          code: "const send = useMutation({ mutationFn: postMessage, onMutate: echo, onError: restoreDraft })",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Enter, or Send, is pressed",
          detail: "Enter sends with the default setting, and Mod+Enter always does. An Enter that commits an IME composition never sends. On the phone Return is a new line and only the Send button sends.",
        },
        {
          kind: "event",
          title: "onSend(text) fires",
          detail: "The composer passes the draft as it will be stored. The phone turns #Name into a channel token first, so onSend always gets the wire text.",
          code: "onSend?.(value)",
        },
        {
          kind: "state",
          title: "The store checks the draft, then clears the box",
          detail: "sendCh refuses in order: offline, a /command (run instead of posted), an upload still going, too long, a suspended DM, people who aren't in the channel. deliverCh then stops your typing signal and clears the draft and its files before the request, so a second Enter has nothing to send.",
          code: "stopTypingHere(); set((s) => ({ chInput: '', drafts: { ...s.drafts, [key]: '' }, chFiles: { ...s.chFiles, [key]: [] } }))",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The screen takes it, and the composer clears",
          detail: "onSend refuses an offline or too-long draft by answering false, and the text stays. Otherwise it answers with the send's promise: the composer clears now and puts the words back only if that promise answers false.",
          code: "settleSend(onSend(wire), () => setValue(''), () => setDraft((current) => (current === '' ? text : current)))",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "The message is posted",
          detail: "The phone has already drawn the message as sending, and posts it with its local id as client_message_id. Today's desktop adds the row when the answer comes back, or when the socket delivers it first.",
          code: "backend.channels.postMessage(channelId, text, mentions, files)  ·  send.mutateAsync({ text, mentions, authorId, localId: newLocalId(), attachmentIds })",
        },
        {
          kind: "motion",
          title: "Send goes quiet, and the message settles",
          detail: "With the box empty, the coral circle cross-fades back to the faint glyph. The message's dim lifts in place once the server confirms it; nothing slides (see Message).",
        },
        {
          kind: "result",
          title: "The box is ready for the next message",
          detail: "If the request fails instead, the desktop puts the words and the files back with \"Your message did not send. Try again.\", and the phone puts the draft back if the box is still empty.",
          code: "set((s) => ({ chInput: s.chInput || text, … })); showToast(plainFailure(error, 'Your message did not send. Try again.'), 'error')",
        },
      ],
      replay: [
        {
          step: 3,
          press: "Send message",
          hold: 900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 640,
              gap: "$space.xs",
            },
            children: [
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {
                  value: "On it — running the Android smoke suite now.",
                  focused: true,
                },
              },
            ],
          },
        },
        {
          step: 3,
          press: "Send message",
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 640,
              gap: "$space.xs",
            },
            children: [
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {
                  value: "On it — running the Android smoke suite now.",
                  focused: true,
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1400,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              width: 640,
              gap: "$space.xs",
            },
            children: [
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Aisha Bello",
                      identity: "ochre",
                      time: "10:44 AM",
                      body: "On it — running the Android smoke suite now.",
                      status: "sending",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {
                  focused: true,
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1400,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              width: 640,
              gap: "$space.xs",
            },
            children: [
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {
                  focused: true,
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1400,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 640,
              gap: "$space.xs",
            },
            children: [
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Aisha Bello",
                      identity: "ochre",
                      time: "10:44 AM",
                      body: "On it — running the Android smoke suite now.",
                      status: "sending",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {
                  focused: true,
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1500,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              width: 640,
              gap: "$space.xs",
            },
            children: [
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Aisha Bello",
                      identity: "ochre",
                      time: "10:44 AM",
                      body: "On it — running the Android smoke suite now.",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {
                  focused: true,
                },
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1800,
          platforms: ["web", "mobile"],
          scene: {
            el: "view",
            style: {
              width: 640,
              gap: "$space.xs",
            },
            children: [
              {
                el: "view",
                children: [
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Marcus Chen",
                      identity: "green",
                      time: "10:41 AM",
                      body: "Android 4.12.0 is green on staging. Can someone smoke-test the composer before Priya cuts the branch?",
                      reactions: [],
                    },
                  },
                  {
                    el: "component",
                    use: "message",
                    props: {
                      author: "Aisha Bello",
                      identity: "ochre",
                      time: "10:44 AM",
                      body: "On it — running the Android smoke suite now.",
                      reactions: [],
                    },
                  },
                ],
              },
              {
                el: "component",
                use: "composer",
                props: {
                  focused: true,
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "offline-keeps-the-draft",
      title: "Offline: the send is refused and the draft stays",
      description: "Typing is never blocked. While the connection is down a send is refused with a plain sentence and the words stay exactly as typed; nothing goes out by itself when the connection returns.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "trigger",
          title: "The connection drops",
          lane: "system",
          detail: "Both apps wait out a 5 s grace before calling it offline, so a blip never flashes the notice. A reply to #platform-eng is half written.",
        },
        {
          kind: "state",
          title: "The store declares the app offline",
          detail: "When the grace runs out, connectivity flips and the sticky offline toast shows once.",
          code: "declareOffline: set({ connectivity: 'offline' }); dismissOffline = showStickyToast(OFFLINE_TOAST)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The socket reports it, and the store decides",
          detail: "The chat socket's status is the only writer of the connectivity store, which holds the grace and the verdict. Screens read the verdict with useIsOffline.",
          code: "socket.onStatus((status, detail) => useConnectivity.getState().applyStatus(status, detail))",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The composer turns offline",
          detail: "mode becomes offline: the box goes recessed, Attach and Send dim, and typing carries on. On the desktop the line above the composer that shows who is typing says AntFabric is offline instead, for as long as it is.",
          code: "{s.connectivity === 'offline' && !s.chSearchOpen ? <div role=\"status\">{OFFLINE_NOTICE}</div> : typingNote}",
        },
        {
          kind: "motion",
          title: "The offline line rises in above the box",
          detail: "A polite live region, so a screen reader hears why Send went quiet.",
          enter: "rise",
        },
        {
          kind: "trigger",
          title: "The person tries to send anyway",
          detail: "Enter on web and desktop. Today's phone still takes a tap on Send and answers it; the spec dims Send, and Enter on an iPad keyboard gets the same answer.",
        },
        {
          kind: "state",
          title: "sendCh refuses, and says so",
          detail: "The guard runs before anything is cleared, so the box is untouched.",
          code: "if ((get().connectivity ?? 'online') === 'offline') { showToast(OFFLINE_SEND_REFUSED, 'error'); return }",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "onSend answers false, and the text stays",
          detail: "false means refused before anything went out, so the composer keeps the draft. The sentence shows in a box above the composer.",
          code: "if (offline) { setWriteError(OFFLINE_SEND_REFUSED); return false; }",
          platforms: ["mobile"],
        },
        {
          kind: "result",
          title: "Nothing is sent, and nothing is lost",
          detail: "Desktop: \"You're offline. Your message wasn't sent. It's still here for when you're back.\" Phone: \"You're offline, so this hasn't been sent. It's still here.\"",
        },
        {
          kind: "trigger",
          title: "The connection comes back",
          lane: "system",
          detail: "The offline line goes and Send lights up again. Nothing sends by itself: a message you didn't see leave shouldn't leave on its own.",
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
              width: 640,
              minHeight: 280,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Will check the Android build when I land.",
                },
              },
            ],
          },
        },
        {
          step: 3,
          hold: 1700,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 640,
              minHeight: 280,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  mode: "offline",
                  value: "Will check the Android build when I land.",
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 640,
              minHeight: 280,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  mode: "offline",
                  value: "Will check the Android build when I land.",
                },
              },
              {
                el: "component",
                use: "toast",
                style: {
                  position: "absolute",
                  top: 16,
                  alignSelf: "center",
                },
                props: {
                  message: "You're offline. Your message wasn't sent. It's still here for when you're back.",
                  tone: "error",
                  dismissible: false,
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 640,
              minHeight: 280,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  mode: "offline",
                  value: "Will check the Android build when I land.",
                },
              },
              {
                el: "view",
                enter: "rise",
                style: {
                  position: "absolute",
                  top: 16,
                  left: 12,
                  right: 12,
                  paddingY: "$space.sm",
                  paddingX: "$space.md",
                  radius: 12,
                  border: "1px solid $border.default",
                  bg: "$surface.recessed",
                },
                children: [
                  {
                    el: "text",
                    text: "You're offline, so this hasn't been sent. It's still here.",
                    style: {
                      fontSize: "$text.bodySm",
                      lineHeight: "$text.bodySmLine",
                      color: "$danger.default",
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1700,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 640,
              minHeight: 280,
              justify: "flex-end",
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Will check the Android build when I land.",
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
