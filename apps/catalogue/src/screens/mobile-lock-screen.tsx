import { Text, View } from "react-native";
import { font, useTheme } from "@antfabric/ui-react-native";
import { OsNotification } from "@antfabric/ui-react-native/shell";
import { OS_NOTIFICATION_ACTIONS, OS_NOTIFICATION_APPROVE, OS_NOTIFICATION_DECLINE, OS_NOTIFICATION_JOIN } from "@antfabric/ui-docs/samples";

const fill = { width: "100%", maxWidth: "100%" } as const;

/** The lock screen: the OS's date and clock over the wallpaper, and AntFabric's notifications stacked at the bottom. */
export default function MobileLockScreen() {
  const { t, os } = useTheme();
  const android = os === "android";
  const clock = android ? 64 : 88;
  // White on the wallpaper in either scheme; on-brand is the token that stays white.
  const ink = t.os.onFill;
  return (
    <View style={{ flex: 1, alignItems: "center", paddingTop: android ? t.space["2xs"] : t.space.lg }}>
      <Text style={[font("semibold"), { fontSize: 18, color: ink, opacity: 0.9 }]}>{android ? "Thu, 29 Oct" : "Thursday 29 October"}</Text>
      <Text
        style={[
          font("bold", "display"),
          // tracking.tight, -0.02em, in points
          { marginTop: t.space["2xs"], fontSize: clock, lineHeight: clock, letterSpacing: clock * -0.02, color: ink },
        ]}
      >
        9:41
      </Text>

      <View style={{ alignSelf: "stretch", marginTop: "auto", gap: android ? t.space.xs : t.space.sm, paddingHorizontal: t.space.sm, paddingBottom: t.space.xl }}>
        <OsNotification
          appName="AntFabric"
          actions={OS_NOTIFICATION_ACTIONS}
          title="Arjun Mehta"
          sender="Arjun Mehta"
          context="#release-train"
          body="Arjun: Cut is frozen — the release train leaves at 4."
          grouped={3}
          time="2m ago"
          style={fill}
        />
        <OsNotification appName="AntFabric" actions={OS_NOTIFICATION_ACTIONS} title="Marcus Chen" sender="Marcus Chen" context="" body="Can you look at the canary numbers before 4?" preview={false} time="5m ago" style={fill} />
        <OsNotification
          appName="AntFabric"
          agent
          actions={[OS_NOTIFICATION_APPROVE, OS_NOTIFICATION_DECLINE]}
          title="Fabric needs your approval"
          sender="Fabric"
          context="#announcements"
          body="Send the 2.4 release notes to #announcements?"
          time="now"
          style={fill}
        />
        <OsNotification
          appName="AntFabric"
          leading="tile"
          actions={[OS_NOTIFICATION_JOIN]}
          title="Release go/no-go in 1 min"
          sender="Kenji Watanabe"
          context="Meetings"
          body="Kenji Watanabe, Priya Raman and 4 others"
          time="now"
          style={fill}
        />
      </View>
    </View>
  );
}
