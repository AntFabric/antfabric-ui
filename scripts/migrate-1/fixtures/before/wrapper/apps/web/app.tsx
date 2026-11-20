import {
  AntFabricRoot,
  Button,
  Card,
  NavRail,
  Tabs,
  TextField,
  type NavDestination,
  type Os,
  type Theme,
} from '@acme/ui-kit';
import { Message as KitMessage } from '@acme/ui-kit';
import { Table } from '@acme/ui-kit/data';

export function App({ theme, os, dest }: { theme: Theme; os: Os; dest: NavDestination[] }) {
  return (
    <AntFabricRoot platform="web" os={os} theme={theme}>
      <NavRail destinations={dest} onNavigate={() => undefined} />
      <KitMessage author="Ada" onRetry={(status) => status} />
      <Card content={<Button label="Go" onPress={() => undefined} />} />
      <Tabs items={[{ id: 'a', label: 'A' }]} value="a" onChange={() => undefined} />
      <TextField label="Name" value="" onChange={() => undefined} />
      <Table columns={[{ id: 'name', label: 'Name' }]} rows={[]} rowKey="name" />
    </AntFabricRoot>
  );
}
