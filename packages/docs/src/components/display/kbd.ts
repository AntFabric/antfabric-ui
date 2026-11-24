import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "kbd",
  name: "Keyboard shortcut",
  category: "display",
  level: "atom",
  status: "stable",
  description: "A shortcut, written once as Mod+Shift+K and drawn the way each OS writes it: ⌘⇧K on a Mac, Ctrl+Shift+K on Windows and Linux.",
  props: {
    keys: {
      type: "string",
      sample: "Mod+K",
      required: true,
    },
    tone: {
      type: "enum",
      options: ["default", "inverse", "bare"],
      default: "default",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<kbd>, inline styles over `t`; glyphs from formatShortcut for the OS in usePlatform(), accessible name in words",
      import: "import { Kbd } from \"@antfabric/ui-react\"",
      notes: [
        "OS comes from navigator.userAgentData.platform (fallback navigator.platform). iPadOS reports as Mac — correct, its keyboards have ⌘.",
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <kbd> as web; ⌘⇧K glyphs with caps tracking on macOS, Ctrl+Shift+K on Windows and Linux",
      import: "import { Kbd } from \"@antfabric/ui-react\"",
      notes: ["OS comes from Tauri's @tauri-apps/plugin-os platform(), not the user agent."],
    },
    mobile: {
      status: "not-applicable",
      alternative: "Phones show no shortcut hints. On iPad with a hardware keyboard, shortcuts are registered as UIKeyCommands so holding ⌘ lists them — the system draws that, not us.",
    },
  },
  a11y: {
    notes: [
      "The glyphs are hidden from assistive tech and the shortcut is read in words (\"Command K\") from a visually hidden span: a <kbd> has no role to carry an aria-label.",
      "The kit sets `aria-keyshortcuts` on the rows that draw a shortcut (Menu); a product that draws a Kbd beside its own control sets it there, with `ariaShortcut(keys, os)`.",
    ],
  },
  examples: [
    {
      name: "Search",
      props: {
        keys: "Mod+K",
      },
    },
    {
      name: "Three keys",
      props: {
        keys: "Mod+Shift+K",
      },
    },
    {
      name: "History back",
      props: {
        keys: "Mod+[",
      },
    },
    {
      name: "On a dark tooltip",
      props: {
        keys: "Mod+Enter",
        tone: "inverse",
      },
    },
  ],
  matrix: [
    {
      prop: "tone",
    },
  ],
  edgeCases: [
    {
      title: "Same shortcut, different OS",
      platforms: ["web", "desktop"],
      handling: "Switch the OS on the Desktop tab: the component is given Mod+Shift+K once; macOS draws ⌘⇧K, Windows and Linux draw Ctrl+Shift+K.",
      example: {
        name: "Mod+Shift+K",
        props: {
          keys: "Mod+Shift+K",
        },
      },
    },
    {
      title: "Browser-reserved shortcut",
      platforms: ["web"],
      handling: "History back on desktop is ⌘[; in a browser that is the browser's own back, which works anyway. ⌘N (new message on desktop) opens a browser window, so the web app documents Mod+Alt+N instead.",
      example: {
        name: "Web alternative",
        props: {
          keys: "Mod+Alt+N",
        },
      },
    },
    {
      title: "Non-US keyboard layouts",
      platforms: ["web", "desktop"],
      handling: "Shortcuts bind to KeyboardEvent.code for letters, so ⌘K works on AZERTY; punctuation shortcuts ([ ] /) bind to key, and Settings lets a person rebind them.",
    },
  ],
  flows: [
    {
      id: "rebind-a-shortcut",
      title: "Rebind a shortcut and every hint redraws",
      description: "A hint is never typed out. It is drawn from the binding, so when someone moves Projects from ⌘⇧P to ⌘⌥P, the Settings row, the ⌘/ card and every tooltip that shows it change together.",
      platforms: ["web", "desktop"],
      steps: [
        {
          kind: "data",
          title: "Every hint asks the registry for its caps",
          detail: "Settings and the ⌘/ card call displayCapsFor, which reads the person's override and falls back to the default binding.",
          code: "const caps = displayCapsFor(def, s.shortcutBindings)",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The bindings live with the person's preferences",
          detail: "Loaded once into the TanStack Query cache, so a rebinding follows them to another browser. Chords the browser owns (⌘W, ⌘T, ⌘N) are never offered.",
          code: "const { data: bindings } = useQuery(shortcutPrefsQuery)",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "Projects is rebound to ⌘⌥P",
          detail: "In Settings → Keyboard shortcuts, the row's editor takes modifier toggles and a key, then Save. A chord the system or another shortcut already owns is refused, with the reason.",
        },
        {
          kind: "state",
          title: "setShortcutBinding stores the override and saves it",
          detail: "One map of overrides in the store, written through to antfabric.json in the app's data folder, so it survives a restart.",
          code: "const next = { ...s.shortcutBindings, [id]: binding }; void shortcutPrefs.save(next)",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "The mutation updates the cache first",
          code: "useMutation({ mutationFn: saveShortcutPrefs, onMutate: (next) => queryClient.setQueryData(shortcutPrefsQuery.queryKey, next) })",
          platforms: ["web"],
        },
        {
          kind: "result",
          title: "Every hint redraws in the OS's own glyphs",
          detail: "Written once as Mod+Alt+P, it reads ⌘⌥P on a Mac and Ctrl+Alt+P on Windows and Linux. Today's desktop caps come from MOD_GLYPH, with Shift spelled out as a word in key boxes because ⇧ was misread as ↑.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1400,
          platforms: ["desktop"],
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              justify: "space-between",
              gap: "$space.md",
              width: 260,
            },
            children: [
              {
                el: "text",
                text: "Projects",
                style: {
                  fontSize: "$font.size.bodySm",
                  fontWeight: "$font.weight.medium",
                  color: "$color.text.strong",
                },
              },
              {
                el: "component",
                use: "kbd",
                props: {
                  keys: "Mod+Shift+P",
                },
              },
            ],
          },
        },
        {
          step: 1,
          hold: 1400,
          platforms: ["web"],
          scene: {
            el: "view",
            style: {
              direction: "row",
              align: "center",
              justify: "space-between",
              gap: "$space.md",
              width: 260,
            },
            children: [
              {
                el: "text",
                text: "Projects",
                style: {
                  fontSize: "$font.size.bodySm",
                  fontWeight: "$font.weight.medium",
                  color: "$color.text.strong",
                },
              },
              {
                el: "component",
                use: "kbd",
                props: {
                  keys: "Mod+Shift+P",
                },
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
              direction: "row",
              align: "center",
              justify: "space-between",
              gap: "$space.md",
              width: 260,
            },
            children: [
              {
                el: "text",
                text: "Projects",
                style: {
                  fontSize: "$font.size.bodySm",
                  fontWeight: "$font.weight.medium",
                  color: "$color.text.strong",
                },
              },
              {
                el: "component",
                use: "kbd",
                props: {
                  keys: "Mod+Alt+P",
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
