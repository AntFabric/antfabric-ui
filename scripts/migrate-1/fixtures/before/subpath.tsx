import { Button, Composer, Message, NavRail, SidebarItem, TitleBar, type NavRailProps } from '@antfabric/ui-react';
import { Card, MobileHeader, TabBar, Message as PhoneMessage, type MobileHeaderProps } from '@antfabric/ui-react-native';
import type { SidebarSectionItem } from '@antfabric/ui-react';

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
