import { useState, type CSSProperties } from "react";
import { Icon, IconButton, t } from "@antfabric/ui-react";
import { Composer, Message, MessageDivider, TypingIndicator } from "@antfabric/ui-react/chat";
import { NavRail, SidebarSection, TitleBar } from "@antfabric/ui-react/shell";
import { composerTools, messageBar, NAV_RAIL_SAMPLE, TITLE_BAR_SAMPLE } from "@antfabric/ui-docs/samples";

const view: CSSProperties = { display: "flex", flexDirection: "column", boxSizing: "border-box", minWidth: 0, position: "relative" };
const row: CSSProperties = { ...view, flexDirection: "row", alignItems: "center" };
const text: CSSProperties = { display: "block", margin: 0, minWidth: 0 };
const hairline = `1px solid ${t.border.subtle}`;
const heading: CSSProperties = { ...text, fontWeight: t.font.weightBold, fontSize: t.text.title, color: t.fg.strong };
const head: CSSProperties = { ...row, gap: t.space.sm, height: 52, flexShrink: 0, borderBottom: hairline };

const rollout = "Rollout plan for 2.4 is in the doc — canary at 5%, then 25% after an hour if error rate holds.";

export default function DesktopThread() {
  // The sidebar button in the bar above opens and closes the rail.
  const [railOpen, setRailOpen] = useState(false);
  return (
    <div style={{ ...view, height: "100%", width: "100%", overflow: "hidden", background: t.surface.page }}>
      <TitleBar {...TITLE_BAR_SAMPLE} canGoBack canGoForward={false} sidebarExpanded={railOpen} onSidebarExpandedChange={(next) => setRailOpen(next)} />
      <div style={{ ...view, flexDirection: "row", flex: 1, minHeight: 0 }}>
        <NavRail {...NAV_RAIL_SAMPLE} variant="drill-in" level="sections" section="channels" active="channels" expanded={railOpen} />

        <div
          style={{
            ...view,
            width: t.rail.wSidebar,
            flexShrink: 0,
            gap: t.space["2xs"],
            paddingBlock: t.space.sm,
            background: t.surface.sidebar,
            borderRight: hairline,
            overflow: "hidden",
          }}
        >
          <div style={{ ...row, justifyContent: "space-between", paddingInline: t.space.lg, paddingBottom: t.space.sm }}>
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

        <div style={{ ...view, flex: 1, background: t.surface.card }}>
          <div style={{ ...head, paddingInline: t.space.xl }}>
            <Icon name="hash" size={t.icon.size} color={t.fg.muted} />
            <span style={heading}>platform-eng</span>
            <span
              style={{
                ...text,
                flex: 1,
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

          <div style={{ ...view, flex: 1, minHeight: 0, justifyContent: "flex-end", gap: t.space["3xs"], paddingBlock: t.space.md, overflow: "hidden" }}>
            <MessageDivider kind="date" label="Yesterday" />
            {/* The thread's parent, highlighted while its thread is open. */}
            <Message {...messageBar}
              author="Marcus Chen"
              identity="green"
              time="6:12 PM"
              body={rollout}
              highlighted
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
          </div>

          <div style={{ ...view, height: 22, justifyContent: "center", paddingInline: t.space.xl }}>
            <TypingIndicator names={["Aisha"]} />
          </div>
          <div style={{ ...view, paddingInline: t.space.xl, paddingBottom: t.space.lg }}>
            <Composer {...composerTools} placeholder="Message #platform-eng" />
          </div>
        </div>

        <aside aria-label="Thread" style={{ ...view, width: 400, flexShrink: 0, background: t.surface.card, borderLeft: hairline }}>
          <div style={{ ...head, paddingLeft: t.space.xl, paddingRight: t.space.md }}>
            <span style={heading}>Thread</span>
            <span style={{ ...text, flex: 1, fontSize: t.text.bodySm, color: t.fg.faint }}>#platform-eng</span>
            <IconButton icon="bell-ring" label="Following — turn off thread notifications" active size="sm" />
            <IconButton icon="x" label="Close thread" size="sm" />
          </div>

          <div style={{ ...view, flex: 1, minHeight: 0, gap: t.space["3xs"], paddingBlock: t.space.md, overflow: "hidden" }}>
            <Message {...messageBar} author="Marcus Chen" identity="green" time="6:12 PM" body={rollout} />
            <MessageDivider kind="date" label="4 replies" />
            <Message {...messageBar} author="Aisha Bello" identity="ochre" time="6:20 PM" body="Android canary looks clean — 0.02% error rate after 40 minutes." />
            <Message {...messageBar}
              author="Aisha Bello"
              identity="ochre"
              time="6:21 PM"
              gutterTime="6:21"
              compact
              body="Holding iOS until the TestFlight build finishes processing."
            />
            <Message {...messageBar} author="Kenji Watanabe" identity="ink" time="6:34 PM" body="Server side is fine. p95 is flat. Watching the auth token change." />
            <Message {...messageBar}
              author="Priya Raman"
              identity="indigo"
              time="6:40 PM"
              unread
              body="Let's go to 25% at 7 if nothing moves. I'll post in the channel."
            />
          </div>

          <div style={{ ...view, paddingInline: t.space.lg, paddingBottom: t.space.lg }}>
            <Composer {...composerTools} mode="thread" placeholder="Reply…" alsoSend alsoSendTo="#platform-eng" formatting={false} />
          </div>
        </aside>
      </div>
    </div>
  );
}
