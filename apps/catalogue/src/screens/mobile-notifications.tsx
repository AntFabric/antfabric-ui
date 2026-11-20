import { ScrollView, View } from "react-native";
import { InAppBanner, NotificationItem, SegmentedControl, SwipeRow, useTheme } from "@antfabric-ui/react-native";
import { MobileHeader } from "@antfabric-ui/react-native/shell";
import { swipeRowActions } from "@antfabric-ui/docs/samples";

/** Notifications, pushed from the bell: an approval waiting in its row, one row swiped open, and a banner from another channel. */
export default function MobileNotifications() {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, position: "relative", backgroundColor: t.surface.app }}>
      <MobileHeader variant="pushed" title="Notifications" statusBar={false} actions={[{ key: "mark-read", icon: "check-check", label: "Mark all as read" }]} />

      <View style={{ paddingHorizontal: t.space.lg, paddingVertical: t.space.sm }}>
        <SegmentedControl
          full
          label="Notifications"
          value="all"
          items={[
            { key: "all", label: "All" },
            { key: "dms", label: "DMs", count: 2 },
            { key: "mentions", label: "Mentions", count: 3 },
          ]}
        />
      </View>

      <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false}>
        <NotificationItem
          agent
          icon="shield-question"
          approval="pending"
          sender="Fabric"
          title="Fabric needs your approval"
          body="Send the 2.4 release notes to #announcements?"
          time="now"
          read={false}
        />
        <NotificationItem
          icon="at-sign"
          sender="Priya Raman"
          title="Priya Raman · #platform-eng"
          body="@you can you sanity-check the rollout plan before the 3pm train?"
          time="4m ago"
          read={false}
        />
        <SwipeRow
          open
          unread
          title="Marcus Chen mentioned you in #release-train"
          body="Can you look at the canary numbers before 4?"
          time="12m"
          icon="at-sign"
          actions={swipeRowActions}
        />
        <NotificationItem
          icon="message-square-reply"
          lead="Replied in a thread"
          sender="Aisha Bello"
          title="Aisha Bello replied in a thread"
          body="Android smoke suite is green on the 2.4 build."
          time="40m ago"
          read
        />
        <NotificationItem
          leading="tile"
          icon="video"
          sender="Kenji Watanabe"
          title="Release go/no-go starts in 1 min"
          body="Kenji Watanabe, Priya Raman and 4 others"
          time="2:59 PM"
          read
        />
        <NotificationItem
          agent
          icon="sparkles"
          sender="Fabric"
          title="Fabric finished “Summarise #design-crit”"
          body="7 decisions, 3 open questions — tap to read."
          time="1h ago"
          read
        />
      </ScrollView>

      <View style={{ position: "absolute", top: t.space.xs, left: t.space.sm, right: t.space.sm, zIndex: t.z.toast }}>
        <InAppBanner
          lead="Mentioned you"
          title="Mei Tanaka"
          sender="Mei Tanaka"
          identity="green"
          context="#design-crit"
          body="New onboarding flow is up for review — 5 min?"
          time="now"
          style={{ width: "100%", maxWidth: "100%" }}
        />
      </View>
    </View>
  );
}
