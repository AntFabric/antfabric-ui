import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { ListItem, RadioGroup, Switch, font, useTheme } from "@antfabric-ui/react-native";
import { MobileHeader } from "@antfabric-ui/react-native/shell";

function SectionLabel({ children }: { children: string }) {
  const { t } = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[
        font("semibold"),
        {
          marginTop: t.space.lg,
          marginBottom: t.space["3xs"],
          paddingHorizontal: t.space["2xs"],
          fontSize: t.text.caption,
          lineHeight: t.text.captionLine,
          letterSpacing: t.text.caption * 0.08 /* tracking.caps, 0.08em, in points */,
          textTransform: "uppercase",
          color: t.fg.faint,
        },
      ]}
    >
      {children}
    </Text>
  );
}

function Group({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ gap: t.space["2xs"], paddingHorizontal: t.space.md, paddingVertical: t.space["2xs"], borderRadius: t.radius.card, backgroundColor: t.surface.card }}>
      {children}
    </View>
  );
}

/** Profile → Notifications: push on this phone, the default level, the desktop hold, and pausing. */
export default function MobileNotificationSettings() {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.surface.recessed }}>
      <MobileHeader variant="pushed" title="Notifications" statusBar={false} actions={[]} />

      <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ gap: t.space.xs, paddingHorizontal: t.space.lg, paddingBottom: t.space.xl }} showsVerticalScrollIndicator={false}>
        <SectionLabel>On this phone</SectionLabel>
        <Group>
          <Switch label="Push notifications" description="Allowed in iOS Settings" icon="bell" checked />
          <Switch label="Show previews" description="Message text on the lock screen" icon="eye" checked />
          <Switch label="Sound" icon="volume-2" checked />
        </Group>

        <SectionLabel>Notify me about</SectionLabel>
        <Group>
          <RadioGroup
            label="Notify me about"
            hideLabel
            value="mentions"
            options={[
              { key: "all", label: "Every message" },
              { key: "mentions", label: "Mentions, DMs and threads I follow" },
              { key: "none", label: "Nothing" },
            ]}
          />
        </Group>

        <SectionLabel>When I'm active on desktop</SectionLabel>
        <Group>
          <RadioGroup
            label="When I'm active on desktop"
            hideLabel
            value="2"
            options={[
              { key: "0", label: "Send to this phone right away" },
              { key: "2", label: "After 2 minutes, if still unread" },
              { key: "10", label: "After 10 minutes, if still unread" },
            ]}
          />
        </Group>

        <SectionLabel>Pause</SectionLabel>
        <Group>
          <ListItem title="Pause notifications" leading="icon" icon="bell-off" detail="Off" chevron />
          <ListItem title="Quiet hours" leading="icon" icon="moon" detail="19:00–08:00" chevron />
        </Group>
      </ScrollView>
    </View>
  );
}
