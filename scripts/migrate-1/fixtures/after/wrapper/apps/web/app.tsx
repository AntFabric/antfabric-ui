import {
  AntFabricRoot,
  Button,
  Card,
  NavRail,
  Tabs,
  TextField,
  type NavDestination,
  type Os,
  type Scheme,
  themes,
} from '@acme/ui-kit';
import { Message as KitMessage } from '@acme/ui-kit';
import { Table } from '@acme/ui-kit/data';

export function App({ theme, os, dest }: { theme: Scheme; os: Os; dest: NavDestination[] }) {
  return (
    <AntFabricRoot platform="web" os={os} scheme={theme} theme={themes.antfabric}>
      <NavRail destinations={dest} onActiveChange={() => undefined} />
      <KitMessage author="Ada" onStatusChange={(status) => status} />
      <Card>
        <Button label="Go" onPress={() => undefined} />
      </Card>
      <Tabs items={[{ key: 'a', label: 'A' }]} value="a" onValueChange={() => undefined} />
      <TextField label="Name" value="" onValueChange={() => undefined} />
      <Table columns={[{ key: 'name', label: 'Name' }]} rows={[]} rowKey="name" />
    </AntFabricRoot>
  );
}
