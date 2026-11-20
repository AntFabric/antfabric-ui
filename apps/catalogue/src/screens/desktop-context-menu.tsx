import { useState, type CSSProperties } from "react";
import { ContextMenu, Icon, IconButton, t } from "@antfabric-ui/react";
import { Composer, Message, MessageDivider, TypingIndicator } from "@antfabric-ui/react/chat";
import { NavRail, SidebarSection, TitleBar } from "@antfabric-ui/react/shell";
import { composerTools, CONTEXT_MENU_SAMPLE, messageBar, NAV_RAIL_SAMPLE, TITLE_BAR_SAMPLE } from "@antfabric-ui/docs/samples";

const root: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  minWidth: 0,
  position: "relative",
  overflow: "hidden",
  background: t.surface.page,
};
const col: CSSProperties = { display: "flex", flexDirection: "column", minWidth: 0, boxSizing: "border-box" };
const line: CSSProperties = { ...col, flexDirection: "row", alignItems: "center" };

const sidebar: CSSProperties = {
  ...col,
  width: t.rail.wSidebar,
  flexShrink: 0,
  gap: t.space["2xs"],
  paddingBlock: t.space.sm,
  background: t.surface.sidebar,
  borderRight: `1px solid ${t.border.subtle}`,
  overflow: "hidden",
};
const paneHead: CSSProperties = {
  ...line,
  gap: t.space.sm,
  height: 52,
  flexShrink: 0,
  paddingInline: t.space.xl,
  borderBottom: `1px solid ${t.border.subtle}`,
};
const heading: CSSProperties = { margin: 0, fontWeight: t.font.weightBold, fontSize: t.text.title, color: t.fg.strong };

function Sidebar() {
  return (
    <div style={sidebar}>
      <div style={{ ...line, justifyContent: "space-between", paddingInline: t.space.lg, paddingBottom: t.space.sm }}>
        <span style={{ ...heading, fontFamily: t.font.display }}>GeekyAnts</span>
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

const ROLLOUT = "Rollout plan for 2.4 is in the doc — canary at 5%, then 25% after an hour if error rate holds.";

export default function DesktopContextMenu() {
  // The sidebar button in the bar above opens and closes the rail.
  const [railOpen, setRailOpen] = useState(false);
  return (
    <div style={root}>
      <TitleBar {...TITLE_BAR_SAMPLE} canGoBack canGoForward={false} sidebarExpanded={railOpen} onSidebarExpandedChange={(next) => setRailOpen(next)} />
      <div style={{ ...line, alignItems: "stretch", flex: 1, minHeight: 0 }}>
        <NavRail {...NAV_RAIL_SAMPLE} variant="drill-in" level="sections" section="channels" active="channels" expanded={railOpen} />
        <Sidebar />
        <div style={{ ...col, flex: 1, background: t.surface.card }}>
          <div style={paneHead}>
            <Icon name="hash" size={t.icon.size} color={t.fg.muted} />
            <span style={heading}>platform-eng</span>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                marginLeft: t.space.xs,
                fontSize: t.text.bodySm,
                color: t.fg.faint,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Builds, rollouts and the 3pm release train · 24 members
            </span>
            <IconButton icon="pin" label="Pinned messages" />
            <IconButton icon="users" label="Members" />
            <IconButton icon="panel-right" label="Channel details" />
          </div>
          <div style={{ ...col, flex: 1, minHeight: 0, justifyContent: "flex-end", gap: t.space["3xs"], paddingBlock: t.space.md, overflow: "hidden" }}>
            <MessageDivider kind="date" label="Yesterday" />
            <Message {...messageBar}
              author="Marcus Chen"
              identity="green"
              time="6:12 PM"
              body={ROLLOUT}
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
              // The pointer is on this message, so its hover toolbar shows under the menu.
              hovered
            />
            <MessageDivider kind="new" label="New messages" />
            <Message {...messageBar}
              author="Priya Raman"
              identity="indigo"
              time="10:42 AM"
              body="Staging is green again. @Fabric can you summarise what changed since yesterday's cut?"
              unread
            />
            <Message {...messageBar}
              author="Fabric"
              agent
              time="10:43 AM"
              body="Since yesterday's cut: 14 merged PRs, 2 config changes. The only risky one is the auth token TTL change in #4821 — it has a feature flag and is off in production."
              unread
              reactions={[{ emoji: "🙏", count: 2, mine: false, reactors: "Marcus Chen and Aisha Bello reacted" }]}
            />
            <Message {...messageBar} author="You" identity="red" time="10:44 AM" body="Great — I'll take the flag off at 3 if the canary holds." status="failed" />
          </div>
          <div style={{ ...col, height: 22, justifyContent: "center", paddingInline: t.space.xl }}>
            <TypingIndicator names={["Aisha"]} />
          </div>
          <div style={{ ...col, paddingInline: t.space.xl, paddingBottom: t.space.lg }}>
            <Composer {...composerTools} placeholder="Message #platform-eng" />
          </div>
        </div>
      </div>
      {/* Opened at the pointer, over Marcus's message. */}
      <div style={{ position: "absolute", top: 300, left: 720, zIndex: t.z.menu }}>
        <ContextMenu
          author="Marcus Chen"
          identity="green"
          time="6:12 PM"
          body={ROLLOUT}
          showTarget={false}
          label={CONTEXT_MENU_SAMPLE.label}
          quickReactions={["👍", "❤️", "😂", "🎉", "👀", "✅"]}
          picked={["👍"]}
          items={[
            { label: "Reply in thread", icon: "message-square-reply" },
            { label: "Copy text", icon: "copy" },
            { label: "Forward", icon: "arrow-up-right" },
            { label: "Pin to channel", icon: "pin" },
            { label: "Mark as unread", icon: "mail-check" },
          ]}
        />
      </div>
    </div>
  );
}
