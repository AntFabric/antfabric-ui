import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Chip, Fab, useTheme } from "@antfabric-ui/react-native";
import { MobileHeader, SidebarItem, TabBar } from "@antfabric-ui/react-native/shell";
import { TAB_BAR_ACTION, TAB_BAR_TABS } from "@antfabric-ui/docs/samples";

const FILTERS = [
  { label: "All", count: 0 },
  { label: "Channels", count: 0 },
  { label: "Project", count: 0 },
  { label: "DMs", count: 2 },
];

/** The Messages tab: large title, filter chips, conversation rows, the compose disc and the floating tab bar. */
export default function MobileMessages() {
  const { t } = useTheme();
  // One filter at a time, so the chips are held here rather than each keeping its own.
  const [filter, setFilter] = useState("All");
  return (
    <View style={{ flex: 1, position: "relative", backgroundColor: t.surface.app }}>
      <MobileHeader variant="main" title="Messages" statusBar={false} userName="Priya Raman" actions={[{ key: "notifications", icon: "bell", label: "Notifications", badge: 3 }]} />

      <View style={{ flexDirection: "row", gap: t.space.sm, paddingHorizontal: t.space.lg, paddingVertical: t.space.sm, overflow: "hidden" }}>
        {FILTERS.map((f) => (
          <Chip key={f.label} label={f.label} count={f.count} selected={filter === f.label} onPress={() => setFilter(f.label)} />
        ))}
      </View>

      <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false}>
        <SidebarItem name="release-train" glyph="#" unread mentions={2} />
        <SidebarItem name="Marcus Chen" avatar identity="green" presence="active" unread mentions={1} />
        <SidebarItem name="Fabric" avatar agent identity="agent" />
        <SidebarItem name="design-crit" glyph="#" unread />
        <SidebarItem name="Aisha Bello" avatar identity="ochre" presence="dnd" typing />
        <SidebarItem name="leadership-sync" icon="lock" description="private channel" />
        <SidebarItem name="random" glyph="#" muted />
      </ScrollView>

      {/* Above the tab bar, clear of the Fabric disc. */}
      <View style={{ position: "absolute", right: t.space.lg, bottom: 92 }}>
        <Fab variant="ink" wiggle icon="square-pen" label="New message" />
      </View>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <TabBar tabs={TAB_BAR_TABS} active="messages" action={TAB_BAR_ACTION} safeArea={false} />
      </View>
    </View>
  );
}
