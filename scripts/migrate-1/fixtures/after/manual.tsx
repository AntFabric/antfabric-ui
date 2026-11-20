import {
  ApprovalItem,
  ContextMenu,
  EmptyState,
  Fab,
  InAppBanner,
} from '@antfabric/ui-react';
import {
  AppBadge,
  NavRail,
  SidebarItem,
  SidebarSection,
  WebTopBar,
  WorkspaceSwitcher,
} from '@antfabric/ui-react/shell';
import { Fab as PhoneFab, SwipeRow } from '@antfabric/ui-react-native';
import { MobileHeader } from '@antfabric/ui-react-native/shell';
import { Breakdown, DonutChart, Sparkline, StatTile } from '@antfabric/ui-react/data';
import { ProgressBar } from '@antfabric/ui-react';

export function Manual({ variant, source }: { variant: 'compose' | 'ink'; source: string }) {
  return (
    <>
      <SidebarItem name="general" glyph="#" />
      <SidebarItem name="secret" kind="private" />
      <SidebarSection label="Starred" icon="star" items={[]} />
      <SidebarSection label="Other" kind="people" items={[]} selected="x" />
      <WorkspaceSwitcher workspaces={[{ name: 'Northwind Health' }]} current="Northwind Health" onSwitch={() => undefined} />
      <WorkspaceSwitcher workspaces={[{ key: 'northwind', name: 'Northwind Health' }]} current="northwind" />
      <MobileHeader title="Inbox" unread={3} onBell={() => undefined} actions={[{ icon: 'plus', label: 'New', onPress: () => undefined }]} />
      <MobileHeader title="Inbox" actions={[{ key: 'new', icon: 'plus', label: 'New' }]} />
      <WebTopBar desktopApp="open" onOpenDesktop={() => undefined} onHelp={() => undefined} />
      <NavRail notifications={3} onNotifications={() => undefined} onReport={() => undefined} notice={null} onActiveChange={() => undefined} />
      <InAppBanner kind="mention" context="#general" onOpen={() => undefined} />
      <ContextMenu reactions={[{ emoji: '👍', mine: true }]} identity="indigo" body="Hello" />
      <Fab icon="pen" label="New" variant="ink" />
      <Fab icon="pen" label="New" variant="tint" />
      <Fab icon="pen" label="New" variant="raised" />
      <Fab icon="pen" label="New" variant={variant} />
      <Fab icon="pen" label="New" />
      <PhoneFab icon="pen" label="New" variant="ink" wiggle />
      <PhoneFab icon="pen" label="New" wiggle />
      <ApprovalItem source="Agent" agent verify />
      <ApprovalItem source="Jira" reference="PROJ-217" />
      <ApprovalItem source={source} />
      <ApprovalItem source="GitHub" />
      <SwipeRow context="notification" icon="at-sign" onMarkRead={() => undefined} onClear={() => undefined} />
      <Breakdown name="channel" value="count" selected="a" onSelectedChange={() => undefined} />
      <DonutChart name="channel" value="count" />
      <Sparkline y="count" />
      <StatTile trendY="trend" />
      <ProgressBar value={3} strings={{ cancelUpload: 'Cancel {name}', retryUpload: 'Retry {name}' }} />
      <EmptyState title="Nothing here" />
      <EmptyState title="Nothing here" art="none" />
      <AppBadge count={3} />
    </>
  );
}
