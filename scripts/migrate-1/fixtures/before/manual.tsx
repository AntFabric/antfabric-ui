import {
  AppBadge,
  ApprovalItem,
  ContextMenu,
  EmptyState,
  Fab,
  InAppBanner,
  NavRail,
  SidebarItem,
  SidebarSection,
  WebTopBar,
  WorkspaceSwitcher,
} from '@antfabric-ui/react';
import { Fab as PhoneFab, MobileHeader, SwipeRow } from '@antfabric-ui/react-native';
import { Breakdown, DonutChart, Sparkline, StatTile } from '@antfabric-ui/react/data';
import { ProgressBar } from '@antfabric-ui/react';

export function Manual({ variant, source }: { variant: 'compose' | 'ink'; source: string }) {
  return (
    <>
      <SidebarItem name="general" kind="channel" />
      <SidebarItem name="secret" kind="private" />
      <SidebarSection label="Starred" kind="starred" items={[]} />
      <SidebarSection label="Other" kind="people" items={[]} selected="x" />
      <WorkspaceSwitcher workspaces={[{ name: 'Northwind Health' }]} current="Northwind Health" onSwitch={() => undefined} />
      <WorkspaceSwitcher workspaces={[{ key: 'northwind', name: 'Northwind Health' }]} current="northwind" />
      <MobileHeader title="Inbox" unread={3} onBell={() => undefined} actions={[{ icon: 'plus', label: 'New', onPress: () => undefined }]} />
      <MobileHeader title="Inbox" actions={[{ key: 'new', icon: 'plus', label: 'New' }]} />
      <WebTopBar desktopApp="open" onOpenDesktop={() => undefined} onHelp={() => undefined} />
      <NavRail notifications={3} onNotifications={() => undefined} onReport={() => undefined} updateNotice={null} onNavigate={() => undefined} />
      <InAppBanner kind="mention" channel="#general" onOpen={() => undefined} />
      <ContextMenu reactions={[{ emoji: '👍', mine: true }]} authorIdentity="indigo" text="Hello" />
      <Fab icon="pen" label="New" variant="compose" />
      <Fab icon="pen" label="New" variant="fabric" />
      <Fab icon="pen" label="New" variant="help" />
      <Fab icon="pen" label="New" variant={variant} />
      <Fab icon="pen" label="New" />
      <PhoneFab icon="pen" label="New" variant="compose" />
      <PhoneFab icon="pen" label="New" />
      <ApprovalItem source="agent" biometric />
      <ApprovalItem source="jira" ticketKey="PROJ-217" />
      <ApprovalItem source={source} />
      <ApprovalItem source="GitHub" />
      <SwipeRow context="notification" glyph="at-sign" onMarkRead={() => undefined} onClear={() => undefined} />
      <Breakdown label="channel" value="count" selection="a" onSelectionChange={() => undefined} />
      <DonutChart label="channel" value="count" />
      <Sparkline field="count" />
      <StatTile trendField="trend" />
      <ProgressBar value={3} strings={{ cancelUpload: 'Cancel {title}', retryUpload: 'Retry {title}' }} />
      <EmptyState title="Nothing here" />
      <EmptyState title="Nothing here" art="none" />
      <AppBadge count={3} />
    </>
  );
}
