import { useState, type CSSProperties } from "react";
import { Icon, IconButton, t } from "@antfabric/ui-react";
import { Composer, Message, MessageDivider, TypingIndicator } from "@antfabric/ui-react/chat";
import { NavRail, SidebarSection, WebTopBar } from "@antfabric/ui-react/shell";
import { composerTools, messageBar, NAV_RAIL_SAMPLE, WEB_TOP_BAR_SAMPLE } from "@antfabric/ui-docs/samples";

const view: CSSProperties = { display: "flex", flexDirection: "column", boxSizing: "border-box", minWidth: 0, position: "relative" };
const line: CSSProperties = { ...view, flexDirection: "row", alignItems: "center" };
const text: CSSProperties = { display: "block", boxSizing: "border-box", margin: 0, minWidth: 0 };

const s = {
  root: { ...view, height: "100%", width: "100%", overflow: "hidden", background: t.color.background.page },
  body: { ...view, flexDirection: "row", flex: 1, minHeight: 0 },
  sidebar: {
    ...view,
    width: t.size.layout.sidebar,
    flexShrink: 0,
    gap: t.space["2xs"],
    paddingBlock: t.space.sm,
    background: t.color.background.sidebar,
    borderRight: `1px solid ${t.color.border.subtle}`,
    overflow: "hidden",
  },
  sidebarHead: { ...line, justifyContent: "space-between", paddingInline: t.space.lg, paddingBottom: t.space.sm },
  workspace: { ...text, fontFamily: t.font.family.display, fontWeight: t.font.weight.bold, fontSize: t.font.size.title, color: t.color.text.strong },
  pane: { ...view, flex: 1, background: t.color.background.card },
  paneHead: { ...line, gap: t.space.sm, height: 52, flexShrink: 0, paddingInline: t.space.xl, borderBottom: `1px solid ${t.color.border.subtle}` },
  title: { ...text, fontWeight: t.font.weight.bold, fontSize: t.font.size.title, color: t.color.text.strong },
  topic: {
    ...text,
    flex: 1,
    marginLeft: t.space.xs,
    fontSize: t.font.size.bodySm,
    color: t.color.text.faint,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  messages: { ...view, flex: 1, minHeight: 0, justifyContent: "flex-end", gap: t.space["3xs"], paddingBlock: t.space.md, overflow: "hidden" },
  typing: { ...view, height: 22, justifyContent: "center", paddingInline: t.space.xl },
  composer: { ...view, paddingInline: t.space.xl, paddingBottom: t.space.lg },
} satisfies Record<string, CSSProperties>;

function Sidebar() {
  return (
    <div style={s.sidebar}>
      <div style={s.sidebarHead}>
        <span style={s.workspace}>GeekyAnts</span>
        <IconButton icon="square-pen" label="New message" size="sm" />
      </div>
      <SidebarSection
        label="Starred"
        icon="star"
        actionsVisible={false}
        items={[
          { key: "release-train", name: "release-train", glyph: "#", unread: true, mentions: 2 },
          { key: "fabric", name: "Fabric", avatar: true, agent: true, identity: "agent" },
        ]}
      />
      <SidebarSection
        label="Channels"
        actionsVisible={false}
        items={[
          { key: "platform-eng", name: "platform-eng", glyph: "#", active: true },
          { key: "design-crit", name: "design-crit", glyph: "#", unread: true, mentions: 3 },
          { key: "leadership-sync", name: "leadership-sync", icon: "lock", description: "private channel" },
          { key: "partner-acme", name: "partner-acme", glyph: "#", external: true, draft: true },
          { key: "random", name: "random", glyph: "#", muted: true },
        ]}
      />
      <SidebarSection
        label="Direct messages"
        actionsVisible={false}
        items={[
          { key: "marcus-chen", name: "Marcus Chen", avatar: true, identity: "green", presence: "active", unread: true, mentions: 1 },
          { key: "aisha-bello", name: "Aisha Bello", avatar: true, identity: "ochre", presence: "dnd", typing: true },
          { key: "kenji-watanabe", name: "Kenji Watanabe", avatar: true, identity: "ink", presence: "away" },
        ]}
      />
    </div>
  );
}

function Channel() {
  return (
    <div style={s.pane}>
      <div style={s.paneHead}>
        <Icon name="hash" size={t.size.icon.default} color={t.color.text.muted} />
        <span style={s.title}>platform-eng</span>
        <span style={s.topic}>Builds, rollouts and the 3pm release train · 24 members</span>
        <IconButton icon="pin" label="Pinned messages" />
        <IconButton icon="users" label="Members" />
        <IconButton icon="panel-right" label="Channel details" />
      </div>
      <div style={s.messages}>
        <MessageDivider kind="date" label="Yesterday" />
        <Message {...messageBar}
          author="Marcus Chen"
          identity="green"
          time="6:12 PM"
          body="Rollout plan for 2.4 is in the doc — canary at 5%, then 25% after an hour if error rate holds."
          reactions={[{ emoji: "👍", count: 4, mine: true, reactors: "You, Priya Raman and 2 others reacted" }]}
          thread={{
            count: 4,
            lastReply: "2h ago",
            unread: 2,
            following: true,
            participants: [
              { name: "Aisha Bello", identity: "ochre" },
              { name: "Kenji Watanabe", identity: "ink" },
            ],
          }}
        />
        <MessageDivider kind="new" label="New messages" />
        <Message {...messageBar}
          author="Priya Raman"
          identity="indigo"
          time="10:42 AM"
          body="Staging is green again. @Fabric can you summarise what changed since yesterday's cut?"
          unread
          reactions={[]}
        />
        <Message {...messageBar}
          author="Fabric"
          agent
          time="10:43 AM"
          body="Since yesterday's cut: 14 merged PRs, 2 config changes. The only risky one is the auth token TTL change in #4821 — it has a feature flag and is off in production."
          unread
          reactions={[{ emoji: "🙏", count: 2, mine: false, reactors: "Marcus Chen and Aisha Bello reacted" }]}
        />
        <Message {...messageBar} author="You" identity="red" time="10:44 AM" body="Great — I'll take the flag off at 3 if the canary holds." status="failed" reactions={[]} />
      </div>
      <div style={s.typing}>
        <TypingIndicator names={["Aisha"]} />
      </div>
      <div style={s.composer}>
        <Composer {...composerTools} placeholder="Message #platform-eng" />
      </div>
    </div>
  );
}

/** The desktop workspace in a browser tab: the web top bar instead of a title bar, the same body below. */
export default function WebChannel() {
  // The sidebar button in the bar above opens and closes the rail.
  const [railOpen, setRailOpen] = useState(false);
  return (
    <div style={s.root}>
      <WebTopBar {...WEB_TOP_BAR_SAMPLE} canGoBack canGoForward={false} sidebarExpanded={railOpen} onSidebarExpandedChange={(next) => setRailOpen(next)} />
      <div style={s.body}>
        <NavRail {...NAV_RAIL_SAMPLE} variant="drill-in" level="sections" section="channels" active="channels" expanded={railOpen} />
        <Sidebar />
        <Channel />
      </div>
    </div>
  );
}
