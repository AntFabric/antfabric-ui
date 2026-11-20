import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "progress-bar",
  name: "Progress bar",
  category: "feedback",
  level: "atom",
  status: "stable",
  description: "A thin brand-coloured fill for work with a known size — a file upload, a project's completion — or an indeterminate segment when the size is not known yet. With a title it becomes an upload row: the file, how much has moved, and Cancel.",
  props: {
    value: {
      type: "number",
      default: 40,
      description: "0–100, clamped. The desktop kit calls it pct; the mobile kit takes 0–1 and the adapter multiplies by 100, so one prop means one thing everywhere.",
    },
    indeterminate: {
      type: "boolean",
      default: false,
      description: "The size is not known yet (preparing an export, waiting for the server to accept a file). No value is announced.",
    },
    label: {
      type: "string",
      sample: "Uploading Q4 roadmap.pdf",
      description: "Accessible name of the bar. Left out, the bar says its built-in \"Progress\" (strings.progress-bar.label); the catalogue's sample names an upload.",
    },
    tone: {
      type: "enum",
      options: ["brand", "neutral", "success", "danger"],
      default: "brand",
      description: "brand while it moves; success when done; danger when it stopped and needs you; neutral for a quiet measure (storage used).",
    },
    title: {
      type: "string",
      default: "",
      description: "Turns the bar into an upload row: the file or job name, one line.",
    },
    detail: {
      type: "string",
      default: "",
      description: "How much has moved, in units a person reads: \"2.1 of 5.3 MB\", \"Waiting for a connection\", \"Upload failed\".",
    },
    action: {
      type: "enum",
      options: ["none", "cancel", "retry"],
      default: "none",
      description: "The row's one control: Cancel while it moves, Retry once it has failed.",
    },
    onCancel: {
      type: "event",
    },
    onRetry: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=\"progressbar\" <div> track (aria-valuenow, aria-busy) whose fill eases its width over duration.slow, or slides with the af-indeterminate keyframes; the upload row's Cancel / Retry is the kit's IconButton; inline styles over `t`",
      import: "import { ProgressBar } from \"@antfabric-ui/react\"",
      notes: [
        "While an upload is in flight, closing or reloading the tab asks first (beforeunload); the tab title gains nothing — the composer row is where progress lives.",
        "The indeterminate segment slides with a 1.4 s CSS animation and stops under prefers-reduced-motion.",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same as web: the fill moves by width, as the catalogue drew it",
      import: "import { ProgressBar } from \"@antfabric-ui/react\"",
      notes: [
        "The fill moves by translateX on a full-width bar, not by width and not by scaleX: width re-lays out every frame, and scaleX squashes the pill cap (at 10% the end would be visibly flatter than at 90%). The catalogue draws it with width.",
        "Uploads keep running when the window is hidden in the tray; the Dock icon (macOS) and the taskbar button (Windows) show the total with Tauri's setProgressBar, and clear it when done.",
        "StepBar is a different component (wizard steps: done, current, future).",
      ],
    },
    mobile: {
      status: "ready",
      base: "A View (accessibilityRole progressbar, accessibilityValue) with an Animated fill: the width eases on Animated.timing, the indeterminate segment loops on Animated.loop and parks mid-track under Reduce Motion; the kit's IconButton for Cancel / Retry",
      import: "import { ProgressBar } from \"@antfabric-ui/react-native\"",
      notes: [
        "6pt track on surface.muted. Today's API is value 0–1; the kit keeps accepting that and maps it.",
        "Uploads run in a background URLSession (iOS) / WorkManager job (Android) so locking the phone does not stop them.",
      ],
      gestures: [
        {
          gesture: "Tap Cancel",
          action: "Stops the upload at once — no confirm; a light haptic",
        },
      ],
    },
  },
  a11y: {
    role: "progressbar",
    label: "{label}, else the title, else \"Progress\"",
    notes: [
      "The bar's name is `label`; without one it is the row's `title` (aria-labelledby on the web), so a list of uploads reads as a list of files, and the default \"Progress\" only names a bar with no title. `detail` is the value's text (aria-valuetext, accessibilityValue.text): \"2.1 of 5.3 MB\".",
      "aria-valuenow follows the value. The bar does not announce itself while it moves: a screen reader reads the value when the bar is reached, and an app that wants \"done\" or \"failed\" spoken says it itself. Nobody wants \"41 percent, 42 percent…\".",
      "Indeterminate exposes no value and is aria-busy. The Cancel button's name includes the file: \"Cancel upload of Q4 roadmap.pdf\".",
      "The web fill moves by transform, not width, and the phone's Reduce Motion setting is followed live.",
    ],
  },
  examples: [
    {
      name: "Bar",
      props: {
        value: 40,
      },
      width: 280,
    },
    {
      name: "Project completion",
      props: {
        value: 64,
        label: "Checkout revamp, 64% complete",
      },
      platforms: ["web", "desktop"],
      width: 240,
    },
    {
      name: "Upload with Cancel",
      props: {
        title: "Q4 roadmap.pdf",
        detail: "2.1 of 5.3 MB",
        value: 40,
        action: "cancel",
      },
      width: 320,
    },
    {
      name: "Preparing (indeterminate)",
      props: {
        title: "Export of #release-train",
        detail: "Preparing…",
        indeterminate: true,
        label: "Preparing export of #release-train",
      },
      width: 320,
    },
    {
      name: "Done",
      props: {
        title: "standup-notes.md",
        detail: "Uploaded",
        value: 100,
        tone: "success",
        label: "Uploaded standup-notes.md",
      },
      width: 320,
    },
    {
      name: "Failed — Retry",
      props: {
        title: "weekly-sync.m4a",
        detail: "Upload failed",
        value: 72,
        tone: "danger",
        action: "retry",
        label: "Upload of weekly-sync.m4a failed",
      },
      width: 320,
    },
    {
      name: "Storage used",
      props: {
        value: 82,
        tone: "neutral",
        label: "82% of workspace storage used",
      },
      platforms: ["web", "desktop"],
      width: 240,
    },
  ],
  matrix: [
    {
      prop: "tone",
    },
    {
      prop: "indeterminate",
    },
  ],
  edgeCases: [
    {
      title: "Value out of range or missing",
      platforms: ["web", "desktop", "mobile"],
      handling: "Clamped to 0–100, so 130 draws full and −5 draws empty. A NaN or unknown total becomes indeterminate rather than a bar stuck at zero.",
      example: {
        name: "Clamped",
        props: {
          value: 130,
        },
        width: 240,
      },
    },
    {
      title: "Fast enough not to show",
      platforms: ["web", "desktop", "mobile"],
      handling: "An upload that finishes in under 300 ms never draws a bar — the attachment just appears. Once a bar is shown it stays at least 400 ms, then turns to Uploaded.",
    },
    {
      title: "Stalled",
      platforms: ["web", "desktop", "mobile"],
      handling: "No bytes for 8 s: the bar holds where it is (it never fakes motion) and the detail changes to \"Waiting for the network…\". Cancel stays available.",
      example: {
        name: "Stalled",
        props: {
          title: "design-crit-board.fig",
          detail: "Waiting for the network…",
          value: 58,
          action: "cancel",
        },
        width: 320,
      },
    },
    {
      title: "Offline mid-upload",
      platforms: ["desktop", "mobile"],
      handling: "Desktop pauses and resumes from the last acknowledged byte when the connection returns (resumable upload); the message waits in the outbox. The phone refuses new sends while offline, keeps an in-flight upload queued with \"Waiting for a connection\", and resumes on reconnect — neither counts as a failure.",
      example: {
        name: "Waiting for a connection",
        props: {
          title: "site-photos.zip",
          detail: "Waiting for a connection",
          value: 23,
          tone: "neutral",
          action: "cancel",
        },
        width: 320,
      },
    },
    {
      title: "Cancel",
      platforms: ["web", "desktop", "mobile"],
      handling: "Immediate, no confirm — the file is still on the person's device. The partial upload is discarded server-side, the attachment chip leaves the composer, and focus returns to the composer. A second press does nothing.",
    },
    {
      title: "Window hidden in the tray",
      platforms: ["desktop"],
      handling: "The upload continues. Progress shows on the Dock icon (macOS) or the taskbar button (Windows; Linux where the desktop supports it). An OS notification is raised only if the upload fails, since that message did not send.",
    },
    {
      title: "Tab in the background, or closed",
      platforms: ["web"],
      handling: "A background tab keeps uploading. Closing or reloading while an upload runs triggers the browser's leave-page prompt; if the person leaves anyway, the draft is restored with the file marked \"Not uploaded\" next time.",
    },
    {
      title: "App backgrounded or killed",
      platforms: ["mobile"],
      handling: "Backgrounded: a background upload session carries on and the message sends when it completes. Killed: the next launch shows the message with \"Upload interrupted\" and Retry — the file is still referenced from the device.",
    },
    {
      title: "Reduced motion",
      platforms: ["web", "desktop", "mobile"],
      handling: "Value changes jump instead of easing, and the indeterminate segment stands still in the middle of the track; the detail text (\"Preparing…\") carries the meaning.",
    },
    {
      title: "Right-to-left",
      platforms: ["web", "desktop", "mobile"],
      handling: "The fill grows from the right edge; the Cancel button sits at the left end of the row.",
    },
  ],
  related: ["step-bar", "skeleton", "toast", "attachment"],
  flows: [
    {
      id: "upload-and-cancel",
      title: "A file uploads, and Cancel stops it",
      description: "The row exists before a byte moves and follows the bytes the server has acknowledged. Cancel fires onCancel; the caller stops the transfer and the row leaves.",
      platforms: ["web", "desktop"],
      width: 320,
      steps: [
        {
          kind: "data",
          title: "Attaching a file starts a resumable upload with a row",
          detail: "The row is in the store before a byte moves, with a preview made from the bytes already in memory, so the person sees what they're sending while it goes up.",
          code: "const row: UploadRow = { id, draftKey: input.draftKey, filename: input.file.name, sizeBytes: input.file.size, sentBytes: 0, state: 'uploading', message: null }",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The composer's upload tracks the bytes it has sent",
          code: "xhr.upload.onprogress = (e) => setUpload(id, { sentBytes: e.loaded })",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Bytes go up",
          detail: "Each acknowledged part reports how far the upload has got.",
        },
        {
          kind: "state",
          title: "Each progress event patches the row",
          detail: "Guarded on the row still being there, so a progress event that lands after Cancel can't bring it back.",
          code: "onChange: (snapshot) => set((s) => … ({ uploads: { ...s.uploads, [id]: { ...s.uploads[id]!, ...snapshot } } }))",
          platforms: ["desktop"],
        },
        {
          kind: "motion",
          title: "The fill moves forward",
          detail: "It never moves on its own and never fakes progress: percentOf holds at 99 until the server has every byte. Today's desktop row eases the width over 120ms linear; the spec uses the slow motion token.",
        },
        {
          kind: "trigger",
          title: "Cancel is pressed",
          detail: "The × beside the size, named \"Cancel upload of Q4 roadmap.pdf\". No confirm: the file is still on the person's device.",
        },
        {
          kind: "event",
          title: "onCancel fires",
          code: "onCancel?.()",
        },
        {
          kind: "state",
          title: "cancelUpload stops the transfer and drops the row",
          code: "handleFor(uploadId)?.cancel(); forgetHandle(uploadId)  // delete rest[uploadId]",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "The request is aborted and the row removed",
          code: "controller.abort(); setUploads((u) => omit(u, id))",
          platforms: ["web"],
        },
        {
          kind: "result",
          title: "The row leaves; the other upload carries on",
          detail: "The attachment leaves the composer and the message keeps its text. A second press does nothing.",
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
              gap: "$space.md",
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "progress-bar",
                props: {
                  title: "Q4 roadmap.pdf",
                  detail: "0.5 of 5.3 MB",
                  value: 9,
                  action: "cancel",
                  label: "Uploading Q4 roadmap.pdf",
                },
              },
              {
                el: "component",
                use: "progress-bar",
                props: {
                  title: "design-crit-board.fig",
                  detail: "3.0 of 12.4 MB",
                  value: 24,
                  action: "cancel",
                  label: "Uploading design-crit-board.fig",
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
              gap: "$space.md",
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "progress-bar",
                props: {
                  title: "Q4 roadmap.pdf",
                  detail: "0.5 of 5.3 MB",
                  value: 9,
                  action: "cancel",
                  label: "Uploading Q4 roadmap.pdf",
                },
              },
              {
                el: "component",
                use: "progress-bar",
                props: {
                  title: "design-crit-board.fig",
                  detail: "3.0 of 12.4 MB",
                  value: 24,
                  action: "cancel",
                  label: "Uploading design-crit-board.fig",
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
              gap: "$space.md",
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "progress-bar",
                props: {
                  title: "Q4 roadmap.pdf",
                  detail: "2.1 of 5.3 MB",
                  value: 40,
                  action: "cancel",
                  label: "Uploading Q4 roadmap.pdf",
                },
              },
              {
                el: "component",
                use: "progress-bar",
                props: {
                  title: "design-crit-board.fig",
                  detail: "4.6 of 12.4 MB",
                  value: 37,
                  action: "cancel",
                  label: "Uploading design-crit-board.fig",
                },
              },
            ],
          },
        },
        {
          step: 5,
          press: 0,
          hold: 1000,
          scene: {
            el: "view",
            style: {
              gap: "$space.md",
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "progress-bar",
                props: {
                  title: "Q4 roadmap.pdf",
                  detail: "2.8 of 5.3 MB",
                  value: 52,
                  action: "cancel",
                  label: "Uploading Q4 roadmap.pdf",
                },
              },
              {
                el: "component",
                use: "progress-bar",
                props: {
                  title: "design-crit-board.fig",
                  detail: "5.1 of 12.4 MB",
                  value: 41,
                  action: "cancel",
                  label: "Uploading design-crit-board.fig",
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              gap: "$space.md",
              width: 320,
            },
            children: [
              {
                el: "component",
                use: "progress-bar",
                props: {
                  title: "design-crit-board.fig",
                  detail: "5.6 of 12.4 MB",
                  value: 45,
                  action: "cancel",
                  label: "Uploading design-crit-board.fig",
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "recording-upload",
      title: "A recording uploads, and Retry picks it up again",
      description: "A finished recording goes up from the capture queue, and the bar follows it. When the connection drops, Retry fires onRetry and the queue starts it again.",
      platforms: ["mobile"],
      width: 343,
      steps: [
        {
          kind: "data",
          title: "A finished recording waits in the capture queue",
          detail: "It is saved on the phone first. Its card shows the stage and, while it uploads, this bar.",
          code: "{item.state === 'uploading' && <ProgressBar value={item.progress ?? 0} />}",
        },
        {
          kind: "trigger",
          title: "drain picks it up",
          code: "patch(next.id, { state: 'uploading', progress: 0, error: undefined });",
        },
        {
          kind: "state",
          title: "onProgress writes the fraction",
          detail: "In memory on every tick, and to AsyncStorage at most every 5%, so a long upload doesn't hammer storage. The kit takes 0–1; this spec's value is 0–100.",
          code: "patchProgress(id, fraction)",
        },
        {
          kind: "motion",
          title: "The fill grows",
          detail: "Today's phone sets the width directly; the spec eases it, and jumps instead under Reduce Motion.",
        },
        {
          kind: "trigger",
          title: "The connection drops at 72%",
          lane: "system",
          detail: "The card turns to Retrying in amber. Today it hides the bar and shows a Retry now button under the card; this spec keeps the bar where it stopped, in red, with Retry.",
        },
        {
          kind: "event",
          title: "onRetry fires",
          code: "onRetry?.()",
        },
        {
          kind: "state",
          title: "retry re-queues it and drains",
          detail: "A tap is a fresh start: it refunds the automatic retry budget and clears a terminal failure, because the person may have just signed in again.",
          code: "patch(id, { state: 'queued', error: undefined, progress: 0, terminal: false }); get().drain();",
        },
        {
          kind: "result",
          title: "It goes up, and the server takes it from there",
          detail: "At 100% the card says Transcribing: nothing depends on the phone any more, so leaving the app is safe. Today the bar simply goes; this spec shows it as Uploaded for a moment first.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            title: "weekly-sync.m4a",
            detail: "Waiting to upload",
            value: 0,
            label: "Uploading weekly-sync.m4a",
          },
        },
        {
          step: 2,
          hold: 1500,
          props: {
            title: "weekly-sync.m4a",
            detail: "6.9 of 18.2 MB",
            value: 38,
            label: "Uploading weekly-sync.m4a",
          },
        },
        {
          step: 4,
          hold: 1500,
          props: {
            title: "weekly-sync.m4a",
            detail: "Upload failed",
            value: 72,
            tone: "danger",
            action: "retry",
            label: "Upload of weekly-sync.m4a failed",
          },
        },
        {
          step: 5,
          press: 0,
          hold: 1000,
          props: {
            title: "weekly-sync.m4a",
            detail: "Upload failed",
            value: 72,
            tone: "danger",
            action: "retry",
            label: "Upload of weekly-sync.m4a failed",
          },
        },
        {
          step: 6,
          hold: 1400,
          props: {
            title: "weekly-sync.m4a",
            detail: "0.7 of 18.2 MB",
            value: 4,
            label: "Uploading weekly-sync.m4a",
          },
        },
        {
          step: 7,
          hold: 1800,
          props: {
            title: "weekly-sync.m4a",
            detail: "Uploaded",
            value: 100,
            tone: "success",
            label: "Uploaded weekly-sync.m4a",
          },
        },
      ],
    },
  ],
};

export default docs;
