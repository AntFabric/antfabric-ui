import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "avatar",
  name: "Avatar",
  category: "display",
  level: "atom",
  status: "stable",
  description: "A person or an agent, as a photo or initials, with an optional presence dot. The fallback colour is chosen from the name so the same person is the same colour on every device.",
  props: {
    name: {
      type: "string",
      sample: "Priya Raman",
      required: true,
    },
    src: {
      type: "string",
      default: "",
      description: "Photo URL. A broken or slow image falls back to initials — never an empty circle.",
    },
    size: {
      type: "enum",
      options: ["xs", "sm", "md", "lg", "xl"],
      default: "md",
    },
    shape: {
      type: "enum",
      options: ["circle", "square"],
      default: "circle",
      description: "square is for channels, projects and bots; people are circles.",
    },
    identity: {
      type: "enum",
      options: ["ink", "indigo", "green", "ochre", "red", "agent"],
      default: "indigo",
    },
    presence: {
      type: "enum",
      options: ["none", "active", "away", "dnd", "offline"],
      default: "none",
    },
    agent: {
      type: "boolean",
      default: false,
      description: "Marks an AI agent: a sparkle badge, so a person never mistakes an agent's message for a colleague's.",
    },
    decorative: {
      type: "boolean",
      default: false,
      description: "Beside the person's name drawn as text (a message, a list row, a hover card): the face is hidden from assistive tech, so the name is not read twice.",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<span role=\"img\"> named by the person (and presence, in words), inline styles over `t`; initials always drawn, a lazy <img> fading in over them and dropped on error",
      import: "import { Avatar } from \"@antfabric-ui/react\"",
      notes: [
        "Images are lazy-loaded with an explicit width and height so the row never reflows when the photo arrives.",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <span role=\"img\"> as web, at desktop density; initials under a lazy <img> that fades in and is dropped on error",
      import: "import { Avatar } from \"@antfabric-ui/react\"",
      notes: [
        "Photos are cached in the Tauri app data folder so the sidebar draws offline.",
        "Hovering an avatar opens the person's hover card after 380 ms (existing desktop timing).",
      ],
    },
    mobile: {
      status: "ready",
      base: "View (accessibilityRole image), StyleSheet over useTheme(); initials always drawn, React Native <Image> fading in over them with <Enter motion=\"fade\"> and dropped on error",
      import: "import { Avatar } from \"@antfabric-ui/react-native\"",
      notes: [
        "The kit draws React Native's <Image>; the app's expo-image memory+disk cache stays in the app. The Notionist face from the current app is a src, not a separate component.",
        "Presence dot grows to 10pt minimum so it survives Dynamic Type and small sizes.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Opens the person's profile sheet",
        },
      ],
    },
  },
  a11y: {
    role: "img",
    label: "{name}, {presence}",
    notes: [
      "Initials are hidden from screen readers — the name is the label.",
      "`decorative` removes the role and the name and hides the face from assistive tech (aria-hidden on web; hidden from VoiceOver and TalkBack on the phone): use it beside a visible name.",
      "Presence is announced in words, never by colour alone; dnd and away also differ in shape on the presence picker.",
    ],
  },
  examples: [
    {
      name: "Initials",
      props: {
        name: "Priya Raman",
      },
    },
    {
      name: "Active",
      props: {
        name: "Marcus Chen",
        identity: "green",
        presence: "active",
      },
    },
    {
      name: "Do not disturb",
      props: {
        name: "Aisha Bello",
        identity: "ochre",
        presence: "dnd",
        size: "lg",
      },
    },
    {
      name: "Agent",
      props: {
        name: "Fabric",
        identity: "agent",
        agent: true,
        size: "lg",
      },
    },
    {
      name: "Channel / project",
      props: {
        name: "Platform Eng",
        shape: "square",
        identity: "ink",
      },
    },
  ],
  matrix: [
    {
      prop: "size",
    },
    {
      prop: "presence",
    },
  ],
  edgeCases: [
    {
      title: "Single-word or emoji-only names",
      platforms: ["web", "desktop", "mobile"],
      handling: "Initials take the first letter of up to two words; one word gives one letter. A name with no letters (an emoji, a phone number) shows the person glyph instead of an empty disc.",
      example: {
        name: "One word",
        props: {
          name: "Ravi",
          identity: "red",
        },
      },
    },
    {
      title: "Photo fails or loads slowly",
      platforms: ["web", "desktop", "mobile"],
      handling: "Initials render first and the photo fades in over them when it decodes. A 404 keeps the initials and is not retried in the same session.",
    },
    {
      title: "Deactivated or external user",
      platforms: ["web", "desktop", "mobile"],
      handling: "A deactivated account is drawn in the neutral ink colour with no presence; an external (guest) user gets a square-corner badge in the hover card, not on the avatar.",
      example: {
        name: "Deactivated",
        props: {
          name: "Former Member",
          identity: "ink",
        },
      },
    },
    {
      title: "Presence while offline",
      platforms: ["desktop", "mobile"],
      handling: "When this device is offline, other people's presence is unknown, so dots are hidden rather than shown stale.",
    },
  ],
  related: ["avatar-stack"],
  flows: [
    {
      id: "photo-or-initials",
      title: "A face loads: initials at once, the photo when it arrives",
      description: "An avatar never waits for its photo. It draws the person's initials straight away, lays the photo over them once the bytes arrive, and keeps the initials if the photo never comes. Here Priya's photo loads and Marcus's fails.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "The row asks the directory for the photo",
          detail: "useAvatarSrc looks the person up in the workspace store's directory; your own photo falls back to your profile. No url is the normal case (nobody uploaded one, the directory hasn't loaded, the bytes are in flight), and it draws initials.",
          code: "const stored = participantId ? (s.directory[participantId]?.avatar_url ?? (isSelf ? (s.selfProfile?.avatar_url ?? null) : null)) : null",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The face lookup reads two cached queries",
          detail: "usePersonFaces builds one lookup from the profile and directory reads the app already makes, both filled from the offline snapshot. Avatar asks it for a photo when the screen passes none.",
          code: "const looked = imageUri === undefined && face ? (faces?.photoFor?.(userId, name) ?? null) : null",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The route reads the directory from the query cache",
          detail: "The workspace loader fetches the directory once. Every avatar reads its person from the same TanStack Query cache, so the sidebar and the message list never ask twice.",
          code: "const person = useQuery(directoryQuery).data?.[userId]",
          platforms: ["web"],
        },
        {
          kind: "effect",
          title: "One fetch per photo, shared by every row",
          detail: "ensureAvatar loads the bytes with the session's token, never a raw link. The copy saved on the device paints first, and ten rows asking at once make one request.",
          code: "await loadAvatar(url, (assetId) => backend.channels.assetBlob(assetId), { store: defaultAvatarStore(), onRefreshed })",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "expo-image loads the photo over the fallback",
          detail: "The fallback is always drawn and the photo is laid on top of it, so a slow, stalled or undecodable photo still leaves a face, never an empty circle. Today's fallback for a person is their generated Notionists face; initials are kept for what isn't a person.",
          code: "<Image key={photo} source={{ uri: photo, headers }} style={StyleSheet.absoluteFill} contentFit=\"cover\" />",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "The browser loads the photo lazily",
          detail: "An <img loading=\"lazy\"> with an explicit width and height, over the initials, so the row never reflows when the photo arrives. The request carries the session cookie.",
          code: "<Avatar.Image src={person.avatarUrl} width={32} height={32} loading=\"lazy\" />",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The bytes arrive, or they don't",
          lane: "system",
          detail: "Priya's photo answers. Marcus's comes back 404.",
        },
        {
          kind: "state",
          title: "The cache fills and avatarTick wakes the rows",
          detail: "The cache lives outside React, so every row showing the same person shares one blob and nothing re-renders by itself. ensureAvatar bumps avatarTick, the one field that tells the rows a photo arrived.",
          code: "set((st) => ({ avatarTick: st.avatarTick + 1 }))",
          platforms: ["desktop"],
        },
        {
          kind: "motion",
          title: "The photo fades in over the initials",
          detail: "The circle keeps its size and colour, so the row doesn't move. Today's desktop swaps the <img> in without a fade and the phone's expo-image draws it with no transition; this spec fades it.",
          enter: "fade",
        },
        {
          kind: "result",
          title: "A failed photo keeps the initials",
          detail: "Marcus stays MC. The desktop remembers the failure for ten minutes before a new mount asks again, and a 404 also forgets the device's stale copy. The phone remembers the failed url and tries the device's own copy before giving up.",
          code: "export const AVATAR_FAILURE_TTL_MS = 10 * 60 * 1000  ·  onError={() => setFailed((f) => (f.includes(photo) ? f : [...f, photo]))}",
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
              direction: "row",
              align: "flex-start",
              justify: "center",
              gap: "$space.2xl",
            },
            children: [
              {
                el: "view",
                style: {
                  align: "center",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "avatar",
                    props: {
                      name: "Priya Raman",
                      identity: "indigo",
                      size: "xl",
                    },
                  },
                  {
                    el: "text",
                    text: "Priya Raman",
                    style: {
                      fontSize: "$text.caption",
                      color: "$fg.muted",
                    },
                  },
                ],
              },
              {
                el: "view",
                style: {
                  align: "center",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "avatar",
                    props: {
                      name: "Marcus Chen",
                      identity: "green",
                      size: "xl",
                    },
                  },
                  {
                    el: "text",
                    text: "Marcus Chen",
                    style: {
                      fontSize: "$text.caption",
                      color: "$fg.muted",
                    },
                  },
                ],
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
              direction: "row",
              align: "flex-start",
              justify: "center",
              gap: "$space.2xl",
            },
            children: [
              {
                el: "view",
                style: {
                  align: "center",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "avatar",
                    props: {
                      name: "Priya Raman",
                      identity: "indigo",
                      size: "xl",
                    },
                  },
                  {
                    el: "text",
                    text: "Priya Raman",
                    style: {
                      fontSize: "$text.caption",
                      color: "$fg.muted",
                    },
                  },
                ],
              },
              {
                el: "view",
                style: {
                  align: "center",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "avatar",
                    props: {
                      name: "Marcus Chen",
                      identity: "green",
                      size: "xl",
                    },
                  },
                  {
                    el: "text",
                    text: "Marcus Chen",
                    style: {
                      fontSize: "$text.caption",
                      color: "$fg.muted",
                    },
                  },
                ],
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
              direction: "row",
              align: "flex-start",
              justify: "center",
              gap: "$space.2xl",
            },
            children: [
              {
                el: "view",
                style: {
                  align: "center",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "avatar",
                    props: {
                      name: "Priya Raman",
                      identity: "indigo",
                      size: "xl",
                    },
                  },
                  {
                    el: "text",
                    text: "Priya Raman",
                    style: {
                      fontSize: "$text.caption",
                      color: "$fg.muted",
                    },
                  },
                ],
              },
              {
                el: "view",
                style: {
                  align: "center",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "avatar",
                    props: {
                      name: "Marcus Chen",
                      identity: "green",
                      size: "xl",
                    },
                  },
                  {
                    el: "text",
                    text: "Marcus Chen",
                    style: {
                      fontSize: "$text.caption",
                      color: "$fg.muted",
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          step: 8,
          hold: 1700,
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "flex-start",
              justify: "center",
              gap: "$space.2xl",
            },
            children: [
              {
                el: "view",
                style: {
                  align: "center",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "avatar",
                    props: {
                      name: "Priya Raman",
                      identity: "indigo",
                      size: "xl",
                      src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' fill='%23d9cbbd'/><circle cx='40' cy='34' r='15' fill='%237a4b37'/><path d='M23 33c0-10 7-17 17-17s17 7 17 17c-3-5-9-8-17-8s-14 3-17 8z' fill='%23231a17'/><path d='M12 80c3-17 15-26 28-26s25 9 28 26z' fill='%232f4a6d'/></svg>",
                    },
                  },
                  {
                    el: "text",
                    text: "Priya Raman",
                    style: {
                      fontSize: "$text.caption",
                      color: "$fg.muted",
                    },
                  },
                ],
              },
              {
                el: "view",
                style: {
                  align: "center",
                  gap: "$space.xs",
                },
                children: [
                  {
                    el: "component",
                    use: "avatar",
                    props: {
                      name: "Marcus Chen",
                      identity: "green",
                      size: "xl",
                    },
                  },
                  {
                    el: "text",
                    text: "Marcus Chen",
                    style: {
                      fontSize: "$text.caption",
                      color: "$fg.muted",
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

export default docs;
