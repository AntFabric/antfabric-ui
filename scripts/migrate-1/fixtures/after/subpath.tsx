import { Button } from '@antfabric-ui/react';
import { Composer, Message } from '@antfabric-ui/react/chat';
import { NavRail, SidebarItem, TitleBar, type NavRailProps } from '@antfabric-ui/react/shell';
import { Card } from '@antfabric-ui/react-native';
import { MobileHeader, TabBar, type MobileHeaderProps } from '@antfabric-ui/react-native/shell';
import { Message as PhoneMessage } from '@antfabric-ui/react-native/chat';
import type { SidebarSectionItem } from '@antfabric-ui/react/shell';

export function Web() {
  return (
    <>
      <Button label="Save" onPress={() => undefined} />
      <NavRail />
      <SidebarItem name="general" />
      <TitleBar />
      <Message author="Ada" body="Hi" />
      <Composer />
    </>
  );
}

export function Phone({ header }: { header: MobileHeaderProps }) {
  return (
    <Card content={<PhoneMessage author="Ada" />}>
      <MobileHeader title="Inbox" {...header} />
      <TabBar tabs={[]} />
    </Card>
  );
}

export type Props = NavRailProps;
export type Row = SidebarSectionItem;
