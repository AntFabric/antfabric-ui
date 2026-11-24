import { ScrollView, View } from "react-native";
import { useTheme } from "@antfabric/ui-react-native";
import { Composer, Message, MessageDivider } from "@antfabric/ui-react-native/chat";
import { MobileHeader } from "@antfabric/ui-react-native/shell";
import { composerTools, messageBar } from "@antfabric/ui-docs/samples";

/** A channel on the train: the header says it's offline, messages come from the device cache, the draft stays. */
export default function MobileOffline() {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.color.background.app }}>
      <MobileHeader
        variant="pushed"
        title="platform-eng"
        titleGlyph="hash"
        subtitle="24 members"
        statusBar={false}
        actions={[{ key: "details", icon: "info", label: "Channel details" }]}
        connection="offline"
      />

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
      </ScrollView>

      <View style={{ paddingHorizontal: t.space.sm, paddingBottom: t.space.sm }}>
        <Composer {...composerTools} mode="offline" value="Landing in 10 — will pick this up from the train." placeholder="Message #platform-eng" />
      </View>
    </View>
  );
}
