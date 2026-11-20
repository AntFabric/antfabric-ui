import { StyleSheet, View } from "react-native";
import { ContextMenu, useTheme } from "@antfabric-ui/react-native";
import { Message, MessageDivider } from "@antfabric-ui/react-native/chat";
import { MobileHeader } from "@antfabric-ui/react-native/shell";
import { CONTEXT_MENU_SAMPLE, messageBar } from "@antfabric-ui/docs/samples";

/** Long-press on Marcus's message: the channel dims and the actions sheet rises over it. */
export default function MobileMessageActions() {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.surface.app }}>
      <MobileHeader variant="pushed" title="platform-eng" titleGlyph="hash" subtitle="24 members" statusBar={false} actions={[{ key: "details", icon: "info", label: "Channel details" }]} />

      <View style={{ flex: 1, minHeight: 0, overflow: "hidden", justifyContent: "flex-end", paddingVertical: t.space.sm }}>
        <MessageDivider kind="new" label="New messages" />
        <Message {...messageBar} author="Priya Raman" identity="indigo" time="10:42 AM" body="Staging is green again. @Fabric can you summarise what changed since yesterday's cut?" unread reactions={[]} />
        <Message {...messageBar}
          author="Fabric"
          agent
          time="10:43 AM"
          body="Since yesterday's cut: 14 merged PRs, 2 config changes. The only risky one is the auth token TTL change in #4821 — it has a feature flag and is off in production."
          unread
          reactions={[{ emoji: "🙏", count: 2, mine: false, reactors: "Marcus Chen and Aisha Bello reacted" }]}
        />
        <Message {...messageBar} author="You" identity="red" time="10:44 AM" body="Great — I'll take the flag off at 3 if the canary holds." status="failed" reactions={[]} />
      </View>

      {/* The sheet draws its own scrim on the phone, so it fills the screen rather than sitting on a second one. */}
      <View style={[StyleSheet.absoluteFill, { zIndex: t.z.modal }]}>
        <ContextMenu
          {...CONTEXT_MENU_SAMPLE}
          author="Marcus Chen"
          identity="green"
          time="6:12 PM"
          body="Rollout plan for 2.4 is in the doc — canary at 5%, then 25% after an hour."
          items={[
            { label: "Reply in thread", icon: "message-square-reply" },
            { label: "Copy text", icon: "copy" },
            { label: "Forward", icon: "arrow-up-right" },
            { label: "Pin to channel", icon: "pin" },
            { label: "Mark as unread", icon: "mail-check" },
          ]}
          style={{ flex: 1, width: "100%", maxWidth: "100%" }}
        />
      </View>
    </View>
  );
}
