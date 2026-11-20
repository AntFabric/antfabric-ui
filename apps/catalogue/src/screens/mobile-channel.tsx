import { ScrollView, View } from "react-native";
import { useTheme } from "@antfabric/ui-react-native";
import { Composer, Message, MessageDivider, TypingIndicator } from "@antfabric/ui-react-native/chat";
import { MobileHeader } from "@antfabric/ui-react-native/shell";
import { composerTools, messageBar } from "@antfabric/ui-docs/samples";

/** A channel pushed from the Messages tab: no tab bar, the composer at the bottom. */
export default function MobileChannel() {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.surface.app }}>
      <MobileHeader variant="pushed" title="platform-eng" titleGlyph="hash" subtitle="24 members" statusBar={false} actions={[{ key: "details", icon: "info", label: "Channel details" }]} />

      <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end", paddingVertical: t.space.sm }} showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      {/* A fixed line, so the list doesn't jump when someone starts or stops typing. The indicator pads itself to the gutter. */}
      <View style={{ height: 22, justifyContent: "center" }}>
        <TypingIndicator names={["Aisha"]} />
      </View>

      <View style={{ paddingHorizontal: t.space.sm, paddingBottom: t.space.sm }}>
        <Composer {...composerTools} placeholder="Message #platform-eng" />
      </View>
    </View>
  );
}
