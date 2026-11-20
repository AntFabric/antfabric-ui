import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "attachment-card",
  name: "Attachment card",
  category: "messaging",
  level: "molecule",
  status: "beta",
  description: "What a message carries besides words: a file with its type and size, an image thumbnail, a link preview, or a voice note. Uploading, paused and failed states live on the card itself, and compact is the staged chip inside the composer.",
  props: {
    kind: {
      type: "enum",
      options: ["file", "image", "link", "voice"],
      default: "file",
    },
    name: {
      type: "string",
      default: "",
      sample: "Q4-release-checklist.pdf",
      description: "File name as uploaded. Also the accessible name's subject.",
    },
    fileType: {
      type: "enum",
      options: ["pdf", "doc", "sheet", "deck", "image", "video", "audio", "archive", "code", "other"],
      default: "other",
      sample: "pdf",
      description: "The family, from content type then extension. Picks the badge colours (desktop/web letters) and the glyph (mobile).",
    },
    badge: {
      type: "string",
      default: "",
      sample: "PDF",
      description: "Up to five letters on the desktop/web badge: PDF, DOCX, XLSX, KEY, ZIP, TS.",
    },
    typeLabel: {
      type: "string",
      default: "",
      sample: "PDF document",
      description: "Human type name for the meta line.",
    },
    size: {
      type: "string",
      default: "",
      sample: "2.4 MB",
      description: "Formatted size. Empty while the metadata is still loading.",
    },
    status: {
      type: "enum",
      options: ["ready", "uploading", "paused", "failed"],
      default: "ready",
      description: "uploading shows progress; paused is a stalled upload (offline or backgrounded) that resumes on its own; failed offers Retry.",
    },
    progress: {
      type: "number",
      default: 0,
      sample: 64,
      description: "Upload percent, 0–100.",
    },
    error: {
      type: "string",
      default: "",
      description: "Shown when status is failed.",
    },
    src: {
      type: "string",
      default: "",
      sample: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 400'><rect width='640' height='400' fill='%23f3efe9'/><rect x='32' y='32' width='576' height='44' rx='10' fill='%23ffffff'/><rect x='48' y='48' width='120' height='12' rx='6' fill='%23fe4632'/><rect x='32' y='96' width='272' height='272' rx='14' fill='%23ffffff'/><rect x='336' y='96' width='272' height='128' rx='14' fill='%239fa6ff'/><rect x='336' y='240' width='272' height='128' rx='14' fill='%23ffffff'/><rect x='56' y='124' width='180' height='14' rx='7' fill='%230e1828'/><rect x='56' y='150' width='220' height='10' rx='5' fill='%23c9c4bd'/><rect x='56' y='170' width='200' height='10' rx='5' fill='%23c9c4bd'/></svg>",
      description: "Image thumbnail, or the link preview's image. A server-rendered thumbnail, never the full file.",
    },
    title: {
      type: "string",
      default: "",
      sample: "Release train: Q4 cut-over plan",
      description: "Link preview title (og:title).",
    },
    domain: {
      type: "string",
      default: "",
      sample: "github.com",
      description: "Link preview site, shown above the title so a reader sees where the link goes before the page's own claim.",
    },
    description: {
      type: "string",
      default: "",
      sample: "Freeze on 12 November, staging soak for 48 hours, then the mobile and desktop builds ship together.",
      description: "Link preview description (og:description), two lines at most.",
    },
    url: {
      type: "string",
      default: "",
      sample: "https://github.com/antfabric/platform/pull/4127",
    },
    duration: {
      type: "string",
      default: "",
      sample: "0:42",
      description: "Voice note length.",
    },
    waveform: {
      type: "array",
      default: [],
      sample: [
        8,
        14,
        20,
        12,
        24,
        18,
        10,
        16,
        26,
        20,
        12,
        8,
        18,
        22,
        14,
        10,
        20,
        24,
        16,
        12,
        8,
        14,
        18,
        10,
        6,
        12,
        16,
        8,
      ],
      description: "Bar heights in px (4–28), sampled to fit the width. Drawn, never announced.",
    },
    played: {
      type: "number",
      default: 0,
      description: "How many waveform bars have played; those are coral.",
    },
    playing: {
      type: "boolean",
      default: false,
    },
    compact: {
      type: "boolean",
      default: false,
      description: "The staged chip in the composer tray: thumbnail or badge, name, size or progress, and Remove.",
    },
    removable: {
      type: "boolean",
      default: false,
      description: "Link preview only: the sender can remove the preview and keep the link.",
    },
    onOpen: {
      type: "event",
      description: "Desktop/web: preview (lightbox or file viewer). Mobile: MediaViewer for images, video and previewable files; Share (iOS) or Save to device (Android) for the rest.",
    },
    onDownload: {
      type: "event",
      platforms: ["web", "desktop"],
    },
    onStatusChange: {
      type: "event",
      args: "status: AttachmentCardStatus",
      changes: "status",
      description: "Called with `status` as Retry leaves it (uploading). Given `status` too, the card is controlled; otherwise Retry turns it back to uploading itself.",
    },
    onRetry: {
      type: "event",
      description: "Retry was pressed on a failed upload: the app starts it again.",
    },
    onCancel: {
      type: "event",
      description: "Cancel an upload in progress, remove a staged file, or remove a link's preview (Remove preview, web and desktop).",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "Inline styles over `t`: the open target is a <button> (an <a href target=_blank> for a link), hover and focus from useInteraction; Download / Cancel / Retry are the kit's IconButton and Button. The lightbox is the app's, from onOpen.",
      import: "import { AttachmentCard } from \"@antfabric-ui/react\"",
      notes: [
        "Download is a real link to a short-lived signed URL with Content-Disposition: attachment, so the browser's own download UI and ⌘-click both work.",
        "Images lazy-load with explicit width and height so the timeline never reflows when a thumbnail arrives.",
        "Upload progress belongs to the tab: closing the tab mid-upload asks \"Leave site? Changes you made may not be saved.\" via beforeunload.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Opens the preview",
        },
        {
          keys: "Tab",
          action: "Moves from the card to Download / Cancel / Retry",
        },
        {
          keys: "Escape",
          action: "Closes the lightbox and returns focus to the card",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same file as web (one component, desktop density tokens): the 40px letter badge, the middle-truncated name and the kit's IconButton / Button; the preview is the app's, from onOpen.",
      import: "import { AttachmentCard } from \"@antfabric-ui/react\"",
      notes: [
        "The FileRow shape: 40px letter badge in the family colour, name in 13 SemiBold, \"PDF document · 2.4 MB\", a 26px Download. 320 wide, 100% on narrow panes.",
        "Downloads go to the OS Downloads folder through Tauri's dialog/fs plugins and announce themselves with a native notification when the window is not focused.",
        "Files already opened are kept in the app data cache, so they reopen offline; uncached files show \"You're offline. This file will download when you're back.\"",
        "In the catalogue, Retry on a failed upload sets `status` to uploading (the error line gives way to the progress track), and the voice note's play button toggles `playing`.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Opens the preview",
        },
        {
          keys: "Mod+S",
          action: "In the preview: saves the file (Download)",
        },
        {
          keys: "Escape",
          action: "Closes the preview",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable + View, StyleSheet over useTheme() tokens; React Native <Image> for thumbnails, Linking for a link, the name truncated in the middle with ellipsizeMode; MediaViewer is the app's, from onOpen.",
      import: "import { AttachmentCard } from \"@antfabric-ui/react-native\"",
      notes: [
        "Files: a 40pt recessed squircle with the family glyph tinted (PDF red, sheet green), \"2.4 MB · PDF\" faint.",
        "Images: a 220 × 165 tile. Tap opens MediaViewer with swipe between this message's images and videos, pinch to zoom, swipe down to close.",
        "A file the phone can preview opens in MediaViewer; anything else is Share on iOS and Save to device on Android, and the label says which.",
        "The composer tray chip shows the picture during the upload, not after, so you can still change your mind about the right file.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Opens MediaViewer (images, video, previewable files) or Share / Save to device",
        },
        {
          gesture: "Long press",
          action: "Message actions sheet (with Save image for photos)",
        },
        {
          gesture: "Swipe down in MediaViewer",
          action: "Closes it back to the message",
        },
      ],
    },
  },
  a11y: {
    notes: [
      "File: \"Preview Q4-release-checklist.pdf\" (desktop/web) or \"Q4-release-checklist.pdf, 2.4 MB · PDF. Open\" (mobile): the action is part of the name.",
      "While it is not ready the file card's name carries the state, since a button's children are not read: \"Q4-release-checklist.pdf, uploading, 64%\", \"…upload paused at 64%\", \"…. Upload failed. Check your connection and try again.\" A progressbar sibling (web) or the stop's value (phone) exposes the percent.",
      "A stall or a failure is announced when it happens (assertive for a failure); the percent is not read on every change.",
      "Image: \"Photo, <name>, <size>. Open\". Thumbnails are decorative because the label already names them. A waveform is hidden and the play button carries the duration.",
    ],
  },
  examples: [
    {
      name: "File",
      props: {},
    },
    {
      name: "Spreadsheet",
      props: {
        name: "Sprint 42 capacity.xlsx",
        fileType: "sheet",
        badge: "XLSX",
        typeLabel: "Excel spreadsheet",
        size: "86 KB",
      },
    },
    {
      name: "Uploading",
      props: {
        name: "design-crit-recording.mp4",
        fileType: "video",
        badge: "MP4",
        typeLabel: "Video",
        size: "184 MB",
        status: "uploading",
        progress: 64,
      },
    },
    {
      name: "Upload failed",
      props: {
        name: "brand-refresh-v3.key",
        fileType: "deck",
        badge: "KEY",
        typeLabel: "Keynote",
        size: "48 MB",
        status: "failed",
      },
    },
    {
      name: "Image",
      props: {
        kind: "image",
        name: "onboarding-flow.png",
        size: "1.1 MB",
      },
    },
    {
      name: "Image uploading",
      props: {
        kind: "image",
        name: "staging-dashboard.png",
        size: "2.3 MB",
        status: "uploading",
        progress: 72,
      },
    },
    {
      name: "Image upload failed",
      props: {
        kind: "image",
        name: "crash-report-screen.png",
        size: "3.8 MB",
        status: "failed",
      },
    },
    {
      name: "Link preview",
      props: {
        kind: "link",
        removable: true,
      },
    },
    {
      name: "Link without an image",
      props: {
        kind: "link",
        src: "",
        domain: "linear.app",
        title: "PLAT-2291 Composer drops the draft when the socket reconnects",
        description: "",
      },
    },
    {
      name: "Voice note",
      props: {
        kind: "voice",
      },
    },
    {
      name: "Voice note playing",
      props: {
        kind: "voice",
        playing: true,
        played: 11,
        duration: "0:17",
      },
    },
    {
      name: "Staged in the composer",
      props: {
        compact: true,
        name: "release-notes-draft.docx",
        fileType: "doc",
        badge: "DOCX",
        size: "220 KB",
        status: "uploading",
        progress: 38,
      },
    },
    {
      name: "Staged image",
      props: {
        compact: true,
        kind: "image",
        name: "crash-screenshot.png",
        size: "640 KB",
      },
    },
  ],
  matrix: [
    {
      prop: "kind",
    },
    {
      prop: "status",
    },
  ],
  edgeCases: [
    {
      title: "A very long file name",
      platforms: ["web", "desktop", "mobile"],
      handling: "One line. The kit truncates in the middle so the extension survives (\"platform-eng-incident-…-final-v12.pdf\"). The full name is the title tooltip and part of the accessible name.",
      example: {
        name: "Long name",
        props: {
          name: "platform-eng-incident-postmortem-2026-10-27-database-failover-final-v12.pdf",
        },
        width: 320,
      },
    },
    {
      title: "Offline mid-upload",
      platforms: ["web", "desktop", "mobile"],
      handling: "The upload pauses rather than fails: the bar turns amber, the line says it will resume on its own, and it does when the socket returns (resumable chunks). Send stays disabled until it finishes, and the draft is kept.",
      example: {
        name: "Paused",
        props: {
          status: "paused",
          progress: 41,
          name: "q4-roadmap.pdf",
          size: "12 MB",
        },
      },
    },
    {
      title: "Slow upload",
      platforms: ["web", "desktop", "mobile"],
      handling: "The percentage keeps moving. After 8 s without progress the line reads \"Still uploading… 64% of 184 MB\" and Cancel stays available. A large file goes up on pick, not on send, so Enter never feels broken.",
    },
    {
      title: "Retry after a failure",
      platforms: ["web", "desktop", "mobile"],
      handling: "Retry resumes from the last confirmed chunk and turns the card back to uploading in the same place; it cannot create a second copy because the upload id is reused. Pressing Retry twice is ignored while the first attempt is starting.",
    },
    {
      title: "File refused before it starts",
      platforms: ["web", "desktop", "mobile"],
      handling: "Over the workspace's size limit, or a blocked type: the file is refused at pick time with a toast that names the limit, and no card is created. Nothing is half-uploaded.",
    },
    {
      title: "Image will not load",
      platforms: ["web", "desktop", "mobile"],
      handling: "A thumbnail that 404s or fails to decode falls back to the file card with the image badge, so the file can still be downloaded. A deleted or no-longer-shared file shows \"This file is no longer available\" with no actions.",
    },
    {
      title: "Link preview from an untrusted page",
      platforms: ["web", "desktop", "mobile"],
      handling: "The domain is printed first and is the real destination (after redirects), not the page's claimed site. Previews are fetched server-side, images are proxied, and nothing autoplays. If the fetch fails there is no card, only the link in the text.",
    },
    {
      title: "Voice note while the phone is locked",
      platforms: ["mobile"],
      handling: "Playback continues with the screen locked and shows on the lock screen's now-playing controls; it pauses when headphones are unplugged. Recording needs the microphone permission — see composer.",
    },
    {
      title: "Dark mode",
      platforms: ["web", "desktop", "mobile"],
      handling: "Badge colours switch to their dark soft pairs; a pale screenshot on a dark card keeps its hairline edge so it does not read as a hole in the surface.",
    },
  ],
  related: ["message", "composer", "media-viewer"],
  flows: [
    {
      id: "upload-before-send",
      title: "Attach a file: it uploads before you send",
      description: "A file starts uploading the moment it is picked, so Send is usually instant by the time the words are typed. The chip in the composer shows how far it has got, a dropped connection pauses it rather than failing it, and Retry carries on from where it stopped.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "trigger",
          title: "A file is picked",
          detail: "Attach files, a paste or a drop on web and desktop; on the phone, + opens Add to your message (Upload File, Upload Image, Take Photo). A file over the size limit, or of a blocked type, is refused at once and no chip is made.",
        },
        {
          kind: "effect",
          title: "Each file starts uploading at once",
          detail: "attachFiles starts a resumable upload per file and keeps a row for it in the store. chUploading counts the rows still going, and that is what holds Send.",
          code: "backend.channels.uploadAssetResumable(input.file, { onChange, onDone }, { type: 'channel', id: channelId }, 'chat_attachment')",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "Each file starts uploading at once",
          detail: "useAttachmentDraft adds a tray item per file and uploads it straight away. Send carries only the asset ids that landed.",
          code: "void uploadChannelAttachment({ uri, filename, contentType, channelId, onProgress: (fraction) => patch(item.key, { progress: fraction }) })",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "Each file starts uploading at once",
          detail: "A resumable upload per file, its progress held beside the draft. Closing the tab mid-upload asks first, through beforeunload.",
          code: "const upload = useMutation({ mutationFn: (file) => uploadResumable(file, { onProgress }) })",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "The chip counts up, and Send waits",
          detail: "\"38% of 220 KB\" over a coral bar. It never says 100% until the server has the whole file. Send stays dim, and the line under the box says Waiting for the upload to finish.",
          code: "percentOf(row)  // Math.min(99, Math.floor((row.sentBytes / row.sizeBytes) * 100)) until done",
        },
        {
          kind: "state",
          title: "The connection drops: paused, not failed",
          detail: "A transport failure stops at the last confirmed chunk and says \"Internet connection lost. Upload paused.\" The bar turns amber, and the upload carries on by itself when the connection comes back.",
          code: "this.emit('paused', OFFLINE_MESSAGE, this.confirmedBytes)",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "A refusal fails it",
          detail: "The chip turns crimson, Didn't upload, and the reason is said once in a sentence. The other files on the message stay sendable. Today's phone treats every failure this way.",
          code: "this.emit('failed', refusalSentence(thrown, this.file.name), this.confirmedBytes)  ·  patch(item.key, { status: 'failed' })",
        },
        {
          kind: "trigger",
          title: "Retry is pressed",
          detail: "Today's desktop row calls it Resume. A second press while it is starting is ignored.",
        },
        {
          kind: "event",
          title: "onRetry() fires",
          detail: "The upload resumes from the last chunk the server confirmed, under the same upload id, so it can't make a second copy. Today's phone has no retry: remove the file and pick it again.",
          code: "onRetry?.()  // a.resumeUpload(uploadId) → handleFor(uploadId)?.resume()",
        },
        {
          kind: "state",
          title: "Uploading again, from where it stopped",
          detail: "The chip goes back to its bar in the same place; nothing is uploaded twice.",
        },
        {
          kind: "result",
          title: "Ready: the size shows, and Send lights up",
          detail: "The asset id is staged on the draft, and the message carries it when it is sent. A draft can be files and no words.",
          code: "onDone: (asset) => input.stage(asset)  // chFiles[key] = [...files, { asset_id: asset.asset_id }]",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          scene: {
            el: "view",
            style: {
              width: 640,
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Release notes for 4.12 — comments by Thursday, please.",
                  focused: true,
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
              width: 640,
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Release notes for 4.12 — comments by Thursday, please.",
                  focused: true,
                  uploading: true,
                  attachments: [
                    {
                      kind: "file",
                      name: "release-notes-4.12.docx",
                      fileType: "doc",
                      badge: "DOCX",
                      size: "220 KB",
                      status: "uploading",
                      progress: 38,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 5,
          hold: 1600,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 640,
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Release notes for 4.12 — comments by Thursday, please.",
                  focused: true,
                  uploading: true,
                  attachments: [
                    {
                      kind: "file",
                      name: "release-notes-4.12.docx",
                      fileType: "doc",
                      badge: "DOCX",
                      size: "220 KB",
                      status: "paused",
                      progress: 41,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 6,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              width: 640,
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Release notes for 4.12 — comments by Thursday, please.",
                  focused: true,
                  attachments: [
                    {
                      kind: "file",
                      name: "release-notes-4.12.docx",
                      fileType: "doc",
                      badge: "DOCX",
                      size: "220 KB",
                      status: "failed",
                      progress: 41,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: "Retry release-notes-4.12.docx",
          hold: 900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 640,
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Release notes for 4.12 — comments by Thursday, please.",
                  focused: true,
                  attachments: [
                    {
                      kind: "file",
                      name: "release-notes-4.12.docx",
                      fileType: "doc",
                      badge: "DOCX",
                      size: "220 KB",
                      status: "failed",
                      progress: 41,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 7,
          press: "Retry release-notes-4.12.docx",
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 640,
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Release notes for 4.12 — comments by Thursday, please.",
                  focused: true,
                  attachments: [
                    {
                      kind: "file",
                      name: "release-notes-4.12.docx",
                      fileType: "doc",
                      badge: "DOCX",
                      size: "220 KB",
                      status: "failed",
                      progress: 41,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 9,
          hold: 1400,
          scene: {
            el: "view",
            style: {
              width: 640,
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Release notes for 4.12 — comments by Thursday, please.",
                  focused: true,
                  uploading: true,
                  attachments: [
                    {
                      kind: "file",
                      name: "release-notes-4.12.docx",
                      fileType: "doc",
                      badge: "DOCX",
                      size: "220 KB",
                      status: "uploading",
                      progress: 72,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 10,
          hold: 1800,
          scene: {
            el: "view",
            style: {
              width: 640,
            },
            children: [
              {
                el: "component",
                use: "composer",
                props: {
                  value: "Release notes for 4.12 — comments by Thursday, please.",
                  focused: true,
                  attachments: [
                    {
                      kind: "file",
                      name: "release-notes-4.12.docx",
                      fileType: "doc",
                      badge: "DOCX",
                      size: "220 KB",
                      status: "ready",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "download-a-file",
      title: "Download a file from a message",
      description: "Download saves the file without opening it, and a toast says where it went. Pressing the card itself opens the preview instead.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "The card reads the asset's details",
          detail: "Name, type and size come from the asset record, read once per asset and kept in the store, so a channel full of files doesn't ask twice.",
          code: "backend.channels.asset(assetId).then((asset) => set((s) => ({ assets: { ...s.assets, [assetId]: asset } })))",
        },
        {
          kind: "trigger",
          title: "Download is pressed",
          detail: "Or Mod+S in the preview.",
        },
        {
          kind: "event",
          title: "onDownload() fires",
          code: "onDownload?.()  // const download = (): void => a.downloadAttachment(assetId)",
        },
        {
          kind: "effect",
          title: "The file is fetched and saved",
          detail: "The desktop writes it to Downloads through the OS. The web links to a short-lived signed URL with Content-Disposition: attachment, so the browser's own download bar shows it.",
          code: "backend.channels.assetBlob(assetId).then((blob) => deliverDownload(blob, name))",
        },
        {
          kind: "motion",
          title: "A toast rises at the bottom",
          enter: "rise",
        },
        {
          kind: "result",
          title: "Saved “Q4-release-checklist.pdf” to Downloads",
          detail: "If it can't be fetched, the toast says \"That file could not be downloaded.\", or the server's own reason when there is one.",
          code: "showToast(`Saved “${name}” to Downloads`)",
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
              width: 460,
              minHeight: 220,
              padding: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "attachment-card",
                props: {},
              },
            ],
          },
        },
        {
          step: 1,
          press: "Download Q4-release-checklist.pdf",
          hold: 900,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 460,
              minHeight: 220,
              padding: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "attachment-card",
                props: {},
              },
            ],
          },
        },
        {
          step: 4,
          hold: 1900,
          scene: {
            el: "view",
            style: {
              position: "relative",
              width: 460,
              minHeight: 220,
              padding: "$space.lg",
            },
            children: [
              {
                el: "component",
                use: "attachment-card",
                props: {},
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
                  message: "Saved “Q4-release-checklist.pdf” to Downloads",
                  tone: "success",
                  dismissible: false,
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
