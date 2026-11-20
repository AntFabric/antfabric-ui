import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "text-field",
  name: "Text field",
  category: "inputs",
  level: "atom",
  status: "stable",
  description: "One line of text with its label, a help line, an error and an optional character count. Each state owns one dimension: hover moves the fill, focus draws a 2px grey edge, and invalid paints the edge red — and invalid wins over focus, because a field you are typing into that is still wrong must keep saying so.",
  props: {
    label: {
      type: "string",
      default: "",
      sample: "Channel name",
      description: "Visible label and the field's accessible name. A field with no visible label still needs one for screen readers — pass it and the kit hides it visually.",
    },
    value: {
      type: "string",
      default: "",
    },
    placeholder: {
      type: "string",
      default: "",
      sample: "launch-plan",
      description: "An example of the answer, never the instructions — placeholders vanish the moment someone types.",
    },
    type: {
      type: "enum",
      options: ["text", "email", "password", "search", "tel", "url", "number"],
      default: "text",
      description: "What the field holds. It sets the input type on the web and, on the phone, the keyboard, capitals and autocorrect, and secure entry for password. An address, a number or a password is laid out left to right.",
    },
    name: {
      type: "string",
      platforms: ["web", "desktop"],
      description: "The name a form posts this field under, and a password manager files it by.",
    },
    autoComplete: {
      type: "string",
      description: "What the browser or the phone may fill in: email, username, current-password, new-password, one-time-code, tel, off.",
    },
    inputMode: {
      type: "enum",
      options: ["text", "email", "numeric", "decimal", "tel", "url", "search", "none"],
      platforms: ["web", "desktop"],
      description: "The keyboard a phone browsing the web app raises, when type does not already say: a code of digits is numeric.",
    },
    prefix: {
      type: "string",
      default: "",
      sample: "#",
      description: "Fixed text before the value that is not part of it, like the # of a channel name.",
    },
    leadingIcon: {
      type: "icon",
      default: "",
      description: "Field furniture in text.faint, one step smaller than the text. Never tinted on focus — the edge already says which field is active.",
    },
    trailing: {
      type: "node",
      default: "",
      description: "A control at the end of the field: Copy on a read-only link. A password's Show is `reveal`.",
    },
    reveal: {
      type: "boolean",
      default: false,
      description: "With type password: a Show / Hide button at the end of the field. On, the characters are shown until it is pressed again; its accessible name says Show password or Hide password, and aria-pressed says which.",
    },
    helper: {
      type: "string",
      default: "",
      sample: "Lower case, no spaces. We will tidy it for you.",
      description: "One clause under the field. Replaced by the error while invalid.",
    },
    error: {
      type: "string",
      default: "",
      description: "What is wrong and how to fix it, shown in place of helper while invalid is true.",
    },
    invalid: {
      type: "boolean",
      default: false,
    },
    tag: {
      type: "string",
      default: "",
      description: "A one-word pill beside the label — \"Beta\", \"Optional\".",
    },
    required: {
      type: "boolean",
      default: false,
      description: "Sets aria-required and, with no tag, draws a \"Required\" tag.",
    },
    maxLength: {
      type: "number",
      default: 0,
      description: "Caps typing at this many characters and shows the count. 0 is no cap and no counter.",
    },
    size: {
      type: "enum",
      options: ["lg", "sm"],
      default: "lg",
      platforms: ["web", "desktop"],
      description: "lg is the 44px dialog and wizard field. sm is the 32px toolbar field. The phone has one 48pt field.",
    },
    disabled: {
      type: "boolean",
      default: false,
      description: "Skipped by Tab and not announced as editable. Say why in helper.",
    },
    readOnly: {
      type: "boolean",
      default: false,
      description: "The value can be read, selected and copied but not changed. Stays in the tab order — use this, not disabled, for anything someone may need to read.",
    },
    focused: {
      type: "boolean",
      default: false,
      description: "Draws the focus edge without real focus — for the catalogue, screenshots and a form's jump-to-first-error. At runtime the kits track focus themselves.",
    },
    copied: {
      type: "boolean",
      default: false,
      description: "A trailing Copy was just pressed: the field announces \"Copied\" politely and clears it after 1.5s. The Copy control passed in trailing swaps its own glyph to a check and its name to \"Copied\" from the same state, held by the caller.",
    },
    onSubmit: {
      type: "event",
      description: "Enter (the phone: the keyboard's Return key) was pressed in the field. Not fired while an IME is composing.",
    },
    onBlur: {
      type: "event",
      description: "Focus left the field: the moment to check the value and set invalid.",
    },
    onValueChange: {
      type: "event",
      args: "value: string",
      changes: "value",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "<label for> + <input type=\"text\" data-af-input> in a drawn box, inline styles over `t`; hover and focus-within from useInteraction on the box (the 2px edge is a 1px border plus a 1px inset ring, so nothing shifts); the error and helper are tied to the input by aria-describedby; `value` through useControllable",
      import: "import { TextField } from \"@antfabric/ui-react\"",
      notes: [
        "The error is announced through aria-describedby on the control plus aria-invalid; Field.Error renders only while invalid, so a screen reader is not told about an error that is not there.",
        "Set type, autoComplete and inputMode for what the field holds (email, url, one-time-code) so browsers autofill it and phones browsing the web app get the right keyboard. Inside a FormField the field supplies the id, aria-describedby, aria-invalid and aria-required.",
        "Focusing the field draws the edge; `focused` draws it without real focus. A read-only field's Copy is the caller's control: it swaps its own glyph and name while the field's `copied` announces \"Copied\".",
      ],
      keyboard: [
        {
          keys: "Tab",
          action: "Moves into the field; disabled fields are skipped, read-only ones are not",
        },
        {
          keys: "Enter",
          action: "Submits the surrounding form",
        },
        {
          keys: "Escape",
          action: "Inside a dialog, closes the dialog — the field never swallows it",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same <label> + <input> as web: lg 44px on --radius-input, sm 32px on --radius-control",
      import: "import { TextField } from \"@antfabric/ui-react\"",
      notes: [
        "Hover moves the FILL only (surface.hover) and never on an invalid or focused field; focus is a 2px border.active edge with no halo (ADR-0421). The edge is drawn so it takes no room — the text never shifts 1px when the field takes focus.",
        "The 2px grey edge measures 1.57:1, under WCAG 2.2's 3:1 for a focus indicator. ADR-0421 records that as the cost of the owner's explicit call (width, not a darker grey); it is a known gap, not an oversight.",
        "lg 44px uses --radius-input (11); sm 32px uses --radius-control (9). These are the desktop's --control-h-input and --control-h-sm, which the shared token profile does not carry yet, so they are written as numbers here.",
        "Spellcheck and autocorrect are off for names and slugs (spellcheck=false), on for prose fields.",
        "Pressing the field sets `focused`: the 2px edge fades in over 150ms. Copy on a read-only field sets `copied` (check glyph, \"Copied\" name) and the kit clears it after 1.5s. An error, when it arrives, fades in under the field.",
      ],
      keyboard: [
        {
          keys: "Tab",
          action: "Moves into the field",
        },
        {
          keys: "Mod+Enter",
          action: "Submits the dialog the field is in",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "TextInput (fontFamily set by font(), placeholderTextColor, maxFontSizeMultiplier fontScale.content, keyboard and secure entry from `type`) in a View box over a StyleSheet from useTheme(); focus draws a 1pt inset boxShadow ring over the 1pt edge; the error fades in through <Enter motion=\"fade\">; `copied`, an error and the characters left are announced with announceForAccessibility; `value` through useControllable",
      import: "import { TextField } from \"@antfabric/ui-react-native\"",
      notes: [
        "48pt minimum, --radius-input 11, a 1pt edge drawn as a Rim over the edge so it takes no room; focus thickens it to 2pt border.active, never the brand colour.",
        "The phone had no error state; this spec adds one: a danger edge (2pt while focused) and the message under the field with an icon, replacing the helper. LabeledInput's error line was colour-only; the icon is added so the error does not rely on colour.",
        "The TextInput sets fontFamily itself — it does not pass through the kit's Text, and without it the field renders in the platform font.",
        "The entry text grows with the person's text size up to 2× (reading text), like the label, and the field's height is a minimum. A secure (password) field remounts when revealed and refocuses, because iOS caches secureTextEntry on the native view.",
        "Tapping the field sets `focused` and the 2pt edge fades in; Copy on a read-only field sets `copied`, with a success haptic.",
      ],
      gestures: [
        {
          gesture: "Tap",
          action: "Focuses and raises the keyboard; the screen scrolls the field above it",
        },
        {
          gesture: "Long press",
          action: "The system's select / copy / paste menu — available on read-only fields too",
        },
      ],
    },
  },
  a11y: {
    role: "textbox",
    label: "{label}",
    notes: [
      "The label is a real <label for> (the phone: the accessibility label, falling back to the placeholder); the placeholder is never the name unless there is no label.",
      "The helper or the error is the input's aria-describedby (the phone: its accessibility hint) and the field sets aria-invalid; an error that appears is announced once, politely. Required is aria-required (the phone: said after the name).",
      "The counter is part of the description, read when the field is focused; it is not a live region. When typing pauses within the last 10% of the limit (at least 5 characters) the characters left are announced, and reaching the limit is announced once.",
      "`type` sets the input type and, on the phone, the keyboard and secure entry; an address, a number or a password is always laid out left to right.",
      "Inside a FormField the control takes the field's id, description, error, aria-invalid and aria-required.",
    ],
  },
  examples: [
    {
      name: "Password with Show",
      description: "type password and reveal: the characters stay hidden until Show is pressed.",
      props: { label: "Password", type: "password", value: "Demo-Pass-1!", autoComplete: "current-password", reveal: true },
    },
    {
      name: "Channel name",
      props: {},
      width: 360,
    },
    {
      name: "Focused",
      props: {
        value: "launch-plan",
        focused: true,
        helper: "It will be created as #launch-plan.",
      },
      width: 360,
    },
    {
      name: "Invalid",
      props: {
        value: "release-train",
        invalid: true,
        error: "#release-train already exists. Pick another name.",
      },
      width: 360,
    },
    {
      name: "Invalid while focused",
      description: "Invalid wins over focus: the edge stays red and thickens to 2px.",
      props: {
        value: "release-train",
        invalid: true,
        focused: true,
        error: "#release-train already exists. Pick another name.",
      },
      width: 360,
    },
    {
      name: "With counter",
      props: {
        label: "Topic",
        prefix: "",
        placeholder: "What is happening here right now",
        value: "Code freeze Friday — merge by Thursday 6pm",
        helper: "",
        maxLength: 250,
      },
      width: 360,
    },
    {
      name: "Required, with icon",
      props: {
        label: "Invite by email",
        prefix: "",
        leadingIcon: "mail",
        placeholder: "name@company.com",
        required: true,
        helper: "They get a link to join #platform-eng.",
      },
      width: 360,
    },
    {
      name: "Read-only with Copy",
      props: {
        label: "Invite link",
        prefix: "",
        placeholder: "",
        leadingIcon: "link",
        value: "antfabric.app/join/platform-eng",
        readOnly: true,
        helper: "Anyone in your organisation with this link can join.",
        trailing: [
          {
            el: "component",
            use: "icon-button",
            props: {
              icon: "copy",
              label: "Copy invite link",
              size: "sm",
            },
          },
        ],
      },
      width: 360,
    },
    {
      name: "Disabled",
      props: {
        value: "design-crit",
        disabled: true,
        helper: "Only a channel owner or admin can change these.",
      },
      width: 360,
    },
    {
      name: "Toolbar size",
      props: {
        label: "Section name",
        prefix: "",
        placeholder: "Rename section",
        helper: "",
        size: "sm",
      },
      platforms: ["web", "desktop"],
      width: 240,
    },
  ],
  matrix: [
    {
      prop: "size",
    },
    {
      prop: "invalid",
    },
    {
      prop: "readOnly",
    },
  ],
  edgeCases: [
    {
      title: "The phone gets an error state",
      platforms: ["mobile"],
      handling: "Mobile's Input had no invalid look; forms printed a red line under it. Now the edge turns danger (2pt while focused), the message sits under the field with an icon, replaces the helper, and is announced once. A light warning haptic plays only when a submit is refused, never while typing.",
      example: {
        name: "Mobile invalid",
        props: {
          value: "release-train",
          invalid: true,
          error: "#release-train already exists. Pick another name.",
        },
        width: 340,
      },
    },
    {
      title: "A long value or a long error",
      platforms: ["web", "desktop", "mobile"],
      handling: "The value stays on one line and scrolls inside the field; it never wraps or grows the field. The label truncates with an ellipsis. The error wraps to as many lines as it needs — an error is never truncated, because the cut-off half is usually the instruction.",
      example: {
        name: "Long error",
        props: {
          value: "platform-engineering-infrastructure-oncall-rotation-emea",
          invalid: true,
          error: "#platform-engineering-infrastructure-oncall-rotation-emea already exists in the Platform workspace. Pick another name, or ask to join the existing channel.",
        },
        width: 280,
      },
    },
    {
      title: "At the character limit",
      platforms: ["web", "desktop", "mobile"],
      handling: "maxLength stops the keystroke rather than explaining a truncation afterwards. A paste that overruns is cut at the limit and the field announces \"Character limit reached\" once. The cap on the control matches the server's, so nothing is clamped silently on save.",
      example: {
        name: "At the limit",
        props: {
          label: "Section name",
          prefix: "",
          value: "Release train · Q4 hardening wk1",
          helper: "",
          maxLength: 32,
        },
        width: 320,
      },
    },
    {
      title: "Read-only, not disabled",
      platforms: ["web", "desktop", "mobile"],
      handling: "Anything someone may need to read or copy is read-only: it stays in the tab order, is announced \"read only\", and can be selected and copied. Disabled is skipped by Tab and a screen reader may not read it at all. Either way the helper says why it cannot be changed — a greyed box that cannot account for itself is a dead end.",
    },
    {
      title: "Validation timing",
      platforms: ["web", "desktop", "mobile"],
      handling: "Format errors appear on blur, never on the first keystroke; once shown, the error clears as soon as the value becomes valid. Server answers (a name already taken) come back after a round-trip and never clear what was typed. A save that fails offline keeps the value and says \"You're offline. Your changes are kept here.\"",
    },
    {
      title: "Text scaled to 130%",
      platforms: ["mobile"],
      handling: "48pt is a minimum: the field grows with the text and the label wraps to two lines rather than truncating. Entry text and labels scale up to 2×.",
    },
    {
      title: "Right-to-left and mixed-direction values",
      platforms: ["web", "desktop", "mobile"],
      handling: "The prefix and leading icon sit at the start edge and the counter at the end. The input sets dir=\"auto\", so an Arabic or Hebrew value aligns right inside an English interface and a Latin slug aligns left inside an RTL one.",
    },
    {
      title: "Keyboard covers the field",
      platforms: ["mobile"],
      handling: "The form scrolls the focused field (and its error line) above the keyboard. Return reads Next and moves to the following field; the last field's Return reads Done or Send.",
    },
    {
      title: "IME composition",
      platforms: ["web", "desktop"],
      handling: "While a Japanese, Chinese or Korean IME is composing, Enter confirms the candidate and does not submit, and validation waits for compositionend — otherwise a half-composed word is judged and the form submits mid-word.",
    },
  ],
  related: ["search-field", "select", "text-area", "form-field"],
  flows: [
    {
      id: "name-a-channel",
      title: "Name a channel, and hear what's wrong before you send",
      description: "The field holds no rules of its own. The screen checks the value it is given and passes back invalid and the sentence to show; the field only decides how that looks.",
      platforms: ["web", "desktop", "mobile"],
      width: 360,
      steps: [
        {
          kind: "data",
          title: "The name lives in the dialog's store form",
          detail: "New channel derives the slug and the clash check from chForm.name and the channels the store already knows, on every render. No request is made to check a name.",
          code: "const slug = chSlug(f.name)  ·  const taken = !!slug && !!s.channelInfo[slug]",
          platforms: ["desktop"],
        },
        {
          kind: "data",
          title: "Channel Settings starts from the server's values",
          detail: "The form is seeded once from the channel query and compared against that baseline, so only a real change can be saved.",
          code: "setBaseline(serverForm); setForm(serverForm)  // <Input label=\"Name\" value={form.name} />",
          platforms: ["mobile"],
        },
        {
          kind: "data",
          title: "Existing names come from the channels query",
          detail: "The New channel route checks the slug against the channel list already in cache, as the desktop does with its store.",
          code: "const { data: channels } = useSuspenseQuery(channelsQuery)  ·  const taken = channels.some((c) => c.name === slug)",
          platforms: ["web"],
        },
        {
          kind: "trigger",
          title: "The field is focused",
          detail: "A click, Tab or autofocus when the dialog opens; a tap on the phone, where the keyboard comes up. The 2px grey edge fades in.",
        },
        {
          kind: "trigger",
          title: "Someone types",
          detail: "release train in New channel. On the phone, the old name is deleted.",
        },
        {
          kind: "event",
          title: "onValueChange(value) fires on every keystroke",
          code: "onValueChange?.(value)  // 'release train'",
        },
        {
          kind: "state",
          title: "The slug is checked as you type",
          detail: "Create channel stays disabled while there is no slug or it is taken, so the clash shows before the click, not as a toast after it.",
          code: "taken ? `#${slug} already exists. Pick another name.` : slug ? `It will be created as #${slug}.` : 'Lower case, no spaces. We will tidy it for you.'",
          platforms: ["web", "desktop"],
        },
        {
          kind: "state",
          title: "Save finds the problem",
          detail: "The phone checks on Save, not per keystroke. Today the sentence appears once, under the Privacy section; this spec moves it under the field it is about.",
          code: "const problem = settingsFormError(form)  // 'A channel needs a name.'",
          platforms: ["mobile"],
        },
        {
          kind: "motion",
          title: "The error fades in under the field",
          detail: "It takes the helper's place and the edge turns red. Invalid wins over focus, so the edge stays red while it's being fixed. Today the desktop shows the clash as the hint line in grey; this spec paints it as the error.",
          enter: "fade",
        },
        {
          kind: "result",
          title: "The field says what's wrong and how to fix it",
          detail: "Typing launch-plan clears it and the helper says It will be created as #launch-plan. On the phone, a new name clears the error and Save goes through.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1200,
          platforms: ["desktop"],
          props: {
            label: "Name",
            required: true,
            value: "",
            placeholder: "launch-plan",
            prefix: "#",
            helper: "Lower case, no spaces. We will tidy it for you.",
          },
        },
        {
          step: 2,
          hold: 1200,
          platforms: ["web"],
          props: {
            label: "Name",
            required: true,
            value: "",
            placeholder: "launch-plan",
            prefix: "#",
            helper: "Lower case, no spaces. We will tidy it for you.",
          },
        },
        {
          step: 3,
          hold: 1000,
          platforms: ["web", "desktop"],
          props: {
            label: "Name",
            required: true,
            value: "",
            placeholder: "launch-plan",
            prefix: "#",
            helper: "Lower case, no spaces. We will tidy it for you.",
            focused: true,
          },
        },
        {
          step: 8,
          hold: 2000,
          platforms: ["web", "desktop"],
          props: {
            label: "Name",
            required: true,
            value: "release train",
            placeholder: "launch-plan",
            prefix: "#",
            helper: "",
            focused: true,
            invalid: true,
            error: "#release-train already exists. Pick another name.",
          },
        },
        {
          step: 9,
          hold: 1800,
          platforms: ["web", "desktop"],
          props: {
            label: "Name",
            required: true,
            value: "launch-plan",
            placeholder: "launch-plan",
            prefix: "#",
            helper: "It will be created as #launch-plan.",
            focused: true,
          },
        },
        {
          step: 1,
          hold: 1200,
          platforms: ["mobile"],
          props: {
            label: "Name",
            value: "design-crit",
            placeholder: "channel-name",
            prefix: "",
            helper: "",
          },
        },
        {
          step: 3,
          hold: 1000,
          platforms: ["mobile"],
          props: {
            label: "Name",
            value: "design-crit",
            placeholder: "channel-name",
            prefix: "",
            helper: "",
            focused: true,
          },
        },
        {
          step: 8,
          hold: 2000,
          platforms: ["mobile"],
          props: {
            label: "Name",
            value: "",
            placeholder: "channel-name",
            prefix: "",
            helper: "",
            focused: true,
            invalid: true,
            error: "A channel needs a name.",
          },
        },
        {
          step: 9,
          hold: 1800,
          platforms: ["mobile"],
          props: {
            label: "Name",
            value: "design-review",
            placeholder: "channel-name",
            prefix: "",
            helper: "",
            focused: true,
          },
        },
      ],
    },
  ],
};

export default docs;
