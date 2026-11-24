import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "reaction-pill",
  name: "Reaction pill",
  category: "messaging",
  level: "atom",
  status: "beta",
  description: "One emoji reaction under a message: the emoji and how many people chose it. Yours wears the soft coral fill and edge, and pressing the pill toggles yours. The add variant opens the emoji picker.",
  props: {
    emoji: {
      type: "string",
      sample: "👍",
      required: true,
    },
    count: {
      type: "number",
      default: 1,
      sample: 3,
      description: "How many people reacted with this emoji. Server-owned; a pill at 0 is removed, never drawn.",
    },
    mine: {
      type: "boolean",
      default: false,
      description: "You are one of the reactors. Soft coral fill and edge; sets aria-pressed.",
    },
    reactors: {
      type: "string",
      default: "",
      sample: "Priya Raman, Marcus Chen and Aisha Bello reacted",
      description: "Who reacted, as one sentence: up to 50 names, then \"and N others\". You are \"You\". It is the hover card on web and desktop and part of the accessible name everywhere.",
    },
    variant: {
      type: "enum",
      options: ["reaction", "add"],
      default: "reaction",
      description: "add is the smile-plus pill at the end of a reaction row that opens the emoji picker.",
    },
    showReactors: {
      type: "boolean",
      default: false,
      platforms: ["web", "desktop"],
      description: "Draws the who-reacted hover card open, above the pill. The catalogue cannot hover, so this is how the card is shown.",
    },
    disabled: {
      type: "boolean",
      default: false,
      description: "The message is still sending or failed, so it has no server id to react to.",
    },
    onMineChange: {
      type: "event",
      args: "mine: boolean",
      changes: "mine",
      description: "Called with `mine` as the press leaves it: flipped, for a reaction (the add pill never calls it). Given `mine` too, the pill is controlled and this reports the request: it is busy (aria-busy) and shows the caller's `mine` and `count` until the app passes new ones (or the promise the handler returns settles), so a rejected reaction stays as it was. On its own it flips itself and moves its count by one.",
    },
    onPress: {
      type: "event",
      description: "The pill was pressed: a reaction toggles your reaction (through `onMineChange`), add opens the emoji picker.",
    },
    onLongPress: {
      type: "event",
      platforms: ["mobile"],
      description: "Opens the Reactions sheet: who reacted, per emoji.",
    },
  },
  platforms: {
    web: {
      status: "partial",
      base: "A <button aria-pressed> with inline styles over `t`; hover, press and focus from useInteraction. The who-reacted card is a role=\"tooltip\" box: in flow above the pill with showReactors, floating above it after a 500 ms hover or at once on keyboard focus.",
      import: "import { ReactionPill } from \"@antfabric/ui-react/chat\"",
      notes: [
        "The who-reacted card opens on hover after the app's tooltip delay and on keyboard focus with none, flips below the pill when it would leave the top of the timeline (96px margin), and is capped at 420px wide.",
        "pointer: coarse (a touch laptop or tablet browser): no hover card; press and hold for 500 ms opens it instead, and the pill grows to 32px.",
        "Not in the kit yet: flipping the card below the pill near the top of the timeline, the 420px cap (the card is 240 wide), and the coarse-pointer hold and 32px pill.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Toggles your reaction",
        },
        {
          keys: "Tab",
          action: "Moves through the reaction row; the add pill is last",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <button aria-pressed> as web (one file, usePlatform), 22px from the desktop density tokens; the who-reacted card opens on a 500 ms hover or keyboard focus, or with showReactors.",
      import: "import { ReactionPill } from \"@antfabric/ui-react/chat\"",
      notes: [
        "22px tall, 9 radius, 11/12px SemiBold — today's ReactionChip. Yours is brand/soft with the brand/soft edge.",
        "The hover card is an inverse card with the emoji above the sentence, exactly as the desktop draws it today; the add pill is new in this spec.",
        "Pressing the pill toggles `mine` and moves `count` by one (optimistic): the coral fill fades in or out, and a pill that reaches 0 leaves the row. The pill pops in when it arrives.",
      ],
      keyboard: [
        {
          keys: "Enter / Space",
          action: "Toggles your reaction",
        },
        {
          keys: "R",
          action: "On a focused message (the message cursor), opens the emoji picker — the add pill's job",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "Pressable with onLongPress, StyleSheet over useTheme() tokens (32pt pill, 1pt edge); usePress for the pressed fill; pops in with <Enter motion=\"pop\">.",
      import: "import { ReactionPill } from \"@antfabric/ui-react-native/chat\"",
      notes: [
        "A 32pt pill: \"👍 3\" as one 14pt SemiBold run in the text colour whoever reacted; yours is primarySoft with the borderBrand edge (V2 Figma).",
        "No hover exists, so who reacted is the Reactions sheet on long-press, and the accessible name says so.",
        "Light haptic on toggle, played by the app's onPress (the kit has no haptics dependency). A pending (local echo) message ignores the tap rather than dimming the pill a second time.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Toggles your reaction; light haptic",
        },
        {
          gesture: "Long press",
          action: "Opens the Reactions sheet listing who reacted with each emoji",
        },
      ],
    },
  },
  a11y: {
    role: "button",
    label: "{emoji} {count}. {reactors}",
    notes: [
      "The pill is a toggle: aria-pressed / accessibilityState.selected says whether you reacted.",
      "The name always carries the count: \"👍 3. Priya Raman, Marcus Chen and You reacted\"; the sentence is added when `reactors` is given.",
      "Web and desktop: the who-reacted card opens on a resting pointer or on focus, is linked to the pill with aria-describedby, stays open while the pointer is over it, and Escape dismisses it.",
      "On mobile the name ends with the hidden gesture: \"Double tap and hold to see who reacted\".",
    ],
  },
  examples: [
    {
      name: "Someone else's",
      props: {
        emoji: "👀",
        count: 2,
        reactors: "Marcus Chen and Aisha Bello reacted",
      },
    },
    {
      name: "Yours",
      props: {
        emoji: "🎉",
        count: 5,
        mine: true,
        reactors: "You, Priya Raman, Kenji Watanabe, Sofia Herrera and Daniel Okafor reacted",
      },
    },
    {
      name: "Who reacted (hover card)",
      props: {
        emoji: "✅",
        count: 3,
        mine: true,
        reactors: "You, Priya Raman and Marcus Chen reacted",
        showReactors: true,
      },
      platforms: ["web", "desktop"],
    },
    {
      name: "Add reaction",
      props: {
        variant: "add",
      },
    },
    {
      name: "On a sending message",
      props: {
        emoji: "👍",
        count: 1,
        mine: true,
        reactors: "You reacted",
        disabled: true,
      },
    },
  ],
  matrix: [
    {
      prop: "mine",
    },
    {
      prop: "variant",
    },
  ],
  states: ["hover", "pressed", "focus", "disabled"],
  edgeCases: [
    {
      title: "Nobody to name yet",
      platforms: ["web", "desktop"],
      handling: "With `reactors` empty (the names still loading, or a product that does not send them), hover and focus open no card: an empty card would say nothing. The pill's name is the emoji and the count.",
      example: {
        name: "No reactors",
        props: { emoji: "👀", count: 3, reactors: "" },
      },
    },
    {
      title: "Hundreds of reactors",
      platforms: ["web", "desktop"],
      handling: "The sentence names up to 50 people and then \"and 112 others\", so the card is capped by content as well as by its 420px width. A name that will not wrap breaks anywhere rather than widening the card.",
      example: {
        name: "Capped sentence",
        props: {
          emoji: "🚀",
          count: 162,
          reactors: "Priya Raman, Marcus Chen, Aisha Bello, Kenji Watanabe, Sofia Herrera and 157 others reacted",
          showReactors: true,
        },
      },
    },
    {
      title: "A count above 999",
      platforms: ["web", "desktop", "mobile"],
      handling: "The pill reads 999+ so a company-wide announcement does not grow a pill wider than the emoji row; the accessible name keeps the exact count.",
      example: {
        name: "999+",
        props: {
          emoji: "❤️",
          count: 1284,
          reactors: "Priya Raman, Marcus Chen and 1,282 others reacted",
        },
      },
    },
    {
      title: "Pressed twice quickly",
      platforms: ["web", "desktop", "mobile"],
      handling: "Each press flips the pill at once (optimistic) and the toggles are sent in order; if the server answers with a different count, its number wins and the pill settles without flashing. A press while the previous toggle is in flight is not dropped.",
    },
    {
      title: "Offline",
      platforms: ["web", "desktop", "mobile"],
      handling: "A press while offline is refused with the offline toast and the pill does not change. A reaction that quietly never arrives would tell the author nothing while telling you they had seen it.",
    },
    {
      title: "Reacted from another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "The reaction event updates count and mine on every open client. Reacting on the phone turns the desktop pill coral without a refresh; removing it there removes it here, and a pill that reaches 0 leaves the row.",
    },
    {
      title: "An emoji this device cannot draw",
      platforms: ["web", "desktop", "mobile"],
      handling: "A newer Unicode emoji on an older OS, or a custom workspace emoji whose image failed, shows its :shortcode: in the pill instead of a tofu box. The accessible name uses the emoji's name either way.",
      example: {
        name: "Shortcode fallback",
        props: {
          emoji: ":shipit:",
          count: 4,
          reactors: "Daniel Okafor, Mei Tanaka, Ravi Iyer and Lucía Romero reacted",
        },
      },
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "The pill's 32pt height is a minimum; the run grows with Dynamic Type up to the app's 1.3× cap and the reaction row wraps onto another line rather than clipping.",
    },
    {
      title: "Keyboard and screen reader",
      platforms: ["web", "desktop"],
      handling: "Every pill is a real toggle button in the tab order; focus shows the who-reacted card immediately, without the hover delay, and the card's sentence is also the accessible name.",
    },
  ],
  related: ["message", "message-actions", "emoji-picker", "context-menu"],
  flows: [
    {
      id: "toggle-your-reaction",
      title: "Add your reaction to someone else's",
      description: "Pressing a pill adds or takes away yours. It changes before the server answers, a refusal puts it back, and the socket brings everyone else's copy in line.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "data",
          title: "Each pill is one entry in the message's reactions",
          detail: "The pills come from the message in chMsgs. mine is set when your participant id is among the reactors, which is also how a reaction you made on the phone turns this pill coral.",
          code: "reactions.map((r) => <ReactionChip key={r.e} reaction={r} onToggle={toggle(r.e)} />)",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "The row draws the pills from the message window",
          detail: "The message's reactions ride the same row the timeline draws. A local echo has none and takes no taps.",
          code: "onPress={onToggleReaction !== undefined && !pending ? () => onToggleReaction(m, r.emoji) : undefined}",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "The pills come from the channel query",
          detail: "The message's reactions are part of the channel's TanStack Query cache, and the socket's reaction events patch that cache in place.",
          code: "queryClient.setQueryData(messagesKey(channelId), (pages) => patchMessage(pages, messageId, apply))",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The 🎉 pill is pressed",
          detail: "A click, Enter or Space; a tap on the phone. A message that is still sending, or failed, ignores it: there is no server id to react to.",
        },
        {
          kind: "event",
          title: "onPress() fires",
          detail: "The pill doesn't know the message. The row that draws it supplies the message and the emoji.",
          code: "onPress?.()",
        },
        {
          kind: "state",
          title: "The store flips it before the server answers",
          detail: "The message is patched in the timeline and in an open thread. A refusal flips it back and says \"Your reaction was not saved. Try again.\"",
          code: "apply(!had); (had ? backend.channels.unreact(messageId, emoji) : backend.channels.react(messageId, emoji)).catch(() => apply(had))",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "The mutation flips it in the window and on the device",
          detail: "onMutate patches the row and the device cache, so the pill is still yours after leaving the channel and coming back. A refusal re-reads the channel instead of guessing.",
          code: "onMutate: patchScope(client, scope, (pages) => patchMessage(pages, input.messageId, apply)); cachePatchMessage({ ownerId: selfId }, input.messageId, apply)",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The coral fills in and the count ticks up",
          detail: "The fill and edge cross-fade; the number changes in place. A pill that reaches 0 leaves the row, and a new emoji's pill pops in.",
        },
        {
          kind: "trigger",
          title: "The socket confirms it",
          lane: "system",
          detail: "chat.reaction.added comes back to you and reaches everyone in the channel. Applying it is idempotent, so your own echo changes nothing and the count settles on the server's number.",
          code: "reactions: applyReaction(m.reactions, emoji, who, added, mine)",
        },
        {
          kind: "result",
          title: "🎉 3, yours",
          detail: "Your other devices turn the pill coral without a refresh.",
        },
      ],
      replay: [
        {
          step: 3,
          press: 0,
          hold: 1000,
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "ink",
                  time: "11:02 AM",
                  body: "Design crit moved to 3:30 — the room was double-booked.",
                  reactions: [
                    {
                      emoji: "🎉",
                      count: 2,
                      mine: false,
                      reactors: "Priya Raman and Marcus Chen reacted",
                    },
                    {
                      emoji: "👀",
                      count: 1,
                      mine: false,
                      reactors: "Mei Tanaka reacted",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          step: 7,
          hold: 1600,
          scene: {
            el: "view",
            style: {
              width: 600,
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Kenji Watanabe",
                  identity: "ink",
                  time: "11:02 AM",
                  body: "Design crit moved to 3:30 — the room was double-booked.",
                  reactions: [
                    {
                      emoji: "🎉",
                      count: 3,
                      mine: true,
                      reactors: "You, Priya Raman and Marcus Chen reacted",
                    },
                    {
                      emoji: "👀",
                      count: 1,
                      mine: false,
                      reactors: "Mei Tanaka reacted",
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
      id: "who-reacted",
      title: "See who reacted",
      description: "Resting on a pill opens a dark card naming everyone who chose that emoji. On the phone, where nothing hovers, a long press opens the Reactions sheet instead.",
      platforms: ["web", "desktop"],
      width: 320,
      steps: [
        {
          kind: "data",
          title: "The sentence is built from the reactors' ids",
          detail: "Each id resolves to a name through the people directory, and yours reads You. Up to 50 names, then \"and N others\".",
          code: "const names = reaction.users.map((id) => (id === s.userId ? 'You' : resolveMember(id, s.people).name)); const sentence = reactorSentence(names, unnamed)",
        },
        {
          kind: "trigger",
          title: "The pointer rests on the pill",
          detail: "Keyboard focus opens it at once, without the hover delay.",
        },
        {
          kind: "state",
          title: "The pill opens its card, above or below",
          detail: "Above the pill, unless that would leave the top of the timeline; then below.",
          code: "onMouseEnter={() => setOpen(true)}  ·  setBelow(host.getBoundingClientRect().top < FLIP_MARGIN_PX)",
        },
        {
          kind: "motion",
          title: "The card fades in",
          enter: "fade",
        },
        {
          kind: "result",
          title: "Who reacted, in one sentence",
          detail: "The same sentence is the pill's accessible name, so it is never hover-only. Moving away closes the card.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            emoji: "✅",
            count: 3,
            mine: true,
            reactors: "You, Priya Raman and Marcus Chen reacted",
          },
        },
        {
          step: 3,
          hold: 2000,
          props: {
            emoji: "✅",
            count: 3,
            mine: true,
            reactors: "You, Priya Raman and Marcus Chen reacted",
            showReactors: true,
          },
        },
      ],
    },
  ],
};

export default docs;
