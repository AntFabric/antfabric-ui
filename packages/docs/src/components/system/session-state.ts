import type { ComponentDocs } from "../../types";

const docs: ComponentDocs = {
  id: "session-state",
  name: "Session state",
  category: "system",
  level: "organism",
  status: "stable",
  description: "What a person sees when their session ends or needs them: expired, signing in through the browser (SSO), the phone's biometric lock, a suspended account, and the plain signed-out welcome — one compact card per state, with each platform's way back in.",
  props: {
    state: {
      type: "enum",
      options: ["expired", "waiting", "locked", "suspended", "signed-out"],
      default: "expired",
      description: "waiting = the SSO hand-off is in the browser. locked = the phone's app lock.",
    },
    returnTo: {
      type: "string",
      default: "",
      sample: "#platform-eng",
      platforms: ["web"],
      description: "Where the web sends the person after sign-in — the URL they were on.",
    },
    biometric: {
      type: "string",
      default: "Face ID",
      platforms: ["mobile"],
      description: "\"Face ID\", \"Touch ID\", \"Fingerprint\" or \"Face unlock\" — the OS's own name.",
    },
    biometricAvailable: {
      type: "boolean",
      default: true,
      platforms: ["mobile"],
    },
    unlocked: {
      type: "boolean",
      default: false,
      platforms: ["mobile"],
      description: "The lock was just passed: the tile turns to an open lock in success green, the buttons go, and the app comes forward. The app's answer to onUnlock: the button spins until the app passes it (or a new `error`), then the lock screen leaves.",
    },
    error: {
      type: "string",
      default: "",
      description: "Why the last attempt did not sign anyone in — the platform layer's sentence, verbatim.",
    },
    offline: {
      type: "boolean",
      default: false,
      description: "No backend answering: Sign in would do nothing, so the card says so.",
    },
    onSignIn: {
      type: "event",
      description: "Reports the request; Sign in spins until the app answers with `state` (waiting), `error` or `offline`, or settles the promise the handler returns. The card never turns to waiting on its own.",
    },
    onCancel: {
      type: "event",
    },
    onUnlock: {
      type: "event",
      platforms: ["mobile"],
      description: "Reports the request; Unlock spins until the app answers with `unlocked` or `error`, or settles the promise the handler returns. The lock never opens on its own.",
    },
    onSignOut: {
      type: "event",
    },
  },
  platforms: {
    web: {
      status: "ready",
      base: "A role=\"region\" card named by its title, inline styles over `t`, popping in with enter(\"pop\"), with the kit's Button; Sign in again reports the request and spins (usePending) until the app sets `state` to waiting while the route's same-tab OIDC redirect runs (TanStack Start beforeLoad → /sign-in?next=…)",
      import: "import { SessionState } from \"@antfabric/ui-react\"",
      notes: [
        "Sign in again keeps the URL: the current path rides in next= and the router sends the person back to it. Only a same-origin path is accepted, never an absolute URL, so the parameter cannot become an open redirect.",
        "Drafts are kept in IndexedDB per user and restored only when the same person signs back in.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "Activates Sign in again",
        },
      ],
    },
    desktop: {
      status: "ready",
      base: "The same card as web at desktop density, with the kit's Button (lg, full); Login with AntFabric turns it to waiting while the system browser handles SSO and returns through antfabric://auth/callback (tauri-plugin-deep-link); Escape inside the card calls onCancel",
      import: "import { SessionState } from \"@antfabric/ui-react\"",
      notes: [
        "Staging builds register antfabric-staging:// (the committed default) and production passes VITE_DEEP_LINK_SCHEME=antfabric, so a staging and a production install on one Mac never steal each other's callbacks.",
        "Only the hand-off id rides the custom-scheme URL — never a token. A callback whose state does not match the sign-in this window started is refused.",
        "The reason line uses the gateway's refusal CODE, never its message: an ordinary expiry, account_suspended, or account_deleted.",
        "\"Open the browser again\" and Cancel on the waiting card are new; today the Login screen says \"Signing you in…\" and waits.",
        "In the catalogue the card pops in, and Login with AntFabric (Sign in again on the web) spins until the app answers; the flows pass `state: \"waiting\"`, which is what the person sees while the browser has them.",
      ],
      keyboard: [
        {
          keys: "Enter",
          action: "Activates the primary button",
        },
        {
          keys: "Escape",
          action: "Cancels a waiting sign-in",
        },
      ],
    },
    mobile: {
      status: "ready",
      base: "<Enter motion=\"pop\"> card, StyleSheet over useTheme(), with the kit's Button; `state` and `unlocked` are the app's: Sign in and Unlock spin (usePending) until it answers. The app runs expo-auth-session (ASWebAuthenticationSession / Custom Tabs) and expo-local-authentication around it",
      import: "import { SessionState } from \"@antfabric/ui-react-native\"",
      notes: [
        "The lock screen auto-prompts for Face ID / fingerprint when it opens, and falls back to the passcode when the hardware is missing or nothing is enrolled.",
        "Signing in or out never draws a login screen at someone who is mid-sign-in: while the keychain read or the profile flush is outstanding, a loader shows instead.",
        "Sign out unregisters this phone's push token first, or the next person would receive the previous person's notifications.",
        "In the catalogue the card pops in; Login with AntFabric and Unlock (or Use passcode) spin until the app answers; the flows pass `state: \"waiting\"` and `unlocked: true`, so the tile turns to an open lock and the buttons go.",
      ],
      gestures: [
        {
          gesture: "Swipe the sign-in sheet down",
          action: "Cancels; nothing is signed in",
        },
      ],
    },
  },
  a11y: {
    role: "region",
    notes: [
      "The reason and any error are spoken when they arrive, politely: on the web through the page's own announcer, on the phone through the screen reader's announcement call (the note is also role=status there). A change of state says the new title.",
      "Focus does not move when the card appears: it would steal it from wherever the person was. When Sign in turns the card to waiting, the button that had focus goes, so on the web focus moves to the waiting status (and that is read instead of the title); the phone's sign-in sheet takes it from there.",
      "The waiting spinner is hidden from assistive technology; the words beside it say what is happening.",
    ],
  },
  examples: [
    {
      name: "Session expired",
    },
    {
      name: "Signing in through the browser",
      platforms: ["desktop"],
      props: {
        state: "waiting",
      },
    },
    {
      name: "Redirecting (web)",
      platforms: ["web"],
      props: {
        state: "waiting",
      },
    },
    {
      name: "Signing in (phone)",
      platforms: ["mobile"],
      props: {
        state: "waiting",
      },
    },
    {
      name: "Locked",
      platforms: ["mobile"],
      props: {
        state: "locked",
      },
    },
    {
      name: "Locked, no biometrics",
      platforms: ["mobile"],
      props: {
        state: "locked",
        biometricAvailable: false,
      },
    },
    {
      name: "Suspended",
      props: {
        state: "suspended",
      },
    },
    {
      name: "Signed out",
      props: {
        state: "signed-out",
      },
    },
  ],
  matrix: [
    {
      prop: "state",
    },
  ],
  edgeCases: [
    {
      title: "One 401 is not a dead session",
      platforms: ["web", "desktop", "mobile"],
      handling: "A route can answer 401 for its own reasons. The client asks GET /api/v1/auth/session once and shows this card only when the gateway itself refuses the handle (ADR-0210); otherwise the failing request reports its own error and the person stays signed in.",
    },
    {
      title: "The browser never comes back",
      platforms: ["desktop"],
      handling: "The waiting card stays with Open the browser again and Cancel. A hand-off that times out, a refused browser open, or a callback with the wrong state shows the platform's own sentence verbatim, so it can be reported accurately.",
      example: {
        name: "Hand-off timed out",
        platforms: ["desktop"],
        props: {
          state: "waiting",
          error: "The sign-in took too long, so it was cancelled. Try again.",
        },
      },
    },
    {
      title: "Offline when the session ends",
      platforms: ["web", "desktop", "mobile"],
      handling: "Signing in cannot work with no backend answering, so the button is disabled and the card says \"You're currently offline.\" with the backend named. It never falls back to a demo or cached session.",
      example: {
        name: "Expired, offline",
        props: {
          offline: true,
        },
      },
    },
    {
      title: "Suspended or removed accounts",
      platforms: ["web", "desktop", "mobile"],
      handling: "A suspended person is not sent round a sign-in loop that can only fail: no Sign in again, just who can fix it. A removed account reads \"This account has been removed. Contact your administrator if you think this is a mistake.\"",
    },
    {
      title: "Expired in the middle of something",
      platforms: ["web", "desktop", "mobile"],
      handling: "Drafts stay where they are and come back after sign-in. A recording keeps recording on the device; its upload waits until the person is signed in again. Nothing is discarded by the session ending.",
    },
    {
      title: "Biometrics fail or change",
      platforms: ["mobile"],
      handling: "A failed Face ID shows the OS's reason under the button and the person can retry or use the passcode. If biometrics are removed or re-enrolled in Settings, the lock falls back to the passcode; Sign out is always one tap away.",
      example: {
        name: "Face ID failed",
        platforms: ["mobile"],
        props: {
          state: "locked",
          error: "Face ID didn’t recognise you. Try again or use your passcode.",
        },
      },
    },
    {
      title: "Signed out on another device",
      platforms: ["web", "desktop", "mobile"],
      handling: "Signing out of one device ends only that device's session. An administrator revoking every session ends them all; each app shows Your session expired the next time the gateway refuses its handle, including on the socket's 4401.",
    },
  ],
  related: ["connection-banner", "permission-prompt"],
  flows: [
    {
      id: "expired-sign-in-again",
      title: "The session expires, and you sign in again",
      description: "One refused request isn't a dead session, so the app asks once before it says anything. When the session really is gone, the card says why, Sign in hands off to the browser, and the person lands back where they were.",
      platforms: ["web", "desktop", "mobile"],
      steps: [
        {
          kind: "trigger",
          title: "A request comes back 401",
          detail: "Any call can. Every response passes through one fetch that notices a 401; the socket's own refusal is noticed the same way.",
          code: "if (response.status === 401) note()",
        },
        {
          kind: "effect",
          title: "The app asks the gateway once",
          detail: "A route can refuse for its own reasons. Only when the gateway refuses the session itself does the person get signed out; one question at a time, however many requests failed together.",
          code: "fetch(`${base}/api/v1/auth/session`, { headers: { Authorization: `Bearer ${token}` } })",
        },
        {
          kind: "state",
          title: "Signed out, with the reason kept",
          detail: "The stored session is cleared and the app goes to sign-in. The reason comes from the gateway's refusal code: expired, account_suspended or account_deleted, never its message.",
          code: "await eject(signedOutReasonFor(error.code))  // setMode('signin'); sessions.clear()",
          platforms: ["desktop"],
        },
        {
          kind: "state",
          title: "Signed out, with the reason kept",
          detail: "The auth store is cleared with the sentence the sign-in screen shows: your session expired, so you were signed out.",
          code: "await useAuthStore.getState().clear(endedReason(check.code))",
          platforms: ["mobile"],
        },
        {
          kind: "state",
          title: "The route sends you to sign in, keeping your place",
          detail: "The current path rides along in next=. Only a same-origin path is accepted, so the parameter can't become an open redirect. Drafts stay in IndexedDB for the same person.",
          code: "throw redirect({ to: '/sign-in', search: { next: location.pathname } })",
          platforms: ["web"],
        },
        {
          kind: "motion",
          title: "The card pops in",
          detail: "Your session expired, and what Sign in will do. Today's desktop Login screen staggers its parts in with a short rise.",
          enter: "pop",
        },
        {
          kind: "trigger",
          title: "Login with AntFabric is pressed",
          detail: "Sign in again on the web. With no backend answering, the button is disabled and the card says You're currently offline.",
        },
        {
          kind: "event",
          title: "onSignIn() fires",
          code: "onSignIn?.()",
        },
        {
          kind: "effect",
          title: "The system browser opens to sign in",
          detail: "The app starts a hand-off, opens the identity provider in the person's own browser, and polls for the hand-off to complete.",
          code: "const opened = await platform.openExternal(authorizeUrl); setSigningIn(true); await adoptFromHandoff(start.handoff_id, start.expires_in)",
          platforms: ["desktop"],
        },
        {
          kind: "effect",
          title: "The secure sign-in sheet opens",
          detail: "ASWebAuthenticationSession on iPhone, a Custom Tab on Android, while the app polls the hand-off.",
          code: "WebBrowser.openAuthSessionAsync(start.authorizeUrl)  // then pollHandoff(start.handoffId)",
          platforms: ["mobile"],
        },
        {
          kind: "effect",
          title: "The same tab goes to the identity provider",
          code: "location.assign(authorizeUrl)",
          platforms: ["web"],
        },
        {
          kind: "state",
          title: "Waiting for the browser",
          detail: "The card swaps to a spinner. The desktop browser comes back through antfabric://auth/callback carrying only a hand-off id, never a token, and a callback whose state doesn't match is refused.",
          code: "registerAuthDeepLink((cb) => { setSigningIn(true); void adoptFromHandoff(cb.handoffId, 120) })",
        },
        {
          kind: "result",
          title: "Back where you were",
          detail: "The new session is saved, the workspace goes live and refreshes, and drafts are still in their composers. The web returns to next=, here #platform-eng.",
          code: "const persisted = await sessions.adopt(token); remember(await readSession()); setMode('live')",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 480,
              minHeight: 420,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "10:42 AM",
                  body: "Can someone sanity-check the rollout plan before the 3pm train?",
                  reactions: [],
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
              width: 480,
              minHeight: 420,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "session-state",
                props: {
                  state: "expired",
                },
              },
            ],
          },
        },
        {
          step: 6,
          press: 0,
          hold: 900,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 480,
              minHeight: 420,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "session-state",
                props: {
                  state: "expired",
                },
              },
            ],
          },
        },
        {
          step: 11,
          hold: 1700,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 480,
              minHeight: 420,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "session-state",
                props: {
                  state: "waiting",
                },
              },
            ],
          },
        },
        {
          step: 12,
          hold: 1600,
          platforms: ["web", "desktop"],
          scene: {
            el: "view",
            style: {
              width: 480,
              minHeight: 420,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "10:42 AM",
                  body: "Can someone sanity-check the rollout plan before the 3pm train?",
                  reactions: [],
                },
              },
            ],
          },
        },
        {
          step: 0,
          hold: 1300,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 375,
              minHeight: 520,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "10:42 AM",
                  body: "Can someone sanity-check the rollout plan before the 3pm train?",
                  reactions: [],
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
              width: 375,
              minHeight: 520,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "session-state",
                props: {
                  state: "expired",
                },
              },
            ],
          },
        },
        {
          step: 6,
          press: 0,
          hold: 900,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 375,
              minHeight: 520,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "session-state",
                props: {
                  state: "expired",
                },
              },
            ],
          },
        },
        {
          step: 11,
          hold: 1700,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 375,
              minHeight: 520,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "session-state",
                props: {
                  state: "waiting",
                },
              },
            ],
          },
        },
        {
          step: 12,
          hold: 1600,
          platforms: ["mobile"],
          scene: {
            el: "view",
            style: {
              width: 375,
              minHeight: 520,
              justify: "center",
              align: "center",
              bg: "$color.background.card",
            },
            children: [
              {
                el: "component",
                use: "message",
                props: {
                  author: "Priya Raman",
                  time: "10:42 AM",
                  body: "Can someone sanity-check the rollout plan before the 3pm train?",
                  reactions: [],
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: "unlock-with-face-id",
      title: "The app is locked, and Face ID opens it",
      description: "The phone's app lock: the session is fine, but the person has to prove it's them. The lock asks for Face ID as soon as it opens; the button is for when they cancelled or there's no biometric to use.",
      platforms: ["mobile"],
      steps: [
        {
          kind: "data",
          title: "The app comes back locked",
          detail: "There is a session, but isUnlocked is false, so the root layout draws the lock screen instead of the app.",
          code: "{booting ? <LoadingBlock /> : !session ? <LoginScreen /> : <LockScreen />}",
        },
        {
          kind: "data",
          title: "It reads what the phone can do",
          detail: "Face ID, Touch ID or a fingerprint, by the OS's own name. No hardware, or nothing enrolled, and the button reads Use passcode.",
          code: "const cap = await getBiometricCapability(); setLabel(labelFor(cap.primary))",
        },
        {
          kind: "motion",
          title: "The card pops in",
          enter: "pop",
        },
        {
          kind: "effect",
          title: "Face ID is asked for straight away",
          detail: "The lock doesn't wait for a tap: it prompts as soon as it opens. Cancelling leaves the card and its button for another try.",
          code: "LocalAuthentication.authenticateAsync({ promptMessage: reason, cancelLabel: 'Cancel', disableDeviceFallback: false })",
        },
        {
          kind: "trigger",
          title: "Unlock with Face ID is pressed",
          detail: "After a cancelled prompt. With no biometrics the same button reads Use passcode.",
        },
        {
          kind: "event",
          title: "onUnlock() fires",
          code: "onUnlock?.()",
        },
        {
          kind: "state",
          title: "The store unlocks",
          detail: "Only a successful check unlocks. A failure keeps the lock and shows the reason under the button.",
          code: "if (res.success) unlock()  // set({ isUnlocked: true })",
        },
        {
          kind: "result",
          title: "The lock opens and the app comes forward",
          detail: "The tile turns to an open lock in green, the buttons go, and the screen the person left is underneath. Sign out stays one tap away while locked.",
        },
      ],
      replay: [
        {
          step: 0,
          hold: 1300,
          props: {
            state: "locked",
          },
        },
        {
          step: 4,
          press: 0,
          hold: 900,
          props: {
            state: "locked",
          },
        },
        {
          step: 7,
          hold: 1600,
          props: {
            state: "locked",
            unlocked: true,
          },
        },
      ],
    },
  ],
};

export default docs;
