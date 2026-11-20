import { ScrollView, View } from "react-native";
import { Chip, Fab, PermissionPrompt, useTheme } from "@antfabric/ui-react-native";
import { MobileHeader, SidebarItem, TabBar } from "@antfabric/ui-react-native/shell";
import { TAB_BAR_ACTION, TAB_BAR_TABS } from "@antfabric/ui-docs/samples";

/** The first socket connect: Messages dims and AntFabric's own sheet explains notifications before the one system prompt. */
export default function MobilePushSoftAsk() {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, position: "relative", backgroundColor: t.surface.app }}>
      <MobileHeader variant="main" title="Messages" statusBar={false} userName="Priya Raman" actions={[{ key: "notifications", icon: "bell", label: "Notifications", badge: 3 }]} />

      <ScrollView
        horizontal
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: t.space.sm, paddingHorizontal: t.space.lg, paddingVertical: t.space.sm }}
        showsHorizontalScrollIndicator={false}
      >
        <Chip label="All" icon="" selected />
        <Chip label="Channels" icon="" selected={false} />
        <Chip label="Project" icon="" selected={false} />
        <Chip label="DMs" icon="" selected={false} count={2} />
      </ScrollView>

      {/* 96 at the end clears the floating tab bar. */}
      <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        <SidebarItem name="release-train" glyph="#" unread mentions={2} />
        <SidebarItem name="Marcus Chen" avatar identity="green" presence="active" unread mentions={1} />
        <SidebarItem name="Fabric" avatar agent identity="agent" />
        <SidebarItem name="design-crit" glyph="#" unread />
        <SidebarItem name="Aisha Bello" avatar identity="ochre" presence="dnd" typing />
        <SidebarItem name="leadership-sync" icon="lock" description="private channel" />
        <SidebarItem name="random" glyph="#" muted />
      </ScrollView>

      <View style={{ position: "absolute", right: t.space.lg, bottom: 92 }}>
        <Fab variant="ink" wiggle icon="square-pen" label="New message" />
      </View>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <TabBar tabs={TAB_BAR_TABS} active="messages" action={TAB_BAR_ACTION} safeArea={false} />
      </View>

      <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, justifyContent: "flex-end", zIndex: t.z.modal, backgroundColor: t.scrim.default }}>
        <PermissionPrompt permission="default" presentation="sheet" />
      </View>
    </View>
  );
}
