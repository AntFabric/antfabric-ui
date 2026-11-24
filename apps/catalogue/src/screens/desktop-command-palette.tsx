import { useState, type CSSProperties } from "react";
import { CommandPalette, Icon, IconButton, t } from "@antfabric/ui-react";
import { Composer, Message, MessageDivider, TypingIndicator } from "@antfabric/ui-react/chat";
import { NavRail, SidebarSection, TitleBar } from "@antfabric/ui-react/shell";
import { COMMAND_PALETTE_FILTERS, composerTools, messageBar, NAV_RAIL_SAMPLE, TITLE_BAR_SAMPLE } from "@antfabric/ui-docs/samples";

const view: CSSProperties = { display: "flex", flexDirection: "column", boxSizing: "border-box", minWidth: 0, position: "relative" };
const row: CSSProperties = { ...view, flexDirection: "row", alignItems: "center" };
const text: CSSProperties = { display: "block", margin: 0, minWidth: 0 };
const hairline = `1px solid ${t.color.border.subtle}`;
const heading: CSSProperties = { ...text, fontWeight: t.font.weight.bold, fontSize: t.font.size.title, color: t.color.text.strong };

export default function DesktopCommandPalette() {
  // The sidebar button in the bar above opens and closes the rail.
  const [railOpen, setRailOpen] = useState(false);
  // Esc on an empty field closes it; the title bar's or the rail's search opens it again.
  const [open, setOpen] = useState(true);
  return (
    <div style={{ ...view, height: "100%", width: "100%", overflow: "hidden", background: t.color.background.page }}>
      <TitleBar {...TITLE_BAR_SAMPLE} canGoBack canGoForward={false} sidebarExpanded={railOpen} onSidebarExpandedChange={(next) => setRailOpen(next)} onSearch={() => setOpen(true)} />
      <div style={{ ...view, flexDirection: "row", flex: 1, minHeight: 0 }}>
        <NavRail {...NAV_RAIL_SAMPLE} variant="drill-in" level="sections" section="channels" active="channels" expanded={railOpen} onSearch={() => setOpen(true)} />

        <div
          style={{
            ...view,
            width: t.size.layout.sidebar,
            flexShrink: 0,
            gap: t.space["2xs"],
            paddingBlock: t.space.sm,
            background: t.color.background.sidebar,
            borderRight: hairline,
            overflow: "hidden",
          }}
        >
          <div style={{ ...row, justifyContent: "space-between", paddingInline: t.space.lg, paddingBottom: t.space.sm }}>
            <span style={{ ...heading, fontFamily: t.font.family.display }}>GeekyAnts</span>
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

        <div style={{ ...view, flex: 1, background: t.color.background.card }}>
          <div style={{ ...row, gap: t.space.sm, height: 52, flexShrink: 0, paddingInline: t.space.xl, borderBottom: hairline }}>
            <Icon name="hash" size={t.size.icon.default} color={t.color.text.muted} />
            <span style={heading}>platform-eng</span>
            <span
              style={{
                ...text,
                flex: 1,
                marginLeft: t.space.xs,
                fontSize: t.font.size.bodySm,
                color: t.color.text.faint,
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

          <div style={{ ...view, flex: 1, minHeight: 0, justifyContent: "flex-end", gap: t.space["3xs"], paddingBlock: t.space.md, overflow: "hidden" }}>
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

          <div style={{ ...view, height: 22, justifyContent: "center", paddingInline: t.space.xl }}>
            <TypingIndicator names={["Aisha"]} />
          </div>
          <div style={{ ...view, paddingInline: t.space.xl, paddingBottom: t.space.lg }}>
            <Composer {...composerTools} placeholder="Message #platform-eng" />
          </div>
        </div>
      </div>

      {/* The palette draws its own scrim; here it covers the whole window, title bar included. */}
      {open && (
        <CommandPalette
          query="rel"
          filters={COMMAND_PALETTE_FILTERS}
          filter="All"
          ask
          agentName="Fabric"
          groups={[
            {
              label: "People",
              items: [{ key: "person:relja-petrovic", avatar: true, label: "Relja Petrović", identity: "ochre", presence: "offline", hint: "Message" }],
            },
            {
              label: "Channels",
              items: [
                { key: "channel:release-train", icon: "hash", label: "release-train", hint: "Channel", selected: true },
                { key: "channel:release-notes", icon: "hash", label: "release-notes", hint: "Channel" },
              ],
            },
            {
              label: "Projects",
              items: [{ key: "project:release-tooling", icon: "folder-kanban", label: "Release tooling", hint: "Project" }],
            },
          ]}
          onClose={() => setOpen(false)}
          style={{ position: "absolute", inset: 0, alignSelf: "stretch", zIndex: t.zIndex.modal, paddingTop: 92 }}
        />
      )}
    </div>
  );
}
